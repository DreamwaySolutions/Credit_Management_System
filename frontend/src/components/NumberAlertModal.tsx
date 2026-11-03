import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface NumberAlertModalProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

export const NumberAlertModal: React.FC<NumberAlertModalProps> = ({
  type,
  message,
  onClose
}) => {
  const isSuccess = type === 'success';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FFFFFF] border-2 border-[#BCCED7] rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-center">
        
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-xl hover:bg-[#E2E8F0] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon Header */}
        <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border-2 shadow-2xs ${
          isSuccess
            ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#15803D]'
            : 'bg-[#FECDD3] border-[#FCA5A5] text-[#B91C1C]'
        }`}>
          {isSuccess ? (
            <CheckCircle2 className="w-8 h-8" />
          ) : (
            <AlertCircle className="w-8 h-8" />
          )}
        </div>

        {/* Status Heading */}
        <h3 className="text-xl font-black text-[#0F172A] mb-2 font-heading">
          {isSuccess ? 'Customer Number Updated' : 'Action Cannot Be Completed'}
        </h3>

        {/* Message Banner Card */}
        <div className={`border-2 rounded-2xl p-4 mb-5 text-center shadow-2xs ${
          isSuccess
            ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#166534]'
            : 'bg-[#FECDD3] border-[#FCA5A5] text-[#991B1B]'
        }`}>
          <p className="text-base font-black leading-snug">
            {message}
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className={`w-full py-3 px-4 font-black text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer ${
            isSuccess
              ? 'bg-[#059669] hover:bg-[#047857] text-[#FFFFFF]'
              : 'bg-[#2563EB] hover:bg-[#1d4ed8] text-[#FFFFFF]'
          }`}
        >
          OK
        </button>

      </div>
    </div>
  );
};
