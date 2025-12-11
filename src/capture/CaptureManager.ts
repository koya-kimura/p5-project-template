import p5 from "p5";

/**
 * CaptureManager はブラウザのビデオキャプチャを取得し、キャンバスサイズの `p5.Graphics` に転写する。
 */
export class CaptureManager {
  private captureElement: p5.MediaElement | undefined;
  private captureTexture: p5.Graphics | undefined;
  private mediaStream: MediaStream | undefined;
  private isInitialized = false;
  private canvasWidth = 0;
  private canvasHeight = 0;

  /**
   * Web カメラを起動し、描画先となる `p5.Graphics` を初期化する。
   *
   * @param p p5 インスタンス。
   */
  async init(p: p5): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.canvasWidth = p.width;
    this.canvasHeight = p.height;

    const capture = p.createCapture({ video: true, audio: false }) as p5.MediaElement;
    capture.hide();

    const video = capture.elt as HTMLVideoElement;
    video.muted = true;
    video.playsInline = true;

    await this.awaitMetadata(video);

    this.captureTexture = p.createGraphics(this.canvasWidth, this.canvasHeight);
    this.captureElement = capture;
    this.mediaStream =
      video.srcObject instanceof MediaStream ? (video.srcObject as MediaStream) : undefined;
    this.isInitialized = true;

    this.blitCaptureToTexture();
  }

  /**
   * キャプチャ状態を更新し、必要であればリサイズ処理も行う。
   *
   * @param p p5 インスタンス。
   */
  update(p: p5): void {
    if (!this.isInitialized || !this.captureElement || !this.captureTexture) {
      return;
    }

    if (this.canvasWidth !== p.width || this.canvasHeight !== p.height) {
      this.resize(p);
    }

    this.blitCaptureToTexture();
  }

  /**
   * キャンバスサイズ変更に応じて内部バッファをリサイズする。
   *
   * @param p p5 インスタンス。
   */
  resize(p: p5): void {
    this.canvasWidth = p.width;
    this.canvasHeight = p.height;

    if (!this.isInitialized) {
      return;
    }

    if (!this.captureTexture) {
      this.captureTexture = p.createGraphics(this.canvasWidth, this.canvasHeight);
    } else {
      this.captureTexture.resizeCanvas(this.canvasWidth, this.canvasHeight);
    }

    this.blitCaptureToTexture();
  }

  /**
   * キャプチャ結果を格納している `p5.Graphics` を返す。
   */
  getTexture(): p5.Graphics | undefined {
    return this.captureTexture;
  }

  /**
   * 初期化済みかどうかを返す。
   */
  isReady(): boolean {
    return this.isInitialized && !!this.captureTexture;
  }

  /**
   * MediaStream と DOM 要素を破棄し、カメラを解放する。
   */
  dispose(): void {
    if (this.captureElement) {
      this.captureElement.remove();
      this.captureElement = undefined;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = undefined;
    }

    this.captureTexture = undefined;
    this.isInitialized = false;
  }

  /**
   * `<video>` 要素がメタデータを読み込むまで待機する。
   *
   * @param video 監視対象の HTMLVideoElement。
   */
  private async awaitMetadata(video: HTMLVideoElement): Promise<void> {
    if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        video.removeEventListener("loadedmetadata", handleLoaded);
        video.removeEventListener("loadeddata", handleLoaded);
        video.removeEventListener("error", handleError);
      };

      const handleLoaded = () => {
        cleanup();
        resolve();
      };

      const handleError = () => {
        cleanup();
        reject(new Error("Failed to load video stream metadata"));
      };

      video.addEventListener("loadedmetadata", handleLoaded, { once: true });
      video.addEventListener("loadeddata", handleLoaded, { once: true });
      video.addEventListener("error", handleError, { once: true });
    });
  }

  /**
   * キャプチャ映像をキャンバス中央へスケーリングして描画する。
   */
  private blitCaptureToTexture(): void {
    if (!this.captureElement || !this.captureTexture) {
      return;
    }

    const video = this.captureElement.elt as HTMLVideoElement;
    const sourceWidth = video.videoWidth;
    const sourceHeight = video.videoHeight;

    if (sourceWidth === 0 || sourceHeight === 0) {
      return;
    }

    const texture = this.captureTexture;

    texture.push();
    texture.clear();
    texture.translate(texture.width / 2, texture.height / 2);

    const scale = Math.max(texture.width / sourceWidth, texture.height / sourceHeight);
    const drawWidth = sourceWidth * scale;
    const drawHeight = sourceHeight * scale;

    const captureImage = this.captureElement as unknown as p5.Image;
    texture.image(captureImage, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    texture.pop();
  }
}
