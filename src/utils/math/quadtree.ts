/**
 * 矩形領域を表す型
 */
export interface Rectangle {
    /** 左上のX座標 */
    x: number;
    /** 左上のY座標 */
    y: number;
    /** 幅 */
    w: number;
    /** 高さ */
    h: number;
}

/**
 * 四分木に格納するポイント
 */
export interface QuadPoint {
    /** X座標 */
    x: number;
    /** Y座標 */
    y: number;
    /** ユーザーデータ（オプション） */
    data?: any;
}

/**
 * 四分木のノード
 */
export class QuadTreeNode {
    /** このノードの矩形領域 */
    boundary: Rectangle;
    /** このノードに格納されているポイント */
    points: QuadPoint[];
    /** 1ノードあたりの最大容量 */
    capacity: number;
    /** 分割済みかどうか */
    divided: boolean;
    /** 子ノード（北西） */
    northwest?: QuadTreeNode;
    /** 子ノード（北東） */
    northeast?: QuadTreeNode;
    /** 子ノード（南西） */
    southwest?: QuadTreeNode;
    /** 子ノード（南東） */
    southeast?: QuadTreeNode;
    /** ノードの深さ */
    depth: number;

    constructor(boundary: Rectangle, capacity: number = 4, depth: number = 0) {
        this.boundary = boundary;
        this.points = [];
        this.capacity = capacity;
        this.divided = false;
        this.depth = depth;
    }

    /**
     * ポイントを挿入
     */
    insert(point: QuadPoint): boolean {
        // ポイントがこのノードの領域内にあるかチェック
        if (!this.contains(point)) {
            return false;
        }

        // 容量に余裕がある場合は追加
        if (this.points.length < this.capacity) {
            this.points.push(point);
            return true;
        }

        // 容量オーバーの場合は分割
        if (!this.divided) {
            this.subdivide();
        }

        // 子ノードに挿入を試みる
        if (this.northwest!.insert(point)) return true;
        if (this.northeast!.insert(point)) return true;
        if (this.southwest!.insert(point)) return true;
        if (this.southeast!.insert(point)) return true;

        return false;
    }

    /**
     * 領域を4分割
     */
    private subdivide(): void {
        const { x, y, w, h } = this.boundary;
        const halfW = w / 2;
        const halfH = h / 2;

        const nw: Rectangle = { x, y, w: halfW, h: halfH };
        const ne: Rectangle = { x: x + halfW, y, w: halfW, h: halfH };
        const sw: Rectangle = { x, y: y + halfH, w: halfW, h: halfH };
        const se: Rectangle = { x: x + halfW, y: y + halfH, w: halfW, h: halfH };

        this.northwest = new QuadTreeNode(nw, this.capacity, this.depth + 1);
        this.northeast = new QuadTreeNode(ne, this.capacity, this.depth + 1);
        this.southwest = new QuadTreeNode(sw, this.capacity, this.depth + 1);
        this.southeast = new QuadTreeNode(se, this.capacity, this.depth + 1);

        this.divided = true;
    }

    /**
     * ポイントが領域内に含まれるかチェック
     */
    private contains(point: QuadPoint): boolean {
        return (
            point.x >= this.boundary.x &&
            point.x < this.boundary.x + this.boundary.w &&
            point.y >= this.boundary.y &&
            point.y < this.boundary.y + this.boundary.h
        );
    }

    /**
     * 矩形領域内のポイントを検索
     */
    query(range: Rectangle, found: QuadPoint[] = []): QuadPoint[] {
        // 範囲とこのノードの領域が交差しない場合は何もしない
        if (!this.intersects(range)) {
            return found;
        }

        // このノードのポイントをチェック
        for (const point of this.points) {
            if (this.pointInRange(point, range)) {
                found.push(point);
            }
        }

        // 分割されている場合は子ノードも検索
        if (this.divided) {
            this.northwest!.query(range, found);
            this.northeast!.query(range, found);
            this.southwest!.query(range, found);
            this.southeast!.query(range, found);
        }

        return found;
    }

    /**
     * 2つの矩形が交差するかチェック
     */
    private intersects(range: Rectangle): boolean {
        return !(
            range.x > this.boundary.x + this.boundary.w ||
            range.x + range.w < this.boundary.x ||
            range.y > this.boundary.y + this.boundary.h ||
            range.y + range.h < this.boundary.y
        );
    }

