# SPLIT_PIECE — 線でパーツを分割

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

## 操作契約

```json
{
  "requiredRefs": [
    "piece",
    "startEdge",
    "endEdge"
  ],
  "positions": {
    "startDistanceMm": {
      "required": true,
      "bases": [
        {
          "basis": "arc_length_from_start",
          "unit": "mm"
        },
        {
          "basis": "ratio_from_start",
          "unit": "ratio",
          "minimum": 0,
          "maximum": 1
        }
      ]
    },
    "endDistanceMm": {
      "required": true,
      "bases": [
        {
          "basis": "arc_length_from_start",
          "unit": "mm"
        },
        {
          "basis": "ratio_from_start",
          "unit": "ratio",
          "minimum": 0,
          "maximum": 1
        }
      ]
    }
  },
  "parameters": {
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
    }
  }
}
```

## 実行例 1

指定した2点の直線で分割し、切替の縫合関係を作る。

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
  "type": "SPLIT_PIECE",
  "id": "example-split-piece",
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
```

### 実行前後の確認

- 実行前: [データ 1/5](before-panel-1.md) · [データ 2/5](before-panel-2.md) · [データ 3/5](before-panel-3.md) · [データ 4/5](before-panel-4.md) · [データ 5/5](before-panel-5.md) · [SVG](before-panel.svg)
- 実行後: [データ 1/6](after-SPLIT_PIECE-1-1.md) · [データ 2/6](after-SPLIT_PIECE-1-2.md) · [データ 3/6](after-SPLIT_PIECE-1-3.md) · [データ 4/6](after-SPLIT_PIECE-1-4.md) · [データ 5/6](after-SPLIT_PIECE-1-5.md) · [データ 6/6](after-SPLIT_PIECE-1-6.md) · [SVG](after-SPLIT_PIECE-1.svg)

## 実行例 2

外周の同じ辺の2点を曲線で結び、2パーツへ分割。

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
  "id": "example-curved-split",
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
```

### 実行前後の確認

- 実行前: [データ 1/5](before-panel-1.md) · [データ 2/5](before-panel-2.md) · [データ 3/5](before-panel-3.md) · [データ 4/5](before-panel-4.md) · [データ 5/5](before-panel-5.md) · [SVG](before-panel.svg)
- 実行後: [データ 1/6](after-SPLIT_PIECE-2-1.md) · [データ 2/6](after-SPLIT_PIECE-2-2.md) · [データ 3/6](after-SPLIT_PIECE-2-3.md) · [データ 4/6](after-SPLIT_PIECE-2-4.md) · [データ 5/6](after-SPLIT_PIECE-2-5.md) · [データ 6/6](after-SPLIT_PIECE-2-6.md) · [SVG](after-SPLIT_PIECE-2.svg)

[完全なJSON教材](../tools/SPLIT_PIECE.json) · [操作索引](../README.md)
