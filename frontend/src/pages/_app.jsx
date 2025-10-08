import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { mainnet, polygon, arbitrum, optimism } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import '../styles/globals.css';
import config from '../config/env';
import ErrorBoundary from '../components/ErrorBoundary';
import { ToastProvider } from '../components/Toast';

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

import dynamic from 'next/dynamic';
import Web3Providers from '../components/Web3Providers';

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        {typeof window !== 'undefined' ? (
          <Web3Providers wagmiConfig={wagmiConfig} chains={chains}>
            <Component {...pageProps} />
          </Web3Providers>
        ) : (
          <Component {...pageProps} />
        )}
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default MyApp;
