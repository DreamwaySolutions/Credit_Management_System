import React, { useState } from 'react';
import { X, MinusCircle, CheckCircle } from 'lucide-react';
import { Chit, PaymentType } from '../types';

interface DeductModalProps {
  chit: Chit;
  customerName: string;
  onClose: () => void;
  onConfirm: (chitId: number, amount: number, paymentType: PaymentType) => void;
}

const PAYMENT_TYPES: PaymentType[] = ['UPI', 'Bank Transfer', 'Cheque'];

export const DeductModal: React.FC<DeductModalProps> = ({
  chit,
  customerName,
  onClose,
  onConfirm
}) => {
  const [amount, setAmount] = useState<string>('');
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType | ''>('');
  const [error, setError] = useState<string>('');

  const getRawNumber = (val: string): number => {
    const clean = val.replace(/\D/g, '');
    return clean ? parseInt(clean, 10) : 0;
  };

  const formatIndianNumber = (val: string): string => {
    const clean = val.replace(/\D/g, '');
    if (!clean) return '';
    return parseInt(clean, 10).toLocaleString('en-IN');
  };

  const numAmount = getRawNumber(amount);
  const isValidAmount = numAmount > 0 && numAmount <= chit.due_amount;
  const isFormValid = isValidAmount && selectedPaymentType !== '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidAmount) {
      if (numAmount > chit.due_amount) {
        setError(`Amount cannot exceed current due (₹ ${chit.due_amount.toLocaleString('en-IN')})`);
      } else {
        setError('Please enter a valid positive amount.');
      }
      return;
    }

    if (!selectedPaymentType) {
      setError('Please select a payment mode.');
      return;
    }

    onConfirm(chit.id, numAmount, selectedPaymentType as PaymentType);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FFFFFF] border-2 border-[#BCCED7] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-lg hover:bg-[#E2E8F0] transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 border-b border-[#E2E8F0] pb-3 mb-4">
          <MinusCircle className="w-7 h-7 text-[#2563EB]" />
          <div>
            <h3 className="text-xl font-extrabold text-[#0F172A] font-heading">
              Deduct Amount
            </h3>
            <p className="text-xs font-semibold text-[#64748B]">
              {customerName} • Chit #{chit.chit_number} (Due: ₹ {chit.due_amount.toLocaleString('en-IN')})
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Enter Amount Input */}
          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase mb-1.5">
              Enter Amount to Deduct
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-xl font-black text-[#2563EB]">
                ₹
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => {
                  setAmount(formatIndianNumber(e.target.value));
                  setError('');
                }}
                placeholder="Enter amount"
                autoFocus
                className="w-full pl-10 pr-4 py-3 bg-[#E2E8F0] border-2 border-[#94A3B8] rounded-xl text-xl font-bold text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] placeholder-[#64748B]"
              />
            </div>
          </div>

          {/* Payment Type Selection */}
          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase mb-2">
              Payment Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_TYPES.map((type) => {
                const isSelected = selectedPaymentType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setSelectedPaymentType(type);
                      setError('');
                    }}
                    className={`py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'bg-[#2563EB] border-[#2563EB] text-[#FFFFFF] shadow-sm scale-[1.02]'
                        : 'bg-[#E2E8F0] border-[#94A3B8] text-[#1E293B] hover:bg-[#cbd5e1]'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="p-3 bg-[#FEE2E2] border border-[#FCA5A5] rounded-lg text-xs font-bold text-[#B91C1C]">
              {error}
            </div>
          )}

          {/* Confirm Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-extrabold text-base transition-all shadow-md ${
                isFormValid
                  ? 'bg-[#2563EB] hover:bg-[#1d4ed8] text-[#FFFFFF] cursor-pointer active:scale-98'
                  : 'bg-[#E2E8F0] text-[#64748B] cursor-not-allowed border border-[#94A3B8]'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span>Confirm Deduction</span>
            </button>
            {!isFormValid && (
              <p className="text-[11px] text-center font-medium text-[#64748B] mt-2">
                Select payment method & enter amount to enable Confirm
              </p>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};
