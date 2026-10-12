# after-SLASH_SPREAD-1: 意味付きデータ 4/5

分割JSONです。単独のJSONとして実行せず、全ページを順番に読んでください。

```json
      "id": "edge-cfac2122d293dafa",
      "geometry": [
        {
          "type": "line",
          "points": [
            {
              "x": 173.8198095938224,
              "y": 97.38527285822022
            },
            {
              "x": 240.48520912752002,
              "y": 475.4635412312305
            }
          ]
        }
      ],
      "lengthMm": 383.9107350816352,
      "sewnLengthMm": 383.9107350816352,
      "notches": []
    },
    {
      "id": "edge-2b46b1e4651c5860",
      "geometry": [
        {
          "type": "cubic-bezier",
          "points": [
            {
              "x": 240.48520912752002,
              "y": 475.4635412312305
            },
            {
              "x": 214.8750224118442,
              "y": 478.2869304437094
            },
            {
              "x": 189.02856407480286,
              "y": 479.4596030313346
            },
            {
              "x": 163.6546489804926,
              "y": 483.9337088686673
            }
          ]
        },
        {
          "type": "cubic-bezier",
          "points": [
            {
              "x": 163.6546489804926,
              "y": 483.9337088686673
            },
            {
              "x": 156.20278979040538,
              "y": 485.24767270032
            },
            {
              "x": 148.81300009819836,
              "y": 486.8391245986165
            },
            {
              "x": 141.46819704726352,
              "y": 488.63169389817676
            }
          ]
        }
      ],
      "lengthMm": 100.0000316868661,
      "sewnLengthMm": 100.0000316868661,
      "notches": []
    },
    {
      "id": "edge-24b297da0fe3bc30",
      "geometry": [
        {
          "type": "line",
          "points": [
            {
              "x": 141.46819704726352,
              "y": 488.63169389817676
            },
            {
              "x": 54.468974061080175,
              "y": 505.77397513349604
            }
          ]
        }
      ],
      "lengthMm": 88.67199448614218,
      "sewnLengthMm": 88.67199448614218,
      "notches": []
    },
    {
      "id": "edge-dc2ed273418980d9",
      "geometry": [
        {
          "type": "cubic-bezier",
          "points": [
            {
              "x": 54.468974061080175,
              "y": 505.77397513349604
            },
            {
              "x": 7.18855920500237,
              "y": 508.8442709505722
            },
            {
              "x": -39.723486790900225,
              "y": 520
            },
            {
              "x": -87.14378300373845,
              "y": 520
            }
          ]
        },
        {
          "type": "cubic-bezier",
          "points": [
            {
              "x": -87.14378300373845,
              "y": 520
            },
            {
              "x": -116.38233996045925,
              "y": 520
            },
            {
              "x": -145.23963833956407,
              "y": 513.3333333333334
            },
            {
              "x": -174.2875660074769,
              "y": 510
            }
          ]
        }
      ],
      "lengthMm": 230.20719068364428,
      "sewnLengthMm": 230.20719068364428,
      "notches": []
    },
    {
      "id": "edge-dd9f083ce3fc49e0",
      "geometry": [
        {
          "type": "line",
          "points": [
            {
              "x": -174.2875660074769,
              "y": 510
            },
            {
              "x": -174.2875660074769,
              "y": 126.0892649183647
            }
          ]
        }
      ],
      "lengthMm": 383.91073508163527,
      "sewnLengthMm": 383.91073508163527,
      "notches": []
    },
    {
      "id": "edge-82fc646c2a1e299c",
      "geometry": [
        {
          "type": "line",
          "points": [
            {
              "x": -174.2875660074769,
              "y": 126.0892649183647
            },
            {
              "x": -133.9309412541434,
              "y": 96.893050487808
            }
          ]
        },
        {
          "type": "cubic-bezier",
          "points": [
            {
              "x": -133.9309412541434,
              "y": 96.893050487808
            },
            {
              "x": -102.47753681797136,
              "y": 74.13791806277415
            },
            {
              "x": -80.60223329115615,
              "y": 39.79827534938612
            },
            {
              "x": -49.14882885498412,
              "y": 17.043142924352274
            }
          ]
        },
        {
          "type": "cubic-bezier",
          "points": [
            {
              "x": -49.14882885498412,
              "y": 17.043142924352274
            },
            {
              "x": -35.09988935955407,
              "y": 6.879363060759696
            },
            {
              "x": -17.339986218616907,
              "y": 0
            },
            {
              "x": 0,
              "y": 0
            }
          ]
        }
      ],
      "lengthMm": 219.31728477168193,
      "sewnLengthMm": 219.31728477168193,
      "notches": [
        {
          "id": "sleeve-back",
          "distanceFromStartMm": 87.60701326608809,
          "count": 2
        }
      ]
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
    },
    {
      "id": "relation-6b9db4d4dcbcbc22",
      "name": "袖下線",
      "kind": "sew",
      "referenceParticipantId": "a",
      "participants": [
        {
          "id": "a",
          "pieceRef": "piece-a525f9ffe76e2ded",
          "segments": [
            {
              "lineRef": "edge-cfac2122d293dafa",
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
          "pieceRef": "piece-a525f9ffe76e2ded",
          "segments": [
            {
              "lineRef": "edge-dd9f083ce3fc49e0",
              "range": {
                "mode": "whole"
              },
              "direction": "reverse"
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
        "edge-cfac2122d293dafa"
      ],
      "b": [
        "edge-dd9f083ce3fc49e0"
      ],
      "easeMm": {
        "min": 0,
        "max": 0
      },
      "direction": "opposite",
      "endpointMapping": "a.start=b.end; a.end=b.start"
    },
    {
      "id": "relation-11ac104c33ff128c",
      "name": "後袖山のいせ量を確認",
      "kind": "sew",
      "referenceParticipantId": "a",
      "participants": [
        {
          "id": "a",
          "pieceRef": "piece-a525f9ffe76e2ded",
          "segments": [
            {
              "lineRef": "edge-82fc646c2a1e299c",
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
              "lineRef": "edge-71a471734fa8b917",
              "range": {
                "mode": "whole"
              },
              "direction": "reverse"
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
        "edge-82fc646c2a1e299c"
      ],
      "b": [
        "edge-71a471734fa8b917"
      ],
      "easeMm": {
        "min": 2,
        "max": 30
      },
      "direction": "opposite",
      "endpointMapping": "a.start=b.end; a.end=b.start"
    },
    {
      "id": "relation-31e540a23d43ae06",
      "name": "前袖山のいせ量を確認",
      "kind": "sew",
      "referenceParticipantId": "a",
      "participants": [
        {
          "id": "a",
          "pieceRef": "piece-a525f9ffe76e2ded",
          "segments": [
            {
              "lineRef": "edge-71d188b2f5d3c3f6",
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
              "lineRef": "edge-a912108f6febe431",
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
        "edge-71d188b2f5d3c3f6"
      ],
      "b": [
        "edge-a912108f6febe431"
      ],
      "easeMm": {
        "min": 2,
        "max": 30
      },
      "direction": "same",
      "endpointMapping": "a.start=b.start; a.end=b.end"
    }
  ],
  "notices": [
    "旧文化式のダーツなし原型です。新文化式ではありません。",
    "襟ぐり・袖ぐり・袖山・袖口の手描きカーブは案内点を通るベジェ曲線で近似しています。",
    "ウエスト絞り・胸ダーツ・肩ダーツ・縫い代・開きは未追加です。試着補正と縫製設計が必要です。",
```

[1/5](after-SLASH_SPREAD-1-1.md) · [2/5](after-SLASH_SPREAD-1-2.md) · [3/5](after-SLASH_SPREAD-1-3.md) · [4/5](after-SLASH_SPREAD-1-4.md) · [5/5](after-SLASH_SPREAD-1-5.md)
