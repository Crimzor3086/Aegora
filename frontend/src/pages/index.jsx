import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Scale, 
  Users, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle,
  Globe,
  Zap
} from 'lucide-react';
import Navbar from '../components/Navbar';
import config from '../config/env';
import EscrowCard from '../components/EscrowCard';
import ReputationBadge from '../components/ReputationBadge';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [stats, setStats] = useState({
    totalEscrows: 0,
    activeDisputes: 0,
    totalUsers: 0,
    totalVolume: 0
  });

  useEffect(() => {
    // Fetch stats from API
    const fetchStats = async () => {
      try {
        const [escrowRes, disputeRes, reputationRes] = await Promise.all([
          fetch(`${config.apiUrl}/api/escrow/stats/overview`),
          fetch(`${config.apiUrl}/api/disputes/stats/overview`),
          fetch(`${config.apiUrl}/api/reputation/stats/overview`)
        ]);

        const escrowData = await escrowRes.json();
        const disputeData = await disputeRes.json();
        const reputationData = await reputationRes.json();

        setStats({
          totalEscrows: escrowData.data?.total || 0,
          activeDisputes: disputeData.data?.active || 0,
          totalUsers: reputationData.data?.totalUsers || 0,
          totalVolume: escrowData.data?.byStatus?.reduce((sum, item) => sum + item.totalAmount, 0) || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const features = [
    {
      icon: Shield,
      title: 'Decentralized Escrow',
      description: 'Funds are locked in smart contracts and automatically released when terms are met.',
      color: 'text-blue-600'
    },
    {
      icon: Scale,
      title: 'On-Chain Arbitration',
      description: 'Disputes are resolved by randomly selected jurors with stake-based incentives.',
      color: 'text-green-600'
    },
    {
      icon: Users,
      title: 'Reputation System',
      description: 'Every user has a trust score that increases with successful trades and fair rulings.',
      color: 'text-purple-600'
    },
    {
      icon: TrendingUp,
      title: 'DAO Governance',
      description: 'The AegoraDAO decides policies, fees, and upgrades through token voting.',
      color: 'text-orange-600'
    }
  ];

  const benefits = [
    'Transparent dispute resolution',
    'No centralized control',
    'Global accessibility',
    'Lower costs than traditional courts',
    'Fast resolution times',
    'Immutable reputation records'
  ];

  return (
    <>
      <Head>
        <title>Aegora - Decentralized Arbitration & Trust Marketplace</title>
        <meta name="description" content="Aegora is a decentralized arbitration and reputation protocol designed to solve the problem of trust in peer-to-peer digital interactions." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-950">
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                  Trust Without
                  <span className="text-blue-600"> Centralization</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                  Aegora introduces a trustless dispute resolution system where escrow, 
                  arbitration, and reputation are handled entirely on-chain, governed by a DAO.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <ConnectButton />
                  <button className="px-8 py-3 bg-white text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                    Learn More
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-blue-600">{stats.totalEscrows}</div>
                <div className="text-gray-600">Total Escrows</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-green-600">{stats.activeDisputes}</div>
                <div className="text-gray-600">Active Disputes</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-purple-600">{stats.totalUsers}</div>
                <div className="text-gray-600">Total Users</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-orange-600">
                  ${(stats.totalVolume / 1000000).toFixed(1)}M
                </div>
                <div className="text-gray-600">Total Volume</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How Aegora Works
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our decentralized arbitration system ensures fair, transparent, and efficient 
                dispute resolution for Web3 transactions.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <feature.icon className={`w-12 h-12 ${feature.color} mb-4`} />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Why Choose Aegora?
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Traditional dispute resolution is slow, expensive, and often biased. 
                  Aegora provides a decentralized alternative that's fast, fair, and accessible to everyone.
                </p>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="flex items-center"
                    >
                      <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                      <span className="text-gray-700">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-2xl text-white"
              >
                <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
                <p className="text-blue-100 mb-6">
                  Join thousands of users who trust Aegora for their Web3 transactions.
                </p>
                <div className="space-y-4">
                  <button className="w-full bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    Create Escrow
                  </button>
                  <button className="w-full border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                    Become a Juror
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Use Cases
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Aegora can be integrated into any Web3 platform that needs trust and dispute resolution.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Globe,
                  title: 'NFT Trades',
                  description: 'Disputes on authenticity or delivery of NFT transactions.',
                  color: 'bg-blue-100 text-blue-600'
                },
                {
                  icon: Users,
                  title: 'Freelance Contracts',
                  description: 'Resolution of disputes over milestones and payments.',
                  color: 'bg-green-100 text-green-600'
                },
                {
                  icon: Zap,
                  title: 'P2P Crypto Trades',
                  description: 'Trustless escrow for over-the-counter cryptocurrency deals.',
                  color: 'bg-purple-100 text-purple-600'
                }
              ].map((useCase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`w-12 h-12 ${useCase.color} rounded-lg flex items-center justify-center mb-4`}>
                    <useCase.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {useCase.title}
                  </h3>
                  <p className="text-gray-600">
                    {useCase.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Start Building Trust Today
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Join the decentralized future of dispute resolution. 
                Create your first escrow or become a juror in our arbitration system.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Get Started
                </button>
                <button className="px-8 py-3 border border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                  View Documentation
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Aegora</h3>
                <p className="text-gray-400">
                  Decentralized arbitration and trust marketplace for Web3.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white">Escrow</a></li>
                  <li><a href="#" className="hover:text-white">Arbitration</a></li>
                  <li><a href="#" className="hover:text-white">Reputation</a></li>
                  <li><a href="#" className="hover:text-white">Governance</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Resources</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white">Documentation</a></li>
                  <li><a href="#" className="hover:text-white">API</a></li>
                  <li><a href="#" className="hover:text-white">GitHub</a></li>
                  <li><a href="#" className="hover:text-white">Blog</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Community</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white">Discord</a></li>
                  <li><a href="#" className="hover:text-white">Twitter</a></li>
                  <li><a href="#" className="hover:text-white">Telegram</a></li>
                  <li><a href="#" className="hover:text-white">Forum</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 Aegora. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
