/**
 * グリッドセルの情報を表す型
 */
export interface GridCell {
    /** セルのX座標 */
    x: number;
    /** セルのY座標 */
    y: number;
    /** セルの幅 */
    w: number;
    /** セルの高さ */
    h: number;
    /** セルのインデックス（0から始まる連番） */
    index: number;
    /** セルの行番号（0から始まる） */
    row: number;
    /** セルの列番号（0から始まる） */
    col: number;
}

/**
 * グリッドを生成するための設定
 */
export interface GridConfig {
    /** キャンバスの幅 */
    canvasWidth: number;
    /** キャンバスの高さ */
    canvasHeight: number;
    /** 横方向のグリッド数 */
    cols: number;
    /** 縦方向のグリッド数 */
    rows: number;
    /** グリッド間のマージン（オプション、デフォルト: 0） */
    margin?: number;
    /** グリッド全体のパディング（オプション、デフォルト: 0） */
    padding?: number;
}

/**
 * 指定したグリッド数でキャンバスを分割し、各セルの情報を1次元配列で返す
 * 
 * @param config - グリッド生成の設定
 * @returns グリッドセルの配列（左上から右へ、行ごとに順番に格納）
 * 
 * @example
 * ```typescript
 * // 2x2のグリッドを生成
 * const cells = createGrid({
 *   canvasWidth: 800,
 *   canvasHeight: 600,
 *   cols: 2,
 *   rows: 2,
 *   margin: 10,
 *   padding: 20
 * });
 * 
 * // 各セルを描画
 * cells.forEach(cell => {
 *   rect(cell.x, cell.y, cell.w, cell.h);
 * });
 * ```
 */
export function createGrid(config: GridConfig): GridCell[] {
    const { canvasWidth, canvasHeight, cols, rows, margin = 0, padding = 0 } = config;

    // パディングを考慮した実際の描画領域
    const availableWidth = canvasWidth - padding * 2;
    const availableHeight = canvasHeight - padding * 2;

    // マージンを考慮したセルのサイズを計算
    const cellWidth = (availableWidth - margin * (cols - 1)) / cols;
    const cellHeight = (availableHeight - margin * (rows - 1)) / rows;

    const cells: GridCell[] = [];
    let index = 0;

    // 行ごとにループ
    for (let row = 0; row < rows; row++) {
        // 列ごとにループ
        for (let col = 0; col < cols; col++) {
            const x = padding + col * (cellWidth + margin);
            const y = padding + row * (cellHeight + margin);

            cells.push({
                x,
                y,
                w: cellWidth,
                h: cellHeight,
                index,
                row,
                col,
            });

            index++;
        }
    }

    return cells;
}

/**
 * 正方形のグリッドを生成する簡易版
 * 
 * @param canvasSize - キャンバスの幅と高さ（正方形を想定）
 * @param gridCount - グリッドの数（縦横同じ）
 * @param margin - グリッド間のマージン（オプション）
 * @returns グリッドセルの配列
 * 
 * @example
 * ```typescript
 * const cells = createSquareGrid(600, 3, 5);
 * ```
 */
export function createSquareGrid(
    canvasSize: number,
    gridCount: number,
    margin: number = 0
): GridCell[] {
    return createGrid({
        canvasWidth: canvasSize,
        canvasHeight: canvasSize,
        cols: gridCount,
        rows: gridCount,
        margin,
    });
}

/**
 * 特定のインデックスのセルを取得
 * 
 * @param cells - グリッドセルの配列
 * @param index - 取得したいセルのインデックス
 * @returns 指定したインデックスのセル、見つからない場合はundefined
 */
export function getCellByIndex(cells: GridCell[], index: number): GridCell | undefined {
    return cells.find(cell => cell.index === index);
}

/**
 * 特定の行と列のセルを取得
 * 
 * @param cells - グリッドセルの配列
 * @param row - 行番号
 * @param col - 列番号
 * @returns 指定した行列のセル、見つからない場合はundefined
 */
export function getCellByRowCol(cells: GridCell[], row: number, col: number): GridCell | undefined {
    return cells.find(cell => cell.row === row && cell.col === col);
}

/**
 * 座標がどのセルに含まれるかを判定
 * 
 * @param cells - グリッドセルの配列
 * @param x - X座標
 * @param y - Y座標
 * @returns 座標を含むセル、見つからない場合はundefined
 */
export function getCellAtPosition(cells: GridCell[], x: number, y: number): GridCell | undefined {
    return cells.find(cell => {
        return x >= cell.x && x <= cell.x + cell.w && y >= cell.y && y <= cell.y + cell.h;
    });
}
