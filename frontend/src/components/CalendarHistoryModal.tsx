import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, X, ChevronLeft, ChevronRight, ArrowLeft, Printer, FileText, Clock, CheckCircle, Trash2, Edit2, Check } from 'lucide-react';
import { SavedRecord, Chit, LineType } from '../types';
import { toTitleCase, formatCurrency } from '../utils/formatters';

interface CalendarHistoryModalProps {
  records: SavedRecord[];
  activeView: 'due' | 'collected';
  operatingDate?: string;
  onClose: () => void;
  onPreviewRecord?: (record: SavedRecord, action: 'print' | 'pdf') => void;
  onDeleteRecord?: (recordId: string) => void;
  onEditRecordChit?: (recordId: string, customerNumber: number, chitId: number, newAmount: number) => void;
  onDeleteRecordChit?: (recordId: string, customerNumber: number, chitId: number) => void;
}

export const CalendarHistoryModal: React.FC<CalendarHistoryModalProps> = ({
  records,
  activeView,
  operatingDate,
  onClose,
  onPreviewRecord,
  onDeleteRecord,
  onEditRecordChit,
  onDeleteRecordChit
}) => {
  const [selectedType, setSelectedType] = useState<'due' | 'collected'>(activeView);
  
  // Current calendar view month/year state (defaults to operatingDate or current date)
  const initDateStr = operatingDate || new Date().toISOString().split('T')[0];
  const [initYear, initMonthNum] = initDateStr.split('-').map(Number);
  const initialYear = initYear || new Date().getFullYear();
  const initialMonth = initMonthNum ? initMonthNum - 1 : new Date().getMonth();

  const [currentYear, setCurrentYear] = useState<number>(initialYear);
  const [currentMonth, setCurrentMonth] = useState<number>(initialMonth);
  const [selectedDate, setSelectedDate] = useState<string>(initDateStr);

  // Selected specific record for full-card detail drilldown view
  const [activeDetailRecord, setActiveDetailRecord] = useState<SavedRecord | null>(null);
  const [deletingRecordTarget, setDeletingRecordTarget] = useState<SavedRecord | null>(null);

  // Edit / Delete State for specific chits inside Record Detail View
  const [editingChit, setEditingChit] = useState<{ recordId: string; customerNumber: number; customerName: string; chit: Chit } | null>(null);
  const [editAmountValue, setEditAmountValue] = useState<string>('');
  const [deletingChit, setDeletingChit] = useState<{ recordId: string; customerNumber: number; customerName: string; chitId: number; amount: number } | null>(null);
  const [isEditModeActive, setIsEditModeActive] = useState<boolean>(false);

  const handleSaveChitEdit = (recordId: string, custNum: number, chitId: number, newAmount: number) => {
    if (onEditRecordChit) {
      onEditRecordChit(recordId, custNum, chitId, newAmount);
    }
    // Update local activeDetailRecord state live
    setActiveDetailRecord((prev) => {
      if (!prev || prev.id !== recordId) return prev;
      const updatedCusts = prev.customers.map((c) => {
        if (c.customer_number !== custNum) return c;
        const updatedChits = c.chits.map((ch) =>
          ch.id === chitId ? { ...ch, due_amount: newAmount } : ch
        );
        return { ...c, chits: updatedChits };
      });
      const newTotal = updatedCusts.reduce(
        (tot, c) => tot + c.chits.reduce((sum, ch) => sum + (Number(ch.due_amount) || 0), 0),
        0
      );
      return { ...prev, totalAmount: newTotal, customers: updatedCusts };
    });
    setEditingChit(null);
  };

  const handleSaveChitDelete = (recordId: string, custNum: number, chitId: number) => {
    if (onDeleteRecordChit) {
      onDeleteRecordChit(recordId, custNum, chitId);
    }
    // Update local activeDetailRecord state live
    setActiveDetailRecord((prev) => {
      if (!prev || prev.id !== recordId) return prev;
      const updatedCusts = prev.customers
        .map((c) => {
          if (c.customer_number !== custNum) return c;
          const updatedChits = c.chits.filter((ch) => ch.id !== chitId);
          return { ...c, chits: updatedChits };
        })
        .filter((c) => c.chits.length > 0);

      const newTotal = updatedCusts.reduce(
        (tot, c) => tot + c.chits.reduce((sum, ch) => sum + (Number(ch.due_amount) || 0), 0),
        0
      );
      return { ...prev, totalAmount: newTotal, customers: updatedCusts };
    });
    setDeletingChit(null);
  };
  const yearOptions = useMemo(() => {
    const years = [];
    const baseYear = 2020;
    for (let y = baseYear; y <= 2035; y++) {
      years.push(y);
    }
    return years;
  }, []);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Month name formatting
  const monthName = new Date(currentYear, currentMonth, 1).toLocaleString('en-IN', {
    month: 'long'
  });

  // Calculate calendar grid days
  const calendarGrid = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const grid = [];

    // Overflow days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      grid.push({
        dayNum: daysInPrevMonth - i,
        isCurrentMonth: false,
        dateStr: ''
      });
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${currentYear}-${monthStr}-${dayStr}`;

      grid.push({
        dayNum: d,
        isCurrentMonth: true,
        dateStr
      });
    }

    // Fill remaining grid to complete 7-column rows
    const remaining = (7 - (grid.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      grid.push({
        dayNum: i,
        isCurrentMonth: false,
        dateStr: ''
      });
    }

    return grid;
  }, [currentYear, currentMonth]);

  // Set of dates that have saved records for selected type
  const savedDatesSet = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.type === selectedType) {
        set.add(r.date);
      }
    });
    return set;
  }, [records, selectedType]);

  // ALL saved records for the selectedDate and selectedType (handles multiple saves on same date!)
  const dateRecords = useMemo(() => {
    return records
      .filter((r) => r.type === selectedType && r.date === selectedDate)
      .sort((a, b) => new Date(b.savedAt || b.created_at || 0).getTime() - new Date(a.savedAt || a.created_at || 0).getTime());
  }, [records, selectedType, selectedDate]);

  const isDueMode = selectedType === 'due';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#0F172A]/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FFFFFF] border-2 border-[#BCCED7] rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col p-5 sm:p-7 shadow-2xl relative text-[#0F172A] overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#64748B] hover:text-[#0F172A] rounded-xl hover:bg-[#E2E8F0] transition-colors cursor-pointer z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {activeDetailRecord ? (
          /* Full Card Size View for Clicked Specific Record */
          <div className="flex-1 flex flex-col justify-between space-y-4 animate-fadeIn pt-1">
            
            {/* Detail Header with Top-Left Back Arrow */}
            <div className="flex items-center justify-between border-b border-[#CBD5E1] pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveDetailRecord(null)}
                  className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-[#FFFFFF] transition-all cursor-pointer flex items-center gap-2 font-black text-xs sm:text-sm shadow-xs active:scale-95"
                  title="Back to Calendar"
                >
                  <ArrowLeft className="w-4 h-4 text-[#FFFFFF]" />
                  <span>Back</span>
                </button>
                <div>
                  <span className="text-[10px] font-black uppercase text-[#64748B] tracking-wider">
                    Record Detail View
                  </span>
                  <h4 className="text-base sm:text-xl font-black text-[#0F172A] font-heading">
                    {new Date(activeDetailRecord.savedAt || activeDetailRecord.created_at || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • {new Date(selectedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </h4>
                </div>
              </div>

              <div className={`px-4 py-1.5 rounded-xl font-black text-xs sm:text-sm border shadow-2xs mr-8 ${
                isDueMode
                  ? 'bg-[#FECDD3] border-[#FCA5A5] text-[#991B1B]'
                  : 'bg-[#DCFCE7] border-[#86EFAC] text-[#166534]'
              }`}>
                {isDueMode ? '📋 Due List' : '💵 Collection List'}
                {activeDetailRecord.line && ` • ${activeDetailRecord.line}`}
              </div>
            </div>

            {/* Summary Statistics Pill & Edit/Delete Toggle Button */}
            <div className="flex items-center justify-between bg-[#F8FAFC] border-2 border-[#E2E8F0] p-4 rounded-2xl shrink-0 gap-4">
              <div className="flex items-center gap-6 sm:gap-10">
                <div>
                  <span className="text-[10px] font-black text-[#64748B] uppercase tracking-wider">
                    Total Customers
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-[#0F172A]">
                    {activeDetailRecord.customers.length} Customers
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-black text-[#64748B] uppercase tracking-wider">
                    Total Saved Amount
                  </span>
                  <div className="text-xl sm:text-2xl font-black font-mono text-[#0F172A]">
                    ₹ {formatCurrency(activeDetailRecord.totalAmount)}
                  </div>
                </div>
              </div>

              {/* Edit / Delete Mode Toggle Button */}
              <button
                type="button"
                onClick={() => setIsEditModeActive((prev) => !prev)}
                className={`px-3.5 py-2.5 rounded-xl font-black text-xs sm:text-sm border-2 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95 ${
                  isEditModeActive
                    ? 'bg-[#2563EB] text-[#FFFFFF] border-[#2563EB] shadow-md'
                    : 'bg-[#E2E8F0] hover:bg-[#cbd5e1] text-[#1E293B] border-[#94A3B8]'
                }`}
                title="Toggle Edit / Delete mode for chits"
              >
                <Edit2 className="w-4 h-4" />
                <span>{isEditModeActive ? 'Done Editing' : 'Edit / Delete'}</span>
              </button>
            </div>

            {/* Customer Records Table (Full card space) */}
            <div className="border-2 border-[#E2E8F0] rounded-2xl overflow-hidden bg-[#FFFFFF] flex-1 max-h-[340px] overflow-y-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#E2E8F0] text-[#475569] font-black uppercase sticky top-0">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Customer Name</th>
                    <th className="px-4 py-3 text-right">Chits / Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] font-bold">
                  {[...activeDetailRecord.customers]
                    .sort((a, b) => a.customer_number - b.customer_number)
                    .map((c) => {
                      return (
                        <tr key={c.customer_number} className="hover:bg-[#F1F5F9]">
                          <td className="px-4 py-3 text-[#64748B]">{c.customer_number}.</td>
                          <td className="px-4 py-3 text-[#0F172A]">{toTitleCase(c.name)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {c.chits.map((ch) => (
                                <div
                                  key={ch.id}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#CBD5E1] rounded-xl text-xs font-mono font-black text-[#0F172A] shadow-2xs transition-all"
                                >
                                  <span>₹{formatCurrency(ch.due_amount)}</span>
                                  
                                  {isEditModeActive && (
                                    <>
                                      {/* Edit Pencil Icon */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingChit({
                                            recordId: String(activeDetailRecord.id),
                                            customerNumber: c.customer_number,
                                            customerName: c.name,
                                            chit: ch as any
                                          });
                                          setEditAmountValue(formatCurrency(ch.due_amount));
                                        }}
                                        className="p-0.5 text-[#2563EB] hover:text-[#1d4ed8] hover:bg-[#DBEAFE] rounded-md transition-colors cursor-pointer"
                                        title="Edit Amount"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>

                                      {/* Delete Trash Icon */}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setDeletingChit({
                                            recordId: String(activeDetailRecord.id),
                                            customerNumber: c.customer_number,
                                            customerName: c.name,
                                            chitId: ch.id,
                                            amount: ch.due_amount
                                          })
                                        }
                                        className="p-0.5 text-[#DC2626] hover:text-[#991B1B] hover:bg-[#FEE2E2] rounded-md transition-colors cursor-pointer"
                                        title="Delete Amount"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Two Action Buttons: PDF and PRINT (side by side) */}
            {onPreviewRecord && (
              <div className="flex items-center gap-3 pt-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    onPreviewRecord(activeDetailRecord, 'pdf');
                    onClose();
                  }}
                  className="flex-1 py-3 px-4 bg-[#1E293B] hover:bg-[#0F172A] text-[#FFFFFF] font-black text-sm rounded-xl shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4 text-[#FFFFFF]" />
                  <span>Download PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onPreviewRecord(activeDetailRecord, 'print');
                    onClose();
                  }}
                  className="flex-1 py-3 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-[#FFFFFF] font-black text-sm rounded-xl shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4 text-[#FFFFFF]" />
                  <span>Print Report</span>
                </button>
              </div>
            )}

          </div>
        ) : (
          /* Standard 2-Column Calendar & Records List Layout */
          <>
            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-3 mb-4 shrink-0">
              <div className="w-11 h-11 rounded-2xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center text-[#2563EB] shrink-0">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] font-heading">
                  Daily Records Calendar
                </h3>
                <p className="text-xs font-semibold text-[#64748B]">
                  Select a date on the calendar to view and print past daily records
                </p>
              </div>
            </div>

            {/* Type Filter Switcher Tabs */}
            <div className="flex items-center gap-2 mb-4 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSelectedType('due');
                  setActiveDetailRecord(null);
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm border-2 transition-all cursor-pointer ${
                  isDueMode
                    ? 'bg-[#2563EB] text-[#FFFFFF] border-[#2563EB] shadow-sm'
                    : 'bg-[#E2E8F0] text-[#475569] border-[#94A3B8] hover:bg-[#cbd5e1]'
                }`}
              >
                📋 Due List Records
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedType('collected');
                  setActiveDetailRecord(null);
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm border-2 transition-all cursor-pointer ${
                  !isDueMode
                    ? 'bg-[#059669] text-[#FFFFFF] border-[#059669] shadow-sm'
                    : 'bg-[#E2E8F0] text-[#475569] border-[#94A3B8] hover:bg-[#cbd5e1]'
                }`}
              >
                💵 Collection Records
              </button>
            </div>

            {/* Main Body: Calendar Grid (Left) + Record Display Card (Right) */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-5 pr-1 items-stretch">
              
              {/* Left Side: Month & Year Calendar Grid Card */}
              <div className="md:col-span-5 bg-[#1E293B] text-[#FFFFFF] border-2 border-[#334155] rounded-2xl p-4 shadow-md flex flex-col justify-between self-start">
                
                {/* Month & Year Selection Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#334155]">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black tracking-wide font-heading">
                      {monthName}
                    </span>

                    {/* Available year dropdown range (2020 to 2035) */}
                    <select
                      value={currentYear}
                      onChange={(e) => setCurrentYear(Number(e.target.value))}
                      className="bg-[#334155] text-[#FFFFFF] border border-[#475569] rounded-lg px-2 py-0.5 text-xs font-black focus:outline-none focus:ring-1 focus:ring-[#38BDF8] cursor-pointer"
                    >
                      {yearOptions.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1.5 rounded-lg bg-[#334155] hover:bg-[#475569] text-[#FFFFFF] transition-colors cursor-pointer"
                      title="Previous Month"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1.5 rounded-lg bg-[#334155] hover:bg-[#475569] text-[#FFFFFF] transition-colors cursor-pointer"
                      title="Next Month"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Days of Week Headers */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-black text-[#94A3B8] uppercase mb-2">
                  <span>Su</span>
                  <span>Mo</span>
                  <span>Tu</span>
                  <span>We</span>
                  <span>Th</span>
                  <span>Fr</span>
                  <span>Sa</span>
                </div>

                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold">
                  {calendarGrid.map((cell, idx) => {
                    if (!cell.isCurrentMonth) {
                      return (
                        <div
                          key={idx}
                          className="py-2 text-[#475569] select-none"
                        >
                          {cell.dayNum}
                        </div>
                      );
                    }

                    const isSelected = selectedDate === cell.dateStr;
                    const hasRecord = savedDatesSet.has(cell.dateStr);

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedDate(cell.dateStr);
                          setActiveDetailRecord(null);
                        }}
                        className={`py-2 rounded-xl transition-all relative flex flex-col items-center justify-center font-extrabold cursor-pointer ${
                          isSelected
                            ? 'bg-[#38BDF8] text-[#0F172A] shadow-md scale-105 ring-2 ring-[#38BDF8]'
                            : hasRecord
                              ? 'bg-[#334155] text-[#38BDF8] hover:bg-[#475569]'
                              : 'hover:bg-[#334155] text-[#E2E8F0]'
                        }`}
                      >
                        <span>{cell.dayNum}</span>
                        {hasRecord && !isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-3 mt-3 border-t border-[#334155] flex items-center justify-between text-[11px] font-bold text-[#94A3B8]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                    <span>Saved Record</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] border border-[#0F172A]" />
                    <span>Selected</span>
                  </div>
                </div>

              </div>

              {/* Right Side: Records List for Selected Date */}
              <div className="md:col-span-7 bg-[#F8FAFC] border-2 border-[#CBD5E1] rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[360px]">
                
                <div className="flex-1 flex flex-col space-y-4">
                  
                  {/* Date Header */}
                  <div className="flex items-center justify-between border-b border-[#CBD5E1] pb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">
                        Selected Date Records
                      </span>
                      <h4 className="text-base sm:text-lg font-black text-[#0F172A] font-heading">
                        {new Date(selectedDate).toLocaleDateString('en-IN', {
                          weekday: 'long',
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl font-black text-xs bg-[#E2E8F0] border border-[#CBD5E1] text-[#334155]">
                        3 Route Lines
                      </span>
                      <div className={`px-3 py-1 rounded-xl font-black text-xs border ${
                        isDueMode
                          ? 'bg-[#FECDD3] border-[#FCA5A5] text-[#991B1B]'
                          : 'bg-[#DCFCE7] border-[#86EFAC] text-[#166534]'
                      }`}>
                        {isDueMode ? 'Due List' : 'Collection List'}
                      </div>
                    </div>
                  </div>

                  {/* Structured 3-Line List for Every Day (Line 1, Line 2, Line 3) */}
                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[300px]">
                    {[
                      { line: 'Line 1' as LineType, title: 'Route Line 1', badgeBg: 'bg-[#EFF6FF]', borderCol: 'border-[#BFDBFE]', textCol: 'text-[#1D4ED8]' },
                      { line: 'Line 2' as LineType, title: 'Route Line 2', badgeBg: 'bg-[#F5F3FF]', borderCol: 'border-[#DDD6FE]', textCol: 'text-[#6D28D9]' },
                      { line: 'Line 3' as LineType, title: 'Route Line 3', badgeBg: 'bg-[#F0FDFA]', borderCol: 'border-[#99F6E4]', textCol: 'text-[#0F766E]' }
                    ].map((route) => {
                      // Find the saved record for this specific line on the selected date
                      const lineRecord = dateRecords.find((r) => (r.line || 'Line 1') === route.line);
                      const hasRecord = !!lineRecord && lineRecord.customers && lineRecord.customers.length > 0;
                      const recordTime = lineRecord?.savedAt || lineRecord?.created_at
                        ? new Date(lineRecord.savedAt || lineRecord.created_at || '').toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : null;

                      const custCount = lineRecord ? lineRecord.customers.length : 0;
                      const totalAmt = lineRecord ? Number(lineRecord.totalAmount) || 0 : 0;

                      return (
                        <div
                          key={route.line}
                          className={`p-4 bg-[#FFFFFF] border-2 rounded-2xl transition-all shadow-sm flex flex-col gap-3 ${
                            hasRecord
                              ? 'border-[#CBD5E1] hover:border-[#2563EB] hover:shadow-md'
                              : 'border-[#E2E8F0] opacity-95'
                          }`}
                        >
                          {/* Top Header: Line Pill + Saved Time + Delete Button */}
                          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`px-3 py-1 rounded-xl font-black text-xs sm:text-sm border ${route.badgeBg} ${route.borderCol} ${route.textCol}`}
                              >
                                📍 {route.line}
                              </span>
                              <span className="text-xs font-bold text-[#64748B]">
                                {hasRecord ? (recordTime ? `Saved at ${recordTime}` : 'Recorded') : 'No entries recorded'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]">
                                {isDueMode ? 'Due' : 'Collection'}
                              </span>
                              {lineRecord && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingRecordTarget(lineRecord);
                                  }}
                                  className="p-1 text-[#DC2626] hover:text-[#991B1B] hover:bg-[#FEE2E2] border border-[#FCA5A5] rounded-lg transition-all cursor-pointer active:scale-95 shadow-2xs"
                                  title={`Delete ${route.line} Saved Record`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Metrics Row */}
                          <div className="grid grid-cols-2 gap-2.5 bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded-xl">
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-[#64748B] block mb-0.5">
                                Customers
                              </span>
                              <span className="text-sm sm:text-base font-black text-[#0F172A]">
                                {custCount} {custCount === 1 ? 'Customer' : 'Customers'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-[#64748B] block mb-0.5">
                                {isDueMode ? 'Total Due' : 'Total Collected'}
                              </span>
                              <span className="text-base sm:text-lg font-black font-mono text-[#2563EB]">
                                ₹ {formatCurrency(totalAmt)}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons Row: View Details, Download PDF, Print Report */}
                          <div className="flex items-center gap-2 pt-0.5">
                            {lineRecord && (
                              <button
                                type="button"
                                onClick={() => setActiveDetailRecord(lineRecord)}
                                className="flex-1 py-2 px-3 bg-[#2563EB] hover:bg-[#1d4ed8] text-[#FFFFFF] font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                              >
                                <span>View Details</span>
                                <span className="text-sm">→</span>
                              </button>
                            )}

                            {/* Direct PDF Button for this line */}
                            <button
                              type="button"
                              onClick={() => {
                                const recToExport: SavedRecord = lineRecord || {
                                  id: `${selectedType}_${selectedDate}_${route.line.replace(/\s+/g, '_')}`,
                                  date: selectedDate,
                                  type: selectedType,
                                  line: route.line,
                                  customerCount: 0,
                                  totalAmount: 0,
                                  customers: []
                                };
                                if (onPreviewRecord) {
                                  onPreviewRecord(recToExport, 'pdf');
                                  onClose();
                                }
                              }}
                              className={`py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 border ${
                                lineRecord
                                  ? 'bg-[#1E293B] hover:bg-[#0F172A] text-[#FFFFFF] border-[#1E293B]'
                                  : 'bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] border-[#CBD5E1]'
                              }`}
                              title={`Download ${route.line} PDF`}
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </button>

                            {/* Direct Print Button for this line */}
                            <button
                              type="button"
                              onClick={() => {
                                const recToExport: SavedRecord = lineRecord || {
                                  id: `${selectedType}_${selectedDate}_${route.line.replace(/\s+/g, '_')}`,
                                  date: selectedDate,
                                  type: selectedType,
                                  line: route.line,
                                  customerCount: 0,
                                  totalAmount: 0,
                                  customers: []
                                };
                                if (onPreviewRecord) {
                                  onPreviewRecord(recToExport, 'print');
                                  onClose();
                                }
                              }}
                              className={`py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 border ${
                                lineRecord
                                  ? 'bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#0F172A] border-[#94A3B8]'
                                  : 'bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] border-[#CBD5E1]'
                              }`}
                              title={`Print ${route.line}`}
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Print</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>

              </div>

            </div>
          </>
        )}

        {/* Edit Chit Modal for Record Detail View */}
        {editingChit && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-xs animate-fadeIn">
            <div className="bg-[#FFFFFF] border-2 border-[#BCCED7] rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-[#0F172A]">
              <button
                onClick={() => setEditingChit(null)}
                className="absolute top-4 right-4 p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-xl hover:bg-[#E2E8F0] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 border-b border-[#E2E8F0] pb-3 mb-4">
                <Edit2 className="w-6 h-6 text-[#2563EB]" />
                <h4 className="text-lg font-black font-heading text-[#0F172A]">Edit Chit Amount</h4>
              </div>

              <div className="mb-4">
                <span className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block mb-1">
                  Customer
                </span>
                <div className="text-sm font-black text-[#0F172A] bg-[#F1F5F9] p-2.5 rounded-xl border border-[#CBD5E1]">
                  {editingChit.customerNumber}. {toTitleCase(editingChit.customerName)}
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const clean = editAmountValue.replace(/\D/g, '');
                  const val = clean ? parseInt(clean, 10) : 0;
                  if (val > 0) {
                    handleSaveChitEdit(
                      editingChit.recordId,
                      editingChit.customerNumber,
                      editingChit.chit.id,
                      val
                    );
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-black text-[#475569] uppercase tracking-wider mb-1.5">
                    New Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-base font-black text-[#2563EB]">
                      ₹
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={editAmountValue}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, '');
                        setEditAmountValue(clean ? parseInt(clean, 10).toLocaleString('en-IN') : '');
                      }}
                      autoFocus
                      className="w-full pl-8 pr-3.5 py-2.5 bg-[#E2E8F0] border-2 border-[#94A3B8] rounded-xl text-base font-black text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditingChit(null)}
                    className="py-2.5 px-3 bg-[#E2E8F0] hover:bg-[#cbd5e1] text-[#1E293B] font-bold text-xs rounded-xl border border-[#94A3B8] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-3 bg-[#2563EB] hover:bg-[#1d4ed8] text-[#FFFFFF] font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Amount</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Chit Confirmation for Record Detail View */}
        {deletingChit && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-xs animate-fadeIn">
            <div className="bg-[#FFFFFF] border-2 border-[#BCCED7] rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-center text-[#0F172A]">
              <button
                onClick={() => setDeletingChit(null)}
                className="absolute top-4 right-4 p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-xl hover:bg-[#E2E8F0] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mx-auto w-12 h-12 bg-[#FECDD3] border border-[#FCA5A5] text-[#DC2626] rounded-2xl flex items-center justify-center mb-3">
                <Trash2 className="w-6 h-6" />
              </div>

              <h4 className="text-lg font-black font-heading text-[#0F172A] mb-1">Delete Chit Amount</h4>
              <p className="text-xs font-semibold text-[#64748B] mb-4">
                Are you sure you want to delete chit of{' '}
                <span className="font-black text-[#DC2626]">₹{formatCurrency(deletingChit.amount)}</span> for{' '}
                <span className="font-black text-[#0F172A]">{toTitleCase(deletingChit.customerName)}</span>?
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeletingChit(null)}
                  className="py-2.5 px-3 bg-[#E2E8F0] hover:bg-[#cbd5e1] text-[#1E293B] font-bold text-xs rounded-xl border border-[#94A3B8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSaveChitDelete(
                      deletingChit.recordId,
                      deletingChit.customerNumber,
                      deletingChit.chitId
                    )
                  }
                  className="py-2.5 px-3 bg-[#DC2626] hover:bg-[#b91c1c] text-[#FFFFFF] font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Chit</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Record Confirmation Modal */}
        {deletingRecordTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-xs animate-fadeIn">
            <div className="bg-[#FFFFFF] border-2 border-[#BCCED7] rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-[#0F172A]">
              <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#FEE2E2] border border-[#FCA5A5] flex items-center justify-center text-[#DC2626] shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-[#0F172A] font-heading">
                    Delete Saved Record?
                  </h4>
                  <p className="text-xs font-bold text-[#64748B]">
                    Saved at {new Date(deletingRecordTarget.savedAt || deletingRecordTarget.created_at || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <p className="text-sm font-extrabold text-[#1E293B] mb-5">
                Are you sure you want to delete this <span className="text-[#2563EB]">{deletingRecordTarget.type === 'due' ? 'Due List' : 'Collection List'}</span> record containing <span className="text-[#2563EB]">{deletingRecordTarget.customers.length} customers</span>? This action cannot be undone.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingRecordTarget(null)}
                  className="py-2.5 px-3 bg-[#E2E8F0] hover:bg-[#cbd5e1] text-[#1E293B] font-black text-xs sm:text-sm rounded-xl border border-[#94A3B8] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onDeleteRecord) {
                      onDeleteRecord(String(deletingRecordTarget.id));
                    }
                    if (activeDetailRecord?.id === deletingRecordTarget.id) {
                      setActiveDetailRecord(null);
                    }
                    setDeletingRecordTarget(null);
                  }}
                  className="py-2.5 px-3 bg-[#DC2626] hover:bg-[#b91c1c] text-[#FFFFFF] font-black text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Confirm Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
