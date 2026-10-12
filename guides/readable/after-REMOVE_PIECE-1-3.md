# after-REMOVE_PIECE-1: 意味付きデータ 3/3

分割JSONです。単独のJSONとして実行せず、全ページを順番に読んでください。

```json
          "type": "line",
          "points": [
            {
              "x": 250,
              "y": 375
            },
            {
              "x": 90.33333333333333,
              "y": 409
            }
          ]
        },
        {
          "type": "line",
          "points": [
            {
              "x": 90.33333333333333,
              "y": 409
            },
            {
              "x": 0,
              "y": 409
            }
          ]
        }
      ],
      "lengthMm": 253.5799089312443,
      "sewnLengthMm": 253.5799089312443,
      "notches": []
    },
    {
      "id": "edge-05c5dc60097ec0aa",
      "geometry": [
        {
          "type": "line",
          "points": [
            {
              "x": 0,
              "y": 409
            },
            {
              "x": 0,
              "y": 80
            }
          ]
        }
      ],
      "lengthMm": 329,
      "sewnLengthMm": 329,
      "notches": []
    },
    {
      "id": "edge-b96527b841baa886",
      "geometry": [
        {
          "type": "cubic-bezier",
          "points": [
            {
              "x": 0,
              "y": 0
            },
            {
              "x": 49,
              "y": 0
            },
            {
              "x": 64.54355612556641,
              "y": -7.938366687609999
            },
            {
              "x": 70,
              "y": -23.333333333333332
            }
          ]
        }
      ],
      "lengthMm": 78.39997113310437,
      "sewnLengthMm": 78.39997113310437,
      "notches": []
    },
    {
      "id": "edge-705bfdf516b41209",
      "geometry": [
        {
          "type": "line",
          "points": [
            {
              "x": 70,
              "y": -23.333333333333332
            },
            {
              "x": 201.66666666666666,
              "y": 23.333333333333332
            }
          ]
        }
      ],
      "lengthMm": 139.69212178533508,
      "sewnLengthMm": 139.69212178533508,
      "notches": []
    },
    {
      "id": "edge-71a471734fa8b917",
      "geometry": [
        {
          "type": "cubic-bezier",
          "points": [
            {
              "x": 201.66666666666666,
              "y": 23.333333333333332
            },
            {
              "x": 191.21889959717853,
              "y": 52.81096185081768
            },
            {
              "x": 181.66666666666666,
              "y": 83.7256267888054
            },
            {
              "x": 181.66666666666666,
              "y": 115
            }
          ]
        },
        {
          "type": "cubic-bezier",
          "points": [
            {
              "x": 181.66666666666666,
              "y": 115
            },
            {
              "x": 181.66666666666666,
              "y": 139.65859130962832
            },
            {
              "x": 190.7896215406237,
              "y": 164.23049094806657
            },
            {
              "x": 202.29061445127428,
              "y": 186.04271888205903
            }
          ]
        },
        {
          "type": "cubic-bezier",
          "points": [
            {
              "x": 202.29061445127428,
              "y": 186.04271888205903
            },
            {
              "x": 207.66086643455404,
              "y": 196.2276795400034
            },
            {
              "x": 218.4859637846759,
              "y": 206.66666666666666
            },
            {
              "x": 230,
              "y": 206.66666666666666
            }
          ]
        }
      ],
      "lengthMm": 205.1154537866994,
      "sewnLengthMm": 205.1154537866994,
      "notches": [
        {
          "id": "back-armhole",
          "distanceFromStartMm": 119.50844036861518,
          "count": 2
        }
      ]
    },
    {
      "id": "edge-d8da42565d313b48",
      "geometry": [
        {
          "type": "line",
          "points": [
            {
              "x": 230,
              "y": 206.66666666666666
            },
            {
              "x": 210,
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
      "id": "edge-96fa97ab8363977f",
      "geometry": [
        {
          "type": "line",
          "points": [
            {
              "x": 210,
              "y": 375
            },
            {
              "x": 0,
              "y": 375
            }
          ]
        }
      ],
      "lengthMm": 210,
      "sewnLengthMm": 210,
      "notches": []
    },
    {
      "id": "edge-e47676fc9f822084",
      "geometry": [
        {
          "type": "line",
          "points": [
            {
              "x": 0,
              "y": 375
            },
            {
              "x": 0,
              "y": 0
            }
          ]
        }
      ],
      "lengthMm": 375,
      "sewnLengthMm": 375,
      "notches": []
    }
  ],
  "constraints": [
    {
      "id": "relation-0f347373332dd311",
      "name": "前後の脇線",
      "kind": "sew",
      "referenceParticipantId": "a",
      "participants": [
        {
          "id": "a",
          "pieceRef": "piece-e5e370c65b8097d8",
          "segments": [
            {
              "lineRef": "edge-aa82237a3ac98d1e",
              "range": {
                "mode": "whole"
              },
              "direction": "forward"
            }
          ],
          "fit": {
            "mode": "plain"
          }
        },
        {
          "id": "b",
          "pieceRef": "piece-48479248319cb11a",
          "segments": [
            {
              "lineRef": "edge-d8da42565d313b48",
              "range": {
                "mode": "whole"
              },
              "direction": "forward"
            }
          ],
          "fit": {
            "mode": "plain"
          }
        }
      ],
      "matchPoints": [],
      "status": "registered",
      "a": [
        "edge-aa82237a3ac98d1e"
      ],
      "b": [
        "edge-d8da42565d313b48"
      ],
      "easeMm": {
        "min": 0,
        "max": 0
      },
      "direction": "same",
      "endpointMapping": "a.start=b.start; a.end=b.end"
    },
    {
      "id": "relation-d97192faa6fb25c4",
      "name": "後肩のいせ分18 mm",
      "kind": "sew",
      "referenceParticipantId": "a",
      "participants": [
        {
          "id": "a",
          "pieceRef": "piece-48479248319cb11a",
          "segments": [
            {
              "lineRef": "edge-705bfdf516b41209",
              "range": {
                "mode": "whole"
              },
              "direction": "forward"
            }
          ],
          "fit": {
            "mode": "plain"
          }
        },
        {
          "id": "b",
          "pieceRef": "piece-e5e370c65b8097d8",
          "segments": [
            {
              "lineRef": "edge-9729acc1b2ea0a47",
              "range": {
                "mode": "whole"
              },
              "direction": "forward"
            }
          ],
          "fit": {
            "mode": "plain"
          }
        }
      ],
      "matchPoints": [],
      "status": "registered",
      "a": [
        "edge-705bfdf516b41209"
      ],
      "b": [
        "edge-9729acc1b2ea0a47"
      ],
      "easeMm": {
        "min": 18,
        "max": 18
      },
      "direction": "same",
      "endpointMapping": "a.start=b.start; a.end=b.end"
    }
  ],
  "notices": [
    "旧文化式のダーツなし原型です。新文化式ではありません。",
    "襟ぐり・袖ぐり・袖山・袖口の手描きカーブは案内点を通るベジェ曲線で近似しています。",
    "ウエスト絞り・胸ダーツ・肩ダーツ・縫い代・開きは未追加です。試着補正と縫製設計が必要です。",
    "数値検証は着用時のフィットを保証しません。対応寸法範囲は計算のテスト範囲です。"
  ]
}
```

[1/3](after-REMOVE_PIECE-1-1.md) · [2/3](after-REMOVE_PIECE-1-2.md) · [3/3](after-REMOVE_PIECE-1-3.md)
