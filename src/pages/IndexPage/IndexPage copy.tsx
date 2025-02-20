// import { Buffer } from 'buffer';
// window.Buffer = Buffer;

// import { FC, useState, useEffect } from 'react';
// import { FaCoins, FaUsers } from 'react-icons/fa';
// import { BiNetworkChart } from 'react-icons/bi';
// import { RiMessage3Line } from 'react-icons/ri';
// import { Header } from '@/components/Header/Header';
// import { useAuth } from '@/hooks/useAuth';

// // Add new interfaces for referral and mining
// interface MiningStats {
//   lastMiningTime: number;
//   totalMined: number;
//   cycleEarnings: number;
//   referralEarnings: number;
//   weeklyRankingBonus: number;
//   consecutiveDays: number;
//   cycleStartTime: number;
//   cycleCompletion: number;
//   lastCheckpointTime: number;
//   checkpointsPassed: number;
// }

// // Realistic Mining Configuration
// const MINING_CONFIG = {
//   BASE_RATE: 0.0001,     // 0.01% daily base rate
//   INTERVALS: {
//     MINING: 1000,        // Updates every second
//     REWARD: 1000,        // Reward calculation every second
//     OFFLINE: 24 * 60 * 60 * 1000
//   },
//   USER_SHARE: 0.7,       // 70% user share
//   BONUSES: {
//     EQUIPMENT_BOOST: 0.05,  // 5% per equipment level
//     CONSECUTIVE_DAYS: 0.01, // 1% per consecutive day
//     STAKE_TIERS: [        
//       { amount: 1, bonus: 0.05 },   // 5% bonus
//       { amount: 5, bonus: 0.1 },  
//       { amount: 10, bonus: 0.2 },  
//       { amount: 50, bonus: 0.5 },  
//     ]
//   },
//   LIMITS: {
//     MIN_STAKE: 1,         // 1 TON minimum stake
//     OFFLINE_CAP: 0.8,     // 20% offline penalty
//     MAX_MULTIPLIER: 5     // 5x multiplier
//   }
// };

// const REFERRAL_CONFIG = {
//   REWARDS: {
//     LEVEL1: 0.08, // 8% of mining rewards
//     LEVEL2: 0.05, // 5% of mining rewards
//     LEVEL3: 0.03  // 3% of mining rewards
//   }
// };

// interface MiningState {
//   power: number;           // Base mining power
//   efficiency: number;      // Current efficiency (0-1)
//   lastUpdate: number;      // Last calculation timestamp
//   consecutiveDays: number; // Streak of daily logins
//   equipment: Equipment[];  // Mining equipment owned
//   boosters: Booster[];    // Active time-limited boosters
// }

// interface Equipment {
//   id: number;
//   level: number;
//   powerBoost: number;
//   efficiency: number;
// }

// interface Booster {
//   type: 'power' | 'efficiency' | 'speed';
//   multiplier: number;
//   expiresAt: number;
// }

// // Basic Mining Configuration for New Miners
// const BASIC_MINING_CONFIG = {
//   BASE_RATE: 0.1,        // 10% daily base rate
//   INTERVALS: {
//     MINING: 1000,        // Updates every second
//     REWARD: 1000,        // Reward calculation every second
//     OFFLINE: 24 * 60 * 60 * 1000
//   },
//   USER_SHARE: 0.8,       // 80% user share
//   BONUSES: {
//     EQUIPMENT_BOOST: 0.1,  // 10% per equipment level
//     CONSECUTIVE_DAYS: 0.05, // 5% per consecutive day
//     STAKE_TIERS: [        
//       { amount: 1, bonus: 0.1 },   // 10% bonus
//       { amount: 5, bonus: 0.2 },  
//       { amount: 10, bonus: 0.5 },  
//       { amount: 50, bonus: 1.0 },  
//     ]
//   },
//   LIMITS: {
//     MIN_STAKE: 0.1,         
//     OFFLINE_CAP: 0.5,        // 50% offline penalty
//     MAX_MULTIPLIER: 10       // 10x multiplier
//   }
// };

// // Update cycle configuration
// const CYCLE_CONFIG = {
//   DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
// };

// // Update checkpoint configuration
// const CHECKPOINT_CONFIG = {
//   INTERVAL: 6 * 60 * 60 * 1000, // 6 hours in milliseconds
//   MIN_DEPOSIT: 0.1, // Minimum deposit to improve mining
//   PERFORMANCE_BOOST: 0.1, // 10% boost per deposit at checkpoint
//   BONUS_MULTIPLIER: 1.05 // 5% bonus per checkpoint passed
// };


// // Add helper function to calculate cycle progress
// const calculateCycleProgress = (startTime: number): number => {
//   const now = Date.now();
//   const elapsed = now - startTime;
//   const progress = (elapsed / CYCLE_CONFIG.DURATION) * 100;
//   return Math.min(100, progress);
// };

// // Add new localStorage functions for mining state
// const saveMiningState = (state: {
//   isStaking: boolean;
//   stakedAmount: number;
//   miningStats: MiningStats;
// }) => {
//   localStorage.setItem('miningState', JSON.stringify(state));
// };

// const loadMiningState = () => {
//   const savedState = localStorage.getItem('miningState');
//   return savedState ? JSON.parse(savedState) : null;
// };

// // Add login bonus configuration
// const LOGIN_BONUS = {
//   DAILY: {
//     AMOUNT: 1.0, // 1.0 HDC daily bonus
//     INTERVAL: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
//   },
//   HOURLY: {
//     AMOUNT: 0.1, // 0.1 HDC hourly bonus
//     INTERVAL: 60 * 60 * 1000, // 1 hour in milliseconds
//   }
// };

// // Add new mining animation styles
// const MINING_ANIMATIONS = {
//   PULSE: 'animate-[pulse_2s_ease-in-out_infinite]',
//   GLOW: 'animate-[glow_1.5s_ease-in-out_infinite]',
//   SPIN: 'animate-[spin_3s_linear_infinite]'
// };

