import React, { useState } from 'react';
import { Calendar, RotateCcw, X } from 'lucide-react';

interface OperatingDateModalProps {
  currentOperatingDate: string; // YYYY-MM-DD
  onClose: () => void;
  onSelectDate: (dateStr: string) => void;
}

export const OperatingDateModal: React.FC<OperatingDateModalProps> = ({
  currentOperatingDate,
  onClose,
  onSelectDate
}) => {
  const todayIso = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(currentOperatingDate || todayIso);

  const handleApply = () => {
    if (!selectedDate) return;
    onSelectDate(selectedDate);
    onClose();
  };

  const handleResetToToday = () => {
    setSelectedDate(todayIso);
    onSelectDate(todayIso);
    onClose();
  };

  // Helper for quick date offsets
  const setDateOffset = (daysBack: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysBack);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const isCustomDate = selectedDate !== todayIso;

  const formattedDisplayDate = new Date(selectedDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FFFFFF] border-2 border-[#BCCED7] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative text-[#0F172A]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-xl hover:bg-[#E2E8F0] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b-2 border-[#E2E8F0] pb-3.5 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center text-[#2563EB] shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#0F172A] font-heading">
              Operating Date
            </h3>
            <p className="text-xs font-bold text-[#64748B]">
              Select the exact date to print reports & save daily records
            </p>
          </div>
        </div>

        {/* Selected Date Card */}
        <div className={`p-4 rounded-2xl border-2 mb-5 text-center transition-all ${
          isCustomDate
            ? 'bg-[#EFF6FF] border-[#38BDF8] text-[#1E3A8A]'
            : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A]'
        }`}>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">
            Selected Working Date
          </span>
          <div className="text-lg font-black font-heading mt-0.5">
            {formattedDisplayDate}
          </div>
          {isCustomDate && (
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-[#38BDF8] text-[#0F172A] text-[10px] font-black rounded-full uppercase tracking-wider">
              Custom Date Active
            </span>
          )}
        </div>

        {/* Date Selector Field */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-black text-[#475569] uppercase tracking-wider mb-1.5">
              Choose Custom Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full py-3 px-4 bg-[#E2E8F0] border-2 border-[#94A3B8] rounded-xl text-base font-black text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] cursor-pointer"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <label className="block text-[11px] font-black text-[#64748B] uppercase tracking-wider mb-2">
              Quick Shortcuts
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setDateOffset(0)}
                className="py-2 px-2 bg-[#E2E8F0] hover:bg-[#cbd5e1] border border-[#94A3B8] text-[#1E293B] font-extrabold text-xs rounded-xl transition-all cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDateOffset(1)}
                className="py-2 px-2 bg-[#E2E8F0] hover:bg-[#cbd5e1] border border-[#94A3B8] text-[#1E293B] font-extrabold text-xs rounded-xl transition-all cursor-pointer"
              >
                Yesterday
              </button>
              <button
                type="button"
                onClick={() => setDateOffset(2)}
                className="py-2 px-2 bg-[#E2E8F0] hover:bg-[#cbd5e1] border border-[#94A3B8] text-[#1E293B] font-extrabold text-xs rounded-xl transition-all cursor-pointer"
              >
                -2 Days
              </button>
              <button
                type="button"
                onClick={() => setDateOffset(3)}
                className="py-2 px-2 bg-[#E2E8F0] hover:bg-[#cbd5e1] border border-[#94A3B8] text-[#1E293B] font-extrabold text-xs rounded-xl transition-all cursor-pointer"
              >
                -3 Days
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleResetToToday}
            className="w-full py-3 px-3 bg-[#E2E8F0] hover:bg-[#cbd5e1] text-[#1E293B] font-black text-xs sm:text-sm rounded-xl border-2 border-[#94A3B8] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4 text-[#64748B]" />
            <span>Reset to Today</span>
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="w-full py-3 px-3 bg-[#2563EB] hover:bg-[#1d4ed8] text-[#FFFFFF] font-black text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center"
          >
            <span>Apply Operating Date</span>
          </button>
        </div>

      </div>
    </div>
  );
};
