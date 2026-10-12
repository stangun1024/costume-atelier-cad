# CREATE_STAND_COLLAR — 直線型スタンドカラーを作る

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

## 操作契約

```json
{
  "label": "直線型スタンドカラーを作る",
  "requiredParameters": [
    "necklineIds",
    "heightMm",
    "overlapMm",
    "onFold"
  ],
  "limitation": "襟ぐりを後中心→前中心の順に指定。necklineDirectionsは各辺をその順にたどる方向（1=始点→終点、-1=終点→始点）。省略は内蔵原型の未分割の後襟ぐり1・前襟ぐり-1のみ。半身分の直線襟。湾曲・折返し襟は別途設計。",
  "requiredRefs": [
    "piece"
  ],
  "positions": {},
  "parameters": {
    "necklineIds": {
      "type": "array",
      "minItems": 1,
      "maxItems": 8,
      "uniqueItems": true,
      "items": {
        "type": "string",
        "minLength": 1,
        "maxLength": 120
      }
    },
    "necklineDirections": {
      "type": "array",
      "minItems": 1,
      "maxItems": 8,
      "items": {
        "enum": [
          1,
          -1
        ]
      }
    },
    "heightMm": {
      "type": "number",
      "minimum": 5,
      "maximum": 150
    },
    "overlapMm": {
      "type": "number",
      "minimum": 0,
      "maximum": 60
    },
    "onFold": {
      "type": "boolean"
    }
  }
}
```

## 実行例 1

後→前の襟ぐり長から高さ40mm・重なり15mmの直線型の半身襟を生成。

見本: base

### 準備手順

```json
[]
```

### 実行命令

```json
{
  "type": "CREATE_STAND_COLLAR",
  "comment": "直線型スタンドカラーを作る",
  "necklineIds": [
    "edge-b96527b841baa886",
    "edge-4a230df4ae28d870"
  ],
  "heightMm": 40,
  "overlapMm": 15,
  "onFold": true,
  "id": "example-create-stand-collar",
  "refs": {
    "piece": "piece-e5e370c65b8097d8"
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/4](before-base-1.md) · [データ 2/4](before-base-2.md) · [データ 3/4](before-base-3.md) · [データ 4/4](before-base-4.md) · [SVG](before-base.svg)
- 実行後: [データ 1/5](after-CREATE_STAND_COLLAR-1-1.md) · [データ 2/5](after-CREATE_STAND_COLLAR-1-2.md) · [データ 3/5](after-CREATE_STAND_COLLAR-1-3.md) · [データ 4/5](after-CREATE_STAND_COLLAR-1-4.md) · [データ 5/5](after-CREATE_STAND_COLLAR-1-5.md) · [SVG](after-CREATE_STAND_COLLAR-1.svg)

[完全なJSON教材](../tools/CREATE_STAND_COLLAR.json) · [操作索引](../README.md)
