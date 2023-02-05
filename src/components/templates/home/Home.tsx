import { CheckCircleIcon, SettingsIcon } from '@chakra-ui/icons';
import {
    Heading,
    VStack,
    Container,
    NumberInputField,
    NumberInput
} from '@chakra-ui/react';
import {Badge, OptionProps, Select} from "@web3uikit/core";

const tokenSelectOptions: OptionProps[] = [{label: 'USDC', id: 'USDC'}, {label:'WAVAX', id: 'WAVAX'}, {label: 'USDT', id: 'USDT'}]

const Home = () => {

  const fromTokenChanged = (option: OptionProps) => {
    console.log("haha")
    console.log(option)
  }

  const toTokenChanged = (option: OptionProps) => {

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
              <NumberInputField>
              </NumberInputField>
          </NumberInput>
        <Badge text={'To Token'}/>
          <Select label='select a token' id={'to'} options={tokenSelectOptions} onChange={toTokenChanged}/>
          <NumberInput min={0} max={1000000}>
              <NumberInputField>
              </NumberInputField>
          </NumberInput>
      </Container>
    </VStack>
  );
};

export default Home;
