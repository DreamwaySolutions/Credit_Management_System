import React from 'react';
import { FileText, DollarSign, Calendar, ArrowRight } from 'lucide-react';
import { Customer } from '../types';

interface HomeDashboardViewProps {
  customers: Customer[];
  onOpenDueLines: () => void;
  onOpenCollectedLines: () => void;
  onOpenCalendarHistory: () => void;
  operatingDate: string;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  onOpenDueLines,
  onOpenCollectedLines,
  onOpenCalendarHistory,
  operatingDate
}) => {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 w-full animate-fadeIn">
      {/* Main Choice Cards: Due List vs Collected List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* Card 1: Due List */}
        <div
          onClick={onOpenDueLines}
          className="bg-white border-2 border-[#CBD5E1] hover:border-[#2563EB] rounded-3xl p-7 sm:p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_45px_rgba(37,99,235,0.18)] transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between group text-left relative overflow-hidden"
        >
          {/* Subtle ambient background glow */}
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-blue-100/60 rounded-full blur-3xl group-hover:bg-blue-200/70 transition-all pointer-events-none" />

          <div>
            {/* Top Component: Icon and Route Badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 group-hover:shadow-blue-500/40 transition-all duration-300">
                <FileText className="w-7 h-7" />
              </div>
              
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-[#1D4ED8] border border-blue-200/80 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse"></span>
                <span>Lines 1, 2 & 3</span>
              </div>
            </div>

            {/* Title Component */}
            <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] font-heading group-hover:text-[#2563EB] transition-colors mb-5 tracking-tight flex items-center gap-2">
              <span className="text-lg sm:text-xl">📋</span>
              <span>Due List</span>
            </h3>
          </div>

          {/* Action CTA Button Component */}
          <div className="w-full py-3 px-4 bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#1E40AF] text-[#FFFFFF] font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-blue-500/20 group-hover:shadow-lg group-hover:shadow-blue-500/35 transition-all flex items-center justify-between">
            <span className="tracking-wide">Open Due List Lines</span>
            <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center transition-all duration-300 group-hover:translate-x-1 group-hover:bg-white/30">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Card 2: Collected List */}
        <div
          onClick={onOpenCollectedLines}
          className="bg-white border-2 border-[#CBD5E1] hover:border-[#059669] rounded-3xl p-7 sm:p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_45px_rgba(5,150,105,0.18)] transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between group text-left relative overflow-hidden"
        >
          {/* Subtle ambient background glow */}
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-emerald-100/60 rounded-full blur-3xl group-hover:bg-emerald-200/70 transition-all pointer-events-none" />

          <div>
            {/* Top Component: Icon and Route Badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#059669] to-[#047857] text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 group-hover:shadow-emerald-500/40 transition-all duration-300">
                <DollarSign className="w-7 h-7" />
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-[#15803D] border border-emerald-200/80 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse"></span>
                <span>Lines 1, 2 & 3</span>
              </div>
            </div>

            {/* Title Component */}
            <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] font-heading group-hover:text-[#059669] transition-colors mb-5 tracking-tight flex items-center gap-2">
              <span className="text-lg sm:text-xl">💵</span>
              <span>Collected List</span>
            </h3>
          </div>

          {/* Action CTA Button Component */}
          <div className="w-full py-3 px-4 bg-gradient-to-r from-[#059669] via-[#047857] to-[#065F46] text-[#FFFFFF] font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-500/20 group-hover:shadow-lg group-hover:shadow-emerald-500/35 transition-all flex items-center justify-between">
            <span className="tracking-wide">Open Collection Lines</span>
            <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center transition-all duration-300 group-hover:translate-x-1 group-hover:bg-white/30">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

      </div>

      {/* Daily Records Calendar Card (At the bottom of Due List and Collected List) */}
      <div
        onClick={onOpenCalendarHistory}
        className="bg-white border-2 border-[#CBD5E1] hover:border-[#7C3AED] rounded-2xl p-4 sm:p-5 shadow-[0_6px_20px_rgba(15,23,42,0.05)] hover:shadow-[0_12px_30px_rgba(124,58,237,0.15)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 group text-left relative overflow-hidden"
      >
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-purple-100/50 rounded-full blur-2xl group-hover:bg-purple-200/60 transition-all pointer-events-none" />

        <div className="flex items-center gap-3 sm:gap-4 relative z-10">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] text-white flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0 group-hover:scale-105 group-hover:shadow-purple-500/30 transition-all duration-300">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-[#6D28D9] border border-purple-200/70">
                Historical Archive
              </span>
              <span className="text-[11px] font-semibold text-[#64748B]">
                Operating Date: {operatingDate}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#0F172A] font-heading group-hover:text-[#7C3AED] transition-colors flex items-center gap-1.5">
              <span className="text-sm sm:text-base">📅</span>
              <span>Daily Records Calendar</span>
            </h3>
          </div>
        </div>

        <div className="w-full sm:w-auto px-4 py-2 sm:py-2.5 bg-gradient-to-r from-[#1E293B] to-[#0F172A] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-between sm:justify-center gap-2.5 shrink-0 relative z-10 group-hover:from-black group-hover:to-slate-900">
          <span>Open Calendar</span>
          <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center transition-all duration-300 group-hover:translate-x-1">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
