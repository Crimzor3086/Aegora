import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, usePublicClient } from 'wagmi';
import { Menu, X, Shield, Scale, Users, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import config from '../config/env';
import { fetchErc20Balance } from '../utils/ethers';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [aegBalance, setAegBalance] = useState(null);

  const navigation = [
    { name: 'Escrow', href: '/escrow', icon: Shield },
    { name: 'Disputes', href: '/disputes', icon: Scale },
    { name: 'Reputation', href: '/reputation', icon: Users },
    { name: 'Governance', href: '/governance', icon: Settings },
    { name: 'P2P', href: '/p2p', icon: DollarIcon },
  ];

  function DollarIcon(props) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={`w-4 h-4 ${props.className||''}`}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-4 0-4 6 0 6s4 6 0 6m0-18v2m0 14v2"/></svg>;
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!address || !config.contracts.tokenAEG) { setAegBalance(null); return; }
      const bal = await fetchErc20Balance({ publicClient, tokenAddress: config.contracts.tokenAEG, owner: address });
      if (!cancelled) setAegBalance(bal);
    }
    load();
    const id = setInterval(load, 15000);
    return () => { cancelled = true; clearInterval(id); };
  }, [address, publicClient]);

  const isActive = (href) => router.pathname === href;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Aegora</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Connect + Balance */}
          <div className="hidden md:flex items-center space-x-4">
            {aegBalance && (
              <div className="text-sm text-gray-700">
                AEG: <span className="font-semibold">{aegBalance.formatted}</span>
              </div>
            )}
            <ThemeToggle />
            <ConnectButton />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
              <div className="px-3 py-2 flex items-center justify-between">
                <ThemeToggle />
                <ConnectButton />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