// // Add mining particle effect component
// const MiningParticles = () => (
//   <div className="absolute inset-0 pointer-events-none">
//     <div className="relative w-full h-full">
//       {[...Array(20)].map((_, i) => (
//         <div
//           key={i}
//           className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-0"
//           style={{
//             left: `${Math.random() * 100}%`,
//             top: `${Math.random() * 100}%`,
//             animation: `particle-float ${2 + Math.random() * 2}s linear infinite ${Math.random() * 2}s`
//           }}
//         />
//       ))}
//     </div>
//   </div>
// );

// // Add these helper functions at the top level
// const loadBonusTimes = () => {
//   const savedDailyBonus = localStorage.getItem('lastDailyBonus');
//   const savedHourlyBonus = localStorage.getItem('lastHourlyBonus');
//   return {
//     daily: savedDailyBonus ? Number(savedDailyBonus) : 0,
//     hourly: savedHourlyBonus ? Number(savedHourlyBonus) : 0
//   };
// };


// // Add this helper function to calculate total stake bonus
// const calculateStakeBonus = (stakeAmount: number) => {
//   let bonus = 0;
//   for (const tier of MINING_CONFIG.BONUSES.STAKE_TIERS) {
//     if (stakeAmount >= tier.amount) {
//       bonus = tier.bonus;
//     } else {
//       break;
//     }
//   }
//   return 1 + bonus;
// };

// // Add this helper function before calculateRewards
// const calculateEfficiency = (state: MiningState): number => {
//   const baseEfficiency = state.equipment.reduce((acc, eq) => acc * eq.efficiency, 1);
//   return Math.min(1, baseEfficiency);
// };

// export const IndexPage: FC = () => {
//   const { user, telegramUser, isLoading, error } = useAuth();
//   const [currentTab, setCurrentTab] = useState<'mine' | 'network' | 'gmp' | 'tasks' | 'token'>('mine');
  
//   // Move ALL state declarations to the top level, before any conditional logic
//   const [stakedAmount, setStakedAmount] = useState<number>(0);
//   const [hdcBalance, setHdcBalance] = useState<number>(0);
//   const [isStaking, setIsStaking] = useState<boolean>(false);
//   const [showDepositModal, setShowDepositModal] = useState(false);
//   const [depositAmount, setDepositAmount] = useState<string>('');
//   const [hashrate, setHashrate] = useState<number>(0);
//   const [hashrateUnit, setHashrateUnit] = useState<string>('H/s');
//   const [animateBalance, setAnimateBalance] = useState(false);
//   const [energy, setEnergy] = useState({
//     current: 100,
//     max: 100,
//     lastUpdate: Date.now()
//   });
//   const [miningStats, setMiningStats] = useState<MiningStats>({
//     lastMiningTime: 0,
//     totalMined: 0,
//     cycleEarnings: 0,
//     referralEarnings: 0,
//     weeklyRankingBonus: 0,
//     consecutiveDays: 0,
//     cycleStartTime: 0,
//     cycleCompletion: 0,
//     lastCheckpointTime: 0,
//     checkpointsPassed: 0
//   });
//   const [lastDailyBonus, setLastDailyBonus] = useState<number>(0);
//   const [lastHourlyBonus, setLastHourlyBonus] = useState<number>(0);
//   const [showBonusModal, setShowBonusModal] = useState(false);
//   const [bonusAmount, setBonusAmount] = useState(0);
//   const [bonusType, setBonusType] = useState<'daily' | 'hourly' | null>(null);
//   const [miningData, setMiningData] = useState({
//     totalMined: 0,
//     cycleEarnings: 0,
//     cycleStartTime: '',
//     checkpointsPassed: 0,
//     stakedAmount: 0,
//     miningStats: {
//       hashrate: 0,
//       efficiency: 1,
//       power: 0,
//       lastCheckpointTime: Date.now(),
//       checkpointsPassed: 0
//     }
//   });

//   // Constants

//   const DAILY_RATE = 0.03; // 3% daily
//   const HOURLY_RATE = DAILY_RATE / 24;
  
//   // Move ALL useEffect declarations here, after state declarations and before any conditional logic
//   useEffect(() => {
//     const savedBalance = loadBalance();
//     setHdcBalance(savedBalance);

//     const savedMiningState = loadMiningState();
//     if (savedMiningState) {
//       setIsStaking(savedMiningState.isStaking);
//       setStakedAmount(savedMiningState.stakedAmount);
//       setMiningStats(savedMiningState.miningStats);
//       if (savedMiningState.stakedAmount > 0) {
//         calculateHashrate(savedMiningState.stakedAmount);
//       }
//     }

//     // Load bonus times
//     const bonusTimes = loadBonusTimes();
//     setLastDailyBonus(bonusTimes.daily);
//     setLastHourlyBonus(bonusTimes.hourly);
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setLastDailyBonus(prev => prev);
//       setLastHourlyBonus(prev => prev);
//     }, 60000);

//     return () => clearInterval(interval);
//   }, []);

//   // Add new state for local mining data
//   const [localMiningData, setLocalMiningData] = useState({
//     lastMiningTime: Date.now(),
//     pendingRewards: 0
//   });

//   // Update mining effect to be more reliable
//   useEffect(() => {
//     if (!isStaking || stakedAmount <= 0 || energy.current <= 0 || !user?.telegram_id) return;

//     const miningInterval = setInterval(() => {
//       try {
//         setLocalMiningData(prevLocal => {
//           const now = Date.now();
//           const timeDiff = now - prevLocal.lastMiningTime;
          
//           const hourlyRate = MINING_CONFIG.BASE_RATE / 24;
//           const baseReward = (stakedAmount * hourlyRate * timeDiff) / (60 * 60 * 1000);
//           const stakeBonus = calculateStakeBonus(stakedAmount);
//           const rewards = baseReward * stakeBonus;

//           const newLocalData = {
//             lastMiningTime: now,
//             pendingRewards: prevLocal.pendingRewards + rewards
//           };
          
//           localStorage.setItem(`mining_${user.telegram_id}`, JSON.stringify(newLocalData));

//           setMiningStats(prev => ({
//             ...prev,
//             totalMined: prev.totalMined + rewards,
//             cycleEarnings: prev.cycleEarnings + rewards,
//             lastMiningTime: now,
//             cycleCompletion: calculateCycleProgress(prev.cycleStartTime)
//           }));

//           setHdcBalance(prev => Number((prev + rewards).toFixed(6)));
          
