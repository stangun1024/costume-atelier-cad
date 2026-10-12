# OPEN_FOLD — わを左右の開きへ変更

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

## 操作契約

```json
{
  "label": "わを左右の開きへ変更",
  "requiredParameters": [],
  "limitation": "左右対称の2枚裁断へ変更。重なり・比翼は別途作成。",
  "requiredRefs": [
    "piece",
    "edge"
  ],
  "positions": {},
  "parameters": {}
}
```

## 実行例 1

輪郭・固定IDを維持し、わの1枚裁断を左右対称の2枚裁断へ変更。

見本: base

### 準備手順

```json
[]
```

### 実行命令

```json
{
  "type": "OPEN_FOLD",
  "comment": "わを左右の開きへ変更",
  "id": "example-open-fold",
  "refs": {
    "piece": "piece-e5e370c65b8097d8",
    "edge": "edge-05c5dc60097ec0aa"
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/4](before-base-1.md) · [データ 2/4](before-base-2.md) · [データ 3/4](before-base-3.md) · [データ 4/4](before-base-4.md) · [SVG](before-base.svg)
- 実行後: [データ 1/4](after-OPEN_FOLD-1-1.md) · [データ 2/4](after-OPEN_FOLD-1-2.md) · [データ 3/4](after-OPEN_FOLD-1-3.md) · [データ 4/4](after-OPEN_FOLD-1-4.md) · [SVG](after-OPEN_FOLD-1.svg)

[完全なJSON教材](../tools/OPEN_FOLD.json) · [操作索引](../README.md)
