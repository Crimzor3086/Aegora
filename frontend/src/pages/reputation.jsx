import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Trophy,
  Star,
  Award,
  Crown,
  Shield,
  TrendingUp,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ReputationBadge from '../components/ReputationBadge';

export default function ReputationPage() {
  const { address, isConnected } = useAccount();
  const [reputations, setReputations] = useState([]);
  const [userReputation, setUserReputation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');

  useEffect(() => {
    fetchReputations();
    if (address) {
      fetchUserReputation();
    }
  }, [address]);

  const fetchReputations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reputation/leaderboard/top?limit=50');
      const data = await response.json();
      
      if (data.success) {
        setReputations(data.data);
      }
    } catch (error) {
      console.error('Error fetching reputations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReputation = async () => {
    try {
      const response = await fetch(`/api/reputation/${address}`);
      const data = await response.json();
      
      if (data.success) {
        setUserReputation(data.data);
      }
    } catch (error) {
      console.error('Error fetching user reputation:', error);
    }
  };

  const filteredReputations = reputations.filter(reputation => {
    const matchesSearch = searchTerm === '' || 
      reputation.user?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTier = tierFilter === 'all' || reputation.tier === tierFilter;
    
    return matchesSearch && matchesTier;
  });

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'Legend':
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 'Master':
        return <Trophy className="w-6 h-6 text-purple-500" />;
      case 'Expert':
        return <Award className="w-6 h-6 text-blue-500" />;
      case 'Trusted':
        return <Star className="w-6 h-6 text-green-500" />;
      default:
        return <Shield className="w-6 h-6 text-gray-500" />;
    }
  };

  const LeaderboardCard = ({ reputation, rank }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-bold text-gray-600">
              {rank}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {reputation.user?.slice(0, 6)}...{reputation.user?.slice(-4)}
              </p>
              <ReputationBadge reputation={reputation} size="sm" />
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{reputation.score}</p>
            <p className="text-sm text-gray-600">points</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Transactions</p>
            <p className="font-medium text-gray-900">{reputation.transactions?.total || 0}</p>
          </div>
          <div>
            <p className="text-gray-600">Success Rate</p>
            <p className="font-medium text-gray-900">
              {reputation.successRate?.toFixed(1) || 0}%
            </p>
          </div>
          <div>
            <p className="text-gray-600">Arbitrations</p>
            <p className="font-medium text-gray-900">{reputation.arbitrations?.participated || 0}</p>
          </div>
          <div>
            <p className="text-gray-600">Arbitration Rate</p>
            <p className="font-medium text-gray-900">
              {reputation.arbitrationSuccessRate?.toFixed(1) || 0}%
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <Head>
        <title>Reputation - Aegora</title>
        <meta name="description" content="View reputation scores and leaderboard on Aegora" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reputation</h1>
              <p className="text-gray-600 mt-2">Trust scores and community leaderboard</p>
            </div>
          </div>

          {/* User Reputation Card */}
          {userReputation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white mb-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Your Reputation</h2>
                  <div className="flex items-center space-x-4 mb-4">
                    <ReputationBadge reputation={userReputation} size="lg" />
                    <div className="text-3xl font-bold">{userReputation.score}</div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-blue-100">Transactions</p>
                      <p className="font-bold">{userReputation.transactions?.total || 0}</p>
                    </div>
                    <div>
                      <p className="text-blue-100">Success Rate</p>
                      <p className="font-bold">{userReputation.successRate?.toFixed(1) || 0}%</p>
                    </div>
                    <div>
                      <p className="text-blue-100">Arbitrations</p>
                      <p className="font-bold">{userReputation.arbitrations?.participated || 0}</p>
                    </div>
                    <div>
                      <p className="text-blue-100">Badges</p>
                      <p className="font-bold">{userReputation.badges?.length || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {getTierIcon(userReputation.tier)}
                </div>
              </div>
            </motion.div>
          )}

          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Tiers</option>
                  <option value="Legend">Legend</option>
                  <option value="Master">Master</option>
                  <option value="Expert">Expert</option>
                  <option value="Trusted">Trusted</option>
                  <option value="Newcomer">Newcomer</option>
                </select>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Leaderboard</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <TrendingUp className="w-8 h-8 animate-pulse text-blue-600" />
                <span className="ml-2 text-gray-600">Loading leaderboard...</span>
              </div>
            ) : filteredReputations.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600">
                  {searchTerm || tierFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No users have reputation scores yet.'
                  }
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredReputations.map((reputation, index) => (
                  <LeaderboardCard 
                    key={reputation.user} 
                    reputation={reputation} 
                    rank={index + 1} 
                  />
                ))}
              </div>
            )}
          </div>

          {/* Reputation Tiers Info */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Reputation Tiers</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { tier: 'Newcomer', min: 0, max: 99, icon: Shield, color: 'text-gray-500' },
                { tier: 'Trusted', min: 100, max: 499, icon: Star, color: 'text-green-500' },
                { tier: 'Expert', min: 500, max: 999, icon: Award, color: 'text-blue-500' },
                { tier: 'Master', min: 1000, max: 1999, icon: Trophy, color: 'text-purple-500' },
                { tier: 'Legend', min: 2000, max: Infinity, icon: Crown, color: 'text-yellow-500' }
              ].map((tierInfo, index) => (
                <motion.div
                  key={tierInfo.tier}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center`}>
                    <tierInfo.icon className={`w-8 h-8 ${tierInfo.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{tierInfo.tier}</h3>
                  <p className="text-sm text-gray-600">
                    {tierInfo.max === Infinity 
                      ? `${tierInfo.min}+ points`
                      : `${tierInfo.min}-${tierInfo.max} points`
                    }
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
