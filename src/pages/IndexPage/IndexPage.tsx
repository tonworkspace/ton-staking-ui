import { Buffer } from 'buffer';
window.Buffer = Buffer;

import { FC, useState } from 'react';
import { FaCoins, FaUsers } from 'react-icons/fa';
import { BiNetworkChart } from 'react-icons/bi';
import { RiMessage3Line } from 'react-icons/ri';
import { AiOutlineHome } from 'react-icons/ai';
import { Header } from '@/components/Header/Header';
import { useAuth } from '@/hooks/useAuth';

// Add interfaces for our user types
interface TelegramUser {
  id: number;
  username?: string;
  // Add other telegram user properties as needed
}

interface User {
  id: number;
  // Add other user properties as needed
}

export const IndexPage: FC = () => {
  const { user, isLoading, error } = useAuth();
  const [currentTab, setCurrentTab] = useState<'home' | 'network' | 'gmp' | 'tasks' | 'token'>('home');

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

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0F] text-white antialiased">
      <Header />
      
      {/* Main Content Area */}
      <div className="flex-1">
        {currentTab === 'home' && (
          <div className="p-4 space-y-6 max-w-2xl mx-auto w-full">
           
          </div>
        )}

        {currentTab === 'network' && (
          <div className="p-4 space-y-6 max-w-2xl mx-auto w-full">
            {user ? (
              // Your network content when user exists
              <div>Network content for {user.username}</div>
            ) : (
              // Fallback content when no user
              <div>Please connect your Telegram account</div>
            )}
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
              { id: 'home' as const, text: 'Home', Icon: AiOutlineHome },
              { id: 'network' as const, text: 'Network', Icon: BiNetworkChart },
              { id: 'gmp' as const, text: 'GMP', Icon: FaCoins },
              { id: 'tasks' as const, text: 'Tasks', Icon: RiMessage3Line },
              { id: 'token' as const, text: 'Token', Icon: FaUsers }
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
