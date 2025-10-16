import { WagmiConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'viem';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
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

let walletConnectProjectId = config.walletConnectProjectId;

if (!walletConnectProjectId) {
  console.warn('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. Using a development fallback; wallet connections may be limited.');
  walletConnectProjectId = '00000000000000000000000000000000';
}

const wagmiConfig = getDefaultConfig({
  appName: config.appName,
  projectId: walletConnectProjectId,
  chains: [u2uNebulasTestnet],
  transports: {
    [u2uNebulasTestnet.id]: http(config.rpcUrl),
  },
});

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={[u2uNebulasTestnet]}>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}

export default MyApp;
