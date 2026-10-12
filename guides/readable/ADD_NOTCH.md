# ADD_NOTCH — 辺に合印を追加

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

## 操作契約

```json
{
  "label": "辺に合印を追加",
  "requiredParameters": [
    "count"
  ],
  "limitation": "",
  "requiredRefs": [
    "piece",
    "edge"
  ],
  "positions": {
    "distanceMm": {
      "required": true,
      "bases": [
        {
          "basis": "arc_length_from_start",
          "unit": "mm"
        },
        {
          "basis": "ratio_from_start",
          "unit": "ratio",
          "minimum": 0,
          "maximum": 1
        }
      ]
    }
  },
  "parameters": {
    "count": {
      "type": "integer",
      "minimum": 1,
      "maximum": 3
    }
  }
}
```

## 実行例 1

上辺の始点から100mmに2本の合印を追加。輪郭は維持。

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
  "type": "ADD_NOTCH",
  "comment": "辺に合印を追加",
  "count": 2,
  "id": "example-add-notch",
  "refs": {
    "piece": "piece-15faf673bcaf8fc7",
    "edge": "edge-af08c4eee2012fcc"
  },
  "positions": {
    "distanceMm": {
      "basis": "arc_length_from_start",
      "unit": "mm",
      "value": 100
    }
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/5](before-panel-1.md) · [データ 2/5](before-panel-2.md) · [データ 3/5](before-panel-3.md) · [データ 4/5](before-panel-4.md) · [データ 5/5](before-panel-5.md) · [SVG](before-panel.svg)
- 実行後: [データ 1/5](after-ADD_NOTCH-1-1.md) · [データ 2/5](after-ADD_NOTCH-1-2.md) · [データ 3/5](after-ADD_NOTCH-1-3.md) · [データ 4/5](after-ADD_NOTCH-1-4.md) · [データ 5/5](after-ADD_NOTCH-1-5.md) · [SVG](after-ADD_NOTCH-1.svg)

[完全なJSON教材](../tools/ADD_NOTCH.json) · [操作索引](../README.md)
