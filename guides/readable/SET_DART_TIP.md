# SET_DART_TIP — ダーツの縫い止まりを設定

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

## 操作契約

```json
{
  "label": "ダーツの縫い止まりを設定",
  "requiredParameters": [
    "setbackMm"
  ],
  "limitation": "展開中心と輪郭は維持し、開口の中点方向への距離で縫い止まりだけを設定。",
  "requiredRefs": [
    "piece",
    "dart"
  ],
  "positions": {},
  "parameters": {
    "setbackMm": {
      "type": "number",
      "minimum": 0,
      "maximum": 100
    }
  }
}
```

## 実行例 1

展開中心・輪郭を維持し、縫い止まりだけを開口側へ20mm戻す。

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
  "type": "SET_DART_TIP",
  "comment": "ダーツの縫い止まりを設定",
  "setbackMm": 20,
  "id": "example-set-dart-tip",
  "refs": {
    "piece": "piece-48479248319cb11a",
    "dart": "feature-fc21fad297fd8cd8"
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/5](before-dart-1.md) · [データ 2/5](before-dart-2.md) · [データ 3/5](before-dart-3.md) · [データ 4/5](before-dart-4.md) · [データ 5/5](before-dart-5.md) · [SVG](before-dart.svg)
- 実行後: [データ 1/5](after-SET_DART_TIP-1-1.md) · [データ 2/5](after-SET_DART_TIP-1-2.md) · [データ 3/5](after-SET_DART_TIP-1-3.md) · [データ 4/5](after-SET_DART_TIP-1-4.md) · [データ 5/5](after-SET_DART_TIP-1-5.md) · [SVG](after-SET_DART_TIP-1.svg)

[完全なJSON教材](../tools/SET_DART_TIP.json) · [操作索引](../README.md)
