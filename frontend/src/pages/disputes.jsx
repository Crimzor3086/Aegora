import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { 
  Scale, 
  Search, 
  Filter, 
  RefreshCw,
  AlertTriangle,
  Clock,
  CheckCircle,
  Users,
  Eye,
  Vote
} from 'lucide-react';
import Navbar from '../components/Navbar';

export default function DisputesPage() {
  const { address, isConnected } = useAccount();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState(null);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/disputes');
      const data = await response.json();
      
      if (data.success) {
        setDisputes(data.data);
      }
    } catch (error) {
      console.error('Error fetching disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = searchTerm === '' || 
      dispute.disputeId.toString().includes(searchTerm) ||
      dispute.buyer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.seller?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewDispute = (dispute) => {
    setSelectedDispute(dispute);
  };

  const handleVote = async (disputeId, vote) => {
    try {
      const response = await fetch(`/api/disputes/${disputeId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jurorAddress: address,
          vote: vote
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh disputes
        fetchDisputes();
        setSelectedDispute(null);
      } else {
        alert('Error casting vote: ' + data.message);
      }
    } catch (error) {
      console.error('Error casting vote:', error);
      alert('Error casting vote');
    }
  };

  const stats = {
    total: disputes.length,
    pending: disputes.filter(d => d.status === 'Pending').length,
    inProgress: disputes.filter(d => d.status === 'InProgress').length,
    resolved: disputes.filter(d => d.status === 'Resolved').length
  };

  const DisputeCard = ({ dispute }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'Pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'InProgress':
          return 'bg-blue-100 text-blue-800';
        case 'Resolved':
          return 'bg-green-100 text-green-800';
        case 'Cancelled':
          return 'bg-gray-100 text-gray-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'Pending':
          return <Clock className="w-4 h-4" />;
        case 'InProgress':
          return <AlertTriangle className="w-4 h-4" />;
        case 'Resolved':
          return <CheckCircle className="w-4 h-4" />;
        case 'Cancelled':
          return <XCircle className="w-4 h-4" />;
        default:
          return <Clock className="w-4 h-4" />;
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Dispute #{dispute.disputeId}</span>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
            {getStatusIcon(dispute.status)}
            <span className="ml-1">{dispute.status}</span>
          </span>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Escrow ID</span>
            <span className="text-sm font-medium text-gray-900">#{dispute.escrowId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Buyer</span>
            <span className="text-sm font-medium text-gray-900">
              {dispute.buyer?.slice(0, 6)}...{dispute.buyer?.slice(-4)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Seller</span>
            <span className="text-sm font-medium text-gray-900">
              {dispute.seller?.slice(0, 6)}...{dispute.seller?.slice(-4)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Jurors</span>
            <span className="text-sm font-medium text-gray-900">
              {dispute.jurors?.length || 0}
            </span>
          </div>
        </div>

        {/* Votes */}
        {dispute.status === 'InProgress' && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Buyer Votes</span>
              <span className="text-green-600 font-medium">{dispute.votes?.buyerVotes || 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Seller Votes</span>
              <span className="text-blue-600 font-medium">{dispute.votes?.sellerVotes || 0}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewDispute(dispute)}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>View</span>
          </button>
          
          {dispute.status === 'InProgress' && dispute.jurors?.some(j => j.address === address?.toLowerCase()) && (
            <button
              onClick={() => handleVote(dispute.disputeId, 'Buyer')}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
            >
              <Vote className="w-4 h-4" />
              <span>Vote Buyer</span>
            </button>
          )}
          
          {dispute.status === 'InProgress' && dispute.jurors?.some(j => j.address === address?.toLowerCase()) && (
            <button
              onClick={() => handleVote(dispute.disputeId, 'Seller')}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Vote className="w-4 h-4" />
              <span>Vote Seller</span>
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <Head>
        <title>Disputes - Aegora</title>
        <meta name="description" content="Manage disputes and arbitration on Aegora" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Disputes</h1>
              <p className="text-gray-600 mt-2">Manage arbitration and dispute resolution</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="flex items-center">
                <Scale className="w-8 h-8 text-blue-600" />
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
                <Clock className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
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
                <AlertTriangle className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
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
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
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
                    placeholder="Search disputes..."
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
                  <option value="Pending">Pending</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                
                <button
                  onClick={fetchDisputes}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Disputes Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading disputes...</span>
            </div>
          ) : filteredDisputes.length === 0 ? (
            <div className="text-center py-12">
              <Scale className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No disputes found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No disputes have been created yet.'
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredDisputes.map((dispute, index) => (
                <DisputeCard key={dispute.disputeId} dispute={dispute} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
