import React, { useState } from 'react';
import { X, UserPlus, Check } from 'lucide-react';
import { Customer } from '../types';

interface CreateCustomerModalProps {
  customers: Customer[];
  nextCustomerNumber: number;
  onClose: () => void;
  onConfirm: (name: string, customerNumber?: number) => void;
}

export const CreateCustomerModal: React.FC<CreateCustomerModalProps> = ({
  customers,
  nextCustomerNumber,
  onClose,
  onConfirm
}) => {
  const [name, setName] = useState<string>('');
  const [customNum, setCustomNum] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter customer/store name.');
      return;
    }

    const num = customNum.trim() !== '' ? Number(customNum) : nextCustomerNumber;
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid customer number.');
      return;
    }

    // Duplicate customer number check
    const exists = customers.some(c => c.customer_number === num);
    if (exists) {
      setError(`Customer number #${num} already exists. Please enter a unique customer number.`);
      return;
    }

    onConfirm(name.trim(), num);
  };

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
          <UserPlus className="w-7 h-7 text-[#2563EB]" />
          <h3 className="text-xl font-extrabold text-[#0F172A] font-heading">
            Add New Customer
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          
          {/* Customer Name */}
          <div>
            <label className="block text-xs font-black text-[#475569] uppercase tracking-wider mb-1.5">
              Customer / Business Store Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g. Balaji General Stores"
              autoFocus
              className="w-full py-3 px-3.5 bg-[#E2E8F0] border-2 border-[#94A3B8] rounded-xl text-base font-black text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] placeholder-[#64748B]"
            />
          </div>

          {/* Customer Number (Default or Custom) */}
          <div>
            <label className="block text-xs font-black text-[#475569] uppercase tracking-wider mb-1.5">
              Customer Number (Default: #{nextCustomerNumber})
            </label>
            <input
              type="number"
              value={customNum}
              onChange={(e) => {
                setCustomNum(e.target.value);
                setError('');
              }}
              placeholder={`Default: #${nextCustomerNumber}`}
              min={1}
              className="w-full py-3 px-3.5 bg-[#E2E8F0] border-2 border-[#94A3B8] rounded-xl text-sm font-black text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] placeholder-[#64748B]"
            />
          </div>

          {error && (
            <div className="p-3 bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl text-xs font-bold text-[#B91C1C]">
              {error}
            </div>
          )}

          {/* Confirm Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-[#FFFFFF] font-black text-base rounded-xl shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <Check className="w-5 h-5 text-[#FFFFFF]" />
              <span>Add Customer</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
