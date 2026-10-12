# CREATE_FACING — 辺に沿った見返しを作る

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

## 操作契約

```json
{
  "label": "辺に沿った見返しを作る",
  "requiredParameters": [
    "widthMm",
    "side"
  ],
  "limitation": "開いた1辺から一定幅の帯を生成。元のパーツ外周との交点で切り揃える処理は含まない。",
  "requiredRefs": [
    "piece",
    "edge"
  ],
  "positions": {},
  "parameters": {
    "widthMm": {
      "type": "number",
      "minimum": 2,
      "maximum": 100
    },
    "side": {
      "enum": [
        "left",
        "right"
      ]
    }
  }
}
```

## 実行例 1

指定辺の進行方向に対して左側へ幅30mmの見返しを生成。

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
  "type": "CREATE_FACING",
  "comment": "辺に沿った見返しを作る",
  "widthMm": 30,
  "side": "left",
  "id": "example-create-facing",
  "refs": {
    "piece": "piece-15faf673bcaf8fc7",
    "edge": "edge-af08c4eee2012fcc"
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/5](before-panel-1.md) · [データ 2/5](before-panel-2.md) · [データ 3/5](before-panel-3.md) · [データ 4/5](before-panel-4.md) · [データ 5/5](before-panel-5.md) · [SVG](before-panel.svg)
- 実行後: [データ 1/5](after-CREATE_FACING-1-1.md) · [データ 2/5](after-CREATE_FACING-1-2.md) · [データ 3/5](after-CREATE_FACING-1-3.md) · [データ 4/5](after-CREATE_FACING-1-4.md) · [データ 5/5](after-CREATE_FACING-1-5.md) · [SVG](after-CREATE_FACING-1.svg)

[完全なJSON教材](../tools/CREATE_FACING.json) · [操作索引](../README.md)
