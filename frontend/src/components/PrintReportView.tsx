import React from 'react';
import { Customer, Transaction } from '../types';
import { toTitleCase } from '../utils/formatters';

interface PrintReportViewProps {
  customers: Customer[];
  totalDue: number;
  collectedToday: number;
  collectedBreakdown: {
    Cash: number;
    UPI: number;
    Cheque: number;
    'Bank Transfer': number;
  };
  transactions: Transaction[];
  reportType: 'due' | 'collected';
  operatingDate?: string;
  lineName?: string;
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({
  customers,
  totalDue,
  collectedToday,
  collectedBreakdown,
  transactions,
  reportType,
  operatingDate,
  lineName
}) => {
  // Filter customers so ONLY customers with active chits for this report type are printed!
  // This prevents blank rows and eliminates paper waste when printing.
  const printableCustomers = customers.filter((cust) => {
    if (!cust.chits) return false;
    return cust.chits.some(
      (c) =>
        c.status === 'active' &&
        (reportType === 'due' ? c.type === 'due' || !c.type : c.type === 'collection')
    );
  });

  // 18 full-width customer rows per A4 page cleanly
  const itemsPerPage = 18;
  const totalPages = Math.max(1, Math.ceil(printableCustomers.length / itemsPerPage));
  const activeDate = operatingDate ? new Date(operatingDate) : new Date();
  const dateStr = activeDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div
      id="printable-report"
      className="hidden print:block bg-white text-[#0F172A] p-6 font-sans"
    >
      {printableCustomers.length === 0 ? (
        <div className="flex flex-col justify-between p-2 bg-white min-h-[400px]">
          <div>
            {/* Report Document Header */}
            <div className="text-center border-b-2 border-[#1B365D] pb-2 mb-3">
              <p className="text-xs sm:text-sm font-black text-[#1B365D] uppercase tracking-wider leading-normal">
                {lineName ? `${lineName.toUpperCase()} • ` : ''}{reportType === 'due' ? 'DUE REPORT' : 'COLLECTION REPORT'} • PAGE 1 OF 1 • DATE: {dateStr}
              </p>
            </div>

            {/* Zero Records / Cleared State Banner */}
            <div className="border border-[#CBD5E1] rounded-2xl p-8 text-center bg-[#F8FAFC] my-6">
              <div className="inline-block px-3.5 py-1.5 rounded-full bg-[#E2E8F0] text-[#334155] font-black text-xs uppercase tracking-wider mb-2">
                {lineName ? `${lineName} • ` : ''}{reportType === 'due' ? 'No Outstanding Dues' : 'No Collections Recorded'}
              </div>
              <p className="text-sm font-bold text-[#64748B]">
                All customer accounts are clear with ₹0 balance on {dateStr}.
              </p>
            </div>
          </div>

          {/* Footer Summary Section */}
          <div className="footer-summary break-inside-avoid border-t-2 border-[#1B365D] pt-2 mt-3">
            {reportType === 'due' ? (
              <div className="flex items-center justify-between bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-2.5">
                <div>
                  <div className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
                    TOTAL OUTSTANDING DUE
                  </div>
                  <div className="text-base font-black text-[#B91C1C] font-mono">
                    ₹ {totalDue.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-2.5">
                <div className="text-center p-1.5 bg-[#DCFCE7] border border-[#86EFAC] rounded-lg">
                  <div className="text-[8px] font-extrabold text-[#166534] uppercase tracking-wider mb-0.5 leading-tight">
                    COLLECTED TODAY
                  </div>
                  <div className="text-xs font-black text-[#15803D] font-mono">
                    ₹ {collectedToday.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-center p-1.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-lg">
                  <div className="text-[8px] font-extrabold text-[#64748B] uppercase tracking-wider mb-0.5 leading-tight">CASH</div>
                  <div className="text-xs font-black text-[#0F172A] font-mono">₹ {(collectedBreakdown.Cash || 0).toLocaleString('en-IN')}</div>
                </div>
                <div className="text-center p-1.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-lg">
                  <div className="text-[8px] font-extrabold text-[#64748B] uppercase tracking-wider mb-0.5 leading-tight">UPI</div>
                  <div className="text-xs font-black text-[#0F172A] font-mono">₹ {(collectedBreakdown.UPI || 0).toLocaleString('en-IN')}</div>
                </div>
                <div className="text-center p-1.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-lg">
                  <div className="text-[8px] font-extrabold text-[#64748B] uppercase tracking-wider mb-0.5 leading-tight">CHEQUE</div>
                  <div className="text-xs font-black text-[#0F172A] font-mono">₹ {(collectedBreakdown.Cheque || 0).toLocaleString('en-IN')}</div>
                </div>
                <div className="text-center p-1.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-lg">
                  <div className="text-[8px] font-extrabold text-[#64748B] uppercase tracking-wider mb-0.5 leading-tight">TRANSFER</div>
                  <div className="text-xs font-black text-[#0F172A] font-mono">₹ {(collectedBreakdown['Bank Transfer'] || 0).toLocaleString('en-IN')}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        Array.from({ length: totalPages }).map((_, pageIdx) => {
          const startIndex = pageIdx * itemsPerPage;
          const pageCustomers = printableCustomers.slice(startIndex, startIndex + itemsPerPage);
          const isLastPage = pageIdx === totalPages - 1;

          return (
            <div
              key={pageIdx}
              className={`flex flex-col justify-between p-2 bg-white ${
                pageIdx < totalPages - 1 ? 'page-break' : ''
              }`}
            >
              <div>
                {/* Report Document Header */}
                <div className="text-center border-b-2 border-[#1B365D] pb-2 mb-3">
                  <p className="text-xs sm:text-sm font-black text-[#1B365D] uppercase tracking-wider leading-normal">
                    {lineName ? `${lineName.toUpperCase()} • ` : ''}{reportType === 'due' ? 'DUE REPORT' : 'COLLECTION REPORT'} • PAGE {pageIdx + 1} OF {totalPages} • DATE: {dateStr}
                  </p>
                </div>

                {/* Full-Width Row Layout with simple divider lines */}
                <div className="border-t border-b border-[#CBD5E1] divide-y divide-[#CBD5E1]">
                  {pageCustomers.map((cust) => {
                    const displayChits = cust.chits
                      ? cust.chits.filter((c) =>
                          c.status === 'active' &&
                          (reportType === 'due' ? c.type === 'due' || !c.type : c.type === 'collection')
                        )
                      : [];

                    return (
                      <div
                        key={cust.id}
                        className="print-row-container flex items-center justify-between px-2 py-1.5 bg-white overflow-visible"
                      >
                        {/* Left Side: Customer Number & Name (Takes Max 45% Width) */}
                        <div className="flex items-center gap-2 shrink-0 pr-4 max-w-[45%]">
                          <span className="font-black text-xs text-[#0F172A] shrink-0">
                            {cust.customer_number}.
                          </span>
                          <span className="font-bold text-xs text-[#0F172A] leading-snug">
                            {toTitleCase(cust.name)}
                          </span>
                        </div>

                        {/* Right Side: All Display Chits in exact chronological entry order */}
                        <div className="grow flex items-center justify-start gap-1.5 flex-wrap pl-2">
                          {displayChits.length > 0 ? (
                            displayChits.map((c) => (
                              <span
                                key={c.id}
                                className="pdf-amount-pill"
                              >
                                <span className="pdf-amount-text">
                                  ₹{c.due_amount.toLocaleString('en-IN')}
                                </span>
                              </span>
                            ))
                          ) : (
                            <div className="w-full text-right">
                              <span className="text-[10px] font-bold text-[#64748B] italic px-2">
                                {reportType === 'due' ? 'Cleared' : '—'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            {/* Footer Summary Section on the Last Page */}
            {isLastPage && (
              <div className="footer-summary break-inside-avoid border-t-2 border-[#1B365D] pt-2 mt-3">
                {reportType === 'due' ? (
                  /* Due List: Render ONLY Total Due box */
                  <div className="flex items-center justify-between bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-2.5">
                    <div>
                      <div className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
                        TOTAL OUTSTANDING DUE
                      </div>
                      <div className="text-base font-black text-[#B91C1C] font-mono">
                        ₹ {totalDue.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Collected List: Render 5 collection summary boxes */
                  <div className="grid grid-cols-5 gap-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-2.5">
                    {/* Collected Today */}
                    <div className="text-center p-1.5 bg-[#DCFCE7] border border-[#86EFAC] rounded-lg">
                      <div className="text-[8px] font-extrabold text-[#166534] uppercase tracking-wider mb-0.5 leading-tight">
                        COLLECTED TODAY
                      </div>
                      <div className="text-xs font-black text-[#15803D] font-mono">
                        ₹ {collectedToday.toLocaleString('en-IN')}
                      </div>
                    </div>
                    {/* Cash */}
                    <div className="text-center p-1.5 bg-[#FEF3C7] border border-[#FDE68A] rounded-lg">
                      <div className="text-[8px] font-extrabold text-[#92400E] uppercase tracking-wider mb-0.5 leading-tight">
                        CASH
                      </div>
                      <div className="text-xs font-black text-[#92400E] font-mono">
                        ₹ {(collectedBreakdown.Cash || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    {/* UPI */}
                    <div className="text-center p-1.5 bg-[#EEF2FF] border border-[#C7D2FE] rounded-lg">
                      <div className="text-[8px] font-extrabold text-[#4338CA] uppercase tracking-wider mb-0.5 leading-tight">
                        UPI
                      </div>
                      <div className="text-xs font-black text-[#4338CA] font-mono">
                        ₹ {(collectedBreakdown.UPI || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    {/* Cheque */}
                    <div className="text-center p-1.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg">
                      <div className="text-[8px] font-extrabold text-[#475569] uppercase tracking-wider mb-0.5 leading-tight">
                        CHEQUE
                      </div>
                      <div className="text-xs font-black text-[#475569] font-mono">
                        ₹ {(collectedBreakdown.Cheque || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    {/* Bank Transfer */}
                    <div className="text-center p-1.5 bg-[#E0F2FE] border border-[#38BDF8] rounded-lg">
                      <div className="text-[8px] font-extrabold text-[#0369A1] uppercase tracking-wider mb-0.5 leading-tight">
                        BANK TRANSFER
                      </div>
                      <div className="text-xs font-black text-[#0369A1] font-mono">
                        ₹ {(collectedBreakdown['Bank Transfer'] || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        );
      }))}
    </div>
  );
};
