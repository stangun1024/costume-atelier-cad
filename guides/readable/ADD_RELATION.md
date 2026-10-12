# ADD_RELATION — 縫合を追加

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

## 操作契約

```json
{
  "label": "縫合を追加",
  "requiredParameters": [
    "kind",
    "name",
    "referenceParticipantId",
    "participants"
  ],
  "limitation": "2〜16参加者。外周または内部取付線、全体またはinterval(startMm/endMm)。参加者のinstanceIdで裁断個体、faceで表front/裏backを指定。省略は型紙全体の関係で左右を推定しない。縫い代を除いた有効長を比較。基準はplain。他はplain/ease/gather/stretch、加工量はamountMm。プリーツの部分区間・同一個体の繰り返し縫いは未対応。",
  "requiredRefs": [
    "piece"
  ],
  "positions": {},
  "parameters": {
    "kind": {
      "enum": [
        "sew"
      ]
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 120
    },
    "referenceParticipantId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 120
    },
    "participants": {
      "type": "array",
      "minItems": 2,
      "maxItems": 16,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "id",
          "pieceRef",
          "segments",
          "fit"
        ],
        "properties": {
          "id": {
            "type": "string",
            "minLength": 1,
            "maxLength": 120
          },
          "pieceRef": {
            "type": "string",
            "minLength": 1,
            "maxLength": 120
          },
          "instanceId": {
            "type": "string",
            "minLength": 1,
            "maxLength": 120
          },
          "face": {
            "enum": [
              "front",
              "back"
            ]
          },
          "segments": {
            "type": "array",
            "minItems": 1,
            "maxItems": 32,
            "items": {
              "type": "object",
              "additionalProperties": false,
              "required": [
                "lineRef",
                "range",
                "direction"
              ],
              "properties": {
                "lineRef": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 120
                },
                "range": {
                  "type": "object",
                  "additionalProperties": false,
                  "required": [
                    "mode"
                  ],
                  "properties": {
                    "mode": {
                      "enum": [
                        "whole",
                        "interval"
                      ]
                    },
                    "startMm": {
                      "type": "number",
                      "minimum": 0,
                      "maximum": 20000
                    },
                    "endMm": {
                      "type": "number",
                      "minimum": 0,
                      "maximum": 20000
                    }
                  }
                },
                "direction": {
                  "enum": [
                    "forward",
                    "reverse"
                  ]
                }
              }
            }
          },
          "fit": {
            "type": "object",
            "additionalProperties": false,
            "required": [
              "mode"
            ],
            "properties": {
              "mode": {
                "enum": [
                  "plain",
                  "ease",
                  "gather",
                  "stretch"
                ]
              },
              "amountMm": {
                "type": "number",
                "minimum": 0.001,
                "maximum": 20000
              },
              "intervalAmountsMm": {
                "type": "array",
                "minItems": 1,
                "maxItems": 101,
                "items": {
                  "type": "number",
                  "minimum": 0,
                  "maximum": 20000
                }
              }
            }
          }
        }
      }
    },
    "matchPoints": {
      "type": "array",
      "minItems": 0,
      "maxItems": 100,
      "items": {
        "type": "object",
        "required": [
          "id",
          "positionsMm"
        ],
        "properties": {
          "id": {
            "type": "string",
            "minLength": 1,
            "maxLength": 120
          },
          "positionsMm": {
            "type": "object",
            "additionalProperties": {
              "type": "number",
              "minimum": 0,
              "maximum": 20000
            },
            "properties": {}
          }
        }
      }
    }
  }
}
```

## 実行例 1

独立した二枚の300mmの辺を一つの通常縫合へ登録。配置・層順は別の仕様。

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
  "type": "ADD_RELATION",
  "kind": "sew",
  "name": "見本の縫合",
  "referenceParticipantId": "a",
  "matchPoints": [],
  "participants": [
    {
      "id": "a",
      "pieceRef": "piece-15faf673bcaf8fc7",
      "segments": [
        {
          "lineRef": "edge-af08c4eee2012fcc",
          "range": {
            "mode": "whole"
          },
          "direction": "forward"
        }
      ],
      "fit": {
        "mode": "plain"
      }
    },
    {
      "id": "b",
      "pieceRef": "piece-61d0bd0381a37f67",
      "segments": [
        {
          "lineRef": "edge-415cf46f440d3b37",
          "range": {
            "mode": "whole"
          },
          "direction": "reverse"
        }
      ],
      "fit": {
        "mode": "plain"
      }
    }
  ],
  "id": "example-add-relation",
  "refs": {
    "piece": "piece-15faf673bcaf8fc7"
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/5](before-panel-pair-1.md) · [データ 2/5](before-panel-pair-2.md) · [データ 3/5](before-panel-pair-3.md) · [データ 4/5](before-panel-pair-4.md) · [データ 5/5](before-panel-pair-5.md) · [SVG](before-panel-pair.svg)
- 実行後: [データ 1/5](after-ADD_RELATION-1-1.md) · [データ 2/5](after-ADD_RELATION-1-2.md) · [データ 3/5](after-ADD_RELATION-1-3.md) · [データ 4/5](after-ADD_RELATION-1-4.md) · [データ 5/5](after-ADD_RELATION-1-5.md) · [SVG](after-ADD_RELATION-1.svg)

[完全なJSON教材](../tools/ADD_RELATION.json) · [操作索引](../README.md)
