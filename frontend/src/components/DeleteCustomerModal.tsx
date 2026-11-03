import React, { useState, useMemo } from 'react';
import { X, UserMinus, AlertTriangle, Trash2, Search } from 'lucide-react';
import { Customer } from '../types';
import { toTitleCase } from '../utils/formatters';

interface DeleteCustomerModalProps {
  customers: Customer[];
  onClose: () => void;
  onConfirm: (customerId: number) => void;
}

export const DeleteCustomerModal: React.FC<DeleteCustomerModalProps> = ({
  customers,
  onClose,
  onConfirm
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCustId, setSelectedCustId] = useState<number>(customers[0]?.id || 0);

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return customers;
    if (/^\d+$/.test(term)) {
      const num = parseInt(term, 10);
      const exact = customers.filter(c => c.customer_number === num);
      if (exact.length > 0) return exact;
      return customers.filter(c => c.customer_number.toString().includes(term) || c.name.toLowerCase().includes(term));
    }
    return customers.filter(c => c.name.toLowerCase().includes(term));
  }, [customers, searchTerm]);

  const selectedCustomer = customers.find(c => c.id === selectedCustId);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    const term = val.trim();
    if (/^\d+$/.test(term)) {
      const num = parseInt(term, 10);
      const match = customers.find(c => c.customer_number === num);
      if (match) {
        setSelectedCustId(match.id);
      }
    } else if (term) {
      const match = customers.find(c => c.name.toLowerCase().includes(term.toLowerCase()));
      if (match) {
        setSelectedCustId(match.id);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustId) return;
    onConfirm(selectedCustId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-xs animate-fadeIn">
      {/* Increased width by ~2-3 cm (max-w-lg / 512px) */}
      <div className="bg-[#FFFFFF] border-2 border-[#BCCED7] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative text-center">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-lg hover:bg-[#E2E8F0] transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Warning Icon */}
        <div className="mx-auto w-14 h-14 bg-[#FECDD3] border-2 border-[#FCA5A5] text-[#B91C1C] rounded-2xl flex items-center justify-center mb-4 shadow-2xs">
          <UserMinus className="w-8 h-8" />
        </div>

        {/* Confirmation Heading */}
        <h3 className="text-xl font-black text-[#0F172A] mb-1 font-heading">
          Delete a Customer
        </h3>
        <p className="text-xs font-semibold text-[#64748B] mb-5">
          Select customer card to remove from database
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          
          {/* Search Customer Input Bar */}
          <div>
            <label className="block text-xs font-black text-[#475569] uppercase tracking-wider mb-1.5">
              Search Customer Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Type Customer Number (e.g. 1)"
                autoFocus
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#E2E8F0] border-2 border-[#94A3B8] rounded-xl text-sm font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#B91C1C] placeholder-[#64748B]"
              />
            </div>
          </div>

          {/* Select Customer Dropdown */}
          <div>
            <label className="block text-xs font-black text-[#475569] uppercase tracking-wider mb-1.5">
              Select Customer to Delete
            </label>
            <select
              value={selectedCustId}
              onChange={(e) => setSelectedCustId(Number(e.target.value))}
              className="w-full py-3 px-3.5 bg-[#E2E8F0] border-2 border-[#94A3B8] rounded-xl text-sm font-black text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#B91C1C] cursor-pointer"
            >
              {filteredCustomers.map((c) => {
                const activeCount = c.chits ? c.chits.filter((ch) => ch.status === 'active').length : 0;
                return (
                  <option key={c.id} value={c.id}>
                    {c.customer_number}. {toTitleCase(c.name)} ({activeCount} Active Chit{activeCount === 1 ? '' : 's'})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Prompt Warning Message Box (Background #FECDD3, Title Case Name, No Underline) */}
          {selectedCustomer && (
            <div className="bg-[#FECDD3] border-2 border-[#FCA5A5] rounded-2xl p-4 sm:p-5 text-center shadow-2xs">
              <div className="flex justify-center mb-2">
                <AlertTriangle className="w-6 h-6 text-[#B91C1C]" />
              </div>
              <p className="text-base font-black text-[#0F172A] leading-snug">
                Are you sure you want to delete customer
              </p>
              <p className="text-lg font-black text-[#B91C1C] mt-1 font-heading">
                {selectedCustomer.customer_number}. {toTitleCase(selectedCustomer.name)}?
              </p>
              <p className="text-xs font-bold text-[#64748B] mt-2 border-t border-[#FCA5A5]/60 pt-2">
                All associated chits and transaction records will be permanently deleted.
              </p>
            </div>
          )}

          {/* Modal Action Buttons: Cancel / Confirm */}
          <div className="grid grid-cols-2 gap-3.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 bg-[#E2E8F0] hover:bg-[#cbd5e1] text-[#1E293B] font-extrabold rounded-xl border-2 border-[#94A3B8] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!selectedCustId}
              className="py-3 px-4 bg-[#B91C1C] hover:bg-[#991b1b] text-[#FFFFFF] font-black rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-[#FFFFFF]" />
              <span>Delete Customer</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
