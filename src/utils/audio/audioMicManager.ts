/**
 * AudioMicManager はブラウザのマイク入力から音量と周波数スペクトラムを取得する。
 */
export class AudioMicManager {
  private audioContext: AudioContext | undefined;
  private analyser: AnalyserNode | undefined;
  private timeDomainData: Float32Array<ArrayBuffer> | undefined;
  private frequencyData: Uint8Array<ArrayBuffer> | undefined;
  private smoothedFrequencyData: Float32Array | undefined;
  private volume = 0;
  private smoothedVolume = 0;
  private isInitialized = false;

  /**
   * スムージング係数（0.0〜1.0）
   * 0に近いほど即座に変化、1に近いほど滑らかに変化
   * デフォルト: 0.8
   */
  private smoothingFactor = 0.85;

  /**
   * マイク入力の利用許可を取得し、`AnalyserNode` で解析できる状態にする。
   */
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
    const smoothedFrequencyData = new Float32Array(analyser.frequencyBinCount);

    source.connect(analyser);

    this.audioContext = context;
    this.analyser = analyser;
    this.timeDomainData = timeDomainData;
    this.frequencyData = frequencyData;
    this.smoothedFrequencyData = smoothedFrequencyData;
    this.isInitialized = true;
  }

  /**
   * AudioContext がサスペンドされている場合に再開する。
   */
  async resume(): Promise<void> {
    if (this.audioContext && this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
  }

  /**
   * 現在の音声波形を取得し、ボリューム値を算出する。
   */
  update(): void {
    if (!this.analyser || !this.timeDomainData || !this.frequencyData || !this.smoothedFrequencyData) {
      return;
    }

    this.analyser.getFloatTimeDomainData(this.timeDomainData);
    this.analyser.getByteFrequencyData(this.frequencyData);

    // ボリュームの計算
    let sumSquares = 0;
    for (let i = 0; i < this.timeDomainData.length; i++) {
      const value = this.timeDomainData[i];
      sumSquares += value * value;
    }
    this.volume = Math.sqrt(sumSquares / this.timeDomainData.length);

    // ボリュームのスムージング
    this.smoothedVolume = this.lerp(this.smoothedVolume, this.volume, 1 - this.smoothingFactor);

    // 周波数データのスムージング
    for (let i = 0; i < this.frequencyData.length; i++) {
      const normalizedValue = this.frequencyData[i] / 255;
      this.smoothedFrequencyData[i] = this.lerp(
        this.smoothedFrequencyData[i],
        normalizedValue,
        1 - this.smoothingFactor
      );
    }
  }

  /**
   * 線形補間（lerp）を行う。
   * @param start 開始値
   * @param end 終了値
   * @param amount 補間量（0.0〜1.0）
   */
  private lerp(start: number, end: number, amount: number): number {
    return start + (end - start) * amount;
  }

  /**
   * ルート平均二乗 (RMS) を元に計算した音量値を返す。
   * スムージングが適用された値を返す。
   *
   * @returns 0.0〜1.0 程度の正規化された音量。
   */
  getVolume(): number {
    return this.smoothedVolume;
  }

  /**
   * スムージングされていない生の音量値を返す。
   *
   * @returns 0.0〜1.0 程度の正規化された音量。
   */
  getRawVolume(): number {
    return this.volume;
  }

  /**
   * 周波数領域の強度配列をコピーで返す。
   * スムージングが適用された値を返す。
   *
   * @returns 0〜255 の値を持つ周波数データ。
   */
  getFrequencyData(): Uint8Array {
    if (!this.smoothedFrequencyData) {
      return new Uint8Array(0);
    }
    // スムージングされたデータを0〜255にスケール
    const result = new Uint8Array(this.smoothedFrequencyData.length);
    for (let i = 0; i < this.smoothedFrequencyData.length; i++) {
      result[i] = Math.round(this.smoothedFrequencyData[i] * 255);
    }
    return result;
  }

  /**
   * スムージングされていない生の周波数データを返す。
   *
   * @returns 0〜255 の値を持つ周波数データ。
   */
  getRawFrequencyData(): Uint8Array {
    if (!this.frequencyData) {
      return new Uint8Array(0);
    }
    return new Uint8Array(this.frequencyData);
  }

  /**
   * 指定した周波数帯域の平均レベル（0.0〜1.0）を返す。
   *
   * @param minFrequency 最小周波数（Hz）
   * @param maxFrequency 最大周波数（Hz）
   */
  getBandLevel(minFrequency: number, maxFrequency: number): number {
    if (!this.smoothedFrequencyData || !this.analyser || !this.audioContext) {
      return 0;
    }

    const nyquist = this.audioContext.sampleRate / 2;
    if (nyquist <= 0) {
      return 0;
    }

    const clampedMin = Math.max(0, Math.min(minFrequency, nyquist));
    const clampedMax = Math.max(clampedMin, Math.min(maxFrequency, nyquist));
    if (clampedMax <= clampedMin) {
      return 0;
    }

    const binBandwidth = nyquist / this.smoothedFrequencyData.length;
    if (binBandwidth <= 0) {
      return 0;
    }

    let startIndex = Math.floor(clampedMin / binBandwidth);
    let endIndex = Math.ceil(clampedMax / binBandwidth);

    startIndex = Math.max(0, Math.min(startIndex, this.smoothedFrequencyData.length - 1));
    endIndex = Math.max(startIndex, Math.min(endIndex, this.smoothedFrequencyData.length - 1));

    let sum = 0;
    let count = 0;
    for (let i = startIndex; i <= endIndex; i++) {
      sum += this.smoothedFrequencyData[i];
      count += 1;
    }

    if (count === 0) {
      return 0;
    }

    // smoothedFrequencyDataは既に0〜1に正規化されているので255で割らない
    return sum / count;
  }

  /**
   * スムージング係数を設定する。
   *
   * @param factor スムージング係数（0.0〜1.0）
   *               0に近いほど即座に変化、1に近いほど滑らかに変化
   */
  setSmoothingFactor(factor: number): void {
    this.smoothingFactor = Math.max(0, Math.min(1, factor));
  }

  /**
   * 現在のスムージング係数を取得する。
   *
   * @returns 現在のスムージング係数（0.0〜1.0）
   */
  getSmoothingFactor(): number {
    return this.smoothingFactor;
  }

  /**
   * 周波数帯域の平均レベルがしきい値を超えたかどうかを判定する。
   *
   * @param minFrequency 最小周波数（Hz）
   * @param maxFrequency 最大周波数（Hz）
   * @param threshold 発火させたいしきい値（0.0〜1.0）
   */
  getFrequencyTrigger(minFrequency: number, maxFrequency: number, threshold = 0.25): boolean {
    return this.getBandLevel(minFrequency, maxFrequency) >= threshold;
  }

  /**
   * AudioContext と MediaStream を解放し、再初期化可能な状態へ戻す。
   */
  dispose(): void {
    this.analyser?.disconnect();
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close().catch(() => undefined);
    }
    this.audioContext = undefined;
    this.analyser = undefined;
    this.timeDomainData = undefined;
    this.frequencyData = undefined;
    this.smoothedFrequencyData = undefined;
    this.volume = 0;
    this.smoothedVolume = 0;
    this.isInitialized = false;
  }
}
