# CREATE_RECTANGLE — 補強布・帯のパーツを作る

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

## 操作契約

```json
{
  "label": "補強布・帯のパーツを作る",
  "requiredParameters": [
    "widthMm",
    "heightMm",
    "name",
    "quantity"
  ],
  "limitation": "",
  "requiredRefs": [
    "piece"
  ],
  "positions": {},
  "parameters": {
    "widthMm": {
      "type": "number",
      "minimum": 2,
      "maximum": 2000
    },
    "heightMm": {
      "type": "number",
      "minimum": 2,
      "maximum": 2000
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 120
    },
    "quantity": {
      "type": "integer",
      "minimum": 1,
      "maximum": 20
    }
  }
}
```

## 実行例 1

元のパーツを維持し、300×400mmの独立パーツを追加。

見本: base

### 準備手順

```json
[]
```

### 実行命令

```json
{
  "type": "CREATE_RECTANGLE",
  "comment": "補強布・帯のパーツを作る",
  "widthMm": 300,
  "heightMm": 400,
  "name": "追加する見本パネル",
  "quantity": 1,
  "id": "example-create-rectangle",
  "refs": {
    "piece": "piece-e5e370c65b8097d8"
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/4](before-base-1.md) · [データ 2/4](before-base-2.md) · [データ 3/4](before-base-3.md) · [データ 4/4](before-base-4.md) · [SVG](before-base.svg)
- 実行後: [データ 1/5](after-CREATE_RECTANGLE-1-1.md) · [データ 2/5](after-CREATE_RECTANGLE-1-2.md) · [データ 3/5](after-CREATE_RECTANGLE-1-3.md) · [データ 4/5](after-CREATE_RECTANGLE-1-4.md) · [データ 5/5](after-CREATE_RECTANGLE-1-5.md) · [SVG](after-CREATE_RECTANGLE-1.svg)

[完全なJSON教材](../tools/CREATE_RECTANGLE.json) · [操作索引](../README.md)
