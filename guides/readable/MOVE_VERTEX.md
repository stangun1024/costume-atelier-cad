# MOVE_VERTEX — 輪郭の端点を移動

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

## 操作契約

```json
{
  "label": "輪郭の端点を移動",
  "requiredParameters": [
    "endpoint",
    "offset"
  ],
  "limitation": "",
  "requiredRefs": [
    "piece",
    "edge"
  ],
  "positions": {},
  "parameters": {
    "endpoint": {
      "enum": [
        "start",
        "end"
      ]
    },
    "offset": {
      "type": "object",
      "required": [
        "x",
        "y"
      ],
      "additionalProperties": false,
      "properties": {
        "x": {
          "type": "number",
          "minimum": -10000,
          "maximum": 10000
        },
        "y": {
          "type": "number",
          "minimum": -10000,
          "maximum": 10000
        }
      }
    }
  }
}
```

## 実行例 1

端点を右20mm・下10mm移動し、接続する辺も更新。

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
  "type": "MOVE_VERTEX",
  "comment": "輪郭の端点を移動",
  "endpoint": "start",
  "offset": {
    "x": 20,
    "y": 10
  },
  "id": "example-move-vertex",
  "refs": {
    "piece": "piece-15faf673bcaf8fc7",
    "edge": "edge-e9e503b00926d634"
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/5](before-panel-1.md) · [データ 2/5](before-panel-2.md) · [データ 3/5](before-panel-3.md) · [データ 4/5](before-panel-4.md) · [データ 5/5](before-panel-5.md) · [SVG](before-panel.svg)
- 実行後: [データ 1/5](after-MOVE_VERTEX-1-1.md) · [データ 2/5](after-MOVE_VERTEX-1-2.md) · [データ 3/5](after-MOVE_VERTEX-1-3.md) · [データ 4/5](after-MOVE_VERTEX-1-4.md) · [データ 5/5](after-MOVE_VERTEX-1-5.md) · [SVG](after-MOVE_VERTEX-1.svg)

[完全なJSON教材](../tools/MOVE_VERTEX.json) · [操作索引](../README.md)
