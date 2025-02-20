import { Buffer } from 'buffer';
window.Buffer = Buffer;

import { FC, useState, useEffect, useCallback } from 'react';
import { FaCoins, FaUsers } from 'react-icons/fa';
import { BiNetworkChart } from 'react-icons/bi';
import { RiMessage3Line } from 'react-icons/ri';
import { Header } from '@/components/Header/Header';
import { useAuth } from '@/hooks/useAuth';
import { HDC_PRICE } from '@/config/gameConfig';
import { useReferral } from '@/hooks/useReferral';
import { BOT_USERNAME } from '@/config/constants';

// Simplified interfaces
interface MiningStats {
  totalMined: number;
  cycleEarnings: number;
  checkpointsPassed: number;
  cycleCompletion: number;
  cycleStartTime: number;
  totalReturn: number;
}

const LOGIN_BONUS = {
  DAILY: { AMOUNT: 100, INTERVAL: 24 * 60 * 60 * 1000 },
  HOURLY: { AMOUNT: 10, INTERVAL: 60 * 60 * 1000 }
};

// Add checkpoint configuration
const CHECKPOINT_CONFIG = {
  MIN_DEPOSIT: 0.1,
  CHECKPOINTS: [
    { threshold: 0.25, bonus: 0.05 }, // 25% cycle completion, 5% bonus
    { threshold: 0.50, bonus: 0.10 }, // 50% cycle completion, 10% bonus
    { threshold: 0.75, bonus: 0.15 }, // 75% cycle completion, 15% bonus
    { threshold: 1.00, bonus: 0.20 }  // 100% cycle completion, 20% bonus
  ]
};

const MINING_CONFIG = {
  MIN_DEPOSIT: 1,
  CYCLE_DURATION: 6 * 60 * 60 * 1000, // 6 hours
  DAILY_RETURN: {
    MIN: 0.02, // 2%
    MAX: 0.04  // 4%
  },
  MAX_CYCLE_RETURN: 2 // 200% return
};

// Add withdrawal configuration
const WITHDRAWAL_CONFIG = {
  DIRECT_SHARE: 0.7,    // 70% to user
  WEEKLY_SHARE: 0.2,    // 20% to weekly pool
  HDC_SHARE: 0.1,       // 10% to HDC pool
  MIN_WITHDRAWAL: 1,     // Minimum withdrawal amount
};

// Add persistent storage keys
const STORAGE_KEYS = {
  HDC_BALANCE: 'hdc_balance',
  MINING_STATS: 'mining_stats',
  LAST_CREDIT_TIME: 'last_credit_time',
  STAKED_AMOUNT: 'staked_amount',
  IS_STAKING: 'is_staking',
  MINING_INITIALIZED: 'mining_initialized',
  CYCLE_START_TIME: 'cycle_start_time',
  GAME_STATE: 'game_state',
  LAST_DAILY_CLAIM: 'last_daily_claim',
  LAST_HOURLY_CLAIM: 'last_hourly_claim',
  LAST_LOGOUT_TIME: 'last_logout_time',
  LAST_CLAIM_TIME: 'last_claim_time',
  LOGIN_STREAK: 'login_streak',
  LAST_LOGIN_DATE: 'last_login_date',
};

// Add referral configuration
const REFERRAL_CONFIG = {
  LEVELS: [
    { LEVEL: 1, RATE: 0.08 }, // 8% for level 1
    { LEVEL: 2, RATE: 0.05 }, // 5% for level 2
    { LEVEL: 3, RATE: 0.03 }  // 3% for level 3
  ],
  RANKS: [
    { REQUIRED_REFS: 100, WEEKLY_BONUS: 20 },
    { REQUIRED_REFS: 50, WEEKLY_BONUS: 10 },
    { REQUIRED_REFS: 25, WEEKLY_BONUS: 5 },
    { REQUIRED_REFS: 10, WEEKLY_BONUS: 2 }
  ]
};

type ReferralLevel = 'level1' | 'level2' | 'level3';

interface ReferralUser {
  id: string;
  username: string;
}

// Add game state interface
interface GameState {
  stakedAmount: number;
  hdcBalance: number;
  isStaking: boolean;
  miningStats: MiningStats;
  lastDailyBonus: number;
  lastHourlyBonus: number;
  referralStats: {
    directReferrals: number;
    activeReferrals: number;
    totalEarnings: number;
    weeklyBonus: number;
    referralTree: {
      level1: ReferralUser[];
      level2: ReferralUser[];
      level3: ReferralUser[];
    };
  };
  lastLogoutTime: number;
  accumulatedBonus: number;
}

