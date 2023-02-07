import {
    Button,
    ButtonSpinner,
    Container,
    Heading,
    NumberInput,
    NumberInputField,
    useControllableState,
    VStack
} from '@chakra-ui/react';
import {Badge, OptionProps, Select} from "@web3uikit/core";
import {Fetcher, Pair, Trade} from '@reservoir-labs/sdk'
import {CurrencyAmount, Token, TradeType} from "@reservoir-labs/sdk-core";
import {BaseProvider, WebSocketProvider} from "@ethersproject/providers";
import {useEffect} from "react";
import {BuildError} from "next/dist/client/components/react-dev-overlay/internal/container/BuildError";

const tokenSelectOptions: OptionProps[] = [{label: 'USDC', id: 'USDC'}, {label:'WAVAX', id: 'WAVAX'}, {label: 'USDT', id: 'USDT'}]

const CHAINID = 43114

const TOKEN_ADDRESS = {
    43114: {
        'USDC': '0x2B0d36FACD61B71CC05ab8F3D2355ec3631C0dd5',
        'USDT': '0xfbC22278A96299D91d41C453234d97b4F5Eb9B2d',
        'WAVAX': '0x46b142DD1E924FAb83eCc3c08e4D46E82f005e0E'
    }
}

const Home = () => {
  const [fromToken, setFromToken] = useControllableState({defaultValue: null})
  const [toToken, setToToken] = useControllableState({defaultValue: null})
  const [fromAmount, setFromAmount] = useControllableState({defaultValue: ''})
  const [toAmount, setToAmount] = useControllableState({defaultValue: ''})
  const [swapType, setSwapType] = useControllableState({defaultValue: null})
  const provider: BaseProvider = new WebSocketProvider('ws://127.0.0.1:8545')

  const _handleQuoteChange = async () => {

    console.log(fromToken)
    console.log(toToken)
    console.log(fromAmount)
    console.log(toAmount)
    if (fromToken == null || toToken == null) {
        return
    }
    if (fromToken.id === toToken.id) {
        return
    }
    if (fromAmount === '' && swapType === TradeType.EXACT_INPUT) {
        return
    }

    const from = new Token(CHAINID, TOKEN_ADDRESS[CHAINID][fromToken.id], 18)
    const to = new Token(CHAINID, TOKEN_ADDRESS[CHAINID][toToken.id], 18)

    const relevantPairs: Pair[] = await Fetcher.fetchRelevantPairs(
      CHAINID,
      from,
      to,
      provider
    )

    console.log("relevant", relevantPairs)

    if (swapType === TradeType.EXACT_INPUT) {
        const route: Trade<Token, Token, TradeType.EXACT_INPUT>[] = Trade.bestTradeExactIn(
            relevantPairs,
            CurrencyAmount.fromRawAmount(from, fromAmount),
            to,
            { maxNumResults: 3, maxHops: 2},
        )

        if (route.length > 0) {
            setToAmount(route[0].outputAmount.toExact())
        }
    }
    else if (swapType === TradeType.EXACT_OUTPUT) {
        const route: Trade<Token, Token, TradeType.EXACT_OUTPUT>[] = Trade.bestTradeExactOut(
            relevantPairs,
            from,
            CurrencyAmount.fromRawAmount(to, toAmount),
            { maxNumResults: 3, maxHops: 2},
        )

        if (route.length > 0) {
            setFromAmount(route[0].inputAmount.toExact())
        }
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
      <Button colorScheme='green' spinnerPlacement='end'>Swap</Button>
    </VStack>
  );
};

export default Home;
