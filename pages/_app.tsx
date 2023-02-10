import { ChakraProvider } from '@chakra-ui/react';
import {Chain, createClient, WagmiConfig} from 'wagmi';
import { configureChains } from '@wagmi/core';
import {
  arbitrum,
  arbitrumGoerli,
  avalanche,
  avalancheFuji,
  bsc,
  bscTestnet,
  fantom,
  fantomTestnet,
  foundry,
  goerli,
  mainnet,
  optimism,
  optimismGoerli,
  polygon,
  polygonMumbai,
  sepolia,
} from '@wagmi/core/chains';
import { extendTheme } from '@chakra-ui/react';
import { publicProvider } from 'wagmi/providers/public';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';

const localRpc: Chain = {
    id: 43114,
    name: "local",
    network: "local",
    testnet: true,
    rpcUrls: {
        default: {
            http: ['http://127.0.0.1:8545']
        }
    },
    nativeCurrency: {
        name: "avax",
        symbol: "AVAX",
        decimals: 18
    }
}

const { provider, webSocketProvider } = configureChains(
  [
    arbitrum,
    arbitrumGoerli,
    // avalanche,
    avalancheFuji,
    bsc,
    bscTestnet,
    fantom,
    fantomTestnet,
    foundry,
    goerli,
    mainnet,
    optimism,
    optimismGoerli,
    polygon,
    polygonMumbai,
    sepolia,
    localRpc
  ],
  [publicProvider()],
);

const client = createClient({
  provider,
  webSocketProvider,
  autoConnect: true,
});

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme({ config });

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <ChakraProvider resetCSS theme={theme}>
      <WagmiConfig client={client}>
        <SessionProvider session={pageProps.session} refetchInterval={0}>
          <Component {...pageProps} />
        </SessionProvider>
      </WagmiConfig>
    </ChakraProvider>
  );
};

export default MyApp;
