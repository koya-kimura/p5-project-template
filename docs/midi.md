# MIDI 設定ガイド

このドキュメントでは、APC Mini MK2 MIDI コントローラーの設定ファイル `config.ts` の構成と使用方法について説明します。

## 概要

`config.ts` は、APC Mini MK2 のボタンやフェーダーの動作を定義する設定ファイルです。ボタンの種類、位置、動作タイプ、LED の色などを設定できます。

## ボタン設定

### MIDI_BUTTON_CONFIGS

グリッドボタン（8x8）の設定を定義します。各ボタンは以下のプロパティを持ちます：

- `key`: ボタンの識別子（ユニークな文字列）
- `type`: ボタンの動作タイプ
- `cells`: ボタンの位置（ページ、行、列）
- `activeColor`: アクティブ時の LED 色
- `inactiveColor`: 非アクティブ時の LED 色
- その他のタイプ固有のプロパティ

### ボタンタイプ

#### radio
複数の選択肢から一つを選択するタイプ。シーン選択などに使用。

```typescript
{
  key: "sceneSelect",
  type: "radio",
  cells: [
    { page: 0, row: 0, col: 0 },
    { page: 0, row: 1, col: 0 },
    // ...
  ],
  activeColor: LED_PALETTE.RED,
  inactiveColor: LED_PALETTE.DIM,
  defaultValue: 0,
}
```

#### toggle
ON/OFF を切り替えるタイプ。エフェクトの有効/無効などに使用。

```typescript
{
  key: "effectEnabled",
  type: "toggle",
  cells: [{ page: 0, row: 0, col: 1 }],
  activeColor: LED_PALETTE.GREEN,
  inactiveColor: LED_PALETTE.DIM,
  defaultValue: false,
}
```

#### oneshot
押すと一度だけトリガーされるタイプ。一時的なアクションに使用。

```typescript
{
  key: "trigger",
  type: "oneshot",
  cells: [{ page: 0, row: 0, col: 2 }],
  activeColor: LED_PALETTE.ORANGE,
  inactiveColor: LED_PALETTE.DIM,
}
```

#### momentary
押している間だけアクティブになるタイプ。フラッシュ効果などに使用。

```typescript
{
  key: "flash",
  type: "momentary",
  cells: [{ page: 0, row: 0, col: 3 }],
  activeColor: LED_PALETTE.CYAN,
  inactiveColor: LED_PALETTE.DIM,
}
```

#### random
指定した radio ボタンを BPM 同期でランダムに切り替えるトグルタイプ。

```typescript
{
  key: "sceneRandom",
  type: "random",
  cells: [{ page: 0, row: 0, col: 7 }],
  randomTarget: "sceneSelect",
  excludeCurrent: true,
  speed: 1,
  activeColor: LED_PALETTE.PURPLE,
  inactiveColor: LED_PALETTE.DIM,
}
```

#### sequence
ビート同期で左から右へ移動するシーケンサー。ステップの ON/OFF を設定可能。

```typescript
{
  key: "kickSequence",
  type: "sequence",
  cells: [
    { page: 0, row: 1, col: 0 },
    { page: 0, row: 1, col: 1 },
    // ...
  ],
  initialPattern: [false, false, false, false, false, false, false, false],
  speed: 1,
  activeColor: LED_PALETTE.ORANGE,
  onColor: LED_PALETTE.GREEN,
  offColor: LED_PALETTE.DIM,
}
```

## フェーダーボタンモード設定

### FADER_BUTTON_MODE

フェーダーボタンの動作モードを定義します。

- `"mute"`: ボタン ON 時、フェーダー値を 0 にミュート
- `"random"`: ボタン ON 時、フェーダー値を BPM 同期でランダムに 0/1 切り替え

```typescript
export const FADER_BUTTON_MODE: FaderButtonMode = "random";
```

## デフォルト値設定

MIDI 接続なしで使用する場合の初期値を設定します。

### DEFAULT_FADER_VALUES
フェーダーの初期値（0.0～1.0）。

### DEFAULT_FADER_BUTTON_TOGGLE_STATE
フェーダーボタンの初期トグル状態。

### DEFAULT_PAGE_INDEX
サイドボタン（ページ選択）の初期インデックス。

## 使用例

実際の設定例は `config.ts` を参照してください。必要に応じてボタンを追加・削除し、プロジェクトに合わせてカスタマイズしてください。
```