# after-PRINCESS_SEAM-1: 意味付きデータ 2/5

分割JSONです。単独のJSONとして実行せず、全ページを順番に読んでください。

```json
      "pieceId": null,
      "featureId": null
    },
    {
      "id": "relation-d97192faa6fb25c4",
      "kind": "relation",
      "status": "active",
      "createdBy": null,
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "name": "後肩のいせ分18 mm",
      "role": "sewing_relation",
      "semantics": {},
      "pieceId": null,
      "featureId": null
    },
    {
      "id": "relation-6b9db4d4dcbcbc22",
      "kind": "relation",
      "status": "active",
      "createdBy": null,
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "name": "袖下線",
      "role": "sewing_relation",
      "semantics": {},
      "pieceId": null,
      "featureId": null
    },
    {
      "id": "relation-11ac104c33ff128c",
      "kind": "relation",
      "status": "active",
      "createdBy": null,
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "name": "後袖山のいせ量を確認",
      "role": "sewing_relation",
      "semantics": {},
      "pieceId": null,
      "featureId": null
    },
    {
      "id": "relation-31e540a23d43ae06",
      "kind": "relation",
      "status": "active",
      "createdBy": null,
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "name": "前袖山のいせ量を確認",
      "role": "sewing_relation",
      "semantics": {},
      "pieceId": null,
      "featureId": null
    },
    {
      "id": "edge-bdfaf24328f45bd5",
      "kind": "edge",
      "status": "active",
      "createdBy": "sample-dart",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "sourceIds": [
        "edge-96fa97ab8363977f"
      ],
      "rootName": "後身頃・ウエスト線",
      "name": "後身頃・ウエスト線・分割区間 1",
      "semantics": {
        "boundaryRole": "open",
        "anatomicalRegion": "waist",
        "boundarySide": null,
        "anatomicalSide": null,
        "meaningStatus": "engine-defined"
      },
      "role": "open_edge",
      "lengthMm": 70.00000000050932,
      "pieceId": "piece-cce3ce574d4610b5",
      "featureId": null
    },
    {
      "id": "edge-426dd28264e1aab8",
      "kind": "edge",
      "status": "active",
      "createdBy": "sample-dart",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "sourceIds": [
        "edge-96fa97ab8363977f"
      ],
      "rootName": "後身頃・ウエスト線",
      "name": "後身頃・ウエスト線・分割区間 2",
      "semantics": {
        "boundaryRole": "open",
        "anatomicalRegion": "waist",
        "boundarySide": null,
        "anatomicalSide": null,
        "meaningStatus": "engine-defined"
      },
      "role": "open_edge",
      "lengthMm": 119.99999999883585,
      "pieceId": "piece-707d6085cdc96f05",
      "featureId": null
    },
    {
      "id": "feature-fc21fad297fd8cd8",
      "kind": "feature",
      "status": "retired",
      "createdBy": "sample-dart",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "name": "後身頃・ダーツ 1",
      "role": "dart",
      "semantics": {},
      "pieceId": "piece-48479248319cb11a",
      "featureId": null,
      "retiredBy": "example-princess-seam"
    },
    {
      "id": "edge-29d5b17de99fe361",
      "kind": "edge",
      "status": "active",
      "createdBy": "sample-dart",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "name": "後身頃・ダーツ 1・入り側の脚",
      "role": "seam_edge",
      "semantics": {
        "boundaryRole": "sew",
        "anatomicalRegion": null,
        "boundarySide": "incoming",
        "anatomicalSide": null,
        "meaningStatus": "partially-known"
      },
      "lengthMm": 80.62257748302612,
      "pieceId": "piece-cce3ce574d4610b5",
      "featureId": null
    },
    {
      "id": "edge-af8d730602dcb75c",
      "kind": "edge",
      "status": "active",
      "createdBy": "sample-dart",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "name": "後身頃・ダーツ 1・戻り側の脚",
      "role": "seam_edge",
      "semantics": {
        "boundaryRole": "sew",
        "anatomicalRegion": null,
        "boundarySide": "outgoing",
        "anatomicalSide": null,
        "meaningStatus": "partially-known"
      },
      "lengthMm": 80.62257748302612,
      "pieceId": "piece-707d6085cdc96f05",
      "featureId": null
    },
    {
      "id": "relation-c25f8c5aeb379218",
      "kind": "relation",
      "status": "active",
      "createdBy": "sample-dart",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "name": "ダーツの脚",
      "role": "sewing_relation",
      "semantics": {},
      "pieceId": null,
      "featureId": null
    },
    {
      "id": "piece-707d6085cdc96f05",
      "kind": "piece",
      "status": "active",
      "createdBy": "example-princess-seam",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "sourceIds": [
        "piece-48479248319cb11a"
      ],
      "name": "後身頃・分割A",
      "role": "pattern_piece",
      "semantics": {},
      "pieceId": null,
      "featureId": null
    },
    {
      "id": "piece-cce3ce574d4610b5",
      "kind": "piece",
      "status": "active",
      "createdBy": "example-princess-seam",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "sourceIds": [
        "piece-48479248319cb11a"
      ],
      "name": "後身頃・分割B",
      "role": "pattern_piece",
      "semantics": {},
      "pieceId": null,
      "featureId": null
    },
    {
      "id": "edge-684228b69c368802",
      "kind": "edge",
      "status": "active",
      "createdBy": "example-princess-seam",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "sourceIds": [
        "edge-b96527b841baa886"
      ],
      "rootName": "後身頃・襟ぐり",
      "name": "後身頃・襟ぐり・分割区間 1",
      "semantics": {
        "boundaryRole": "open",
        "anatomicalRegion": "neckline",
        "boundarySide": null,
        "anatomicalSide": null,
        "meaningStatus": "engine-defined"
      },
      "role": "open_edge",
      "lengthMm": 20.000000558215397,
      "pieceId": "piece-707d6085cdc96f05",
      "featureId": null
    },
    {
      "id": "edge-742c4a818e1dc6d3",
      "kind": "edge",
      "status": "active",
      "createdBy": "example-princess-seam",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "sourceIds": [
        "edge-b96527b841baa886"
      ],
      "rootName": "後身頃・襟ぐり",
      "name": "後身頃・襟ぐり・分割区間 2",
      "semantics": {
        "boundaryRole": "open",
        "anatomicalRegion": "neckline",
        "boundarySide": null,
        "anatomicalSide": null,
        "meaningStatus": "engine-defined"
      },
      "role": "open_edge",
      "lengthMm": 58.39997112875948,
      "pieceId": "piece-cce3ce574d4610b5",
      "featureId": null
    },
    {
      "id": "edge-ebfdd9ee93ddc01a",
      "kind": "edge",
      "status": "active",
      "createdBy": "example-princess-seam",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "name": "後身頃・分割A・分割線（縫合）",
      "role": "seam_edge",
      "semantics": {
        "boundaryRole": "sew",
        "anatomicalRegion": null,
        "boundarySide": null,
        "anatomicalSide": null,
        "meaningStatus": "engine-defined"
      },
      "lengthMm": 315.3521676510696,
      "pieceId": "piece-707d6085cdc96f05",
      "featureId": null
    },
    {
      "id": "edge-a0bceaf7ae6a4453",
      "kind": "edge",
      "status": "active",
      "createdBy": "example-princess-seam",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "name": "後身頃・分割B・分割線（縫合）",
      "role": "seam_edge",
      "semantics": {
        "boundaryRole": "sew",
        "anatomicalRegion": null,
        "boundarySide": null,
        "anatomicalSide": null,
        "meaningStatus": "engine-defined"
      },
      "lengthMm": 315.3521676510696,
      "pieceId": "piece-cce3ce574d4610b5",
      "featureId": null
    },
    {
      "id": "relation-4081f9dd0a1fcfd3",
      "kind": "relation",
      "status": "active",
      "createdBy": "example-princess-seam",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "name": "後身頃の分割線",
      "role": "sewing_relation",
      "semantics": {},
      "pieceId": null,
      "featureId": null
    }
  ],
  "pieces": [
    {
      "id": "piece-e5e370c65b8097d8",
      "name": "前身頃",
      "cut": {
        "quantity": 1,
        "onFold": true,
        "mirroredPair": false,
        "seamAllowance": 0
      },
      "instances": [
        {
          "id": "copy-1",
          "name": "前身頃・裁断1",
          "side": "unspecified",
          "mirrored": false
        }
      ],
      "drafting": {
        "coordinateSpace": "piece-local",
        "source": "method",
        "methodId": "bunka-old",
        "methodVersion": "0.1.0",
        "curvePolicy": "guide-point-cubic-v1",
        "sewingTipStatus": "not-designed"
      },
      "construction": null,
      "landmarks": {
        "neckCenter": {
          "x": 0,
          "y": 80
        },
        "neckSide": {
          "x": 68,
          "y": 5
        },
        "shoulder": {
          "x": 182.33661440459792,
          "y": 46.666666666666664
        },
        "armholeMid": {
          "x": 166.66666666666666,
          "y": 126.66666666666666
        },
        "armholeGuide": {
          "x": 183.75508054534157,
          "y": 189.57825278799174
        },
        "underarm": {
          "x": 230,
          "y": 206.66666666666666
        },
        "sideWaist": {
          "x": 250,
          "y": 375
        },
        "centerWaist": {
          "x": 0,
          "y": 409
        }
      },
      "grainline": [
        {
          "type": "line",
          "points": [
            {
              "x": 45,
              "y": 231.66666666666666
            },
            {
              "x": 45,
              "y": 350
            }
          ]
        }
      ],
      "guides": [
        {
          "name": "バスト線",
          "kind": "construction",
          "geometry": [
            {
              "type": "line",
              "points": [
                {
                  "x": 0,
                  "y": 206.66666666666666
                },
                {
                  "x": 230,
                  "y": 206.66666666666666
                }
              ]
            }
          ]
        },
        {
          "name": "胸幅線",
          "kind": "construction",
          "geometry": [
            {
              "type": "line",
              "points": [
                {
                  "x": 166.66666666666666,
                  "y": 46.666666666666664
                },
                {
                  "x": 166.66666666666666,
                  "y": 206.66666666666666
                }
              ]
            }
          ]
        },
        {
```

[1/5](after-PRINCESS_SEAM-1-1.md) · [2/5](after-PRINCESS_SEAM-1-2.md) · [3/5](after-PRINCESS_SEAM-1-3.md) · [4/5](after-PRINCESS_SEAM-1-4.md) · [5/5](after-PRINCESS_SEAM-1-5.md)
