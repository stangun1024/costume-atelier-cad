# after-CREATE_PLACKET-1: 意味付きデータ 7/7

分割JSONです。単独のJSONとして実行せず、全ページを順番に読んでください。

```json
            {
              "x": 28,
              "y": 20
            }
          ]
        },
        {
          "type": "line",
          "points": [
            {
              "x": 28,
              "y": 20
            },
            {
              "x": 28,
              "y": 309
            }
          ]
        },
        {
          "type": "line",
          "points": [
            {
              "x": 28,
              "y": 309
            },
            {
              "x": 12,
              "y": 309
            }
          ]
        },
        {
          "type": "line",
          "points": [
            {
              "x": 12,
              "y": 309
            },
            {
              "x": 12,
              "y": 20
            }
          ]
        }
      ],
      "lengthMm": 610,
      "sewnLengthMm": 610,
      "notches": []
    },
    {
      "id": "edge-eb89a66ff603c4c5",
      "geometry": [
        {
          "type": "line",
          "points": [
            {
              "x": 0,
              "y": 0
            },
            {
              "x": 60,
              "y": 0
            }
          ]
        }
      ],
      "lengthMm": 60,
      "sewnLengthMm": 60,
      "notches": []
    },
    {
      "id": "edge-c94108d600340932",
      "geometry": [
        {
          "type": "line",
          "points": [
            {
              "x": 60,
              "y": 0
            },
            {
              "x": 60,
              "y": 329
            }
          ]
        }
      ],
      "lengthMm": 329,
      "sewnLengthMm": 329,
      "notches": []
    },
    {
      "id": "edge-f8667007efd4e701",
      "geometry": [
        {
          "type": "line",
          "points": [
            {
              "x": 60,
              "y": 329
            },
            {
              "x": 0,
              "y": 329
            }
          ]
        }
      ],
      "lengthMm": 60,
      "sewnLengthMm": 60,
      "notches": []
    },
    {
      "id": "edge-8a633fdd5479e7e1",
      "geometry": [
        {
          "type": "line",
          "points": [
            {
              "x": 0,
              "y": 329
            },
            {
              "x": 0,
              "y": 0
            }
          ]
        }
      ],
      "lengthMm": 329,
      "sewnLengthMm": 329,
      "notches": []
    },
    {
      "id": "edge-a77ca0f2d5f996da",
      "geometry": [
        {
          "type": "line",
          "points": [
            {
              "x": 10,
              "y": 0
            },
            {
              "x": 10,
              "y": 329
            }
          ]
        }
      ],
      "lengthMm": 329,
      "sewnLengthMm": 329,
      "notches": []
    },
    {
      "id": "edge-69e3d861ad5a4c97",
      "geometry": [
        {
          "type": "line",
          "points": [
            {
              "x": 12,
              "y": 20
            },
            {
              "x": 28,
              "y": 20
            }
          ]
        },
        {
          "type": "line",
          "points": [
            {
              "x": 28,
              "y": 20
            },
            {
              "x": 28,
              "y": 309
            }
          ]
        },
        {
          "type": "line",
          "points": [
            {
              "x": 28,
              "y": 309
            },
            {
              "x": 12,
              "y": 309
            }
          ]
        },
        {
          "type": "line",
          "points": [
            {
              "x": 12,
              "y": 309
            },
            {
              "x": 12,
              "y": 20
            }
          ]
        }
      ],
      "lengthMm": 610,
      "sewnLengthMm": 610,
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
    "数値検証は着用時のフィットを保証しません。対応寸法範囲は計算のテスト範囲です。",
    "比翼の帯・折り線・取付線を作成しました。取付先の個体・表裏・配置と、穴・芯の指定状況を確認してください。"
  ]
}
```

[1/7](after-CREATE_PLACKET-1-1.md) · [2/7](after-CREATE_PLACKET-1-2.md) · [3/7](after-CREATE_PLACKET-1-3.md) · [4/7](after-CREATE_PLACKET-1-4.md) · [5/7](after-CREATE_PLACKET-1-5.md) · [6/7](after-CREATE_PLACKET-1-6.md) · [7/7](after-CREATE_PLACKET-1-7.md)
