import React, { useState, useEffect, useMemo } from 'react';
import html2pdf from 'html2pdf.js';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Customer, Chit, Transaction, PaymentType, SavedRecord, LineType } from './types';
import {
  fetchCustomersApi,
  createCustomerApi,
  updateCustomerApi,
  deleteCustomerApi,
  createChitApi,
  updateChitApi,
  deleteChitApi,
  deductPaymentApi,
  fetchSavedRecordsApi,
  createSavedRecordApi,
  deleteSavedRecordApi,
  editRecordChitApi,
  deleteRecordChitApi,
  fetchTransactionsApi,
  clearCollectionChitsApi,
  clearDueChitsApi
} from './api/client';
import { Header } from './components/Header';
import { CustomerCard } from './components/CustomerCard';
import { DeductModal } from './components/DeductModal';
import { EditChitModal } from './components/EditChitModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ClearConfirmModal } from './components/ClearConfirmModal';
import { SaveConfirmModal } from './components/SaveConfirmModal';
import { CalendarHistoryModal } from './components/CalendarHistoryModal';
import { CreateChitModal } from './components/CreateChitModal';
import { CreateCustomerModal } from './components/CreateCustomerModal';
import { DeleteCustomerModal } from './components/DeleteCustomerModal';
import { HistoryModal } from './components/HistoryModal';
import { SummaryFooter } from './components/SummaryFooter';
import { PrintReportView } from './components/PrintReportView';
import { LoginModal } from './components/LoginModal';
import { LoginPage } from './components/LoginPage';
import { SuperAdminPanel } from './components/SuperAdminPanel';
import { NumberAlertModal } from './components/NumberAlertModal';
import { OperatingDateModal } from './components/OperatingDateModal';
import { ProfileModal } from './components/ProfileModal';
import { Footer } from './components/Footer';
import { HomeDashboardView } from './components/HomeDashboardView';
import { LineSelectionView } from './components/LineSelectionView';
import { PrintLineModal } from './components/PrintLineModal';
import { toTitleCase, formatCurrency } from './utils/formatters';
import { FileText, CheckCircle, X, ArrowLeft, MapPin } from 'lucide-react';

