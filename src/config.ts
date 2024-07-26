import { BigNumber } from "bignumber.js"

export const mainConfig = {
  totalWellPerEpoch: new BigNumber(750_000_000) // 750 million
    .div(4) // 4 years emission schedule
    .div(13) // 13 epochs per year (4 weeks per epoch)
    .integerValue(BigNumber.ROUND_DOWN)
    .toNumber(),
  moonbeam: {
    nativePerEpoch: 187_500, // 1,125,000 GLMR / 6 months (extra 2 weeks from Dec. 1 to Dec. 14th to fund out of treasury)
    markets: 0.48,
    safetyModule: 0.47,
    dex: 0.05,
  },
  base: {
    nativePerEpoch: 0,
    markets: 0.48,
    safetyModule: 0.47,
    dex: 0.05,
  },
  optimism: {
    nativePerEpoch: 29_322.61716,
    markets: 0.48,
    safetyModule: 0.47,
    dex: 0.05,
  },
};

export const moonbeamComptroller = {
  address: '0x8E00D5e02E65A19337Cdba98bbA9F84d4186a180' as `0x${string}`,
  abi: [
    {
      "inputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "action",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "pauseState",
          "type": "bool"
        }
      ],
      "name": "ActionPaused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "action",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "pauseState",
          "type": "bool"
        }
      ],
      "name": "ActionPaused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "rewardToken",
          "type": "uint8"
        },
        {
          "indexed": true,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newBorrowRewardSpeed",
          "type": "uint256"
        }
      ],
      "name": "BorrowRewardSpeedUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "contributor",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newSpeed",
          "type": "uint256"
        }
      ],
      "name": "ContributorWellSpeedUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint8",
          "name": "tokenType",
          "type": "uint8"
        },
        {
          "indexed": true,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "borrower",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "wellDelta",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "wellBorrowIndex",
          "type": "uint256"
        }
      ],
      "name": "DistributedBorrowerReward",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint8",
          "name": "tokenType",
          "type": "uint8"
        },
        {
          "indexed": true,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "supplier",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "wellDelta",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "wellSupplyIndex",
          "type": "uint256"
        }
      ],
      "name": "DistributedSupplierReward",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "error",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "info",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "detail",
          "type": "uint256"
        }
      ],
      "name": "Failure",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "MarketEntered",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "MarketExited",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        }
      ],
      "name": "MarketListed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newBorrowCap",
          "type": "uint256"
        }
      ],
      "name": "NewBorrowCap",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "oldBorrowCapGuardian",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "newBorrowCapGuardian",
          "type": "address"
        }
      ],
      "name": "NewBorrowCapGuardian",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "oldCloseFactorMantissa",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newCloseFactorMantissa",
          "type": "uint256"
        }
      ],
      "name": "NewCloseFactor",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "oldCollateralFactorMantissa",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newCollateralFactorMantissa",
          "type": "uint256"
        }
      ],
      "name": "NewCollateralFactor",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint16",
          "name": "oldGasAmount",
          "type": "uint16"
        },
        {
          "indexed": false,
          "internalType": "uint16",
          "name": "newGasAmount",
          "type": "uint16"
        }
      ],
      "name": "NewGasAmount",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "oldLiquidationIncentiveMantissa",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newLiquidationIncentiveMantissa",
          "type": "uint256"
        }
      ],
      "name": "NewLiquidationIncentive",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "oldPauseGuardian",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "newPauseGuardian",
          "type": "address"
        }
      ],
      "name": "NewPauseGuardian",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "contract PriceOracle",
          "name": "oldPriceOracle",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "contract PriceOracle",
          "name": "newPriceOracle",
          "type": "address"
        }
      ],
      "name": "NewPriceOracle",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "rewardToken",
          "type": "uint8"
        },
        {
          "indexed": true,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newSupplyRewardSpeed",
          "type": "uint256"
        }
      ],
      "name": "SupplyRewardSpeedUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "WellGranted",
      "type": "event"
    },
    {
      "payable": true,
      "stateMutability": "payable",
      "type": "fallback"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "contract Unitroller",
          "name": "unitroller",
          "type": "address"
        }
      ],
      "name": "_become",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "_borrowGuardianPaused",
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
      "constant": false,
      "inputs": [
        {
          "internalType": "address payable",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "_grantWell",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "_mintGuardianPaused",
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
      "constant": false,
      "inputs": [
        {
          "internalType": "address",
          "name": "newBorrowCapGuardian",
          "type": "address"
        }
      ],
      "name": "_setBorrowCapGuardian",
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
          "internalType": "bool",
          "name": "state",
          "type": "bool"
        }
      ],
      "name": "_setBorrowPaused",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "uint256",
          "name": "newCloseFactorMantissa",
          "type": "uint256"
        }
      ],
      "name": "_setCloseFactor",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
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
          "name": "newCollateralFactorMantissa",
          "type": "uint256"
        }
      ],
      "name": "_setCollateralFactor",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "uint16",
          "name": "newGasAmount",
          "type": "uint16"
        }
      ],
      "name": "_setGasAmount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "uint256",
          "name": "newLiquidationIncentiveMantissa",
          "type": "uint256"
        }
      ],
      "name": "_setLiquidationIncentive",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "contract MToken[]",
          "name": "mTokens",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "newBorrowCaps",
          "type": "uint256[]"
        }
      ],
      "name": "_setMarketBorrowCaps",
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
          "internalType": "bool",
          "name": "state",
          "type": "bool"
        }
      ],
      "name": "_setMintPaused",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "address",
          "name": "newPauseGuardian",
          "type": "address"
        }
      ],
      "name": "_setPauseGuardian",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "contract PriceOracle",
          "name": "newOracle",
          "type": "address"
        }
      ],
      "name": "_setPriceOracle",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "uint8",
          "name": "rewardType",
          "type": "uint8"
        },
        {
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "supplyRewardSpeed",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "borrowRewardSpeed",
          "type": "uint256"
        }
      ],
      "name": "_setRewardSpeed",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "bool",
          "name": "state",
          "type": "bool"
        }
      ],
      "name": "_setSeizePaused",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "bool",
          "name": "state",
          "type": "bool"
        }
      ],
      "name": "_setTransferPaused",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
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
        }
      ],
      "name": "_supportMarket",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "accountAssets",
      "outputs": [
        {
          "internalType": "contract MToken",
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
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "allMarkets",
      "outputs": [
        {
          "internalType": "contract MToken",
          "name": "",
          "type": "address"
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
          "name": "mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "borrower",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "borrowAmount",
          "type": "uint256"
        }
      ],
      "name": "borrowAllowed",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "borrowCapGuardian",
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
          "name": "",
          "type": "address"
        }
      ],
      "name": "borrowCaps",
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
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "borrowGuardianPaused",
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
      "inputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "borrowRewardSpeeds",
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
      "constant": false,
      "inputs": [
        {
          "internalType": "address",
          "name": "mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "borrower",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "borrowAmount",
          "type": "uint256"
        }
      ],
      "name": "borrowVerify",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        }
      ],
      "name": "checkMembership",
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
      "constant": false,
      "inputs": [
        {
          "internalType": "uint8",
          "name": "rewardType",
          "type": "uint8"
        },
        {
          "internalType": "address payable",
          "name": "holder",
          "type": "address"
        }
      ],
      "name": "claimReward",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "uint8",
          "name": "rewardType",
          "type": "uint8"
        },
        {
          "internalType": "address payable",
          "name": "holder",
          "type": "address"
        },
        {
          "internalType": "contract MToken[]",
          "name": "mTokens",
          "type": "address[]"
        }
      ],
      "name": "claimReward",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "uint8",
          "name": "rewardType",
          "type": "uint8"
        },
        {
          "internalType": "address payable[]",
          "name": "holders",
          "type": "address[]"
        },
        {
          "internalType": "contract MToken[]",
          "name": "mTokens",
          "type": "address[]"
        },
        {
          "internalType": "bool",
          "name": "borrowers",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "suppliers",
          "type": "bool"
        }
      ],
      "name": "claimReward",
      "outputs": [],
      "payable": true,
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "closeFactorMantissa",
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
      "name": "comptrollerImplementation",
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
      "constant": false,
      "inputs": [
        {
          "internalType": "address[]",
          "name": "mTokens",
          "type": "address[]"
        }
      ],
      "name": "enterMarkets",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "address",
          "name": "mTokenAddress",
          "type": "address"
        }
      ],
      "name": "exitMarket",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "gasAmount",
      "outputs": [
        {
          "internalType": "uint16",
          "name": "",
          "type": "uint16"
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
          "name": "account",
          "type": "address"
        }
      ],
      "name": "getAccountLiquidity",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
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
      "name": "getAllMarkets",
      "outputs": [
        {
          "internalType": "contract MToken[]",
          "name": "",
          "type": "address[]"
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
          "name": "account",
          "type": "address"
        }
      ],
      "name": "getAssetsIn",
      "outputs": [
        {
          "internalType": "contract MToken[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "getBlockTimestamp",
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
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "mTokenModify",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "redeemTokens",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "borrowAmount",
          "type": "uint256"
        }
      ],
      "name": "getHypotheticalAccountLiquidity",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
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
      "name": "initialIndexConstant",
      "outputs": [
        {
          "internalType": "uint224",
          "name": "",
          "type": "uint224"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "isComptroller",
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
      "constant": false,
      "inputs": [
        {
          "internalType": "address",
          "name": "mTokenBorrowed",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "mTokenCollateral",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "liquidator",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "borrower",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "repayAmount",
          "type": "uint256"
        }
      ],
      "name": "liquidateBorrowAllowed",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "address",
          "name": "mTokenBorrowed",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "mTokenCollateral",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "liquidator",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "borrower",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "actualRepayAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "seizeTokens",
          "type": "uint256"
        }
      ],
      "name": "liquidateBorrowVerify",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "internalType": "address",
          "name": "mTokenBorrowed",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "mTokenCollateral",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "actualRepayAmount",
          "type": "uint256"
        }
      ],
      "name": "liquidateCalculateSeizeTokens",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
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
      "name": "liquidationIncentiveMantissa",
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
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "markets",
      "outputs": [
        {
          "internalType": "bool",
          "name": "isListed",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "collateralFactorMantissa",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isWelled",
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
      "name": "maxAssets",
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
      "constant": false,
      "inputs": [
        {
          "internalType": "address",
          "name": "mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "minter",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "mintAmount",
          "type": "uint256"
        }
      ],
      "name": "mintAllowed",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "mintGuardianPaused",
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
      "constant": false,
      "inputs": [
        {
          "internalType": "address",
          "name": "mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "minter",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "actualMintAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "mintTokens",
          "type": "uint256"
        }
      ],
      "name": "mintVerify",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "oracle",
      "outputs": [
        {
          "internalType": "contract PriceOracle",
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
      "inputs": [],
      "name": "pauseGuardian",
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
      "inputs": [],
      "name": "pendingAdmin",
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
      "inputs": [],
      "name": "pendingComptrollerImplementation",
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
      "constant": false,
      "inputs": [
        {
          "internalType": "address",
          "name": "mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "redeemer",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "redeemTokens",
          "type": "uint256"
        }
      ],
      "name": "redeemAllowed",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "address",
          "name": "mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "redeemer",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "redeemAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "redeemTokens",
          "type": "uint256"
        }
      ],
      "name": "redeemVerify",
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
          "name": "mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "payer",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "borrower",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "repayAmount",
          "type": "uint256"
        }
      ],
      "name": "repayBorrowAllowed",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "address",
          "name": "mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "payer",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "borrower",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "actualRepayAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "borrowerIndex",
          "type": "uint256"
        }
      ],
      "name": "repayBorrowVerify",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "rewardAccrued",
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
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "rewardBorrowState",
      "outputs": [
        {
          "internalType": "uint224",
          "name": "index",
          "type": "uint224"
        },
        {
          "internalType": "uint32",
          "name": "timestamp",
          "type": "uint32"
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
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "rewardBorrowerIndex",
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
      "name": "rewardGlmr",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
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
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "rewardSupplierIndex",
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
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "rewardSupplyState",
      "outputs": [
        {
          "internalType": "uint224",
          "name": "index",
          "type": "uint224"
        },
        {
          "internalType": "uint32",
          "name": "timestamp",
          "type": "uint32"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "rewardWell",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
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
          "name": "mTokenCollateral",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "mTokenBorrowed",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "liquidator",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "borrower",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "seizeTokens",
          "type": "uint256"
        }
      ],
      "name": "seizeAllowed",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "seizeGuardianPaused",
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
      "constant": false,
      "inputs": [
        {
          "internalType": "address",
          "name": "mTokenCollateral",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "mTokenBorrowed",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "liquidator",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "borrower",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "seizeTokens",
          "type": "uint256"
        }
      ],
      "name": "seizeVerify",
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
          "name": "newWellAddress",
          "type": "address"
        }
      ],
      "name": "setWellAddress",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "supplyRewardSpeeds",
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
      "constant": false,
      "inputs": [
        {
          "internalType": "address",
          "name": "mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "src",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "dst",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "transferTokens",
          "type": "uint256"
        }
      ],
      "name": "transferAllowed",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "transferGuardianPaused",
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
      "constant": false,
      "inputs": [
        {
          "internalType": "address",
          "name": "mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "src",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "dst",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "transferTokens",
          "type": "uint256"
        }
      ],
      "name": "transferVerify",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "wellAddress",
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
    }
  ],
} as const;

