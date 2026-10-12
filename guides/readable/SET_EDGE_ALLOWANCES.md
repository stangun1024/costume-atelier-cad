# SET_EDGE_ALLOWANCES — 辺別の縫い代を設定

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

## 操作契約

```json
{
  "label": "辺別の縫い代を設定",
  "requiredParameters": [
    "widths"
  ],
  "limitation": "直線・曲線の全辺の固定IDを1度ずつ指定し、わの辺は0mm。単一ダーツは口の両隣と両脚を同じ正の幅にする。形状の自己交差・つぶれは拒否。",
  "requiredRefs": [
    "piece"
  ],
  "positions": {},
  "parameters": {
    "widths": {
      "type": "array",
      "minItems": 1,
      "maxItems": 100,
      "items": {
        "type": "object",
        "required": [
          "edgeId",
          "widthMm"
        ],
        "additionalProperties": false,
        "properties": {
          "edgeId": {
            "type": "string",
            "minLength": 1,
            "maxLength": 120
          },
          "widthMm": {
            "type": "number",
            "minimum": 0,
            "maximum": 30
          }
        }
      }
    }
  }
}
```

## 実行例 1

全辺の固定IDごとに縫い代10mmを設定。この見本は直線で、曲線の辺も指定可能。縫い線は維持。

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
  "type": "SET_EDGE_ALLOWANCES",
  "comment": "辺別の縫い代を設定",
  "widths": [
    {
      "edgeId": "edge-af08c4eee2012fcc",
      "widthMm": 10
    },
    {
      "edgeId": "edge-8fd4165bddef3743",
      "widthMm": 10
    },
    {
      "edgeId": "edge-e9e503b00926d634",
      "widthMm": 10
    },
    {
      "edgeId": "edge-27a6c226dec20524",
      "widthMm": 10
    }
  ],
  "id": "example-set-edge-allowances",
  "refs": {
    "piece": "piece-15faf673bcaf8fc7"
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/5](before-panel-1.md) · [データ 2/5](before-panel-2.md) · [データ 3/5](before-panel-3.md) · [データ 4/5](before-panel-4.md) · [データ 5/5](before-panel-5.md) · [SVG](before-panel.svg)
- 実行後: [データ 1/5](after-SET_EDGE_ALLOWANCES-1-1.md) · [データ 2/5](after-SET_EDGE_ALLOWANCES-1-2.md) · [データ 3/5](after-SET_EDGE_ALLOWANCES-1-3.md) · [データ 4/5](after-SET_EDGE_ALLOWANCES-1-4.md) · [データ 5/5](after-SET_EDGE_ALLOWANCES-1-5.md) · [SVG](after-SET_EDGE_ALLOWANCES-1.svg)

[完全なJSON教材](../tools/SET_EDGE_ALLOWANCES.json) · [操作索引](../README.md)
