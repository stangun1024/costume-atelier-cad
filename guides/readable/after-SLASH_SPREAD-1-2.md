# after-SLASH_SPREAD-1: 意味付きデータ 2/5

分割JSONです。単独のJSONとして実行せず、全ページを順番に読んでください。

```json
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
      "id": "edge-2b46b1e4651c5860",
      "kind": "edge",
      "status": "active",
      "createdBy": "example-slash-spread",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "sourceIds": [
        "edge-69fada447be4eeaa"
      ],
      "rootName": "袖・袖口",
      "name": "袖・袖口・分割区間 1",
      "semantics": {
        "boundaryRole": "open",
        "anatomicalRegion": "cuff",
        "boundarySide": null,
        "anatomicalSide": null,
        "meaningStatus": "engine-defined"
      },
      "role": "open_edge",
      "lengthMm": 100.0000316868661,
      "pieceId": "piece-a525f9ffe76e2ded",
      "featureId": null
    },
    {
      "id": "edge-dc2ed273418980d9",
      "kind": "edge",
      "status": "active",
      "createdBy": "example-slash-spread",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "sourceIds": [
        "edge-69fada447be4eeaa"
      ],
      "rootName": "袖・袖口",
      "name": "袖・袖口・分割区間 2",
      "semantics": {
        "boundaryRole": "open",
        "anatomicalRegion": "cuff",
        "boundarySide": null,
        "anatomicalSide": null,
        "meaningStatus": "engine-defined"
      },
      "role": "open_edge",
      "lengthMm": 230.20719068364428,
      "pieceId": "piece-a525f9ffe76e2ded",
      "featureId": null
    },
    {
      "id": "feature-f3b49c735f350023",
      "kind": "feature",
      "status": "active",
      "createdBy": "example-slash-spread",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "name": "袖・展開 1",
      "role": "slash-spread",
      "semantics": {},
      "pieceId": "piece-a525f9ffe76e2ded",
      "featureId": null
    },
    {
      "id": "edge-24b297da0fe3bc30",
      "kind": "edge",
      "status": "active",
      "createdBy": "example-slash-spread",
      "provenance": {
        "source": "engine",
        "status": "derived",
        "confidence": null
      },
      "name": "袖・展開で追加した辺",
      "role": "spread_opening",
      "semantics": {
        "boundaryRole": "open",
        "anatomicalRegion": null,
        "boundarySide": null,
        "anatomicalSide": null,
        "meaningStatus": "engine-defined"
      },
      "lengthMm": 88.67199448614218,
      "pieceId": "piece-a525f9ffe76e2ded",
      "featureId": "feature-f3b49c735f350023"
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
          "name": "背幅線",
          "kind": "construction",
          "geometry": [
            {
              "type": "line",
              "points": [
                {
                  "x": 181.66666666666666,
                  "y": 23.333333333333332
                },
                {
                  "x": 181.66666666666666,
                  "y": 206.66666666666666
                }
              ]
            }
          ]
        }
      ],
      "darts": [],
      "attachmentLines": [],
      "edgeIds": [
        "edge-b96527b841baa886",
        "edge-705bfdf516b41209",
        "edge-71a471734fa8b917",
        "edge-d8da42565d313b48",
        "edge-96fa97ab8363977f",
        "edge-e47676fc9f822084"
      ],
      "featureIds": []
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
        "frontUnderarm": {
          "x": 173.8198095938224,
          "y": 97.38527285822022
        },
        "backUpper": {
          "x": -49.14882885498412,
          "y": 17.043142924352274
        },
        "backLower": {
          "x": -133.9309412541434,
          "y": 96.893050487808
        },
        "frontUpper": {
          "x": 52.25298884425192,
          "y": 8.64298880011432
        },
        "frontMid": {
          "x": 95.63397669382272,
          "y": 53.58043445455251
        },
        "frontLower": {
          "x": 124.0107197622917,
          "y": 84.38024810965014
        },
        "backCuff": {
          "x": -174.2875660074769,
          "y": 510
```

[1/5](after-SLASH_SPREAD-1-1.md) · [2/5](after-SLASH_SPREAD-1-2.md) · [3/5](after-SLASH_SPREAD-1-3.md) · [4/5](after-SLASH_SPREAD-1-4.md) · [5/5](after-SLASH_SPREAD-1-5.md)
