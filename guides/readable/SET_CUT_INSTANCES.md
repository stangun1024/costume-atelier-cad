# SET_CUT_INSTANCES — 裁断個体の左右と向きを設定

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

## 操作契約

```json
{
  "label": "裁断個体の左右と向きを設定",
  "requiredParameters": [
    "instances"
  ],
  "limitation": "裁断枚数を変えず個体を定義。左右は着用者基準。mirroredは型紙座標に対する反転。既存関係が使うIDを削除すると拒否。左右対称裁断は反転あり・なしを同数。",
  "requiredRefs": [
    "piece"
  ],
  "positions": {},
  "parameters": {
    "instances": {
      "type": "array",
      "minItems": 1,
      "maxItems": 20,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "id",
          "name",
          "side",
          "mirrored"
        ],
        "properties": {
          "id": {
            "type": "string",
            "minLength": 1,
            "maxLength": 100
          },
          "name": {
            "type": "string",
            "minLength": 1,
            "maxLength": 120
          },
          "side": {
            "enum": [
              "left",
              "right",
              "center",
              "unspecified"
            ]
          },
          "mirrored": {
            "type": "boolean"
          }
        }
      }
    }
  }
}
```

## 実行例 1

左右対称裁断の二枚に着用者左右と反転を明示。型紙形状は維持し、取付先はこの個体IDで指定する。

見本: opening

### 準備手順

```json
[
  {
    "id": "sample-opening",
    "type": "OPEN_FOLD",
    "refs": {
      "piece": "piece-e5e370c65b8097d8",
      "edge": "edge-05c5dc60097ec0aa"
    }
  }
]
```

### 実行命令

```json
{
  "type": "SET_CUT_INSTANCES",
  "comment": "裁断個体の左右と向きを設定",
  "instances": [
    {
      "id": "right",
      "name": "着用者右の前身頃",
      "side": "right",
      "mirrored": false
    },
    {
      "id": "left",
      "name": "着用者左の前身頃",
      "side": "left",
      "mirrored": true
    }
  ],
  "id": "example-set-cut-instances",
  "refs": {
    "piece": "piece-e5e370c65b8097d8"
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/4](before-opening-1.md) · [データ 2/4](before-opening-2.md) · [データ 3/4](before-opening-3.md) · [データ 4/4](before-opening-4.md) · [SVG](before-opening.svg)
- 実行後: [データ 1/4](after-SET_CUT_INSTANCES-1-1.md) · [データ 2/4](after-SET_CUT_INSTANCES-1-2.md) · [データ 3/4](after-SET_CUT_INSTANCES-1-3.md) · [データ 4/4](after-SET_CUT_INSTANCES-1-4.md) · [SVG](after-SET_CUT_INSTANCES-1.svg)

[完全なJSON教材](../tools/SET_CUT_INSTANCES.json) · [操作索引](../README.md)
