import {
    Button,
    Container,
    Heading,
    NumberInput,
    NumberInputField, Text,
    useControllableState,
    VStack
} from '@chakra-ui/react';
import {Badge, OptionProps, Select} from "@web3uikit/core";
import {Fetcher, Pair, Router, SwapParameters, Trade} from '@reservoir-labs/sdk'
import {CurrencyAmount, Ether, Token, TradeType} from "@reservoir-labs/sdk-core";
import {useEffect} from "react";
import {
    useAccount, useBalance, usePrepareSendTransaction, useProvider, useSendTransaction,
} from "wagmi";
import {parseUnits} from "@ethersproject/units";
import {
    CHAINID,
    TOKEN_ADDRESS,
    SWAP_RECIPIENT,
    ROUTER_ADDRESS,
    TOKEN_DECIMALS, SLIPPAGE
} from "../../../constants";
import {AddressZero} from "@ethersproject/constants";

const tokenSelectOptions: OptionProps[] = [
    {label: 'USDC', id: 'USDC'},
    {label: 'WAVAX', id: 'WAVAX'},
    {label: 'AVAX', id: 'AVAX'},
    {label: 'USDT', id: 'USDT'}
]

const Home = () => {
  // wallet, provider, smart contract state
  const provider = useProvider()
  const { address: connectedAddress } = useAccount()
  const [calldata, setCalldata] = useControllableState({defaultValue: null})
  const [value, setValue] = useControllableState({defaultValue: null})
  const { config, error } = usePrepareSendTransaction({
    request: {
        to: ROUTER_ADDRESS,
        value: value,
        data: calldata
    },
    // this flag may not be necessary
    enabled: calldata != null
  })
  const { isLoading, sendTransaction } = useSendTransaction(config)

  // page state
  const [fromToken, setFromToken] = useControllableState({defaultValue: null})
  const [toToken, setToToken] = useControllableState({defaultValue: null})

  const { data: fromTokenBal } = useBalance({
      token: TOKEN_ADDRESS[CHAINID][fromToken?.id] === AddressZero ? null : TOKEN_ADDRESS[CHAINID][fromToken?.id],
      chainId: CHAINID,
      address: connectedAddress,
      enabled: (connectedAddress != null && fromToken != null),
      watch: true
  })
  const { data: toTokenBal } = useBalance({
      token: TOKEN_ADDRESS[CHAINID][toToken?.id] === AddressZero ? null : TOKEN_ADDRESS[CHAINID][toToken?.id],
      chainId: CHAINID,
      address: connectedAddress,
      enabled: (connectedAddress != null && toToken != null),
      watch: true
  })

  const [fromAmount, setFromAmount] = useControllableState({defaultValue: ''})
  const [toAmount, setToAmount] = useControllableState({defaultValue: ''})
  const [valueAfterSlippage, setValueAfterSlippage] = useControllableState({defaultValue: null})
  const [swapType, setSwapType] = useControllableState({defaultValue: null})
  const [currentTrade, setCurrentTrade] = useControllableState({defaultValue: null})

  const _handleQuoteChange = async () => {
    if (fromToken === null || toToken === null) {
        return
    }
    // this should never be allowed to happen on the UI, being able to select the same token
    if (fromToken.id === toToken.id) {
        return
    }
    if (swapType === null) {
        return
    }
    if (fromAmount === '' && swapType === TradeType.EXACT_INPUT) {
        return
    }

    const from = TOKEN_ADDRESS[CHAINID][fromToken.id] === AddressZero
        ? Ether.onChain(CHAINID)
        : new Token(CHAINID, TOKEN_ADDRESS[CHAINID][fromToken.id], TOKEN_DECIMALS[CHAINID][fromToken.id])
    const to = TOKEN_ADDRESS[CHAINID][toToken.id] === AddressZero
        ? Ether.onChain(CHAINID)
        : new Token(CHAINID, TOKEN_ADDRESS[CHAINID][toToken.id], TOKEN_DECIMALS[CHAINID][toToken.id])

    const relevantPairs: Pair[] = await Fetcher.fetchRelevantPairs(
      CHAINID,
      from.wrapped,
      to.wrapped,
      provider
    )
    console.log("rel p", relevantPairs)

    let trade
    if (relevantPairs.length > 0) {
        if (swapType === TradeType.EXACT_INPUT) {
            const trades: Trade<Token, Token, TradeType.EXACT_INPUT>[] = Trade.bestTradeExactIn(
                relevantPairs,
                // what's the best way to multiply the entered amount with the decimals?
                CurrencyAmount.fromRawAmount(from, parseUnits(fromAmount.toString(), from.decimals).toString()),
                to,
                { maxNumResults: 3, maxHops: 2},
            )
            console.log("trades", trades)
            if (trades.length > 0) {
                setToAmount(trades[0].outputAmount.toExact())
                setValueAfterSlippage(trades[0].minimumAmountOut(SLIPPAGE))
                trade = trades[0]
            }
        }
        else if (swapType === TradeType.EXACT_OUTPUT) {
            const trades: Trade<Token, Token, TradeType.EXACT_OUTPUT>[] = Trade.bestTradeExactOut(
                relevantPairs,
                from,
                CurrencyAmount.fromRawAmount(to, parseUnits(toAmount.toString(), to.decimals).toString()),
                { maxNumResults: 3, maxHops: 2},
            )

            if (trades.length > 0) {
                setFromAmount(trades[0].inputAmount.toExact())
                setValueAfterSlippage(trades[0].maximumAmountIn(SLIPPAGE))
                trade = trades[0]
            }
        }

        if (trade) {
            const swapParams: SwapParameters = Router.swapCallParameters(trade, { allowedSlippage: SLIPPAGE, recipient: SWAP_RECIPIENT })
            setCalldata(swapParams.calldata)
            setValue(swapParams.value)
            setCurrentTrade(trade)
        }
    }
    else {
        setCurrentTrade(null)
    }
  }

  const fromTokenChanged = (option: OptionProps) => {
      setFromToken(option)
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
    if (calldata === null || sendTransaction == null) {
        return
    }

    sendTransaction()
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
          <Text>Balance { fromTokenBal?.formatted } </Text>
          <NumberInput min={0} id='input-amount' value={fromAmount} onChange={fromAmountChanged}>
              <NumberInputField />
          </NumberInput>
        <Badge text={'To Token'}/>
          <Select label='select a token' id={'to'} options={tokenSelectOptions} onChange={toTokenChanged}/>
          <Text>Balance { toTokenBal?.formatted } </Text>
          <NumberInput min={0} id='output-amount' value={toAmount} onChange={toAmountChange}>
              <NumberInputField />
          </NumberInput>
      </Container>

      <Text> { swapType === TradeType.EXACT_INPUT ? 'Min amount out' : 'Max amt in' }  { valueAfterSlippage?.toExact() } </Text>
      <Text> { currentTrade ? `This swap goes through curveId ${currentTrade.route.pairs[0].curveId}` : 'no route for trade' } </Text>
      <Button isLoading={isLoading} onClick={doSwap} type='submit' colorScheme='green' size='lg' spinnerPlacement='end'>Swap</Button>

      <Text maxWidth={'100%'}>On-chain simulation error returns {error?.message} </Text>
    </VStack>
  );
};

export default Home;
