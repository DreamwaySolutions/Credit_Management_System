import React from 'react';
import { ArrowLeft, MapPin, Users, IndianRupee, ChevronRight } from 'lucide-react';
import { Customer, LineType } from '../types';
import { formatCurrency } from '../utils/formatters';

interface LineSelectionViewProps {
  activeView: 'due' | 'collected';
  customers: Customer[];
  onSelectLine: (line: LineType) => void;
  onBackToHome: () => void;
}

export const LineSelectionView: React.FC<LineSelectionViewProps> = ({
  activeView,
  customers,
  onSelectLine,
  onBackToHome
}) => {
  const isDueMode = activeView === 'due';
  const lines: LineType[] = ['Line 1', 'Line 2', 'Line 3'];

  // Helper to calculate statistics per line
  const getLineStats = (line: LineType) => {
    let customerCount = 0;
    let totalAmount = 0;

    customers.forEach((c) => {
      const lineChits = (c.chits || []).filter((ch) => {
        if (ch.status !== 'active') return false;
        const matchesMode = isDueMode ? ch.type === 'due' || !ch.type : ch.type === 'collection';
        const chitLine = ch.line || 'Line 1';
        return matchesMode && chitLine === line;
      });

      if (lineChits.length > 0) {
        customerCount++;
        totalAmount += lineChits.reduce((sum, ch) => sum + (Number(ch.due_amount) || 0), 0);
      }
    });

    return { customerCount, totalAmount };
  };

  return (
    <div className="max-w-5xl mx-auto py-5 px-4 sm:px-6 w-full animate-fadeIn">
      {/* Sleek Top Bar with Back to Home button on the left and Mode Badge on the right */}
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={onBackToHome}
          className="px-4 py-2 bg-[#FFFFFF] hover:bg-[#E2E8F0] text-[#1E293B] border-2 border-[#94A3B8] rounded-xl font-extrabold text-xs sm:text-sm shadow-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#2563EB]" />
          <span>Back to Home</span>
        </button>

        <span className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border shadow-2xs ${
          isDueMode
            ? 'bg-[#DBEAFE] border-[#93C5FD] text-[#1D4ED8]'
            : 'bg-[#DCFCE7] border-[#86EFAC] text-[#15803D]'
        }`}>
          {isDueMode ? '📋 Due List' : '💵 Collected List'}
        </span>
      </div>

      {/* 3 Line Cards Grid - Brought directly to the top */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {lines.map((line, idx) => {
          const stats = getLineStats(line);
          const colorSchemes = [
            {
              border: 'hover:border-[#2563EB]',
              badgeBg: 'bg-[#DBEAFE]',
              badgeText: 'text-[#1D4ED8]',
              ring: 'group-hover:ring-[#2563EB]',
              btnBg: 'bg-[#2563EB] hover:bg-[#1D4ED8]'
            },
            {
              border: 'hover:border-[#059669]',
              badgeBg: 'bg-[#DCFCE7]',
              badgeText: 'text-[#15803D]',
              ring: 'group-hover:ring-[#059669]',
              btnBg: 'bg-[#059669] hover:bg-[#047857]'
            },
            {
              border: 'hover:border-[#7C3AED]',
              badgeBg: 'bg-[#EDE9FE]',
              badgeText: 'text-[#6D28D9]',
              ring: 'group-hover:ring-[#7C3AED]',
              btnBg: 'bg-[#7C3AED] hover:bg-[#6D28D9]'
            }
          ];
          const colors = colorSchemes[idx % colorSchemes.length];

          return (
            <div
              key={line}
              onClick={() => onSelectLine(line)}
              className={`bg-[#FFFFFF] border-2 border-[#CBD5E1] ${colors.border} rounded-3xl p-6 sm:p-7 shadow-md hover:shadow-2xl transition-all hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between group text-left relative overflow-hidden`}
            >
              {/* Top Accent Ribbon */}
              <div className="flex items-center justify-between mb-5">
                <div className={`w-12 h-12 rounded-2xl ${colors.badgeBg} flex items-center justify-center ${colors.badgeText} shadow-xs font-black text-xl`}>
                  <MapPin className="w-6 h-6" />
                </div>
                <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${colors.badgeBg} ${colors.badgeText} border border-current/20`}>
                  Route #{idx + 1}
                </span>
              </div>

              {/* Line Title */}
              <div className="mb-6">
                <h4 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-heading group-hover:text-[#1B365D] transition-colors">
                  {line}
                </h4>
              </div>

              {/* Quick Metrics */}
              <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-4 mb-6 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#475569]">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#64748B]" />
                    <span>Customers:</span>
                  </span>
                  <span className="font-black text-sm text-[#0F172A]">
                    {stats.customerCount}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-[#475569] pt-2 border-t border-[#E2E8F0]">
                  <span className="flex items-center gap-1.5">
                    <IndianRupee className="w-4 h-4 text-[#64748B]" />
                    <span>Total {isDueMode ? 'Due' : 'Collected'}:</span>
                  </span>
                  <span className="font-black font-mono text-base text-[#0F172A]">
                    ₹{formatCurrency(stats.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Enter Button */}
              <button
                type="button"
                className={`w-full py-3 px-4 ${colors.btnBg} text-[#FFFFFF] font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group-hover:gap-3 cursor-pointer`}
              >
                <span>Open {line}</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
