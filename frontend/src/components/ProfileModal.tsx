import React, { useState } from 'react';
import { X, User as UserIcon, Lock, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfileModalProps {
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState<string>(user?.name || user?.username || '');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanName = name.trim();
    if (!cleanName) {
      setError('Please enter your name.');
      return;
    }

    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match. Please re-enter password.');
        return;
      }
      if (newPassword.length < 4) {
        setError('Password must be at least 4 characters long.');
        return;
      }
    }

    const res = await updateProfile(cleanName, newPassword || undefined);
    if (res.success) {
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        onClose();
      }, 900);
    } else {
      setError(res.message || 'Failed to update profile.');
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FFFFFF] border-2 border-[#BCCED7] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative text-[#0F172A]">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-xl hover:bg-[#E2E8F0] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b-2 border-[#E2E8F0] pb-3.5 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center text-[#2563EB] shrink-0">
            <UserIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#0F172A] font-heading">
              Edit Profile Settings
            </h3>
            <p className="text-xs font-bold text-[#64748B]">
              Update your account display name and password
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Edit Name Field */}
          <div>
            <label className="block text-xs font-black text-[#475569] uppercase tracking-wider mb-1.5">
              Edit Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#64748B]">
                <UserIcon className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="Enter your name"
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#E2E8F0] border-2 border-[#94A3B8] rounded-xl text-sm font-black text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
          </div>

          {/* Change Password Field */}
          <div>
            <label className="block text-xs font-black text-[#475569] uppercase tracking-wider mb-1.5">
              Change Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#64748B]">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError('');
                }}
                placeholder="Leave blank to keep current password"
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#E2E8F0] border-2 border-[#94A3B8] rounded-xl text-sm font-black text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] placeholder-[#64748B]"
              />
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-xs font-black text-[#475569] uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#64748B]">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                placeholder="Re-enter new password"
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#E2E8F0] border-2 border-[#94A3B8] rounded-xl text-sm font-black text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] placeholder-[#64748B]"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-[#FEE2E2] border-2 border-[#FCA5A5] rounded-xl text-xs font-black text-[#B91C1C] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-[#DCFCE7] border-2 border-[#86EFAC] rounded-xl text-xs font-black text-[#166534] flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-3 bg-[#E2E8F0] hover:bg-[#cbd5e1] text-[#1E293B] font-black text-xs sm:text-sm rounded-xl border-2 border-[#94A3B8] transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="py-3 px-3 bg-[#2563EB] hover:bg-[#1d4ed8] text-[#FFFFFF] font-black text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Profile</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
