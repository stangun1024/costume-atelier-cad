# SET_EDGE_ALLOWANCE — 1辺の縫い代を設定・変更

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

## 操作契約

```json
{
  "label": "1辺の縫い代を設定・変更",
  "requiredParameters": [
    "widthMm"
  ],
  "limitation": "直線・曲線の指定した1辺の幅を置き換える。他辺の幅は保持し、未設定なら0mm。加算ではない。わは0mm。ダーツ脚への直接指定は不可、口の両隣は同じ正の幅が必要。複数辺を連動変更する場合は同じ一括操作で実行する。",
  "requiredRefs": [
    "piece",
    "edge"
  ],
  "positions": {},
  "parameters": {
    "widthMm": {
      "type": "number",
      "minimum": 0,
      "maximum": 30
    }
  }
}
```

## 実行例 1

全周10mmから裾だけ20mmへ置換。他の辺は10mmを保持し、加算しない。

見本: allowanced-panel

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
    "id": "sample-allowance",
    "type": "ADD_SEAM_ALLOWANCE",
    "widthMm": 10,
    "refs": {
      "piece": "piece-15faf673bcaf8fc7"
    }
  }
]
```

### 実行命令

```json
{
  "type": "SET_EDGE_ALLOWANCE",
  "comment": "1辺の縫い代を設定・変更",
  "widthMm": 20,
  "id": "example-set-edge-allowance",
  "refs": {
    "piece": "piece-15faf673bcaf8fc7",
    "edge": "edge-e9e503b00926d634"
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/5](before-allowanced-panel-1.md) · [データ 2/5](before-allowanced-panel-2.md) · [データ 3/5](before-allowanced-panel-3.md) · [データ 4/5](before-allowanced-panel-4.md) · [データ 5/5](before-allowanced-panel-5.md) · [SVG](before-allowanced-panel.svg)
- 実行後: [データ 1/5](after-SET_EDGE_ALLOWANCE-1-1.md) · [データ 2/5](after-SET_EDGE_ALLOWANCE-1-2.md) · [データ 3/5](after-SET_EDGE_ALLOWANCE-1-3.md) · [データ 4/5](after-SET_EDGE_ALLOWANCE-1-4.md) · [データ 5/5](after-SET_EDGE_ALLOWANCE-1-5.md) · [SVG](after-SET_EDGE_ALLOWANCE-1.svg)

[完全なJSON教材](../tools/SET_EDGE_ALLOWANCE.json) · [操作索引](../README.md)
