import React, { useState } from 'react';
import { X, Pencil, Check } from 'lucide-react';
import { Chit } from '../types';

interface EditChitModalProps {
  chit: Chit;
  customerName: string;
  onClose: () => void;
  onConfirm: (chitId: number, newDueAmount: number) => void;
}

export const EditChitModal: React.FC<EditChitModalProps> = ({
  chit,
  customerName,
  onClose,
  onConfirm
}) => {
  const [amount, setAmount] = useState<string>(
    chit.due_amount ? chit.due_amount.toLocaleString('en-IN') : ''
  );
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = getRawNumber(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      setError('Please enter a valid due amount.');
      return;
    }

    onConfirm(chit.id, numAmount);
  };

  const isCollectionMode = chit.type === 'collection';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FFFFFF] border-2 border-[#BCCED7] rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-[#0F172A]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-lg hover:bg-[#E2E8F0] transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 border-b border-[#E2E8F0] pb-3 mb-4">
          <Pencil className="w-7 h-7 text-[#2563EB]" />
          <div>
            <h3 className="text-xl font-extrabold text-[#0F172A] font-heading">
              {isCollectionMode ? 'Edit Collected Amount' : 'Edit Due Amount'}
            </h3>
            <p className="text-xs font-semibold text-[#64748B]">
              {customerName} • Chit #{chit.chit_number}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Amount Input */}
          <div>
            <label className="block text-xs font-black text-[#475569] uppercase tracking-wider mb-1.5">
              {isCollectionMode ? 'Collected Amount (₹)' : 'Due Amount (₹)'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-lg font-black text-[#2563EB]">
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
                placeholder="e.g. 5,000"
                autoFocus
                className="w-full pl-9 pr-3.5 py-3 bg-[#E2E8F0] border-2 border-[#94A3B8] rounded-xl text-lg font-black text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] placeholder-[#64748B]"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl text-xs font-bold text-[#B91C1C]">
              {error}
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-[#FFFFFF] font-black text-base rounded-xl shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <Check className="w-5 h-5 text-[#FFFFFF]" />
              <span>{isCollectionMode ? 'Update Collected Amount' : 'Update Due Amount'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
