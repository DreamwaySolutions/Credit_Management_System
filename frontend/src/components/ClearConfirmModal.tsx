import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ClearConfirmModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export const ClearConfirmModal: React.FC<ClearConfirmModalProps> = ({
  onClose,
  onConfirm
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FFFFFF] border-2 border-[#BCCED7] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative text-center">
        
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-lg hover:bg-[#E2E8F0] transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Warning Icon */}
        <div className="mx-auto w-14 h-14 bg-[#FECDD3] border-2 border-[#FCA5A5] text-[#B91C1C] rounded-2xl flex items-center justify-center mb-4 shadow-2xs">
          <AlertTriangle className="w-8 h-8" />
        </div>

        {/* Confirmation Heading */}
        <h3 className="text-xl font-black text-[#0F172A] mb-3 font-heading">
          Clear All Collections
        </h3>

        {/* Message Box */}
        <div className="bg-[#FECDD3] border-2 border-[#FCA5A5] rounded-2xl p-4 sm:p-5 mb-6 text-center shadow-2xs">
          <p className="text-base sm:text-lg font-black text-[#0F172A] leading-snug">
            Are you sure you want to clear all entered collection cards for today?
          </p>
          <p className="text-xs font-bold text-[#991B1B] mt-2">
            This will reset today's collected bills so you can start fresh.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3.5">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 bg-[#E2E8F0] hover:bg-[#cbd5e1] text-[#1E293B] font-extrabold rounded-xl border-2 border-[#94A3B8] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="py-3 px-4 bg-[#B91C1C] hover:bg-[#991b1b] text-[#FFFFFF] font-black rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-[#FFFFFF]" />
            <span>Clear All</span>
          </button>
        </div>

      </div>
    </div>
  );
};
