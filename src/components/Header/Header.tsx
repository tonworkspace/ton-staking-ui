import { FC } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { TonConnectButton } from '@tonconnect/ui-react';

export const Header: FC = () => {
  const { user, telegramUser } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#0F1215] via-[#1A1B1E] to-[#0F1215] backdrop-blur-xl border-b border-blue-500/20 shadow-lg shadow-blue-500/5">
      <div className="max-w-2xl mx-auto px-2 py-2">
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {user.photoUrl ? (
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-70" />
                  <img 
                    src={user.photoUrl} 
                    alt={user.username}
                    className="relative w-12 h-12 rounded-full object-cover border-2 border-white/20"
                  />
                  {/* Premium Badge */}
                  {telegramUser?.isPremium && (
                    <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-1.5 border-2 border-[#1A1B1E]">
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L1 21h22L12 2zm0 3.83L19.17 19H4.83L12 5.83z"/>
                      </svg>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-70" />
                  <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center border-2 border-white/20">
                    <span className="text-blue-100 font-bold text-lg">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {/* Premium Badge */}
                  {telegramUser?.isPremium && (
                    <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-1.5 border-2 border-[#1A1B1E]">
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L1 21h22L12 2zm0 3.83L19.17 19H4.83L12 5.83z"/>
                      </svg>
                    </div>
                  )}
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="font-bold text-white text-lg tracking-wide">
                    {user.username}
                  </h2>
                  {telegramUser?.isPremium && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/20">
                      Premium
                    </span>
                  )}
                </div>
                {(user.first_name || user.last_name) && (
                  <p className="text-sm text-blue-300/80 font-medium">
                    {[user.first_name, user.last_name].filter(Boolean).join(' ')}
                  </p>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-30" />
              <TonConnectButton className="relative" />
            </div>
          </div>
        ) : (
          <div className="h-12 flex items-center justify-between">
            <span className="text-blue-300/80 font-medium">Loading profile...</span>
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-30" />
              <TonConnectButton className="relative ton-connect-page__button" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}; 