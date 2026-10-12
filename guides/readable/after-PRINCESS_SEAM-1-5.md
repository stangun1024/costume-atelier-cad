# after-PRINCESS_SEAM-1: 意味付きデータ 5/5

分割JSONです。単独のJSONとして実行せず、全ページを順番に読んでください。

```json
        }
      ],
      "lengthMm": 383.91073508163527,
      "sewnLengthMm": 383.91073508163527,
      "notches": []
    },
    {
      "id": "edge-69fada447be4eeaa",
      "geometry": [
        {
          "type": "cubic-bezier",
          "points": [
            {
              "x": 154.26832095167538,
              "y": 510
            },
            {
              "x": 128.55693412639616,
              "y": 508.3333333333333
            },
            {
              "x": 102.89950911032972,
              "y": 505
            },
            {
              "x": 77.13416047583769,
              "y": 505
            }
          ]
        },
        {
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
          "pieceRef": "piece-cce3ce574d4610b5",
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
          "pieceRef": "piece-cce3ce574d4610b5",
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
          "pieceRef": "piece-cce3ce574d4610b5",
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
      "id": "relation-c25f8c5aeb379218",
      "name": "ダーツの脚",
      "kind": "sew",
      "referenceParticipantId": "a",
      "participants": [
        {
          "id": "a",
          "pieceRef": "piece-cce3ce574d4610b5",
          "segments": [
            {
              "lineRef": "edge-29d5b17de99fe361",
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
          "pieceRef": "piece-707d6085cdc96f05",
          "segments": [
            {
              "lineRef": "edge-af8d730602dcb75c",
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
        "edge-29d5b17de99fe361"
      ],
      "b": [
        "edge-af8d730602dcb75c"
      ],
      "easeMm": {
        "min": 0,
        "max": 0
      },
      "direction": "opposite",
      "endpointMapping": "a.start=b.end; a.end=b.start"
    },
    {
      "id": "relation-4081f9dd0a1fcfd3",
      "name": "後身頃の分割線",
      "kind": "sew",
      "referenceParticipantId": "a",
      "participants": [
        {
          "id": "a",
          "pieceRef": "piece-707d6085cdc96f05",
          "segments": [
            {
              "lineRef": "edge-ebfdd9ee93ddc01a",
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
          "pieceRef": "piece-cce3ce574d4610b5",
          "segments": [
            {
              "lineRef": "edge-a0bceaf7ae6a4453",
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
        "edge-ebfdd9ee93ddc01a"
      ],
      "b": [
        "edge-a0bceaf7ae6a4453"
      ],
      "easeMm": {
        "min": 0,
        "max": 0
      },
      "direction": "opposite",
      "endpointMapping": "a.start=b.end; a.end=b.start"
    }
  ],
  "notices": [
    "旧文化式のダーツなし原型です。新文化式ではありません。",
    "襟ぐり・袖ぐり・袖山・袖口の手描きカーブは案内点を通るベジェ曲線で近似しています。",
    "ウエスト絞り・胸ダーツ・肩ダーツ・縫い代・開きは未追加です。試着補正と縫製設計が必要です。",
    "数値検証は着用時のフィットを保証しません。対応寸法範囲は計算のテスト範囲です。",
    "ダーツを切替パーツに変換しました。胸付近は直線の構成線です。曲線仕上げと試着補正が必要です。"
  ]
}
```

[1/5](after-PRINCESS_SEAM-1-1.md) · [2/5](after-PRINCESS_SEAM-1-2.md) · [3/5](after-PRINCESS_SEAM-1-3.md) · [4/5](after-PRINCESS_SEAM-1-4.md) · [5/5](after-PRINCESS_SEAM-1-5.md)
