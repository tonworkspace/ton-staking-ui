import { Buffer } from 'buffer';
window.Buffer = Buffer;

import { FC, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCoins, FaChartLine, FaUsers, FaWallet } from 'react-icons/fa';
import { BiNetworkChart } from 'react-icons/bi';
import { RiMessage3Line } from 'react-icons/ri';
import { AiOutlineHome } from 'react-icons/ai';
import { useAuth } from '@/hooks/useAuth';

const infoCards = [
  {
    id: 1,
    icon: '💎',
    title: 'Stake TON',
    description: 'Earn up to 35% APY by staking your TON',
    color: 'text-blue-500 border-blue-500/20',
    action: '/stake'
  },
  {
    id: 2,
    icon: '🌟',
    title: 'Referral Program',
    description: 'Earn up to 15% from your referrals stakes',
    color: 'text-green-500 border-green-500/20',
    action: '/referral'
  },
  {
    id: 3,
    icon: '🎯',
    title: 'Daily Tasks',
    description: 'Complete tasks to earn additional rewards',
    color: 'text-orange-500 border-orange-500/20',
    action: '/tasks'
  },
  {
    id: 4,
    icon: '🏆',
    title: 'Leaderboard',
    description: 'Compete with other stakers for prizes',
    color: 'text-pink-500 border-pink-500/20',
    action: '/leaderboard'
  }
];

const statsCards = [
  {
    id: 'total_staked',
    title: 'Total Staked',
    icon: FaWallet,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    id: 'total_earned',
    title: 'Total Earned',
    icon: FaCoins,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10'
  },
  {
    id: 'team_volume',
    title: 'Team Volume',
    icon: FaChartLine,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
  {
    id: 'referrals',
    title: 'Referrals',
    icon: FaUsers,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  }
];

export const IndexPage: FC = () => {
  const navigate = useNavigate();
  const { user, telegramUser, isLoading, error, updateUserData } = useAuth();
  const [currentTab, setCurrentTab] = useState('home');
  const [tasks] = useState([
    { id: '1', title: 'Daily Check-in', description: 'Log in daily to earn rewards', reward: 1, completed: false },
    { id: '2', title: 'Stake TON', description: 'Stake your first TON', reward: 2, completed: false },
    { id: '3', title: 'Invite Friends', description: 'Invite 3 friends to join', reward: 3, completed: false }
  ]);
  const [stakeAmount, setStakeAmount] = useState<number>(0);
  const [stakeDuration, setStakeDuration] = useState<number>(30); // days
  const [estimatedRewards, setEstimatedRewards] = useState<number>(0);
  const [apy, setApy] = useState<number>(35); // 35% APY
  const [isProcessing, setProcessing] = useState(false);
  const [previousStake, setPreviousStake] = useState(0);
  const [isSnackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarDescription, setSnackbarDescription] = useState('');

  const calculateRewards = () => {
    const dailyRate = apy / 365;
    const reward = (stakeAmount * dailyRate * stakeDuration) / 100;
    setEstimatedRewards(reward);
  };

  useEffect(() => {
    calculateRewards();
  }, [stakeAmount, stakeDuration, apy]);

  const handleStake = async () => {
    if (stakeAmount <= 0) return;
    
    if (previousStake > 0 && stakeAmount < previousStake) {
      showSnackbar(
        'Invalid Amount', 
        'New stake must be greater than previous stake'
      );
      return;
    }

    setProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay
      
      await updateUserData({
        total_deposit: stakeAmount,
      });
      
      setPreviousStake(stakeAmount);
      showSnackbar(
        'Stake Successful', 
        `Successfully staked ${stakeAmount} TON`
      );
      
    } catch (err: unknown) {
      setProcessing(false);
      showSnackbar(
        'Stake Failed',
        'Failed to process stake. Please try again.'
      );
      console.error('Staking error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const showSnackbar = useCallback((message: string, description: string) => {
    setSnackbarMessage(message);
    setSnackbarDescription(description);
    setSnackbarVisible(true);
    setTimeout(() => setSnackbarVisible(false), 4000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0F]">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0F]">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-w-md mx-4">
          <div className="text-red-500 text-center">{error}</div>
        </div>
      </div>
    );
  }

  if (!user || !telegramUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0F]">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 max-w-md mx-4">
          <div className="text-yellow-500 text-center">Please open this app in Telegram</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0F] text-white antialiased">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-lg z-50 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0066FF] via-purple-600 to-pink-500 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-1000 group-hover:duration-200 animate-gradient"></div>
            <div className="relative">
              <img 
                src={telegramUser.photoUrl || "https://xelene.me/telegram.gif"} 
                alt="" 
                className="w-10 h-10 rounded-full object-cover ring-2 ring-black"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-white">
              {telegramUser.username ? `@${telegramUser.username}` : 'Anonymous'}
            </span>
            <span className="text-sm text-gray-400">
              {telegramUser.firstName || 'Anonymous'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-xs font-medium">
            {user.rank || 'Novice'}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        {currentTab === 'home' && (
          <div className="p-4 space-y-6 max-w-2xl mx-auto w-full">
           
          </div>
        )}

        {currentTab === 'network' && (
          <div className="p-4 space-y-6 max-w-2xl mx-auto w-full">

          </div>
        )}

        {currentTab === 'gmp' && (
          <div className="p-4 space-y-6 max-w-2xl mx-auto w-full">
          </div>
        )}

        {currentTab === 'tasks' && (
          <div className="p-4 space-y-6 max-w-2xl mx-auto w-full">
          
          </div>
        )}

        {currentTab === 'token' && (
          <div className="p-4 space-y-6 max-w-2xl mx-auto w-full">
          
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1A1B1E]/90 backdrop-blur-xl border-t border-white/5 safe-area-pb">
        <div className="max-w-lg mx-auto px-2 md:px-4">
          <div className="grid grid-cols-5 items-center">
            {[
              { id: 'home', text: 'Home', Icon: AiOutlineHome },
              { id: 'network', text: 'Network', Icon: BiNetworkChart },
              { id: 'gmp', text: 'GMP', Icon: FaCoins },
              { id: 'tasks', text: 'Tasks', Icon: RiMessage3Line },
              { id: 'token', text: 'Token', Icon: FaUsers }
            ].map(({ id, text, Icon }) => (
              <button 
                key={id} 
                onClick={() => setCurrentTab(id)}
                className={`flex flex-col items-center py-3 md:py-4 w-full transition-all duration-300 ${
                  currentTab === id ? 'text-blue-400' : 'text-gray-500'
                }`}
              >
                <Icon size={18} className="mb-1" />
                <span className="text-[10px] md:text-xs font-medium tracking-wide truncate max-w-[64px] text-center">
                  {text}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
