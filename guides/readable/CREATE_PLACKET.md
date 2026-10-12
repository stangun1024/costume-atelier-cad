# CREATE_PLACKET — 別付け比翼パーツを作る

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

## 操作契約

```json
{
  "label": "別付け比翼パーツを作る",
  "requiredParameters": [
    "finishedWidthMm",
    "turnUnderMm",
    "buttonSpacingMm",
    "endMarginMm"
  ],
  "limitation": "帯・折り線・内部取付線を生成。ボタン穴長さと幅は両方指定、上前のみ生成。芯幅を指定すれば裏面の閉じた範囲を両帯に生成（仕上がり幅以内）。取付線を個体・表裏付きADD_RELATIONで身頃へ縫合し、SET_PIECE_PLACEMENTで配置する。取付・穴・芯の不足は現データから再評価する。開閉可能性は別途確認。",
  "requiredRefs": [
    "piece",
    "edge"
  ],
  "positions": {},
  "parameters": {
    "finishedWidthMm": {
      "type": "number",
      "minimum": 5,
      "maximum": 80
    },
    "turnUnderMm": {
      "type": "number",
      "minimum": 1,
      "maximum": 30
    },
    "buttonSpacingMm": {
      "type": "number",
      "minimum": 10,
      "maximum": 150
    },
    "endMarginMm": {
      "type": "number",
      "minimum": 5,
      "maximum": 100
    },
    "buttonholeLengthMm": {
      "type": "number",
      "minimum": 2,
      "maximum": 60
    },
    "buttonholeWidthMm": {
      "type": "number",
      "minimum": 0.1,
      "maximum": 10
    },
    "interfacingWidthMm": {
      "type": "number",
      "minimum": 1,
      "maximum": 80
    }
  }
}
```

## 実行例 1

比翼・折り線・取付線・14×2mmのボタン穴・幅16mmの裏側の芯を生成。身頃への縫合と配置は未完了。

見本: opening

### 準備手順

```json
[
  {
    "id": "sample-opening",
    "type": "OPEN_FOLD",
    "refs": {
      "piece": "piece-e5e370c65b8097d8",
      "edge": "edge-05c5dc60097ec0aa"
    }
  }
]
```

### 実行命令

```json
{
  "type": "CREATE_PLACKET",
  "comment": "別付け比翼パーツを作る",
  "finishedWidthMm": 20,
  "turnUnderMm": 10,
  "buttonSpacingMm": 60,
  "endMarginMm": 20,
  "buttonholeLengthMm": 14,
  "buttonholeWidthMm": 2,
  "interfacingWidthMm": 16,
  "id": "example-create-placket",
  "refs": {
    "piece": "piece-e5e370c65b8097d8",
    "edge": "edge-05c5dc60097ec0aa"
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/4](before-opening-1.md) · [データ 2/4](before-opening-2.md) · [データ 3/4](before-opening-3.md) · [データ 4/4](before-opening-4.md) · [SVG](before-opening.svg)
- 実行後: [データ 1/7](after-CREATE_PLACKET-1-1.md) · [データ 2/7](after-CREATE_PLACKET-1-2.md) · [データ 3/7](after-CREATE_PLACKET-1-3.md) · [データ 4/7](after-CREATE_PLACKET-1-4.md) · [データ 5/7](after-CREATE_PLACKET-1-5.md) · [データ 6/7](after-CREATE_PLACKET-1-6.md) · [データ 7/7](after-CREATE_PLACKET-1-7.md) · [SVG](after-CREATE_PLACKET-1.svg)

[完全なJSON教材](../tools/CREATE_PLACKET.json) · [操作索引](../README.md)
