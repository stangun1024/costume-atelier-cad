# REMOVE_ASSEMBLY_RELATION — 取付位置と重なりを解除

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

## 操作契約

```json
{
  "label": "取付位置と重なりを解除",
  "requiredParameters": [],
  "limitation": "",
  "requiredRefs": [
    "piece",
    "relation"
  ],
  "positions": {},
  "parameters": {}
}
```

## 実行例 1

全体の重なり関係を解除。型紙と縫合は保持。

見本: overlaid-panels

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
    "id": "sample-other-panel",
    "type": "CREATE_RECTANGLE",
    "widthMm": 300,
    "heightMm": 400,
    "name": "相手の見本パネル",
    "quantity": 1,
    "refs": {
      "piece": "piece-e5e370c65b8097d8"
    }
  },
  {
    "id": "sample-overlap",
    "type": "SET_OVERLAP_RELATION",
    "name": "見本の重なり",
    "refs": {
      "piece": "piece-15faf673bcaf8fc7",
      "otherPiece": "piece-61d0bd0381a37f67"
    }
  }
]
```

### 実行命令

```json
{
  "type": "REMOVE_ASSEMBLY_RELATION",
  "comment": "取付位置と重なりを解除",
  "id": "example-remove-assembly-relation",
  "refs": {
    "piece": "piece-15faf673bcaf8fc7",
    "relation": "relation-2fadb7a63b889dc0"
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/5](before-overlaid-panels-1.md) · [データ 2/5](before-overlaid-panels-2.md) · [データ 3/5](before-overlaid-panels-3.md) · [データ 4/5](before-overlaid-panels-4.md) · [データ 5/5](before-overlaid-panels-5.md) · [SVG](before-overlaid-panels.svg)
- 実行後: [データ 1/5](after-REMOVE_ASSEMBLY_RELATION-1-1.md) · [データ 2/5](after-REMOVE_ASSEMBLY_RELATION-1-2.md) · [データ 3/5](after-REMOVE_ASSEMBLY_RELATION-1-3.md) · [データ 4/5](after-REMOVE_ASSEMBLY_RELATION-1-4.md) · [データ 5/5](after-REMOVE_ASSEMBLY_RELATION-1-5.md) · [SVG](after-REMOVE_ASSEMBLY_RELATION-1.svg)

[完全なJSON教材](../tools/REMOVE_ASSEMBLY_RELATION.json) · [操作索引](../README.md)
