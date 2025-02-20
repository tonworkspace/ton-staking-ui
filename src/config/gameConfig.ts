export const STREAK_CONFIG = {
  RESET_DAYS: 2, // Reset streak if user misses more than 2 days
};

export const HDC_PRICE = 0.01; // Set HDC price in USD 

export const REFERRAL_CONFIG = {
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
  ],
  UPDATE_INTERVAL: 5 * 60 * 1000, // 5 minutes
  ACTIVITY_THRESHOLD: 24 * 60 * 60 * 1000 // 24 hours
}; 