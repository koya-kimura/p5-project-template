// ImageAnimation は複数のカテゴリから連番画像を管理するクラス。
// カテゴリ名、アニメーションインデックス、フレーム番号を指定すると画像を返す。
import p5 from "p5";

export class ImageAnimation {
  private images: Map<string, p5.Image[][]>;

  constructor() {
    this.images = new Map();
  }

  /**
   * 指定されたディレクトリ構造から連番画像を非同期で読み込みます。
   *
   * @param p p5.jsのインスタンス
   * @param basePath 画像ディレクトリのベースパス（例: "/animation"）
   * @param categories カテゴリ情報の配列 [{name: "hand", animationCount: 5, framesPerAnimation: 40}, ...]
   */
  async load(
    p: p5,
    basePath: string,
    categories: { name: string; animationCount: number; framesPerAnimation: number }[],
  ): Promise<void> {
    const loadPromises: Promise<void>[] = [];

    for (const category of categories) {
      const categoryAnimations: p5.Image[][] = [];
      this.images.set(category.name, categoryAnimations);

      for (let animIndex = 1; animIndex <= category.animationCount; animIndex++) {
        categoryAnimations[animIndex - 1] = [];

        for (let frameIndex = 1; frameIndex <= category.framesPerAnimation; frameIndex++) {
          const imagePath = `${basePath}/${category.name}/${animIndex}/${frameIndex}.png`;

          const promise = new Promise<void>((resolve) => {
            p.loadImage(
              imagePath,
              (img) => {
                categoryAnimations[animIndex - 1][frameIndex - 1] = img;
                resolve();
              },
              () => {
                console.warn(`Failed to load image: ${imagePath}`);
                resolve();
              },
            );
          });

          loadPromises.push(promise);
        }
      }
    }

    await Promise.all(loadPromises);
    console.log(`Loaded ${categories.length} animation categories`);
  }

  /**
   * 指定したカテゴリ、アニメーションインデックス、フレーム番号の画像を取得
   *
   * @param category カテゴリ名
   * @param animationIndex アニメーションインデックス（0始まり）
   * @param frameProgress フレームの進捗（0.0～1.0）
   * @returns p5.Imageオブジェクト
   * @throws Error カテゴリ、アニメーション、またはフレームが存在しない場合
   */
  getImage(category: string, animationIndex: number, frameProgress: number): p5.Image {
    const categoryAnimations = this.images.get(category);
    if (!categoryAnimations) {
      throw new Error(`ImageAnimation: category "${category}" not found`);
    }

    const animation = categoryAnimations[animationIndex];
    if (!animation || animation.length === 0) {
      throw new Error(
        `ImageAnimation: animationIndex ${animationIndex} not found in category "${category}" (max: ${categoryAnimations.length - 1})`,
      );
    }

    const frameIndex = Math.max(
      Math.min(Math.floor(frameProgress * animation.length), animation.length - 1),
      0,
    );
    const img = animation[frameIndex];
    if (!img) {
      throw new Error(
        `ImageAnimation: frame ${frameIndex} not found in animation ${animationIndex} of category "${category}"`,
      );
    }
    return img;
  }

  /**
   * 指定したカテゴリのアニメーションのフレーム数を取得
   */
  getFrameCount(category: string, animationIndex: number): number {
    return this.images.get(category)?.[animationIndex]?.length || 0;
  }

  /**
   * 指定したカテゴリのアニメーション数を取得
   */
  getAnimationCount(category: string): number {
    return this.images.get(category)?.length || 0;
  }

  /**
   * 指定したカテゴリのアニメーション数を取得（getAnimationCountのエイリアス）
   * @param category カテゴリ名
   * @returns アニメーション数
   */
  getLength(category: string): number {
    return this.getAnimationCount(category);
  }

  /**
   * 全カテゴリ名を取得
   */
  getCategories(): string[] {
    return Array.from(this.images.keys());
  }

  /**
   * 全カテゴリ名を取得（getCategoriesのエイリアス）
   * @returns カテゴリ名の配列
   */
  getLabels(): string[] {
    return this.getCategories();
  }
}
