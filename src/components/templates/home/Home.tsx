import {
    Heading,
    VStack,
    Container,
    NumberInputField,
    NumberInput
} from '@chakra-ui/react';
import {Badge, OptionProps, Select} from "@web3uikit/core";
import {Fetcher, Trade} from '@reservoir-labs/sdk'
import {CurrencyAmount, Token, TradeType} from "@reservoir-labs/sdk-core";
import {BaseProvider, WebSocketProvider} from "@ethersproject/providers";

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
  let fromToken: OptionProps | null
  let toToken: OptionProps | null

  const provider: BaseProvider = new WebSocketProvider('ws://127.0.0.1:8545')

  const fromTokenChanged = (option: OptionProps) => {
      fromToken = option
  }

  const toTokenChanged = async (option: OptionProps) => {
    toToken = option

    const from = new Token(CHAINID, TOKEN_ADDRESS[CHAINID][fromToken.id], 18)
    const to = new Token(CHAINID, TOKEN_ADDRESS[CHAINID][toToken.id], 18)
    const relevantPairs = await Fetcher.fetchRelevantPairs(
        CHAINID,
        from,
        to,
        provider
    );

    console.log("relevantPairs", relevantPairs)

    const route: Trade<Token, Token, TradeType.EXACT_INPUT>[] = Trade.bestTradeExactIn(
        relevantPairs,
        CurrencyAmount.fromRawAmount(from, "10000000000"),
        to,
        { maxNumResults: 3, maxHops: 2},
    )

    console.log(route)
  }

  return (
    <VStack w={'full'}>
      <Heading size="md" marginBottom={6}>
        Sample Swap
      </Heading>
      <Container>
        <Badge text={'From Token'}/>
          <Select label='select a token' id={'from'} options={tokenSelectOptions} onChange={fromTokenChanged}/>
          <NumberInput min={0} max={1000000}>
              <NumberInputField />
          </NumberInput>
        <Badge text={'To Token'}/>
          <Select label='select a token' id={'to'} options={tokenSelectOptions} onChange={toTokenChanged}/>
          <NumberInput min={0} max={1000000}>
              <NumberInputField />
          </NumberInput>
      </Container>
    </VStack>
  );
};

export default Home;
