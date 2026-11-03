import React, { useState, useMemo } from 'react';
import { X, History, Calendar } from 'lucide-react';
import { Transaction } from '../types';

interface HistoryModalProps {
  transactions: Transaction[];
  onClose: () => void;
  targetChitInfo?: { customerName?: string; chitNumber?: string | number };
}

type DateRangeFilter = 'TODAY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM DATE';

export const HistoryModal: React.FC<HistoryModalProps> = ({
  transactions,
  onClose,
  targetChitInfo
}) => {
  const [activeFilter, setActiveFilter] = useState<DateRangeFilter>('TODAY');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Filter transactions based on date range tab & optional chit scope
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return transactions.filter((tx) => {
      // Scope filter if opened for a specific chit
      if (targetChitInfo && targetChitInfo.customerName) {
        const matchesName = tx.customer_name.toLowerCase().includes(targetChitInfo.customerName.toLowerCase());
        const matchesChit = targetChitInfo.chitNumber ? String(tx.chit_number) === String(targetChitInfo.chitNumber) : true;
        if (!matchesName || !matchesChit) return false;
      }

      const txDateStr = new Date(tx.created_at).toISOString().split('T')[0];
      const txDate = new Date(tx.created_at);

      if (activeFilter === 'TODAY') {
        return txDateStr === todayStr;
      }

      if (activeFilter === 'WEEKLY') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return txDate >= oneWeekAgo && txDate <= now;
      }

      if (activeFilter === 'MONTHLY') {
        return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      }

      if (activeFilter === 'CUSTOM DATE') {
        if (!startDate && !endDate) return true;
        if (startDate && !endDate) return txDateStr >= startDate;
        if (!startDate && endDate) return txDateStr <= endDate;
        if (startDate && endDate) return txDateStr >= startDate && txDateStr <= endDate;
      }

      return true;
    });
  }, [transactions, activeFilter, startDate, endDate, targetChitInfo]);

  // Group transactions chronologically by Date (PhonePe-style Date Headers)
  const groupedTransactions = useMemo(() => {
    const groups: { [dateKey: string]: { dateKey: string; label: string; items: Transaction[] } } = {};
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    filteredTransactions.forEach((tx) => {
      const d = new Date(tx.created_at);
      const dateKey = d.toISOString().split('T')[0];

      if (!groups[dateKey]) {
        const formattedDateStr = d.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });

        let label = formattedDateStr;
        if (dateKey === todayStr) {
          label = `Today, ${formattedDateStr}`;
        } else if (dateKey === yesterdayStr) {
          label = `Yesterday, ${formattedDateStr}`;
        }

        groups[dateKey] = { dateKey, label, items: [] };
      }

      groups[dateKey].items.push(tx);
    });

    // Sort dates descending (newest date first)
    const sortedDateKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    return sortedDateKeys.map((key) => groups[key]);
  }, [filteredTransactions]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FFFFFF] border-2 border-[#BCCED7] rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-lg hover:bg-[#E2E8F0] transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-[#BCCED7] pb-4 mb-4">
          <div className="p-2.5 bg-[#E2E8F0] text-[#2563EB] rounded-xl border border-[#94A3B8]">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#0F172A] font-heading leading-tight">
              {targetChitInfo
                ? `History: ${targetChitInfo.customerName} (Chit #${targetChitInfo.chitNumber})`
                : 'Global Transaction & Audit History'}
            </h3>
            <p className="text-xs text-[#64748B] font-semibold mt-0.5">
              Track deductions, payments, and chit deletion records
            </p>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-4 bg-[#F8FAFC] p-2 border border-[#CBD5E1] rounded-xl">
          {(['TODAY', 'WEEKLY', 'MONTHLY', 'CUSTOM DATE'] as DateRangeFilter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeFilter === tab
                  ? 'bg-[#2563EB] text-[#FFFFFF] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Custom Date Pickers */}
        {activeFilter === 'CUSTOM DATE' && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-[#E2E8F0]/60 border border-[#94A3B8] rounded-xl">
            <Calendar className="w-4 h-4 text-[#2563EB]" />
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
              <span>From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2 py-1 bg-white border border-[#CBD5E1] rounded text-xs text-[#0F172A]"
              />
              <span>To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2 py-1 bg-white border border-[#CBD5E1] rounded text-xs text-[#0F172A]"
              />
            </div>
          </div>
        )}

        {/* Transactions List Grouped Chronologically by Date (PhonePe-Style) */}
        <div className="flex-1 overflow-y-auto pr-1">
          {groupedTransactions.length > 0 ? (
            <div className="space-y-4">
              {groupedTransactions.map((group, groupIdx) => (
                <div key={group.dateKey}>
                  {/* PhonePe-Style Date Header Component */}
                  <div className={`text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1 flex items-center gap-2 ${groupIdx > 0 ? 'mt-5' : 'mt-1'}`}>
                    <span>📅 {group.label}</span>
                    <div className="h-[1px] flex-1 bg-slate-200" />
                  </div>

                  {/* Transaction Cards for this Date Group */}
                  <div className="space-y-2.5">
                    {group.items.map((tx) => {
                      const isPayment = tx.type === 'payment';
                      const timeFormatted = new Date(tx.created_at).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      });

                      return (
                        <div
                          key={tx.id}
                          className={`p-3.5 border-2 rounded-xl flex items-center justify-between gap-3 shadow-2xs ${
                            isPayment
                              ? 'bg-[#F0FDF4] border-[#86EFAC]'
                              : 'bg-[#FEF2F2] border-[#FCA5A5]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-sm text-[#0F172A]">
                                {tx.customer_name}
                              </span>
                              {tx.chit_number !== undefined && tx.chit_number !== null && (
                                <span className="px-2 py-0.5 bg-[#E2E8F0] border border-[#CBD5E1] text-[#0F172A] rounded-full text-[10px] font-black">
                                  Chit #{tx.chit_number}
                                </span>
                              )}
                            </div>

                            <div className="text-xs text-[#64748B] font-semibold mt-0.5">
                              {isPayment ? (
                                <>Payment Mode: <strong className="text-[#0F172A]">{tx.payment_type}</strong></>
                              ) : (
                                <span className="text-[#B91C1C] font-bold">Chit Deleted with Remaining Due</span>
                              )}
                              <span className="mx-2">•</span>
                              <span className="text-[#475569] font-bold">{timeFormatted}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className={`text-base font-black font-mono ${
                              isPayment ? 'text-[#15803D]' : 'text-[#B91C1C]'
                            }`}>
                              {isPayment ? '-' : ''} ₹ {tx.amount.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] font-bold text-[#64748B]">
                              By {tx.created_by}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[#64748B]">
              <p className="text-sm font-bold">No transactions found for the selected period.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
