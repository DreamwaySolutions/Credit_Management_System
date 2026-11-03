import React, { useState } from 'react';
import { X, LogIn, UserCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const { user, login } = useAuth();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleQuickLogin = (selectedUser: 'satish' | 'superadmin') => {
    login(selectedUser, selectedUser === 'superadmin' ? 'superadmin' : 'admin');
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter username.');
      return;
    }
    const role = username.toLowerCase().includes('super') ? 'superadmin' : 'admin';
    login(username.trim(), role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D2329]/80 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#16333A] border-2 border-[#234E57] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#85B3AC] hover:text-[#E8F8F5] rounded-lg hover:bg-[#1E4D56] transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 border-b border-[#234E57] pb-3 mb-4">
          <LogIn className="w-7 h-7 text-[#00A896]" />
          <div>
            <h3 className="text-xl font-extrabold text-[#E8F8F5] font-heading">
              Account Login / Switch
            </h3>
            <p className="text-xs text-[#85B3AC] font-medium">
              Current User: <strong className="text-[#00A896]">{user?.name || 'Guest'}</strong>
            </p>
          </div>
        </div>

        {/* Quick Demo Switcher Buttons */}
        <div className="mb-5 space-y-2">
          <label className="block text-xs font-bold text-[#85B3AC] uppercase tracking-wider mb-1">
            Quick One-Click Login:
          </label>

          <button
            type="button"
            onClick={() => handleQuickLogin('satish')}
            className="w-full flex items-center justify-between p-3 bg-[#1E4D56] hover:bg-[#234E57] border-2 border-[#234E57] rounded-xl transition-all"
          >
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-5 h-5 text-[#00A896]" />
              <div className="text-left">
                <div className="text-sm font-bold text-[#E8F8F5]">Satish Sir (Admin)</div>
                <div className="text-xs text-[#85B3AC]">Username: satish</div>
              </div>
            </div>
            <span className="text-xs font-extrabold text-[#0D2329] bg-[#00A896] px-2.5 py-1 rounded-md">
              Select
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('superadmin')}
            className="w-full flex items-center justify-between p-3 bg-[#1E4D56] hover:bg-[#234E57] border-2 border-[#234E57] rounded-xl transition-all"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#4EEDC4]" />
              <div className="text-left">
                <div className="text-sm font-bold text-[#E8F8F5]">Super Admin</div>
                <div className="text-xs text-[#85B3AC]">Username: superadmin</div>
              </div>
            </div>
            <span className="text-xs font-extrabold text-[#0D2329] bg-[#4EEDC4] px-2.5 py-1 rounded-md">
              Select
            </span>
          </button>
        </div>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-[#234E57]"></div>
          <span className="flex-shrink mx-3 text-xs font-bold text-[#85B3AC] uppercase">OR CUSTOM LOGIN</span>
          <div className="flex-grow border-t border-[#234E57]"></div>
        </div>

        <form onSubmit={handleCustomSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full px-3 py-2 bg-[#0D2329] border-2 border-[#234E57] rounded-xl text-sm font-bold text-[#E8F8F5] focus:outline-none focus:ring-2 focus:ring-[#00A896] placeholder-[#85B3AC]"
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2 bg-[#0D2329] border-2 border-[#234E57] rounded-xl text-sm font-bold text-[#E8F8F5] focus:outline-none focus:ring-2 focus:ring-[#00A896] placeholder-[#85B3AC]"
            />
          </div>
          {error && <div className="text-xs font-bold text-[#FF7E67]">{error}</div>}
          <button
            type="submit"
            className="w-full py-2.5 bg-[#00A896] hover:bg-[#008f80] text-[#0D2329] font-extrabold rounded-xl shadow-md transition-all"
          >
            Login
          </button>
        </form>

      </div>
    </div>
  );
};
