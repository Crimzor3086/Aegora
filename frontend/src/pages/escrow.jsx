import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  RefreshCw,
  Shield,
  DollarSign,
  Users,
  Clock
} from 'lucide-react';
import Navbar from '../components/Navbar';
import EscrowCard from '../components/EscrowCard';

export default function EscrowPage() {
  const { address, isConnected } = useAccount();
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchEscrows();
  }, []);

  const fetchEscrows = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/escrow');
      const data = await response.json();
      
      if (data.success) {
        setEscrows(data.data);
      }
    } catch (error) {
      console.error('Error fetching escrows:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEscrows = escrows.filter(escrow => {
    const matchesSearch = searchTerm === '' || 
      escrow.escrowId.toString().includes(searchTerm) ||
      escrow.buyer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      escrow.seller?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || escrow.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewEscrow = (escrow) => {
    // Navigate to escrow detail page
    console.log('View escrow:', escrow);
  };

  const handleConfirmEscrow = async (escrowId) => {
    try {
      const response = await fetch(`/api/escrow/${escrowId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: address
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh escrows
        fetchEscrows();
      } else {
        alert('Error confirming escrow: ' + data.message);
      }
    } catch (error) {
      console.error('Error confirming escrow:', error);
      alert('Error confirming escrow');
    }
  };

  const handleDisputeEscrow = async (escrowId) => {
    try {
      const response = await fetch(`/api/escrow/${escrowId}/dispute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: address,
          evidenceHash: 'QmExampleHash', // This would be uploaded to IPFS
          evidenceDescription: 'Dispute evidence'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh escrows
        fetchEscrows();
      } else {
        alert('Error creating dispute: ' + data.message);
      }
    } catch (error) {
      console.error('Error creating dispute:', error);
      alert('Error creating dispute');
    }
  };

  const stats = {
    total: escrows.length,
    active: escrows.filter(e => e.status === 'Active').length,
    completed: escrows.filter(e => e.status === 'Completed').length,
    disputed: escrows.filter(e => e.status === 'Disputed').length
  };

  return (
    <>
      <Head>
        <title>Escrow - Aegora</title>
        <meta name="description" content="Manage your escrow transactions on Aegora" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Escrow</h1>
              <p className="text-gray-600 mt-2">Manage your secure transactions</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Escrow</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="flex items-center">
                <Users className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Disputed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.disputed}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search escrows..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Disputed">Disputed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                
                <button
                  onClick={fetchEscrows}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Escrows Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading escrows...</span>
            </div>
          ) : filteredEscrows.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No escrows found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Create your first escrow to get started.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Escrow
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEscrows.map((escrow, index) => (
                <motion.div
                  key={escrow.escrowId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <EscrowCard
                    escrow={escrow}
                    onView={handleViewEscrow}
                    onConfirm={handleConfirmEscrow}
                    onDispute={handleDisputeEscrow}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
