import { MIDIManager } from "../midiManager";
import { UniformRandom } from "../../utils/math/uniformRandom";
import type { ButtonConfig, FaderButtonMode, InputType, MidiInputValue } from "../../types";
import {
  MIDI_BUTTON_CONFIGS,
  FADER_BUTTON_MODE,
  DEFAULT_FADER_VALUES,
  DEFAULT_PAGE_INDEX,
  DEFAULT_FADER_BUTTON_TOGGLE_STATE,
} from "./config";
import { LED_PALETTE, PAGE_LED_PALETTE } from "./ledPalette";

// ========================================
// 型定義
// ========================================

/** 内部管理用: 登録されたセル情報 */
interface RegisteredCell {
  key: string;
  type: InputType;
  cellIndex: number; // cells配列内のインデックス
  activeColor: number;
  inactiveColor: number;
}

// ========================================
// 定数
// ========================================

const MIDI_STATUS = {
  NOTE_ON: 0x90,
  NOTE_OFF: 0x80,
  CONTROL_CHANGE: 0xb0,
};

const MIDI_OUTPUT_STATUS = {
  NOTE_ON: 0x96,
};

const NOTE_RANGES = {
  GRID: { START: 0, END: 63 },
  FADER_BUTTONS: { START: 100, END: 107 },
  SIDE_BUTTONS: { START: 112, END: 119 }, // ページ切り替えボタン
  FADERS: { START: 48, END: 56 },
  FADER_BUTTON_8: 122, // 9番目のフェーダーボタン
};

const GRID_ROWS = 8;
const GRID_COLS = 8;

// LED_PALETTE, PAGE_LED_PALETTE は ./ledPalette.ts からインポート
export { LED_PALETTE } from "./ledPalette";

export class APCMiniMK2Manager extends MIDIManager {
  // フェーダー関連
  public faderValues: number[];
  /** フェーダーの物理的な値（ミュート/ランダム適用前の生の値） */
  private rawFaderValues: number[];
  public faderButtonToggleState: boolean[];

  // ページ管理
  public currentPageIndex: number;
  private faderButtonMode: FaderButtonMode;

  // 新しいセル登録システム
  /** セル登録マップ: "page-row-col" → RegisteredCell */
  private cellRegistry: Map<string, RegisteredCell> = new Map();
  /** 入力値ストア: key → value */
  private inputValues: Map<string, MidiInputValue> = new Map();
  /** ボタン設定の保持: key → ButtonConfig */
  private buttonConfigs: Map<string, ButtonConfig> = new Map();
  /** momentary状態管理用 */
  private momentaryState: Map<string, boolean> = new Map();
  /** random同期用: 前回のbeat値を保持 */
  private lastRandomBeat: Map<string, number> = new Map();
  /** sequence パターン: key -> boolean[] */
  private sequencePatterns: Map<string, boolean[]> = new Map();
  /** sequence 現在位置: key -> number */
  private sequencePositions: Map<string, number> = new Map();
  /** sequence 同期用: 前回のbeat値を保持 */
  private lastSequenceBeat: Map<string, number> = new Map();

  constructor() {
    super();
    this.faderValues = [...DEFAULT_FADER_VALUES];
    this.rawFaderValues = [...DEFAULT_FADER_VALUES];
    this.faderButtonToggleState = [...DEFAULT_FADER_BUTTON_TOGGLE_STATE];
    this.currentPageIndex = DEFAULT_PAGE_INDEX;
    this.faderButtonMode = FADER_BUTTON_MODE;

    this.onMidiMessageCallback = this.handleMIDIMessage.bind(this);
  }

  // ========================================
  // 公開API: ボタン登録
  // ========================================

  /**
   * ボタンを登録する
   * @param config - ボタン設定
   * @throws 同じセルに複数のキーを登録しようとした場合
   */
  public registerButton(config: ButtonConfig): void {
    const { key, type, cells, activeColor, inactiveColor, defaultValue } = config;

    // 重複チェック
    for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
      const cell = cells[cellIndex];
      const page = cell.page ?? 0;
      const cellKey = this.getCellKey(page, cell.row, cell.col);

      if (this.cellRegistry.has(cellKey)) {
        const existing = this.cellRegistry.get(cellKey)!;
        throw new Error(
          `セル (page=${page}, row=${cell.row}, col=${cell.col}) は既に "${existing.key}" に登録されています。` +
            `"${key}" を登録できません。`,
        );
      }
    }

