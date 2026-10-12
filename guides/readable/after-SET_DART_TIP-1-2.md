# after-SET_DART_TIP-1: 意味付きデータ 2/5

分割JSONです。単独のJSONとして実行せず、全ページを順番に読んでください。

```json
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
      "pieceId": "piece-48479248319cb11a",
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
      "pieceId": "piece-48479248319cb11a",
      "featureId": null
    },
    {
      "id": "feature-fc21fad297fd8cd8",
      "kind": "feature",
      "status": "active",
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
      "featureId": null
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
      "role": "dart_leg",
      "semantics": {
        "boundaryRole": "sew",
        "anatomicalRegion": null,
        "boundarySide": "incoming",
        "anatomicalSide": null,
        "meaningStatus": "partially-known"
      },
      "lengthMm": 80.62257748302612,
      "pieceId": "piece-48479248319cb11a",
      "featureId": "feature-fc21fad297fd8cd8"
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
      "role": "dart_leg",
      "semantics": {
        "boundaryRole": "sew",
        "anatomicalRegion": null,
        "boundarySide": "outgoing",
        "anatomicalSide": null,
        "meaningStatus": "partially-known"
      },
      "lengthMm": 80.62257748302612,
      "pieceId": "piece-48479248319cb11a",
      "featureId": "feature-fc21fad297fd8cd8"
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
          "name": "前丈の基準線",
          "kind": "construction",
          "geometry": [
            {
              "type": "line",
              "points": [
                {
                  "x": 90.33333333333333,
                  "y": 206.66666666666666
                },
                {
                  "x": 90.33333333333333,
                  "y": 409
                }
              ]
            }
          ]
        }
      ],
      "darts": [],
      "attachmentLines": [],
      "edgeIds": [
        "edge-4a230df4ae28d870",
        "edge-9729acc1b2ea0a47",
        "edge-a912108f6febe431",
        "edge-aa82237a3ac98d1e",
        "edge-c8921b47bf470029",
        "edge-05c5dc60097ec0aa"
      ],
      "featureIds": []
    },
    {
      "id": "piece-48479248319cb11a",
      "name": "後身頃",
      "cut": {
        "quantity": 1,
        "onFold": true,
        "mirroredPair": false,
        "seamAllowance": 0
      },
      "instances": [
        {
          "id": "copy-1",
          "name": "後身頃・裁断1",
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
          "y": 0
        },
        "neckSide": {
          "x": 70,
          "y": -23.333333333333332
        },
        "shoulder": {
          "x": 201.66666666666666,
          "y": 23.333333333333332
        },
        "armholeMid": {
          "x": 181.66666666666666,
          "y": 115
        },
        "armholeGuide": {
          "x": 202.29061445127428,
          "y": 186.04271888205903
        },
        "underarm": {
          "x": 230,
          "y": 206.66666666666666
        },
        "sideWaist": {
          "x": 210,
          "y": 375
        },
        "centerWaist": {
          "x": 0,
          "y": 375
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
      "guides": [],
      "darts": [
        {
          "id": "feature-fc21fad297fd8cd8",
          "pivot": {
            "x": 129.99999999916326,
            "y": 295
          },
          "sewingTip": {
            "x": 129.99999999916326,
            "y": 315
          },
          "legA": "edge-29d5b17de99fe361",
          "legB": "edge-af8d730602dcb75c",
          "intakeAngleDeg": 14.250032698265372
        }
      ],
      "attachmentLines": [],
      "edgeIds": [
        "edge-b96527b841baa886",
        "edge-705bfdf516b41209",
        "edge-71a471734fa8b917",
        "edge-d8da42565d313b48",
        "edge-bdfaf24328f45bd5",
        "edge-29d5b17de99fe361",
        "edge-af8d730602dcb75c",
        "edge-426dd28264e1aab8",
        "edge-e47676fc9f822084"
      ],
      "featureIds": [
        "feature-fc21fad297fd8cd8"
      ]
    },
    {
      "id": "piece-a525f9ffe76e2ded",
      "name": "袖",
      "cut": {
        "quantity": 2,
        "onFold": false,
        "mirroredPair": true,
        "seamAllowance": 0
      },
      "instances": [
        {
          "id": "copy-1",
          "name": "袖・裁断1",
          "side": "unspecified",
          "mirrored": false
        },
        {
          "id": "copy-2",
          "name": "袖・裁断2",
          "side": "unspecified",
          "mirrored": true
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
        "top": {
          "x": 0,
          "y": 0
        },
        "backUnderarm": {
          "x": -174.2875660074769,
          "y": 126.0892649183647
        },
```

[1/5](after-SET_DART_TIP-1-1.md) · [2/5](after-SET_DART_TIP-1-2.md) · [3/5](after-SET_DART_TIP-1-3.md) · [4/5](after-SET_DART_TIP-1-4.md) · [5/5](after-SET_DART_TIP-1-5.md)
