import { FC, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { TonConnectButton } from '@tonconnect/ui-react';

export const Header: FC = () => {
  const { user, telegramUser, isLoading, error, retryAuthentication, authAttempts } = useAuth();
  const [imageError, setImageError] = useState(false);

  // Add debug logging to help diagnose issues
  useEffect(() => {
    console.log('Header component state:', { 
      userExists: !!user, 
      telegramUserExists: !!telegramUser,
      isLoading, 
      error,
      authAttempts: authAttempts()
    });
    
    if (user) {
      console.log('User data loaded:', {
        username: user.username,
        photoUrl: user.photoUrl,
        loginStreak: user.login_streak
      });
    }
  }, [user, telegramUser, isLoading, error, authAttempts]);

  // Reset image error state when user changes
  useEffect(() => {
    setImageError(false);
  }, [user?.telegram_id]);

  // Add retry button for authentication failures
  if (error) {
    return (
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#0F1215] via-[#1A1B1E] to-[#0F1215] backdrop-blur-xl border-b border-red-500/20">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col items-center">
            <div className="text-red-400 text-sm mb-2">{error}</div>
            {authAttempts() < 3 && (
              <button 
                onClick={retryAuthentication}
                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-full text-sm transition-all duration-300"
              >
                Retry Authentication
              </button>
            )}
            {authAttempts() >= 3 && (
              <div className="text-yellow-400 text-xs mt-1">
                Too many failed attempts. Please refresh the page or restart the app.
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }

  if (isLoading || !user) {
    return (
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#0F1215] via-[#1A1B1E] to-[#0F1215] backdrop-blur-xl border-b border-blue-500/20">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Avatar Skeleton */}
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-20" />
                <div className="relative w-12 h-12 rounded-full bg-gray-700/50 animate-pulse" />
              </div>
              
              {/* Name/Details Skeleton */}
              <div className="space-y-2">
                <div className="h-6 w-32 bg-gray-700/50 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-700/50 rounded animate-pulse" />
              </div>
            </div>
            
            {/* Button Area */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-30" />
              <div className="h-10 w-32 bg-gray-700/50 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Render the actual header with user data
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#0F1215] via-[#1A1B1E] to-[#0F1215] backdrop-blur-xl border-b border-blue-500/20 shadow-lg shadow-blue-500/5">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {user.photoUrl && !imageError ? (
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-300" />
                <img 
                  src={user.photoUrl} 
                  alt={user.username || 'User'}
                  className="relative w-12 h-12 rounded-full object-cover border-2 border-white/20 hover:border-white/40 transition duration-300"
                  onError={() => setImageError(true)}
                />
                {telegramUser?.isPremium && (
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-1.5 border-2 border-[#1A1B1E] ring-2 ring-purple-500/20">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L1 21h22L12 2zm0 3.83L19.17 19H4.83L12 5.83z"/>
                    </svg>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-300" />
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center border-2 border-white/20 hover:border-white/40 transition duration-300">
                  <span className="text-blue-100 font-bold text-lg">
                    {(user.username || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                {telegramUser?.isPremium && (
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-1.5 border-2 border-[#1A1B1E] ring-2 ring-purple-500/20">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L1 21h22L12 2zm0 3.83L19.17 19H4.83L12 5.83z"/>
                    </svg>
                  </div>
                )}
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-white text-lg tracking-wide hover:text-blue-400 transition duration-300">
                  {user.username || 'User'}
                </h2>
                {telegramUser?.isPremium && (
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/20 shadow-sm shadow-purple-500/10">
                    Premium
                  </span>
                )}
              </div>
              {(user.first_name || user.last_name) && (
                <p className="text-sm text-blue-300/80 font-medium hover:text-blue-300 transition duration-300">
                  {[user.first_name, user.last_name].filter(Boolean).join(' ')}
                </p>
              )}
              {/* Add login streak display */}
              <p className="text-xs text-green-400/80 mt-1">
                🔥 {user.login_streak || 0} day streak
              </p>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-10 group-hover:opacity-50 transition duration-300 ml-2" />
            <TonConnectButton className="!bg-blue-500/20 !text-blue-400 hover:!bg-blue-500/30 !rounded-full !transition-all !duration-300 !scale-90 ml-2"/>
          </div>
        </div>
      </div>
    </header>
  );
}; 