# MERGE_PIECES — 分割パーツを結合

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

## 操作契約

```json
{
  "label": "分割パーツを結合",
  "requiredParameters": [],
  "limitation": "同じ座標系で分割した2パーツの共通の直線縫合辺を除去して結合。異なる原型の配置合わせは含まない。",
  "requiredRefs": [
    "piece",
    "otherPiece",
    "relation"
  ],
  "positions": {},
  "parameters": {}
}
```

## 実行例 1

同じ座標系の分割パーツを共通の直線縫合で結合。共通辺を除去。

見本: split

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
    "id": "sample-split",
    "type": "SPLIT_PIECE",
    "refs": {
      "piece": "piece-15faf673bcaf8fc7",
      "startEdge": "edge-8fd4165bddef3743",
      "endEdge": "edge-27a6c226dec20524"
    },
    "positions": {
      "startDistanceMm": {
        "basis": "arc_length_from_start",
        "unit": "mm",
        "value": 200
      },
      "endDistanceMm": {
        "basis": "arc_length_from_start",
        "unit": "mm",
        "value": 200
      }
    }
  }
]
```

### 実行命令

```json
{
  "type": "MERGE_PIECES",
  "comment": "分割パーツを結合",
  "id": "example-merge-pieces",
  "refs": {
    "piece": "piece-8839863b38f2a311",
    "otherPiece": "piece-9e2b425d9029dbb9",
    "relation": "relation-461fe9d734900c21"
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/6](before-split-1.md) · [データ 2/6](before-split-2.md) · [データ 3/6](before-split-3.md) · [データ 4/6](before-split-4.md) · [データ 5/6](before-split-5.md) · [データ 6/6](before-split-6.md) · [SVG](before-split.svg)
- 実行後: [データ 1/5](after-MERGE_PIECES-1-1.md) · [データ 2/5](after-MERGE_PIECES-1-2.md) · [データ 3/5](after-MERGE_PIECES-1-3.md) · [データ 4/5](after-MERGE_PIECES-1-4.md) · [データ 5/5](after-MERGE_PIECES-1-5.md) · [SVG](after-MERGE_PIECES-1.svg)

[完全なJSON教材](../tools/MERGE_PIECES.json) · [操作索引](../README.md)
