import React, { useState, useEffect } from 'react';
import { ChevronDown, AlertCircle, FilePlus, Edit3, Check, X } from 'lucide-react';
import { Customer, Chit } from '../types';
import { ChitCard } from './ChitCard';
import { toTitleCase } from '../utils/formatters';

interface CustomerCardProps {
  customer: Customer;
  viewMode?: 'due' | 'collected';
  selectedLine?: string | null;
  onEditDue?: (chit: Chit, customerName: string) => void;
  onDelete: (chit: Chit, customerName: string) => void;
  onAddChitForCustomer?: (customerId: number) => void;
  onUpdateCustomerName?: (customerId: number, newName: string) => void;
  onUpdateCustomerNumber?: (customerId: number, newNumber: number) => void;
  isInitiallyExpanded?: boolean;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  viewMode = 'collected',
  selectedLine,
  onEditDue,
  onDelete,
  onAddChitForCustomer,
  onUpdateCustomerName,
  onUpdateCustomerNumber,
  isInitiallyExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(customer.name);
  const [isEditingNumber, setIsEditingNumber] = useState(false);
  const [newNumberStr, setNewNumberStr] = useState(String(customer.customer_number));

  // Sync state when customer props update externally
  useEffect(() => {
    setNewName(customer.name);
  }, [customer.name]);

  useEffect(() => {
    setNewNumberStr(String(customer.customer_number));
  }, [customer.customer_number]);

  const handleSaveName = () => {
    if (!newName.trim()) return;
    if (onUpdateCustomerName) {
      onUpdateCustomerName(customer.id, newName.trim());
    }
    setIsEditing(false);
  };

  const handleSaveNumber = () => {
    const parsed = parseInt(newNumberStr.trim(), 10);
    if (isNaN(parsed) || parsed <= 0) return;
    if (onUpdateCustomerNumber) {
      onUpdateCustomerNumber(customer.id, parsed);
    }
    setIsEditingNumber(false);
  };

  // Automatically expand the dropdown accordion whenever a search is active
  useEffect(() => {
    if (isInitiallyExpanded) {
      setIsExpanded(true);
    }
  }, [isInitiallyExpanded]);

  const isDueView = viewMode === 'due';

  const activeChits = customer.chits
    ? customer.chits.filter(c =>
        c.status === 'active' &&
        (isDueView ? c.type === 'due' || !c.type : c.type === 'collection') &&
        (!selectedLine || (c.line || 'Line 1') === selectedLine)
      )
    : [];

  const formattedCustomerName = toTitleCase(customer.name);

