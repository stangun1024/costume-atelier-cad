# RENAME_ENTITY — 対象の名前を変更

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
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 120
    },
    "nameSource": {
      "const": "ai"
    }
  }
}
```

## 実行例 1

固定IDと形状を維持して名称と命名者情報を変更。SVGの輪郭は変わらない。

見本: base

### 準備手順

```json
[]
```

### 実行命令

```json
{
  "type": "RENAME_ENTITY",
  "refs": {
    "piece": "piece-e5e370c65b8097d8",
    "entity": "edge-4a230df4ae28d870"
  },
  "name": "見本の襟ぐり",
  "nameSource": "ai",
  "id": "example-rename-entity"
}
```

### 実行前後の確認

- 実行前: [データ 1/4](before-base-1.md) · [データ 2/4](before-base-2.md) · [データ 3/4](before-base-3.md) · [データ 4/4](before-base-4.md) · [SVG](before-base.svg)
- 実行後: [データ 1/4](after-RENAME_ENTITY-1-1.md) · [データ 2/4](after-RENAME_ENTITY-1-2.md) · [データ 3/4](after-RENAME_ENTITY-1-3.md) · [データ 4/4](after-RENAME_ENTITY-1-4.md) · [SVG](after-RENAME_ENTITY-1.svg)

[完全なJSON教材](../tools/RENAME_ENTITY.json) · [操作索引](../README.md)
