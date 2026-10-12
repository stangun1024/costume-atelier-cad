# SET_OVERLAP_RELATION — パーツの重なりを指定

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

## 操作契約

```json
{
  "label": "パーツの重なりを指定",
  "requiredParameters": [
    "name"
  ],
  "limitation": "pieceがotherPieceより表側。個体・表裏・両側の閉じた領域線・開閉状態を指定可能。領域はsourceRegionRef/targetRegionRefを両方指定。省略は全体。可視幅や開閉可能性を自動保証しない。",
  "requiredRefs": [
    "piece",
    "otherPiece"
  ],
  "positions": {},
  "parameters": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 120
    },
    "sourceInstanceId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 120
    },
    "targetInstanceId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 120
    },
    "sourceFace": {
      "enum": [
        "front",
        "back"
      ]
    },
    "targetFace": {
      "enum": [
        "front",
        "back"
      ]
    },
    "sourceRegionRef": {
      "type": "string",
      "minLength": 1,
      "maxLength": 120
    },
    "targetRegionRef": {
      "type": "string",
      "minLength": 1,
      "maxLength": 120
    },
    "state": {
      "enum": [
        "always",
        "open",
        "closed"
      ]
    }
  }
}
```

## 実行例 1

見本パネルを相手のパネルより表側に指定。縫合は別の操作。

見本: panel-pair

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
  }
]
```

### 実行命令

```json
{
  "type": "SET_OVERLAP_RELATION",
  "comment": "パーツの重なりを指定",
  "name": "パネルの表裏の順序",
  "id": "example-set-overlap-relation",
  "refs": {
    "piece": "piece-15faf673bcaf8fc7",
    "otherPiece": "piece-61d0bd0381a37f67"
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/5](before-panel-pair-1.md) · [データ 2/5](before-panel-pair-2.md) · [データ 3/5](before-panel-pair-3.md) · [データ 4/5](before-panel-pair-4.md) · [データ 5/5](before-panel-pair-5.md) · [SVG](before-panel-pair.svg)
- 実行後: [データ 1/5](after-SET_OVERLAP_RELATION-1-1.md) · [データ 2/5](after-SET_OVERLAP_RELATION-1-2.md) · [データ 3/5](after-SET_OVERLAP_RELATION-1-3.md) · [データ 4/5](after-SET_OVERLAP_RELATION-1-4.md) · [データ 5/5](after-SET_OVERLAP_RELATION-1-5.md) · [SVG](after-SET_OVERLAP_RELATION-1.svg)

[完全なJSON教材](../tools/SET_OVERLAP_RELATION.json) · [操作索引](../README.md)