    /**
     * ポイントが矩形範囲内にあるかチェック
     */
    private pointInRange(point: QuadPoint, range: Rectangle): boolean {
        return (
            point.x >= range.x &&
            point.x < range.x + range.w &&
            point.y >= range.y &&
            point.y < range.y + range.h
        );
    }

    /**
     * すべてのノードを取得（可視化用）
     */
    getAllNodes(): QuadTreeNode[] {
        const nodes: QuadTreeNode[] = [this];

        if (this.divided) {
            nodes.push(...this.northwest!.getAllNodes());
            nodes.push(...this.northeast!.getAllNodes());
            nodes.push(...this.southwest!.getAllNodes());
            nodes.push(...this.southeast!.getAllNodes());
        }

        return nodes;
    }

    /**
     * すべてのポイントを取得
     */
    getAllPoints(): QuadPoint[] {
        let points: QuadPoint[] = [...this.points];

        if (this.divided) {
            points = points.concat(this.northwest!.getAllPoints());
            points = points.concat(this.northeast!.getAllPoints());
            points = points.concat(this.southwest!.getAllPoints());
            points = points.concat(this.southeast!.getAllPoints());
        }

        return points;
    }

    /**
     * ツリーをクリア
     */
    clear(): void {
        this.points = [];
        this.divided = false;
        this.northwest = undefined;
        this.northeast = undefined;
        this.southwest = undefined;
        this.southeast = undefined;
    }
}

/**
 * 四分木クラス（ルートノードのラッパー）
 */
export class QuadTree {
    /** ルートノード */
    private root: QuadTreeNode;

    /**
     * @param boundary - 全体の矩形領域
     * @param capacity - 1ノードあたりの最大容量（デフォルト: 4）
     */
    constructor(boundary: Rectangle, capacity: number = 4) {
        this.root = new QuadTreeNode(boundary, capacity);
    }

    /**
     * ポイントを挿入
     */
    insert(point: QuadPoint): boolean {
        return this.root.insert(point);
    }

    /**
     * 複数のポイントを一度に挿入
     */
    insertMany(points: QuadPoint[]): void {
        for (const point of points) {
            this.insert(point);
        }
    }

    /**
     * 矩形領域内のポイントを検索
     */
    query(range: Rectangle): QuadPoint[] {
        return this.root.query(range);
    }

    /**
     * 円形領域内のポイントを検索
     */
    queryCircle(x: number, y: number, radius: number): QuadPoint[] {
        // まず矩形範囲で大まかに絞り込み
        const range: Rectangle = {
            x: x - radius,
            y: y - radius,
            w: radius * 2,
            h: radius * 2,
        };
        const candidates = this.query(range);

        // 円形内のポイントのみフィルタ
        return candidates.filter(point => {
            const dx = point.x - x;
            const dy = point.y - y;
            return dx * dx + dy * dy <= radius * radius;
        });
    }

    /**
     * すべてのノードを取得（可視化用）
     */
    getAllNodes(): QuadTreeNode[] {
        return this.root.getAllNodes();
    }

    /**
     * すべてのポイントを取得
     */
    getAllPoints(): QuadPoint[] {
        return this.root.getAllPoints();
    }

    /**
     * ツリーをクリア
     */
    clear(): void {
        this.root.clear();
    }

    /**
     * ルートノードを取得
     */
    getRoot(): QuadTreeNode {
        return this.root;
    }

    /**
     * ツリーの統計情報を取得
     */
    getStats(): {
        totalNodes: number;
        totalPoints: number;
        maxDepth: number;
    } {
        const nodes = this.getAllNodes();
        const points = this.getAllPoints();
        const maxDepth = Math.max(...nodes.map(node => node.depth));

        return {
            totalNodes: nodes.length,
            totalPoints: points.length,
            maxDepth,
        };
    }
}

/**
 * ヘルパー関数: 矩形を作成
 */
export function createRectangle(x: number, y: number, w: number, h: number): Rectangle {
    return { x, y, w, h };
}

/**
 * ヘルパー関数: ポイントを作成
 */
export function createPoint(x: number, y: number, data?: any): QuadPoint {
    return { x, y, data };
}

/**
 * ヘルパー関数: ランダムなポイントを生成
 */
export function generateRandomPoints(
    boundary: Rectangle,
    count: number
): QuadPoint[] {
    const points: QuadPoint[] = [];
    for (let i = 0; i < count; i++) {
        points.push({
            x: boundary.x + Math.random() * boundary.w,
            y: boundary.y + Math.random() * boundary.h,
            data: { id: i },
        });
    }
    return points;
}