//           return newLocalData;
//         });
//       } catch (error) {
//         console.error('Mining update error:', error);
//       }
//     }, 1000);

//     return () => clearInterval(miningInterval);
//   }, [isStaking, stakedAmount, energy.current, user?.telegram_id]);

//   // Update sync effect to be more reliable
//   useEffect(() => {
//     if (!user?.telegram_id || !isStaking) return;

//     const syncInterval = setInterval(() => {
//       const miningState = {
//         totalMined: miningStats.totalMined,
//         cycleEarnings: miningStats.cycleEarnings,
//         stakedAmount,
//         lastMiningTime: Date.now(),
//         checkpointsPassed: miningStats.checkpointsPassed
//       };
      
//       localStorage.setItem(`miningState_${user.telegram_id}`, JSON.stringify(miningState));
//     }, 30000);

//     return () => clearInterval(syncInterval);
//   }, [user?.telegram_id, isStaking, miningStats, stakedAmount]);

//   // Energy calculation effect
//   useEffect(() => {
//     if (!isStaking) return;

//     const interval = setInterval(() => {
//       setEnergy(prev => {
//         const now = Date.now();
//         const timeDiff = now - prev.lastUpdate;
//         const energyGain = timeDiff / (60 * 1000);
        
//         return {
//           ...prev,
//           current: Math.min(prev.max, prev.current + energyGain),
//           lastUpdate: now
//         };
//       });
//     }, 60 * 1000);

//     return () => clearInterval(interval);
//   }, [isStaking]);

//   // Update mining rewards calculation
//   const calculateRewards = (state: MiningState, offlineTime: number = 0) => {
//     const efficiency = calculateEfficiency(state);
//     let reward = state.power * MINING_CONFIG.BASE_RATE * efficiency * 10; // Added 10x multiplier

//     // Equipment bonuses
//     const equipmentMultiplier = state.equipment.reduce((acc, eq) => 
//       acc + (eq.powerBoost * eq.level * MINING_CONFIG.BONUSES.EQUIPMENT_BOOST), 1);
//     reward *= equipmentMultiplier;

//     // Active boosters
//     const now = Date.now();
//     const activeBoosterMultiplier = state.boosters
//       .filter(b => b.expiresAt > now)
//       .reduce((acc, b) => acc * b.multiplier, 1);
//     reward *= activeBoosterMultiplier;

//     // Offline penalty if applicable
//     if (offlineTime > 0) {
//       const offlineMultiplier = Math.max(
//         MINING_CONFIG.LIMITS.OFFLINE_CAP,
//         1 - (offlineTime / MINING_CONFIG.INTERVALS.OFFLINE)
//       );
//       reward *= offlineMultiplier;
//     }

//     // Cap at maximum multiplier
//     return Math.min(
//       reward,
//       state.power * MINING_CONFIG.BASE_RATE * MINING_CONFIG.LIMITS.MAX_MULTIPLIER
//     );
//   };

//   // Update offline progress calculation
//   const calculateOfflineProgress = (state: MiningState, lastOnline: number) => {
//     const now = Date.now();
//     const offlineTime = now - lastOnline;
    
//     // Cap offline time to 7 days max
//     const maxOfflineTime = 7 * 24 * 60 * 60 * 1000;
//     const effectiveOfflineTime = Math.min(offlineTime, maxOfflineTime);

//     // Calculate base rewards
//     let rewards = calculateRewards(state, effectiveOfflineTime);

//     // Apply decay after 24 hours
//     if (effectiveOfflineTime > 24 * 60 * 60 * 1000) {
//       const decayFactor = Math.pow(0.95, Math.floor((effectiveOfflineTime - 24 * 60 * 60 * 1000) / (24 * 60 * 60 * 1000)));
//       rewards *= decayFactor;
//     }

//     return {
//       rewards: Number(rewards.toFixed(6)),
//       duration: effectiveOfflineTime
//     };
//   };

//   // Update distributeEarnings function
//   const distributeEarnings = async (amount: number) => {
//     if (!user?.telegram_id || !miningData) return;

//     const userShare = amount * BASIC_MINING_CONFIG.USER_SHARE;
//     const newBalance = hdcBalance + userShare;
    
//     // Verify and update server first
//     const updatedData = {
//       totalMined: newBalance,
//       cycleEarnings: miningData.cycleEarnings + userShare,
//       lastMiningTime: new Date().toISOString()
//     };

//     localStorage.setItem(`miningState_${user.telegram_id}`, JSON.stringify(updatedData));
//     setMiningData({ ...miningData, ...updatedData });
    
//     setAnimateBalance(true);
//     setTimeout(() => setAnimateBalance(false), 200);
//   };

//   // Function to calculate hashrate based on stake
//   const calculateHashrate = (stake: number) => {
//     // Base hashrate: 1 TON = 100 H/s
//     const baseHashrate = stake * 100;
    
//     // Convert to appropriate unit with proper precision
//     if (baseHashrate >= 1000000) {
//       setHashrateUnit('MH/s');
//       setHashrate(Number((baseHashrate / 1000000).toFixed(3)));
//     } else if (baseHashrate >= 1000) {
//       setHashrateUnit('KH/s');
//       setHashrate(Number((baseHashrate / 1000).toFixed(2)));
//     } else {
//       setHashrateUnit('H/s');
//       setHashrate(Number(baseHashrate.toFixed(1)));
//     }
//   };

//   // Update startMining function
//   const startMining = () => {
//     if (!user?.telegram_id) return;

//     const amount = Number(depositAmount);
//     if (amount < CHECKPOINT_CONFIG.MIN_DEPOSIT) {
//       alert(`Minimum deposit required is ${CHECKPOINT_CONFIG.MIN_DEPOSIT} TON`);
//       return;
//     }

//     const now = Date.now();
//     const isCheckpointDeposit = miningStats.cycleStartTime > 0 && isStaking;

//     const updatedStats = isCheckpointDeposit ? {
//       ...miningStats,
//       stakedAmount: Number((stakedAmount + amount).toFixed(6)),
//       checkpointsPassed: miningStats.checkpointsPassed + 1,
//       lastCheckpointTime: now
//     } : {
//       ...miningStats,
//       stakedAmount: amount,
//       cycleStartTime: now,
//       cycleEarnings: 0,
//       checkpointsPassed: 0,
//       lastCheckpointTime: now
//     };