export const baseComptroller = {
  address: '0xfBb21d0380beE3312B33c4353c8936a0F13EF26C' as `0x${string}`,
  abi: [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "action",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "pauseState",
          "type": "bool"
        }
      ],
      "name": "ActionPaused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "action",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "pauseState",
          "type": "bool"
        }
      ],
      "name": "ActionPaused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "error",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "info",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "detail",
          "type": "uint256"
        }
      ],
      "name": "Failure",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "MarketEntered",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "MarketExited",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        }
      ],
      "name": "MarketListed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newBorrowCap",
          "type": "uint256"
        }
      ],
      "name": "NewBorrowCap",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "oldBorrowCapGuardian",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "newBorrowCapGuardian",
          "type": "address"
        }
      ],
      "name": "NewBorrowCapGuardian",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "oldCloseFactorMantissa",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newCloseFactorMantissa",
          "type": "uint256"
        }
      ],
      "name": "NewCloseFactor",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "oldCollateralFactorMantissa",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newCollateralFactorMantissa",
          "type": "uint256"
        }
      ],
      "name": "NewCollateralFactor",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "oldLiquidationIncentiveMantissa",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newLiquidationIncentiveMantissa",
          "type": "uint256"
        }
      ],
      "name": "NewLiquidationIncentive",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "oldPauseGuardian",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "newPauseGuardian",
          "type": "address"
        }
      ],
      "name": "NewPauseGuardian",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "contract PriceOracle",
          "name": "oldPriceOracle",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "contract PriceOracle",
          "name": "newPriceOracle",
          "type": "address"
        }
      ],
      "name": "NewPriceOracle",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "contract MultiRewardDistributor",
          "name": "oldRewardDistributor",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "contract MultiRewardDistributor",
          "name": "newRewardDistributor",
          "type": "address"
        }
      ],
      "name": "NewRewardDistributor",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newSupplyCap",
          "type": "uint256"
        }
      ],
      "name": "NewSupplyCap",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "oldSupplyCapGuardian",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "newSupplyCapGuardian",
          "type": "address"
        }
      ],
      "name": "NewSupplyCapGuardian",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "contract Unitroller",
          "name": "unitroller",
          "type": "address"
        }
      ],
      "name": "_become",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_tokenAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "_rescueFunds",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newBorrowCapGuardian",
          "type": "address"
        }
      ],
      "name": "_setBorrowCapGuardian",
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
          "internalType": "bool",
          "name": "state",
          "type": "bool"
        }
      ],
      "name": "_setBorrowPaused",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "newCloseFactorMantissa",
          "type": "uint256"
        }
      ],
      "name": "_setCloseFactor",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
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
          "name": "newCollateralFactorMantissa",
          "type": "uint256"
        }
      ],
      "name": "_setCollateralFactor",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "newLiquidationIncentiveMantissa",
          "type": "uint256"
        }
      ],
      "name": "_setLiquidationIncentive",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract MToken[]",
          "name": "mTokens",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "newBorrowCaps",
          "type": "uint256[]"
        }
      ],
      "name": "_setMarketBorrowCaps",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract MToken[]",
          "name": "mTokens",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "newSupplyCaps",
          "type": "uint256[]"
        }
      ],
      "name": "_setMarketSupplyCaps",
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
          "internalType": "bool",
          "name": "state",
          "type": "bool"
        }
      ],
      "name": "_setMintPaused",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newPauseGuardian",
          "type": "address"
        }
      ],
      "name": "_setPauseGuardian",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract PriceOracle",
          "name": "newOracle",
          "type": "address"
        }
      ],
      "name": "_setPriceOracle",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract MultiRewardDistributor",
          "name": "newRewardDistributor",
          "type": "address"
        }
      ],
      "name": "_setRewardDistributor",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bool",
          "name": "state",
          "type": "bool"
        }
      ],
      "name": "_setSeizePaused",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newSupplyCapGuardian",
          "type": "address"
        }
      ],
      "name": "_setSupplyCapGuardian",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bool",
          "name": "state",
          "type": "bool"
        }
      ],
      "name": "_setTransferPaused",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
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
      "name": "_supportMarket",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "accountAssets",
      "outputs": [
        {
          "internalType": "contract MToken",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
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
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "allMarkets",
      "outputs": [
        {
          "internalType": "contract MToken",
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
          "name": "mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "borrower",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "borrowAmount",
          "type": "uint256"
        }
      ],
      "name": "borrowAllowed",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "borrowCapGuardian",
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
          "name": "",
          "type": "address"
        }
      ],
      "name": "borrowCaps",
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
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "borrowGuardianPaused",
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
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        }
      ],
      "name": "checkMembership",
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
      "inputs": [
        {
          "internalType": "address[]",
          "name": "holders",
          "type": "address[]"
        },
        {
          "internalType": "contract MToken[]",
          "name": "mTokens",
          "type": "address[]"
        },
        {
          "internalType": "bool",
          "name": "borrowers",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "suppliers",
          "type": "bool"
        }
      ],
      "name": "claimReward",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "holder",
          "type": "address"
        },
        {
          "internalType": "contract MToken[]",
          "name": "mTokens",
          "type": "address[]"
        }
      ],
      "name": "claimReward",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "claimReward",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "holder",
          "type": "address"
        }
      ],
      "name": "claimReward",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "closeFactorMantissa",
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
      "name": "comptrollerImplementation",
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
          "internalType": "address[]",
          "name": "mTokens",
          "type": "address[]"
        }
      ],
      "name": "enterMarkets",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "mTokenAddress",
          "type": "address"
        }
      ],
      "name": "exitMarket",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "getAccountLiquidity",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
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
      "name": "getAllMarkets",
      "outputs": [
        {
          "internalType": "contract MToken[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "getAssetsIn",
      "outputs": [
        {
          "internalType": "contract MToken[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getBlockTimestamp",
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
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "mTokenModify",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "redeemTokens",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "borrowAmount",
          "type": "uint256"
        }
      ],
      "name": "getHypotheticalAccountLiquidity",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
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
      "name": "isComptroller",
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
      "inputs": [
        {
          "internalType": "address",
          "name": "mTokenBorrowed",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "mTokenCollateral",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "liquidator",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "borrower",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "repayAmount",
          "type": "uint256"
        }
      ],
      "name": "liquidateBorrowAllowed",
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
          "internalType": "address",
          "name": "mTokenBorrowed",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "mTokenCollateral",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "actualRepayAmount",
          "type": "uint256"
        }
      ],
      "name": "liquidateCalculateSeizeTokens",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
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
      "name": "liquidationIncentiveMantissa",
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
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "markets",
      "outputs": [
        {
          "internalType": "bool",
          "name": "isListed",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "collateralFactorMantissa",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "minter",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "mintAmount",
          "type": "uint256"
        }
      ],
      "name": "mintAllowed",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "mintGuardianPaused",
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
      "name": "oracle",
      "outputs": [
        {
          "internalType": "contract PriceOracle",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "pauseGuardian",
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
      "inputs": [],
      "name": "pendingAdmin",
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
      "inputs": [],
      "name": "pendingComptrollerImplementation",
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
          "name": "mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "redeemer",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "redeemTokens",
          "type": "uint256"
        }
      ],
      "name": "redeemAllowed",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "redeemer",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "redeemAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "redeemTokens",
          "type": "uint256"
        }
      ],
      "name": "redeemVerify",
      "outputs": [],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "payer",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "borrower",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "repayAmount",
          "type": "uint256"
        }
      ],
      "name": "repayBorrowAllowed",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "rewardDistributor",
      "outputs": [
        {
          "internalType": "contract MultiRewardDistributor",
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
          "name": "mTokenCollateral",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "mTokenBorrowed",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "liquidator",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "borrower",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "seizeTokens",
          "type": "uint256"
        }
      ],
      "name": "seizeAllowed",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "seizeGuardianPaused",
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
      "name": "supplyCapGuardian",
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
          "name": "",
          "type": "address"
        }
      ],
      "name": "supplyCaps",
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
          "internalType": "address",
          "name": "mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "src",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "dst",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "transferTokens",
          "type": "uint256"
        }
      ],
      "name": "transferAllowed",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "transferGuardianPaused",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ],
} as const;

