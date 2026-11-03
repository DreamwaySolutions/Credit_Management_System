import React from 'react';
import { UserPlus, FilePlus, UserMinus, Search, LogOut, Calendar, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
  searchTerm: string;
  activeView: 'due' | 'collected';
  selectedLine?: string | null;
  activeSearchNum: number | null;
  operatingDate: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit?: () => void;
  onClearSearch: () => void;
  onViewChange: (view: 'due' | 'collected') => void;
  onOpenAddCustomer: () => void;
  onOpenAddChit: () => void;
  onOpenDeleteCustomer: () => void;
  onOpenOperatingDateModal: () => void;
  onOpenProfile?: () => void;
  onBackToLines?: () => void;
  onGoToHome?: () => void;
  onOpenCalendarHistory?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchInputRef,
  searchTerm,
  activeView,
  selectedLine,
  activeSearchNum,
  operatingDate,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onViewChange,
  onOpenAddCustomer,
  onOpenAddChit,
  onOpenDeleteCustomer,
  onOpenOperatingDateModal,
  onOpenProfile,
  onBackToLines,
  onGoToHome,
  onOpenCalendarHistory
}) => {
  const { user, logout } = useAuth();

  // Dynamic user greeting: Welcome, Mr. [Username]
  const rawName = user
    ? user.role === 'superadmin'
      ? 'Super Admin'
      : user.name || user.username
    : 'Guest';
  
  const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const greetingText = `Welcome, Mr. ${formattedName}`;

  const todayIso = new Date().toISOString().split('T')[0];
  const isCustomDate = operatingDate !== todayIso;

  const formattedOperatingDate = new Date(operatingDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="w-full bg-[#FFFFFF] border-b-2 border-[#BCCED7] shadow-[0_4px_12px_rgba(15,23,42,0.05)] px-4 py-3.5 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-4">
        
        {/* Main Title & User Greeting Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-b border-[#BCCED7] pb-3">
          
          {/* Logo Branding (Clickable Home Button) */}
          <button
            type="button"
            onClick={onGoToHome}
            title="DREAMWAY Credit Management System - Return to Home"
            className="text-center md:text-left cursor-pointer transition-transform active:scale-95 text-left group bg-transparent border-0 p-0 focus:outline-none"
          >
            <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-none uppercase font-heading group-hover:opacity-90 transition-opacity">
              <span className="text-[#1B365D]">DREAM</span>
              <span className="text-[#1F90E6]">WAY</span>
            </h1>
            <h2 className="text-xs md:text-sm font-extrabold text-[#1F90E6] tracking-wider font-heading uppercase mt-0.5 group-hover:opacity-90 transition-opacity">
              CREDIT MANAGEMENT SYSTEM
            </h2>
          </button>

          <div className="flex items-center gap-2.5 self-end md:self-center flex-wrap">
            
            {/* Operating Date Calendar Button (Positioned directly before Welcome greeting) */}
            <button
              type="button"
              onClick={onOpenOperatingDateModal}
              title="Select Operating Date for Printing & Saving"
              className={`p-2.5 rounded-xl border-2 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                isCustomDate
                  ? 'bg-[#38BDF8] border-[#0284C7] text-[#0F172A] font-black'
                  : 'bg-[#E2E8F0] hover:bg-[#cbd5e1] border-[#94A3B8] text-[#1E293B]'
              }`}
            >
              <Calendar className="w-5 h-5 text-[#2563EB]" />
              {isCustomDate && (
                <span className="text-xs font-black uppercase tracking-wider">
                  {formattedOperatingDate}
                </span>
              )}
            </button>

            {/* Dynamic Greeting Text with font color #1B365D */}
            <div className="px-4 py-2 text-sm sm:text-base font-black rounded-xl border-2 border-[#94A3B8] bg-[#E2E8F0] shadow-2xs">
              <span className="text-[#1B365D] font-black">{greetingText}</span>
            </div>

            {/* Profile SVG Button (Positioned directly before Logout button) */}
            {user && (
              <button
                type="button"
                onClick={onOpenProfile}
                title="Edit Profile"
                className="p-2.5 rounded-xl border-2 border-[#94A3B8] bg-[#E2E8F0] text-[#1E293B] hover:text-[#2563EB] hover:bg-[#cbd5e1] transition-all active:scale-95 cursor-pointer flex items-center justify-center shadow-2xs"
              >
                <User className="w-5 h-5" />
              </button>
            )}

            {/* Logout Button */}
            {user && (
              <button
                onClick={logout}
                title="Logout"
                className="p-2.5 rounded-xl border-2 border-[#94A3B8] bg-[#E2E8F0] text-[#64748B] hover:text-[#B91C1C] transition-all active:scale-95 cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}

          </div>
        </div>

        {/* Top Action Bar */}
        {user && user.role !== 'superadmin' && (
          <div className="flex flex-col gap-2.5">

            {/* Main Action Bar: Add Customer | Add Chit | Delete Customer | Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
              
              {/* Add New Customer Button */}
              <div className="sm:col-span-3">
                <button
                  onClick={onOpenAddCustomer}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#E2E8F0] hover:bg-[#cbd5e1] border border-[#94A3B8] text-[#1E293B] font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-[#2563EB]" />
                  <span className="truncate">Add New Customer</span>
                </button>
              </div>

              {/* Add New Credit/Chit Button */}
              <div className="sm:col-span-3">
                <button
                  onClick={onOpenAddChit}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#E2E8F0] hover:bg-[#cbd5e1] border border-[#94A3B8] text-[#1E293B] font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                >
                  <FilePlus className="w-4 h-4 text-[#2563EB]" />
                  <span className="truncate">Add New Credit/Chit</span>
                </button>
              </div>

              {/* Delete a Customer Button */}
              <div className="sm:col-span-3">
                <button
                  onClick={onOpenDeleteCustomer}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#FEE2E2] hover:bg-[#fca5a5] border border-[#FCA5A5] text-[#B91C1C] font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                >
                  <UserMinus className="w-4 h-4 text-[#B91C1C]" />
                  <span className="truncate">Delete a Customer</span>
                </button>
              </div>

              {/* Search Input Box */}
              <div className="sm:col-span-3 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && onSearchSubmit) {
                      e.preventDefault();
                      onSearchSubmit();
                    }
                  }}
                  placeholder="Search (e.g. 1)"
                  className="w-full pl-9 pr-14 py-2.5 bg-[#E2E8F0] border border-[#94A3B8] rounded-xl text-xs sm:text-sm font-bold text-[#1E293B] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] shadow-xs transition-all"
                />
                {(searchTerm || activeSearchNum !== null) && (
                  <button
                    type="button"
                    onClick={onClearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] font-bold text-[#64748B] hover:text-[#2563EB] cursor-pointer"
                  >
                    CLEAR
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </header>
  );
};
