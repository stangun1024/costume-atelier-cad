# RESHAPE — 輪郭のカーブを変更

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

## 操作契約

```json
{
  "requiredRefs": [
    "piece",
    "edge"
  ],
  "positions": {},
  "parameters": {
    "control1Offset": {
      "type": "object",
      "required": [
        "x",
        "y"
      ],
      "additionalProperties": false,
      "properties": {
        "x": {
          "type": "number"
        },
        "y": {
          "type": "number"
        }
      }
    },
    "control2Offset": {
      "type": "object",
      "required": [
        "x",
        "y"
      ],
      "additionalProperties": false,
      "properties": {
        "x": {
          "type": "number"
        },
        "y": {
          "type": "number"
        }
      }
    }
  }
}
```

## 実行例 1

端点を維持し、制御点の指定で袖口のカーブを変更。

見本: base

### 準備手順

```json
[]
```

### 実行命令

```json
{
  "type": "RESHAPE",
  "control1Offset": {
    "x": -100,
    "y": 35
  },
  "control2Offset": {
    "x": 100,
    "y": 35
  },
  "id": "example-reshape",
  "refs": {
    "piece": "piece-a525f9ffe76e2ded",
    "edge": "edge-69fada447be4eeaa"
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/4](before-base-1.md) · [データ 2/4](before-base-2.md) · [データ 3/4](before-base-3.md) · [データ 4/4](before-base-4.md) · [SVG](before-base.svg)
- 実行後: [データ 1/4](after-RESHAPE-1-1.md) · [データ 2/4](after-RESHAPE-1-2.md) · [データ 3/4](after-RESHAPE-1-3.md) · [データ 4/4](after-RESHAPE-1-4.md) · [SVG](after-RESHAPE-1.svg)

[完全なJSON教材](../tools/RESHAPE.json) · [操作索引](../README.md)
