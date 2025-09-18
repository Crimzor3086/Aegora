import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAccount, useContractRead, useContractWrite } from 'wagmi';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Plus, 
  Vote, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  TrendingUp,
  FileText
} from 'lucide-react';
import Navbar from '../components/Navbar';

export default function GovernancePage() {
  const { address, isConnected } = useAccount();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      // This would fetch from the governance contract
      // For now, we'll use mock data
      const mockProposals = [
        {
          id: 1,
          title: 'Increase Escrow Fee to 0.5%',
          description: 'Proposal to increase the escrow fee from 0.25% to 0.5% to better fund the protocol.',
          proposer: '0x1234...5678',
          status: 'Active',
          votesFor: 1250000,
          votesAgainst: 750000,
          totalVotes: 2000000,
          startBlock: 1000000,
          endBlock: 1001000,
          createdAt: new Date('2024-01-15'),
          type: 'ParameterUpdate'
        },
        {
          id: 2,
          title: 'Add Support for USDC Token',
          description: 'Add USDC as an allowed token for escrow transactions.',
          proposer: '0x9876...5432',
          status: 'Succeeded',
          votesFor: 1800000,
          votesAgainst: 200000,
          totalVotes: 2000000,
          startBlock: 950000,
          endBlock: 960000,
          createdAt: new Date('2024-01-10'),
          type: 'IntegrationApproval'
        },
        {
          id: 3,
          title: 'Emergency Pause Protocol',
          description: 'Emergency proposal to pause the protocol due to a critical vulnerability.',
          proposer: '0x1111...2222',
          status: 'Executed',
          votesFor: 2000000,
          votesAgainst: 0,
          totalVotes: 2000000,
          startBlock: 900000,
          endBlock: 910000,
          createdAt: new Date('2024-01-05'),
          type: 'EmergencyAction'
        }
      ];
      
      setProposals(mockProposals);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (proposalId, support) => {
    try {
      // This would call the governance contract
      console.log('Voting on proposal:', proposalId, support);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-blue-100 text-blue-800';
      case 'Succeeded':
        return 'bg-green-100 text-green-800';
      case 'Defeated':
        return 'bg-red-100 text-red-800';
      case 'Executed':
        return 'bg-purple-100 text-purple-800';
      case 'Expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
      }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return <Clock className="w-4 h-4" />;
      case 'Succeeded':
        return <CheckCircle className="w-4 h-4" />;
      case 'Defeated':
        return <XCircle className="w-4 h-4" />;
      case 'Executed':
        return <AlertTriangle className="w-4 h-4" />;
      case 'Expired':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'ParameterUpdate':
        return 'bg-blue-100 text-blue-800';
      case 'ContractUpgrade':
        return 'bg-purple-100 text-purple-800';
      case 'TreasuryManagement':
        return 'bg-green-100 text-green-800';
      case 'IntegrationApproval':
        return 'bg-orange-100 text-orange-800';
      case 'EmergencyAction':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const ProposalCard = ({ proposal }) => {
    const forPercentage = (proposal.votesFor / proposal.totalVotes) * 100;
    const againstPercentage = (proposal.votesAgainst / proposal.totalVotes) * 100;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Proposal #{proposal.id}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(proposal.type)}`}>
              {proposal.type}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
              {getStatusIcon(proposal.status)}
              <span className="ml-1">{proposal.status}</span>
            </span>
          </div>
        </div>

        {/* Title and Description */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{proposal.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{proposal.description}</p>

        {/* Proposer */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">Proposed by</span>
          <span className="text-sm font-medium text-gray-900">
            {proposal.proposer}
          </span>
        </div>

        {/* Voting Results */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Voting Results</span>
            <span className="text-gray-900">
              {proposal.votesFor.toLocaleString()} / {proposal.totalVotes.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div className="flex h-2 rounded-full">
              <div 
                className="bg-green-500 h-2 rounded-l-full" 
                style={{ width: `${forPercentage}%` }}
              />
              <div 
                className="bg-red-500 h-2 rounded-r-full" 
                style={{ width: `${againstPercentage}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>For: {forPercentage.toFixed(1)}%</span>
            <span>Against: {againstPercentage.toFixed(1)}%</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedProposal(proposal)}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>View Details</span>
          </button>
          
          {proposal.status === 'Active' && (
            <>
              <button
                onClick={() => handleVote(proposal.id, true)}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
              >
                <Vote className="w-4 h-4" />
                <span>Vote For</span>
              </button>
              <button
                onClick={() => handleVote(proposal.id, false)}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                <Vote className="w-4 h-4" />
                <span>Vote Against</span>
              </button>
            </>
          )}
        </div>
      </motion.div>
    );
  };

  const stats = {
    total: proposals.length,
    active: proposals.filter(p => p.status === 'Active').length,
    succeeded: proposals.filter(p => p.status === 'Succeeded').length,
    executed: proposals.filter(p => p.status === 'Executed').length
  };

  return (
    <>
      <Head>
        <title>Governance - Aegora</title>
        <meta name="description" content="Participate in AegoraDAO governance" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Governance</h1>
              <p className="text-gray-600 mt-2">Participate in AegoraDAO decisions</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Proposal</span>
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
                <Settings className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Proposals</p>
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
                <Clock className="w-8 h-8 text-blue-600" />
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
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Succeeded</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.succeeded}</p>
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
                <AlertTriangle className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Executed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.executed}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Proposals */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Proposals</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Settings className="w-8 h-8 animate-pulse text-blue-600" />
                <span className="ml-2 text-gray-600">Loading proposals...</span>
              </div>
            ) : proposals.length === 0 ? (
              <div className="text-center py-12">
                <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals found</h3>
                <p className="text-gray-600 mb-4">
                  No governance proposals have been created yet.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create First Proposal
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {proposals.map((proposal, index) => (
                  <ProposalCard key={proposal.id} proposal={proposal} />
                ))}
              </div>
            )}
          </div>

          {/* Governance Info */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How Governance Works</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Voting Process</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Proposal Creation</p>
                      <p className="text-sm text-gray-600">Anyone with enough AEG tokens can create a proposal</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Voting Period</p>
                      <p className="text-sm text-gray-600">Token holders vote on the proposal for a specified period</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Execution</p>
                      <p className="text-sm text-gray-600">If the proposal passes, it can be executed after a delay</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Proposal Types</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Parameter Update
                    </span>
                    <span className="text-sm text-gray-600">Change protocol parameters</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Contract Upgrade
                    </span>
                    <span className="text-sm text-gray-600">Upgrade smart contracts</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Treasury Management
                    </span>
                    <span className="text-sm text-gray-600">Manage protocol treasury</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Integration Approval
                    </span>
                    <span className="text-sm text-gray-600">Approve new integrations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
