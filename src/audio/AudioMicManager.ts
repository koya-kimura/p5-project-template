/**
 * AudioMicManager はブラウザのマイク入力から音量と周波数データを取得する。
 */
export class AudioMicManager {
  private audioContext: AudioContext | undefined;
  private analyser: AnalyserNode | undefined;
  private timeDomainData: Float32Array<ArrayBuffer> | undefined;
  private frequencyData: Uint8Array<ArrayBuffer> | undefined;
  private volume = 0;
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("MediaDevices API is not available in this browser.");
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    const context = new AudioContext();
    if (context.state === "suspended") {
      await context.resume().catch(() => undefined);
    }

    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    analyser.fftSize = 2048;

    const timeDomainData = new Float32Array(analyser.fftSize) as Float32Array<ArrayBuffer>;
    const frequencyData = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;

    source.connect(analyser);

    this.audioContext = context;
    this.analyser = analyser;
    this.timeDomainData = timeDomainData;
    this.frequencyData = frequencyData;
    this.isInitialized = true;
  }

  async resume(): Promise<void> {
    if (this.audioContext && this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
  }

  update(): void {
    if (!this.analyser || !this.timeDomainData || !this.frequencyData) {
      return;
    }

    this.analyser.getFloatTimeDomainData(this.timeDomainData);
    this.analyser.getByteFrequencyData(this.frequencyData);

    let sumSquares = 0;
    for (let i = 0; i < this.timeDomainData.length; i++) {
      const value = this.timeDomainData[i];
      sumSquares += value * value;
    }
    this.volume = Math.sqrt(sumSquares / this.timeDomainData.length);
  }

  getVolume(): number {
    return this.volume;
  }

  /**
   * 周波数データのコピーを返す。未初期化の場合は空配列。
   */
  getFrequencyData(): Uint8Array {
    if (!this.frequencyData) {
      return new Uint8Array(0);
    }
    return new Uint8Array(this.frequencyData);
  }

  dispose(): void {
    this.analyser?.disconnect();
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close().catch(() => undefined);
    }
    this.audioContext = undefined;
    this.analyser = undefined;
    this.timeDomainData = undefined;
    this.frequencyData = undefined;
    this.volume = 0;
    this.isInitialized = false;
  }
}
