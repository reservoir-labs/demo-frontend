import {
    Button,
    ButtonSpinner,
    Container,
    Heading,
    NumberInput,
    NumberInputField, Text,
    useControllableState,
    VStack
} from '@chakra-ui/react';
import {Badge, OptionProps, Select} from "@web3uikit/core";
import {Fetcher, Pair, Router, SwapParameters, Trade} from '@reservoir-labs/sdk'
import {CurrencyAmount, Percent, Token, TradeType} from "@reservoir-labs/sdk-core";
import {BaseProvider, WebSocketProvider} from "@ethersproject/providers";
import {useEffect} from "react";
import {
    useAccount,
    useClient,
    useContractWrite,
    usePrepareContractWrite,
} from "wagmi";
import {formatUnits, parseUnits} from "@ethersproject/units";

const tokenSelectOptions: OptionProps[] = [{label: 'USDC', id: 'USDC'}, {label:'WAVAX', id: 'WAVAX'}, {label: 'USDT', id: 'USDT'}]

const CHAINID = 43114
const SLIPPAGE = new Percent(1, 100) // 1%
const SWAP_RECIPIENT = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' // default anvil account
const ROUTER_ADDRESS = '0x01db1300f575072131e30d5fc85add64e7eb880e'
const ROUTER_INTERFACE = [
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

const TOKEN_ADDRESS = {
    43114: {
        'USDC': '0x2B0d36FACD61B71CC05ab8F3D2355ec3631C0dd5',
        'USDT': '0xfbC22278A96299D91d41C453234d97b4F5Eb9B2d',
        'WAVAX': '0x46b142DD1E924FAb83eCc3c08e4D46E82f005e0E'
    }
}

const Home = () => {
  // wallet, provider, smart contract state
  const { isConnected } = useAccount()
  const client = useClient()
  const [funcName, setFuncName] = useControllableState({defaultValue: null})
  const [args, setArgs] = useControllableState({defaultValue: null})

  const { config, error } = usePrepareContractWrite({
    address: ROUTER_ADDRESS,
    abi: ROUTER_INTERFACE,
    functionName: funcName,
    args: args,
    // this flag may not be necessary
    enabled: (funcName != null && args != null)
  })
  const { data, isLoading, isSuccess, write } = useContractWrite(config)

  // app state
  const [fromToken, setFromToken] = useControllableState({defaultValue: null})
  const [toToken, setToToken] = useControllableState({defaultValue: null})
  const [fromAmount, setFromAmount] = useControllableState({defaultValue: ''})
  const [toAmount, setToAmount] = useControllableState({defaultValue: ''})
  const [valueAfterSlippage, setValueAfterSlippage] = useControllableState({defaultValue: null})
  const [swapType, setSwapType] = useControllableState({defaultValue: null})

  const provider: BaseProvider = new WebSocketProvider('ws://127.0.0.1:8545')

  const _handleQuoteChange = async () => {
    console.log(fromToken)
    console.log(toToken)
    console.log(fromAmount)
    console.log(toAmount)
    if (fromToken === null || toToken === null) {
        return
    }
    if (fromToken.id === toToken.id) {
        return
    }
    if (swapType === null) {
        return
    }
    if (fromAmount === '' && swapType === TradeType.EXACT_INPUT) {
        return
    }

    const from = new Token(CHAINID, TOKEN_ADDRESS[CHAINID][fromToken.id], 6)
    const to = new Token(CHAINID, TOKEN_ADDRESS[CHAINID][toToken.id], 6)

    const relevantPairs: Pair[] = await Fetcher.fetchRelevantPairs(
      CHAINID,
      from,
      to,
      provider
    )

    console.log("relevant", relevantPairs)

    let currentTrade

    if (swapType === TradeType.EXACT_INPUT) {
        const trade: Trade<Token, Token, TradeType.EXACT_INPUT>[] = Trade.bestTradeExactIn(
            relevantPairs,
            // what's the best way to multiply the entered amount with the decimals?
            CurrencyAmount.fromRawAmount(from, parseUnits(fromAmount.toString(), from.decimals).toString()),
            to,
            { maxNumResults: 3, maxHops: 2},
        )

        if (trade.length > 0) {
            setToAmount(trade[0].outputAmount.toExact())
            setValueAfterSlippage(trade[0].minimumAmountOut(SLIPPAGE))
            currentTrade = trade[0]
        }
    }
    else if (swapType === TradeType.EXACT_OUTPUT) {
        const trade: Trade<Token, Token, TradeType.EXACT_OUTPUT>[] = Trade.bestTradeExactOut(
            relevantPairs,
            from,
            // what's the best way to multiply the entered amount with the decimals
            CurrencyAmount.fromRawAmount(to, parseUnits( toAmount.toString(), to.decimals).toString()),
            { maxNumResults: 3, maxHops: 2},
        )

        if (trade.length > 0) {
            setFromAmount(trade[0].inputAmount.toExact())
            setValueAfterSlippage(trade[0].maximumAmountIn(SLIPPAGE))
            currentTrade = trade[0]
        }
    }

    if (currentTrade) {
        const swapParams: SwapParameters = Router.swapCallParameters(currentTrade, { allowedSlippage: SLIPPAGE, recipient: SWAP_RECIPIENT })

        setFuncName(swapParams.methodName)
        setArgs(swapParams.args)
    }
  }

  const fromTokenChanged = (option: OptionProps) => {
      setFromToken(option)

      console.log(isConnected)
      console.log(client)
  }

  const toTokenChanged = (option: OptionProps) => {
    setToToken(option)
  }

  const fromAmountChanged = (valString: string, valNum: number) => {
    setSwapType(TradeType.EXACT_INPUT)
    setFromAmount(valNum)
  }

  const toAmountChange = (valString: string, valNum: number) => {
    setSwapType(TradeType.EXACT_OUTPUT)
    setToAmount(valNum)
  }

  const doSwap = () => {
    if (funcName === null || args === null || write == null) {
        return
    }

    console.log("write", write)
    console.log("error", error)
    console.log("isLoading", isLoading)
    write()
  }

  useEffect(() => {
      _handleQuoteChange()
  }, [fromToken, toToken, fromAmount, toAmount, swapType])

  return (
    <VStack w={'full'}>
      <Heading size="md" marginBottom={6}>
        Sample Swap
      </Heading>
      <Container>
        <Badge text={'From Token'}/>
          <Select label='select a token' id={'from'} options={tokenSelectOptions} onChange={fromTokenChanged}/>
          <NumberInput min={0} id='input-amount' value={fromAmount} onChange={fromAmountChanged}>
              <NumberInputField />
          </NumberInput>
        <Badge text={'To Token'}/>
          <Select label='select a token' id={'to'} options={tokenSelectOptions} onChange={toTokenChanged}/>
          <NumberInput min={0} id='output-amount' value={toAmount} onChange={toAmountChange}>
              <NumberInputField />
          </NumberInput>
      </Container>
      <Button isLoading={false} onClick={doSwap} type='submit' colorScheme='green' size='lg' spinnerPlacement='end'>Swap</Button>


      <Text maxWidth={'100%'}>On-chain simulation error returns {error?.message} </Text>
    </VStack>
  );
};

export default Home;
