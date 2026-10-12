# DISTRIBUTE_DART — ダーツを移動・分配

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

## 操作契約

```json
{
  "label": "ダーツを移動・分配",
  "requiredParameters": [
    "ratio"
  ],
  "limitation": "",
  "requiredRefs": [
    "piece",
    "dart",
    "targetEdge"
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
    "ratio": {
      "type": "number",
      "minimum": 0.001,
      "maximum": 1
    }
  }
}
```

## 実行例 1

ダーツ量の半分を指定辺へ移し、残りを元の位置に残す。

見本: dart

### 準備手順

```json
[
  {
    "id": "sample-dart",
    "type": "ADD_DART",
    "widthMm": 20,
    "depthMm": 80,
    "refs": {
      "piece": "piece-48479248319cb11a",
      "edge": "edge-96fa97ab8363977f"
    },
    "positions": {
      "distanceMm": {
        "basis": "arc_length_from_start",
        "unit": "mm",
        "value": 80
      }
    }
  }
]
```

### 実行命令

```json
{
  "type": "DISTRIBUTE_DART",
  "comment": "ダーツを移動・分配",
  "ratio": 0.5,
  "id": "example-distribute-dart",
  "refs": {
    "piece": "piece-48479248319cb11a",
    "dart": "feature-fc21fad297fd8cd8",
    "targetEdge": "edge-b96527b841baa886"
  },
  "positions": {
    "distanceMm": {
      "basis": "arc_length_from_start",
      "unit": "mm",
      "value": 20
    }
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/5](before-dart-1.md) · [データ 2/5](before-dart-2.md) · [データ 3/5](before-dart-3.md) · [データ 4/5](before-dart-4.md) · [データ 5/5](before-dart-5.md) · [SVG](before-dart.svg)
- 実行後: [データ 1/5](after-DISTRIBUTE_DART-1-1.md) · [データ 2/5](after-DISTRIBUTE_DART-1-2.md) · [データ 3/5](after-DISTRIBUTE_DART-1-3.md) · [データ 4/5](after-DISTRIBUTE_DART-1-4.md) · [データ 5/5](after-DISTRIBUTE_DART-1-5.md) · [SVG](after-DISTRIBUTE_DART-1.svg)

[完全なJSON教材](../tools/DISTRIBUTE_DART.json) · [操作索引](../README.md)