//     setMiningStats(updatedStats);
//     setStakedAmount(updatedStats.stakedAmount);
//     setIsStaking(true);
//     setShowDepositModal(false);
//     setDepositAmount('');
//     calculateHashrate(updatedStats.stakedAmount);

//     // Save to localStorage
//     localStorage.setItem(`miningState_${user.telegram_id}`, JSON.stringify(updatedStats));
//   };

//   // Add new useEffect for offline mining
//   useEffect(() => {
//     if (!isStaking) return;

//     const handleVisibilityChange = () => {
//       if (document.visibilityState === 'visible') {
//         const offlineProgress = calculateOfflineProgress(
//           {
//             power: stakedAmount,
//             efficiency: 1,
//             lastUpdate: miningStats.lastMiningTime,
//             consecutiveDays: miningStats.consecutiveDays,
//             equipment: [],
//             boosters: []
//           },
//           miningStats.lastMiningTime
//         );
        
//         if (offlineProgress.rewards > 0) {
//           setMiningStats(prev => ({
//             ...prev,
//             totalMined: Number((prev.totalMined + offlineProgress.rewards).toFixed(6)),
//             cycleEarnings: Number((prev.cycleEarnings + offlineProgress.rewards).toFixed(6)),
//             lastMiningTime: Date.now()
//           }));
//           distributeEarnings(offlineProgress.rewards);
//         }
//       }
//     };

//     document.addEventListener('visibilitychange', handleVisibilityChange);
//     return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
//   }, [isStaking, stakedAmount, miningStats]);

//   // Add anti-cheat measures
//   useEffect(() => {
//     if (!isStaking) return;

//     const lastMiningTime = localStorage.getItem('lastMiningTime');
//     if (lastMiningTime && Date.now() - Number(lastMiningTime) < 0) {
//       // Time manipulation detected
//       setIsStaking(false);
//       alert('Invalid system time detected. Mining stopped.');
//       return;
//     }

//     const interval = setInterval(() => {
//       localStorage.setItem('lastMiningTime', Date.now().toString());
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [isStaking]);

//   // Extreme Mining Speed Calculation:
//   // For 1 TON staked:
//   // - Base Rate: 5.0 (500% daily)
//   // - Interval: 10ms
//   // - User Share: 99% (0.99)
//   // - 10x Multiplier

//   // Per Day:
//   // ≈ 0.0007 HDC/day

//   // Add cleanup when cycle completes
//   const handleCycleComplete = async () => {
//     if (!user?.telegram_id) return;

//     try {
//       // Reset mining cycle in Supabase
//       const updatedData = {
//         totalMined: 0,
//         cycleEarnings: 0,
//         cycleStartTime: '',
//         checkpointsPassed: 0,
//         stakedAmount: 0,
//         miningStats: {
//           hashrate: 0,
//           efficiency: 1,
//           power: 0,
//           lastCheckpointTime: Date.now(),
//           checkpointsPassed: 0
//         }
//       };

//       localStorage.setItem(`miningState_${user.telegram_id}`, JSON.stringify(updatedData));
//       setMiningData(updatedData);
//       setIsStaking(false);
//       setStakedAmount(0);
//       alert('Mining cycle completed! The 30-day period has ended.');
//     } catch (error) {
//       console.error('Error completing cycle:', error);
//     }
//   };

//   // Add localStorage for persistent balance
//   const loadBalance = () => {
//     const savedBalance = localStorage.getItem('hdcBalance');
//     return savedBalance ? Number(savedBalance) : 0;
//   };

//   const saveBalance = (balance: number) => {
//     localStorage.setItem('hdcBalance', balance.toString());
//   };

//   // Update the bonus claim function
//   const claimBonus = () => {
//     const now = Date.now();
    
//     if (bonusType === 'daily') {
//       setLastDailyBonus(now);
//       localStorage.setItem('lastDailyBonus', now.toString());
//     } else if (bonusType === 'hourly') {
//       setLastHourlyBonus(now);
//       localStorage.setItem('lastHourlyBonus', now.toString());
//     }

//     setHdcBalance(prev => {
//       const newBalance = prev + bonusAmount;
//       saveBalance(newBalance);
//       return newBalance;
//     });
    
//     setShowBonusModal(false);
//     setAnimateBalance(true);
//     setTimeout(() => setAnimateBalance(false), 200);
//   };

//   // Update the bonus check useEffect
//   useEffect(() => {
//     const checkLoginBonuses = () => {
//       const now = Date.now();
      
//       // Check daily bonus
//       if (now - lastDailyBonus >= LOGIN_BONUS.DAILY.INTERVAL) {
//         setBonusAmount(LOGIN_BONUS.DAILY.AMOUNT);
//         setBonusType('daily');
//         setShowBonusModal(true);
//       }
//       // Check hourly bonus only if daily bonus modal is not showing
//       else if (now - lastHourlyBonus >= LOGIN_BONUS.HOURLY.INTERVAL && !showBonusModal) {
//         setBonusAmount(LOGIN_BONUS.HOURLY.AMOUNT);
//         setBonusType('hourly');
//         setShowBonusModal(true);
//       }
//     };

//     // Check bonuses immediately and set up interval
//     checkLoginBonuses();
    
//     const interval = setInterval(() => {
//       checkLoginBonuses();
//     }, 60000); // Check every minute

//     return () => clearInterval(interval);
//   }, [lastDailyBonus, lastHourlyBonus, showBonusModal]);

//   // Add this effect to load mining data
//   const loadMiningData = () => {
//     if (!user?.telegram_id) return;

//     const savedData = localStorage.getItem(`miningState_${user.telegram_id}`);
//     let data = savedData ? JSON.parse(savedData) : {
//       totalMined: 0,
//       cycleEarnings: 0,
//       cycleStartTime: Date.now(),
//       checkpointsPassed: 0,
//       stakedAmount: 0,
//       miningStats: {
//         hashrate: 0,
//         efficiency: 1,
//         power: 0,
//         lastCheckpointTime: Date.now(),
//         checkpointsPassed: 0
//       }
//     };

