# REMOVE_PIECE — 不要なパーツを外す

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

## 操作契約

```json
{
  "label": "不要なパーツを外す",
  "requiredParameters": [],
  "limitation": "接続していた縫合と合印の対を解除し、残る相手辺を開いた辺にする。",
  "requiredRefs": [
    "piece"
  ],
  "positions": {},
  "parameters": {}
}
```

## 実行例 1

袖を外し、接続していた縫合・合印の対応を解除。残る相手辺を開いた辺にする。

見本: base

### 準備手順

```json
[]
```

### 実行命令

```json
{
  "type": "REMOVE_PIECE",
  "comment": "不要なパーツを外す",
  "id": "example-remove-piece",
  "refs": {
    "piece": "piece-a525f9ffe76e2ded"
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/4](before-base-1.md) · [データ 2/4](before-base-2.md) · [データ 3/4](before-base-3.md) · [データ 4/4](before-base-4.md) · [SVG](before-base.svg)
- 実行後: [データ 1/3](after-REMOVE_PIECE-1-1.md) · [データ 2/3](after-REMOVE_PIECE-1-2.md) · [データ 3/3](after-REMOVE_PIECE-1-3.md) · [SVG](after-REMOVE_PIECE-1.svg)

## 実行例 2

曲線で分割した小さい側を削除し、残るパーツに外周の切欠きを作る。

見本: curve-split

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
  },
  {
    "id": "sample-curve-split",
    "type": "SPLIT_PIECE",
    "segments": [
      {
        "type": "cubic",
        "control1": {
          "x": 80,
          "y": 300
        },
        "control2": {
          "x": 80,
          "y": 100
        },
        "end": {
          "x": 0,
          "y": 100
        }
      }
    ],
    "refs": {
      "piece": "piece-15faf673bcaf8fc7",
      "startEdge": "edge-27a6c226dec20524",
      "endEdge": "edge-27a6c226dec20524"
    },
    "positions": {
      "startDistanceMm": {
        "basis": "arc_length_from_start",
        "unit": "mm",
        "value": 100
      },
      "endDistanceMm": {
        "basis": "arc_length_from_start",
        "unit": "mm",
        "value": 300
      }
    }
  }
]
```

### 実行命令

```json
{
  "id": "example-remove-cutout",
  "type": "REMOVE_PIECE",
  "refs": {
    "piece": "piece-cb636b71e69d1a03"
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/6](before-curve-split-1.md) · [データ 2/6](before-curve-split-2.md) · [データ 3/6](before-curve-split-3.md) · [データ 4/6](before-curve-split-4.md) · [データ 5/6](before-curve-split-5.md) · [データ 6/6](before-curve-split-6.md) · [SVG](before-curve-split.svg)
- 実行後: [データ 1/5](after-REMOVE_PIECE-2-1.md) · [データ 2/5](after-REMOVE_PIECE-2-2.md) · [データ 3/5](after-REMOVE_PIECE-2-3.md) · [データ 4/5](after-REMOVE_PIECE-2-4.md) · [データ 5/5](after-REMOVE_PIECE-2-5.md) · [SVG](after-REMOVE_PIECE-2.svg)

[完全なJSON教材](../tools/REMOVE_PIECE.json) · [操作索引](../README.md)
