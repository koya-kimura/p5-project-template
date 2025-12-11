import p5 from "p5";
import { UniformRandom } from "../utils/math/UniformRandom";
import type { APCMiniMK2Manager } from "../midi/apcmini_mk2/APCMiniMK2Manager";
import type { AudioMicManager } from "../audio/AudioMicManager";
import type { CaptureManager } from "../capture/CaptureManager";
import type { VisualScene } from "./types";

/**
 * PlaceholderScene はテンプレートの初期表示用シンプルなシーンです。
 * MIDI フェーダーとビート値を受け取り、パラメータに反応した図形を描画します。
 */
export class PlaceholderScene implements VisualScene {
  private rotation = 0;
  private hue = 0;

  init(_p: p5): void {
    this.rotation = 0;
    this.hue = 0;
  }

  update(
    p: p5,
    midiManager: APCMiniMK2Manager,
    beat: number,
    audioManager?: AudioMicManager,
    captureManager?: CaptureManager,
  ): void {
    const speed = midiManager.faderValues?.[0] ?? 0.5;
    const audioBoost = (audioManager?.getVolume() ?? 0) * 2;
    const captureBoost = captureManager?.isReady() ? 0.1 : 0;
    this.rotation = beat * p.TWO_PI * (0.25 + speed + audioBoost + captureBoost);

    const hueRate = midiManager.faderValues?.[1] ?? 0.3;
    this.hue = (this.hue + hueRate * 2 + beat * 0.1 + audioBoost * 5) % 360;
  }

  draw(
    p: p5,
    tex: p5.Graphics,
    midiManager: APCMiniMK2Manager,
    beat: number,
    audioManager?: AudioMicManager,
    captureManager?: CaptureManager,
  ): void {
    const amplitude = midiManager.faderValues?.[2] ?? 0.5;
    const pulse = (Math.sin(beat * p.PI * 2) + 1) / 2;
    const size = tex.height * (0.2 + amplitude * 0.3 + pulse * 0.2);

    tex.push();
    tex.clear();
    tex.translate(tex.width / 2, tex.height / 2);
    tex.rotate(this.rotation);
    tex.colorMode(p.HSB, 360, 100, 100, 100);
    tex.noStroke();

    const saturation = 60 + (midiManager.faderValues?.[3] ?? 0) * 40;
    const brightness = 60 + pulse * 40;
    tex.fill(this.hue, saturation, brightness, 90);
    tex.rect(-size / 2, -size / 2, size, size, 24);

    tex.rotate(-this.rotation * 0.5);
    const ringSeed = UniformRandom.rand(Math.floor(beat * 8));
    const ringRadius = size * (0.6 + ringSeed * 0.4);
    tex.noFill();
    tex.stroke(0, 0, 100, 40 + ringSeed * 40);
    tex.strokeWeight(4 + ringSeed * 4);
    tex.ellipse(0, 0, ringRadius, ringRadius);

    tex.pop();
    tex.colorMode(p.RGB, 255);

    const frequencyData = audioManager?.getFrequencyData() ?? new Uint8Array(0);
    if (frequencyData.length > 0) {
      const spectrumHeight = tex.height * 0.25;
      const marginX = tex.width * 0.08;
      const marginY = tex.height * 0.08;
      const barCount = 64;
      const step = Math.max(1, Math.floor(frequencyData.length / barCount));
      const barWidth = (tex.width - marginX * 2) / barCount;

      tex.push();
      tex.translate(marginX, tex.height - marginY);
      tex.noStroke();

      for (let i = 0; i < barCount; i++) {
        const startIndex = i * step;
        let sum = 0;
        for (let j = 0; j < step && startIndex + j < frequencyData.length; j++) {
          sum += frequencyData[startIndex + j];
        }
        const average = sum / step;
        const normalized = average / 255;
        const barHeight = spectrumHeight * normalized;

        const hue = (this.hue + i * 4) % 360;
        tex.colorMode(p.HSB, 360, 100, 100, 100);
        tex.fill(hue, 80, 90, 80);
        tex.rect(i * barWidth, -barHeight, barWidth * 0.8, barHeight);
      }

      tex.pop();
      tex.colorMode(p.RGB, 255);
    }

    const captureTexture = captureManager?.getTexture();
    if (!captureTexture) {
      return;
    }

    const margin = tex.width * 0.04;
    const previewWidth = tex.width * 0.28;
    const aspect =
      captureTexture.width > 0 && captureTexture.height > 0
        ? captureTexture.width / captureTexture.height
        : 1;
    const previewHeight = previewWidth / aspect;

    tex.push();
    tex.translate(tex.width - previewWidth - margin, margin);
    tex.noStroke();
    tex.fill(0, 180);
    tex.rect(
      -margin * 0.25,
      -margin * 0.25,
      previewWidth + margin * 0.5,
      previewHeight + margin * 0.5,
      12,
    );
    tex.image(captureTexture, 0, 0, previewWidth, previewHeight);
    tex.pop();
  }

  resize(_p: p5): void {
    // 現状は特にリサイズ処理なし。
  }
}
