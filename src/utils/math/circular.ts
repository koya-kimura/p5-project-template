/**
 * TAU（2π）の定数
 */
export const TAU = Math.PI * 2;

/**
 * 円周上の点の情報を表す型
 */
export interface CircularPoint {
    /** X座標 */
    x: number;
    /** Y座標 */
    y: number;
    /** 中心からの角度（ラジアン） */
    angle: number;
    /** 中心からの角度（度数法） */
    angleDegrees: number;
    /** 点のインデックス（0から始まる連番） */
    index: number;
}

/**
 * 円形配置を生成するための設定
 */
export interface CircularConfig {
    /** 円の中心X座標 */
    centerX: number;
    /** 円の中心Y座標 */
    centerY: number;
    /** 円の半径 */
    radius: number;
    /** 配置する点の数 */
    count: number;
    /** 開始角度（ラジアン、オプション、デフォルト: 0） */
    startAngle?: number;
    /** 回転方向（true: 時計回り、false: 反時計回り、デフォルト: false） */
    clockwise?: boolean;
    /** 角度のオフセット（ラジアン、オプション、デフォルト: 0） */
    angleOffset?: number;
}

/**
 * 円周上に等間隔で点を配置し、各点の情報を1次元配列で返す
 * 
 * @param config - 円形配置の設定
 * @returns 円周上の点の配列
 * 
 * @example
 * ```typescript
 * // 中心(400, 300)、半径200の円周上に10個の点を配置
 * const points = createCircularPoints({
 *   centerX: 400,
 *   centerY: 300,
 *   radius: 200,
 *   count: 10,
 *   startAngle: -Math.PI / 2  // 上から始める
 * });
 * 
 * // 各点を描画
 * points.forEach(point => {
 *   circle(point.x, point.y, 20);
 * });
 * ```
 */
export function createCircularPoints(config: CircularConfig): CircularPoint[] {
    const {
        centerX,
        centerY,
        radius,
        count,
        startAngle = 0,
        clockwise = false,
        angleOffset = 0,
    } = config;

    const points: CircularPoint[] = [];
    const angleStep = TAU / count;
    const direction = clockwise ? -1 : 1;

    for (let i = 0; i < count; i++) {
        const angle = startAngle + angleOffset + direction * angleStep * i;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        points.push({
            x,
            y,
            angle,
            angleDegrees: (angle * 180) / Math.PI,
            index: i,
        });
    }

    return points;
}

/**
 * 簡易版: 中心座標と半径、個数だけを指定して円形配置を作成
 * 
 * @param centerX - 円の中心X座標
 * @param centerY - 円の中心Y座標
 * @param radius - 円の半径
 * @param count - 配置する点の数
 * @returns 円周上の点の配列
 * 
 * @example
 * ```typescript
 * const points = createCircle(400, 300, 200, 10);
 * ```
 */
export function createCircle(
    centerX: number,
    centerY: number,
    radius: number,
    count: number
): CircularPoint[] {
    return createCircularPoints({ centerX, centerY, radius, count });
}

/**
 * 特定のインデックスの点を取得
 * 
 * @param points - 円周上の点の配列
 * @param index - 取得したい点のインデックス
 * @returns 指定したインデックスの点、見つからない場合はundefined
 */
export function getPointByIndex(points: CircularPoint[], index: number): CircularPoint | undefined {
    return points.find(point => point.index === index);
}

/**
 * 座標に最も近い点を取得
 * 
 * @param points - 円周上の点の配列
 * @param x - X座標
 * @param y - Y座標
 * @returns 最も近い点
 */
export function getClosestPoint(points: CircularPoint[], x: number, y: number): CircularPoint | undefined {
    if (points.length === 0) return undefined;

    let closestPoint = points[0];
    let minDistance = getDistance(x, y, closestPoint.x, closestPoint.y);

    for (let i = 1; i < points.length; i++) {
        const distance = getDistance(x, y, points[i].x, points[i].y);
        if (distance < minDistance) {
            minDistance = distance;
            closestPoint = points[i];
        }
    }

    return closestPoint;
}

/**
 * 2点間の距離を計算
 */
function getDistance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 複数の同心円を一度に生成
 * 
 * @param centerX - 円の中心X座標
 * @param centerY - 円の中心Y座標
 * @param radiusMin - 最小半径
 * @param radiusMax - 最大半径
 * @param layers - レイヤー数
 * @param countPerLayer - 各レイヤーの点の数
 * @returns すべてのレイヤーの点を含む配列
 * 
 * @example
 * ```typescript
 * // 3つの同心円を作成（半径100から300まで）
 * const allPoints = createConcentricCircles(400, 300, 100, 300, 3, 8);
 * ```
 */
export function createConcentricCircles(
    centerX: number,
    centerY: number,
    radiusMin: number,
    radiusMax: number,
    layers: number,
    countPerLayer: number
): CircularPoint[] {
    const allPoints: CircularPoint[] = [];
    const radiusStep = (radiusMax - radiusMin) / (layers - 1);

    for (let i = 0; i < layers; i++) {
        const radius = radiusMin + radiusStep * i;
        const points = createCircle(centerX, centerY, radius, countPerLayer);
        allPoints.push(...points);
    }

    return allPoints;
}

/**
 * 角度を正規化（0〜TAUの範囲に収める）
 * 
 * @param angle - 角度（ラジアン）
 * @returns 正規化された角度
 */
export function normalizeAngle(angle: number): number {
    let normalized = angle % TAU;
    if (normalized < 0) {
        normalized += TAU;
    }
    return normalized;
}

/**
 * 度数法をラジアンに変換
 * 
 * @param degrees - 角度（度数法）
 * @returns 角度（ラジアン）
 */
export function degreesToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

/**
 * ラジアンを度数法に変換
 * 
 * @param radians - 角度（ラジアン）
 * @returns 角度（度数法）
 */
export function radiansToDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
}
