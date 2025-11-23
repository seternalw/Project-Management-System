
import React, { useState } from 'react';
import { User } from '../types';
import { MOCK_USERS } from '../constants';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'EMAIL' | 'PASSWORD'>('EMAIL');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // To simulate the Google transition
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = () => {
    if (!email) {
      setError('请输入电子邮件或电话号码');
      return;
    }
    setError('');
    setIsAnimating(true);
    // Simulate lookup
    setTimeout(() => {
        setIsAnimating(false);
        setStep('PASSWORD');
    }, 400);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate network delay
    setTimeout(() => {
        const user = MOCK_USERS.find(u => u.email === email);
        if (user) {
            // In a real app, we check password hash here. 
            // For this mock, any password works if user exists.
            onLogin(user);
        } else {
            setLoading(false);
            setError('密码错误，请重试或点击“忘记密码”重置。');
        }
    }, 1500);
  };

  const handleBack = () => {
      setStep('EMAIL');
      setPassword('');
      setError('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f2f5] font-roboto">
      <div className="w-full max-w-[450px] bg-white rounded-2xl shadow-sm p-10 md:p-12 border border-[#dadce0] min-h-[500px] flex flex-col transition-all duration-300">
        
        {/* Google Logo */}
        <div className="flex justify-center mb-4">
            <svg viewBox="0 0 48 48" className="w-12 h-12 block">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
        </div>

        {/* Content Slider */}
        <div className="flex-1 flex flex-col items-center text-center">
            {step === 'EMAIL' ? (
                <div className={`w-full transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                    <h1 className="text-2xl font-normal text-[#202124] mb-2">Sign in</h1>
                    <p className="text-base text-[#202124] mb-10">to continue to GridFlow</p>

                    <div className="w-full text-left relative group mb-2">
                        <input 
                            type="email" 
                            className={`w-full border rounded px-3 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors z-10 bg-transparent relative ${error ? 'border-red-600 focus:border-red-600' : 'border-[#dadce0] focus:border-[#1a73e8]'}`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                            placeholder=" " // Trick for floating label
                            autoFocus
                        />
                         <label className={`absolute left-3 px-1 bg-white text-[#5f6368] transition-all duration-200 pointer-events-none 
                            ${email ? '-top-2.5 text-xs text-[#1a73e8]' : 'top-3.5 text-base group-focus-within:-top-2.5 group-focus-within:text-xs group-focus-within:text-[#1a73e8]'}
                            ${error ? 'text-red-600 group-focus-within:text-red-600' : ''}
                         `}>
                            Email or phone
                        </label>
                    </div>
                    {error && (
                        <div className="flex items-start gap-2 text-red-600 text-xs text-left mb-4">
                            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                            <span>{error}</span>
                        </div>
                    )}
                    
                    <div className="text-left mb-8">
                         <a href="#" className="text-[#1a73e8] font-medium text-sm hover:underline">Forgot email?</a>
                    </div>
                    
                    <div className="mt-8 text-sm text-[#5f6368] text-left">
                        Not your computer? Use Guest mode to sign in privately. <a href="#" className="text-[#1a73e8] font-medium hover:underline">Learn more</a>
                    </div>

                     <div className="flex justify-end items-center mt-10 w-full">
                        <button className="text-[#1a73e8] font-medium text-sm px-6 py-2 rounded hover:bg-blue-50 transition-colors mr-2">Create account</button>
                        <button 
                            onClick={handleNext}
                            className="bg-[#1a73e8] text-white text-sm font-medium px-6 py-2.5 rounded hover:bg-[#1557b0] transition-colors shadow-sm"
                        >
                            Next
                        </button>
                    </div>
                </div>
            ) : (
                <div className="w-full animate-fadeIn">
                     <h1 className="text-2xl font-normal text-[#202124] mb-2">Welcome</h1>
                     <div 
                        onClick={handleBack}
                        className="flex items-center justify-center gap-2 border border-[#dadce0] rounded-full px-1 pr-3 py-1 mb-10 cursor-pointer hover:bg-slate-50 transition-colors inline-flex max-w-[80%]"
                     >
                         <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                             {email.charAt(0).toUpperCase()}
                         </div>
                         <span className="text-sm text-[#3c4043] truncate">{email}</span>
                         <svg className="w-4 h-4 text-[#5f6368]" fill="currentColor" viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
                     </div>

                     <form onSubmit={handleLogin} className="w-full">
                        <div className="w-full text-left relative group mb-2">
                            <input 
                                type="password" 
                                className={`w-full border rounded px-3 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors z-10 bg-transparent relative ${error ? 'border-red-600 focus:border-red-600' : 'border-[#dadce0] focus:border-[#1a73e8]'}`}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder=" "
                                autoFocus
                            />
                            <label className={`absolute left-3 px-1 bg-white text-[#5f6368] transition-all duration-200 pointer-events-none 
                                ${password ? '-top-2.5 text-xs text-[#1a73e8]' : 'top-3.5 text-base group-focus-within:-top-2.5 group-focus-within:text-xs group-focus-within:text-[#1a73e8]'}
                                ${error ? 'text-red-600 group-focus-within:text-red-600' : ''}
                            `}>
                                Enter your password
                            </label>
                        </div>
                        {error && (
                            <div className="flex items-start gap-2 text-red-600 text-xs text-left mb-4">
                                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                                <span>{error}</span>
                            </div>
                        )}
                        <div className="text-left mb-8">
                             {/* Hint for demo */}
                             <span className="text-xs text-slate-400">Mock: 密码随意输入</span>
                        </div>

                         <div className="flex justify-between items-center mt-10 w-full">
                            <button 
                                type="button"
                                onClick={handleBack} // Go back to email
                                className="text-[#1a73e8] font-medium text-sm hover:underline"
                            >
                                Forgot password?
                            </button>
                            <button 
                                type="submit"
                                disabled={loading}
                                className="bg-[#1a73e8] text-white text-sm font-medium px-6 py-2.5 rounded hover:bg-[#1557b0] transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                            >
                                {loading && (
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {loading ? 'Next' : 'Next'}
                            </button>
                        </div>
                     </form>
                </div>
            )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-6 flex justify-between w-full max-w-[450px] text-xs text-[#5f6368]">
        <div className="flex gap-4">
            <a href="#" className="hover:text-[#202124]">English (United States)</a>
        </div>
        <div className="flex gap-6">
            <a href="#" className="hover:text-[#202124]">Help</a>
            <a href="#" className="hover:text-[#202124]">Privacy</a>
            <a href="#" className="hover:text-[#202124]">Terms</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
