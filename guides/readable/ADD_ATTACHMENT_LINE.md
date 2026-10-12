# ADD_ATTACHMENT_LINE — 内部の線を描く

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

## 操作契約

```json
{
  "label": "内部の線を描く",
  "requiredParameters": [
    "name",
    "start",
    "end"
  ],
  "limitation": "局所座標mmの直線・ベジェ曲線。closed:trueはstart=end。region/interfacingは閉じた範囲。buttonholeは直線の長さとwidthMmで寸法を指定。openingは外周から独立した実際の閉じた穴で、allowanceMmは穴の内側に残す縫い代（省略0）。cut-guideは穴にしない。instanceId/faceで個体・表裏を指定できるがopeningは型紙全体のみ。位置は自動追従しない。編集・削除は生成操作の置換・削除。",
  "requiredRefs": [
    "piece"
  ],
  "positions": {},
  "parameters": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 120
    },
    "start": {
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
    "end": {
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
    "purpose": {
      "enum": [
        "attachment",
        "cut-guide",
        "fold",
        "construction",
        "region",
        "interfacing",
        "buttonhole",
        "opening"
      ]
    },
    "segments": {
      "type": "array",
      "minItems": 1,
      "maxItems": 64,
      "items": {
        "type": "object",
        "required": [
          "type",
          "end"
        ],
        "additionalProperties": false,
        "properties": {
          "type": {
            "enum": [
              "line",
              "cubic"
            ]
          },
          "end": {
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
          "control1": {
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
          "control2": {
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
          }
        }
      }
    },
    "closed": {
      "type": "boolean"
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
    "widthMm": {
      "type": "number",
      "minimum": 0.1,
      "maximum": 10
    },
    "allowanceMm": {
      "type": "number",
      "minimum": 0,
      "maximum": 30
    }
  }
}
```

## 実行例 1

外周を変えず、パネル内部に260mmの取付線を生成。

見本: panel

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
  }
]
```

### 実行命令

```json
{
  "type": "ADD_ATTACHMENT_LINE",
  "comment": "内部の線を描く",
  "name": "ポケット取付線",
  "start": {
    "x": 20,
    "y": 50
  },
  "end": {
    "x": 280,
    "y": 50
  },
  "purpose": "attachment",
  "closed": false,
  "id": "example-add-attachment-line",
  "refs": {
    "piece": "piece-15faf673bcaf8fc7"
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/5](before-panel-1.md) · [データ 2/5](before-panel-2.md) · [データ 3/5](before-panel-3.md) · [データ 4/5](before-panel-4.md) · [データ 5/5](before-panel-5.md) · [SVG](before-panel.svg)
- 実行後: [データ 1/5](after-ADD_ATTACHMENT_LINE-1-1.md) · [データ 2/5](after-ADD_ATTACHMENT_LINE-1-2.md) · [データ 3/5](after-ADD_ATTACHMENT_LINE-1-3.md) · [データ 4/5](after-ADD_ATTACHMENT_LINE-1-4.md) · [データ 5/5](after-ADD_ATTACHMENT_LINE-1-5.md) · [SVG](after-ADD_ATTACHMENT_LINE-1.svg)

## 実行例 2

滑らかな曲線を裁断ガイドとして出力。外周は維持し、穴や切欠きにはしない。

見本: panel

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
  }
]
```

### 実行命令

```json
{
  "id": "example-curved-guide",
  "type": "ADD_ATTACHMENT_LINE",
  "name": "曲線の裁断ガイド",
  "purpose": "cut-guide",
  "start": {
    "x": 0,
    "y": 300
  },
  "end": {
    "x": 0,
    "y": 100
  },
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
    "piece": "piece-15faf673bcaf8fc7"
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/5](before-panel-1.md) · [データ 2/5](before-panel-2.md) · [データ 3/5](before-panel-3.md) · [データ 4/5](before-panel-4.md) · [データ 5/5](before-panel-5.md) · [SVG](before-panel.svg)
- 実行後: [データ 1/5](after-ADD_ATTACHMENT_LINE-2-1.md) · [データ 2/5](after-ADD_ATTACHMENT_LINE-2-2.md) · [データ 3/5](after-ADD_ATTACHMENT_LINE-2-3.md) · [データ 4/5](after-ADD_ATTACHMENT_LINE-2-4.md) · [データ 5/5](after-ADD_ATTACHMENT_LINE-2-5.md) · [SVG](after-ADD_ATTACHMENT_LINE-2.svg)

## 実行例 3

閉じた曲線ガイドを保存・出力。独立した内部穴の生成ではない。

見本: panel

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
  }
]
```

### 実行命令

```json
{
  "id": "example-closed-guide",
  "type": "ADD_ATTACHMENT_LINE",
  "name": "閉じた裁断ガイド",
  "purpose": "cut-guide",
  "closed": true,
  "start": {
    "x": 150,
    "y": 100
  },
  "end": {
    "x": 150,
    "y": 100
  },
  "segments": [
    {
      "type": "cubic",
      "control1": {
        "x": 230,
        "y": 100
      },
      "control2": {
        "x": 230,
        "y": 300
      },
      "end": {
        "x": 150,
        "y": 300
      }
    },
    {
      "type": "cubic",
      "control1": {
        "x": 70,
        "y": 300
      },
      "control2": {
        "x": 70,
        "y": 100
      },
      "end": {
        "x": 150,
        "y": 100
      }
    }
  ],
  "refs": {
    "piece": "piece-15faf673bcaf8fc7"
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/5](before-panel-1.md) · [データ 2/5](before-panel-2.md) · [データ 3/5](before-panel-3.md) · [データ 4/5](before-panel-4.md) · [データ 5/5](before-panel-5.md) · [SVG](before-panel.svg)
- 実行後: [データ 1/5](after-ADD_ATTACHMENT_LINE-3-1.md) · [データ 2/5](after-ADD_ATTACHMENT_LINE-3-2.md) · [データ 3/5](after-ADD_ATTACHMENT_LINE-3-3.md) · [データ 4/5](after-ADD_ATTACHMENT_LINE-3-4.md) · [データ 5/5](after-ADD_ATTACHMENT_LINE-3-5.md) · [SVG](after-ADD_ATTACHMENT_LINE-3.svg)

[完全なJSON教材](../tools/ADD_ATTACHMENT_LINE.json) · [操作索引](../README.md)
