# after-REMOVE_PIECE-1: 意味付きデータ 2/3

分割JSONです。単独のJSONとして実行せず、全ページを順番に読んでください。

```json
        "confidence": null
      },
      "name": "前後の脇線",
      "role": "sewing_relation",
      "semantics": {},
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
      "status": "retired",
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
      "featureId": null,
      "retiredBy": "example-remove-piece"
    },
    {
      "id": "relation-11ac104c33ff128c",
      "kind": "relation",
      "status": "retired",
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
      "featureId": null,
      "retiredBy": "example-remove-piece"
    },
    {
      "id": "relation-31e540a23d43ae06",
      "kind": "relation",
      "status": "retired",
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
      "featureId": null,
      "retiredBy": "example-remove-piece"
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
    }
  ],
  "edges": [
    {
      "id": "edge-4a230df4ae28d870",
      "geometry": [
        {
          "type": "cubic-bezier",
          "points": [
            {
              "x": 0,
              "y": 80
            },
            {
              "x": 17.809218152647183,
              "y": 80
            },
            {
              "x": 35.96064497167966,
              "y": 69.57354365536696
            },
            {
              "x": 47.922898977038244,
              "y": 56.37988114945676
            }
          ]
        },
        {
          "type": "cubic-bezier",
          "points": [
            {
              "x": 47.922898977038244,
              "y": 56.37988114945676
            },
            {
              "x": 60.27374238339452,
              "y": 42.75762739244616
            },
            {
              "x": 61.70414460909014,
              "y": 22.276322964261666
            },
            {
              "x": 68,
              "y": 5
            }
          ]
        }
      ],
      "lengthMm": 110.56360568971647,
      "sewnLengthMm": 110.56360568971647,
      "notches": []
    },
    {
      "id": "edge-9729acc1b2ea0a47",
      "geometry": [
        {
          "type": "line",
          "points": [
            {
              "x": 68,
              "y": 5
            },
            {
              "x": 182.33661440459792,
              "y": 46.666666666666664
            }
          ]
        }
      ],
      "lengthMm": 121.69212178533506,
      "sewnLengthMm": 121.69212178533506,
      "notches": []
    },
    {
      "id": "edge-a912108f6febe431",
      "geometry": [
        {
          "type": "cubic-bezier",
          "points": [
            {
              "x": 182.33661440459792,
              "y": 46.666666666666664
            },
            {
              "x": 173.03259910944408,
              "y": 72.19761728786234
            },
            {
              "x": 166.66666666666666,
              "y": 99.49325796929509
            },
            {
              "x": 166.66666666666666,
              "y": 126.66666666666666
            }
          ]
        },
        {
          "type": "cubic-bezier",
          "points": [
            {
              "x": 166.66666666666666,
              "y": 126.66666666666666
            },
            {
              "x": 166.66666666666666,
              "y": 148.3970385436037
            },
            {
              "x": 170.26697473916815,
              "y": 172.54064545387794
            },
            {
              "x": 183.75508054534157,
              "y": 189.57825278799174
            }
          ]
        },
        {
          "type": "cubic-bezier",
          "points": [
            {
              "x": 183.75508054534157,
              "y": 189.57825278799174
            },
            {
              "x": 193.9555433152645,
              "y": 202.46304786578912
            },
            {
              "x": 213.56627294502508,
              "y": 206.66666666666666
            },
            {
              "x": 230,
              "y": 206.66666666666666
            }
          ]
        }
      ],
      "lengthMm": 199.24160605427522,
      "sewnLengthMm": 199.24160605427522,
      "notches": [
        {
          "id": "front-armhole",
          "distanceFromStartMm": 107.02974380347695,
          "count": 1
        }
      ]
    },
    {
      "id": "edge-aa82237a3ac98d1e",
      "geometry": [
        {
          "type": "line",
          "points": [
            {
              "x": 230,
              "y": 206.66666666666666
            },
            {
              "x": 250,
              "y": 375
            }
          ]
        }
      ],
      "lengthMm": 169.5172885316159,
      "sewnLengthMm": 169.5172885316159,
      "notches": []
    },
    {
      "id": "edge-c8921b47bf470029",
      "geometry": [
        {
```

[1/3](after-REMOVE_PIECE-1-1.md) · [2/3](after-REMOVE_PIECE-1-2.md) · [3/3](after-REMOVE_PIECE-1-3.md)
