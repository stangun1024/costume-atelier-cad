# after-SPLIT_PIECE-2: 意味付きデータ 2/6

分割JSONです。単独のJSONとして実行せず、全ページを順番に読んでください。

```json
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
      "id": "piece-15faf673bcaf8fc7",
      "kind": "piece",
      "status": "retired",
      "createdBy": "sample-panel",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "name": "見本パネル",
      "role": "pattern_piece",
      "semantics": {},
      "pieceId": null,
      "featureId": null,
      "retiredBy": "example-curved-split"
    },
    {
      "id": "edge-af08c4eee2012fcc",
      "kind": "edge",
      "status": "active",
      "createdBy": "sample-panel",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "name": "見本パネル・分割された辺",
      "role": "open_edge",
      "semantics": {
        "boundaryRole": "open",
        "anatomicalRegion": null,
        "boundarySide": null,
        "anatomicalSide": null,
        "meaningStatus": "engine-defined"
      },
      "lengthMm": 300,
      "pieceId": "piece-3f53bafb869cd945",
      "featureId": null
    },
    {
      "id": "edge-8fd4165bddef3743",
      "kind": "edge",
      "status": "active",
      "createdBy": "sample-panel",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "name": "見本パネル・分割された辺",
      "role": "open_edge",
      "semantics": {
        "boundaryRole": "open",
        "anatomicalRegion": null,
        "boundarySide": null,
        "anatomicalSide": null,
        "meaningStatus": "engine-defined"
      },
      "lengthMm": 400,
      "pieceId": "piece-3f53bafb869cd945",
      "featureId": null
    },
    {
      "id": "edge-e9e503b00926d634",
      "kind": "edge",
      "status": "active",
      "createdBy": "sample-panel",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "name": "見本パネル・分割された辺",
      "role": "open_edge",
      "semantics": {
        "boundaryRole": "open",
        "anatomicalRegion": null,
        "boundarySide": null,
        "anatomicalSide": null,
        "meaningStatus": "engine-defined"
      },
      "lengthMm": 300,
      "pieceId": "piece-3f53bafb869cd945",
      "featureId": null
    },
    {
      "id": "edge-27a6c226dec20524",
      "kind": "edge",
      "status": "retired",
      "createdBy": "sample-panel",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "name": "見本パネル・分割された辺",
      "role": "open_edge",
      "semantics": {
        "boundaryRole": "open",
        "anatomicalRegion": null,
        "boundarySide": null,
        "anatomicalSide": null,
        "meaningStatus": "engine-defined"
      },
      "lengthMm": 400,
      "pieceId": "piece-15faf673bcaf8fc7",
      "featureId": null,
      "retiredBy": "example-curved-split"
    },
    {
      "id": "piece-ccf711b15e20b1f5",
      "kind": "piece",
      "status": "active",
      "createdBy": "example-curved-split",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "sourceIds": [
        "piece-15faf673bcaf8fc7"
      ],
      "name": "見本パネル・分割A",
      "role": "pattern_piece",
      "semantics": {},
      "pieceId": null,
      "featureId": null
    },
    {
      "id": "piece-3f53bafb869cd945",
      "kind": "piece",
      "status": "active",
      "createdBy": "example-curved-split",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "sourceIds": [
        "piece-15faf673bcaf8fc7"
      ],
      "name": "見本パネル・分割B",
      "role": "pattern_piece",
      "semantics": {},
      "pieceId": null,
      "featureId": null
    },
    {
      "id": "edge-947e04b875de92e0",
      "kind": "edge",
      "status": "active",
      "createdBy": "example-curved-split",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "sourceIds": [
        "edge-27a6c226dec20524"
      ],
      "rootName": "見本パネル・分割された辺",
      "name": "見本パネル・分割された辺・分割区間 1",
      "semantics": {
        "boundaryRole": "open",
        "anatomicalRegion": null,
        "boundarySide": null,
        "anatomicalSide": null,
        "meaningStatus": "engine-defined"
      },
      "role": "open_edge",
      "lengthMm": 99.99999999708962,
      "pieceId": "piece-3f53bafb869cd945",
      "featureId": null
    },
    {
      "id": "edge-4e7fa381cfff5a97",
      "kind": "edge",
      "status": "active",
      "createdBy": "example-curved-split",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "sourceIds": [
        "edge-27a6c226dec20524"
      ],
      "rootName": "見本パネル・分割された辺",
      "name": "見本パネル・分割された辺・分割区間 2",
      "semantics": {
        "boundaryRole": "open",
        "anatomicalRegion": null,
        "boundarySide": null,
        "anatomicalSide": null,
        "meaningStatus": "engine-defined"
      },
      "role": "open_edge",
      "lengthMm": 200.00000000121264,
      "pieceId": "piece-ccf711b15e20b1f5",
      "featureId": null
    },
    {
      "id": "edge-407e53e7600ecd59",
      "kind": "edge",
      "status": "active",
      "createdBy": "example-curved-split",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "sourceIds": [
        "edge-27a6c226dec20524"
      ],
      "rootName": "見本パネル・分割された辺",
      "name": "見本パネル・分割された辺・分割区間 3",
      "semantics": {
        "boundaryRole": "open",
        "anatomicalRegion": null,
        "boundarySide": null,
        "anatomicalSide": null,
        "meaningStatus": "engine-defined"
      },
      "role": "open_edge",
      "lengthMm": 100.00000000169773,
      "pieceId": "piece-3f53bafb869cd945",
      "featureId": null
    },
    {
      "id": "edge-81f87f19f7e0089b",
      "kind": "edge",
      "status": "active",
      "createdBy": "example-curved-split",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "name": "見本パネル・分割A・分割線（縫合）",
      "role": "seam_edge",
      "semantics": {
        "boundaryRole": "sew",
        "anatomicalRegion": null,
        "boundarySide": null,
        "anatomicalSide": null,
        "meaningStatus": "engine-defined"
      },
      "lengthMm": 257.5855994053686,
      "pieceId": "piece-ccf711b15e20b1f5",
      "featureId": null
    },
    {
      "id": "edge-ca0c6ead5da0581f",
      "kind": "edge",
      "status": "active",
      "createdBy": "example-curved-split",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "name": "見本パネル・分割B・分割線（縫合）",
      "role": "seam_edge",
      "semantics": {
        "boundaryRole": "sew",
        "anatomicalRegion": null,
        "boundarySide": null,
        "anatomicalSide": null,
        "meaningStatus": "engine-defined"
      },
      "lengthMm": 257.5855994053686,
      "pieceId": "piece-3f53bafb869cd945",
      "featureId": null
    },
    {
      "id": "relation-1e70bde1415d21b5",
      "kind": "relation",
      "status": "active",
      "createdBy": "example-curved-split",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "name": "見本パネルの分割線",
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
```

[1/6](after-SPLIT_PIECE-2-1.md) · [2/6](after-SPLIT_PIECE-2-2.md) · [3/6](after-SPLIT_PIECE-2-3.md) · [4/6](after-SPLIT_PIECE-2-4.md) · [5/6](after-SPLIT_PIECE-2-5.md) · [6/6](after-SPLIT_PIECE-2-6.md)
