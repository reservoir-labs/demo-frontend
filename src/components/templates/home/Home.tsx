import { CheckCircleIcon, SettingsIcon } from '@chakra-ui/icons';
import {
    Heading,
    VStack,
    List,
    ListIcon,
    ListItem,
    Divider,
    Container,
    Box,
    NumberInputField,
    NumberInput
} from '@chakra-ui/react';
import {Header} from "../../modules";
import {Badge, Select} from "@web3uikit/core";

const Home = () => {
  return (
    <VStack w={'full'}>
      <Heading size="md" marginBottom={6}>
        Sample Swap
      </Heading>
      <Container>
        <Badge text={'From Token'}/>
          <Select id={'from'} options={[{label: 'USDC', id: 'USDC'}, {label:'WAVAX', id: 'WAVAX'}, {label: 'USDT', id: 'USDT'}]}/>
          <NumberInput min={0} max={1000000}>
              <NumberInputField>
              </NumberInputField>
          </NumberInput>
        <Badge text={'To Token'}/>
          <Select id={'to'} options={[{label: 'USDC', id: 'USDC'}, {label:'WAVAX', id: 'WAVAX'}, {label: 'USDT', id: 'USDT'}]}/>
          <NumberInput min={0} max={1000000}>
              <NumberInputField>
              </NumberInputField>
          </NumberInput>
      </Container>
    </VStack>
  );
};

export default Home;
