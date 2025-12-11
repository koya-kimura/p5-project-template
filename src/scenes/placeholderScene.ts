import p5 from "p5";
import { UniformRandom } from "../utils/math/UniformRandom";
import type { APCMiniMK2Manager } from "../midi/apcmini_mk2/APCMiniMK2Manager";

/**
 * PlaceholderScene はテンプレートの初期表示用シンプルなシーンです。
 * MIDI フェーダーとビート値を受け取り、パラメータに反応した図形を描画します。
 */
export class PlaceholderScene {
  private rotation = 0;
  private hue = 0;

  init(_p: p5): void {
    this.rotation = 0;
    this.hue = 0;
  }

  update(p: p5, midiManager: APCMiniMK2Manager, beat: number): void {
    const speed = midiManager.faderValues?.[0] ?? 0.5;
    this.rotation = beat * p.TWO_PI * (0.25 + speed);

    const hueRate = midiManager.faderValues?.[1] ?? 0.3;
    this.hue = (this.hue + hueRate * 2 + beat * 0.1) % 360;
  }

  draw(p: p5, tex: p5.Graphics, midiManager: APCMiniMK2Manager, beat: number): void {
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
  }

  resize(_p: p5): void {
    // 現状は特にリサイズ処理なし。
  }
}