export const optimismComptroller = {
  address: '0xCa889f40aae37FFf165BccF69aeF1E82b5C511B9' as `0x${string}`,
  abi: [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "action",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "pauseState",
          "type": "bool"
        }
      ],
      "name": "ActionPaused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "action",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "pauseState",
          "type": "bool"
        }
      ],
      "name": "ActionPaused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "error",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "info",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "detail",
          "type": "uint256"
        }
      ],
      "name": "Failure",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "MarketEntered",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "MarketExited",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        }
      ],
      "name": "MarketListed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newBorrowCap",
          "type": "uint256"
        }
      ],
      "name": "NewBorrowCap",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "oldBorrowCapGuardian",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "newBorrowCapGuardian",
          "type": "address"
        }
      ],
      "name": "NewBorrowCapGuardian",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "oldCloseFactorMantissa",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newCloseFactorMantissa",
          "type": "uint256"
        }
      ],
      "name": "NewCloseFactor",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "oldCollateralFactorMantissa",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newCollateralFactorMantissa",
          "type": "uint256"
        }
      ],
      "name": "NewCollateralFactor",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "oldLiquidationIncentiveMantissa",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newLiquidationIncentiveMantissa",
          "type": "uint256"
        }
      ],
      "name": "NewLiquidationIncentive",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "oldPauseGuardian",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "newPauseGuardian",
          "type": "address"
        }
      ],
      "name": "NewPauseGuardian",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "contract PriceOracle",
          "name": "oldPriceOracle",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "contract PriceOracle",
          "name": "newPriceOracle",
          "type": "address"
        }
      ],
      "name": "NewPriceOracle",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "contract MultiRewardDistributor",
          "name": "oldRewardDistributor",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "contract MultiRewardDistributor",
          "name": "newRewardDistributor",
          "type": "address"
        }
      ],
      "name": "NewRewardDistributor",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newSupplyCap",
          "type": "uint256"
        }
      ],
      "name": "NewSupplyCap",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "oldSupplyCapGuardian",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "newSupplyCapGuardian",
          "type": "address"
        }
      ],
      "name": "NewSupplyCapGuardian",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "contract Unitroller",
          "name": "unitroller",
          "type": "address"
        }
      ],
      "name": "_become",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_tokenAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "_rescueFunds",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newBorrowCapGuardian",
          "type": "address"
        }
      ],
      "name": "_setBorrowCapGuardian",
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
          "internalType": "bool",
          "name": "state",
          "type": "bool"
        }
      ],
      "name": "_setBorrowPaused",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "newCloseFactorMantissa",
          "type": "uint256"
        }
      ],
      "name": "_setCloseFactor",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
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
          "name": "newCollateralFactorMantissa",
          "type": "uint256"
        }
      ],
      "name": "_setCollateralFactor",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "newLiquidationIncentiveMantissa",
          "type": "uint256"
        }
      ],
      "name": "_setLiquidationIncentive",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract MToken[]",
          "name": "mTokens",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "newBorrowCaps",
          "type": "uint256[]"
        }
      ],
      "name": "_setMarketBorrowCaps",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract MToken[]",
          "name": "mTokens",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "newSupplyCaps",
          "type": "uint256[]"
        }
      ],
      "name": "_setMarketSupplyCaps",
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
          "internalType": "bool",
          "name": "state",
          "type": "bool"
        }
      ],
      "name": "_setMintPaused",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newPauseGuardian",
          "type": "address"
        }
      ],
      "name": "_setPauseGuardian",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract PriceOracle",
          "name": "newOracle",
          "type": "address"
        }
      ],
      "name": "_setPriceOracle",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract MultiRewardDistributor",
          "name": "newRewardDistributor",
          "type": "address"
        }
      ],
      "name": "_setRewardDistributor",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bool",
          "name": "state",
          "type": "bool"
        }
      ],
      "name": "_setSeizePaused",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newSupplyCapGuardian",
          "type": "address"
        }
      ],
      "name": "_setSupplyCapGuardian",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bool",
          "name": "state",
          "type": "bool"
        }
      ],
      "name": "_setTransferPaused",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
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
      "name": "_supportMarket",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "accountAssets",
      "outputs": [
        {
          "internalType": "contract MToken",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
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
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "allMarkets",
      "outputs": [
        {
          "internalType": "contract MToken",
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
          "name": "mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "borrower",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "borrowAmount",
          "type": "uint256"
        }
      ],
      "name": "borrowAllowed",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "borrowCapGuardian",
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
          "name": "",
          "type": "address"
        }
      ],
      "name": "borrowCaps",
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
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "borrowGuardianPaused",
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
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        }
      ],
      "name": "checkMembership",
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
      "inputs": [
        {
          "internalType": "address[]",
          "name": "holders",
          "type": "address[]"
        },
        {
          "internalType": "contract MToken[]",
          "name": "mTokens",
          "type": "address[]"
        },
        {
          "internalType": "bool",
          "name": "borrowers",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "suppliers",
          "type": "bool"
        }
      ],
      "name": "claimReward",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "holder",
          "type": "address"
        },
        {
          "internalType": "contract MToken[]",
          "name": "mTokens",
          "type": "address[]"
        }
      ],
      "name": "claimReward",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "claimReward",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "holder",
          "type": "address"
        }
      ],
      "name": "claimReward",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "closeFactorMantissa",
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
      "name": "comptrollerImplementation",
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
          "internalType": "address[]",
          "name": "mTokens",
          "type": "address[]"
        }
      ],
      "name": "enterMarkets",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "mTokenAddress",
          "type": "address"
        }
      ],
      "name": "exitMarket",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "getAccountLiquidity",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
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
      "name": "getAllMarkets",
      "outputs": [
        {
          "internalType": "contract MToken[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "getAssetsIn",
      "outputs": [
        {
          "internalType": "contract MToken[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getBlockTimestamp",
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
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "mTokenModify",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "redeemTokens",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "borrowAmount",
          "type": "uint256"
        }
      ],
      "name": "getHypotheticalAccountLiquidity",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
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
      "name": "isComptroller",
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
      "inputs": [
        {
          "internalType": "address",
          "name": "mTokenBorrowed",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "mTokenCollateral",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "liquidator",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "borrower",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "repayAmount",
          "type": "uint256"
        }
      ],
      "name": "liquidateBorrowAllowed",
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
          "internalType": "address",
          "name": "mTokenBorrowed",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "mTokenCollateral",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "actualRepayAmount",
          "type": "uint256"
        }
      ],
      "name": "liquidateCalculateSeizeTokens",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
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
      "name": "liquidationIncentiveMantissa",
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
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "markets",
      "outputs": [
        {
          "internalType": "bool",
          "name": "isListed",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "collateralFactorMantissa",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "minter",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "mintAmount",
          "type": "uint256"
        }
      ],
      "name": "mintAllowed",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "mintGuardianPaused",
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
      "name": "oracle",
      "outputs": [
        {
          "internalType": "contract PriceOracle",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "pauseGuardian",
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
      "inputs": [],
      "name": "pendingAdmin",
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
      "inputs": [],
      "name": "pendingComptrollerImplementation",
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
          "name": "mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "redeemer",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "redeemTokens",
          "type": "uint256"
        }
      ],
      "name": "redeemAllowed",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "redeemer",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "redeemAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "redeemTokens",
          "type": "uint256"
        }
      ],
      "name": "redeemVerify",
      "outputs": [],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "payer",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "borrower",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "repayAmount",
          "type": "uint256"
        }
      ],
      "name": "repayBorrowAllowed",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "rewardDistributor",
      "outputs": [
        {
          "internalType": "contract MultiRewardDistributor",
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
          "name": "mTokenCollateral",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "mTokenBorrowed",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "liquidator",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "borrower",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "seizeTokens",
          "type": "uint256"
        }
      ],
      "name": "seizeAllowed",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "seizeGuardianPaused",
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
      "name": "supplyCapGuardian",
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
          "name": "",
          "type": "address"
        }
      ],
      "name": "supplyCaps",
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
          "internalType": "address",
          "name": "mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "src",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "dst",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "transferTokens",
          "type": "uint256"
        }
      ],
      "name": "transferAllowed",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "transferGuardianPaused",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ],
} as const;