    // セルを登録
    for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
      const cell = cells[cellIndex];
      const page = cell.page ?? 0;
      const cellKey = this.getCellKey(page, cell.row, cell.col);

      const registeredCell: RegisteredCell = {
        key,
        type,
        cellIndex,
        activeColor: activeColor ?? LED_PALETTE.ON,
        inactiveColor: inactiveColor ?? LED_PALETTE.DIM,
      };

      this.cellRegistry.set(cellKey, registeredCell);
    }

    // ボタン設定を保持
    this.buttonConfigs.set(key, config);

    // デフォルト値を設定
    if (defaultValue !== undefined) {
      this.inputValues.set(key, defaultValue);
    } else {
      // 型に応じたデフォルト値
      switch (type) {
        case "radio":
          this.inputValues.set(key, 0);
          break;
        case "toggle":
          this.inputValues.set(key, false);
          break;
        case "oneshot":
          this.inputValues.set(key, false);
          break;
        case "momentary":
          this.inputValues.set(key, false);
          this.momentaryState.set(key, false);
          break;
        case "random":
          // randomタイプはトグルとして機能（ON時にbeat同期でランダム）
          this.inputValues.set(key, false);
          this.lastRandomBeat.set(key, -1);
          break;
        case "sequence": {
          // sequenceタイプ: パターンに従ってbeat同期で値が変化
          const cellCount = config.cells.length;
          const initialPattern = config.initialPattern ?? new Array(cellCount).fill(false);
          this.sequencePatterns.set(key, [...initialPattern]);
          this.sequencePositions.set(key, 0);
          this.lastSequenceBeat.set(key, -1);
          // 初期値: 位置0のパターン値
          this.inputValues.set(key, initialPattern[0] ?? false);
          break;
        }
      }
    }
  }

  /**
   * 複数のボタンを一括登録する
   * @param configs - ボタン設定の配列
   */
  public registerButtons(configs: ButtonConfig[]): void {
    for (const config of configs) {
      this.registerButton(config);
    }
  }

  /**
   * 入力値を外部から上書きする。
   */
  public setButtonValue(key: string, value: MidiInputValue): void {
    if (this.inputValues.has(key)) {
      this.inputValues.set(key, value);
    }
  }

  /**
   * キーボード入力をセル定義の `keyboardKey` と照合して仮想押下を適用する。
   *
   * @returns 1件以上適用されたら true。
   */
  public applyKeyboardFallback(keyInput: string): boolean {
    const normalized = this.normalizeKeyboardKey(keyInput);
    if (!normalized) {
      return false;
    }

    let applied = false;
    for (const [buttonKey, config] of this.buttonConfigs) {
      for (let cellIndex = 0; cellIndex < config.cells.length; cellIndex++) {
        const cell = config.cells[cellIndex];
        if (this.normalizeKeyboardKey(cell.keyboardKey) !== normalized) {
          continue;
        }
        this.applyVirtualCellPress(buttonKey, config, cellIndex);
        applied = true;
      }
    }

    return applied;
  }

  // ========================================
  // 公開API: 入力値取得
  // ========================================

  /**
   * MIDI入力値を取得する
   * radioタイプは数値、それ以外はbooleanを返す
   */
  get midiInput(): Record<string, MidiInputValue> {
    const result: Record<string, MidiInputValue> = {};
    for (const [key, value] of this.inputValues) {
      const config = this.buttonConfigs.get(key);
      if (config?.type === "radio") {
        // radioタイプは数値を保証
        result[key] = typeof value === "number" ? value : 0;
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  // ========================================
  // 更新処理
  // ========================================

  /**
   * フレーム更新処理
   * @param beat - 現在のビート数（float値、BPM同期用）
   */
  public update(beat: number): void {
    // oneshotをリセット
    this.resetOneshotValues();

    // randomタイプのbeat同期処理
    this.updateRandomSync(beat);

    // sequenceタイプのbeat同期処理
    this.updateSequenceSync(beat);

    // フェーダーボタンのミュート/ランダム処理
    this.updateFaderButtonEffects(beat);

    // LED出力
    this.midiOutputSendControls();
  }

  /**
   * oneshotタイプの値をリセット
   */
  private resetOneshotValues(): void {
    for (const [key, config] of this.buttonConfigs) {
      if (config.type === "oneshot") {
        this.inputValues.set(key, false);
      }
    }
  }

  /**
   * randomタイプのbeat同期処理
   * ONになっているrandomボタンはbeat×speedごとに対象をランダム切り替え
   */
  private updateRandomSync(beat: number): void {
    for (const [key, config] of this.buttonConfigs) {
      if (config.type !== "random") {
        continue;
      }

      const isEnabled = this.inputValues.get(key) as boolean;
      if (!isEnabled) {
        continue;
      }

      const speed = config.speed ?? 1;
      const scaledBeat = Math.floor(beat * speed);
      const lastBeat = this.lastRandomBeat.get(key) ?? -1;

      // beatが変化した時のみランダム切り替え
      if (scaledBeat !== lastBeat) {
        this.lastRandomBeat.set(key, scaledBeat);
        this.applyRandom(key, scaledBeat);
      }
    }
  }

  /**
   * sequenceタイプのbeat同期処理
   * beatに従って位置を更新し、現在位置のON/OFFを値として設定
   */
  private updateSequenceSync(beat: number): void {
    for (const [key, config] of this.buttonConfigs) {
      if (config.type !== "sequence") {
        continue;
      }

      const speed = config.speed ?? 1;
      const scaledBeat = Math.floor(beat * speed);
      const lastBeat = this.lastSequenceBeat.get(key) ?? -1;

      // beatが変化した時のみ位置を更新
      if (scaledBeat !== lastBeat) {
        this.lastSequenceBeat.set(key, scaledBeat);

        const pattern = this.sequencePatterns.get(key);
        if (!pattern) continue;

        const cellCount = pattern.length;
        const position = scaledBeat % cellCount;
        this.sequencePositions.set(key, position);

        // 現在位置のON/OFFを値として設定
        this.inputValues.set(key, pattern[position]);
      }
    }
  }

  /**
   * フェーダーボタンの効果を適用（ミュートまたはランダム）
   */
  private updateFaderButtonEffects(beat: number): void {
    for (let col = 0; col < 8; col++) {
      if (!this.faderButtonToggleState[col]) {
        continue;
      }

      if (this.faderButtonMode === "random") {
        this.faderValues[col] = UniformRandom.rand(Math.floor(beat), col) < 0.5 ? 0 : 1;
      } else if (this.faderButtonMode === "mute") {
        this.faderValues[col] = 0;
      }
    }
  }

  // ========================================
  // MIDI入力処理
  // ========================================

  /**
   * @param message - 受信したMIDIメッセージイベント
   */
  protected handleMIDIMessage(message: WebMidi.MIDIMessageEvent): void {
    const [statusByte, dataByte1, dataByte2] = message.data;
    const noteNumber = dataByte1;
    const velocity = dataByte2;

    this.handleFaderButton(statusByte, noteNumber, velocity);
    this.handleSideButton(statusByte, noteNumber, velocity);
    this.handleGridPad(statusByte, noteNumber, velocity);
    this.handleFaderControlChange(statusByte, noteNumber, velocity);
  }

  /**
   * フェーダーボタンの処理
   */
  private handleFaderButton(statusByte: number, noteNumber: number, velocity: number): void {
    const isFaderButton =
      (statusByte === MIDI_STATUS.NOTE_ON || statusByte === MIDI_STATUS.NOTE_OFF) &&
      ((noteNumber >= NOTE_RANGES.FADER_BUTTONS.START &&
        noteNumber <= NOTE_RANGES.FADER_BUTTONS.END) ||
        noteNumber === NOTE_RANGES.FADER_BUTTON_8);

    if (!isFaderButton) {
      return;
    }

    let index: number;
    if (noteNumber === NOTE_RANGES.FADER_BUTTON_8) {
      index = 8;
    } else {
      index = noteNumber - NOTE_RANGES.FADER_BUTTONS.START;
    }

    if (velocity > 0) {
      const wasToggled = this.faderButtonToggleState[index];
      this.faderButtonToggleState[index] = !wasToggled;

      // ランダムモードでOFF→ONに切り替わった時、現在のfader値をraw値に保存
      // OFF→OFFは変化なし
      // ON→OFFに切り替わった時（解除時）、raw値をfaderValuesに復元
      if (this.faderButtonMode === "random" && wasToggled && !this.faderButtonToggleState[index]) {
        // ランダム解除時: 現在の物理fader値を適用
        this.faderValues[index] = this.rawFaderValues[index];
      }
    }
  }

  /**
   * サイドボタン（ページ切り替え）の処理
   */
  private handleSideButton(statusByte: number, noteNumber: number, velocity: number): void {
    const isSideButton =
      statusByte === MIDI_STATUS.NOTE_ON &&
      noteNumber >= NOTE_RANGES.SIDE_BUTTONS.START &&
      noteNumber <= NOTE_RANGES.SIDE_BUTTONS.END;

    if (!isSideButton) {
      return;
    }

    if (velocity <= 0) {
      return;
    }

    const pageIndex = noteNumber - NOTE_RANGES.SIDE_BUTTONS.START;
    if (pageIndex < 0 || pageIndex >= GRID_COLS) {
      return;
    }
    this.currentPageIndex = pageIndex;
  }

  /**
   * グリッドパッドの処理（新しいセル登録システム）
   */
  private handleGridPad(statusByte: number, noteNumber: number, velocity: number): void {
    const isNoteOn = statusByte === MIDI_STATUS.NOTE_ON;
    const isNoteOff = statusByte === MIDI_STATUS.NOTE_OFF;

    if (!isNoteOn && !isNoteOff) {
      return;
    }

    if (noteNumber < NOTE_RANGES.GRID.START || noteNumber > NOTE_RANGES.GRID.END) {
      return;
    }

    const gridIndex = noteNumber - NOTE_RANGES.GRID.START;
    const col = gridIndex % GRID_COLS;
    const row = GRID_ROWS - 1 - Math.floor(gridIndex / GRID_COLS); // 反転補正

    const cellKey = this.getCellKey(this.currentPageIndex, row, col);
    const registeredCell = this.cellRegistry.get(cellKey);

    // 未登録セルはスルー
    if (!registeredCell) {
      return;
    }

    const { key, type, cellIndex } = registeredCell;

    if (isNoteOn && velocity > 0) {
      // ボタン押下
      switch (type) {
        case "radio":
          // randomがONなら手動入力をブロック
          if (!this.isRadioBlockedByRandom(key)) {
            this.inputValues.set(key, cellIndex);
          }
          break;
        case "toggle": {
          const currentToggle = this.inputValues.get(key) as boolean;
          this.inputValues.set(key, !currentToggle);
          break;
        }
        case "oneshot":
          this.inputValues.set(key, true);
          break;
        case "momentary":
          this.inputValues.set(key, true);
          this.momentaryState.set(key, true);
          break;
        case "random": {
          // randomはトグルとして動作
          const currentRandom = this.inputValues.get(key) as boolean;
          this.inputValues.set(key, !currentRandom);
          // OFFになったらlastBeatをリセット
          if (currentRandom) {
            this.lastRandomBeat.set(key, -1);
          }
          break;
        }
        case "sequence": {
          // sequenceタイプ: 押したセルのパターンをトグル
          const pattern = this.sequencePatterns.get(key);
          if (pattern && cellIndex < pattern.length) {
            pattern[cellIndex] = !pattern[cellIndex];
          }
          break;
        }
      }
    } else if ((isNoteOff || (isNoteOn && velocity === 0)) && type === "momentary") {
      // ボタン離した（momentaryのみ）
      this.inputValues.set(key, false);
      this.momentaryState.set(key, false);
    }
  }

  /**
   * フェーダーのコントロールチェンジ処理
   */
  private handleFaderControlChange(statusByte: number, noteNumber: number, value: number): void {
    const isFaderControlChange =
      statusByte === MIDI_STATUS.CONTROL_CHANGE &&
      noteNumber >= NOTE_RANGES.FADERS.START &&
      noteNumber <= NOTE_RANGES.FADERS.END;

    if (!isFaderControlChange) {
      return;
    }

    const index = noteNumber - NOTE_RANGES.FADERS.START;
    const normalizedValue = value / 127;

    // 物理的なfader値は常に保存
    this.rawFaderValues[index] = normalizedValue;

    // ランダムモードでトグルがONの場合はfaderValuesを更新しない（ランダム値を維持）
    // ミュートモードの場合も同様
    if (this.faderButtonToggleState[index]) {
      return;
    }

    this.faderValues[index] = normalizedValue;
  }

  // ========================================
  // LED出力処理
  // ========================================

  /**
   * 各種LED出力をまとめて送信
   */
  protected midiOutputSendControls(): void {
    this.sendPageButtonLeds();
    this.sendGridPadLeds();
    this.sendFaderButtonLeds();
  }

  /**
   * ページ切り替えボタンのLED出力
   */
  private sendPageButtonLeds(): void {
    for (let i = 0; i < 8; i++) {
      const note = NOTE_RANGES.SIDE_BUTTONS.START + i;
      const velocity = i === this.currentPageIndex ? PAGE_LED_PALETTE[i] : LED_PALETTE.OFF;
      this.send(MIDI_STATUS.NOTE_ON, note, velocity);
    }
  }

  /**
   * グリッドパッドのLED出力（新しいセル登録システム）
   */
  private sendGridPadLeds(): void {
    for (let col = 0; col < GRID_COLS; col++) {
      for (let row = 0; row < GRID_ROWS; row++) {
        const gridIndex = (GRID_ROWS - 1 - row) * GRID_COLS + col;
        const note = NOTE_RANGES.GRID.START + gridIndex;
        const velocity = this.getGridPadVelocity(this.currentPageIndex, row, col);
        this.send(MIDI_OUTPUT_STATUS.NOTE_ON, note, velocity);
      }
    }
  }

  /**
   * フェーダーボタンのLED出力
   */
  private sendFaderButtonLeds(): void {
    for (let i = 0; i < 9; i++) {
      const note = i < 8 ? NOTE_RANGES.FADER_BUTTONS.START + i : NOTE_RANGES.FADER_BUTTON_8;
      const velocity = this.faderButtonToggleState[i] ? LED_PALETTE.ON : LED_PALETTE.OFF;
      this.send(MIDI_STATUS.NOTE_ON, note, velocity);
    }
  }

  /**
   * グリッドパッドのLED色を取得
   */
  private getGridPadVelocity(pageIndex: number, row: number, col: number): number {
    const cellKey = this.getCellKey(pageIndex, row, col);
    const registeredCell = this.cellRegistry.get(cellKey);

    // 未登録セルはOFF
    if (!registeredCell) {
      return LED_PALETTE.OFF;
    }

    const { key, type, cellIndex, activeColor, inactiveColor } = registeredCell;
    const currentValue = this.inputValues.get(key);

    switch (type) {
      case "radio":
        return currentValue === cellIndex ? activeColor : inactiveColor;
      case "toggle":
        return currentValue === true ? activeColor : inactiveColor;
      case "oneshot":
        return currentValue === true ? activeColor : inactiveColor;
      case "momentary":
        return this.momentaryState.get(key) === true ? activeColor : inactiveColor;
      case "random":
        // randomボタンはON/OFFで色を切り替え
        return currentValue === true ? activeColor : inactiveColor;
      case "sequence": {
        // sequenceタイプ: アクティブ位置、ON、OFFの3パターン
        const config = this.buttonConfigs.get(key);
        const pattern = this.sequencePatterns.get(key);
        const position = this.sequencePositions.get(key) ?? 0;
        if (!pattern || !config) return LED_PALETTE.OFF;

        const isCurrentPosition = cellIndex === position;
        const isOn = pattern[cellIndex] ?? false;

        if (isCurrentPosition) {
          // アクティブ位置はactiveColor
          return activeColor;
        } else if (isOn) {
          // ONセルはonColor
          return config.onColor ?? LED_PALETTE.GREEN;
        } else {
          // OFFセルはoffColor
          return config.offColor ?? LED_PALETTE.DIM;
        }
      }
      default:
        return LED_PALETTE.OFF;
    }
  }

  // ========================================
  // ヘルパー
  // ========================================

  /**
   * 指定されたradioボタンがrandomによってブロックされているかチェック
   */
  private isRadioBlockedByRandom(radioKey: string): boolean {
    for (const [, config] of this.buttonConfigs) {
      if (config.type === "random" && config.randomTarget === radioKey) {
        const isEnabled = this.inputValues.get(config.key) as boolean;
        if (isEnabled) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * randomタイプのランダム選択を実行
   * @param randomKey - randomボタンのkey
   * @param seed - ランダムシード（beatベース）
   */
  private applyRandom(randomKey: string, seed: number): void {
    const config = this.buttonConfigs.get(randomKey);
    if (!config || config.type !== "random") {
      return;
    }

    const targetKey = config.randomTarget;
    if (!targetKey) {
      return;
    }

    const targetConfig = this.buttonConfigs.get(targetKey);
    if (!targetConfig || targetConfig.type !== "radio") {
      return;
    }

    const cellCount = targetConfig.cells.length;
    if (cellCount <= 1) {
      return;
    }

    const currentValue = this.inputValues.get(targetKey) as number;
    const excludeCurrent = config.excludeCurrent !== false;

    let newValue: number;
    if (excludeCurrent && cellCount > 1) {
      // 現在値を除外してUniformRandomで選択
      const candidates = [];
      for (let i = 0; i < cellCount; i++) {
        if (i !== currentValue) {
          candidates.push(i);
        }
      }
      const randomIndex = Math.floor(
        UniformRandom.rand(seed, randomKey.length) * candidates.length,
      );
      newValue = candidates[randomIndex];
    } else {
      // 全ての選択肢からUniformRandomで選択
      newValue = Math.floor(UniformRandom.rand(seed, randomKey.length) * cellCount);
    }

    this.inputValues.set(targetKey, newValue);
  }

  /**
   * セルのキーを生成
   */
  private getCellKey(page: number, row: number, col: number): string {
    return `${page}-${row}-${col}`;
  }

  /**
   * キー入力を比較しやすい形へ正規化する。
   */
  private normalizeKeyboardKey(key: string | undefined): string {
    if (typeof key !== "string") {
      return "";
    }
    return key.trim().toLowerCase();
  }

  /**
   * キーボード入力でセルが押されたとみなして値を更新する。
   */
  private applyVirtualCellPress(buttonKey: string, config: ButtonConfig, cellIndex: number): void {
    switch (config.type) {
      case "radio":
        if (!this.isRadioBlockedByRandom(buttonKey)) {
          this.inputValues.set(buttonKey, cellIndex);
        }
        break;
      case "toggle": {
        const currentToggle = this.inputValues.get(buttonKey) as boolean;
        this.inputValues.set(buttonKey, !currentToggle);
        break;
      }
      case "oneshot":
        this.inputValues.set(buttonKey, true);
        break;
      case "momentary":
        this.inputValues.set(buttonKey, true);
        this.momentaryState.set(buttonKey, true);
        setTimeout(() => {
          this.inputValues.set(buttonKey, false);
          this.momentaryState.set(buttonKey, false);
        }, 0);
        break;
      case "random": {
        const currentRandom = this.inputValues.get(buttonKey) as boolean;
        this.inputValues.set(buttonKey, !currentRandom);
        if (currentRandom) {
          this.lastRandomBeat.set(buttonKey, -1);
        }
        break;
      }
      case "sequence": {
        const pattern = this.sequencePatterns.get(buttonKey);
        if (pattern && cellIndex < pattern.length) {
          pattern[cellIndex] = !pattern[cellIndex];
        }
        break;
      }
    }
  }

  /**
   * MIDIメッセージを送信
   */
  private send(status: number, note: number, velocity: number): void {
    this.sendMessage([status, note, velocity]);
  }

  /**
   * 初期化処理
   * 親クラスのMIDI初期化を行い、設定ファイルからボタンを登録します。
   */
  public async init(): Promise<void> {
    // 親クラスのMIDI初期化を待つ
    await super.init();

    // 設定ファイルからボタンを登録
    if (MIDI_BUTTON_CONFIGS.length > 0) {
      this.registerButtons(MIDI_BUTTON_CONFIGS);
      console.log(`📋 MIDI設定: ${MIDI_BUTTON_CONFIGS.length}件のボタンを登録しました`);
    }
  }

  /**
   * MIDIデバイスの利用可能性が変化した際のハンドラ
   */
  protected override onMidiAvailabilityChanged(available: boolean): void {
    super.onMidiAvailabilityChanged(available);

    if (available) {
      console.log("🎹 APC Mini MK2: 接続されました");
      // 接続時にLEDを初期化
      this.midiOutputSendControls();
    } else {
      console.warn("🎹 APC Mini MK2: 接続されていません");
    }
  }
}
