import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { mainnet, polygon, arbitrum, optimism } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import '../styles/globals.css';
import config from '../config/env';

// U2U Network configuration
const u2u = {
  id: 39,
  name: 'U2U Network',
  network: 'u2u',
  nativeCurrency: {
    decimals: 18,
    name: 'U2U',
    symbol: 'U2U',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.u2u.xyz'],
    },
    public: {
      http: ['https://rpc.u2u.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'U2U Explorer',
      url: 'https://explorer.u2u.xyz',
    },
  },
};

const u2uTestnet = {
  id: 248,
  name: 'U2U Testnet',
  network: 'u2u-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'U2U',
    symbol: 'U2U',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.u2u.xyz/testnet'],
    },
    public: {
      http: ['https://rpc.u2u.xyz/testnet'],
    },
  },
  blockExplorers: {
    default: {
      name: 'U2U Testnet Explorer',
      url: 'https://testnet-explorer.u2u.xyz',
    },
  },
};

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [u2u, u2uTestnet, mainnet, polygon, arbitrum, optimism],
  [
    alchemyProvider({ apiKey: config.alchemyId }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: config.appName,
  projectId: config.walletConnectProjectId,
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

function MyApp({ Component, pageProps }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
