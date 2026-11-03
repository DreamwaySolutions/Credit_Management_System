import React, { useState } from 'react';
import { LogIn, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Footer } from './Footer';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    const result = await login(username.trim(), password.trim());
    if (!result.success) {
      setError(result.message || 'Invalid username or password.');
    }
  };


  return (
    <div className="min-h-screen w-full bg-[#99C2D1] flex flex-col justify-between items-center">
      
      {/* Centered Login Card Container */}
      <div className="flex-1 w-full flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#FFFFFF] border-2 border-[#BCCED7] rounded-2xl p-6 sm:p-8 shadow-[0_4px_12px_rgba(15,23,42,0.05)] relative overflow-hidden">
          
          {/* Decorative Top Accent Bar */}
          <div className="h-2 w-full bg-[#2563EB] absolute top-0 left-0"></div>

          {/* Branding Header */}
          <div className="text-center pt-2 pb-6 border-b border-[#E2E8F0] mb-6">
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#0F172A] font-heading leading-tight">
              <span className="text-[#1B365D]">DREAM</span>
              <span className="text-[#1F90E6]">WAY</span>
            </h1>
            <h2 className="text-xs sm:text-sm font-extrabold text-[#1F90E6] tracking-wider uppercase font-heading mt-1">
              CREDIT MANAGEMENT SYSTEM
            </h2>
            <p className="text-xs text-[#64748B] mt-2 font-medium">
              Enter your credentials to sign in
            </p>
          </div>

          {/* Standard Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-[#64748B] uppercase mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter username (e.g. satish)"
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-[#E2E8F0] border-2 border-[#94A3B8] rounded-xl text-sm font-bold text-[#1E293B] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-[#64748B] uppercase mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-4 py-3 bg-[#E2E8F0] border-2 border-[#94A3B8] rounded-xl text-sm font-bold text-[#1E293B] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl text-xs font-bold text-[#B91C1C]">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-[#FFFFFF] font-black text-base rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <LogIn className="w-5 h-5 text-[#FFFFFF]" />
              <span>Sign In to System</span>
            </button>
          </form>

        </div>
      </div>

      {/* Copyright Footer on Login Page */}
      <Footer />

    </div>
  );
};
