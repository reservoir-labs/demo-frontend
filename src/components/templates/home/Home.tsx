import { CheckCircleIcon, SettingsIcon } from '@chakra-ui/icons';
import {Heading, VStack, List, ListIcon, ListItem, Divider, Container, Box} from '@chakra-ui/react';
import {Header} from "../../modules";
import {Badge, Select} from "@web3uikit/core";

const Home = () => {
  return (
    <VStack w={'full'}>
      <Heading size="md" marginBottom={6}>
        Sample Swap
      </Heading>
      {/*<List spacing={3}>*/}
      {/*  <ListItem>*/}
      {/*    <ListIcon as={CheckCircleIcon} color="green.500" />*/}
      {/*    Moralis authentication*/}
      {/*  </ListItem>*/}
      {/*  <ListItem>*/}
      {/*    <ListIcon as={CheckCircleIcon} color="green.500" />*/}
      {/*    Display Transactions*/}
      {/*  </ListItem>*/}
      {/*  <ListItem>*/}
      {/*    <ListIcon as={CheckCircleIcon} color="green.500" />*/}
      {/*    Display ERC20 transfers*/}
      {/*  </ListItem>*/}
      {/*  <ListItem>*/}
      {/*    <ListIcon as={CheckCircleIcon} color="green.500" />*/}
      {/*    Display ERC20 balances*/}
      {/*  </ListItem>*/}
      {/*  <ListItem>*/}
      {/*    <ListIcon as={CheckCircleIcon} color="green.500" />*/}
      {/*    Display NFT balances*/}
      {/*  </ListItem>*/}
      {/*  <ListItem>*/}
      {/*    <ListIcon as={CheckCircleIcon} color="green.500" />*/}
      {/*    Display NFT transfers*/}
      {/*  </ListItem>*/}
      {/*  <ListItem>*/}
      {/*    <ListIcon as={CheckCircleIcon} color="green.500" />*/}
      {/*    Multichain Support*/}
      {/*  </ListItem>*/}
      {/*  <ListItem>*/}
      {/*    <ListIcon as={CheckCircleIcon} color="green.500" />*/}
      {/*    Using Moralis from client-side*/}
      {/*  </ListItem>*/}
      {/*  <ListItem>*/}
      {/*    <ListIcon as={SettingsIcon} color="green.500" />*/}
      {/*    Adding explorer links to balances, transactions ...*/}
      {/*  </ListItem>*/}
      {/*  <ListItem>*/}
      {/*    <ListIcon as={SettingsIcon} color="green.500" />*/}
      {/*    Better responsive design*/}
      {/*  </ListItem>*/}
      {/*  <ListItem>*/}
      {/*    <ListIcon as={SettingsIcon} color="green.500" />*/}
      {/*    Rainbowkit integration*/}
      {/*  </ListItem>*/}
      {/*  <ListItem>*/}
      {/*    <ListIcon as={SettingsIcon} color="green.500" />*/}
      {/*    ... and more*/}
      {/*  </ListItem>*/}
      {/*</List>*/}

      {/*<Divider></Divider>*/}

      <Container>
        <Badge text={'From Token'}/>
          <Select id={'from'} />
        <Badge text={'To Token'}/>
          <Select id={'to'} />
      </Container>
    </VStack>
  );
};

export default Home;
