/**
 * ログエントリの型定義
 */
export interface LogEntry {
  time: string; // HH:mm:ss形式の時刻
  text: string; // ログのテキスト
  timestamp: number; // タイムスタンプ（ミリ秒）
}

/**
 * 時間制限付きロガークラス
 * 指定された時間を超えた古いログを自動的に削除します
 */
export class Logger {
  private logs: LogEntry[] = [];
  private retentionTimeMs: number; // ログの保持時間（ミリ秒）

  /**
   * Loggerクラスのコンストラクタ
   * @param retentionMinutes - ログを保持する時間（分）
   */
  constructor(retentionMinutes: number = 5) {
    this.retentionTimeMs = retentionMinutes * 60 * 1000;
  }

  /**
   * ログを記録します
   * @param message - ログメッセージ
   */
  log(message: string): void {
    const now = new Date();
    const time = this.formatTime(now);
    const timestamp = now.getTime();

    this.logs.push({
      time,
      text: message,
      timestamp,
    });

    // 古いログを削除
    this.cleanOldLogs();
  }

  /**
   * 最新からN個のログを取得します
   * @param count - 取得するログの数
   * @returns ログエントリの配列（最新が先頭）
   */
  getRecentLogs(count: number): LogEntry[] {
    // 古いログを削除
    this.cleanOldLogs();

    // 最新からcount個を取得（逆順）
    return this.logs.slice(-count).reverse();
  }

  /**
   * 古いログを削除します（保持時間を超えたもの）
   */
  private cleanOldLogs(): void {
    const now = Date.now();
    this.logs = this.logs.filter((log) => now - log.timestamp <= this.retentionTimeMs);
  }

  /**
   * 時刻をHH:mm:ss形式にフォーマットします
   * @param date - Date オブジェクト
   * @returns HH:mm:ss形式の文字列
   */
  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }

  /**
   * すべてのログをクリアします
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * 現在保存されているログの数を取得します
   * @returns ログの数
   */
  getLogCount(): number {
    this.cleanOldLogs();
    return this.logs.length;
  }
}
