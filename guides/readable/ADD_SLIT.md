# ADD_SLIT — 縫合に開きを追加

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

## 操作契約

```json
{
  "requiredRefs": [
    "piece",
    "relation"
  ],
  "positions": {},
  "parameters": {
    "lengthMm": {
      "type": "number",
      "minimum": 0.1,
      "maximum": 300
    },
    "from": {
      "enum": [
        "start",
        "end"
      ]
    }
  }
}
```

## 実行例 1

縫合の終端から60mmを開きにし、対応する両辺の縫合範囲を更新。

見本: base

### 準備手順

```json
[]
```

### 実行命令

```json
{
  "type": "ADD_SLIT",
  "lengthMm": 60,
  "from": "end",
  "id": "example-add-slit",
  "refs": {
    "piece": "piece-a525f9ffe76e2ded",
    "relation": "relation-6b9db4d4dcbcbc22"
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/4](before-base-1.md) · [データ 2/4](before-base-2.md) · [データ 3/4](before-base-3.md) · [データ 4/4](before-base-4.md) · [SVG](before-base.svg)
- 実行後: [データ 1/5](after-ADD_SLIT-1-1.md) · [データ 2/5](after-ADD_SLIT-1-2.md) · [データ 3/5](after-ADD_SLIT-1-3.md) · [データ 4/5](after-ADD_SLIT-1-4.md) · [データ 5/5](after-ADD_SLIT-1-5.md) · [SVG](after-ADD_SLIT-1.svg)

[完全なJSON教材](../tools/ADD_SLIT.json) · [操作索引](../README.md)