export const moonbeamOracleContract = {
  address: '0xED301cd3EB27217BDB05C4E9B820a8A3c8B665f9' as `0x${string}`,
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
  address: '0xEC942bE8A8114bFD0396A5052c36027f2cA6a9d0' as `0x${string}`,
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

export const optimismOracleContract = {
  address: '0x2f1490bD6aD10C9CE42a2829afa13EAc0b746dcf' as `0x${string}`,
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

export const baseMultiRewardDistributor = {
  address: '0xe9005b078701e2A0948D2EaC43010D35870Ad9d2' as `0x${string}`,
  abi: [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "borrower",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "emissionToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "totalAccrued",
          "type": "uint256"
        }
      ],
      "name": "DisbursedBorrowerRewards",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "supplier",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "emissionToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "totalAccrued",
          "type": "uint256"
        }
      ],
      "name": "DisbursedSupplierRewards",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "FundsRescued",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "emissionToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newIndex",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint32",
          "name": "newTimestamp",
          "type": "uint32"
        }
      ],
      "name": "GlobalBorrowIndexUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "emissionToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newSupplyIndex",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint32",
          "name": "newSupplyGlobalTimestamp",
          "type": "uint32"
        }
      ],
      "name": "GlobalSupplyIndexUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "version",
          "type": "uint8"
        }
      ],
      "name": "Initialized",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address payable",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "rewardToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "InsufficientTokensToEmit",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "emissionToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "oldRewardSpeed",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newRewardSpeed",
          "type": "uint256"
        }
      ],
      "name": "NewBorrowRewardSpeed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "emissionToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "supplySpeed",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "borrowSpeed",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "endTime",
          "type": "uint256"
        }
      ],
      "name": "NewConfigCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "oldEmissionCap",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newEmissionCap",
          "type": "uint256"
        }
      ],
      "name": "NewEmissionCap",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "emissionToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "currentOwner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "NewEmissionConfigOwner",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "oldPauseGuardian",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "newPauseGuardian",
          "type": "address"
        }
      ],
      "name": "NewPauseGuardian",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "emissionToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "currentEndTime",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newEndTime",
          "type": "uint256"
        }
      ],
      "name": "NewRewardEndTime",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "emissionToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "oldRewardSpeed",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newRewardSpeed",
          "type": "uint256"
        }
      ],
      "name": "NewSupplyRewardSpeed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Paused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [],
      "name": "RewardsPaused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [],
      "name": "RewardsUnpaused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Unpaused",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "contract MToken",
          "name": "_mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_emissionToken",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_supplyEmissionPerSec",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_borrowEmissionsPerSec",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_endTime",
          "type": "uint256"
        }
      ],
      "name": "_addEmissionConfig",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "_pauseRewards",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_tokenAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "_rescueFunds",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_newEmissionCap",
          "type": "uint256"
        }
      ],
      "name": "_setEmissionCap",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_newPauseGuardian",
          "type": "address"
        }
      ],
      "name": "_setPauseGuardian",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "_unpauseRewards",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract MToken",
          "name": "_mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_emissionToken",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_newBorrowSpeed",
          "type": "uint256"
        }
      ],
      "name": "_updateBorrowSpeed",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract MToken",
          "name": "_mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_emissionToken",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_newEndTime",
          "type": "uint256"
        }
      ],
      "name": "_updateEndTime",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract MToken",
          "name": "_mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_emissionToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_newOwner",
          "type": "address"
        }
      ],
      "name": "_updateOwner",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract MToken",
          "name": "_mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_emissionToken",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_newSupplySpeed",
          "type": "uint256"
        }
      ],
      "name": "_updateSupplySpeed",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "comptroller",
      "outputs": [
        {
          "internalType": "contract Comptroller",
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
          "name": "_mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_borrower",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "_sendTokens",
          "type": "bool"
        }
      ],
      "name": "disburseBorrowerRewards",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract MToken",
          "name": "_mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_supplier",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "_sendTokens",
          "type": "bool"
        }
      ],
      "name": "disburseSupplierRewards",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "emissionCap",
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
          "internalType": "contract MToken",
          "name": "_mToken",
          "type": "address"
        }
      ],
      "name": "getAllMarketConfigs",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "emissionToken",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "endTime",
              "type": "uint256"
            },
            {
              "internalType": "uint224",
              "name": "supplyGlobalIndex",
              "type": "uint224"
            },
            {
              "internalType": "uint32",
              "name": "supplyGlobalTimestamp",
              "type": "uint32"
            },
            {
              "internalType": "uint224",
              "name": "borrowGlobalIndex",
              "type": "uint224"
            },
            {
              "internalType": "uint32",
              "name": "borrowGlobalTimestamp",
              "type": "uint32"
            },
            {
              "internalType": "uint256",
              "name": "supplyEmissionsPerSec",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "borrowEmissionsPerSec",
              "type": "uint256"
            }
          ],
          "internalType": "struct MultiRewardDistributorCommon.MarketConfig[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract MToken",
          "name": "_mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_emissionToken",
          "type": "address"
        }
      ],
      "name": "getConfigForMarket",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "emissionToken",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "endTime",
              "type": "uint256"
            },
            {
              "internalType": "uint224",
              "name": "supplyGlobalIndex",
              "type": "uint224"
            },
            {
              "internalType": "uint32",
              "name": "supplyGlobalTimestamp",
              "type": "uint32"
            },
            {
              "internalType": "uint224",
              "name": "borrowGlobalIndex",
              "type": "uint224"
            },
            {
              "internalType": "uint32",
              "name": "borrowGlobalTimestamp",
              "type": "uint32"
            },
            {
              "internalType": "uint256",
              "name": "supplyEmissionsPerSec",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "borrowEmissionsPerSec",
              "type": "uint256"
            }
          ],
          "internalType": "struct MultiRewardDistributorCommon.MarketConfig",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getCurrentEmissionCap",
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
          "internalType": "contract MToken",
          "name": "_mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_emissionToken",
          "type": "address"
        }
      ],
      "name": "getCurrentOwner",
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
          "name": "mToken",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "getGlobalBorrowIndex",
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
          "internalType": "address",
          "name": "mToken",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "getGlobalSupplyIndex",
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
          "internalType": "contract MToken",
          "name": "_mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getOutstandingRewardsForUser",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "emissionToken",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "totalAmount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "supplySide",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "borrowSide",
              "type": "uint256"
            }
          ],
          "internalType": "struct MultiRewardDistributorCommon.RewardInfo[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getOutstandingRewardsForUser",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "mToken",
              "type": "address"
            },
            {
              "components": [
                {
                  "internalType": "address",
                  "name": "emissionToken",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "totalAmount",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "supplySide",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "borrowSide",
                  "type": "uint256"
                }
              ],
              "internalType": "struct MultiRewardDistributorCommon.RewardInfo[]",
              "name": "rewards",
              "type": "tuple[]"
            }
          ],
          "internalType": "struct MultiRewardDistributorCommon.RewardWithMToken[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "initialIndexConstant",
      "outputs": [
        {
          "internalType": "uint224",
          "name": "",
          "type": "uint224"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_comptroller",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_pauseGuardian",
          "type": "address"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "marketConfigs",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "emissionToken",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "endTime",
              "type": "uint256"
            },
            {
              "internalType": "uint224",
              "name": "supplyGlobalIndex",
              "type": "uint224"
            },
            {
              "internalType": "uint32",
              "name": "supplyGlobalTimestamp",
              "type": "uint32"
            },
            {
              "internalType": "uint224",
              "name": "borrowGlobalIndex",
              "type": "uint224"
            },
            {
              "internalType": "uint32",
              "name": "borrowGlobalTimestamp",
              "type": "uint32"
            },
            {
              "internalType": "uint256",
              "name": "supplyEmissionsPerSec",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "borrowEmissionsPerSec",
              "type": "uint256"
            }
          ],
          "internalType": "struct MultiRewardDistributorCommon.MarketConfig",
          "name": "config",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "pauseGuardian",
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
      "inputs": [],
      "name": "paused",
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
      "inputs": [
        {
          "internalType": "contract MToken",
          "name": "_mToken",
          "type": "address"
        }
      ],
      "name": "updateMarketBorrowIndex",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract MToken",
          "name": "_mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_borrower",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "_sendTokens",
          "type": "bool"
        }
      ],
      "name": "updateMarketBorrowIndexAndDisburseBorrowerRewards",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract MToken",
          "name": "_mToken",
          "type": "address"
        }
      ],
      "name": "updateMarketSupplyIndex",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract MToken",
          "name": "_mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_supplier",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "_sendTokens",
          "type": "bool"
        }
      ],
      "name": "updateMarketSupplyIndexAndDisburseSupplierRewards",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
} as const;

