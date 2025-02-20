// import { FC, useState, useEffect } from 'react';
// import { FaRocket, FaChartLine, FaUsers, FaGem } from 'react-icons/fa';
// import { useAuth } from '@/hooks/useAuth';

// interface OnboardingStep {
//   icon: JSX.Element;
//   title: string;
//   description: string;
// }

// export const OnboardingScreen: FC = () => {
//   const { user } = useAuth();
//   const [currentStep, setCurrentStep] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [shouldShow, setShouldShow] = useState(false);

//   const steps: OnboardingStep[] = [
//     {
//       icon: <FaRocket className="w-8 h-8 text-blue-400" />,
//       title: `Welcome${user?.first_name ? ` ${user.first_name}` : ''}!`,
//       description: "Experience the future of decentralized staking"
//     },
//     {
//       icon: <FaChartLine className="w-8 h-8 text-green-400" />,
//       title: "Daily Rewards",
//       description: "Earn up to 2.5% daily on your stakes"
//     },
//     {
//       icon: <FaUsers className="w-8 h-8 text-purple-400" />,
//       title: "Network Growth",
//       description: "Build your team and earn together"
//     },
//     {
//       icon: <FaGem className="w-8 h-8 text-amber-400" />,
//       title: "Exclusive Benefits",
//       description: "Access special features and bonuses"
//     }
//   ];

//   useEffect(() => {
//     if (!user) return;

//     // Check if user has seen onboarding
//     const hasSeenOnboarding = localStorage.getItem(`onboarding_${user.id}`);
//     if (!hasSeenOnboarding && user.total_deposit === 0) {
//       setShouldShow(true);
//       // Mark onboarding as seen
//       localStorage.setItem(`onboarding_${user.id}`, 'true');
//     }

//     // Show loading screen
//     const loadingTimer = setTimeout(() => {
//       setLoading(false);
//     }, 2000);

//     return () => clearTimeout(loadingTimer);
//   }, [user]);

//   useEffect(() => {
//     if (loading) return;

//     // Start steps rotation only after loading is complete
//     const stepInterval = setInterval(() => {
//       setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : 0));
//     }, 3000);

//     return () => clearInterval(stepInterval);
//   }, [loading, steps.length]);

//   if (!user || !shouldShow) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0F]">
//       <div className="max-w-md w-full px-6">
//         {loading ? (
//           <div className="flex flex-col items-center">
//             <div className="relative">
//               <div className="w-20 h-20 border-4 border-blue-500/20 rounded-full animate-spin">
//                 <div 
//                   className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full animate-pulse" 
//                   style={{ animationDelay: '-0.5s' }} 
//                 />
//               </div>
//             </div>
//             <div className="mt-8 text-center">
//               <h2 className="text-xl font-semibold text-white">
//                 {user?.total_deposit === 0 ? 'Welcome to TON Staking' : 'Welcome Back!'}
//               </h2>
//               <p className="mt-2 text-gray-400">
//                 {user?.total_deposit === 0 
//                   ? 'Setting up your new account...'
//                   : 'Loading your dashboard...'}
//               </p>
//             </div>
//           </div>
//         ) : (
//           <div key={currentStep} className="text-center animate-fade-in">
//             <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-white/5">
//               {steps[currentStep].icon}
//             </div>
//             <h2 className="text-xl font-bold text-white mt-4 mb-2">
//               {steps[currentStep].title}
//             </h2>
//             <p className="text-sm text-gray-400 mb-6">
//               {steps[currentStep].description}
//             </p>
//             <div className="flex justify-center gap-1.5">
//               {steps.map((_, index) => (
//                 <div
//                   key={index}
//                   className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
//                     index === currentStep ? 'bg-blue-500' : 'bg-gray-600'
//                   }`}
//                 />
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }; 