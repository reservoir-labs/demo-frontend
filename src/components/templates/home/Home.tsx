import {
    Heading,
    VStack,
    Container,
    NumberInputField,
    NumberInput
} from '@chakra-ui/react';
import {Badge, OptionProps, Select} from "@web3uikit/core";
import {Fetcher, Trade} from '@reservoir-labs/sdk'
import {Token} from "@reservoir-labs/sdk-core";

const tokenSelectOptions: OptionProps[] = [{label: 'USDC', id: 'USDC'}, {label:'WAVAX', id: 'WAVAX'}, {label: 'USDT', id: 'USDT'}]

const CHAINID = 43114

const TOKEN_ADDRESS = {
    'USDC': '0x0000000000000000000000000000000000000000',
    'USDT': '0x0000000000000000000000000000000000000000',
    'WAVAX': '0x0000000000000000000000000000000000000000'
}
const Home = () => {
  let fromToken: OptionProps | null
  let toToken: OptionProps | null

  const fromTokenChanged = (option: OptionProps) => {
      fromToken = option
  }

  const toTokenChanged = (option: OptionProps) => {
    toToken = option

    const relevantPairs = Fetcher.fetchRelevantPairs(
        CHAINID,
        new Token(CHAINID, TOKEN_ADDRESS[fromToken.id], 18),
        new Token(CHAINID, TOKEN_ADDRESS[toToken.id], 18),
    );

    // call Trade.bestTradeExactIn()
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
