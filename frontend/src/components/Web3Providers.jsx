import { WagmiConfig } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import dynamic from 'next/dynamic';

const Web3Providers = ({ children, wagmiConfig, chains }) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

// Only include Web3Providers on the client side
export default dynamic(() => Promise.resolve(Web3Providers), {
  ssr: false,
});