//     setMiningData(data);
//   };

//   // Add mining verification
//   useEffect(() => {
//     if (!user?.telegram_id) return;

//     // Get local data for verification
//     const savedData = localStorage.getItem(`miningState_${user.telegram_id}`);
//     if (!savedData) return;
    
//     const localData = JSON.parse(savedData);
//     if (localData.totalMined !== miningData.totalMined) {
//       console.error('Mining state mismatch detected');
//       setMiningData(localData);
//       setHdcBalance(localData.totalMined);
//     }
//   }, [isStaking, user?.telegram_id, miningData]);

//   // Add reset function
//   const resetMining = async () => {
//     if (!user?.telegram_id) return;

//     try {
//       // Show confirmation dialog
//       const confirmed = window.confirm(
//         'Are you sure you want to reset mining? This will reset your current cycle progress and staked amount.'
//       );

//       if (!confirmed) return;

//       // Reset Supabase mining data
//       const updatedData = {
//         totalMined: 0,
//         cycleEarnings: 0,
//         cycleStartTime: '',
//         checkpointsPassed: 0,
//         stakedAmount: 0,
//         miningStats: {
//           hashrate: 0,
//           efficiency: 1,
//           power: 0,
//           lastCheckpointTime: Date.now(),
//           checkpointsPassed: 0
//         }
//       };

//       localStorage.setItem(`miningState_${user.telegram_id}`, JSON.stringify(updatedData));
//       setMiningData(updatedData);
//       setStakedAmount(0);
//       setIsStaking(false);
//       setHashrate(0);
//       setMiningStats(prev => ({
//         ...prev,
//         cycleEarnings: 0,
//         cycleCompletion: 0,
//         checkpointsPassed: 0,
//         lastCheckpointTime: Date.now()
//       }));

//       // Show success message
//       alert('Mining has been reset successfully!');
//     } catch (error) {
//       console.error('Error resetting mining:', error);
//       alert('Failed to reset mining. Please try again.');
//     }
//   };

//   // Show loading state
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-[#0A0A0F] text-white">
//         Loading...
//       </div>
//     );
//   }

//   // Show error state
//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-[#0A0A0F] text-white">
//         <div className="text-center">
//           <p className="text-red-500">{error}</p>
//           <p className="text-sm mt-2">Please make sure to open this app in Telegram</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col min-h-screen bg-black text-white antialiased">
//       <Header />
//       {/* Bonus Timer Container */}
//       <div className="container mx-auto px-2 sm:px-4 lg:px-6">
//         <div className="mt-2 sm:mt-4 flex gap-3 max-w-sm mx-auto">
//           {/* Daily Bonus Timer */}
//           <div className="flex-1 relative group">
//             {/* Glow effect */}
//             <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
            
//             {/* Main container */}
//             <div className="relative bg-gradient-to-b from-[#1A1B1E] to-[#15161A] rounded-xl p-3 border border-yellow-500/20 group-hover:border-yellow-500/30 transition-colors">
//               <div className="flex items-start space-x-3">
//                 {/* Icon container */}
//                 <div className="flex-shrink-0">
//                   <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center">
//                     <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
//                         d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
//                     </svg>
//                   </div>
//                 </div>
                
//                 {/* Text content */}
//                 <div className="flex-1">
//                   <div className="flex items-center">
//                     <div className="text-xs font-medium text-yellow-500">Daily Bonus</div>
//                     <div className="ml-auto text-[10px] text-yellow-500/60 font-medium">
//                       +{LOGIN_BONUS.DAILY.AMOUNT} HDC
//                     </div>
//                   </div>
//                   <div className="mt-1 flex items-center space-x-1.5">
//                     <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
//                     <div className="text-sm font-mono text-yellow-400 font-medium tracking-wide">
//                       {formatTimeUntil(lastDailyBonus + LOGIN_BONUS.DAILY.INTERVAL)}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Hourly Bonus Timer */}
//           <div className="flex-1 relative group">
//             {/* Glow effect */}
//             <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
            
//             {/* Main container */}
//             <div className="relative bg-gradient-to-b from-[#1A1B1E] to-[#15161A] rounded-xl p-3 border border-blue-500/20 group-hover:border-blue-500/30 transition-colors">
//               <div className="flex items-start space-x-3">
//                 {/* Icon container */}
//                 <div className="flex-shrink-0">
//                   <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
//                     <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
//                         d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                   </div>
//                 </div>
                
//                 {/* Text content */}
//                 <div className="flex-1">
//                   <div className="flex items-center">
//                     <div className="text-xs font-medium text-blue-500">Hourly HDC</div>
//                     <div className="ml-auto text-[10px] text-blue-500/60 font-medium">
//                       +{LOGIN_BONUS.HOURLY.AMOUNT} HDC
//                     </div>
//                   </div>
//                   <div className="mt-1 flex items-center space-x-1.5">
//                     <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
//                     <div className="text-sm font-mono text-blue-400 font-medium tracking-wide">
//                       {formatTimeUntil(lastHourlyBonus + LOGIN_BONUS.HOURLY.INTERVAL)}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1">
//         {currentTab === 'mine' && (
//           <div className="p-2 sm:p-4 space-y-4 sm:space-y-6 max-w-md mx-auto w-full">
//             {/* Mining Display Container - Adjusted margins for small screens */}
//             <div className="relative flex flex-col items-center justify-center min-h-[200px] sm:min-h-[240px] px-2 sm:px-4 mt-[40px] sm:mt-[80px]">
//               {isStaking && <MiningParticles />}
              
//               {/* Mining Power Core */}
//               <div className={`relative w-32 h-32`}>
//                 {/* Outer glow */}
//                 <div className="absolute inset-0 bg-gradient-to-br from-blue-500/50 to-blue-600/50 rounded-full blur-xl" />
                
//                 {/* Outer ring */}
//                 <div className="absolute inset-0 border-4 border-blue-400/30 rounded-full animate-[spin_10s_linear_infinite]" />
                
//                 {/* Main circle */}
//                 <div className={`relative w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg ${
//                   isStaking ? 'animate-pulse' : ''
//                 }`}>
//                   {/* Inner ring */}
//                   <div className={`w-28 h-28 border-2 border-blue-300/20 rounded-full flex items-center justify-center ${
//                     isStaking ? 'animate-[spin_8s_linear_infinite_reverse]' : ''
//                   }`}>
//                     {/* Core */}
//                     <div className={`w-24 h-24 bg-black/80 rounded-full flex items-center justify-center backdrop-blur-sm ${
//                       isStaking ? MINING_ANIMATIONS.PULSE : ''
//                     }`}>
//                       {/* Icon container */}
//                       <div className={`w-16 h-16 flex items-center justify-center ${
//                         isStaking ? MINING_ANIMATIONS.SPIN : ''
//                       }`}>
//                         <svg 
//                           className="w-12 h-12"
//                           viewBox="0 0 24 24" 
//                           fill={isStaking ? '#3B82F6' : 'white'}
//                         >
//                           <path d="M12,2C6.48,2,2,6.48,2,12c0,5.52,4.48,10,10,10s10-4.48,10-10C22,6.48,17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8 s3.59-8,8-8s8,3.59,8,8S16.41,20,12,20z M12,6c-1.66,0-3,1.34-3,3s1.34,3,3,3s3-1.34,3-3S13.66,6,12,6z"/>
//                         </svg>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Adjust text sizes for balance display */}
//               <div className="text-center space-y-2 sm:space-y-3 mt-4 sm:mt-6">
//                 <div className="flex flex-col items-center">
//                   <div className={`text-4xl sm:text-5xl font-bold tracking-tight transition-all duration-200 ${
//                     animateBalance ? 'scale-110 text-green-400' : ''
//                   }`}>
//                     <span className="font-mono">{hdcBalance.toFixed(3)}</span>
//                     <div className="text-xs sm:text-sm text-gray-400 mt-1">
//                       +{(stakedAmount * HOURLY_RATE * 0.7).toFixed(3)}/hr
//                     </div>
//                   </div>
//                   <div className="text-lg sm:text-xl text-gray-400 font-medium mt-1 flex items-center space-x-2">
//                     <span>HYDRO</span>
//                     {isStaking && (
//                       <div className="text-xs sm:text-sm text-blue-400 flex items-center">
//                         <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full mr-1 sm:mr-2 animate-pulse" />
//                         Mining
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Mining Stats Group */}
//               <div className="space-y-2">
//                 {/* Premium Status */}
//                 <div className="bg-gradient-to-r from-[#1A1B1E]/80 to-[#1F2937]/80 backdrop-blur-sm rounded-lg p-2">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-1.5">
//                       {telegramUser?.isPremium ? (
//                         <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
//                           <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                         </svg>
//                       ) : (
//                         <svg className="w-3.5 h-3.5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
//                           <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                         </svg>
//                       )}
//                       <span className="text-xs font-medium">
//                         {telegramUser?.isPremium ? 'Premium Miner' : 'Basic Miner'}
//                       </span>
//                     </div>
//                     {!telegramUser?.isPremium && (
//                       <button 
//                         onClick={() => setShowDepositModal(true)}
//                         className="text-[10px] text-yellow-400 font-medium px-2 py-0.5 rounded-full bg-yellow-400/10 hover:bg-yellow-400/20 transition-colors"
//                       >
//                         Upgrade
//                       </button>
//                     )}
//                   </div>
//                 </div>