export const optimismMultiRewardDistributor = {
  address: '0xF9524bfa18C19C3E605FbfE8DFd05C6e967574Aa' as `0x${string}`,
  abi: [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "borrower",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "emissionToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "totalAccrued",
          "type": "uint256"
        }
      ],
      "name": "DisbursedBorrowerRewards",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "supplier",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "emissionToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "totalAccrued",
          "type": "uint256"
        }
      ],
      "name": "DisbursedSupplierRewards",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "FundsRescued",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "emissionToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newIndex",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint32",
          "name": "newTimestamp",
          "type": "uint32"
        }
      ],
      "name": "GlobalBorrowIndexUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "emissionToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newSupplyIndex",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint32",
          "name": "newSupplyGlobalTimestamp",
          "type": "uint32"
        }
      ],
      "name": "GlobalSupplyIndexUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "version",
          "type": "uint8"
        }
      ],
      "name": "Initialized",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address payable",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "rewardToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "InsufficientTokensToEmit",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "emissionToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "oldRewardSpeed",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newRewardSpeed",
          "type": "uint256"
        }
      ],
      "name": "NewBorrowRewardSpeed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "emissionToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "supplySpeed",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "borrowSpeed",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "endTime",
          "type": "uint256"
        }
      ],
      "name": "NewConfigCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "oldEmissionCap",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newEmissionCap",
          "type": "uint256"
        }
      ],
      "name": "NewEmissionCap",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "emissionToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "currentOwner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "NewEmissionConfigOwner",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "oldPauseGuardian",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "newPauseGuardian",
          "type": "address"
        }
      ],
      "name": "NewPauseGuardian",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "emissionToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "currentEndTime",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newEndTime",
          "type": "uint256"
        }
      ],
      "name": "NewRewardEndTime",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "contract MToken",
          "name": "mToken",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "emissionToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "oldRewardSpeed",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newRewardSpeed",
          "type": "uint256"
        }
      ],
      "name": "NewSupplyRewardSpeed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Paused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [],
      "name": "RewardsPaused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [],
      "name": "RewardsUnpaused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Unpaused",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "contract MToken",
          "name": "_mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_emissionToken",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_supplyEmissionPerSec",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_borrowEmissionsPerSec",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_endTime",
          "type": "uint256"
        }
      ],
      "name": "_addEmissionConfig",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "_pauseRewards",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_tokenAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "_rescueFunds",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_newEmissionCap",
          "type": "uint256"
        }
      ],
      "name": "_setEmissionCap",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_newPauseGuardian",
          "type": "address"
        }
      ],
      "name": "_setPauseGuardian",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "_unpauseRewards",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract MToken",
          "name": "_mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_emissionToken",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_newBorrowSpeed",
          "type": "uint256"
        }
      ],
      "name": "_updateBorrowSpeed",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract MToken",
          "name": "_mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_emissionToken",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_newEndTime",
          "type": "uint256"
        }
      ],
      "name": "_updateEndTime",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract MToken",
          "name": "_mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_emissionToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_newOwner",
          "type": "address"
        }
      ],
      "name": "_updateOwner",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract MToken",
          "name": "_mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_emissionToken",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_newSupplySpeed",
          "type": "uint256"
        }
      ],
      "name": "_updateSupplySpeed",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "comptroller",
      "outputs": [
        {
          "internalType": "contract Comptroller",
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
          "name": "_mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_borrower",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "_sendTokens",
          "type": "bool"
        }
      ],
      "name": "disburseBorrowerRewards",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract MToken",
          "name": "_mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_supplier",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "_sendTokens",
          "type": "bool"
        }
      ],
      "name": "disburseSupplierRewards",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "emissionCap",
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
          "internalType": "contract MToken",
          "name": "_mToken",
          "type": "address"
        }
      ],
      "name": "getAllMarketConfigs",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "emissionToken",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "endTime",
              "type": "uint256"
            },
            {
              "internalType": "uint224",
              "name": "supplyGlobalIndex",
              "type": "uint224"
            },
            {
              "internalType": "uint32",
              "name": "supplyGlobalTimestamp",
              "type": "uint32"
            },
            {
              "internalType": "uint224",
              "name": "borrowGlobalIndex",
              "type": "uint224"
            },
            {
              "internalType": "uint32",
              "name": "borrowGlobalTimestamp",
              "type": "uint32"
            },
            {
              "internalType": "uint256",
              "name": "supplyEmissionsPerSec",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "borrowEmissionsPerSec",
              "type": "uint256"
            }
          ],
          "internalType": "struct MultiRewardDistributorCommon.MarketConfig[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract MToken",
          "name": "_mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_emissionToken",
          "type": "address"
        }
      ],
      "name": "getConfigForMarket",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "emissionToken",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "endTime",
              "type": "uint256"
            },
            {
              "internalType": "uint224",
              "name": "supplyGlobalIndex",
              "type": "uint224"
            },
            {
              "internalType": "uint32",
              "name": "supplyGlobalTimestamp",
              "type": "uint32"
            },
            {
              "internalType": "uint224",
              "name": "borrowGlobalIndex",
              "type": "uint224"
            },
            {
              "internalType": "uint32",
              "name": "borrowGlobalTimestamp",
              "type": "uint32"
            },
            {
              "internalType": "uint256",
              "name": "supplyEmissionsPerSec",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "borrowEmissionsPerSec",
              "type": "uint256"
            }
          ],
          "internalType": "struct MultiRewardDistributorCommon.MarketConfig",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getCurrentEmissionCap",
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
          "internalType": "contract MToken",
          "name": "_mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_emissionToken",
          "type": "address"
        }
      ],
      "name": "getCurrentOwner",
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
          "name": "mToken",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "getGlobalBorrowIndex",
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
          "internalType": "address",
          "name": "mToken",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "getGlobalSupplyIndex",
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
          "internalType": "contract MToken",
          "name": "_mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getOutstandingRewardsForUser",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "emissionToken",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "totalAmount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "supplySide",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "borrowSide",
              "type": "uint256"
            }
          ],
          "internalType": "struct MultiRewardDistributorCommon.RewardInfo[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getOutstandingRewardsForUser",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "mToken",
              "type": "address"
            },
            {
              "components": [
                {
                  "internalType": "address",
                  "name": "emissionToken",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "totalAmount",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "supplySide",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "borrowSide",
                  "type": "uint256"
                }
              ],
              "internalType": "struct MultiRewardDistributorCommon.RewardInfo[]",
              "name": "rewards",
              "type": "tuple[]"
            }
          ],
          "internalType": "struct MultiRewardDistributorCommon.RewardWithMToken[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "initialIndexConstant",
      "outputs": [
        {
          "internalType": "uint224",
          "name": "",
          "type": "uint224"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_comptroller",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_pauseGuardian",
          "type": "address"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "marketConfigs",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "emissionToken",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "endTime",
              "type": "uint256"
            },
            {
              "internalType": "uint224",
              "name": "supplyGlobalIndex",
              "type": "uint224"
            },
            {
              "internalType": "uint32",
              "name": "supplyGlobalTimestamp",
              "type": "uint32"
            },
            {
              "internalType": "uint224",
              "name": "borrowGlobalIndex",
              "type": "uint224"
            },
            {
              "internalType": "uint32",
              "name": "borrowGlobalTimestamp",
              "type": "uint32"
            },
            {
              "internalType": "uint256",
              "name": "supplyEmissionsPerSec",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "borrowEmissionsPerSec",
              "type": "uint256"
            }
          ],
          "internalType": "struct MultiRewardDistributorCommon.MarketConfig",
          "name": "config",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "pauseGuardian",
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
      "inputs": [],
      "name": "paused",
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
      "inputs": [
        {
          "internalType": "contract MToken",
          "name": "_mToken",
          "type": "address"
        }
      ],
      "name": "updateMarketBorrowIndex",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract MToken",
          "name": "_mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_borrower",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "_sendTokens",
          "type": "bool"
        }
      ],
      "name": "updateMarketBorrowIndexAndDisburseBorrowerRewards",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract MToken",
          "name": "_mToken",
          "type": "address"
        }
      ],
      "name": "updateMarketSupplyIndex",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract MToken",
          "name": "_mToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_supplier",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "_sendTokens",
          "type": "bool"
        }
      ],
      "name": "updateMarketSupplyIndexAndDisburseSupplierRewards",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
} as const;

