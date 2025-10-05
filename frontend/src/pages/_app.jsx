import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { mainnet, polygon, arbitrum, optimism } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import '../styles/globals.css';
import config from '../config/env';

// U2U Network Nebulas Testnet configuration
const u2uNebulasTestnet = {
  id: 2484,
  name: 'U2U Network Nebulas',
  network: 'u2u-nebulas-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'U2U',
    symbol: 'U2U',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-nebulas-testnet.u2u.xyz'],
    },
    public: {
      http: ['https://rpc-nebulas-testnet.u2u.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'U2U Nebulas Explorer',
      url: 'https://nebulas-testnet-explorer.u2u.xyz',
    },
  },
};

const providers = [];
if (config.alchemyId) {
  providers.push(alchemyProvider({ apiKey: config.alchemyId }));
}
providers.push(publicProvider());

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [u2uNebulasTestnet],
  providers
);

const walletOptions = {
  appName: config.appName,
  chains,
};
if (config.walletConnectProjectId) {
  walletOptions.projectId = config.walletConnectProjectId;
}
const { connectors } = getDefaultWallets(walletOptions);

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
