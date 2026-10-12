# PARALLEL_SPREAD — パネルを平行展開

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

## 操作契約

```json
{
  "label": "パネルを平行展開",
  "requiredParameters": [
    "amountMm",
    "positionMm"
  ],
  "limitation": "軸に平行な長方形パネルを縦に切開して平行展開。ダーツや折り構造のあるパネルは未対応。",
  "requiredRefs": [
    "piece"
  ],
  "positions": {},
  "parameters": {
    "amountMm": {
      "type": "number",
      "minimum": 0.1,
      "maximum": 500
    },
    "positionMm": {
      "type": "number",
      "minimum": 0.1,
      "maximum": 2000
    }
  }
}
```

## 実行例 1

長方形の左端から100mmの位置で切開し、幅を40mm平行展開。

見本: panel

### 準備手順

```json
[
  {
    "id": "sample-panel",
    "type": "CREATE_RECTANGLE",
    "widthMm": 300,
    "heightMm": 400,
    "name": "見本パネル",
    "quantity": 1,
    "refs": {
      "piece": "piece-e5e370c65b8097d8"
    }
  }
]
```

### 実行命令

```json
{
  "type": "PARALLEL_SPREAD",
  "comment": "パネルを平行展開",
  "amountMm": 40,
  "positionMm": 100,
  "id": "example-parallel-spread",
  "refs": {
    "piece": "piece-15faf673bcaf8fc7"
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/5](before-panel-1.md) · [データ 2/5](before-panel-2.md) · [データ 3/5](before-panel-3.md) · [データ 4/5](before-panel-4.md) · [データ 5/5](before-panel-5.md) · [SVG](before-panel.svg)
- 実行後: [データ 1/5](after-PARALLEL_SPREAD-1-1.md) · [データ 2/5](after-PARALLEL_SPREAD-1-2.md) · [データ 3/5](after-PARALLEL_SPREAD-1-3.md) · [データ 4/5](after-PARALLEL_SPREAD-1-4.md) · [データ 5/5](after-PARALLEL_SPREAD-1-5.md) · [SVG](after-PARALLEL_SPREAD-1.svg)

[完全なJSON教材](../tools/PARALLEL_SPREAD.json) · [操作索引](../README.md)