//                 {/* Mining Cycle with Enhanced UI */}
//                 <div className="bg-[#1A1B1E]/80 backdrop-blur-sm rounded-lg p-2 space-y-2">
//                   <div className="flex justify-between items-center">
//                     <div className="flex items-center space-x-1.5">
//                       <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//                       </svg>
//                       <span className="text-xs text-gray-400">Mining Cycle</span>
//                     </div>
//                     <div className="flex items-center">
//                       <span className="text-xs text-blue-400 font-mono">
//                         {miningStats.cycleCompletion.toFixed(1)}%
//                       </span>
//                       {telegramUser?.isPremium && (
//                         <span className="ml-1 text-[10px] text-yellow-400">
//                           +20% Speed
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                   <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden">
//                     <div 
//                       className={`h-full rounded-full transition-all duration-300 relative ${
//                         telegramUser?.isPremium 
//                           ? 'bg-gradient-to-r from-yellow-500 via-blue-400 to-blue-500' 
//                           : 'bg-gradient-to-r from-blue-500 to-blue-400'
//                       }`}
//                       style={{ width: `${miningStats.cycleCompletion}%` }}
//                     >
//                       <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-shine" />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Mining Stats Grid */}
//                 <div className="grid grid-cols-2 gap-2">
//                   <div className="bg-[#1A1B1E]/80 backdrop-blur-sm rounded-lg p-2">
//                     <div className="flex items-center space-x-1.5 mb-1">
//                       <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
//                       </svg>
//                       <span className="text-xs text-gray-400">Hashrate</span>
//                     </div>
//                     <div className="text-blue-400 font-mono text-sm">
//                       {hashrate.toLocaleString(undefined, {
//                         minimumFractionDigits: 1,
//                         maximumFractionDigits: 3
//                       })} {hashrateUnit}
//                       {telegramUser?.isPremium && <span className="text-[10px] text-yellow-400 ml-1">+20%</span>}
//                     </div>
//                   </div>
//                   <div className="bg-[#1A1B1E]/80 backdrop-blur-sm rounded-lg p-2">
//                     <div className="flex items-center space-x-1.5 mb-1">
//                       <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//                       </svg>
//                       <span className="text-xs text-gray-400">Power</span>
//                     </div>
//                     <div className="text-blue-400 font-mono text-sm">
//                       {stakedAmount.toFixed(2)} TON
//                       {telegramUser?.isPremium && <span className="text-[10px] text-yellow-400 ml-1">Max</span>}
//                     </div>
//                   </div>
//                   <div className="bg-[#1A1B1E]/80 backdrop-blur-sm rounded-lg p-2">
//                     <div className="flex items-center space-x-1.5 mb-1">
//                       <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                       </svg>
//                       <span className="text-xs text-gray-400">Stake Bonus</span>
//                     </div>
//                     <div className="text-green-400 font-mono text-sm">
//                       +{((calculateStakeBonus(stakedAmount) - 1) * 100).toFixed(1)}%
//                       {telegramUser?.isPremium && <span className="text-[10px] text-yellow-400 ml-1">+10%</span>}
//                     </div>
//                   </div>
//                   <div className="bg-[#1A1B1E]/80 backdrop-blur-sm rounded-lg p-2">
//                     <div className="flex items-center space-x-1.5 mb-1">
//                       <svg className="w-3.5 h-3.5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
//                       </svg>
//                       <span className="text-xs text-gray-400">Total Earned</span>
//                     </div>
//                     <div className="text-yellow-400 font-mono text-sm">
//                       {formatNumber(miningStats.totalMined)} HDC
//                     </div>
//                   </div>
//                 </div>

