# after-CREATE_STAND_COLLAR-1: 意味付きデータ 3/5

分割JSONです。単独のJSONとして実行せず、全ページを順番に読んでください。

```json
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
          "x": 154.26832095167538,
          "y": 126.0892649183647
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
          "x": 49.95830927714417,
          "y": 17.58531867000505
        },
        "frontMid": {
          "x": 84.87693689782998,
          "y": 69.37309303652975
        },
        "frontLower": {
          "x": 107.47424196320492,
          "y": 104.63255803736351
        },
        "backCuff": {
          "x": -174.2875660074769,
          "y": 510
        },
        "frontCuff": {
          "x": 154.26832095167538,
          "y": 510
        }
      },
      "grainline": [
        {
          "type": "line",
          "points": [
            {
              "x": 0,
              "y": 151.0892649183647
            },
            {
              "x": 0,
              "y": 480
            }
          ]
        }
      ],
      "guides": [
        {
          "name": "袖幅線",
          "kind": "construction",
          "geometry": [
            {
              "type": "line",
              "points": [
                {
                  "x": -174.2875660074769,
                  "y": 126.0892649183647
                },
                {
                  "x": 154.26832095167538,
                  "y": 126.0892649183647
                }
              ]
            }
          ]
        },
        {
          "name": "肘線",
          "kind": "construction",
          "geometry": [
            {
              "type": "line",
              "points": [
                {
                  "x": -174.2875660074769,
                  "y": 285
                },
                {
                  "x": 154.26832095167538,
                  "y": 285
                }
              ]
            }
          ]
        },
        {
          "name": "袖中心線",
          "kind": "construction",
          "geometry": [
            {
              "type": "line",
              "points": [
                {
                  "x": 0,
                  "y": 0
                },
                {
                  "x": 0,
                  "y": 500
                }
              ]
            }
          ]
        }
      ],
      "darts": [],
      "attachmentLines": [],
      "edgeIds": [
        "edge-82fc646c2a1e299c",
        "edge-71d188b2f5d3c3f6",
        "edge-cfac2122d293dafa",
        "edge-69fada447be4eeaa",
        "edge-dd9f083ce3fc49e0"
      ],
      "featureIds": []
    },
    {
      "id": "piece-2f0148776b01da4f",
      "name": "スタンドカラー（直線型）",
      "cut": {
        "quantity": 1,
        "onFold": true,
        "mirroredPair": false,
        "seamAllowance": 0
      },
      "instances": [
        {
          "id": "copy-1",
          "name": "スタンドカラー（直線型）・裁断1",
          "side": "unspecified",
          "mirrored": false
        }
      ],
      "drafting": {
        "source": "operation",
        "derivedFrom": {
          "kind": "stand-collar",
          "sources": [
            {
              "piece": "back",
              "edge": "neckline",
              "direction": 1,
              "lengthMm": 78.39997113310437,
              "shape": "{\"segments\":[{\"start\":{\"x\":0,\"y\":0},\"control1\":{\"x\":49,\"y\":0},\"control2\":{\"x\":64.54355612556641,\"y\":-7.938366687609999},\"end\":{\"x\":70,\"y\":-23.333333333333332}}],\"closed\":false}"
            },
            {
              "piece": "front",
              "edge": "neckline",
              "direction": -1,
              "lengthMm": 110.56360568971647,
              "shape": "{\"segments\":[{\"start\":{\"x\":0,\"y\":80},\"control1\":{\"x\":17.809218152647183,\"y\":80},\"control2\":{\"x\":35.96064497167966,\"y\":69.57354365536696},\"end\":{\"x\":47.922898977038244,\"y\":56.37988114945676}},{\"start\":{\"x\":47.922898977038244,\"y\":56.37988114945676},\"control1\":{\"x\":60.27374238339452,\"y\":42.75762739244616},\"control2\":{\"x\":61.70414460909014,\"y\":22.276322964261666},\"end\":{\"x\":68,\"y\":5}}],\"closed\":false}"
            }
          ]
        },
        "limitation": "直線型。襟の沿い・表裏の構成は着用設計が必要"
      },
      "construction": null,
      "landmarks": {},
      "grainline": [
        {
          "type": "line",
          "points": [
            {
              "x": 40.792715364564174,
              "y": 20
            },
            {
              "x": 163.1708614582567,
              "y": 20
            }
          ]
        }
      ],
      "guides": [],
      "darts": [],
      "attachmentLines": [],
      "edgeIds": [
        "edge-89c1627da6f9f2b3",
        "edge-b0ce8ccd87106b1d",
        "edge-1561d03527c7bd33",
        "edge-548bc8dae9b5aa84",
        "edge-538bc74731cdb53b",
        "edge-2f6c87091bd03fbb"
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
```

[1/5](after-CREATE_STAND_COLLAR-1-1.md) · [2/5](after-CREATE_STAND_COLLAR-1-2.md) · [3/5](after-CREATE_STAND_COLLAR-1-3.md) · [4/5](after-CREATE_STAND_COLLAR-1-4.md) · [5/5](after-CREATE_STAND_COLLAR-1-5.md)
