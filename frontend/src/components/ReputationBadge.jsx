import { motion } from 'framer-motion';
import { 
  Star, 
  Trophy, 
  Award, 
  Crown, 
  Shield,
  TrendingUp,
  Users,
  CheckCircle
} from 'lucide-react';

const ReputationBadge = ({ reputation, showDetails = false, size = 'md' }) => {
  const getTierIcon = (tier) => {
    switch (tier) {
      case 'Legend':
        return <Crown className="w-5 h-5" />;
      case 'Master':
        return <Trophy className="w-5 h-5" />;
      case 'Expert':
        return <Award className="w-5 h-5" />;
      case 'Trusted':
        return <Star className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Legend':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 'Master':
        return 'bg-gradient-to-r from-purple-500 to-purple-700 text-white';
      case 'Expert':
        return 'bg-gradient-to-r from-blue-500 to-blue-700 text-white';
      case 'Trusted':
        return 'bg-gradient-to-r from-green-500 to-green-700 text-white';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
    }
  };

  const getSizeClasses = (size) => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      case 'xl':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  if (!reputation) {
    return (
      <div className={`inline-flex items-center space-x-1 rounded-full bg-gray-100 text-gray-600 ${getSizeClasses(size)}`}>
        <Shield className="w-4 h-4" />
        <span>Newcomer</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center space-x-2"
    >
      <div className={`inline-flex items-center space-x-1 rounded-full ${getTierColor(reputation.tier)} ${getSizeClasses(size)}`}>
        {getTierIcon(reputation.tier)}
        <span className="font-medium">{reputation.tier}</span>
      </div>
      
      {showDetails && (
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-4 h-4" />
            <span>{reputation.score}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{reputation.transactions?.total || 0}</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4" />
            <span>{reputation.transactions?.successful || 0}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ReputationBadge;
