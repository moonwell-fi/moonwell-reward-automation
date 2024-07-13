export const moonbeamComptroller = '0x8E00D5e02E65A19337Cdba98bbA9F84d4186a180';
export const baseComptroller = '0xfBb21d0380beE3312B33c4353c8936a0F13EF26C';

export const moonbeamOracleContract = {
  address: '0xED301cd3EB27217BDB05C4E9B820a8A3c8B665f9',
  abi: [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_nativeToken",
          "type": "string"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "feed",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "symbol",
          "type": "string"
        }
      ],
      "name": "FeedSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "oldAdmin",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "newAdmin",
          "type": "address"
        }
      ],
      "name": "NewAdmin",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "asset",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "previousPriceMantissa",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "requestedPriceMantissa",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newPriceMantissa",
          "type": "uint256"
        }
      ],
      "name": "PricePosted",
      "type": "event"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "admin",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "internalType": "address",
          "name": "asset",
          "type": "address"
        }
      ],
      "name": "assetPrices",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "internalType": "string",
          "name": "symbol",
          "type": "string"
        }
      ],
      "name": "getFeed",
      "outputs": [
        {
          "internalType": "contract AggregatorV2V3Interface",
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        }
      ],
      "name": "getUnderlyingPrice",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "isPriceOracle",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "nativeToken",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "address",
          "name": "newAdmin",
          "type": "address"
        }
      ],
      "name": "setAdmin",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "address",
          "name": "asset",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        }
      ],
      "name": "setDirectPrice",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "string",
          "name": "symbol",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "feed",
          "type": "address"
        }
      ],
      "name": "setFeed",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "underlyingPriceMantissa",
          "type": "uint256"
        }
      ],
      "name": "setUnderlyingPrice",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
} as const;

export const baseOracleContract = {
  address: '0xEC942bE8A8114bFD0396A5052c36027f2cA6a9d0',
  abi: [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_nativeToken",
          "type": "string"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "feed",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "symbol",
          "type": "string"
        }
      ],
      "name": "FeedSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "oldAdmin",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "newAdmin",
          "type": "address"
        }
      ],
      "name": "NewAdmin",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "asset",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "previousPriceMantissa",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "requestedPriceMantissa",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newPriceMantissa",
          "type": "uint256"
        }
      ],
      "name": "PricePosted",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "admin",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "asset",
          "type": "address"
        }
      ],
      "name": "assetPrices",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "symbol",
          "type": "string"
        }
      ],
      "name": "getFeed",
      "outputs": [
        {
          "internalType": "contract AggregatorV3Interface",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        }
      ],
      "name": "getUnderlyingPrice",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "isPriceOracle",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "nativeToken",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newAdmin",
          "type": "address"
        }
      ],
      "name": "setAdmin",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "asset",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        }
      ],
      "name": "setDirectPrice",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "symbol",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "feed",
          "type": "address"
        }
      ],
      "name": "setFeed",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "underlyingPriceMantissa",
          "type": "uint256"
        }
      ],
      "name": "setUnderlyingPrice",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
} as const;

export const excludedMarkets = [
  {
    address: "0x02e9081DfadD37A852F9a73C4d7d69e615E61334",
    chainId: 1284,
    name: "mUSDC.mad",
  },
  {
    address: "0xc3090f41Eb54A7f18587FD6651d4D3ab477b07a4",
    chainId: 1284,
    name: "mETH.mad",
  },
  {
    address: "0x24A9d8f1f350d59cB0368D3d52A77dB29c833D1D",
    chainId: 1284,
    name: "mBTC.mad",
  },
  {
    address: "0x298f2E346b82D69a473BF25f329BDF869e17dEc8",
    chainId: 1284,
    name: "mBUSD.wh",
  },
]