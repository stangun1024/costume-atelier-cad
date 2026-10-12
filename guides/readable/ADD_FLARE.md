# ADD_FLARE — 袖口にフレアを追加

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

## 操作契約

```json
{
  "requiredRefs": [
    "piece"
  ],
  "positions": {},
  "parameters": {
    "amountMm": {
      "type": "number",
      "minimum": 0.1,
      "maximum": 300
    }
  }
}
```

## 実行例 1

袖口を展開して分量を追加。袖山と身体採寸を維持。

見本: base

### 準備手順

```json
[]
```

### 実行命令

```json
{
  "type": "ADD_FLARE",
  "amountMm": 80,
  "id": "example-add-flare",
  "refs": {
    "piece": "piece-a525f9ffe76e2ded"
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/4](before-base-1.md) · [データ 2/4](before-base-2.md) · [データ 3/4](before-base-3.md) · [データ 4/4](before-base-4.md) · [SVG](before-base.svg)
- 実行後: [データ 1/5](after-ADD_FLARE-1-1.md) · [データ 2/5](after-ADD_FLARE-1-2.md) · [データ 3/5](after-ADD_FLARE-1-3.md) · [データ 4/5](after-ADD_FLARE-1-4.md) · [データ 5/5](after-ADD_FLARE-1-5.md) · [SVG](after-ADD_FLARE-1.svg)

[完全なJSON教材](../tools/ADD_FLARE.json) · [操作索引](../README.md)