export const xWellToken = {
  address: '0xA88594D404727625A9437C3f886C7643872296AE' as `0x${string}`,
  abi: [
    {
      "type": "constructor",
      "inputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "CLOCK_MODE",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "string",
          "internalType": "string"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "DOMAIN_SEPARATOR",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "MAX_PAUSE_DURATION",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "MAX_RATE_LIMIT_PER_SECOND",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint128",
          "internalType": "uint128"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "MAX_SUPPLY",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "MIN_BUFFER_CAP",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint112",
          "internalType": "uint112"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "acceptOwnership",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "addBridge",
      "inputs": [
        {
          "name": "newBridge",
          "type": "tuple",
          "internalType": "struct MintLimits.RateLimitMidPointInfo",
          "components": [
            {
              "name": "bufferCap",
              "type": "uint112",
              "internalType": "uint112"
            },
            {
              "name": "rateLimitPerSecond",
              "type": "uint128",
              "internalType": "uint128"
            },
            {
              "name": "bridge",
              "type": "address",
              "internalType": "address"
            }
          ]
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "addBridges",
      "inputs": [
        {
          "name": "newBridges",
          "type": "tuple[]",
          "internalType": "struct MintLimits.RateLimitMidPointInfo[]",
          "components": [
            {
              "name": "bufferCap",
              "type": "uint112",
              "internalType": "uint112"
            },
            {
              "name": "rateLimitPerSecond",
              "type": "uint128",
              "internalType": "uint128"
            },
            {
              "name": "bridge",
              "type": "address",
              "internalType": "address"
            }
          ]
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "allowance",
      "inputs": [
        {
          "name": "owner",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "spender",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "approve",
      "inputs": [
        {
          "name": "spender",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "amount",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "balanceOf",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "buffer",
      "inputs": [
        {
          "name": "from",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "bufferCap",
      "inputs": [
        {
          "name": "from",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "burn",
      "inputs": [
        {
          "name": "user",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "amount",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "burningCurrentLimitOf",
      "inputs": [
        {
          "name": "bridge",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "limit",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "burningMaxLimitOf",
      "inputs": [
        {
          "name": "bridge",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "limit",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "checkpoints",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "pos",
          "type": "uint32",
          "internalType": "uint32"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "tuple",
          "internalType": "struct ERC20VotesUpgradeable.Checkpoint",
          "components": [
            {
              "name": "fromBlock",
              "type": "uint32",
              "internalType": "uint32"
            },
            {
              "name": "votes",
              "type": "uint224",
              "internalType": "uint224"
            }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "clock",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint48",
          "internalType": "uint48"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "decimals",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint8",
          "internalType": "uint8"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "decreaseAllowance",
      "inputs": [
        {
          "name": "spender",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "subtractedValue",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "delegate",
      "inputs": [
        {
          "name": "delegatee",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "delegateBySig",
      "inputs": [
        {
          "name": "delegatee",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "nonce",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "expiry",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "v",
          "type": "uint8",
          "internalType": "uint8"
        },
        {
          "name": "r",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "s",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "delegates",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "eip712Domain",
      "inputs": [],
      "outputs": [
        {
          "name": "fields",
          "type": "bytes1",
          "internalType": "bytes1"
        },
        {
          "name": "name",
          "type": "string",
          "internalType": "string"
        },
        {
          "name": "version",
          "type": "string",
          "internalType": "string"
        },
        {
          "name": "chainId",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "verifyingContract",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "salt",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "extensions",
          "type": "uint256[]",
          "internalType": "uint256[]"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getPastTotalSupply",
      "inputs": [
        {
          "name": "timepoint",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getPastVotes",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "timepoint",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getVotes",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "grantPauseGuardian",
      "inputs": [
        {
          "name": "newPauseGuardian",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "increaseAllowance",
      "inputs": [
        {
          "name": "spender",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "addedValue",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "initialize",
      "inputs": [
        {
          "name": "tokenName",
          "type": "string",
          "internalType": "string"
        },
        {
          "name": "tokenSymbol",
          "type": "string",
          "internalType": "string"
        },
        {
          "name": "tokenOwner",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "newRateLimits",
          "type": "tuple[]",
          "internalType": "struct MintLimits.RateLimitMidPointInfo[]",
          "components": [
            {
              "name": "bufferCap",
              "type": "uint112",
              "internalType": "uint112"
            },
            {
              "name": "rateLimitPerSecond",
              "type": "uint128",
              "internalType": "uint128"
            },
            {
              "name": "bridge",
              "type": "address",
              "internalType": "address"
            }
          ]
        },
        {
          "name": "newPauseDuration",
          "type": "uint128",
          "internalType": "uint128"
        },
        {
          "name": "newPauseGuardian",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "kickGuardian",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "maxPauseDuration",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "maxRateLimitPerSecond",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint128",
          "internalType": "uint128"
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "maxSupply",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "minBufferCap",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint112",
          "internalType": "uint112"
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "mint",
      "inputs": [
        {
          "name": "user",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "amount",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "mintingCurrentLimitOf",
      "inputs": [
        {
          "name": "minter",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "limit",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "mintingMaxLimitOf",
      "inputs": [
        {
          "name": "minter",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "limit",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "name",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "string",
          "internalType": "string"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "nonces",
      "inputs": [
        {
          "name": "owner",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "numCheckpoints",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint32",
          "internalType": "uint32"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "owner",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "ownerUnpause",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "pause",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "pauseDuration",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint128",
          "internalType": "uint128"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "pauseGuardian",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "pauseStartTime",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint128",
          "internalType": "uint128"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "pauseUsed",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "paused",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "pendingOwner",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "permit",
      "inputs": [
        {
          "name": "owner",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "spender",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "value",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "deadline",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "v",
          "type": "uint8",
          "internalType": "uint8"
        },
        {
          "name": "r",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "s",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "rateLimitPerSecond",
      "inputs": [
        {
          "name": "from",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "rateLimits",
      "inputs": [
        {
          "name": "bridge",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "rateLimitPerSecond",
          "type": "uint128",
          "internalType": "uint128"
        },
        {
          "name": "bufferCap",
          "type": "uint112",
          "internalType": "uint112"
        },
        {
          "name": "lastBufferUsedTime",
          "type": "uint32",
          "internalType": "uint32"
        },
        {
          "name": "bufferStored",
          "type": "uint112",
          "internalType": "uint112"
        },
        {
          "name": "midPoint",
          "type": "uint112",
          "internalType": "uint112"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "removeBridge",
      "inputs": [
        {
          "name": "bridge",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "removeBridges",
      "inputs": [
        {
          "name": "bridges",
          "type": "address[]",
          "internalType": "address[]"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "renounceOwnership",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "setBufferCap",
      "inputs": [
        {
          "name": "bridge",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "newBufferCap",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "setPauseDuration",
      "inputs": [
        {
          "name": "newPauseDuration",
          "type": "uint128",
          "internalType": "uint128"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "setRateLimitPerSecond",
      "inputs": [
        {
          "name": "bridge",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "newRateLimitPerSecond",
          "type": "uint128",
          "internalType": "uint128"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "symbol",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "string",
          "internalType": "string"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "totalSupply",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "transfer",
      "inputs": [
        {
          "name": "to",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "amount",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "transferFrom",
      "inputs": [
        {
          "name": "from",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "to",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "amount",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "transferOwnership",
      "inputs": [
        {
          "name": "newOwner",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "unpause",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "event",
      "name": "Approval",
      "inputs": [
        {
          "name": "owner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "spender",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "value",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "BridgeLimitsSet",
      "inputs": [
        {
          "name": "bridge",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "bufferCap",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "ConfigurationChanged",
      "inputs": [
        {
          "name": "bridge",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "bufferCap",
          "type": "uint112",
          "indexed": false,
          "internalType": "uint112"
        },
        {
          "name": "rateLimitPerSecond",
          "type": "uint128",
          "indexed": false,
          "internalType": "uint128"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "DelegateChanged",
      "inputs": [
        {
          "name": "delegator",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "fromDelegate",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "toDelegate",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "DelegateVotesChanged",
      "inputs": [
        {
          "name": "delegate",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "previousBalance",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "newBalance",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "EIP712DomainChanged",
      "inputs": [],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "Initialized",
      "inputs": [
        {
          "name": "version",
          "type": "uint8",
          "indexed": false,
          "internalType": "uint8"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "OwnershipTransferStarted",
      "inputs": [
        {
          "name": "previousOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "newOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "OwnershipTransferred",
      "inputs": [
        {
          "name": "previousOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "newOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "PauseDurationUpdated",
      "inputs": [
        {
          "name": "oldPauseDuration",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "newPauseDuration",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "PauseGuardianUpdated",
      "inputs": [
        {
          "name": "oldPauseGuardian",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "newPauseGuardian",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "PauseTimeUpdated",
      "inputs": [
        {
          "name": "newPauseStartTime",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "Paused",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "indexed": false,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "Transfer",
      "inputs": [
        {
          "name": "from",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "to",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "value",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "Unpaused",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "indexed": false,
          "internalType": "address"
        }
      ],
      "anonymous": false
    }
  ],
} as const;

export const aeroMarketContract = {
  address: '0x89D0F320ac73dd7d9513FFC5bc58D1161452a657' as `0x${string}`,
  abi: [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "tokenIn",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amountIn",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "granularity",
          "type": "uint256"
        }
      ],
      "name": "quote",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amountOut",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
  ], // we only need the quote function
} as const;

export const moonbeamViewsContract = {
  address: '0xe76C8B8706faC85a8Fbdcac3C42e3E7823c73994' as `0x${string}`,
  abi: [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "version",
          "type": "uint8"
        }
      ],
      "name": "Initialized",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "comptroller",
      "outputs": [
        {
          "internalType": "contract Comptroller",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllMarketsInfo",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "market",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "isListed",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "borrowCap",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "supplyCap",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "mintPaused",
              "type": "bool"
            },
            {
              "internalType": "bool",
              "name": "borrowPaused",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "collateralFactor",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "underlyingPrice",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalSupply",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalBorrows",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalReserves",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "cash",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "exchangeRate",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "borrowIndex",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "reserveFactor",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "borrowRate",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "supplyRate",
              "type": "uint256"
            },
            {
              "components": [
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "supplyIncentivesPerSec",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "borrowIncentivesPerSec",
                  "type": "uint256"
                }
              ],
              "internalType": "struct BaseMoonwellViews.MarketIncentives[]",
              "name": "incentives",
              "type": "tuple[]"
            }
          ],
          "internalType": "struct BaseMoonwellViews.Market[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getGovernanceTokenPrice",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "_result",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract MToken",
          "name": "market",
          "type": "address"
        }
      ],
      "name": "getMarketIncentives",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "token",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "supplyIncentivesPerSec",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "borrowIncentivesPerSec",
              "type": "uint256"
            }
          ],
          "internalType": "struct BaseMoonwellViews.MarketIncentives[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract MToken",
          "name": "_mToken",
          "type": "address"
        }
      ],
      "name": "getMarketInfo",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "market",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "isListed",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "borrowCap",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "supplyCap",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "mintPaused",
              "type": "bool"
            },
            {
              "internalType": "bool",
              "name": "borrowPaused",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "collateralFactor",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "underlyingPrice",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalSupply",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalBorrows",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalReserves",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "cash",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "exchangeRate",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "borrowIndex",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "reserveFactor",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "borrowRate",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "supplyRate",
              "type": "uint256"
            },
            {
              "components": [
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "supplyIncentivesPerSec",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "borrowIncentivesPerSec",
                  "type": "uint256"
                }
              ],
              "internalType": "struct BaseMoonwellViews.MarketIncentives[]",
              "name": "incentives",
              "type": "tuple[]"
            }
          ],
          "internalType": "struct BaseMoonwellViews.Market",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract MToken[]",
          "name": "_mTokens",
          "type": "address[]"
        }
      ],
      "name": "getMarketsInfo",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "market",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "isListed",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "borrowCap",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "supplyCap",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "mintPaused",
              "type": "bool"
            },
            {
              "internalType": "bool",
              "name": "borrowPaused",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "collateralFactor",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "underlyingPrice",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalSupply",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalBorrows",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalReserves",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "cash",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "exchangeRate",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "borrowIndex",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "reserveFactor",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "borrowRate",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "supplyRate",
              "type": "uint256"
            },
            {
              "components": [
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "supplyIncentivesPerSec",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "borrowIncentivesPerSec",
                  "type": "uint256"
                }
              ],
              "internalType": "struct BaseMoonwellViews.MarketIncentives[]",
              "name": "incentives",
              "type": "tuple[]"
            }
          ],
          "internalType": "struct BaseMoonwellViews.Market[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getNativeTokenPrice",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "_result",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getProtocolInfo",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bool",
              "name": "seizePaused",
              "type": "bool"
            },
            {
              "internalType": "bool",
              "name": "transferPaused",
              "type": "bool"
            }
          ],
          "internalType": "struct BaseMoonwellViews.ProtocolInfo",
          "name": "_result",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getStakingInfo",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "cooldown",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "unstakeWindow",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "distributionEnd",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalSupply",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "emissionPerSecond",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "lastUpdateTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "index",
              "type": "uint256"
            }
          ],
          "internalType": "struct BaseMoonwellViews.StakingInfo",
          "name": "_result",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "_tokens",
          "type": "address[]"
        },
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getTokensBalances",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "token",
              "type": "address"
            }
          ],
          "internalType": "struct BaseMoonwellViews.Balances[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getUserBalances",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "token",
              "type": "address"
            }
          ],
          "internalType": "struct BaseMoonwellViews.Balances[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getUserBorrowsBalances",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "token",
              "type": "address"
            }
          ],
          "internalType": "struct BaseMoonwellViews.Balances[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getUserClaimsVotingPower",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "delegatedVotingPower",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "votingPower",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "delegates",
              "type": "address"
            }
          ],
          "internalType": "struct BaseMoonwellViews.Votes",
          "name": "_result",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getUserMarketsMemberships",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bool",
              "name": "membership",
              "type": "bool"
            },
            {
              "internalType": "address",
              "name": "token",
              "type": "address"
            }
          ],
          "internalType": "struct BaseMoonwellViews.Memberships[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getUserRewards",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "market",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "rewardToken",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "supplyRewardsAmount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "borrowRewardsAmount",
              "type": "uint256"
            }
          ],
          "internalType": "struct BaseMoonwellViews.Rewards[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getUserStakingInfo",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "cooldown",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "pendingRewards",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalStaked",
              "type": "uint256"
            }
          ],
          "internalType": "struct BaseMoonwellViews.UserStakingInfo",
          "name": "_result",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getUserStakingVotingPower",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "delegatedVotingPower",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "votingPower",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "delegates",
              "type": "address"
            }
          ],
          "internalType": "struct BaseMoonwellViews.Votes",
          "name": "_result",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getUserTokensVotingPower",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "delegatedVotingPower",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "votingPower",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "delegates",
              "type": "address"
            }
          ],
          "internalType": "struct BaseMoonwellViews.Votes",
          "name": "_result",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getUserVotingPower",
      "outputs": [
        {
          "components": [
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "delegatedVotingPower",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "votingPower",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "delegates",
                  "type": "address"
                }
              ],
              "internalType": "struct BaseMoonwellViews.Votes",
              "name": "claimsVotes",
              "type": "tuple"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "delegatedVotingPower",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "votingPower",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "delegates",
                  "type": "address"
                }
              ],
              "internalType": "struct BaseMoonwellViews.Votes",
              "name": "stakingVotes",
              "type": "tuple"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "delegatedVotingPower",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "votingPower",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "delegates",
                  "type": "address"
                }
              ],
              "internalType": "struct BaseMoonwellViews.Votes",
              "name": "tokenVotes",
              "type": "tuple"
            }
          ],
          "internalType": "struct BaseMoonwellViews.UserVotes",
          "name": "_result",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_comptroller",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "tokenSaleDistributor",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "safetyModule",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "governanceToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "nativeMarket",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "governanceTokenLP",
          "type": "address"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
} as const;

export const baseViewsContract = {
  address: '0x6834770ABA6c2028f448E3259DDEE4BCB879d459' as `0x${string}`,
  abi: [
    {
      "type": "constructor",
      "inputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "comptroller",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "contract Comptroller"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getAllMarketsInfo",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "tuple[]",
          "internalType": "struct BaseMoonwellViews.Market[]",
          "components": [
            {
              "name": "market",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "isListed",
              "type": "bool",
              "internalType": "bool"
            },
            {
              "name": "borrowCap",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "supplyCap",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "mintPaused",
              "type": "bool",
              "internalType": "bool"
            },
            {
              "name": "borrowPaused",
              "type": "bool",
              "internalType": "bool"
            },
            {
              "name": "collateralFactor",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "underlyingPrice",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "totalSupply",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "totalBorrows",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "totalReserves",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "cash",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "exchangeRate",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "borrowIndex",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "reserveFactor",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "borrowRate",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "supplyRate",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "incentives",
              "type": "tuple[]",
              "internalType": "struct BaseMoonwellViews.MarketIncentives[]",
              "components": [
                {
                  "name": "token",
                  "type": "address",
                  "internalType": "address"
                },
                {
                  "name": "supplyIncentivesPerSec",
                  "type": "uint256",
                  "internalType": "uint256"
                },
                {
                  "name": "borrowIncentivesPerSec",
                  "type": "uint256",
                  "internalType": "uint256"
                }
              ]
            }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getGovernanceTokenPrice",
      "inputs": [],
      "outputs": [
        {
          "name": "_result",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getMarketIncentives",
      "inputs": [
        {
          "name": "market",
          "type": "address",
          "internalType": "contract MToken"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "tuple[]",
          "internalType": "struct BaseMoonwellViews.MarketIncentives[]",
          "components": [
            {
              "name": "token",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "supplyIncentivesPerSec",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "borrowIncentivesPerSec",
              "type": "uint256",
              "internalType": "uint256"
            }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getMarketInfo",
      "inputs": [
        {
          "name": "_mToken",
          "type": "address",
          "internalType": "contract MToken"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "tuple",
          "internalType": "struct BaseMoonwellViews.Market",
          "components": [
            {
              "name": "market",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "isListed",
              "type": "bool",
              "internalType": "bool"
            },
            {
              "name": "borrowCap",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "supplyCap",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "mintPaused",
              "type": "bool",
              "internalType": "bool"
            },
            {
              "name": "borrowPaused",
              "type": "bool",
              "internalType": "bool"
            },
            {
              "name": "collateralFactor",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "underlyingPrice",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "totalSupply",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "totalBorrows",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "totalReserves",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "cash",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "exchangeRate",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "borrowIndex",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "reserveFactor",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "borrowRate",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "supplyRate",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "incentives",
              "type": "tuple[]",
              "internalType": "struct BaseMoonwellViews.MarketIncentives[]",
              "components": [
                {
                  "name": "token",
                  "type": "address",
                  "internalType": "address"
                },
                {
                  "name": "supplyIncentivesPerSec",
                  "type": "uint256",
                  "internalType": "uint256"
                },
                {
                  "name": "borrowIncentivesPerSec",
                  "type": "uint256",
                  "internalType": "uint256"
                }
              ]
            }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getMarketsInfo",
      "inputs": [
        {
          "name": "_mTokens",
          "type": "address[]",
          "internalType": "contract MToken[]"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "tuple[]",
          "internalType": "struct BaseMoonwellViews.Market[]",
          "components": [
            {
              "name": "market",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "isListed",
              "type": "bool",
              "internalType": "bool"
            },
            {
              "name": "borrowCap",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "supplyCap",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "mintPaused",
              "type": "bool",
              "internalType": "bool"
            },
            {
              "name": "borrowPaused",
              "type": "bool",
              "internalType": "bool"
            },
            {
              "name": "collateralFactor",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "underlyingPrice",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "totalSupply",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "totalBorrows",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "totalReserves",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "cash",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "exchangeRate",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "borrowIndex",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "reserveFactor",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "borrowRate",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "supplyRate",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "incentives",
              "type": "tuple[]",
              "internalType": "struct BaseMoonwellViews.MarketIncentives[]",
              "components": [
                {
                  "name": "token",
                  "type": "address",
                  "internalType": "address"
                },
                {
                  "name": "supplyIncentivesPerSec",
                  "type": "uint256",
                  "internalType": "uint256"
                },
                {
                  "name": "borrowIncentivesPerSec",
                  "type": "uint256",
                  "internalType": "uint256"
                }
              ]
            }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getNativeTokenPrice",
      "inputs": [],
      "outputs": [
        {
          "name": "_result",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getProtocolInfo",
      "inputs": [],
      "outputs": [
        {
          "name": "_result",
          "type": "tuple",
          "internalType": "struct BaseMoonwellViews.ProtocolInfo",
          "components": [
            {
              "name": "seizePaused",
              "type": "bool",
              "internalType": "bool"
            },
            {
              "name": "transferPaused",
              "type": "bool",
              "internalType": "bool"
            }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getStakingInfo",
      "inputs": [],
      "outputs": [
        {
          "name": "_result",
          "type": "tuple",
          "internalType": "struct BaseMoonwellViews.StakingInfo",
          "components": [
            {
              "name": "cooldown",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "unstakeWindow",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "distributionEnd",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "totalSupply",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "emissionPerSecond",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "lastUpdateTimestamp",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "index",
              "type": "uint256",
              "internalType": "uint256"
            }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getTokensBalances",
      "inputs": [
        {
          "name": "_tokens",
          "type": "address[]",
          "internalType": "address[]"
        },
        {
          "name": "_user",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "tuple[]",
          "internalType": "struct BaseMoonwellViews.Balances[]",
          "components": [
            {
              "name": "amount",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "token",
              "type": "address",
              "internalType": "address"
            }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getUserBalances",
      "inputs": [
        {
          "name": "_user",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "tuple[]",
          "internalType": "struct BaseMoonwellViews.Balances[]",
          "components": [
            {
              "name": "amount",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "token",
              "type": "address",
              "internalType": "address"
            }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getUserBorrowsBalances",
      "inputs": [
        {
          "name": "_user",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "tuple[]",
          "internalType": "struct BaseMoonwellViews.Balances[]",
          "components": [
            {
              "name": "amount",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "token",
              "type": "address",
              "internalType": "address"
            }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getUserClaimsVotingPower",
      "inputs": [
        {
          "name": "_user",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "_result",
          "type": "tuple",
          "internalType": "struct BaseMoonwellViews.Votes",
          "components": [
            {
              "name": "delegatedVotingPower",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "votingPower",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "delegates",
              "type": "address",
              "internalType": "address"
            }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getUserMarketsMemberships",
      "inputs": [
        {
          "name": "_user",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "tuple[]",
          "internalType": "struct BaseMoonwellViews.Memberships[]",
          "components": [
            {
              "name": "membership",
              "type": "bool",
              "internalType": "bool"
            },
            {
              "name": "token",
              "type": "address",
              "internalType": "address"
            }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getUserRewards",
      "inputs": [
        {
          "name": "_user",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "tuple[]",
          "internalType": "struct BaseMoonwellViews.Rewards[]",
          "components": [
            {
              "name": "market",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "rewardToken",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "supplyRewardsAmount",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "borrowRewardsAmount",
              "type": "uint256",
              "internalType": "uint256"
            }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getUserStakingInfo",
      "inputs": [
        {
          "name": "_user",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "_result",
          "type": "tuple",
          "internalType": "struct BaseMoonwellViews.UserStakingInfo",
          "components": [
            {
              "name": "cooldown",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "pendingRewards",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "totalStaked",
              "type": "uint256",
              "internalType": "uint256"
            }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getUserStakingVotingPower",
      "inputs": [
        {
          "name": "_user",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "_result",
          "type": "tuple",
          "internalType": "struct BaseMoonwellViews.Votes",
          "components": [
            {
              "name": "delegatedVotingPower",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "votingPower",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "delegates",
              "type": "address",
              "internalType": "address"
            }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getUserTokensVotingPower",
      "inputs": [
        {
          "name": "_user",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "_result",
          "type": "tuple",
          "internalType": "struct BaseMoonwellViews.Votes",
          "components": [
            {
              "name": "delegatedVotingPower",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "votingPower",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "delegates",
              "type": "address",
              "internalType": "address"
            }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getUserVotingPower",
      "inputs": [
        {
          "name": "_user",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "_result",
          "type": "tuple",
          "internalType": "struct BaseMoonwellViews.UserVotes",
          "components": [
            {
              "name": "claimsVotes",
              "type": "tuple",
              "internalType": "struct BaseMoonwellViews.Votes",
              "components": [
                {
                  "name": "delegatedVotingPower",
                  "type": "uint256",
                  "internalType": "uint256"
                },
                {
                  "name": "votingPower",
                  "type": "uint256",
                  "internalType": "uint256"
                },
                {
                  "name": "delegates",
                  "type": "address",
                  "internalType": "address"
                }
              ]
            },
            {
              "name": "stakingVotes",
              "type": "tuple",
              "internalType": "struct BaseMoonwellViews.Votes",
              "components": [
                {
                  "name": "delegatedVotingPower",
                  "type": "uint256",
                  "internalType": "uint256"
                },
                {
                  "name": "votingPower",
                  "type": "uint256",
                  "internalType": "uint256"
                },
                {
                  "name": "delegates",
                  "type": "address",
                  "internalType": "address"
                }
              ]
            },
            {
              "name": "tokenVotes",
              "type": "tuple",
              "internalType": "struct BaseMoonwellViews.Votes",
              "components": [
                {
                  "name": "delegatedVotingPower",
                  "type": "uint256",
                  "internalType": "uint256"
                },
                {
                  "name": "votingPower",
                  "type": "uint256",
                  "internalType": "uint256"
                },
                {
                  "name": "delegates",
                  "type": "address",
                  "internalType": "address"
                }
              ]
            }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "governanceToken",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "contract Well"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "initialize",
      "inputs": [
        {
          "name": "_comptroller",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "tokenSaleDistributor",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "safetyModule",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "_governanceToken",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "nativeMarket",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "governanceTokenLP",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "event",
      "name": "Initialized",
      "inputs": [
        {
          "name": "version",
          "type": "uint8",
          "indexed": false,
          "internalType": "uint8"
        }
      ],
      "anonymous": false
    }
  ],
} as const;

export const baseNativeToken = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' // USDC since there is no native token on Base

export const optimismNativeToken = '0x4200000000000000000000000000000000000042' // OP

export const marketConfigs = {
  10: [
    {
      address: '0x8E08617b0d66359D73Aa11E11017834C29155525',
      nameOverride: 'USDC',
      digits: 6,
      boost: 0,
      deboost: 0,
      supply: 0.5,
      borrow: 0.5,
      enabled: true,
    },
    {
      address: '0xa3A53899EE8f9f6E963437C5B3f805FEc538BF84',
      nameOverride: 'USDT',
      digits: 6,
      boost: 0,
      deboost: 0,
      supply: 0.5,
      borrow: 0.5,
      enabled: true,
    },
    {
      address: '0x3FE782C2Fe7668C2F1Eb313ACf3022a31feaD6B2',
      nameOverride: 'DAI',
      digits: 18,
      boost: 0,
      deboost: 0,
      supply: 0.5,
      borrow: 0.5,
      enabled: true,
    },
    {
      address: '0x6e6CA598A06E609c913551B729a228B023f06fDB',
      nameOverride: 'WBTC',
      digits: 8,
      boost: 0,
      deboost: 0,
      supply: 1,
      borrow: 0,
      enabled: true,
    },
    {
      address: '0xb4104C02BBf4E9be85AAa41a62974E4e28D59A33',
      nameOverride: 'ETH',
      digits: 18,
      boost: 0,
      deboost: 0,
      supply: 0.5,
      borrow: 0.5,
      enabled: true,
    },
    {
      address: '0xbb3b1aB66eFB43B10923b87460c0106643B83f9d',
      nameOverride: 'wstETH',
      digits: 18,
      boost: 0,
      deboost: 0,
      supply: 0.45,
      borrow: 0.55,
      enabled: true,
    },
    {
      address: '0x95C84F369bd0251ca903052600A3C96838D78bA1',
      nameOverride: 'cbETH',
      digits: 18,
      boost: 0,
      deboost: 0,
      supply: 0.45,
      borrow: 0.55,
      enabled: true,
    },
    {
      address: '0x4c2E35E3eC4A0C82849637BC04A4609Dbe53d321',
      nameOverride: 'rETH',
      digits: 18,
      boost: 0,
      deboost: 0,
      supply: 0.45,
      borrow: 0.45,
      enabled: true,
    },
    {
      address: '0x21d851585840942B0eF9f20d842C00C5f3735eaF',
      nameOverride: 'VELO',
      digits: 18,
      boost: 0,
      deboost: 0,
      supply: 0.25,
      borrow: 0.75,
      enabled: true,
    },
    {
      address: '0x9fc345a20541Bf8773988515c5950eD69aF01847',
      nameOverride: 'OP',
      digits: 18,
      boost: 0,
      deboost: 0,
      supply: 0.75,
      borrow: 0.25,
      enabled: true,
    },
  ],
  1284: [
    {
      address: '0x091608f4e4a15335145be0A279483C0f8E4c7955',
      nameOverride: 'GLMR',
      digits: 18,
      boost: 0,
      deboost: 0,
      supply: 0.5,
      borrow: 0.5,
      enabled: true,
    },
    {
      address: '0xD22Da948c0aB3A27f5570b604f3ADef5F68211C3',
      nameOverride: 'DOT',
      digits: 10,
      boost: 0,
      deboost: 0,
      supply: 0.5,
      borrow: 0.5,
      enabled: true,
    },
    {
      address: '0x1C55649f73CDA2f72CEf3DD6C5CA3d49EFcF484C',
      nameOverride: 'FRAX',
      digits: 18,
      boost: 0,
      deboost: 0,
      supply: 0.5,
      borrow: 0.5,
      enabled: true,
    },
    {
      address: '0xb6c94b3A378537300387B57ab1cC0d2083f9AeaC',
      nameOverride: 'ETH.wh',
      digits: 18,
      boost: 0,
      deboost: 0,
      supply: 0.5,
      borrow: 0.5,
      enabled: true,
    },
    {
      address: '0xaaa20c5a584a9fECdFEDD71E46DA7858B774A9ce',
      nameOverride: 'WBTC.wh',
      digits: 8,
      boost: 0,
      deboost: 0,
      supply: 1,
      borrow: 0,
      enabled: true,
    },
    {
      address: '0x744b1756e7651c6D57f5311767EAFE5E931D615b',
      nameOverride: 'USDC.wh',
      digits: 6,
      boost: 0,
      deboost: 0,
      supply: 0.50,
      borrow: 0.50,
      enabled: true,
    },
    {
      address: '0x42A96C0681B74838eC525AdbD13c37f66388f289',
      nameOverride: 'xcUSDT',
      digits: 6,
      boost: 0,
      deboost: 0,
      supply: 0.50,
      borrow: 0.50,
      enabled: true,
    },
    {
      address: '0x22b1a40e3178fe7C7109eFCc247C5bB2B34ABe32',
      nameOverride: 'xcUSDC',
      digits: 6,
      boost: 0,
      deboost: 0,
      supply: 0.50,
      borrow: 0.50,
      enabled: true,
    },
  ],
  8453: [
    {
      address: '0x703843C3379b52F9FF486c9f5892218d2a065cC8',
      nameOverride: 'USDbC',
      digits: 6,
      boost: 0,
      deboost: 0,
      supply: 0.50,
      borrow: 0.50,
      enabled: false,
    },
    {
      address: '0x628ff693426583D9a7FB391E54366292F509D457',
      nameOverride: 'ETH',
      digits: 18,
      boost: 0,
      deboost: 0,
      supply: 0.50,
      borrow: 0.50,
      enabled: true,
    },
    {
      address: '0x3bf93770f2d4a794c3d9EBEfBAeBAE2a8f09A5E5',
      nameOverride: 'cbETH',
      digits: 18,
      boost: 0,
      deboost: 0,
      supply: 0.45,
      borrow: 0.55,
      enabled: true,
    },
    {
      address: '0x73b06D8d18De422E269645eaCe15400DE7462417',
      nameOverride: 'DAI',
      digits: 18,
      boost: 0,
      deboost: 0,
      supply: 0.50,
      borrow: 0.50,
      enabled: false,
    },
    {
      address: '0xEdc817A28E8B93B03976FBd4a3dDBc9f7D176c22',
      nameOverride: 'USDC',
      digits: 6,
      boost: 0,
      deboost: 0,
      supply: 0.50,
      borrow: 0.50,
      enabled: true,
    },
    {
      address: '0x627Fe393Bc6EdDA28e99AE648fD6fF362514304b',
      nameOverride: 'wstETH',
      digits: 18,
      boost: 0,
      deboost: 0,
      supply: 0.45,
      borrow: 0.55,
      enabled: true,
    },
    {
      address: '0xCB1DaCd30638ae38F2B94eA64F066045B7D45f44',
      nameOverride: 'rETH',
      digits: 18,
      boost: 0,
      deboost: 0,
      supply: 0.45,
      borrow: 0.55,
      enabled: true,
    },
    {
      address: '0x73902f619CEB9B31FD8EFecf435CbDf89E369Ba6',
      nameOverride: 'AERO',
      digits: 18,
      boost: 0,
      deboost: 0,
      supply: 0.45,
      borrow: 0.55,
      enabled: true,
    },
  ],
}

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