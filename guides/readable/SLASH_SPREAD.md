# SLASH_SPREAD — 切り開いて展開

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

## 操作契約

```json
{
  "requiredRefs": [
    "piece",
    "pivotEdge",
    "cutEdge"
  ],
  "positions": {
    "pivotDistanceMm": {
      "required": false,
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
    "distanceMm": {
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
    "angleDeg": {
      "type": "number",
      "minimum": -60,
      "maximum": 60,
      "description": "外向きのみ。絶対値0.01以上。輪郭の向きに依存します"
    }
  }
}
```

## 実行例 1

指定支点を固定して外向きに10度開く。輪郭方向により角度の符号が変わる。

見本: base

### 準備手順

```json
[]
```

### 実行命令

```json
{
  "type": "SLASH_SPREAD",
  "angleDeg": -10,
  "id": "example-slash-spread",
  "refs": {
    "piece": "piece-a525f9ffe76e2ded",
    "pivotEdge": "edge-71d188b2f5d3c3f6",
    "cutEdge": "edge-69fada447be4eeaa"
  },
  "positions": {
    "pivotDistanceMm": {
      "basis": "arc_length_from_start",
      "unit": "mm",
      "value": 0
    },
    "distanceMm": {
      "basis": "arc_length_from_start",
      "unit": "mm",
      "value": 100
    }
  }
}
```

### 実行前後の確認

- 実行前: [データ 1/4](before-base-1.md) · [データ 2/4](before-base-2.md) · [データ 3/4](before-base-3.md) · [データ 4/4](before-base-4.md) · [SVG](before-base.svg)
- 実行後: [データ 1/5](after-SLASH_SPREAD-1-1.md) · [データ 2/5](after-SLASH_SPREAD-1-2.md) · [データ 3/5](after-SLASH_SPREAD-1-3.md) · [データ 4/5](after-SLASH_SPREAD-1-4.md) · [データ 5/5](after-SLASH_SPREAD-1-5.md) · [SVG](after-SLASH_SPREAD-1.svg)

[完全なJSON教材](../tools/SLASH_SPREAD.json) · [操作索引](../README.md)