//                 {/* Adjust button width for small screens */}
//                 <div className="space-y-4">
//                   <button
//                     onClick={() => setShowDepositModal(true)}
//                     className={`w-full sm:w-64 mt-4 sm:mt-6 py-3 sm:py-4 rounded-xl font-medium transition-all duration-300 relative overflow-hidden group ${
//                       isStaking 
//                         ? 'bg-gradient-to-br from-violet-600 via-violet-500 to-purple-500'
//                         : 'bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500'
//                     }`}
//                   >
//                     {/* Shine effect */}
//                     <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] group-hover:animate-shine" />
                    
//                     {/* Glass effect border */}
//                     <div className="absolute inset-[1px] rounded-xl bg-black/20 backdrop-blur-sm" />
                    
//                     {/* Content container */}
//                     <div className="relative flex items-center justify-center space-x-3">
//                       <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
//                         <svg className="w-5 h-5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
//                         </svg>
//                       </div>
//                       <div className="flex flex-col items-start">
//                         <span className="font-semibold text-white/90">
//                           {isStaking ? 'Upgrade Mining' : 'Start Mining'}
//                         </span>
//                         {isStaking && (
//                           <span className="text-xs text-white/70">
//                             +{calculateNextUpgrade(stakedAmount)}% Power
//                           </span>
//                         )}
//                       </div>
//                     </div>

//                     {/* Hover effect */}
//                     <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/5 to-transparent" />
//                   </button>

