import React, { useState, useRef } from 'react';
import { X, FilePlus, Check } from 'lucide-react';
import { Customer, PaymentType } from '../types';
import { toTitleCase } from '../utils/formatters';

interface CreateChitModalProps {
  customers: Customer[];
  selectedCustomerId?: number;
  viewMode?: 'due' | 'collected';
  initialLine?: string;
  onClose: () => void;
  onConfirm: (customerId: number, chitNumber: string | number | null, amount: number, paymentType: PaymentType, line?: string) => void;
}

const PAYMENT_TYPES: PaymentType[] = ['Cash', 'UPI', 'Bank Transfer', 'Cheque'];

export const CreateChitModal: React.FC<CreateChitModalProps> = ({
  customers,
  selectedCustomerId,
  viewMode = 'collected',
  initialLine = 'Line 1',
  onClose,
  onConfirm
}) => {
  const [custId, setCustId] = useState<number>(selectedCustomerId || (customers[0]?.id || 0));
  const [amount, setAmount] = useState<string>('');
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType>('Cash');
  const [selectedLine, setSelectedLine] = useState<string>(initialLine || 'Line 1');
  const [error, setError] = useState<string>('');

  const isDueMode = viewMode === 'due';
  const targetCust = customers.find(c => c.id === custId);

  // Focus Refs for Keyboard Navigation (Amount Input -> Payment Type Buttons -> Save Button)
  const amountInputRef = useRef<HTMLInputElement | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);
  const paymentTypeRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const getRawNumber = (val: string): number => {
    const clean = val.replace(/\D/g, '');
    return clean ? parseInt(clean, 10) : 0;
  };

  const formatIndianNumber = (val: string): string => {
    const clean = val.replace(/\D/g, '');
    if (!clean) return '';
    return parseInt(clean, 10).toLocaleString('en-IN');
  };

  const handleSaveWithPaymentType = (paymentType: PaymentType) => {
    const numAmount = getRawNumber(amount);
    if (!custId) {
      setError('Please select a customer.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError(isDueMode ? 'Please enter a valid due amount.' : 'Please enter a valid collection amount.');
      return;
    }

    onConfirm(custId, null, numAmount, paymentType, selectedLine);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveWithPaymentType(selectedPaymentType);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-5 bg-[#0F172A]/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FFFFFF] border-2 border-[#BCCED7] rounded-3xl max-w-md sm:max-w-lg w-full p-6 sm:p-7 shadow-2xl relative text-[#0F172A]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-xl hover:bg-[#E2E8F0] transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2.5 border-b-2 border-[#E2E8F0] pb-3.5 mb-5">
          <FilePlus className="w-7 h-7 text-[#2563EB]" />
          <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] font-heading">
            {isDueMode ? 'Enter Due Amount' : 'Enter Collection Amount'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 text-left">
          
          {/* Customer Info */}
          <div>
            <label className="block text-xs font-black text-[#475569] uppercase tracking-wider mb-1.5">
              Customer
            </label>
            {selectedCustomerId ? (
              <div className="w-full py-3 px-3.5 bg-[#E2E8F0] border-2 border-[#94A3B8] rounded-2xl text-sm sm:text-base font-black text-[#0F172A]">
                {targetCust ? `${targetCust.customer_number}. ${toTitleCase(targetCust.name)}` : 'Selected Customer'}
              </div>
            ) : (
              <select
                value={custId}
                onChange={(e) => {
                  setCustId(Number(e.target.value));
                  setError('');
                }}
                className="w-full py-3 px-3.5 bg-[#E2E8F0] border-2 border-[#94A3B8] rounded-2xl text-sm sm:text-base font-black text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] cursor-pointer"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.customer_number}. {toTitleCase(c.name)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-black text-[#475569] uppercase tracking-wider mb-1.5">
              {isDueMode ? 'Due Amount (₹)' : 'Collected Amount (₹)'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-lg font-black text-[#2563EB]">
                ₹
              </span>
              <input
                ref={amountInputRef}
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => {
                  setAmount(formatIndianNumber(e.target.value));
                  setError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (isDueMode) {
                      e.preventDefault();
                      handleSubmit(e);
                    } else {
                      e.preventDefault();
                      const idx = PAYMENT_TYPES.indexOf(selectedPaymentType);
                      const targetIdx = idx !== -1 ? idx : 0;
                      paymentTypeRefs.current[targetIdx]?.focus();
                    }
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (!isDueMode) {
                      const idx = PAYMENT_TYPES.indexOf(selectedPaymentType);
                      const targetIdx = idx !== -1 ? idx : 0;
                      paymentTypeRefs.current[targetIdx]?.focus();
                    } else {
                      submitButtonRef.current?.focus();
                    }
                  }
                }}
                placeholder="e.g. 10,000"
                autoFocus
                className="w-full pl-9 pr-3.5 py-3 bg-[#E2E8F0] border-2 border-[#94A3B8] rounded-2xl text-lg sm:text-xl font-black text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] placeholder-[#64748B]"
              />
            </div>
          </div>

          {/* Payment Type Selection (Only rendered in Collection Mode) */}
          {!isDueMode && (
            <div>
              <label className="block text-xs font-black text-[#475569] uppercase tracking-wider mb-2">
                Payment Type <span className="text-[10px] font-bold text-[#64748B] lowercase">(use ← → to select, Enter to save)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PAYMENT_TYPES.map((type, idx) => {
                  const isSelected = selectedPaymentType === type;
                  return (
                    <button
                      key={type}
                      ref={(el) => (paymentTypeRefs.current[idx] = el)}
                      type="button"
                      onClick={() => {
                        setSelectedPaymentType(type);
                        setError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          setSelectedPaymentType(type);
                          handleSaveWithPaymentType(type);
                        } else if (e.key === 'ArrowRight') {
                          e.preventDefault();
                          const nextIdx = (idx + 1) % PAYMENT_TYPES.length;
                          setSelectedPaymentType(PAYMENT_TYPES[nextIdx]);
                          paymentTypeRefs.current[nextIdx]?.focus();
                        } else if (e.key === 'ArrowLeft') {
                          e.preventDefault();
                          const prevIdx = (idx - 1 + PAYMENT_TYPES.length) % PAYMENT_TYPES.length;
                          setSelectedPaymentType(PAYMENT_TYPES[prevIdx]);
                          paymentTypeRefs.current[prevIdx]?.focus();
                        } else if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          submitButtonRef.current?.focus();
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          amountInputRef.current?.focus();
                        }
                      }}
                      className={`py-2.5 px-2 text-xs sm:text-sm font-black rounded-2xl border-2 transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#38BDF8] ${
                        isSelected
                          ? 'bg-[#2563EB] border-[#2563EB] text-[#FFFFFF] shadow-md scale-[1.02]'
                          : 'bg-[#E2E8F0] border-[#94A3B8] text-[#1E293B] hover:bg-[#cbd5e1]'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>
          )}


          {error && (
            <div className="p-3 bg-[#FEE2E2] border-2 border-[#FCA5A5] rounded-2xl text-xs font-black text-[#B91C1C]">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2">
            <button
              ref={submitButtonRef}
              type="submit"
              onKeyDown={(e) => {
                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  if (!isDueMode) {
                    const idx = PAYMENT_TYPES.indexOf(selectedPaymentType);
                    const targetIdx = idx !== -1 ? idx : 0;
                    paymentTypeRefs.current[targetIdx]?.focus();
                  } else {
                    amountInputRef.current?.focus();
                  }
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-[#FFFFFF] font-black text-base sm:text-lg rounded-2xl shadow-md transition-all active:scale-98 cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#38BDF8]"
            >
              <Check className="w-5 h-5 text-[#FFFFFF]" />
              <span>{isDueMode ? 'Save Due Chit' : 'Save Collection Card'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
