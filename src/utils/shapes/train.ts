import type p5 from "p5";

/**
 * 電車の色設定
 */
export interface TrainColors {
    /** 車体の色（デフォルト: #26AD95） */
    body?: string;
    /** 帯の色（デフォルト: #F3C03C） */
    stripe?: string;
    /** 窓の色（デフォルト: #D5E7F6） */
    window?: string;
    /** ドア枠の色（デフォルト: #28A48E） */
    doorFrame?: string;
    /** タイヤの色（デフォルト: #333333） */
    wheel?: string;
    /** ライトの色（デフォルト: #F18F28） */
    light?: string;
}

/**
 * デフォルトの電車の色設定
 */
const DEFAULT_COLORS: Required<TrainColors> = {
    body: "#26AD95",
    stripe: "#F3C03C",
    window: "#D5E7F6",
    doorFrame: "#28A48E",
    wheel: "#333333",
    light: "#F18F28",
};

/**
 * 電車を描画する
 *
 * @param tex - 描画先のp5.Graphicsオブジェクト
 * @param x - 電車の左上X座標
 * @param y - 電車の左上Y座標
 * @param w - 電車の幅（高さは自動的に計算される）
 * @param colors - 色のカスタマイズ設定（オプション）
 *
 * @example
 * ```typescript
 * // p5.Graphicsバッファに描画
 * const buffer = createGraphics(400, 400);
 * drawTrain(buffer, 100, 100, 200);
 *
 * // カスタムカラーで描画
 * drawTrain(buffer, 100, 100, 200, {
 *   body: "#FF5733",
 *   stripe: "#FFC300",
 *   window: "#DAF7A6"
 * });
 * ```
 */
export function drawTrain(
    tex: p5.Graphics,
    x: number,
    y: number,
    w: number,
    colors: TrainColors = {}
): void {
    // デフォルト色とマージ
    const c = { ...DEFAULT_COLORS, ...colors };

    // タイヤ
    tex.fill(c.wheel as any);
    tex.noStroke();
    tex.circle(x + w * 0.1, y + w * 0.4, w * 0.1);
    tex.circle(x + w * 0.25, y + w * 0.4, w * 0.1);
    tex.circle(x + w * 0.75, y + w * 0.4, w * 0.1);
    tex.circle(x + w * 0.9, y + w * 0.4, w * 0.1);

    // 車体全体
    tex.fill(c.body);
    tex.noStroke();
    tex.rect(x, y, w, w * 0.4, w * 0.02, w * 0.02);

    // 帯
    tex.fill(c.stripe);
    tex.noStroke();
    tex.rect(x, y + w * 0.25, w, w * 0.05);

    // 窓とドアの描画
    tex.strokeWeight(w * 0.003);

    // 左側の窓
    tex.noFill();
    tex.stroke(c.doorFrame);
    tex.rect(x + w * 0.15, y + w * 0.025, w * 0.2, w * 0.35, w * 0.01, w * 0.01);
    tex.fill(c.window);
    tex.noStroke();
    tex.rect(x + w * 0.175, y + w * 0.05, w * 0.15, w * 0.15, w * 0.01, w * 0.01);

    // 中央の窓
    tex.noFill();
    tex.stroke(c.doorFrame);
    tex.rect(x + w * 0.4, y + w * 0.025, w * 0.2, w * 0.35, w * 0.01, w * 0.01);
    tex.fill(c.window);
    tex.noStroke();
    tex.rect(x + w * 0.425, y + w * 0.05, w * 0.15, w * 0.15, w * 0.01, w * 0.01);

    // 右側の窓
    tex.noFill();
    tex.stroke(c.doorFrame);
    tex.rect(x + w * 0.65, y + w * 0.025, w * 0.2, w * 0.35, w * 0.01, w * 0.01);
    tex.fill(c.window);
    tex.noStroke();
    tex.rect(x + w * 0.675, y + w * 0.05, w * 0.15, w * 0.15, w * 0.01, w * 0.01);

    // 後方窓
    tex.fill(c.window);
    tex.noStroke();
    tex.rect(x + w * 0.85, y + w * 0.05, w * 0.1, w * 0.15, w * 0.01, w * 0.01);

    // 前方窓
    tex.fill(c.window);
    tex.noStroke();
    tex.rect(x, y + w * 0.03, w * 0.05, w * 0.2, 0, w * 0.01);

    // ライト
    tex.fill(c.light);
    tex.noStroke();
    tex.rect(x, y + w * 0.33, w * 0.02, w * 0.03);
}

/**
 * 山手線カラーの電車を描画
 */
export function drawYamanoteTrain(tex: p5.Graphics, x: number, y: number, w: number): void {
    drawTrain(tex, x, y, w, {
        body: "#9ACD32",
        stripe: "#228B22",
    });
}

/**
 * 中央線カラーの電車を描画
 */
export function drawChuoLineTrain(tex: p5.Graphics, x: number, y: number, w: number): void {
    drawTrain(tex, x, y, w, {
        body: "#FF6600",
        stripe: "#CC5200",
    });
}

/**
 * 京浜東北線カラーの電車を描画
 */
export function drawKeihinTohokuTrain(tex: p5.Graphics, x: number, y: number, w: number): void {
    drawTrain(tex, x, y, w, {
        body: "#00BFFF",
        stripe: "#0080FF",
    });
}

/**
 * ランダムな色の電車を描画
 */
export function drawRandomTrain(tex: p5.Graphics, x: number, y: number, w: number): void {
    const randomColor = () => {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 50%)`;
    };

    drawTrain(tex, x, y, w, {
        body: randomColor(),
        stripe: randomColor(),
    });
}
