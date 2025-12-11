import type { VisualRenderContext } from "../types/render";
import { map } from "../utils/math/mathUtils";
import { zigzag } from "../utils/math/mathUtils";

export class sampleScene {
    draw(ctx: VisualRenderContext): void {
        const { p, tex, midiManager, beat, audioManager, captureManager, font } = ctx;

        const d = map(audioManager?.getVolume() || 0, 0, 1, 0.3, 0.9) * Math.min(tex.width, tex.height);
        const b = map(zigzag(beat), 0, 1, 0, 255);

        tex.push();
        tex.fill(255, 100, b);
        tex.noStroke();
        tex.ellipse(p.width / 2, p.height / 2, d, d);
        tex.pop();
    }
}