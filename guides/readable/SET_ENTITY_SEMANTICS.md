# SET_ENTITY_SEMANTICS — 対象の意味を設定

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

## 操作契約

```json
{
  "requiredRefs": [
    "piece",
    "entity"
  ],
  "positions": {},
  "parameters": {
    "semantics": {
      "type": "object",
      "minProperties": 1,
      "additionalProperties": false,
      "properties": {
        "anatomicalRegion": {
          "type": [
            "string",
            "null"
          ],
          "maxLength": 120
        },
        "anatomicalSide": {
          "enum": [
            null,
            "toward_side_seam",
            "toward_center",
            "toward_neckline",
            "wearer_left",
            "wearer_right"
          ]
        }
      }
    },
    "semanticSource": {
      "const": "ai"
    },
    "confidence": {
      "type": [
        "number",
        "null"
      ],
      "minimum": 0,
      "maximum": 1
    }
  }
}
```

## 実行例 1

形状・固定IDを維持してAIの意味付けを記録。SVGだけでは確認できない変更。

見本: base

### 準備手順

```json
[]
```

### 実行命令

```json
{
  "type": "SET_ENTITY_SEMANTICS",
  "refs": {
    "piece": "piece-e5e370c65b8097d8",
    "entity": "edge-4a230df4ae28d870"
  },
  "semantics": {
    "anatomicalRegion": "襟ぐり",
    "anatomicalSide": "toward_neckline"
  },
  "semanticSource": "ai",
  "confidence": 0.8,
  "id": "example-set-entity-semantics"
}
```

### 実行前後の確認

- 実行前: [データ 1/4](before-base-1.md) · [データ 2/4](before-base-2.md) · [データ 3/4](before-base-3.md) · [データ 4/4](before-base-4.md) · [SVG](before-base.svg)
- 実行後: [データ 1/4](after-SET_ENTITY_SEMANTICS-1-1.md) · [データ 2/4](after-SET_ENTITY_SEMANTICS-1-2.md) · [データ 3/4](after-SET_ENTITY_SEMANTICS-1-3.md) · [データ 4/4](after-SET_ENTITY_SEMANTICS-1-4.md) · [SVG](after-SET_ENTITY_SEMANTICS-1.svg)

[完全なJSON教材](../tools/SET_ENTITY_SEMANTICS.json) · [操作索引](../README.md)
