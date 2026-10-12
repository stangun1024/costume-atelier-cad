# EXTEND_HEM — 身頃の丈・裾幅を変更

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

## 操作契約

```json
{
  "label": "身頃の丈・裾幅を変更",
  "requiredParameters": [
    "amountMm",
    "widthChangeMm"
  ],
  "limitation": "水平な直線の下端と、直線の隣接辺が対象。幅の増減はパーツ1枚分。",
  "requiredRefs": [
    "piece",
    "edge"
  ],
  "positions": {},
  "parameters": {
    "amountMm": {
      "type": "number",
      "minimum": -500,
      "maximum": 1000
    },
    "widthChangeMm": {
      "type": "number",
      "minimum": -300,
      "maximum": 300
    }
  }
}
```

## 実行例 1

下端を50mm延長し、パーツ1枚の裾幅を40mm増加。

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
  "type": "EXTEND_HEM",
  "comment": "身頃の丈・裾幅を変更",
  "amountMm": 50,
  "widthChangeMm": 40,
  "id": "example-extend-hem",
  "refs": {
    "piece": "piece-15faf673bcaf8fc7",
    "edge": "edge-e9e503b00926d634"
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/5](before-panel-1.md) · [データ 2/5](before-panel-2.md) · [データ 3/5](before-panel-3.md) · [データ 4/5](before-panel-4.md) · [データ 5/5](before-panel-5.md) · [SVG](before-panel.svg)
- 実行後: [データ 1/5](after-EXTEND_HEM-1-1.md) · [データ 2/5](after-EXTEND_HEM-1-2.md) · [データ 3/5](after-EXTEND_HEM-1-3.md) · [データ 4/5](after-EXTEND_HEM-1-4.md) · [データ 5/5](after-EXTEND_HEM-1-5.md) · [SVG](after-EXTEND_HEM-1.svg)

[完全なJSON教材](../tools/EXTEND_HEM.json) · [操作索引](../README.md)
