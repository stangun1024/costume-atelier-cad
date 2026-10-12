# TRUE_DART_EDGE — ダーツを閉じた端を整える

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

## 操作契約

```json
{
  "label": "ダーツを閉じた端を整える",
  "requiredParameters": [],
  "limitation": "ダーツ両隣の輪郭を閉鎖時に滑らかにつなぐ。ダーツの裁断用折返し・縫い代は別処理。",
  "requiredRefs": [
    "piece",
    "dart"
  ],
  "positions": {},
  "parameters": {}
}
```

## 実行例 1

ダーツを閉じたときにつながるよう両隣の輪郭を整える。縫い代・裁断用折返しは別。

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
  "type": "TRUE_DART_EDGE",
  "comment": "ダーツを閉じた端を整える",
  "id": "example-true-dart-edge",
  "refs": {
    "piece": "piece-48479248319cb11a",
    "dart": "feature-fc21fad297fd8cd8"
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/5](before-dart-1.md) · [データ 2/5](before-dart-2.md) · [データ 3/5](before-dart-3.md) · [データ 4/5](before-dart-4.md) · [データ 5/5](before-dart-5.md) · [SVG](before-dart.svg)
- 実行後: [データ 1/5](after-TRUE_DART_EDGE-1-1.md) · [データ 2/5](after-TRUE_DART_EDGE-1-2.md) · [データ 3/5](after-TRUE_DART_EDGE-1-3.md) · [データ 4/5](after-TRUE_DART_EDGE-1-4.md) · [データ 5/5](after-TRUE_DART_EDGE-1-5.md) · [SVG](after-TRUE_DART_EDGE-1.svg)

[完全なJSON教材](../tools/TRUE_DART_EDGE.json) · [操作索引](../README.md)
