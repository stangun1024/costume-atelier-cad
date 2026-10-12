# after-SPLIT_PIECE-1: 意味付きデータ 5/6

分割JSONです。単独のJSONとして実行せず、全ページを順番に読んでください。

```json
          "type": "cubic-bezier",
          "points": [
            {
              "x": 77.13416047583769,
              "y": 505
            },
            {
              "x": 22.14704813335954,
              "y": 505
            },
            {
              "x": -32.1566706612603,
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
      "lengthMm": 330.2072142985551,
      "sewnLengthMm": 330.2072142985551,
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
      "id": "edge-39d013c6fbabb3e6",
      "geometry": [
        {
          "type": "line",
          "points": [
            {
              "x": 300,
              "y": 199.99999999708962
            },
            {
              "x": 300,
              "y": 400
            }
          ]
        }
      ],
      "lengthMm": 200.00000000291038,
      "sewnLengthMm": 200.00000000291038,
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
      "id": "edge-d3ae106b4c2079f5",
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
              "y": 200.00000000291038
            }
          ]
        }
      ],
      "lengthMm": 199.99999999708962,
      "sewnLengthMm": 199.99999999708962,
      "notches": []
    },
    {
      "id": "edge-6784e5885b0269e4",
      "geometry": [
        {
          "type": "line",
          "points": [
            {
              "x": 0,
              "y": 200.00000000291038
            },
            {
              "x": 300,
              "y": 199.99999999708962
            }
          ]
        }
      ],
      "lengthMm": 300,
      "sewnLengthMm": 300,
      "notches": []
    },
    {
      "id": "edge-49683daa9b54d218",
      "geometry": [
        {
          "type": "line",
          "points": [
            {
              "x": 0,
              "y": 200.00000000291038
            },
            {
              "x": 0,
              "y": 0
            }
          ]
        }
      ],
      "lengthMm": 200.00000000291038,
      "sewnLengthMm": 200.00000000291038,
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
      "id": "edge-0b802e17643e5a03",
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
              "y": 199.99999999708962
            }
          ]
        }
      ],
      "lengthMm": 199.99999999708962,
      "sewnLengthMm": 199.99999999708962,
      "notches": []
    },
    {
      "id": "edge-320358def4d84928",
      "geometry": [
        {
          "type": "line",
          "points": [
            {
              "x": 300,
              "y": 199.99999999708962
            },
            {
              "x": 0,
              "y": 200.00000000291038
            }
          ]
        }
      ],
      "lengthMm": 300,
      "sewnLengthMm": 300,
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
    },
    {
      "id": "relation-aeb5bb7e1e525180",
      "name": "見本パネルの分割線",
      "kind": "sew",
      "referenceParticipantId": "a",
      "participants": [
        {
          "id": "a",
          "pieceRef": "piece-54f36ac8189e11dc",
          "segments": [
            {
              "lineRef": "edge-6784e5885b0269e4",
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
          "pieceRef": "piece-a82c30deb8e578fc",
          "segments": [
            {
              "lineRef": "edge-320358def4d84928",
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
```

[1/6](after-SPLIT_PIECE-1-1.md) · [2/6](after-SPLIT_PIECE-1-2.md) · [3/6](after-SPLIT_PIECE-1-3.md) · [4/6](after-SPLIT_PIECE-1-4.md) · [5/6](after-SPLIT_PIECE-1-5.md) · [6/6](after-SPLIT_PIECE-1-6.md)
