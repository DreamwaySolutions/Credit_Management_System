import React from 'react';
import { X, Printer, FileText, CheckCircle, MapPin } from 'lucide-react';
import { LineType } from '../types';

interface PrintLineModalProps {
  action: 'print' | 'pdf';
  activeView: 'due' | 'collected';
  currentLine: LineType | null;
  onSelectLine: (line: LineType | 'all') => void;
  onClose: () => void;
}

export const PrintLineModal: React.FC<PrintLineModalProps> = ({
  action,
  activeView,
  currentLine,
  onSelectLine,
  onClose
}) => {
  const isPrint = action === 'print';
  const isDueMode = activeView === 'due';
  const lines: LineType[] = ['Line 1', 'Line 2', 'Line 3'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-xs animate-fadeIn text-left">
      <div className="bg-[#FFFFFF] border-2 border-[#BCCED7] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative text-[#0F172A]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#64748B] hover:text-[#0F172A] rounded-xl hover:bg-[#E2E8F0] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 border-b border-[#CBD5E1] pb-4 mb-5">
          <div className="p-3 bg-[#DBEAFE] text-[#2563EB] rounded-2xl border border-[#BFDBFE]">
            {isPrint ? <Printer className="w-6 h-6 text-[#2563EB]" /> : <FileText className="w-6 h-6 text-[#2563EB]" />}
          </div>
          <div>
            <h3 className="text-xl font-black font-heading text-[#0F172A]">
              {isPrint ? 'Print Statement' : 'Export PDF Report'}
            </h3>
          </div>
        </div>

        {/* Line Options Buttons */}
        <div className="space-y-3 mb-6">
          {lines.map((line) => {
            const isCurrent = currentLine === line;

            return (
              <button
                key={line}
                type="button"
                onClick={() => {
                  onSelectLine(line);
                  onClose();
                }}
                className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer group active:scale-98 ${
                  isCurrent
                    ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1E3A8A] shadow-sm'
                    : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#2563EB] hover:bg-[#FFFFFF] text-[#0F172A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                    isCurrent ? 'bg-[#2563EB] text-[#FFFFFF]' : 'bg-[#E2E8F0] text-[#475569] group-hover:bg-[#DBEAFE] group-hover:text-[#2563EB]'
                  }`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-base font-black font-heading">
                      {line}
                    </span>
                  </div>
                </div>

                {isCurrent && (
                  <span className="px-2.5 py-1 bg-[#2563EB] text-[#FFFFFF] text-[10px] font-black uppercase rounded-lg">
                    Active
                  </span>
                )}
              </button>
            );
          })}

          {/* All Lines (Combined) Option */}
          <button
            type="button"
            onClick={() => {
              onSelectLine('all');
              onClose();
            }}
            className="w-full p-4 rounded-2xl border-2 border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#059669] hover:bg-[#FFFFFF] text-[#0F172A] transition-all flex items-center justify-between cursor-pointer group active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E2E8F0] group-hover:bg-[#DCFCE7] text-[#475569] group-hover:text-[#15803D] flex items-center justify-center font-black text-sm">
                🌐
              </div>
              <div>
                <span className="block text-base font-black font-heading">
                  All Lines (Combined)
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 text-xs font-black text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer text-center"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