// Add daily bonus config
const DAILY_BONUS = {
  AMOUNT: 100, // Base amount
  COOLDOWN: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

// Add to existing config
const BONUS_CONFIG = {
  DAILY: {
    AMOUNT: 100,
    COOLDOWN: 24 * 60 * 60 * 1000, // 24 hours
  },
  HOURLY: {
    AMOUNT: 25,
    COOLDOWN: 6 * 60 * 60 * 1000, // 6 hours
  }
};

// // Add withdrawal interface
// interface WithdrawalRequest {
//   amount: number;
//   walletAddress: string;
//   timestamp: number;
//   status: 'pending' | 'completed' | 'failed';
// }

// Enhance offline bonus configuration
const OFFLINE_BONUS_CONFIG = {
  RATE: 0.5, // 50% of normal mining rate while offline
  MAX_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 days maximum accumulation
  MIN_DURATION: 5 * 60 * 1000, // 5 minutes minimum for bonus
  ANIMATION_DURATION: 300, // Animation duration in ms
};

// Simplified upgrade options
const UPGRADE_OPTIONS = [
  { amount: 1, label: 'Starter', color: 'blue', boost: '2x' },
  { amount: 5, label: 'Pro', color: 'purple', boost: '3x' },
  { amount: 10, label: 'Elite', color: 'yellow', boost: '4x' },
  { amount: 25, label: 'Master', color: 'green', boost: '5x' },
];

// Add streak configuration
const STREAK_CONFIG = {
  RESET_HOURS: 48, // Reset streak if user misses more than 48 hours
  REWARDS: [
    { days: 3, bonus: 0.1 }, // 10% bonus at 3 days
    { days: 7, bonus: 0.15 }, // 15% bonus at 7 days
    { days: 14, bonus: 0.2 }, // 20% bonus at 14 days
    { days: 30, bonus: 0.3 }, // 30% bonus at 30 days
  ]
};

export const IndexPage: FC = () => {
  const { user, isLoading, error, loginStreak } = useAuth();
  const { referralStats } = useReferral();
  
  // Add these state declarations before the useEffect that uses them
  const [lastDailyClaim, setLastDailyClaim] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LAST_DAILY_CLAIM);
    return saved ? parseInt(saved) : 0;
  });

  const [lastHourlyClaim, setLastHourlyClaim] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LAST_HOURLY_CLAIM);
    return saved ? parseInt(saved) : 0;
  });

  const [isStaking, setIsStaking] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IS_STAKING);
    return saved ? JSON.parse(saved) : false;
  });

  // Rest of your state declarations
  const [currentTab, setCurrentTab] = useState<'mine' | 'network' | 'gmp' | 'tasks' | 'token'>('mine');
  const [lastLogoutTime, setLastLogoutTime] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LAST_LOGOUT_TIME);
    return saved ? parseInt(saved) : Date.now();
  });
  const [lastClaimTime, setLastClaimTime] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LAST_CLAIM_TIME);
    return saved ? parseInt(saved) : 0;
  });
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDailyBonusModal, setShowDailyBonusModal] = useState(false);
  const [showHourlyBonusModal, setShowHourlyBonusModal] = useState(false);
  const [showMiningStartedModal, setShowMiningStartedModal] = useState(false);
  const [showCheckpointModal, setShowCheckpointModal] = useState(false);
  const [showAccumulatedBonusModal, setShowAccumulatedBonusModal] = useState(false);
  const [currentCheckpointBonus, setCurrentCheckpointBonus] = useState(0);
  const [accumulatedBonus, setAccumulatedBonus] = useState<number>(0);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawalError, setWithdrawalError] = useState<string>('');
  const [walletRegistrationError, setWalletRegistrationError] = useState('');
  const [registeredWallet, setRegisteredWallet] = useState<string>(() => {
    return localStorage.getItem('registered_wallet') || '';
  });
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [showWalletRegistrationModal, setShowWalletRegistrationModal] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Add snackbar state
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Add all useCallback definitions
  const getStreakBonus = useCallback(() => {
    for (let i = STREAK_CONFIG.REWARDS.length - 1; i >= 0; i--) {
      if (loginStreak >= STREAK_CONFIG.REWARDS[i].days) {
        return STREAK_CONFIG.REWARDS[i].bonus;
      }
    }
    return 0;
  }, [loginStreak]);

  // Update handleReferral function
  const handleReferral = useCallback(async () => {
    try {
      const referralLink = `https://t.me/${BOT_USERNAME}?start=ref_${user?.telegram_id}`;
      await navigator.clipboard.writeText(referralLink);
      
      // Show success feedback
      setCopySuccess(true);
      setSnackbarMessage('Referral link copied to clipboard!');
      setShowSnackbar(true);

      // Hide feedback after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
        setShowSnackbar(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy referral link:', err);
      // Show error feedback
      setSnackbarMessage('Failed to copy referral link');
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 2000);
    }
  }, [user?.telegram_id]);

  // Add all useEffect hooks
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkBonuses = () => {
      const now = Date.now();
      
      if (now - lastDailyClaim >= BONUS_CONFIG.DAILY.COOLDOWN && isStaking) {
        setShowDailyBonusModal(true);
      }
      
      if (now - lastHourlyClaim >= BONUS_CONFIG.HOURLY.COOLDOWN && isStaking) {
        setShowHourlyBonusModal(true);
      }
    };

    checkBonuses();
    const interval = setInterval(checkBonuses, 60 * 1000);
    return () => clearInterval(interval);
  }, [lastDailyClaim, lastHourlyClaim, isStaking]);

  // Load saved state before initializing other state
  const savedState = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
  const initialState: GameState = savedState ? JSON.parse(savedState) : {
    stakedAmount: 0,
    hdcBalance: 0,
    isStaking: false,
    miningStats: {
      totalMined: 0,
      cycleEarnings: 0,
      checkpointsPassed: 0,
      cycleCompletion: 0,
      cycleStartTime: 0,
      totalReturn: 0
    },
    lastDailyBonus: Date.now(),
    lastHourlyBonus: Date.now(),
    referralStats: {
      directReferrals: 0,
      activeReferrals: 0,
      totalEarnings: 0,
      weeklyBonus: 0,
      referralTree: {
        level1: [],
        level2: [],
        level3: []
      }
    },
    lastLogoutTime: Date.now(),
    accumulatedBonus: 0,
  };

  // Initialize state with saved values
  const [stakedAmount, setStakedAmount] = useState<number>(initialState.stakedAmount);
  const [hdcBalance, setHdcBalance] = useState<number>(initialState.hdcBalance);
  const [miningStats, setMiningStats] = useState<MiningStats>(initialState.miningStats);
  const [lastDailyBonus, setLastDailyBonus] = useState<number>(initialState.lastDailyBonus);
  const [lastHourlyBonus, setLastHourlyBonus] = useState<number>(initialState.lastHourlyBonus);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [bonusAmount, ] = useState<number>(0);
  const [bonusType, ] = useState<'daily' | 'hourly'>('daily');
  const [showCycleCompleteModal, setShowCycleCompleteModal] = useState(false);

  // Add mining initialization state
  const [miningInitialized, setMiningInitialized] = useState<boolean>(initialState.isStaking);

  // Add logout handler
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem(STORAGE_KEYS.LAST_LOGOUT_TIME, Date.now().toString());
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Add formatted time display helper
  const formatOfflineDuration = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} days ${hours % 24} hours`;
    }
    return hours > 0 ? 
      `${hours}h ${minutes}m` : 
      `${minutes}m`;
  };

  // Enhanced bonus calculation
  useEffect(() => {
    const calculateAccumulatedBonus = () => {
      if (!isStaking || accumulatedBonus > 0) return;

      const now = Date.now();
      if (lastClaimTime < lastLogoutTime) {
        const offlineDuration = Math.min(
          now - lastLogoutTime,
          OFFLINE_BONUS_CONFIG.MAX_DURATION
        );

        // Only show bonus if offline duration exceeds minimum
        if (offlineDuration > OFFLINE_BONUS_CONFIG.MIN_DURATION) {
          const baseEarnings = calculateMiningReturns(stakedAmount, offlineDuration / 1000);
          const offlineBonus = baseEarnings * OFFLINE_BONUS_CONFIG.RATE;
          
          if (offlineBonus > 0) {
            setAccumulatedBonus(offlineBonus);
            setShowAccumulatedBonusModal(true);
          }
        }
      }
    };

    calculateAccumulatedBonus();
  }, [isStaking, lastLogoutTime, stakedAmount, accumulatedBonus, lastClaimTime]);

  // Update claim handler
  const claimAccumulatedBonus = () => {
    if (accumulatedBonus > 0) {
      setHdcBalance(prev => prev + accumulatedBonus);
      setAccumulatedBonus(0);
      
      const now = Date.now();
      setLastClaimTime(now);
      localStorage.setItem(STORAGE_KEYS.LAST_CLAIM_TIME, now.toString());
      
      const modal = document.querySelector('.bonus-modal');
      modal?.classList.add('animate-fade-out');
      
      setTimeout(() => {
        setShowAccumulatedBonusModal(false);
        setLastLogoutTime(now);
        localStorage.setItem(STORAGE_KEYS.LAST_LOGOUT_TIME, now.toString());
      }, 300);
    }
  };

  // Make sure formatTimeRemaining is defined within the component
  const formatTimeRemaining = (targetTime: number): string => {
    const remaining = Math.max(0, targetTime - currentTime);
    
    if (remaining === 0) return "Ready!";
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // const calculateStakeBonus = (amount: number): number => {
  //   return 1 + (Math.log10(amount + 1) * 0.1);
  // };

  const calculateMiningReturns = (stakedAmount: number, timeElapsed: number) => {
    const dailyRate = MINING_CONFIG.DAILY_RETURN.MIN + 
      (Math.random() * (MINING_CONFIG.DAILY_RETURN.MAX - MINING_CONFIG.DAILY_RETURN.MIN));
    const secondRate = dailyRate / (24 * 60 * 60); // Convert daily rate to per-second
    const earnings = stakedAmount * secondRate * timeElapsed;
    
    // Check if cycle completion reached 200%
    const totalReturn = miningStats.totalReturn + (earnings / stakedAmount);
    if (totalReturn >= MINING_CONFIG.MAX_CYCLE_RETURN) {
      setShowCycleCompleteModal(true);
      return 0; // Stop earnings until new cycle starts
    }
    
    return earnings;
  };

  // Add referral earnings calculation
  const calculateReferralEarnings = (miningAmount: number) => {
    if (!referralStats) return 0;
    
    return REFERRAL_CONFIG.LEVELS.reduce((total, level) => {
      const levelKey = `level${level.LEVEL}` as keyof typeof referralStats.byLevel;
      const levelCount = referralStats.byLevel[levelKey] || 0;
      return total + (miningAmount * level.RATE * levelCount);
    }, 0);
  };

  // Add rank calculation
  const calculateRankBonus = (activeReferrals: number) => {
    const rank = REFERRAL_CONFIG.RANKS.find(r => activeReferrals >= r.REQUIRED_REFS);
    return rank ? rank.WEEKLY_BONUS : 0;
  };

  // Load saved game state on component mount
  useEffect(() => {
    const loadGameState = () => {
      const savedState = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
      if (savedState) {
        const gameState: GameState = JSON.parse(savedState);
        
        // Restore all game state
        setStakedAmount(gameState.stakedAmount);
        setHdcBalance(gameState.hdcBalance);
        setIsStaking(gameState.isStaking);
        setMiningStats(gameState.miningStats);
        setLastDailyBonus(gameState.lastDailyBonus);
        setLastHourlyBonus(gameState.lastHourlyBonus);
        
        // If mining was active, ensure it's properly initialized
        if (gameState.isStaking) {
          setMiningInitialized(true);
        }
      }
    };

    loadGameState();
  }, []);

  // Save game state whenever relevant state changes
  useEffect(() => {
    const gameState: GameState = {
      stakedAmount,
      hdcBalance,
      isStaking,
      miningStats,
      lastDailyBonus,
      lastHourlyBonus,
      referralStats: {
        directReferrals: 0,
        activeReferrals: 0,
        totalEarnings: 0,
        weeklyBonus: 0,
        referralTree: {
          level1: [],
          level2: [],
          level3: []
        }
      },
      lastLogoutTime: Date.now(),
      accumulatedBonus: 0,
    };

    localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(gameState));
  }, [
    stakedAmount,
    hdcBalance,
    isStaking,
    miningStats,
    lastDailyBonus,
    lastHourlyBonus,
    lastLogoutTime,
  ]);

  // Modify startMining function to persist initial state
  const startMining = () => {
    const amount = Number(depositAmount);
    if (amount < MINING_CONFIG.MIN_DEPOSIT) return;

    const newStakedAmount = stakedAmount + amount;
    setStakedAmount(newStakedAmount);
    setIsStaking(true);
    setMiningInitialized(true);
    
    // Initialize mining stats
    const newMiningStats = {
      ...miningStats,
      cycleStartTime: Date.now(),
      cycleCompletion: 0,
      cycleEarnings: 0,
      totalMined: miningStats.totalMined || 0,
      checkpointsPassed: 0,
      totalReturn: 0
    };
    
    setMiningStats(newMiningStats);

    // Save initial state immediately
    const initialGameState: GameState = {
      stakedAmount: newStakedAmount,
      hdcBalance,
      isStaking: true,
      miningStats: newMiningStats,
      lastDailyBonus,
      lastHourlyBonus,
      referralStats: {
        directReferrals: 0,
        activeReferrals: 0,
        totalEarnings: 0,
        weeklyBonus: 0,
        referralTree: {
          level1: [],
          level2: [],
          level3: []
        }
      },
      lastLogoutTime: Date.now(),
      accumulatedBonus: 0,
    };
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(initialGameState));

    setShowDepositModal(false);
    setDepositAmount('');
  };

  // Modify resetMining to clear persisted state
  const resetMining = () => {
    const resetState: GameState = {
      stakedAmount: 0,
      hdcBalance: 0,
      isStaking: false,
      miningStats: {
        totalMined: 0,
        cycleEarnings: 0,
        checkpointsPassed: 0,
        cycleCompletion: 0,
        cycleStartTime: 0,
        totalReturn: 0
      },
      lastDailyBonus: Date.now(),
      lastHourlyBonus: Date.now(),
      referralStats: {
        directReferrals: 0,
        activeReferrals: 0,
        totalEarnings: 0,
        weeklyBonus: 0,
        referralTree: {
          level1: [],
          level2: [],
          level3: []
        }
      },
      lastLogoutTime: Date.now(),
      accumulatedBonus: 0,
    };

    // Update state
    setStakedAmount(0);
    setIsStaking(false);
    setHdcBalance(0);
    setMiningStats(resetState.miningStats);
    
    // Clear persisted state
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(resetState));
  };

  const claimBonus = () => {
    setShowBonusModal(false);
    setHdcBalance(prev => prev + bonusAmount);
  };

  // Auto-save state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HDC_BALANCE, hdcBalance.toString());
    localStorage.setItem(STORAGE_KEYS.MINING_STATS, JSON.stringify(miningStats));
    localStorage.setItem(STORAGE_KEYS.LAST_CREDIT_TIME, lastDailyBonus.toString());
    localStorage.setItem(STORAGE_KEYS.STAKED_AMOUNT, stakedAmount.toString());
    localStorage.setItem(STORAGE_KEYS.IS_STAKING, isStaking.toString());
  }, [hdcBalance, miningStats, lastDailyBonus, stakedAmount, isStaking]);

  // Update mining effect to handle checkpoints
  useEffect(() => {
    if (!isStaking) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const cycleElapsed = now - miningStats.cycleStartTime;
      const cycleCompletion = cycleElapsed / MINING_CONFIG.CYCLE_DURATION;
      
      // Regular mining calculations
      const newEarnings = calculateMiningReturns(stakedAmount, 1);
      
      // Calculate referral earnings
      const referralEarnings = calculateReferralEarnings(newEarnings);

      setMiningStats(prev => ({
        ...prev,
        totalMined: prev.totalMined + newEarnings + referralEarnings,
        cycleEarnings: prev.cycleEarnings + newEarnings + referralEarnings,
        cycleCompletion,
        totalReturn: (prev.totalMined + newEarnings + referralEarnings) / stakedAmount
      }));

      setHdcBalance(prev => prev + newEarnings + referralEarnings);

      // Check if cycle is complete
      if (cycleElapsed >= MINING_CONFIG.CYCLE_DURATION) {
        setMiningStats(prev => ({
          ...prev,
          cycleStartTime: now,
          cycleEarnings: 0,
          cycleCompletion: 0,
          checkpointsPassed: 0 // Reset checkpoints for new cycle
        }));
      }

    }, 1000);

    return () => clearInterval(interval);
  }, [isStaking, stakedAmount, miningStats.cycleStartTime, referralStats]);

  // Add checkpoint claim handler
  const claimCheckpointBonus = () => {
    setHdcBalance(prev => prev + currentCheckpointBonus);
    setShowCheckpointModal(false);
    setCurrentCheckpointBonus(0);
  };

  // Add weekly bonus distribution effect
  useEffect(() => {
    const weeklyInterval = setInterval(() => {
      const weeklyBonus = calculateRankBonus(referralStats?.activeReferrals ?? 0);
      if (weeklyBonus > 0) {
        setHdcBalance(prev => prev + weeklyBonus);
      }
    }, 7 * 24 * 60 * 60 * 1000); // Weekly interval

    return () => clearInterval(weeklyInterval);
  }, [referralStats]);

  // Add wallet validation function
  const validateWallet = (address: string): boolean => {
    // Basic TON wallet validation - should be enhanced based on specific requirements
    return /^[0-9A-Za-z-_]{48,}$/.test(address);
  };

  // Add wallet registration handler
  const handleWalletRegistration = () => {
    setWalletRegistrationError('');

    if (!validateWallet(newWalletAddress)) {
      setWalletRegistrationError('Invalid wallet address format');
      return;
    }

    // Save wallet address
    setRegisteredWallet(newWalletAddress);
    localStorage.setItem('registered_wallet', newWalletAddress);
    setShowWalletRegistrationModal(false);
    setNewWalletAddress('');
  };

  // Update withdrawal handler to use registered wallet
  const handleWithdrawal = () => {
    const amount = Number(withdrawAmount);
    
    setWithdrawalError('');

    if (!registeredWallet) {
      setWithdrawalError('Please register your wallet address first');
      setShowWithdrawModal(false);
      setShowWalletRegistrationModal(true);
      return;
    }

    if (amount > hdcBalance) {
      setWithdrawalError('Insufficient balance');
      return;
    }

    if (amount < WITHDRAWAL_CONFIG.MIN_WITHDRAWAL) {
      setWithdrawalError(`Minimum withdrawal is ${WITHDRAWAL_CONFIG.MIN_WITHDRAWAL} HDC`);
      return;
    }

    // Process withdrawal
    setHdcBalance(prev => prev - amount);
    setShowWithdrawModal(false);
    setWithdrawAmount('');
  };

  // Update mining initialization success
  useEffect(() => {
    if (miningInitialized && isStaking) {
      setShowMiningStartedModal(true);
      
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setShowMiningStartedModal(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [miningInitialized, isStaking]);

  // Check daily bonus eligibility
  useEffect(() => {
    const checkDailyBonus = () => {
      const now = Date.now();
      const timeElapsed = now - lastDailyClaim;
      
      if (timeElapsed >= DAILY_BONUS.COOLDOWN && isStaking) {
        setShowDailyBonusModal(true);
      }
    };

    // Check immediately and then every minute
    checkDailyBonus();
    const interval = setInterval(checkDailyBonus, 60 * 1000);
    
    return () => clearInterval(interval);
  }, [lastDailyClaim, isStaking]); // Add dependencies array

  // Handle daily bonus claim
  const claimDailyBonus = () => {
    setHdcBalance(prev => prev + DAILY_BONUS.AMOUNT);
    setLastDailyClaim(Date.now());
    localStorage.setItem(STORAGE_KEYS.LAST_DAILY_CLAIM, Date.now().toString());
    setShowDailyBonusModal(false);
  };

  const claimHourlyBonus = () => {
    setHdcBalance(prev => prev + BONUS_CONFIG.HOURLY.AMOUNT);
    setLastHourlyClaim(Date.now());
    localStorage.setItem(STORAGE_KEYS.LAST_HOURLY_CLAIM, Date.now().toString());
    setShowHourlyBonusModal(false);
  };

 
  // Add streak modal JSX
  {showStreakModal && (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-b from-[#1A1B1E] to-[#12131A] rounded-xl p-6 max-w-sm w-full text-center">
        <div className="w-16 h-16 mx-auto mb-4 relative">
          <div className="absolute inset-0 bg-yellow-500 rounded-full blur-xl opacity-20 animate-pulse" />
          <div className="relative bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full p-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-yellow-400 mb-2">
          {loginStreak} Day Streak!
        </h3>
        <p className="text-gray-400 mb-4">
          You've earned a {(getStreakBonus() * 100)}% mining bonus!
        </p>
        <button
          onClick={() => setShowStreakModal(false)}
          className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 
            text-white font-medium rounded-lg py-3 transition-all duration-200"
        >
          Continue Mining
        </button>
      </div>
    </div>
  )}

  <div className="bg-gradient-to-b from-[#1A1B1E] to-[#12131A] rounded-xl p-6 border border-blue-500/20 mb-4">
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-lg font-medium text-white">Dashboard Overview</h3>
    <div className="text-sm text-gray-500">Last 24h</div>
  </div>

  <div>
          <h4 className="text-sm font-medium text-gray-400 mb-2">Login Streak</h4>
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-xs text-gray-400">Current Streak</div>
              <div className="text-lg font-bold text-yellow-400">{loginStreak} Days</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">Streak Bonus</div>
              <div className="text-lg font-bold text-green-400">+{(getStreakBonus() * 100)}%</div>
            </div>
          </div>
          <div className="mt-2 h-1.5 bg-black/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-500 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (loginStreak / 30) * 100)}%`
              }}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>0d</span>
            <span>30d</span>
          </div>
        </div>
        </div>


  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0F] text-white">
        Loading...
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0F] text-white">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <p className="text-sm mt-2">Please make sure to open this app in Telegram</p>
        </div>
      </div>
    );
  }

  // Add snackbar component
  const Snackbar = () => {
    if (!showSnackbar) return null;

    return (
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up">
        <div className={`px-4 py-2 rounded-lg shadow-lg ${
          copySuccess 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {copySuccess ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-medium">{snackbarMessage}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white antialiased">
      <Header />
      {/* Bonus Timer Container */}
      <div className="container mx-auto px-2 sm:px-4 lg:px-6">
        <div className="mt-2 sm:mt-4 flex gap-3 max-w-sm mx-auto">
          {/* Daily Bonus Timer */}
          <div className="flex-1 relative group">
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
            
            {/* Main container */}
            <div className="relative bg-gradient-to-b from-[#1A1B1E] to-[#15161A] rounded-xl p-3 border border-yellow-500/20 group-hover:border-yellow-500/30 transition-colors">
              <div className="flex items-start space-x-3">
                {/* Icon container */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                
                {/* Text content */}
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="text-xs font-medium text-yellow-500">Daily Bonus</div>
                    <div className="ml-auto text-[10px] text-yellow-500/60 font-medium">
                      +{LOGIN_BONUS.DAILY.AMOUNT} HDC
                    </div>
                  </div>
                  <div className="mt-1 flex items-center space-x-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                    <div className="text-sm font-mono text-yellow-400 font-medium tracking-wide">
                      {formatTimeRemaining(lastDailyClaim + BONUS_CONFIG.DAILY.COOLDOWN)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 6-Hour Bonus Timer */}
          <div className="flex-1 relative group">
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
            
            {/* Main container */}
            <div className="relative bg-gradient-to-b from-[#1A1B1E] to-[#15161A] rounded-xl p-3 border border-blue-500/20 group-hover:border-blue-500/30 transition-colors">
              <div className="flex items-start space-x-3">
                {/* Icon container */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                
                {/* Text content */}
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="text-xs font-medium text-blue-500">6h Bonus</div>
                    <div className="ml-auto text-[10px] text-blue-500/60 font-medium">
                      +{BONUS_CONFIG.HOURLY.AMOUNT} HDC
                    </div>
                  </div>
                  <div className="mt-1 flex items-center space-x-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <div className="text-sm font-mono text-blue-400 font-medium tracking-wide">
                      {formatTimeRemaining(lastHourlyClaim + BONUS_CONFIG.HOURLY.COOLDOWN)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {currentTab === 'mine' && (
          <div className="p-3 max-w-md mx-auto mb-24">
            {/* Primary Mining Status Card */}
            <div className="relative bg-gradient-to-b from-[#1A1B1E] to-[#12131A] rounded-2xl p-4 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
              {/* Mining Power Display */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Mining Power</div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-xl font-bold text-blue-400">{stakedAmount.toFixed(2)}</span>
                      <span className="text-sm text-gray-500">TON</span>
                    </div>
                  </div>
                </div>
                
                {/* Mining Status Badge */}
                {isStaking ? (
                  <div className="flex items-center px-3 py-1.5 bg-blue-500/10 rounded-full">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse mr-2" />
                    <span className="text-xs font-medium text-blue-400">MINING ACTIVE</span>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400">
                    Min. Deposit: {MINING_CONFIG.MIN_DEPOSIT} TON
                  </div>
                )}
              </div>

              {/* Central Mining Display */}
              <div className="relative flex flex-col items-center mb-4">
                <div className="relative w-36 h-36">
                  {/* Outer Glow Effect */}
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
                  
                  {/* Mining Animation Particles */}
                  <div className="absolute inset-0">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-blue-400 rounded-full animate-float"
                        style={{
                          left: `${50 + Math.cos(i * Math.PI / 4) * 40}%`,
                          top: `${50 + Math.sin(i * Math.PI / 4) * 40}%`,
                          animationDelay: `${i * 0.2}s`,
                          opacity: isStaking ? 1 : 0,
                          transition: 'opacity 0.3s'
                        }}
                      />
                    ))}
                  </div>

                  {/* Progress Circles */}
                  <svg className="w-full h-full transform -rotate-90">
                    {/* Background Circle */}
                    <circle
                      className="text-gray-800/50"
                      strokeWidth="6"
                      stroke="currentColor"
                      fill="transparent"
                      r="63"
                      cx="72"
                      cy="72"
                    />
                    {/* Progress Circle with Gradient */}
                    <circle
                      className="transition-all duration-300"
                      strokeWidth="6"
                      strokeLinecap="round"
                      stroke="url(#mining-gradient)"
                      fill="transparent"
                      r="63"
                      cx="72"
                      cy="72"
                      strokeDasharray={396}
                      strokeDashoffset={396 - ((miningStats.cycleCompletion) * 396)}
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        dur="2s"
                        repeatCount="indefinite"
                        values={`${396 - ((miningStats.cycleCompletion) * 396)};${396 - ((miningStats.cycleCompletion) * 396)}`}
                      />
                    </circle>
                  </svg>

                  {/* Gradient Definitions */}
                  <svg width="0" height="0">
                    <defs>
                      <linearGradient id="mining-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#60A5FA" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Center Content with Glow */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="relative group">
                      <div className="relative group">
                        <div className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-1 transition-transform group-hover:scale-105">
                          {Number(hdcBalance).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 6
                          })}
                        </div>
                        <div className="flex items-center justify-center space-x-1">
                          <span className="text-sm font-medium bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                            HDC
                          </span>
                          <span className="text-xs text-gray-400">
                            ≈ ${(hdcBalance * HDC_PRICE).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </span>
                        </div>
                      </div>
                      {isStaking && (
                        <div className="absolute -right-3 -top-3">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
                          <div className="w-2 h-2 bg-green-400 rounded-full absolute inset-0" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Add required CSS */}
              <style>{`
                @keyframes float {
                  0%, 100% { transform: translateY(0) scale(1); }
                  50% { transform: translateY(-10px) scale(1.2); }
                }
                .animate-float {
                  animation: float 3s ease-in-out infinite;
                }
              `}</style>

              {/* Mining Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Daily Profit Rate */}
                <div className="bg-black/30 rounded-xl p-3 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent" />
                  <div className="relative">
                    <div className="text-xs text-gray-400 mb-1">Mining Efficiency</div>
                    <div className="text-lg font-bold text-green-400">
                      {(MINING_CONFIG.DAILY_RETURN.MIN * 100).toFixed(1)}-{(MINING_CONFIG.DAILY_RETURN.MAX * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Auto-optimization
                    </div>
                  </div>
                </div>

                {/* Current Rate */}
                <div className="bg-black/30 rounded-xl p-3 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent" />
                  <div className="relative">
                    <div className="text-xs text-gray-400 mb-1">Current Hashrate</div>
                    <div className="text-lg font-bold text-blue-400">
                      +{(calculateMiningReturns(stakedAmount, 3600)).toFixed(4)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      HDC/hour
                    </div>
                  </div>
                </div>
              </div>

              {/* Checkpoint Progress */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-gray-400">Checkpoints</div>
                  <div className="text-xs text-gray-500">
                    {miningStats.checkpointsPassed}/4 reached
                  </div>
                </div>
                <div className="flex space-x-2">
                  {CHECKPOINT_CONFIG.CHECKPOINTS.map((checkpoint, index) => (
                    <div key={index} className="flex-1">
                      <div className={`h-1 rounded-full ${
                        index < miningStats.checkpointsPassed ? 'bg-blue-500' :
                        'bg-gray-700'
                      }`} />
                      <div className="mt-1 text-center">
                        <div className="text-xs text-gray-500">
                          {(checkpoint.threshold * 100)}%
                        </div>
                        <div className="text-xs text-blue-400">
                          +{(checkpoint.bonus * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => setShowDepositModal(true)}
                className="w-full mt-4 relative group"
              >
                <div className="absolute inset-0 bg-blue-500 rounded-xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl py-3 px-4 font-semibold text-white flex items-center justify-center space-x-2 group-hover:from-blue-500 group-hover:to-blue-400 transition-all">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>{isStaking ? 'Increase Mining Power' : 'Start Mining'}</span>
                </div>
              </button>

              <button
                onClick={() => setShowWithdrawModal(true)}
                disabled={!isStaking || hdcBalance < WITHDRAWAL_CONFIG.MIN_WITHDRAWAL}
                className="w-full mt-4 relative group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-green-500 rounded-xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative bg-gradient-to-r from-green-600 to-green-500 rounded-xl py-3 px-4 font-semibold text-white flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span>Withdraw HDC</span>
                </div>
              </button>

              {/* Info Tips */}
              <div className="mt-4 px-3 py-2 bg-blue-500/5 rounded-lg border border-blue-500/10">
                <div className="text-xs text-gray-400 flex items-start space-x-2">
                  <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    Mining rewards are calculated and compounded every second. Reach checkpoints to earn bonus rewards.
                  </span>
                </div>
              </div>
            </div>

            {/* Mining History Chart */}
            <div className="mt-4 bg-gradient-to-b from-[#1A1B1E] to-[#12131A] rounded-xl p-4 border border-blue-500/20">
            <div className="relative overflow-hidden mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400">Login Streak</div>
            <div className="text-lg font-bold text-yellow-400">{loginStreak} Days</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Streak Bonus</div>
            <div className="text-lg font-bold text-green-400">+{(getStreakBonus() * 100)}%</div>
          </div>
        </div>       
      </div>
              <div className="h-20 flex items-end space-x-1">
                {[...Array(24)].map((_, i) => {
                  const height = 20 + Math.random() * 60;
                  return (
                    <div 
                      key={i}
                      className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 transition-colors rounded-t"
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>
              <div className="mt-2 h-1.5 bg-black/40 rounded-full overflow-hidden">
          <div 
            className="h-full bg-yellow-500 rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min(100, (loginStreak / 30) * 100)}%`
            }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>0d</span>
          <span>30d</span>
        </div>
            </div>
           
          </div>
        )}

        {currentTab === 'network' && (
          <div className="p-4 space-y-6 max-w-2xl mx-auto w-full mb-24">
            {/* Upline Card */}
            <div className="bg-gradient-to-b from-[#1A1B1E] to-[#12131A] rounded-2xl p-6 border border-blue-500/20">
              <h3 className="text-lg font-semibold text-white mb-4">Your Upline</h3>
              {referralStats?.upline ? (
                <div className="bg-black/30 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-400">Referred by</div>
                      <div className="text-lg font-medium text-blue-400">
                        @{referralStats.upline.username}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Level {referralStats.upline.level}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-black/30 rounded-xl p-4">
                  <div className="text-sm text-gray-400">No upline - You're at the top!</div>
                </div>
              )}
            </div>

            {/* Existing Referral Link Card */}
            <div className="bg-gradient-to-b from-[#1A1B1E] to-[#12131A] rounded-2xl p-6 border border-blue-500/20">
              <h3 className="text-lg font-semibold text-white mb-4">Your Referral Link</h3>
              
              <div className="relative">
                <div className="bg-black/30 rounded-xl p-4 pr-24 break-all font-mono text-sm text-gray-300">
                  {`https://t.me/${BOT_USERNAME}?start=ref_${user?.telegram_id || ''}`}
                </div>
                <button 
                  onClick={handleReferral}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Copy
                </button>
              </div>
              
              <div className="mt-4 px-3 py-2 bg-blue-500/5 rounded-lg border border-blue-500/10">
                <div className="text-xs text-gray-400 flex items-start space-x-2">
                  <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    Earn up to 8% of your referrals' mining rewards. The more active referrals you have, the higher your weekly bonus!
                  </span>
                </div>
              </div>
            </div>

            {/* Existing Referral Stats Card */}
            <div className="bg-gradient-to-b from-[#1A1B1E] to-[#12131A] rounded-2xl p-6 border border-blue-500/20">
             
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/30 rounded-xl p-4">
                  <div className="text-sm text-gray-400">Direct Referrals</div>
                  <div className="text-2xl font-bold text-blue-400">{referralStats?.directReferrals ?? 0}</div>
                </div>
                <div className="bg-black/30 rounded-xl p-4">
                  <div className="text-sm text-gray-400">Active Referrals</div>
                  <div className="text-2xl font-bold text-green-400">{referralStats?.activeReferrals ?? 0}</div>
                </div>
              </div>

              {/* Referral Levels */}
              <div className="space-y-4">
                {REFERRAL_CONFIG.LEVELS.map(level => (
                  <div key={level.LEVEL} className="bg-black/20 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-400">Level {level.LEVEL}</div>
                        <div className="text-xs text-gray-500">{(level.RATE * 100)}% Mining Rewards</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-blue-400">
                          {referralStats?.referralTree?.[`level${level.LEVEL}` as ReferralLevel]?.length ?? 0} Users
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ranking System */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-white mb-4">Ranking Bonus</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {REFERRAL_CONFIG.RANKS.map((rank) => (
                    <div 
                      key={rank.REQUIRED_REFS} 
                      className={`relative group overflow-hidden rounded-xl border ${
                        (referralStats?.activeReferrals ?? 0) >= rank.REQUIRED_REFS 
                          ? 'bg-green-500/10 border-green-500/20' 
                          : 'bg-black/20 border-gray-500/20'
                      }`}
                    >
                      {/* Background glow effect */}
                      {(referralStats?.activeReferrals ?? 0) >= rank.REQUIRED_REFS && (
                        <div className="absolute inset-0 bg-green-500/20 blur-xl group-hover:bg-green-500/30 transition-all" />
                      )}
                      
                      {/* Content */}
                      <div className="relative p-3 text-center">
                        <div className="text-lg font-bold mb-0.5">
                          {rank.REQUIRED_REFS}
                        </div>
                        <div className="text-xs text-gray-400 mb-1">Referrals</div>
                        <div className={`text-sm font-medium ${
                          (referralStats?.activeReferrals ?? 0) >= rank.REQUIRED_REFS 
                            ? 'text-green-400' 
                            : 'text-gray-500'
                        }`}>
                          ${rank.WEEKLY_BONUS}/week
                        </div>
                        <div className="absolute top-2 right-2">
                          {(referralStats?.activeReferrals ?? 0) >= rank.REQUIRED_REFS ? (
                            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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

      {/* Adjust bottom navigation for small screens */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* Blur backdrop */}
        <div className="absolute inset-0 bg-[#0A0B0F]/80 backdrop-blur-xl border-t border-white/5" />
        
        {/* Navigation content */}
        <div className="relative max-w-lg mx-auto px-4">
          <div className="grid grid-cols-5 gap-1">
            {[
              {
                id: 'mine' as const,
                text: 'Mine',
                Icon: ({ size, className }: { size: number, className: string }) => (
                  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
              { id: 'network' as const, text: 'Network', Icon: BiNetworkChart },
              { id: 'gmp' as const, text: 'GMP', Icon: FaCoins },
              { id: 'tasks' as const, text: 'Tasks', Icon: RiMessage3Line },
              { id: 'token' as const, text: 'Token', Icon: FaUsers }
            ].map(({ id, text, Icon }) => (
              <button 
                key={id}
                onClick={() => setCurrentTab(id)}
                className={`relative group py-4 ${
                  currentTab === id ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {/* Active tab indicator */}
                {currentTab === id && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-400 rounded-full" />
                )}
                
                {/* Icon and text wrapper */}
                <div className="flex flex-col items-center">
                  <Icon size={20} className={`mb-1 transition-transform duration-200 ${
                    currentTab === id ? 'scale-110' : 'group-hover:scale-105'
                  }`} />
                  <span className="text-xs font-medium tracking-wide">
                    {text}
                  </span>
                </div>
                
                {/* Hover glow effect */}
                <div className={`absolute inset-x-2 -bottom-px h-px rounded-full transition-opacity duration-200 ${
                  currentTab === id ? 'bg-blue-400/50 opacity-100' : 'bg-white/5 opacity-0 group-hover:opacity-100'
                }`} />
              </button>
            ))}
          </div>
        </div>
        
        {/* Safe area padding for mobile */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>

      {/* Upgrade Shop Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-b from-[#1A1B1E] to-[#12131A] rounded-xl w-full max-w-sm p-5 border border-blue-500/20">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Upgrade Mining Power</h3>
              <button 
                onClick={() => setShowDepositModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Current Power (if mining) */}
            {isStaking && (
              <div className="flex items-center space-x-2 mb-4 text-sm bg-black/20 rounded-lg p-2">
                <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-gray-400">Current Power:</span>
                <span className="text-blue-400 font-medium">{stakedAmount.toFixed(2)} TON</span>
              </div>
            )}

            {/* Power Packages */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {UPGRADE_OPTIONS.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setDepositAmount(option.amount.toString())}
                  className={`relative p-3 rounded-lg border transition-all duration-200 
                    ${depositAmount === option.amount.toString() 
                      ? 'bg-blue-500/10 border-blue-500/50' 
                      : 'bg-black/20 border-gray-500/20 hover:border-gray-500/40'}`}
                >
                  <div className="text-sm font-medium text-white mb-0.5">
                    {option.label}
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-blue-400 font-bold">{option.amount} TON</span>
                    <span className="text-xs text-green-400">{option.boost}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="relative mb-4">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-black/20 rounded-lg p-3 text-white pr-12 border border-gray-500/20 focus:border-blue-500/40 outline-none"
                placeholder="Custom amount"
                min={MINING_CONFIG.MIN_DEPOSIT}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                TON
              </span>
            </div>

            {/* Quick Stats */}
            <div className="bg-black/20 rounded-lg p-3 mb-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xs text-gray-400">Daily Earnings</div>
                  <div className="text-sm font-medium text-green-400">
                    +{(calculateMiningReturns(Number(depositAmount), 86400)).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Mining Rate</div>
                  <div className="text-sm font-medium text-blue-400">
                    {(calculateMiningReturns(Number(depositAmount), 3600)).toFixed(4)}/hr
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={startMining}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 
                text-white font-medium rounded-lg py-3 px-4 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>{isStaking ? 'Upgrade Power' : 'Start Mining'}</span>
            </button>
          </div>
        </div>
      )}

      {showBonusModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1A1B1E] rounded-xl w-full max-w-sm p-6 space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg 
                  className="w-10 h-10 text-white animate-bounce" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">
                {bonusType === 'daily' ? 'Daily Login Bonus!' : 'Hourly Login Bonus!'}
              </h3>
              <p className="text-gray-400 mb-4">
                You've earned {bonusAmount.toFixed(2)} HDC
              </p>
              <button
                onClick={claimBonus}
                className="w-full bg-blue-500 hover:bg-blue-600 py-3 rounded-lg font-medium transition-colors"
              >
                Claim Bonus
              </button>
            </div>
          </div>
        </div>
      )}

      {showCycleCompleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1A1B1E] rounded-xl p-6 max-w-sm w-full text-center">
            <div className="text-2xl font-bold text-blue-400 mb-2">Cycle Complete!</div>
            <div className="text-gray-400 mb-4">You've reached 200% return</div>
            <button
              onClick={() => {
                setShowCycleCompleteModal(false);
                resetMining();
              }}
              className="w-full bg-blue-500 hover:bg-blue-600 py-3 rounded-lg font-medium"
            >
              Start New Cycle
            </button>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1A1B1E] rounded-xl p-6 max-w-sm w-full">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Withdraw HDC</h3>
              <p className="text-sm text-gray-400">Available: {hdcBalance.toFixed(4)} HDC</p>
            </div>

            {registeredWallet ? (
              <div className="space-y-4">
                {/* Registered Wallet Display */}
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="text-xs text-gray-400 mb-1">Registered Wallet</div>
                  <div className="text-sm text-white font-mono break-all">{registeredWallet}</div>
                </div>

                {/* Amount Input */}
                <div className="relative">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-black/30 rounded-lg p-4 text-white pr-16 border border-blue-500/20 focus:border-blue-500/40 outline-none"
                    placeholder="Amount to withdraw"
                    min={WITHDRAWAL_CONFIG.MIN_WITHDRAWAL}
                    max={hdcBalance}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">HDC</span>
                </div>

                {/* Distribution Preview */}
                <div className="bg-black/20 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">You Receive (70%)</span>
                    <span className="text-green-400">{(Number(withdrawAmount || 0) * WITHDRAWAL_CONFIG.DIRECT_SHARE).toFixed(4)} TON</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Weekly Pool (20%)</span>
                    <span className="text-blue-400">{(Number(withdrawAmount || 0) * WITHDRAWAL_CONFIG.WEEKLY_SHARE).toFixed(4)} TON</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">HDC Pool (10%)</span>
                    <span className="text-purple-400">{(Number(withdrawAmount || 0) * WITHDRAWAL_CONFIG.HDC_SHARE).toFixed(4)} TON</span>
                  </div>
                </div>

                {withdrawalError && (
                  <div className="text-red-500 text-sm text-center">
                    {withdrawalError}
                  </div>
                )}

                <button
                  onClick={handleWithdrawal}
                  disabled={!Number(withdrawAmount) || Number(withdrawAmount) > hdcBalance}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-medium text-white transition-colors"
                >
                  Submit Withdrawal Request
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-400 mb-4">Please register your wallet address first</p>
                <button
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setShowWalletRegistrationModal(true);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-medium text-white transition-colors"
                >
                  Register Wallet
                </button>
              </div>
            )}

            <button 
              onClick={() => {
                setShowWithdrawModal(false);
                setWithdrawAmount('');
                setWithdrawalError('');
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Mining Started Modal */}
      {showMiningStartedModal && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-up">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Mining Started Successfully!</span>
          </div>
        </div>
      )}

      {/* Daily Bonus Modal */}
      {showDailyBonusModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1A1B1E] rounded-xl p-6 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Daily Bonus Available!</h3>
            <p className="text-gray-400 mb-4">Claim your {DAILY_BONUS.AMOUNT} HDC daily bonus</p>
            <button
              onClick={claimDailyBonus}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Claim Bonus
            </button>
          </div>
        </div>
      )}

      {/* 6-Hour Bonus Modal */}
      {showHourlyBonusModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1A1B1E] rounded-xl p-6 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">6-Hour Bonus Available!</h3>
            <p className="text-gray-400 mb-4">Claim your {BONUS_CONFIG.HOURLY.AMOUNT} HDC bonus</p>
            <button
              onClick={claimHourlyBonus}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Claim Bonus
            </button>
          </div>
        </div>
      )}

      {/* Wallet Registration Modal */}
      {showWalletRegistrationModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1A1B1E] rounded-xl p-6 max-w-sm w-full">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Register Wallet Address</h3>
              <p className="text-sm text-gray-400">Register your TON wallet address for withdrawals</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={newWalletAddress}
                  onChange={(e) => setNewWalletAddress(e.target.value)}
                  className={`w-full bg-black/30 rounded-lg p-4 text-white border ${
                    newWalletAddress ? (validateWallet(newWalletAddress) ? 'border-green-500/40' : 'border-red-500/40') : 'border-blue-500/20'
                  } focus:border-blue-500/40 outline-none`}
                  placeholder="Enter your TON wallet address"
                />
                {newWalletAddress && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {validateWallet(newWalletAddress) ? (
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                )}
              </div>

              {walletRegistrationError && (
                <div className="text-red-500 text-sm text-center">
                  {walletRegistrationError}
                </div>
              )}

              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-xs text-gray-400 flex items-start space-x-2">
                  <svg className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>
                    Make sure to enter the correct wallet address. This address will be used for all future withdrawals.
                  </span>
                </div>
              </div>

              <button
                onClick={handleWalletRegistration}
                disabled={!validateWallet(newWalletAddress)}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-medium text-white transition-colors"
              >
                Register Wallet
              </button>
            </div>

            <button 
              onClick={() => {
                setShowWalletRegistrationModal(false);
                setNewWalletAddress('');
                setWalletRegistrationError('');
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Checkpoint Modal */}
      {showCheckpointModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1A1B1E] rounded-xl p-6 max-w-sm w-full relative overflow-hidden">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 blur-xl" />
            
            <div className="relative">
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <div className="absolute inset-0 bg-yellow-500 rounded-full blur-xl opacity-20 animate-pulse" />
                  <div className="relative bg-gradient-to-b from-yellow-400 to-amber-500 rounded-full p-4">
                    <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">
                  Checkpoint {miningStats.checkpointsPassed} Reached!
                </h3>
                <p className="text-gray-400 mb-4">
                  You've completed {CHECKPOINT_CONFIG.CHECKPOINTS[miningStats.checkpointsPassed - 1].threshold * 100}% of your mining cycle
                </p>
              </div>

              <div className="bg-black/30 rounded-xl p-4 mb-6">
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">Bonus Reward</div>
                  <div className="text-3xl font-bold text-yellow-400">
                    +{currentCheckpointBonus.toFixed(4)} HDC
                  </div>
                </div>
              </div>

              <button
                onClick={claimCheckpointBonus}
                className="w-full relative group"
              >
                <div className="absolute inset-0 bg-yellow-500 rounded-xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl py-3 px-4 font-semibold text-white flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Claim Bonus</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Accumulated Bonus Modal */}
      {showAccumulatedBonusModal && accumulatedBonus > 0 && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
          <div className="bonus-modal animate-fade-in bg-[#1A1B1E] rounded-xl p-6 max-w-sm w-full relative overflow-hidden">
            <div className="relative">
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl opacity-20 animate-pulse" />
                  <div className="relative bg-gradient-to-b from-purple-400 to-blue-500 rounded-full p-4">
                    <svg className="w-full h-full text-white animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  Offline Rewards Ready!
                </h3>
                <p className="text-gray-400 mb-4">
                  Your miners have been working while you were away
                </p>
              </div>

              <div className="bg-black/30 rounded-xl p-4 mb-6 border border-purple-500/10">
                <div className="text-center space-y-3">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Accumulated Rewards</div>
                    <div className="text-3xl font-bold text-purple-400 font-mono">
                      +{accumulatedBonus.toFixed(6)} HDC
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-purple-500/10">
                    <div className="text-xs text-gray-500">
                      Mining Duration
                    </div>
                    <div className="text-sm text-purple-300 font-medium">
                      {formatOfflineDuration(Date.now() - lastLogoutTime)}
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-purple-500/10">
                    <div className="text-xs text-gray-500">
                      Mining Rate
                    </div>
                    <div className="text-sm text-purple-300 font-medium">
                      {(OFFLINE_BONUS_CONFIG.RATE * 100)}% of normal rate
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={claimAccumulatedBonus}
                className="w-full relative group transition-transform duration-200 active:scale-95"
              >
                <div className="absolute inset-0 bg-purple-500 rounded-xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl py-3 px-4 font-semibold text-white flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Claim Rewards</span>
                </div>
              </button>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Offline mining continues for up to 7 days
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showStreakModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-b from-[#1A1B1E] to-[#12131A] rounded-xl p-6 max-w-sm w-full text-center">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-yellow-500 rounded-full blur-xl opacity-20 animate-pulse" />
              <div className="relative bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full p-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-yellow-400 mb-2">
              {loginStreak} Day Streak!
            </h3>
            <p className="text-gray-400 mb-4">
              You've earned a {(getStreakBonus() * 100)}% mining bonus!
            </p>
            <button
              onClick={() => setShowStreakModal(false)}
              className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 
                text-white font-medium rounded-lg py-3 transition-all duration-200"
            >
              Continue Mining
            </button>
          </div>
        </div>
      )}

      {/* Add Snackbar at the bottom of your JSX */}
      <Snackbar />
    </div>
  );
};
