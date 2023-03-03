import {Percent, WETH9} from "@reservoir-labs/sdk-core";
import {AddressZero} from "@ethersproject/constants";

export const CHAINID = 43114
export const TOKEN_ADDRESS = {
    43114: {
        'USDC': '0x5D60473C5Cb323032d6fdFf42380B50E2AE4d245',
        'USDT': '0x6e9FDaE1Fe20b0A5a605C879Ae14030a0aE99cF9',
        'WAVAX': WETH9[43114].address,
        'AVAX': AddressZero
    }
}

export const TOKEN_DECIMALS = {
    43114: {
        'USDC': 6,
        'USDT': 6,
        'WAVAX': 18,
        'AVAX': 18
    }
}
export const SLIPPAGE = new Percent(1, 100) // 1%
export const ROUTER_ADDRESS = '0x7f05c63dc7ca3f99f2d3409f0017c28058c42b27'
export const ROUTER_INTERFACE = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "aFactory",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "aWETH",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "WETH",
        "outputs": [
            {
                "internalType": "contract IWETH",
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
                "name": "aTokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "aTokenB",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "aCurveId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "aAmountADesired",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "aAmountBDesired",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "aAmountAMin",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "aAmountBMin",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "aTo",
                "type": "address"
            }
        ],
        "name": "addLiquidity",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "rAmountA",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "rAmountB",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "rLiq",
                "type": "uint256"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "aDeadline",
                "type": "uint256"
            }
        ],
        "name": "checkDeadline",
        "outputs": [],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "factory",
        "outputs": [
            {
                "internalType": "contract GenericFactory",
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
                "internalType": "bytes[]",
                "name": "aData",
                "type": "bytes[]"
            }
        ],
        "name": "multicall",
        "outputs": [
            {
                "internalType": "bytes[]",
                "name": "rResults",
                "type": "bytes[]"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "refundETH",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "aTokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "aTokenB",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "aCurveId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "aLiq",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "aAmountAMin",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "aAmountBMin",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "aTo",
                "type": "address"
            }
        ],
        "name": "removeLiquidity",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "rAmountA",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "rAmountB",
                "type": "uint256"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "v",
                "type": "uint8"
            },
            {
                "internalType": "bytes32",
                "name": "r",
                "type": "bytes32"
            },
            {
                "internalType": "bytes32",
                "name": "s",
                "type": "bytes32"
            }
        ],
        "name": "selfPermit",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "nonce",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "expiry",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "v",
                "type": "uint8"
            },
            {
                "internalType": "bytes32",
                "name": "r",
                "type": "bytes32"
            },
            {
                "internalType": "bytes32",
                "name": "s",
                "type": "bytes32"
            }
        ],
        "name": "selfPermitAllowed",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "nonce",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "expiry",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "v",
                "type": "uint8"
            },
            {
                "internalType": "bytes32",
                "name": "r",
                "type": "bytes32"
            },
            {
                "internalType": "bytes32",
                "name": "s",
                "type": "bytes32"
            }
        ],
        "name": "selfPermitAllowedIfNecessary",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "v",
                "type": "uint8"
            },
            {
                "internalType": "bytes32",
                "name": "r",
                "type": "bytes32"
            },
            {
                "internalType": "bytes32",
                "name": "s",
                "type": "bytes32"
            }
        ],
        "name": "selfPermitIfNecessary",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "aAmountIn",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "aAmountOutMin",
                "type": "uint256"
            },
            {
                "internalType": "address[]",
                "name": "aPath",
                "type": "address[]"
            },
            {
                "internalType": "uint256[]",
                "name": "aCurveIds",
                "type": "uint256[]"
            },
            {
                "internalType": "address",
                "name": "aTo",
                "type": "address"
            }
        ],
        "name": "swapExactForVariable",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "rAmountOut",
                "type": "uint256"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "aAmountOut",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "aAmountInMax",
                "type": "uint256"
            },
            {
                "internalType": "address[]",
                "name": "aPath",
                "type": "address[]"
            },
            {
                "internalType": "uint256[]",
                "name": "aCurveIds",
                "type": "uint256[]"
            },
            {
                "internalType": "address",
                "name": "aTo",
                "type": "address"
            }
        ],
        "name": "swapVariableForExact",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "rAmounts",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "aToken",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "aAmountMinimum",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "aRecipient",
                "type": "address"
            }
        ],
        "name": "sweepToken",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "aAmountMinimum",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "aRecipient",
                "type": "address"
            }
        ],
        "name": "unwrapWETH",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
]
