# SET_PIECE_PLACEMENT — パーツの取付位置を指定

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

## 操作契約

```json
{
  "label": "パーツの取付位置を指定",
  "requiredParameters": [
    "name",
    "sourceLineRef",
    "targetLineRef",
    "sourceDistanceMm",
    "targetDistanceMm",
    "offsetMm",
    "rotationDeg"
  ],
  "limitation": "pieceをotherPiece基準へ配置。instanceIdで個体、Faceで表裏、RegionRefで両布の閉じた領域線を指定。stateはalways/open/closed。省略は全体。一つの個体に同じ状態の配置基準は一つ。二次元配置であり、開閉や3Dの物理検証ではない。",
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
    "sourceLineRef": {
      "type": "string",
      "minLength": 1,
      "maxLength": 120
    },
    "targetLineRef": {
      "type": "string",
      "minLength": 1,
      "maxLength": 120
    },
    "sourceDistanceMm": {
      "type": "number",
      "minimum": 0,
      "maximum": 20000
    },
    "targetDistanceMm": {
      "type": "number",
      "minimum": 0,
      "maximum": 20000
    },
    "offsetMm": {
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
    },
    "rotationDeg": {
      "type": "number",
      "minimum": -180,
      "maximum": 180
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

相手の上辺始点を基準にX20mm、Y30mmへ配置。画面上の型紙の並べ方とは別に保存。

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
  "type": "SET_PIECE_PLACEMENT",
  "comment": "パーツの取付位置を指定",
  "name": "見本の取付位置",
  "sourceLineRef": "edge-af08c4eee2012fcc",
  "targetLineRef": "edge-415cf46f440d3b37",
  "sourceDistanceMm": 0,
  "targetDistanceMm": 0,
  "offsetMm": {
    "x": 20,
    "y": 30
  },
  "rotationDeg": 0,
  "id": "example-set-piece-placement",
  "refs": {
    "piece": "piece-15faf673bcaf8fc7",
    "otherPiece": "piece-61d0bd0381a37f67"
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/5](before-panel-pair-1.md) · [データ 2/5](before-panel-pair-2.md) · [データ 3/5](before-panel-pair-3.md) · [データ 4/5](before-panel-pair-4.md) · [データ 5/5](before-panel-pair-5.md) · [SVG](before-panel-pair.svg)
- 実行後: [データ 1/5](after-SET_PIECE_PLACEMENT-1-1.md) · [データ 2/5](after-SET_PIECE_PLACEMENT-1-2.md) · [データ 3/5](after-SET_PIECE_PLACEMENT-1-3.md) · [データ 4/5](after-SET_PIECE_PLACEMENT-1-4.md) · [データ 5/5](after-SET_PIECE_PLACEMENT-1-5.md) · [SVG](after-SET_PIECE_PLACEMENT-1.svg)

[完全なJSON教材](../tools/SET_PIECE_PLACEMENT.json) · [操作索引](../README.md)