//                   {/* Add Reset Button */}
//                   {isStaking && (
//                     <button
//                       onClick={resetMining}
//                       className="w-full sm:w-64 py-3 sm:py-4 rounded-xl font-medium transition-all duration-300 relative overflow-hidden group bg-gradient-to-br from-red-600 via-red-500 to-pink-500"
//                     >
//                       <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] group-hover:animate-shine" />
//                       <div className="absolute inset-[1px] rounded-xl bg-black/20 backdrop-blur-sm" />
//                       <div className="relative flex items-center justify-center space-x-2">
//                         <svg 
//                           className="w-4 h-4" 
//                           fill="none" 
//                           viewBox="0 0 24 24" 
//                           stroke="currentColor"
//                         >
//                           <path 
//                             strokeLinecap="round" 
//                             strokeLinejoin="round" 
//                             strokeWidth={2} 
//                             d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
//                           />
//                         </svg>
//                         <span>Reset Mining</span>
//                       </div>
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {currentTab === 'network' && (
//           <div className="p-4 space-y-6 max-w-2xl mx-auto w-full">
//             {user ? (
//               // Your network content when user exists
//               <div>Network content for {user.username}</div>
//             ) : (
//               // Fallback content when no user
//               <div>Please connect your Telegram account</div>
//             )}
//           </div>
//         )}

//         {currentTab === 'gmp' && (
//           <div className="p-4 space-y-6 max-w-2xl mx-auto w-full">
//           </div>
//         )}

//         {currentTab === 'tasks' && (
//           <div className="p-4 space-y-6 max-w-2xl mx-auto w-full">
          
//           </div>
//         )}

//         {currentTab === 'token' && (
//           <div className="p-4 space-y-6 max-w-2xl mx-auto w-full">
          
//           </div>
//         )}
//       </div>

//       {/* Adjust bottom navigation for small screens */}
//       <div className="fixed bottom-0 left-0 right-0 bg-[#1A1B1E]/90 backdrop-blur-xl border-t border-white/5 safe-area-pb">
//         <div className="max-w-lg mx-auto px-1 sm:px-2">
//           <div className="grid grid-cols-5 items-center">
//             {[
//               { id: 'mine' as const, text: 'Mine', Icon: ({ size, className }: { size: number, className: string }) => (
//                 <svg 
//                   width={size} 
//                   height={size} 
//                   viewBox="0 0 24 24" 
//                   fill="none" 
//                   stroke="currentColor" 
//                   className={className}
//                 >
//                   <path 
//                     strokeLinecap="round" 
//                     strokeLinejoin="round" 
//                     strokeWidth={1.5} 
//                     d="M13 10V3L4 14h7v7l9-11h-7z"
//                   />
//                 </svg>
//               )},
//               { id: 'network' as const, text: 'Network', Icon: BiNetworkChart },
//               { id: 'gmp' as const, text: 'GMP', Icon: FaCoins },
//               { id: 'tasks' as const, text: 'Tasks', Icon: RiMessage3Line },
//               { id: 'token' as const, text: 'Token', Icon: FaUsers }
//             ].map(({ id, text, Icon }) => (
//               <button 
//                 key={id} 
//                 onClick={() => setCurrentTab(id)}
//                 className={`flex flex-col items-center py-2 sm:py-3 w-full transition-all duration-300 ${
//                   currentTab === id ? 'text-blue-400' : 'text-gray-500'
//                 }`}
//               >
//                 <Icon size={16} className="mb-0.5 sm:mb-1" />
//                 <span className="text-[8px] sm:text-[10px] font-medium tracking-wide truncate max-w-[48px] sm:max-w-[64px] text-center">
//                   {text}
//                 </span>
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Upgrade Shop Modal */}
//       {showDepositModal && (
//         <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
//           <div className="bg-gradient-to-b from-[#1A1B1E] to-[#12131A] rounded-2xl w-full max-w-md p-6 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
//             {/* Header */}
//             <div className="relative mb-6">
//               <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-20 h-20">
//                 <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
//                 <div className="relative bg-gradient-to-b from-blue-400 to-blue-600 rounded-full p-4 border-4 border-[#1A1B1E]">
//                   <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
//                       d="M13 10V3L4 14h7v7l9-11h-7z" />
//                   </svg>
//                 </div>
//               </div>
              
//               <h3 className="text-center text-2xl font-bold bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 bg-clip-text text-transparent mt-8">
//                 {miningStats.cycleStartTime > 0 ? 'Power Upgrade Station' : 'Mining Initialization'}
//               </h3>
              
//               <button 
//                 onClick={() => setShowDepositModal(false)}
//                 className="absolute right-0 top-0 text-gray-400 hover:text-white transition-colors"
//               >
//                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>

//             <div className="space-y-6">
//               {/* Current Stats Card */}
//               {miningStats.cycleStartTime > 0 && (
//                 <div className="bg-black/40 rounded-xl p-4 border border-blue-500/10">
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-1">
//                       <p className="text-xs text-gray-400">Mining Power</p>
//                       <p className="text-xl font-bold text-blue-400 font-mono">
//                         {stakedAmount.toFixed(2)} TON
//                       </p>
//                     </div>
//                     <div className="space-y-1">
//                       <p className="text-xs text-gray-400">Checkpoints</p>
//                       <div className="flex items-center space-x-2">
//                         <div className="flex -space-x-1">
//                           {[...Array(miningStats.checkpointsPassed)].map((_, i) => (
//                             <div key={i} className="w-4 h-4 rounded-full bg-blue-500/30 border border-blue-500/50" />
//                           ))}
//                         </div>
//                         <span className="text-blue-400 font-mono">{miningStats.checkpointsPassed}/4</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Upgrade Options */}
//               <div className="space-y-4">
//                 <div className="flex justify-between items-center">
//                   <label className="text-sm font-medium bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
//                     Select Power Upgrade
//                   </label>
//                   <span className="text-xs text-gray-400">
//                     Min: {CHECKPOINT_CONFIG.MIN_DEPOSIT} TON
//                   </span>
//                 </div>

//                 {/* Quick Select Buttons */}
//                 <div className="grid grid-cols-3 gap-3">
//                   {[1, 5, 10].map((amount) => (
//                     <button
//                       key={amount}
//                       onClick={() => setDepositAmount(amount.toString())}
//                       className="relative group"
//                     >
//                       <div className="absolute inset-0 bg-blue-500 rounded-lg blur-sm opacity-20 group-hover:opacity-30 transition-opacity" />
//                       <div className="relative bg-gradient-to-b from-[#2B2D3A] to-[#1A1B1E] border border-blue-500/20 rounded-lg p-3 space-y-1 hover:border-blue-500/40 transition-all">
//                         <div className="text-lg font-bold text-white">{amount}</div>
//                         <div className="text-xs text-gray-400">TON</div>
//                         <div className="text-[10px] text-blue-400">+{amount * 10}% Power</div>
//                       </div>
//                     </button>
//                   ))}
//                 </div>

//                 {/* Custom Amount Input */}
//                 <div className="relative mt-4">
//                   <input
//                     type="number"
//                     value={depositAmount}
//                     onChange={(e) => setDepositAmount(e.target.value)}
//                     className="w-full bg-black/30 rounded-lg p-4 text-white pr-16 border border-blue-500/20 focus:border-blue-500/40 outline-none transition-all"
//                     placeholder="Custom amount"
//                     min={CHECKPOINT_CONFIG.MIN_DEPOSIT}
//                   />
//                   <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
//                     TON
//                   </span>
//                 </div>

//                 {/* Upgrade Button */}
//                 <button
//                   onClick={startMining}
//                   className="w-full relative group"
//                 >
//                   <div className="absolute inset-0 bg-blue-500 rounded-lg blur-md opacity-20 group-hover:opacity-30 transition-opacity" />
//                   <div className="relative bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg py-4 px-6 font-bold text-white flex items-center justify-center space-x-2 group-hover:from-blue-500 group-hover:to-blue-400 transition-all">
//                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
//                         d="M13 10V3L4 14h7v7l9-11h-7z" />
//                     </svg>
//                     <span>
//                       {miningStats.cycleStartTime > 0 ? 'Upgrade Mining Power' : 'Initialize Mining'}
//                     </span>
//                   </div>
//                 </button>

//                 {/* Info Text */}
//                 {miningStats.cycleStartTime > 0 && (
//                   <p className="text-xs text-center text-gray-400 mt-4">
//                     Mining continues even if you skip this upgrade opportunity
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {showBonusModal && (
//         <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
//           <div className="bg-[#1A1B1E] rounded-xl w-full max-w-sm p-6 space-y-4">
//             <div className="text-center">
//               <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <svg 
//                   className="w-10 h-10 text-white animate-bounce" 
//                   fill="none" 
//                   viewBox="0 0 24 24" 
//                   stroke="currentColor"
//                 >
//                   <path 
//                     strokeLinecap="round" 
//                     strokeLinejoin="round" 
//                     strokeWidth={2} 
//                     d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
//                   />
//                 </svg>
//               </div>
//               <h3 className="text-xl font-bold mb-2">
//                 {bonusType === 'daily' ? 'Daily Login Bonus!' : 'Hourly Login Bonus!'}
//               </h3>
//               <p className="text-gray-400 mb-4">
//                 You've earned {bonusAmount.toFixed(2)} HDC
//               </p>
//               <button
//                 onClick={claimBonus}
//                 className="w-full bg-blue-500 hover:bg-blue-600 py-3 rounded-lg font-medium transition-colors"
//               >
//                 Claim Bonus
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Update the formatTimeUntil helper function
// const formatTimeUntil = (timestamp: number): string => {
//   const now = Date.now();
//   const timeLeft = Math.max(0, timestamp - now);
  
//   if (timeLeft <= 0) {
//     return '0h 0m';
//   }
  
//   const hours = Math.floor(timeLeft / (1000 * 60 * 60));
//   const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  
//   return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
// };

// const calculateNextUpgrade = (stakedAmount: number) => {
//   const baseIncrease = 10;
//   const level = Math.floor(stakedAmount / CHECKPOINT_CONFIG.MIN_DEPOSIT);
//   return baseIncrease + (level * 2);
// };


// const formatNumber = (num: number) => {
//   return Number(num.toFixed(6)).toString();
// };
