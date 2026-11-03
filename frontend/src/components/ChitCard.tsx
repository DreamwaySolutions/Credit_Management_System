import React from 'react';
import { Pencil, Trash2, Banknote } from 'lucide-react';
import { Chit } from '../types';
import { useTheme } from '../context/ThemeContext';

interface ChitCardProps {
  chit: Chit;
  customerName: string;
  viewMode?: 'due' | 'collection';
  onEditDue?: (chit: Chit) => void;
  onDelete: (chit: Chit) => void;
}

export const ChitCard: React.FC<ChitCardProps> = ({
  chit,
  customerName,
  viewMode = 'collection',
  onEditDue,
  onDelete
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isDueMode = viewMode === 'due' || chit.type === 'due';

  return (
    <div className={`border-2 rounded-2xl p-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-w-[280px] w-full max-w-[340px] relative overflow-hidden group ${
      isDark
        ? 'bg-[#16333A] border-[#234E57]'
        : 'bg-[#EAF4F8] border-[#A6C9DA]'
    }`}>
      
      {/* Decorative Top Line Accent */}
      <div className={`h-1.5 w-full absolute top-0 left-0 ${
        isDark
          ? 'bg-gradient-to-r from-[#00A896] via-[#4EEDC4] to-[#059669]'
          : isDueMode
            ? 'bg-[#93C5FD]'
            : 'bg-[#34D399]'
      }`} />

      {/* Card Header & Chit Number */}
      <div className={`text-center border-b pb-3 pt-1 mb-3 ${
        isDark ? 'border-[#234E57]' : 'border-[#BDD6E4]'
      }`}>
        {/* Top Badge Pill */}
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full shadow-xs mb-2 font-black tracking-wide border ${
          isDark
            ? 'bg-[#1E4D56] border-[#234E57] text-[#E8F8F5]'
            : 'bg-[#BFDBFE] border-[#93C5FD] text-[#1E3A8A]'
        }`}>
          <Banknote className={`w-4 h-4 ${isDark ? 'text-[#00A896]' : 'text-[#1E3A8A]'}`} />
          <h4 className="text-sm font-extrabold font-heading">
            CHIT #{chit.chit_number}
          </h4>
          {chit.line && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-1 ${
              isDark ? 'bg-black/30 text-white' : 'bg-white/60 text-[#1E3A8A]'
            }`}>
              {chit.line}
            </span>
          )}
        </div>

        {/* Store Subtitle Text */}
        <div className={`text-xs font-extrabold uppercase tracking-wider truncate max-w-[280px] mx-auto ${
          isDark ? 'text-[#85B3AC]' : 'text-[#475569]'
        }`}>
          {customerName}
        </div>
      </div>

      {/* Amount Section (DUE AMOUNT vs COLLECTED AMOUNT) */}
      <div className={`text-center py-3.5 px-4 mb-4 border-2 rounded-xl shadow-2xs transition-all ${
        isDark
          ? 'bg-[#1E4D56] border-[#234E57]'
          : isDueMode
            ? 'bg-[#FECDD3] border-[#FCA5A5]'
            : 'bg-[#DCFCE7] border-[#86EFAC]'
      }`}>
        <div className={`text-[11px] font-black uppercase tracking-widest font-heading mb-0.5 ${
          isDark
            ? isDueMode ? 'text-[#85B3AC]' : 'text-[#4EEDC4]'
            : isDueMode ? 'text-[#991B1B]' : 'text-[#166534]'
        }`}>
          {isDueMode ? 'DUE AMOUNT' : 'COLLECTED AMOUNT'}
        </div>
        <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
          isDark
            ? isDueMode ? 'text-[#FF7E67]' : 'text-[#34D399]'
            : isDueMode ? 'text-[#7F1D1D]' : 'text-[#15803D]'
        }`}>
          ₹ {chit.due_amount.toLocaleString('en-IN')}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-1">
        {/* Edit Button */}
        {onEditDue && (
          <button
            type="button"
            onClick={() => onEditDue(chit)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 font-black text-xs sm:text-sm rounded-xl shadow-xs active:scale-95 transition-all border cursor-pointer ${
              isDark
                ? 'bg-[#00A896] hover:bg-[#008f80] text-[#0D2329] border-[#00A896]'
                : isDueMode
                  ? 'bg-[#BFDBFE] hover:bg-[#93C5FD] border-[#93C5FD] text-[#1E3A8A]'
                  : 'bg-[#DCFCE7] hover:bg-[#86EFAC] border-[#86EFAC] text-[#166534]'
            }`}
          >
            <Pencil className={`w-4 h-4 ${isDark ? 'text-[#0D2329]' : isDueMode ? 'text-[#1E3A8A]' : 'text-[#166534]'}`} />
            <span>{isDueMode ? 'Edit Due Amount' : 'Edit Amount'}</span>
          </button>
        )}

        {/* Danger Delete Button */}
        <button
          type="button"
          onClick={() => onDelete(chit)}
          className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 font-extrabold text-xs rounded-xl border-2 transition-all active:scale-95 cursor-pointer ${
            isDark
              ? 'bg-[#1E4D56] hover:bg-[#234E57] border-[#234E57] text-[#FF7E67]'
              : 'bg-[#FEE2E2] hover:bg-[#FECDD3] border-[#FCA5A5] text-[#B91C1C]'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>

    </div>
  );
};