// Dashboard component containing all dashboard state and hooks
function DashboardContent() {
  const { user } = useAuth();
  const { theme } = useTheme();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savedRecords, setSavedRecords] = useState<SavedRecord[]>([]);

  // Pure Database API fetcher
  const loadDataFromDb = async () => {
    try {
      const [custData, recordsData, txData] = await Promise.all([
        fetchCustomersApi(),
        fetchSavedRecordsApi(),
        fetchTransactionsApi()
      ]);
      setCustomers(custData || []);
      setSavedRecords(recordsData || []);
      setTransactions(txData || []);
    } catch (err) {
      console.error('Error fetching database data:', err);
    }
  };

  useEffect(() => {
    loadDataFromDb();
  }, [user?.id]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeSearchNum, setActiveSearchNum] = useState<number | null>(null);

  // Active Modals State
  const [deductTarget, setDeductTarget] = useState<{ chit: Chit; customerName: string } | null>(null);
  const [editTarget, setEditTarget] = useState<{ chit: Chit; customerName: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ chit: Chit; customerName: string } | null>(null);
  const [historyTarget, setHistoryTarget] = useState<{ customerName?: string; chitNumber?: string | number } | null>(null);
  const [isAddChitOpen, setIsAddChitOpen] = useState<boolean>(false);
  const [selectedCustForChit, setSelectedCustForChit] = useState<number | undefined>(undefined);
  const [isAddCustOpen, setIsAddCustOpen] = useState<boolean>(false);
  const [isDeleteCustOpen, setIsDeleteCustOpen] = useState<boolean>(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState<boolean>(false);
  const [isClearDueConfirmOpen, setIsClearDueConfirmOpen] = useState<boolean>(false);
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState<boolean>(false);
  const [isCalendarHistoryOpen, setIsCalendarHistoryOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [exportMode, setExportMode] = useState<{ action: 'pdf' | 'print' } | null>(null);
  const [reportType, setReportType] = useState<'due' | 'collected'>('due');
  const [numberAlert, setNumberAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeHistoricalRecord, setActiveHistoricalRecord] = useState<SavedRecord | null>(null);
  const [operatingDate, setOperatingDate] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
  const [isOperatingDateOpen, setIsOperatingDateOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  const [activeView, setActiveView] = useState<'due' | 'collected'>('due');
  const [selectedLine, setSelectedLine] = useState<LineType | null>(null);
  const [currentScreen, setCurrentScreen] = useState<'home' | 'lines' | 'workspace'>('home');
  const [printLineModalAction, setPrintLineModalAction] = useState<'print' | 'pdf' | null>(null);
  const [selectedExportLine, setSelectedExportLine] = useState<LineType | 'all'>('all');

  const searchInputRef = React.useRef<HTMLInputElement | null>(null);

  const openChitModalForSearchTerm = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    if (/^\d+$/.test(clean)) {
      const searchNum = parseInt(clean, 10);
      setActiveSearchNum(searchNum);
      const matchingCust = customers.find((c) => c.customer_number === searchNum);
      if (matchingCust) {
        setSelectedCustForChit(matchingCust.id);
        setIsAddChitOpen(true);
        setSearchTerm('');
      }
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    const term = val.trim();
    if (/^\d+$/.test(term)) {
      const searchNum = parseInt(term, 10);
      setActiveSearchNum(searchNum);
    } else if (!term) {
      // Retain activeSearchNum so auto-clearing input field does not reset searched customer
    } else {
      setActiveSearchNum(null);
    }
  };

  const handleSearchSubmit = () => {
    openChitModalForSearchTerm(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setActiveSearchNum(null);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 10);
  };

  // Debounce auto-open search modal for typed numeric customer number (1300ms delay)
  // or instantly when hitting Enter
  useEffect(() => {
    const term = searchTerm.trim();
    if (/^\d+$/.test(term)) {
      const searchNum = parseInt(term, 10);
      setActiveSearchNum(searchNum);
      const timer = setTimeout(() => {
        openChitModalForSearchTerm(term);
      }, 1300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, customers]);

  // Auto-focus search bar input field when Add Chit modal closes so user can type next number immediately
  useEffect(() => {
    if (!isAddChitOpen) {
      setSearchTerm('');
      const timer = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isAddChitOpen]);



  // Smart Search Filtering: Keeps searched customer displayed even after search input clears text
  const filteredCustomers = useMemo(() => {
    let result: Customer[] = [];
    const term = searchTerm.trim().toLowerCase();

    if (term) {
      const isNumeric = /^\d+$/.test(term);
      if (isNumeric) {
        const searchNum = parseInt(term, 10);
        const exactNumMatches = customers.filter((c) => c.customer_number === searchNum);
        if (exactNumMatches.length > 0) {
          result = exactNumMatches;
        } else {
          result = customers.filter((c) => c.name.toLowerCase().includes(term));
        }
      } else {
        result = customers.filter((c) => c.name.toLowerCase().includes(term));
      }
    } else if (activeSearchNum !== null) {
      const exactNumMatches = customers.filter((c) => c.customer_number === activeSearchNum);
      if (exactNumMatches.length > 0) {
        result = exactNumMatches;
      } else {
        result = [...customers];
      }
    } else {
      result = [...customers];
    }
    // Explicitly sort by customer_number ascending so Customer #1 always appears at the top
    return result.sort((a, b) => a.customer_number - b.customer_number);
  }, [customers, searchTerm, activeSearchNum]);

  // Master sorted customer list for PDF/Print report view consistency
  const sortedCustomers = useMemo(() => {
    return [...customers].sort((a, b) => a.customer_number - b.customer_number);
  }, [customers]);

  // Report customers helper: Filtered strictly for the chosen print line
  const reportCustomers = useMemo(() => {
    // 1. If actively previewing a saved historical record from Calendar modal, use that record's data directly
    if (activeHistoricalRecord) {
      return (activeHistoricalRecord.customers || []).map((c) => ({
        id: c.customer_number,
        customer_number: c.customer_number,
        name: c.name,
        chits: (c.chits || []).map((ch) => ({
          id: ch.id || Date.now(),
          customer_id: c.customer_number,
          chit_number: ch.chit_number,
          total_amount: Number(ch.due_amount) || 0,
          due_amount: Number(ch.due_amount) || 0,
          payment_type: (ch.payment_type as PaymentType) || 'Cash',
          type: activeHistoricalRecord.type === 'due' ? ('due' as const) : ('collection' as const),
          line: ch.line || activeHistoricalRecord.line || (selectedExportLine === 'all' ? 'Line 1' : selectedExportLine),
          status: 'active' as const
        }))
      })).filter((c) => c.chits && c.chits.length > 0);
    }

    // 2. Live Printing / PDF Export: Use real-time live customers state directly!
    const targetLine = selectedExportLine;
    return customers
      .map((c) => ({
        id: c.id,
        customer_number: c.customer_number,
        name: c.name,
        chits: (c.chits || []).filter((ch) => {
          if (ch.status !== 'active') return false;
          const matchesMode = reportType === 'due' ? ch.type === 'due' || !ch.type : ch.type === 'collection';
          const chitLine = ch.line || 'Line 1';
          const matchesLine = targetLine === 'all' || chitLine === targetLine;
          return matchesMode && matchesLine;
        })
      }))
      .filter((c) => c.chits.length > 0);
  }, [activeHistoricalRecord, customers, reportType, selectedExportLine]);

  // Dynamically calculated Totals for currently active selectedLine (or all lines if none selected)
  const totalDue = useMemo(() => {
    let sum = 0;
    customers.forEach((c) => {
      if (c.chits) {
        c.chits.forEach((ch) => {
          if (
            ch.status === 'active' &&
            (ch.type === 'due' || !ch.type) &&
            (!selectedLine || (ch.line || 'Line 1') === selectedLine)
          ) {
            sum += Number(ch.due_amount);
          }
        });
      }
    });
    return sum;
  }, [customers, selectedLine]);

  const collectedToday = useMemo(() => {
    let sum = 0;
    customers.forEach((c) => {
      if (c.chits) {
        c.chits.forEach((ch) => {
          if (
            ch.status === 'active' &&
            ch.type === 'collection' &&
            (!selectedLine || (ch.line || 'Line 1') === selectedLine)
          ) {
            sum += Number(ch.due_amount);
          }
        });
      }
    });
    return sum;
  }, [customers, selectedLine]);

  const collectedBreakdown = useMemo(() => {
    const breakdown = {
      Cash: 0,
      UPI: 0,
      Cheque: 0,
      'Bank Transfer': 0
    };

    customers.forEach((c) => {
      if (c.chits) {
        c.chits.forEach((ch) => {
          if (
            ch.status === 'active' &&
            ch.type === 'collection' &&
            (!selectedLine || (ch.line || 'Line 1') === selectedLine)
          ) {
            let mode = (ch.payment_type as string) || 'Cash';
            if (mode === 'PhonePe' || mode === 'BharatPe' || mode === 'PhonePe/GPay') {
              mode = 'UPI';
            }
            if (mode in breakdown) {
              breakdown[mode as keyof typeof breakdown] += Number(ch.due_amount);
            }
          }
        });
      }
    });
    return breakdown;
  }, [customers, selectedLine]);

  // Report totals helper: Derived strictly from reportCustomers matching the chosen export line
  const reportTotalDue = useMemo(() => {
    let sum = 0;
    reportCustomers.forEach((c) => {
      c.chits.forEach((ch) => {
        if (ch.type === 'due' || !ch.type) {
          sum += Number(ch.due_amount);
        }
      });
    });
    return sum;
  }, [reportCustomers]);

  const reportCollectedToday = useMemo(() => {
    let sum = 0;
    reportCustomers.forEach((c) => {
      c.chits.forEach((ch) => {
        if (ch.type === 'collection') {
          sum += Number(ch.due_amount);
        }
      });
    });
    return sum;
  }, [reportCustomers]);

  const reportCollectedBreakdown = useMemo(() => {
    const breakdown = {
      Cash: 0,
      UPI: 0,
      Cheque: 0,
      'Bank Transfer': 0
    };
    reportCustomers.forEach((c) => {
      c.chits.forEach((ch) => {
        if (ch.type === 'collection') {
          let mode = (ch.payment_type as string) || 'Cash';
          if (mode === 'PhonePe' || mode === 'BharatPe' || mode === 'PhonePe/GPay') {
            mode = 'UPI';
          }
          if (mode in breakdown) {
            breakdown[mode as keyof typeof breakdown] += Number(ch.due_amount);
          }
        }
      });
    });
    return breakdown;
  }, [reportCustomers]);

  const nextCustomerNumber = useMemo(() => {
    return Math.max(...customers.map((c) => c.customer_number), 0) + 1;
  }, [customers]);

  // Handler: Directly Edit Due/Collection Amount for a Chit
  const handleUpdateChitDue = async (chitId: number, newDueAmount: number) => {
    try {
      await updateChitApi(chitId, newDueAmount);
      await loadDataFromDb();
    } catch (err) {
      console.error('Failed to update chit in database:', err);
    }
    setEditTarget(null);
  };

  // Handler: Deduct Payment
  const handleConfirmDeduct = async (chitId: number, amount: number, paymentType: PaymentType) => {
    try {
      await deductPaymentApi(chitId, amount, paymentType, user?.name || 'Satish sir');
      await loadDataFromDb();
    } catch (err) {
      console.error('Failed to deduct payment in database:', err);
    }
    setDeductTarget(null);
  };

  // Handler: Delete Chit
  const handleConfirmDelete = async (chitId: number) => {
    if (!deleteTarget) return;
    setCustomers((prev) =>
      prev.map((c) => ({
        ...c,
        chits: (c.chits || []).filter((ch) => ch.id !== chitId)
      }))
    );
    setTransactions((prev) => prev.filter((tx) => tx.chit_id !== chitId));
    setDeleteTarget(null);

    try {
      await deleteChitApi(chitId, user?.name || 'Satish sir');
    } catch (err) {
      console.error('Failed to delete chit in database:', err);
    }
  };

  // Handler: Delete Customer
  const handleDeleteCustomer = async (customerId: number) => {
    // Optimistically remove customer from state immediately
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    setIsDeleteCustOpen(false);
    try {
      await deleteCustomerApi(customerId);
      await loadDataFromDb();
    } catch (err) {
      console.error('Failed to delete customer in database:', err);
    }
  };

  // Handler: Update Customer Name
  const handleUpdateCustomerName = async (customerId: number, newName: string) => {
    const formattedName = toTitleCase(newName);
    try {
      await updateCustomerApi(customerId, formattedName);
      await loadDataFromDb();
    } catch (err) {
      console.error('Failed to update customer name in database:', err);
    }
  };

  // Handler: Update Customer Number with Duplicate Check Alert
  const handleUpdateCustomerNumber = async (customerId: number, newNumber: number) => {
    const currentCust = customers.find((c) => c.id === customerId);
    if (!currentCust || currentCust.customer_number === newNumber) return;

    const exists = customers.some((c) => c.id !== customerId && c.customer_number === newNumber);
    if (exists) {
      setNumberAlert({
        type: 'error',
        message: `Number ${newNumber} already exist`
      });
      return;
    }

    // Optimistic screen update
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, customer_number: newNumber } : c))
    );

    try {
      await updateCustomerApi(customerId, undefined, newNumber);
      await loadDataFromDb();
      setNumberAlert({
        type: 'success',
        message: 'Number updated'
      });
    } catch (err) {
      console.error('Failed to update customer number in database:', err);
      await loadDataFromDb();
    }
  };


  // Handler: Delete Saved Historical Record
  const handleDeleteSavedRecord = async (recordId: string | number) => {
    setSavedRecords((prev) => prev.filter((r) => String(r.id) !== String(recordId)));
    try {
      await deleteSavedRecordApi(recordId);
    } catch (err) {
      console.error('Failed to delete saved record from DB:', err);
    }
  };

  // Handler: Edit a specific chit inside a saved record (Syncs both Record Detail View and Home Page)
  const handleEditRecordChit = async (recordId: string | number, custNum: number, chitId: number, newAmount: number) => {
    // 1. Update the saved record state
    setSavedRecords((prev) =>
      prev.map((rec) => {
        if (String(rec.id) !== String(recordId)) return rec;
        const updatedCusts = rec.customers.map((c) => {
          if (c.customer_number !== custNum) return c;
          const updatedChits = c.chits.map((ch) =>
            ch.id === chitId ? { ...ch, due_amount: Number(newAmount) || 0 } : ch
          );
          return { ...c, chits: updatedChits };
        });
        const newTotal = updatedCusts.reduce(
          (tot, c) => tot + c.chits.reduce((sum, ch) => sum + (Number(ch.due_amount) || 0), 0),
          0
        );
        return { ...rec, totalAmount: newTotal, customers: updatedCusts };
      })
    );

    // 2. Also sync to Home Page active customer chits immediately
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.customer_number !== custNum) return c;
        const updatedChits = (c.chits || []).map((ch) =>
          ch.id === chitId ? { ...ch, due_amount: Number(newAmount) || 0 } : ch
        );
        return { ...c, chits: updatedChits };
      })
    );

    try {
      await editRecordChitApi(recordId, chitId, newAmount);
      await updateChitApi(chitId, newAmount);
    } catch (err) {
      console.error('Failed to edit record chit in DB:', err);
    }
  };

  // Handler: Delete a specific chit inside a saved record (Syncs both Record Detail View and Home Page)
  const handleDeleteRecordChit = async (recordId: string | number, custNum: number, chitId: number) => {
    // 1. Update the saved record state
    setSavedRecords((prev) =>
      prev.map((rec) => {
        if (String(rec.id) !== String(recordId)) return rec;
        const updatedCusts = rec.customers
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
        return { ...rec, totalAmount: newTotal, customers: updatedCusts };
      })
    );

    // 2. Also sync deletion to Home Page active customer chits immediately
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.customer_number !== custNum) return c;
        return {
          ...c,
          chits: (c.chits || []).filter((ch) => ch.id !== chitId)
        };
      })
    );

    try {
      await deleteRecordChitApi(recordId, chitId);
      await deleteChitApi(chitId, user?.name || 'Satish sir');
    } catch (err) {
      console.error('Failed to delete record chit in DB:', err);
    }
  };


  // Handler: Create Collection Entry / Due Chit
  const handleCreateChit = async (
    customerId: number,
    chitNumber: string | number | null,
    amount: number,
    paymentType: PaymentType = 'UPI',
    line?: string
  ) => {
    const isDueEntry = activeView === 'due';
    const numToPass = chitNumber ? Number(chitNumber) : undefined;
    const chitType = isDueEntry ? 'due' : 'collection';
    const chitLine = (line as LineType) || selectedLine || 'Line 1';

    // 1. Optimistic instant screen update
    const targetCust = customers.find((c) => c.id === customerId);
    let finalNum: string | number = 1;
    if (numToPass) {
      finalNum = numToPass;
    } else {
      const existingChits = targetCust?.chits || [];
      const numericChits = existingChits
        .filter((ch) => ch.status === 'active' && (isDueEntry ? (ch.type === 'due' || !ch.type) : ch.type === 'collection'))
        .map((ch) => Number(ch.chit_number))
        .filter((n) => !isNaN(n));
      finalNum = numericChits.length > 0 ? Math.max(...numericChits) + 1 : 1;
    }

    const tempChitId = Date.now();
    const newChit: Chit = {
      id: tempChitId,
      customer_id: customerId,
      chit_number: finalNum,
      total_amount: amount,
      due_amount: amount,
      payment_type: isDueEntry ? undefined : paymentType,
      type: chitType,
      line: chitLine,
      status: 'active'
    };

    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, chits: [...(c.chits || []), newChit] } : c))
    );

    if (!isDueEntry) {
      const newTx: Transaction = {
        id: Date.now(),
        customer_id: customerId,
        chit_id: tempChitId,
        chit_number: finalNum,
        customer_name: targetCust ? toTitleCase(targetCust.name) : 'Customer',
        amount: amount,
        payment_type: paymentType,
        type: 'payment',
        created_by: user?.name || 'Satish sir',
        created_at: new Date().toISOString()
      };
      setTransactions((prev) => [newTx, ...prev]);
    }

    setIsAddChitOpen(false);
    setSelectedCustForChit(undefined);

    // 2. Persist to DB
    try {
      const createdChit = await createChitApi(customerId, numToPass, amount, paymentType, chitType, chitLine);
      if (createdChit && createdChit.id) {
        setCustomers((prev) =>
          prev.map((c) => {
            if (c.id !== customerId) return c;
            return {
              ...c,
              chits: (c.chits || []).map((ch) =>
                ch.id === tempChitId
                  ? {
                      ...createdChit,
                      line: createdChit.line || chitLine,
                      total_amount: Number(createdChit.total_amount),
                      due_amount: Number(createdChit.due_amount)
                    }
                  : ch
              )
            };
          })
        );
      }
    } catch (err) {
      console.error('Failed to create chit in database:', err);
    }
  };

  // Handler: Create Customer
  const handleCreateCustomer = async (name: string, customerNumber?: number) => {
    setIsAddCustOpen(false);

    try {
      const created = await createCustomerApi(name, customerNumber);
      if (created && created.id) {
        setCustomers((prev) => [
          ...prev.filter((c) => c.customer_number !== created.customer_number),
          {
            ...created,
            customer_number: Number(created.customer_number),
            name: toTitleCase(created.name),
            chits: []
          }
        ]);
      } else {
        await loadDataFromDb();
      }
    } catch (err) {
      console.error('Failed to create customer in database:', err);
      await loadDataFromDb();
    }
  };


  // Handler: Open Add Chit for specific customer
  const handleOpenAddChitForCustomer = (customerId: number) => {
    setSelectedCustForChit(customerId);
    setIsAddChitOpen(true);
  };

  // Direct Export Helper for Current View Report
  const triggerDirectExport = (
    action: 'print' | 'pdf',
    exportLine?: LineType | 'all',
    exportType?: 'due' | 'collected',
    customRecord?: SavedRecord | null
  ) => {
    const lineToExport = exportLine !== undefined ? exportLine : (selectedLine || selectedExportLine || 'Line 1');
    const typeToExport = exportType !== undefined ? exportType : activeView;
    setSelectedExportLine(lineToExport);
    setReportType(typeToExport);
    if (customRecord !== undefined) {
      setActiveHistoricalRecord(customRecord);
    }

    // Wait 350ms for React state rendering flush into the DOM
    setTimeout(async () => {
      const element = document.getElementById('printable-report');
      if (!element) {
        setActiveHistoricalRecord(null);
        return;
      }

      if (action === 'print') {
        window.print();
        setTimeout(() => {
          setActiveHistoricalRecord(null);
        }, 500);
      } else {
        const lineSuffix = lineToExport !== 'all' ? `_${lineToExport.replace(/\s+/g, '_')}` : '';
        const dateToUse = customRecord?.date || operatingDate;
        const filename = `DreamWay_${typeToExport === 'due' ? 'Due' : 'Collection'}_Report${lineSuffix}_${dateToUse}.pdf`;

        // 1. Create an isolated off-screen wrapper in document.body for html2pdf layout calculation
        const exportWrapper = document.createElement('div');
        exportWrapper.style.position = 'fixed';
        exportWrapper.style.left = '0px';
        exportWrapper.style.top = '0px';
        exportWrapper.style.width = '794px'; // Exactly A4 width in px (96 DPI)
        exportWrapper.style.backgroundColor = '#ffffff';
        exportWrapper.style.color = '#0F172A';
        exportWrapper.style.zIndex = '-99999';
        exportWrapper.style.opacity = '1';
        exportWrapper.style.visibility = 'visible';

        // 2. Clone the printable report so it has full layout, fonts, and positive coordinates
        const clone = element.cloneNode(true) as HTMLElement;
        clone.classList.remove('hidden');
        clone.style.display = 'block';
        clone.style.position = 'static';
        clone.style.width = '100%';
        clone.style.height = 'auto';
        clone.style.backgroundColor = '#ffffff';
        clone.style.color = '#0F172A';
        clone.style.visibility = 'visible';

        exportWrapper.appendChild(clone);
        document.body.appendChild(exportWrapper);

        const opt = {
          margin: 8,
          filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            scrollX: 0,
            scrollY: 0
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: {
            mode: ['css', 'legacy'],
            avoid: ['.break-inside-avoid', '.print-row-container', '.footer-summary']
          }
        };

        const pdfEngine = typeof html2pdf === 'function' ? html2pdf : (html2pdf as any)?.default;

        try {
          if (document.fonts) {
            await document.fonts.ready;
          }

          if (typeof pdfEngine === 'function') {
            await pdfEngine()
              .set(opt)
              .from(clone)
              .save();
          } else {
            window.print();
          }
        } catch (err: any) {
          console.error('PDF export error:', err);
          window.print();
        } finally {
          if (document.body.contains(exportWrapper)) {
            document.body.removeChild(exportWrapper);
          }
          setActiveHistoricalRecord(null);
        }
      }
    }, 350);
  };

  // Handler: Print (Prompts user with Line 1, Line 2, Line 3, or All Lines modal)
  const handlePrint = () => {
    setPrintLineModalAction('print');
  };

  // Handler: Export PDF (Prompts user with Line 1, Line 2, Line 3, or All Lines modal)
  const handleDownloadPDF = () => {
    setPrintLineModalAction('pdf');
  };

  // Handler: Trigger Export with specific line chosen from modal
  const handleExecuteExportWithLine = (chosenLine: LineType | 'all') => {
    const action = printLineModalAction || 'print';
    setPrintLineModalAction(null);
    setSelectedExportLine(chosenLine);
    if (chosenLine !== 'all') {
      saveRecordForView(activeView, chosenLine);
    } else {
      const lines: LineType[] = ['Line 1', 'Line 2', 'Line 3'];
      lines.forEach((l) => saveRecordForView(activeView, l));
    }
    triggerDirectExport(action, chosenLine, activeView);
  };

  const isSuperAdmin = user?.role === 'superadmin';

  // Handler: Confirm Clear All Daily Collections
  const handleConfirmClearAll = async () => {
    setCustomers((prev) =>
      prev.map((c) => ({
        ...c,
        chits: (c.chits || []).filter((ch) => {
          if (ch.type !== 'collection') return true;
          if (selectedLine && (ch.line || 'Line 1') !== selectedLine) return true;
          return false;
        })
      }))
    );
    setTransactions([]);
    setIsClearConfirmOpen(false);

    try {
      await clearCollectionChitsApi(selectedLine || undefined);
    } catch (err) {
      console.error('Failed to clear daily collections in DB:', err);
    }
  };

  // Handler: Confirm Clear All Dues
  const handleConfirmClearAllDues = async () => {
    setCustomers((prev) =>
      prev.map((c) => ({
        ...c,
        chits: (c.chits || []).filter((ch) => {
          if (ch.type === 'collection') return true;
          if (selectedLine && (ch.line || 'Line 1') !== selectedLine) return true;
          return false;
        })
      }))
    );
    setIsClearDueConfirmOpen(false);

    try {
      await clearDueChitsApi(selectedLine || undefined);
    } catch (err) {
      console.error('Failed to clear dues in DB:', err);
    }
  };

  // Master Integration Helper: Integrates screen chits into operatingDate record and persists directly to MySQL DB
  const saveRecordForView = async (targetView: 'due' | 'collected', targetLine?: LineType | 'all') => {
    const isDueMode = targetView === 'due';
    const effectiveLine = targetLine !== undefined ? targetLine : (selectedLine || 'all');

    const screenCustomers = customers
      .filter((c) =>
        c.chits?.some(
          (ch) =>
            ch.status === 'active' &&
            (isDueMode ? ch.type === 'due' || !ch.type : ch.type === 'collection') &&
            (effectiveLine === 'all' || (ch.line || 'Line 1') === effectiveLine)
        )
      )
      .map((c) => ({
        customer_number: c.customer_number,
        name: c.name,
        chits: (c.chits || [])
          .filter(
            (ch) =>
              ch.status === 'active' &&
              (isDueMode ? ch.type === 'due' || !ch.type : ch.type === 'collection') &&
              (effectiveLine === 'all' || (ch.line || 'Line 1') === effectiveLine)
          )
          .map((ch) => ({
            id: ch.id,
            chit_number: ch.chit_number,
            due_amount: Number(ch.due_amount) || 0,
            payment_type: ch.payment_type,
            line: ch.line || (effectiveLine === 'all' ? 'Line 1' : effectiveLine)
          }))
      }));

    if (screenCustomers.length === 0) {
      return;
    }

    const calculatedTotal = screenCustomers.reduce(
      (total, c) => total + c.chits.reduce((sum: number, ch: any) => sum + (Number(ch.due_amount) || 0), 0),
      0
    );

    const nowIso = operatingDate === new Date().toISOString().split('T')[0]
      ? new Date().toISOString()
      : new Date(operatingDate + 'T12:00:00.000Z').toISOString();

    const recordLineName = effectiveLine === 'all' ? 'Line 1' : effectiveLine;
    const recordId = `${targetView}_${operatingDate}_${recordLineName.replace(/\s+/g, '_')}`;
    const newRecord: SavedRecord = {
      id: recordId,
      date: operatingDate,
      type: targetView,
      line: recordLineName,
      savedAt: nowIso,
      totalAmount: calculatedTotal,
      customerCount: screenCustomers.length,
      customers: screenCustomers
    };

    setSavedRecords((prev) => {
      const idx = prev.findIndex(
        (r) => r.date === operatingDate && r.type === targetView && (r.line || 'Line 1') === recordLineName
      );
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = newRecord;
        return updated;
      }
      return [newRecord, ...prev];
    });

    try {
      await createSavedRecordApi({
        date: operatingDate,
        type: targetView,
        line: recordLineName,
        customerCount: screenCustomers.length,
        totalAmount: calculatedTotal,
        customers: screenCustomers
      });
    } catch (err) {
      console.error('Failed to save record to database:', err);
    }
  };

  // Handler: Confirm Save Today's Daily Record (Saves all 3 Lines snapshot)
  const handleConfirmSaveRecord = async () => {
    const lines: LineType[] = ['Line 1', 'Line 2', 'Line 3'];
    for (const l of lines) {
      await saveRecordForView(activeView, l);
    }
    setIsSaveConfirmOpen(false);
  };

  // Debounced Auto-Save: Automatically saves active records without blocking the UI for all 3 lines
  useEffect(() => {
    const timer = setTimeout(() => {
      const lines: LineType[] = ['Line 1', 'Line 2', 'Line 3'];
      lines.forEach((l) => {
        saveRecordForView('due', l);
        saveRecordForView('collected', l);
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [customers, operatingDate]);

  return (
    <div className="min-h-screen flex flex-col bg-[#99C2D1] text-[#0F172A]">
      
      {/* Top Header */}
      <Header
        searchInputRef={searchInputRef}
        searchTerm={searchTerm}
        activeView={activeView}
        selectedLine={selectedLine}
        activeSearchNum={activeSearchNum}
        operatingDate={operatingDate}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        onViewChange={(view) => {
          setActiveView(view);
          setSelectedLine(null);
          setCurrentScreen('lines');
        }}
        onOpenAddCustomer={() => setIsAddCustOpen(true)}
        onOpenAddChit={() => {
          setSelectedCustForChit(undefined);
          setIsAddChitOpen(true);
        }}
        onOpenDeleteCustomer={() => setIsDeleteCustOpen(true)}
        onOpenOperatingDateModal={() => setIsOperatingDateOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onBackToLines={() => {
          setCurrentScreen('lines');
          setSelectedLine(null);
        }}
        onGoToHome={() => {
          setCurrentScreen('home');
          setSelectedLine(null);
        }}
        onOpenCalendarHistory={() => setIsCalendarHistoryOpen(true)}
      />

      {/* Main Container Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 md:px-8 pb-32">
        
        {isSuperAdmin ? (
          /* Render ONLY Super Admin Panel when logged in as Super Admin */
          <SuperAdminPanel />
        ) : (
          /* Admin / Standard Dashboard */
          <>
            {/* Screen 1: Home Dashboard Overview */}
            {currentScreen === 'home' && (
              <HomeDashboardView
                customers={customers}
                operatingDate={operatingDate}
                onOpenDueLines={() => {
                  setActiveView('due');
                  setSelectedLine(null);
                  setCurrentScreen('lines');
                }}
                onOpenCollectedLines={() => {
                  setActiveView('collected');
                  setSelectedLine(null);
                  setCurrentScreen('lines');
                }}
                onOpenCalendarHistory={() => setIsCalendarHistoryOpen(true)}
              />
            )}

            {/* Screen 2: Line 1, Line 2, Line 3 Selection View */}
            {currentScreen === 'lines' && (
              <LineSelectionView
                activeView={activeView}
                customers={customers}
                onSelectLine={(line) => {
                  setSelectedLine(line);
                  setCurrentScreen('workspace');
                }}
                onBackToHome={() => {
                  setCurrentScreen('home');
                  setSelectedLine(null);
                }}
              />
            )}

            {/* Screen 3: Customer List for Selected Line */}
            {currentScreen === 'workspace' && (
              <>
                {/* 3 Separate Workspace Navigation Cards/Buttons */}
                <div className="flex items-center gap-2.5 sm:gap-3 mb-5 flex-wrap">
                  {/* Card / Button 1: Back to Lines */}
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentScreen('lines');
                      setSelectedLine(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#E2E8F0] border-2 border-[#94A3B8] text-[#1E293B] font-black text-xs sm:text-sm rounded-2xl shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
                    title="Back to Lines"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#2563EB]" />
                    <span>Back to Lines</span>
                  </button>

                  {/* Card / Button 2: Current Line */}
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentScreen('lines');
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#E2E8F0] border-2 border-[#CBD5E1] hover:border-[#2563EB] text-[#0F172A] font-black text-xs sm:text-sm rounded-2xl shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
                    title="Change Line"
                  >
                    <MapPin className="w-4 h-4 text-[#2563EB]" />
                    <span>{selectedLine || 'Line 1'}</span>
                  </button>

                  {/* Card / Button 3: Active List Mode */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveView(activeView === 'due' ? 'collected' : 'due');
                    }}
                    title="Switch List"
                    className={`flex items-center gap-2 px-4 py-2.5 bg-white border-2 text-xs sm:text-sm font-black rounded-2xl shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer ${
                      activeView === 'due'
                        ? 'border-[#93C5FD] text-[#1D4ED8] hover:bg-blue-50/60'
                        : 'border-[#86EFAC] text-[#15803D] hover:bg-emerald-50/60'
                    }`}
                  >
                    <span>{activeView === 'due' ? '📋 Due List' : '💵 Collected List'}</span>
                  </button>
                </div>

                {filteredCustomers.length > 0 ? (
                  <div className="space-y-3">
                    {filteredCustomers.map((customer) => (
                      <CustomerCard
                        key={customer.id}
                        customer={customer}
                        viewMode={activeView}
                        selectedLine={selectedLine}
                        isInitiallyExpanded={searchTerm.trim() !== '' || activeSearchNum === customer.customer_number}
                        onEditDue={(chit, custName) => setEditTarget({ chit, customerName: custName })}
                        onDelete={(chit, custName) => setDeleteTarget({ chit, customerName: custName })}
                        onAddChitForCustomer={handleOpenAddChitForCustomer}
                        onUpdateCustomerName={handleUpdateCustomerName}
                        onUpdateCustomerNumber={handleUpdateCustomerNumber}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-[#FFFFFF] border-2 border-dashed border-[#BCCED7] rounded-2xl p-8 shadow-sm text-[#0F172A]">
                    <h3 className="text-lg font-bold mb-1">No customers found</h3>
                    <p className="text-xs mb-4 text-[#64748B]">
                      No matching customer or store name for "{searchTerm || activeSearchNum}".
                    </p>
                    <button
                      onClick={handleClearSearch}
                      className="px-4 py-2 bg-[#2563EB] text-[#FFFFFF] font-bold text-xs rounded-xl shadow-md hover:bg-[#1d4ed8] transition-colors cursor-pointer"
                    >
                      Clear Search Filter
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

      </main>

      {/* Professional Bottom Copyright Footer */}
      <Footer />

      {/* Permanently Fixed Summary Footer (Shown only inside the selected Line workspace) */}
      {!isSuperAdmin && currentScreen === 'workspace' && (
        <SummaryFooter
          viewMode={activeView}
          totalDue={totalDue}
          collectedToday={collectedToday}
          collectedBreakdown={collectedBreakdown}
          onPrint={handlePrint}
          onDownloadPDF={handleDownloadPDF}
          onClearAllCollections={() => setIsClearConfirmOpen(true)}
          onClearAllDues={() => setIsClearDueConfirmOpen(true)}
          onSaveRecord={() => setIsSaveConfirmOpen(true)}
          onOpenCalendarHistory={() => setIsCalendarHistoryOpen(true)}
        />
      )}

      {/* Hidden Print Report Layout (Receives saved report customer list & operating date) */}
      <PrintReportView
        customers={reportCustomers}
        totalDue={reportTotalDue}
        collectedToday={reportCollectedToday}
        collectedBreakdown={reportCollectedBreakdown}
        transactions={transactions}
        reportType={reportType}
        operatingDate={activeHistoricalRecord ? activeHistoricalRecord.date : operatingDate}
        lineName={
          activeHistoricalRecord
            ? activeHistoricalRecord.line
            : selectedExportLine === 'all'
              ? undefined
              : selectedExportLine
        }
      />

      {/* Line Selection Modal for Print / PDF Export */}
      {printLineModalAction && (
        <PrintLineModal
          action={printLineModalAction}
          activeView={activeView}
          currentLine={selectedLine}
          onSelectLine={handleExecuteExportWithLine}
          onClose={() => setPrintLineModalAction(null)}
        />
      )}

      {/* Active Modals */}
      {isSaveConfirmOpen && (
        <SaveConfirmModal
          viewMode={activeView}
          activeCustomerCount={
            customers.filter((c) =>
              c.chits?.some(
                (ch) =>
                  ch.status === 'active' &&
                  (activeView === 'due' ? ch.type === 'due' || !ch.type : ch.type === 'collection')
              )
            ).length
          }
          onClose={() => setIsSaveConfirmOpen(false)}
          onConfirm={handleConfirmSaveRecord}
        />
      )}

      {isCalendarHistoryOpen && (
        <CalendarHistoryModal
          records={savedRecords}
          activeView={activeView}
          operatingDate={operatingDate}
          onClose={() => {
            setIsCalendarHistoryOpen(false);
            setActiveHistoricalRecord(null);
          }}
          onDeleteRecord={handleDeleteSavedRecord}
          onEditRecordChit={handleEditRecordChit}
          onDeleteRecordChit={handleDeleteRecordChit}
          onPreviewRecord={(record, action) => {
            const line = (record.line as LineType) || 'Line 1';
            triggerDirectExport(action, line, record.type, record);
          }}
        />
      )}

      {editTarget && (
        <EditChitModal
          chit={editTarget.chit}
          customerName={editTarget.customerName}
          onClose={() => setEditTarget(null)}
          onConfirm={handleUpdateChitDue}
        />
      )}

      {deductTarget && (
        <DeductModal
          chit={deductTarget.chit}
          customerName={deductTarget.customerName}
          onClose={() => setDeductTarget(null)}
          onConfirm={handleConfirmDeduct}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          chit={deleteTarget.chit}
          customerName={deleteTarget.customerName}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {isClearConfirmOpen && (
        <ClearConfirmModal
          onClose={() => setIsClearConfirmOpen(false)}
          onConfirm={handleConfirmClearAll}
        />
      )}

      {isClearDueConfirmOpen && (
        <ClearConfirmModal
          onClose={() => setIsClearDueConfirmOpen(false)}
          onConfirm={handleConfirmClearAllDues}
        />
      )}

      {isAddChitOpen && (
        <CreateChitModal
          customers={sortedCustomers}
          selectedCustomerId={selectedCustForChit}
          viewMode={activeView}
          initialLine={selectedLine || 'Line 1'}
          onClose={() => {
            setIsAddChitOpen(false);
            setSelectedCustForChit(undefined);
          }}
          onConfirm={handleCreateChit}
        />
      )}

      {isAddCustOpen && (
        <CreateCustomerModal
          customers={sortedCustomers}
          nextCustomerNumber={nextCustomerNumber}
          onClose={() => setIsAddCustOpen(false)}
          onConfirm={handleCreateCustomer}
        />
      )}

      {isDeleteCustOpen && (
        <DeleteCustomerModal
          customers={sortedCustomers}
          onClose={() => setIsDeleteCustOpen(false)}
          onConfirm={handleDeleteCustomer}
        />
      )}

      {isHistoryOpen && (
        <HistoryModal
          transactions={transactions}
          targetChitInfo={historyTarget || undefined}
          onClose={() => {
            setIsHistoryOpen(false);
            setHistoryTarget(null);
          }}
        />
      )}

      {isLoginOpen && (
        <LoginModal onClose={() => setIsLoginOpen(false)} />
      )}

      {numberAlert && (
        <NumberAlertModal
          type={numberAlert.type}
          message={numberAlert.message}
          onClose={() => setNumberAlert(null)}
        />
      )}

      {isOperatingDateOpen && (
        <OperatingDateModal
          currentOperatingDate={operatingDate}
          onClose={() => setIsOperatingDateOpen(false)}
          onSelectDate={(newDate) => setOperatingDate(newDate)}
        />
      )}

      {isProfileOpen && (
        <ProfileModal onClose={() => setIsProfileOpen(false)} />
      )}

    </div>
  );
}

// Router switcher component
function AppRouter() {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return <DashboardContent />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}