  return (
    <div className="w-full bg-[#D4E5EC] border-2 border-[#BCCED7] rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.05)] hover:shadow-md transition-all duration-200 overflow-hidden mb-3.5">
      
      {/* Customer Header Container */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3.5 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer hover:bg-[#cbd5e1]/60 transition-colors select-none bg-[#D4E5EC]"
      >
        
        {/* Customer Number & Store Name */}
        <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
          {isEditingNumber ? (
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={newNumberStr}
                onChange={(e) => setNewNumberStr(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveNumber();
                  if (e.key === 'Escape') {
                    setNewNumberStr(String(customer.customer_number));
                    setIsEditingNumber(false);
                  }
                }}
                autoFocus
                className="w-16 sm:w-20 px-2 py-1 bg-[#FFFFFF] border-2 border-[#2563EB] rounded-xl text-sm font-black text-[#0F172A] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={handleSaveNumber}
                className="px-2.5 py-1 bg-[#2563EB] hover:bg-[#1d4ed8] text-[#FFFFFF] font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewNumberStr(String(customer.customer_number));
                  setIsEditingNumber(false);
                }}
                className="px-2.5 py-1 bg-[#E2E8F0] hover:bg-[#cbd5e1] border-2 border-[#BCCED7] text-[#1E293B] font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 group/num">
              <span className="text-base sm:text-lg font-bold text-[#334155] font-sans">
                {customer.customer_number}.
              </span>
              <button
                type="button"
                onClick={() => setIsEditingNumber(true)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] rounded hover:bg-[#cbd5e1]/80 transition-colors opacity-0 group-hover/num:opacity-100 focus:opacity-100 cursor-pointer"
                title="Edit Customer Number"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {isEditing ? (
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveName();
                  } else if (e.key === 'Escape') {
                    setNewName(customer.name);
                    setIsEditing(false);
                  }
                }}
                autoFocus
                className="w-[240px] xs:w-[320px] sm:w-[400px] px-3.5 py-1.5 bg-[#FFFFFF] border-2 border-[#94A3B8] rounded-xl text-sm sm:text-base font-black text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
              <button
                type="button"
                onClick={handleSaveName}
                className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-[#FFFFFF] font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewName(customer.name);
                  setIsEditing(false);
                }}
                className="px-3.5 py-1.5 bg-[#E2E8F0] hover:bg-[#cbd5e1] border-2 border-[#BCCED7] text-[#1E293B] font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h3 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight font-heading">
                {formattedCustomerName}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] rounded hover:bg-[#cbd5e1]/80 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                title="Edit Name"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right Controls: Badges + Dropdown Toggle Arrow */}
        <div className="flex items-center gap-3 self-end sm:self-center flex-wrap">
          
          {/* Active Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {activeChits.length > 0 ? (
              activeChits.map((chit) => (
                <div 
                  key={chit.id}
                  className={`px-3 py-1 border-2 font-extrabold text-xs sm:text-sm rounded-lg shadow-2xs font-mono ${
                    isDueView
                      ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#15803D]'
                      : 'bg-[#DCFCE7] border-[#86EFAC] text-[#15803D]'
                  }`}
                >
                  ₹ {chit.due_amount.toLocaleString('en-IN')}
                </div>
              ))
            ) : (
              <span className="text-xs font-bold text-[#64748B] italic bg-[#E2E8F0] px-2.5 py-0.5 rounded-md border border-[#94A3B8]">
                {isDueView ? 'No Active Dues' : 'No Collections'}
              </span>
            )}
          </div>

          {/* Dropdown Expand Toggle Arrow */}
          <button 
            type="button"
            aria-label="Toggle Cards"
            className={`p-1.5 rounded-lg border border-[#94A3B8] bg-[#E2E8F0] text-[#0F172A] shadow-2xs transition-transform duration-200 ${
              isExpanded ? 'rotate-180 bg-[#2563EB] border-[#2563EB] text-[#FFFFFF]' : ''
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* Expanded Accordion Area */}
      {isExpanded && (
        <div className="border-t border-[#BCCED7] bg-[#D4E5EC] p-4 sm:p-5 transition-all animate-slide-down">
          <div className="flex flex-wrap gap-4 items-stretch">
            
            {/* Existing Cards */}
            {activeChits.map((chit) => (
              <ChitCard
                key={chit.id}
                chit={chit}
                customerName={formattedCustomerName}
                viewMode={isDueView ? 'due' : 'collection'}
                onEditDue={onEditDue ? (c) => onEditDue(c, formattedCustomerName) : undefined}
                onDelete={(c) => onDelete(c, formattedCustomerName)}
              />
            ))}

            {/* Action Card to Enter Amount (Positioned to the right of existing cards) */}
            {onAddChitForCustomer && (
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChitForCustomer(customer.id);
                }}
                className={`border-2 border-dashed rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center min-w-[200px] sm:min-w-[220px] max-w-[250px] min-h-[150px] cursor-pointer group text-center self-stretch ${
                  isDueView
                    ? 'border-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE]'
                    : 'border-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE]'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white flex items-center justify-center mb-2 shadow-md group-hover:scale-110 transition-transform">
                  <FilePlus className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-extrabold text-[#1E3A8A] font-heading">
                  {isDueView ? '+ Add Credit/Chit' : '+ Enter Amount'}
                </h4>
                <p className="text-[11px] font-semibold text-[#3B82F6] mt-0.5 leading-tight">
                  {isDueView
                    ? `Add due chit for Customer #${customer.customer_number}`
                    : `Add collection for Customer #${customer.customer_number}`}
                </p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
