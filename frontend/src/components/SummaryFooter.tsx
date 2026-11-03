import React from 'react';
import { Printer, FileText, Trash2, Save, Calendar } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SummaryFooterProps {
  viewMode?: 'due' | 'collected';
  totalDue?: number;
  collectedToday: number;
  collectedBreakdown: {
    Cash: number;
    UPI: number;
    Cheque: number;
    'Bank Transfer': number;
  };
  onPrint: () => void;
  onDownloadPDF: () => void;
  onClearAllCollections?: () => void;
  onClearAllDues?: () => void;
  onSaveRecord?: () => void;
  onOpenCalendarHistory?: () => void;
}

export const SummaryFooter: React.FC<SummaryFooterProps> = ({
  viewMode = 'collected',
  totalDue = 0,
  collectedToday,
  collectedBreakdown,
  onPrint,
  onDownloadPDF,
  onClearAllCollections,
  onClearAllDues,
  onSaveRecord,
  onOpenCalendarHistory
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isDueView = viewMode === 'due';

  return (
    <footer className={`fixed bottom-0 left-0 right-0 z-40 border-t-2 transition-colors duration-200 px-4 py-3 md:px-8 ${
      isDark
        ? 'bg-[#16333A] border-[#234E57] shadow-2xl'
        : 'bg-[#FFFFFF] border-[#BCCED7] shadow-[0_-4px_12px_rgba(15,23,42,0.05)]'
    }`}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Summary Cards Section */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {isDueView ? (
            <>
              {/* Total Outstanding Due Box (Due View Mode) */}
              <div 
                className="border-2 rounded-2xl px-5 py-2 text-center min-w-[200px]"
                style={{ backgroundColor: '#FECDD3', borderColor: '#FCA5A5', color: '#991B1B' }}
              >
                <div className="text-[10px] font-black uppercase tracking-widest font-heading mb-0.5" style={{ color: '#991B1B' }}>
                  TOTAL OUTSTANDING DUE
                </div>
                <div className="text-xl sm:text-2xl font-black font-mono tracking-tight" style={{ color: '#7F1D1D' }}>
                  ₹ {totalDue.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Clear All Dues Box (Due View Mode) */}
              {onClearAllDues && (
                <button
                  type="button"
                  onClick={onClearAllDues}
                  title="Clear all today's dues"
                  className="border-2 rounded-2xl px-3.5 py-2 text-center min-w-[110px] cursor-pointer hover:bg-[#FECDD3] transition-all active:scale-95 shadow-2xs flex flex-col justify-center items-center"
                  style={{ backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', color: '#B91C1C' }}
                >
                  <div className="text-[10px] font-black uppercase tracking-widest font-heading mb-0.5" style={{ color: '#B91C1C' }}>
                    ACTIONS
                  </div>
                  <div className="text-xs sm:text-sm font-black tracking-wider uppercase flex items-center justify-center gap-1" style={{ color: '#B91C1C' }}>
                    <Trash2 className="w-4 h-4 text-[#B91C1C]" />
                    <span>Clear</span>
                  </div>
                </button>
              )}
            </>
          ) : (
            /* Collection Breakdown Summary Cards (Collected View Mode) */
            <>
              {/* Collected Today Box (Green Theme) */}
              <div 
                className="border-2 rounded-2xl px-3.5 py-2 text-center min-w-[125px]"
                style={{ backgroundColor: '#E8F8F0', borderColor: '#34D399', color: '#065F46' }}
              >
                <div className="text-[10px] font-black uppercase tracking-widest font-heading mb-0.5" style={{ color: '#065F46' }}>
                  COLLECTED TODAY
                </div>
                <div className="text-xl sm:text-2xl font-black font-mono tracking-tight" style={{ color: '#065F46' }}>
                  ₹ {collectedToday.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Cash Box (Neutral Slate Theme - Yellow background removed as requested) */}
              <div 
                className="border-2 rounded-2xl px-3.5 py-2 text-center min-w-[110px]"
                style={{ backgroundColor: '#F1F5F9', borderColor: '#94A3B8', color: '#334155' }}
              >
                <div className="text-[10px] font-black uppercase tracking-widest font-heading mb-0.5" style={{ color: '#334155' }}>
                  Cash
                </div>
                <div className="text-xl sm:text-2xl font-black font-mono tracking-tight" style={{ color: '#334155' }}>
                  ₹ {(collectedBreakdown.Cash || 0).toLocaleString('en-IN')}
                </div>
              </div>

              {/* UPI Box (Indigo Theme) */}
              <div 
                className="border-2 rounded-2xl px-3.5 py-2 text-center min-w-[110px]"
                style={{ backgroundColor: '#EEF2FF', borderColor: '#6366F1', color: '#3730A3' }}
              >
                <div className="text-[10px] font-black uppercase tracking-widest font-heading mb-0.5" style={{ color: '#3730A3' }}>
                  UPI
                </div>
                <div className="text-xl sm:text-2xl font-black font-mono tracking-tight" style={{ color: '#3730A3' }}>
                  ₹ {(collectedBreakdown.UPI || 0).toLocaleString('en-IN')}
                </div>
              </div>

              {/* Cheque Box (Slate Theme) */}
              <div 
                className="border-2 rounded-2xl px-3.5 py-2 text-center min-w-[110px]"
                style={{ backgroundColor: '#F1F5F9', borderColor: '#94A3B8', color: '#334155' }}
              >
                <div className="text-[10px] font-black uppercase tracking-widest font-heading mb-0.5" style={{ color: '#334155' }}>
                  Cheque
                </div>
                <div className="text-xl sm:text-2xl font-black font-mono tracking-tight" style={{ color: '#334155' }}>
                  ₹ {(collectedBreakdown.Cheque || 0).toLocaleString('en-IN')}
                </div>
              </div>

              {/* Bank Transfer Box (Cyan/Blue Theme) */}
              <div 
                className="border-2 rounded-2xl px-3.5 py-2 text-center min-w-[120px]"
                style={{ backgroundColor: '#E0F2FE', borderColor: '#38BDF8', color: '#0369A1' }}
              >
                <div className="text-[10px] font-black uppercase tracking-widest font-heading mb-0.5" style={{ color: '#0369A1' }}>
                  Bank Transfer
                </div>
                <div className="text-xl sm:text-2xl font-black font-mono tracking-tight" style={{ color: '#0369A1' }}>
                  ₹ {(collectedBreakdown['Bank Transfer'] || 0).toLocaleString('en-IN')}
                </div>
              </div>

              {/* Clear All Collections Box (Red Theme - Outer dimensions match metric cards) */}
              {onClearAllCollections && (
                <button
                  type="button"
                  onClick={onClearAllCollections}
                  title="Clear all today's collections"
                  className="border-2 rounded-2xl px-3.5 py-2 text-center min-w-[110px] cursor-pointer hover:bg-[#FECDD3] transition-all active:scale-95 shadow-2xs flex flex-col justify-center items-center"
                  style={{ backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', color: '#B91C1C' }}
                >
                  <div className="text-[10px] font-black uppercase tracking-widest font-heading mb-0.5" style={{ color: '#B91C1C' }}>
                    ACTIONS
                  </div>
                  <div className="text-xs sm:text-sm font-black tracking-wider uppercase flex items-center justify-center gap-1" style={{ color: '#B91C1C' }}>
                    <Trash2 className="w-4 h-4 text-[#B91C1C]" />
                    <span>Clear</span>
                  </div>
                </button>
              )}
            </>
          )}
        </div>

        {/* Action Buttons: SAVE | PDF | PRINT | CALENDAR */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          
          {/* Save Record Button (Blue Background) */}
          {onSaveRecord && (
            <button
              onClick={onSaveRecord}
              title="Save today's record snapshot"
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer bg-[#2563EB] hover:bg-[#1d4ed8] text-[#FFFFFF]"
            >
              <Save className="w-4 h-4 text-[#FFFFFF]" />
              <span>SAVE</span>
            </button>
          )}

          {/* Download PDF Button */}
          <button
            onClick={onDownloadPDF}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer ${
              isDark
                ? 'bg-[#1E4D56] hover:bg-[#234E57] border border-[#234E57] text-[#E8F8F5]'
                : 'bg-[#1E293B] hover:bg-[#0F172A] text-[#FFFFFF]'
            }`}
          >
            <FileText className={`w-4 h-4 ${isDark ? 'text-[#00A896]' : 'text-[#FFFFFF]'}`} />
            <span>PDF</span>
          </button>

          {/* Print Button */}
          <button
            onClick={onPrint}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer ${
              isDark
                ? 'bg-[#1E4D56] hover:bg-[#234E57] border border-[#234E57] text-[#E8F8F5]'
                : 'bg-[#1E293B] hover:bg-[#0F172A] text-[#FFFFFF]'
            }`}
          >
            <Printer className={`w-4 h-4 ${isDark ? 'text-[#00A896]' : 'text-[#FFFFFF]'}`} />
            <span>PRINT</span>
          </button>

          {/* Calendar History SVG Icon Button (Positioned right after PRINT button) */}
          {onOpenCalendarHistory && (
            <button
              onClick={onOpenCalendarHistory}
              title="View Calendar History Records"
              className="p-2.5 rounded-xl border-2 border-[#94A3B8] bg-[#E2E8F0] hover:bg-[#cbd5e1] text-[#1E293B] shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            >
              <Calendar className="w-5 h-5 text-[#2563EB]" />
            </button>
          )}

        </div>

      </div>
    </footer>
  );
};
