import React from 'react';
import { Save, AlertCircle, X } from 'lucide-react';

interface SaveConfirmModalProps {
  viewMode: 'due' | 'collected';
  activeCustomerCount: number;
  onClose: () => void;
  onConfirm: () => void;
}

export const SaveConfirmModal: React.FC<SaveConfirmModalProps> = ({
  viewMode,
  activeCustomerCount,
  onClose,
  onConfirm
}) => {
  const isDueMode = viewMode === 'due';
  const modeTitle = isDueMode ? 'Due List Record' : 'Collected List Record';
  const isEmpty = activeCustomerCount === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FFFFFF] border-2 border-[#BCCED7] rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-[#0F172A]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-lg hover:bg-[#E2E8F0] transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center text-[#2563EB] shrink-0">
            <Save className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#0F172A] font-heading">
              Save {modeTitle}
            </h3>
            <p className="text-xs font-semibold text-[#64748B]">
              Daily Record Snapshot
            </p>
          </div>
        </div>

        {/* Question Content or Empty Warning */}
        <div className="py-2 mb-4 text-left">
          {isEmpty ? (
            <div className="flex items-start gap-2.5 p-3.5 bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl text-xs font-bold text-[#B91C1C] mb-3">
              <AlertCircle className="w-5 h-5 text-[#B91C1C] shrink-0 mt-0.5" />
              <div>
                <span className="font-black text-sm block mb-0.5">Can't save empty list!</span>
                <span>Please add at least one customer {isDueMode ? 'due chit' : 'collection entry'} before saving today's record.</span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-2.5 p-3.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl text-sm font-bold text-[#1E3A8A] mb-3">
                <AlertCircle className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
                <span>Do you want to save today's {isDueMode ? 'due' : 'collected'} record ({activeCustomerCount} Customers)?</span>
              </div>
              <p className="text-xs font-medium text-[#64748B] leading-relaxed">
                Saving this record will store today's active customer entries so you can inspect past dates anytime in the calendar history viewer.
              </p>
            </>
          )}
        </div>

        {/* Action Buttons: Save & Cancel */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-[#E2E8F0] hover:bg-[#cbd5e1] border-2 border-[#BCCED7] text-[#1E293B] font-black text-sm rounded-xl transition-all active:scale-95 cursor-pointer"
          >
            {isEmpty ? 'Close' : 'Cancel'}
          </button>
          
          {!isEmpty && (
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 py-3 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-[#FFFFFF] font-black text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4 text-[#FFFFFF]" />
              <span>Save Record</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
