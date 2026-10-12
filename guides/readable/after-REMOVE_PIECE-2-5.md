# after-REMOVE_PIECE-2: 意味付きデータ 5/5

分割JSONです。単独のJSONとして実行せず、全ページを順番に読んでください。

```json
            },
            {
              "x": 0,
              "y": 0
            }
          ]
        }
      ],
      "lengthMm": 100.00000000169773,
      "sewnLengthMm": 100.00000000169773,
      "notches": []
    },
    {
      "id": "edge-af08c4eee2012fcc",
      "geometry": [
        {
          "type": "line",
          "points": [
            {
              "x": 0,
              "y": 0
            },
            {
              "x": 300,
              "y": 0
            }
          ]
        }
      ],
      "lengthMm": 300,
      "sewnLengthMm": 300,
      "notches": []
    },
    {
      "id": "edge-8fd4165bddef3743",
      "geometry": [
        {
          "type": "line",
          "points": [
            {
              "x": 300,
              "y": 0
            },
            {
              "x": 300,
              "y": 400
            }
          ]
        }
      ],
      "lengthMm": 400,
      "sewnLengthMm": 400,
      "notches": []
    },
    {
      "id": "edge-e9e503b00926d634",
      "geometry": [
        {
          "type": "line",
          "points": [
            {
              "x": 300,
              "y": 400
            },
            {
              "x": 0,
              "y": 400
            }
          ]
        }
      ],
      "lengthMm": 300,
      "sewnLengthMm": 300,
      "notches": []
    },
    {
      "id": "edge-f65982783b9fba4e",
      "geometry": [
        {
          "type": "line",
          "points": [
            {
              "x": 0,
              "y": 400
            },
            {
              "x": 0,
              "y": 300.0000000029104
            }
          ]
        }
      ],
      "lengthMm": 99.99999999708962,
      "sewnLengthMm": 99.99999999708962,
      "notches": []
    },
    {
      "id": "edge-314e3599306bdd91",
      "geometry": [
        {
          "type": "cubic-bezier",
          "points": [
            {
              "x": 0,
              "y": 300.0000000029104
            },
            {
              "x": 80,
              "y": 300
            },
            {
              "x": 80,
              "y": 100
            },
            {
              "x": 0,
              "y": 100.00000000169773
            }
          ]
        }
      ],
      "lengthMm": 257.5855994053686,
      "sewnLengthMm": 257.5855994053686,
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
    "数値検証は着用時のフィットを保証しません。対応寸法範囲は計算のテスト範囲です。"
  ]
}
```

[1/5](after-REMOVE_PIECE-2-1.md) · [2/5](after-REMOVE_PIECE-2-2.md) · [3/5](after-REMOVE_PIECE-2-3.md) · [4/5](after-REMOVE_PIECE-2-4.md) · [5/5](after-REMOVE_PIECE-2-5.md)
