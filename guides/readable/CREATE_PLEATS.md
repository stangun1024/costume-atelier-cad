# CREATE_PLEATS — 直線プリーツを展開

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

## 操作契約

```json
{
  "label": "直線プリーツを展開",
  "requiredParameters": [
    "count",
    "depthMm",
    "spacingMm",
    "firstOffsetMm",
    "direction"
  ],
  "limitation": "縦地の目の長方形パネル限定。完成幅に1本あたり深さの2倍を追加。曲線パネル・他のダーツ・合印とは併用不可。",
  "requiredRefs": [
    "piece"
  ],
  "positions": {},
  "parameters": {
    "count": {
      "type": "integer",
      "minimum": 1,
      "maximum": 30
    },
    "depthMm": {
      "type": "number",
      "minimum": 0.5,
      "maximum": 100
    },
    "spacingMm": {
      "type": "number",
      "minimum": 1,
      "maximum": 200
    },
    "firstOffsetMm": {
      "type": "number",
      "minimum": 0.1,
      "maximum": 2000
    },
    "direction": {
      "enum": [
        "left",
        "right"
      ]
    }
  }
}
```

## 実行例 1

3本×深さ10mm×2の60mmを追加し、折り線と折る方向を記録。

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
  "type": "CREATE_PLEATS",
  "comment": "直線プリーツを展開",
  "count": 3,
  "depthMm": 10,
  "spacingMm": 60,
  "firstOffsetMm": 40,
  "direction": "left",
  "id": "example-create-pleats",
  "refs": {
    "piece": "piece-15faf673bcaf8fc7"
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/5](before-panel-1.md) · [データ 2/5](before-panel-2.md) · [データ 3/5](before-panel-3.md) · [データ 4/5](before-panel-4.md) · [データ 5/5](before-panel-5.md) · [SVG](before-panel.svg)
- 実行後: [データ 1/5](after-CREATE_PLEATS-1-1.md) · [データ 2/5](after-CREATE_PLEATS-1-2.md) · [データ 3/5](after-CREATE_PLEATS-1-3.md) · [データ 4/5](after-CREATE_PLEATS-1-4.md) · [データ 5/5](after-CREATE_PLEATS-1-5.md) · [SVG](after-CREATE_PLEATS-1.svg)

[完全なJSON教材](../tools/CREATE_PLEATS.json) · [操作索引](../README.md)
