-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT,
  referrer_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_deposit NUMERIC DEFAULT 0,
  total_withdrawn NUMERIC DEFAULT 0,
  team_volume NUMERIC DEFAULT 0,
  direct_referrals INTEGER DEFAULT 0,
  rank TEXT DEFAULT 'None'
);

-- Stakes table
CREATE TABLE stakes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  amount NUMERIC NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  daily_rate NUMERIC NOT NULL,
  total_earned NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  last_payout TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral earnings table
CREATE TABLE referral_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  referral_id UUID REFERENCES users(id) NOT NULL,
  amount NUMERIC NOT NULL,
  level INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Global pool shares table
CREATE TABLE global_pool_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  shares INTEGER NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
); 