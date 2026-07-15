import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Save,
  XCircle,
  AlertCircle,
  CheckCircle,
  Edit2,
  Trash2,
  Shield,
  Search,
  Printer,
  Download
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export function FabricBookingView({ defaultTab = 'directory', isApprovalOnly = false }: { defaultTab?: 'directory' | 'approval', isApprovalOnly?: boolean } = {}) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [viewingBooking, setViewingBooking] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Simulated access controls state
  const [simulatedRole, setSimulatedRole] = useState<'super_admin' | 'admin_user' | 'unit_user'>('super_admin');
  const userCompany = 'Demo Factory Ltd.';
  const userUnit = 'Demo Unit';

  // Search/Filter states
  const [filterBasis, setFilterBasis] = useState<'day' | 'month' | 'year' | 'all'>('all');
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Primary form fields (Phase 1)
  const [basis, setBasis] = useState<'Main' | 'Short'>('Main');
  const [selectedMainBookingIds, setSelectedMainBookingIds] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedBudgetIds, setSelectedBudgetIds] = useState<string[]>([]);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplierName, setSupplierName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [inhouseDate, setInhouseDate] = useState('');
  const [payMode, setPayMode] = useState('Credit');
  const [source, setSource] = useState('Non-Epz/Local');
  const [currency, setCurrency] = useState('USD');
  const [attention, setAttention] = useState('');
  const [remarks, setRemarks] = useState('');

  // Auto-populated fields from Budget Reference selection
  const [buyer, setBuyer] = useState('');
  const [fabricSource, setFabricSource] = useState('');
  const [fabricComposition, setFabricComposition] = useState('');
  const [dealingMerchant, setDealingMerchant] = useState('');
  const [bookingCompany, setBookingCompany] = useState('Demo Factory Ltd.');
  const [bookingUnit, setBookingUnit] = useState('Demo Unit');

  // Last attention suggestion
  const [attentionSuggestion, setAttentionSuggestion] = useState('');

  // Collar & Cuff Browse Popup specs
  const [showCcPopup, setShowCcPopup] = useState(false);
  const [ccList, setCcList] = useState<any[]>([]);
  const [ccPo, setCcPo] = useState('');
  const [ccColor, setCcColor] = useState('');
  const [ccGmtSize, setCcGmtSize] = useState('');
  const [ccItemSize, setCcItemSize] = useState('');
  const [ccGmtQty, setCcGmtQty] = useState(0);
  const [ccExcess, setCcExcess] = useState(0);
  // C&C Copy Checkboxes
  const [ccCopyAll, setCcCopyAll] = useState(false);
  const [ccColorWise, setCcColorWise] = useState(false);
  const [ccSizeWise, setCcSizeWise] = useState(false);
  const [ccPoWise, setCcPoWise] = useState(false);

  // Terms & Conditions Browse Popup specs
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
  const [termsTemplates, setTermsTemplates] = useState<any[]>([
    { id: 1, text: 'Yarn Type-' },
    { id: 2, text: 'Yarn Certificate-' },
    { id: 3, text: 'GSM Tolerance -3 % & + 3. If GSM is more the +3, then extra fabrics must be arranged with FOC basis.' },
    { id: 4, text: 'Shrinkage: +-5%' },
    { id: 5, text: 'Dimensional Stability: +-3%' },
    { id: 6, text: 'CF To Rub (Wet)-' },
    { id: 7, text: 'CF To Rub (Dry)-' },
    { id: 8, text: 'Pilling Resistance-' }
  ]);
  const [newTermText, setNewTermText] = useState('');

  // Phase 2: Detailed Booking Items
  const [bookingItems, setBookingItems] = useState<any[]>([]);



  // Approval tab filters
  const [appFilterBasis, setAppFilterBasis] = useState<'day' | 'month' | 'year' | 'all'>('all');
  const [appCurrentCalendarDate, setAppCurrentCalendarDate] = useState(new Date());
  const [appSelectedCalendarDay, setAppSelectedCalendarDay] = useState<string | null>(null);
  const [appSelectedMonth, setAppSelectedMonth] = useState<string>('');
  const [appSelectedYear, setAppSelectedYear] = useState<string>('2026');
  const [appSearchText, setAppSearchText] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('Pending Approval');

  useEffect(() => {
    fetchBookings();
    fetchBudgets();
    fetchLastAttention();
  }, [simulatedRole]);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/fabric-bookings?role=${simulatedRole}&company=${encodeURIComponent(userCompany)}&unit=${encodeURIComponent(userUnit)}`);
      const data = await res.json();
      setBookings(data);
    } catch (e) { console.error(e); }
  };

  const fetchBudgets = async () => {
    try {
      const res = await fetch(`${API_BASE}/budgets`);
      const data = await res.json();
      // Only approved budgets can be booked
      setBudgets(data.filter((b: any) => b.status === 'Approved'));
    } catch (e) { console.error(e); }
  };



  const fetchLastAttention = async () => {
    try {
      const res = await fetch(`${API_BASE}/fabric-bookings/last-attention`);
      const data = await res.json();
      if (data.attention) {
        setAttentionSuggestion(data.attention);
      }
    } catch (e) { console.error(e); }
  };

  // Sync selectors logic
  // 1. If Select Style -> find all approved budgets matching style_no
  const handleStyleChange = (style: string) => {
    setSelectedStyle(style);
    if (!style) {
      setSelectedBudgetIds([]);
      setBuyer('');
      setFabricSource('');
      setSupplierName('');
      setFabricComposition('');
      setDealingMerchant('');
    }
  };

  const handleStyleFetchAndAutofill = async () => {
    if (!selectedStyle.trim()) {
      alert("Please enter a Style Reference.");
      return;
    }
    const matchingBudgets = budgets.filter(b => String(b.style_no).toLowerCase() === selectedStyle.toLowerCase().trim());
    if (matchingBudgets.length > 0) {
      const defaultIds = [matchingBudgets[0].id.toString()];
      setSelectedBudgetIds(defaultIds);
      await handleBudgetIdsChange(defaultIds, selectedStyle);
    } else {
      alert(`No approved budget limit found for Style Reference "${selectedStyle}".`);
      setSelectedBudgetIds([]);
      setBuyer('');
      setFabricSource('');
      setSupplierName('');
      setFabricComposition('');
      setDealingMerchant('');
    }
  };

  // 2. If Select Budget Reference -> set style_no and fetch details
  const handleBudgetIdsChange = async (ids: string[], currentStyle?: string) => {
    setSelectedBudgetIds(ids);
    if (ids.length === 0) {
      if (!currentStyle) {
        setSelectedStyle('');
      }
      setBuyer('');
      setFabricSource('');
      setSupplierName('');
      setFabricComposition('');
      setDealingMerchant('');
      return;
    }

    // Auto-prefill style and other basic details from the first selected budget
    const firstBudget = budgets.find(b => b.id.toString() === ids[0]);
    if (firstBudget) {
      setSelectedStyle(firstBudget.style_no || '');
      setBuyer(firstBudget.buyer || '');
      setDealingMerchant(firstBudget.dealing_merchant || '');
      setBookingCompany(firstBudget.company || 'Demo Factory Ltd.');
      setBookingUnit(firstBudget.unit || 'Demo Unit');
    }

    // Fetch details of first budget to pull fabric source, composition and supplier name
    try {
      const res = await fetch(`${API_BASE}/budgets/${ids[0]}`);
      if (res.ok) {
        const budgetDetail = await res.json();
        if (budgetDetail.fabrics && budgetDetail.fabrics.length > 0) {
          const firstFab = budgetDetail.fabrics[0];
          setFabricSource(firstFab.fabric_source || '');
          setSupplierName(firstFab.n_supplier || '');
          setFabricComposition(firstFab.composition || '');
        }
      }
    } catch (e) {
      console.error("Failed to auto-populate budget details:", e);
    }
  };

  // 3. Selection of multiple main booking references in Short Booking
  const handleMainBookingSelection = async (ids: string[]) => {
    setSelectedMainBookingIds(ids);
    if (ids.length === 0) {
      setErrorMsg('');
      return;
    }

    let totalMainQty = 0;
    let totalBudgetQty = 0;

    for (let id of ids) {
      try {
        const res = await fetch(`${API_BASE}/fabric-bookings/${id}`);
        if (res.ok) {
          const mainBooking = await res.json();
          const items = mainBooking.items || [];
          items.forEach((it: any) => {
            totalMainQty += parseFloat(it.work_order_quantity || 0);
            totalBudgetQty += parseFloat(it.budget_quantity || 0);
          });
        }
      } catch (e) {
        console.error("Failed to check main booking:", e);
      }
    }

    if (totalMainQty < totalBudgetQty && totalBudgetQty > 0) {
      setErrorMsg(`Booking Blocked: Selected Main Booking quantity (${totalMainQty.toFixed(2)}) has not completed the full Budget quantity (${totalBudgetQty.toFixed(2)}). Short booking is disabled until complete.`);
    } else {
      setErrorMsg('');
    }
  };

  // Get Data Button: fetches budget detail rows and builds booking details rows
  const handleGetData = async () => {
    if (basis === 'Short') {
      if (selectedMainBookingIds.length === 0) return alert("Please select at least one Main Booking Reference ID");
      setErrorMsg('');

      try {
        let totalMainQty = 0;
        let totalBudgetQty = 0;
        let mainItemsList: any[] = [];

        for (let mainId of selectedMainBookingIds) {
          const res = await fetch(`${API_BASE}/fabric-bookings/${mainId}`);
          if (res.ok) {
            const mainBooking = await res.json();
            const items = mainBooking.items || [];
            items.forEach((it: any) => {
              totalMainQty += parseFloat(it.work_order_quantity || 0);
              totalBudgetQty += parseFloat(it.budget_quantity || 0);

              // Push cloned items for Short Booking with 0 default work order quantity
              mainItemsList.push({
                ...it,
                id: undefined,
                booking_id: undefined,
                work_order_quantity: 0,
                amount: 0,
                remarks: `Short Booking Adjustment for Main Ref: ${mainBooking.booking_reference}`
              });
            });
          }
        }

        if (totalMainQty < totalBudgetQty && totalBudgetQty > 0) {
          return alert(`Booking Blocked: Cannot proceed with Short Booking. Selected Main Booking quantity (${totalMainQty.toFixed(2)}) has not completed the full Budget quantity (${totalBudgetQty.toFixed(2)}).`);
        }

        setBookingItems(mainItemsList);
        if (mainItemsList.length === 0) {
          alert("No items found in selected Main Bookings.");
        }
      } catch (e) {
        console.error(e);
        setErrorMsg("Failed to retrieve Main Booking items.");
      }
      return;
    }

    if (selectedBudgetIds.length === 0) return alert("Please select at least one Budget Reference ID");
    setErrorMsg('');

    try {
      let itemsAggregated: any[] = [];

      for (let budgetId of selectedBudgetIds) {
        const res = await fetch(`${API_BASE}/budgets/${budgetId}`);
        if (!res.ok) continue;
        const budgetDetail = await res.json();

        // Fetch already booked quantities for this budget to filter out fully-booked combinations
        const bookedRes = await fetch(`${API_BASE}/fabric-bookings/booked-quantity/${budgetId}`);
        const bookedQuantities = bookedRes.ok ? await bookedRes.json() : [];

        // Loop over budget fabrics and build rows
        const fabrics = budgetDetail.fabrics || [];
        for (let fab of fabrics) {
          const consumptions = fab.consumption || [];
          for (let cons of consumptions) {
            // Check if yarn is production-based
            const isProd = String(fab.fabric_source).toLowerCase() === 'production';
            const yarnDetail = isProd && fab.yarns?.[0] ? `${fab.yarns[0].yarn_composition} ${fab.yarns[0].yarn_count}` : 'N/A';
            const embType = budgetDetail.embs?.[0]?.emb_type || 'N/A';
            const embName = budgetDetail.embs?.[0]?.emb_name || 'N/A';

            // Find matching booked quantity
            const match = bookedQuantities.find((bq: any) =>
              String(bq.po_no).toLowerCase() === String(cons.po_no).toLowerCase() &&
              String(bq.garments_item).toLowerCase() === String(fab.gmt_item || 'Polo Shirt').toLowerCase() &&
              String(bq.body_parts).toLowerCase() === String(fab.body_part || 'Body Fabric').toLowerCase() &&
              String(bq.color).toLowerCase() === String(cons.color).toLowerCase() &&
              String(bq.fabric_type).toLowerCase() === String(fab.fabric_type || 'Jersey').toLowerCase() &&
              String(bq.fabric_composition).toLowerCase() === String(fab.composition || '100% Cotton').toLowerCase()
            );

            const bookedQty = match ? parseFloat(match.booked_qty || 0) : 0;
            const remainingQty = parseFloat(cons.total_qty || 0) - bookedQty;

            // If completely booked, exclude it
            if (remainingQty <= 0) continue;

            itemsAggregated.push({
              po_id: cons.po_id || 1,
              po_no: cons.po_no,
              buyer: budgetDetail.buyer,
              style_no: budgetDetail.style_no,
              garments_item: fab.gmt_item || 'Polo Shirt',
              body_parts: fab.body_part || 'Body Fabric',
              garments_color: cons.color,
              fabric_color: cons.color, // same as item color by default
              yarn_type: yarnDetail,
              embellishment_type: embType,
              embellishment_name: embName,
              fabric_type: fab.fabric_type || 'Jersey',
              fabric_composition: fab.composition || '100% Cotton',
              gsm: fab.gsm_oz || 180,
              fabric_dia: cons.dia_width || fab.dia_type || 'Open Width',
              lab_dip: '',
              garments_quantity: cons.po_qty || 0,
              total_fabric_quantity: remainingQty,
              uom: fab.uom || 'Kg',
              budget_quantity: cons.total_qty || 0,
              work_order_quantity: remainingQty,
              rate: cons.rate || 0.22,
              amount: remainingQty * (cons.rate || 0.22),
              color: cons.color,
              size: cons.gmt_sizes || 'M',
              item_size: cons.gmt_sizes || 'M',
              excess_pct: cons.process_loss_pct || 0,
              total_qty: remainingQty
            });
          }
        }
      }

      setBookingItems(itemsAggregated);
      if (itemsAggregated.length === 0) {
        alert("No remaining fabric quantities left to book in selected budgets.");
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to retrieve budget breakdown data.");
    }
  };

  // Collar & Cuff list operations
  const handleAddCcLine = () => {
    if (!ccPo || !ccColor || !ccGmtSize || !ccItemSize) {
      return alert("Please specify PO, Color, and Sizes for the C&C row");
    }

    const newRow = {
      po_no: ccPo,
      color: ccColor,
      gmt_size: ccGmtSize,
      item_size: ccItemSize,
      gmt_qty: ccGmtQty,
      excess: ccExcess,
      total_qty: Math.ceil(ccGmtQty * (1 + ccExcess / 100))
    };

    setCcList([...ccList, newRow]);

    // Clear inputs
    setCcPo('');
    setCcColor('');
    setCcGmtSize('');
    setCcItemSize('');
    setCcGmtQty(0);
    setCcExcess(0);
  };

  const handleApplyCcRules = () => {
    if (bookingItems.length === 0) return alert("Please fetch booking details first!");

    // Apply rules based on selected options:
    // If Copy All is selected, we map the entire PO consumption to Collar & Cuff.
    let listCopy = [...ccList];
    if (ccCopyAll) {
      bookingItems.forEach(item => {
        listCopy.push({
          po_no: item.po_no,
          color: item.garments_color,
          gmt_size: item.size,
          item_size: item.item_size,
          gmt_qty: item.garments_quantity,
          excess: 10,
          total_qty: Math.ceil(item.garments_quantity * 1.1)
        });
      });
      setCcList(listCopy);
      alert("PO consumptions copied successfully to C&C grid!");
    } else {
      alert("Manual custom specifications configured.");
    }
    setShowCcPopup(false);
  };

  // Terms and conditions templates logic
  const handleToggleTerm = (text: string) => {
    if (selectedTerms.includes(text)) {
      setSelectedTerms(selectedTerms.filter(x => x !== text));
    } else {
      setSelectedTerms([...selectedTerms, text]);
    }
  };

  const handleAddTermTemplate = () => {
    if (!newTermText) return;
    const newId = termsTemplates.length + 1;
    setTermsTemplates([...termsTemplates, { id: newId, text: newTermText }]);
    setSelectedTerms([...selectedTerms, newTermText]);
    setNewTermText('');
  };

  // Search filters aggregation
  const handleAddSearchBuyer = () => {
    if (!buyerInput) return;
    if (!filterBuyers.includes(buyerInput)) {
      setFilterBuyers([...filterBuyers, buyerInput]);
    }
    setBuyerInput('');
  };

  const handleAddSearchStyle = () => {
    if (!styleInput) return;
    if (!filterStyles.includes(styleInput)) {
      setFilterStyles([...filterStyles, styleInput]);
    }
    setStyleInput('');
  };

  // Approval tab filters aggregation
  const [appBuyerInput, setAppBuyerInput] = useState('');
  const [appStyleInput, setAppStyleInput] = useState('');

  const handleAddAppBuyer = () => {
    if (!appBuyerInput) return;
    if (!appBuyers.includes(appBuyerInput)) {
      setAppBuyers([...appBuyers, appBuyerInput]);
    }
    setAppBuyerInput('');
  };

  const handleAddAppStyle = () => {
    if (!appStyleInput) return;
    if (!appStyles.includes(appStyleInput)) {
      setAppStyles([...appStyles, appStyleInput]);
    }
    setAppStyleInput('');
  };

  // Save Booking Submit
  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (selectedBudgetIds.length === 0) return alert("Budget Reference is required!");

    const payload = {
      booking_reference: editingBooking
        ? editingBooking.booking_reference
        : `FB-${String(Math.floor(Math.random() * 900) + 100)}-${new Date().toISOString().split('T')[0]}`,
      budget_id: parseInt(selectedBudgetIds[0]),
      basis,
      main_booking_id: basis === 'Short' && selectedMainBookingIds.length > 0 ? parseInt(selectedMainBookingIds[0]) : null,
      linked_main_booking_ids: selectedMainBookingIds,
      booking_date: bookingDate,
      supplier_name: supplierName || 'Apex Textiles',
      delivery_date: deliveryDate,
      inhouse_date: inhouseDate,
      pay_mode: payMode,
      source,
      currency,
      attention,
      remarks,
      collar_cuff_info: ccList,
      terms_conditions: selectedTerms.join('\n* '),
      company: bookingCompany || userCompany,
      unit: bookingUnit || userUnit,
      booking_by: 'Merchandiser Supervisor',
      status: editingBooking ? editingBooking.status : 'Draft',
      items: bookingItems,
      buyer,
      style_no: selectedStyle,
      fabric_source: fabricSource,
      fabric_composition: fabricComposition,
      dealing_merchant: dealingMerchant
    };

    try {
      const url = editingBooking
        ? `${API_BASE}/fabric-bookings/${editingBooking.id}`
        : `${API_BASE}/fabric-bookings`;

      const method = editingBooking ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to submit Fabric Booking due to budget limit blocks.");
      } else {
        alert(editingBooking ? "Booking updated successfully!" : "Fabric Booking saved successfully!");
        setShowModal(false);
        setEditingBooking(null);

        // Reset search filters so the new booking is immediately visible in the directory
        setFilterStartDate('');
        setFilterEndDate('');
        setFilterBuyers([]);
        setFilterStyles([]);
        setBuyerInput('');
        setStyleInput('');

        fetchBookings();
        fetchLastAttention();
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("An error occurred during booking validation.");
    }
  };

  // Approve / Reject booking handler
  const handleApprovalAction = async (bookingId: number, approve: boolean) => {
    try {
      const todayDateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const res = await fetch(`${API_BASE}/fabric-bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: approve ? 'Approved' : 'Rejected',
          approved_by: 'Production Manager',
          approved_date: todayDateStr
        })
      });
      if (res.ok) {
        alert(approve ? "Booking Approved successfully by Production Manager!" : "Booking Rejected successfully!");
        fetchBookings();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update approval status.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitToManager = async (bookingId: number) => {
    try {
      const res = await fetch(`${API_BASE}/fabric-bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Pending Approval'
        })
      });
      if (res.ok) {
        alert("Fabric booking submitted to manager for approval!");
        fetchBookings();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to submit booking.");
      }
    } catch (e) {
      console.error(e);
      alert("Error submitting booking.");
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    if (!window.confirm("Are you sure you want to delete this fabric booking? This will also revert the budget utilization spend.")) return;
    try {
      const res = await fetch(`${API_BASE}/fabric-bookings/${bookingId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert("Fabric booking deleted successfully.");
        fetchBookings();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete booking.");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting booking.");
    }
  };

  // Initialize form for creation
  const handleOpenCreateModal = () => {
    setEditingBooking(null);
    setBasis('Main');
    setSelectedMainBookingIds([]);
    setSelectedStyle('');
    setSelectedBudgetIds([]);
    setBookingDate(new Date().toISOString().split('T')[0]);
    setSupplierName('Apex Textiles');
    setDeliveryDate('');
    setInhouseDate('');
    setPayMode('Credit');
    setSource('Non-Epz/Local');
    setCurrency('USD');
    setAttention(attentionSuggestion || '');
    setRemarks('');
    setCcList([]);
    setSelectedTerms(['Yarn Type-', 'Yarn Certificate-']);
    setBookingItems([]);
    setBuyer('');
    setFabricSource('');
    setFabricComposition('');
    setDealingMerchant('');
    setBookingCompany('Demo Factory Ltd.');
    setBookingUnit('Demo Unit');
    setErrorMsg('');
    setShowModal(true);
  };

  // Initialize form for editing
  const handleOpenEditModal = async (b: any) => {
    try {
      const res = await fetch(`${API_BASE}/fabric-bookings/${b.id}`);
      if (!res.ok) return alert("Failed to fetch booking details");
      const data = await res.json();

      setEditingBooking(data);
      setBasis(data.basis || 'Main');

      let linkedIds = [];
      if (data.linked_main_booking_ids) {
        try {
          linkedIds = JSON.parse(data.linked_main_booking_ids);
        } catch (e) {
          linkedIds = data.main_booking_id ? [data.main_booking_id.toString()] : [];
        }
      } else {
        linkedIds = data.main_booking_id ? [data.main_booking_id.toString()] : [];
      }
      setSelectedMainBookingIds(linkedIds);
      setSelectedBudgetIds([data.budget_id.toString()]);

      const budget = budgets.find(x => x.id === data.budget_id);
      setSelectedStyle(data.style_no || (budget ? budget.style_no : ''));

      setBookingDate(data.booking_date || '');
      setSupplierName(data.supplier_name || '');
      setDeliveryDate(data.delivery_date || '');
      setInhouseDate(data.inhouse_date || '');
      setPayMode(data.pay_mode || 'Credit');
      setSource(data.source || 'Non-Epz/Local');
      setCurrency(data.currency || 'USD');
      setAttention(data.attention || '');
      setRemarks(data.remarks || '');
      setBookingCompany(data.company || 'Demo Factory Ltd.');
      setBookingUnit(data.unit || 'Demo Unit');

      // Auto populate read-only fields
      setBuyer(data.buyer || budget?.buyer || '');
      setFabricSource(data.fabric_source || 'Local');
      setFabricComposition(data.fabric_composition || '');
      setDealingMerchant(data.dealing_merchant || budget?.dealing_merchant || '');

      try {
        setCcList(JSON.parse(data.collar_cuff_info) || []);
      } catch (e) {
        setCcList([]);
      }

      if (data.terms_conditions) {
        setSelectedTerms(data.terms_conditions.split('\n* '));
      } else {
        setSelectedTerms([]);
      }

      setBookingItems(data.items || []);
      setErrorMsg('');
      setShowModal(true);
    } catch (e) {
      console.error(e);
      alert("Error loading edit page.");
    }
  };

  const formatDateString = (dateStr: string) => {
    if (!dateStr || dateStr === 'No Date') return 'No Date';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const renderCalendar = () => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotalDays = new Date(year, month, 0).getDate();

    const days = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({ day: prevTotalDays - i, isCurrentMonth: false });
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const formatDateKey = (d: number) => {
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      return `${year}-${mm}-${dd}`;
    };

    const getBookingCount = (d: number) => {
      const key = formatDateKey(d);
      return bookings.filter(b => b.booking_date === key).length;
    };

    const handlePrevMonth = () => {
      setCurrentCalendarDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
      setCurrentCalendarDate(new Date(year, month + 1, 1));
    };

    return (
      <div style={{
        background: 'var(--bg-input)',
        border: '1px solid var(--border-muted)',
        borderRadius: '8px',
        padding: '12px',
        maxWidth: '300px',
        margin: '10px 0',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ padding: '2px 6px', minWidth: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border-muted)', color: 'var(--text-primary)', cursor: 'pointer' }}
            onClick={handlePrevMonth}
          >
            &lt;
          </button>
          <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '13px' }}>
            {monthNames[month]} {year}
          </span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ padding: '2px 6px', minWidth: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border-muted)', color: 'var(--text-primary)', cursor: 'pointer' }}
            onClick={handleNextMonth}
          >
            &gt;
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontWeight: 'bold', color: 'var(--text-secondary)', fontSize: '10px', marginBottom: '4px' }}>
          <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {days.map((item, index) => {
            const dateKey = item.isCurrentMonth ? formatDateKey(item.day) : null;
            const count = item.isCurrentMonth ? getBookingCount(item.day) : 0;
            const isSelected = selectedCalendarDay === dateKey;

            return (
              <div
                key={index}
                onClick={() => {
                  if (item.isCurrentMonth && dateKey) {
                    setSelectedCalendarDay(selectedCalendarDay === dateKey ? null : dateKey);
                  }
                }}
                style={{
                  height: '30px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  cursor: item.isCurrentMonth ? 'pointer' : 'default',
                  fontSize: '11px',
                  fontWeight: item.isCurrentMonth ? '600' : '400',
                  color: !item.isCurrentMonth ? 'var(--text-muted)' : (isSelected ? '#000000' : 'var(--text-primary)'),
                  background: isSelected ? 'var(--warning)' : (count > 0 ? 'var(--primary-glow)' : 'transparent'),
                  border: isSelected ? '2px solid var(--warning)' : (count > 0 ? '1px solid var(--primary)' : 'none'),
                  position: 'relative'
                }}
              >
                <span>{item.day}</span>
                {count > 0 && !isSelected && (
                  <span style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    position: 'absolute',
                    bottom: '2px'
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getFilteredBookingItems = () => {
    let basisFiltered = allBookingItemRows;

    // 1. Basis Filter
    if (filterBasis === 'day') {
      if (selectedCalendarDay) {
        basisFiltered = allBookingItemRows.filter(row => row.booking_date === selectedCalendarDay);
      } else {
        basisFiltered = [];
      }
    } else if (filterBasis === 'month') {
      if (selectedMonth) {
        basisFiltered = allBookingItemRows.filter(row => row.booking_date && row.booking_date.startsWith(selectedMonth));
      } else {
        basisFiltered = [];
      }
    } else if (filterBasis === 'year') {
      if (selectedYear) {
        basisFiltered = allBookingItemRows.filter(row => row.booking_date && row.booking_date.startsWith(selectedYear));
      } else {
        basisFiltered = [];
      }
    }

    // 2. Search query filter
    let searchFiltered = basisFiltered;
    if (searchText.trim()) {
      const q = searchText.toLowerCase().trim();
      searchFiltered = basisFiltered.filter(row => {
        const refStr = String(row.booking_reference || '').toLowerCase();
        const styleStr = String(row.style_no || '').toLowerCase();
        const poStr = String(row.po_no || '').toLowerCase();
        const buyerStr = String(row.buyer || '').toLowerCase();
        const supplierStr = String(row.supplier_name || '').toLowerCase();
        return refStr.includes(q) || styleStr.includes(q) || poStr.includes(q) || buyerStr.includes(q) || supplierStr.includes(q);
      });
    }

    // 3. Status filter
    if (statusFilter !== 'All') {
      return searchFiltered.filter(row => {
        const stat = row.status || 'Draft';
        if (statusFilter === 'Pending Approval') {
          return stat === 'Pending Approval' || stat === 'Pending';
        }
        return stat.toLowerCase() === statusFilter.toLowerCase();
      });
    }

    return searchFiltered;
  };

  // Flatten all bookings to booking item rows
  const allBookingItemRows: any[] = [];
  bookings.forEach(b => {
    const items = b.items || [];
    if (items.length === 0) {
      allBookingItemRows.push({
        booking_id: b.id,
        booking_reference: b.booking_reference,
        booking_date: b.booking_date,
        basis: b.basis,
        supplier_name: b.supplier_name,
        delivery_date: b.delivery_date,
        inhouse_date: b.inhouse_date,
        pay_mode: b.pay_mode,
        source: b.source,
        currency: b.currency,
        attention: b.attention,
        remarks: b.remarks,
        collar_cuff_info: b.collar_cuff_info,
        terms_conditions: b.terms_conditions,
        status: b.status,
        booking_by: b.booking_by,
        company: b.company,
        unit: b.unit,
        created_at: b.created_at,
        // Booking level details fallback
        buyer: b.buyer || 'N/A',
        style_no: b.style_no || 'N/A',
        fabric_source: b.fabric_source || 'N/A',
        fabric_composition: b.fabric_composition || 'N/A',
        dealing_merchant: b.dealing_merchant || 'N/A',
        // Empty item fields to avoid undefined errors
        po_no: 'N/A',
        garments_item: 'N/A',
        body_parts: 'N/A',
        fabric_color: 'N/A',
        yarn_type: 'N/A',
        fabric_type: 'N/A',
        gsm: 0,
        fabric_dia: 'N/A',
        lab_dip: 'N/A',
        garments_quantity: 0,
        uom: 'N/A',
        budget_quantity: 0,
        work_order_quantity: 0,
        rate: 0,
        amount: 0
      });
    } else {
      items.forEach((it: any) => {
        allBookingItemRows.push({
          ...it,
          // Include booking level details
          booking_id: b.id,
          booking_reference: b.booking_reference,
          booking_date: b.booking_date,
          basis: b.basis,
          supplier_name: b.supplier_name,
          delivery_date: b.delivery_date,
          inhouse_date: b.inhouse_date,
          pay_mode: b.pay_mode,
          source: b.source,
          currency: b.currency,
          attention: b.attention,
          remarks: b.remarks,
          collar_cuff_info: b.collar_cuff_info,
          terms_conditions: b.terms_conditions,
          status: b.status,
          booking_by: b.booking_by,
          company: b.company,
          unit: b.unit,
          created_at: b.created_at,
          // Include context level details on the row item level
          buyer: it.buyer || b.buyer || 'N/A',
          style_no: it.style_no || b.style_no || 'N/A',
          fabric_source: it.fabric_source || b.fabric_source || 'N/A',
          fabric_composition: it.fabric_composition || b.fabric_composition || 'N/A',
          dealing_merchant: it.dealing_merchant || b.dealing_merchant || 'N/A'
        });
      });
    }
  });

  const filteredBookingItems = getFilteredBookingItems();

  // Formatting helper for currency values
  const formatMoney = (val: number) => {
    return '$' + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getFilteredApprovalItemsRows = () => {
    let basisFiltered = allBookingItemRows;

    // 1. Basis Filter
    if (appFilterBasis === 'day') {
      if (appSelectedCalendarDay) {
        basisFiltered = allBookingItemRows.filter(row => row.booking_date === appSelectedCalendarDay);
      } else {
        basisFiltered = [];
      }
    } else if (appFilterBasis === 'month') {
      if (appSelectedMonth) {
        basisFiltered = allBookingItemRows.filter(row => row.booking_date && row.booking_date.startsWith(appSelectedMonth));
      } else {
        basisFiltered = [];
      }
    } else if (appFilterBasis === 'year') {
      if (appSelectedYear) {
        basisFiltered = allBookingItemRows.filter(row => row.booking_date && row.booking_date.startsWith(appSelectedYear));
      } else {
        basisFiltered = [];
      }
    }

    // 2. Search query filter
    let searchFiltered = basisFiltered;
    if (appSearchText.trim()) {
      const q = appSearchText.toLowerCase().trim();
      searchFiltered = basisFiltered.filter(row => {
        const refStr = String(row.booking_reference || '').toLowerCase();
        const styleStr = String(row.style_no || '').toLowerCase();
        const poStr = String(row.po_no || '').toLowerCase();
        const buyerStr = String(row.buyer || '').toLowerCase();
        const supplierStr = String(row.supplier_name || '').toLowerCase();
        return refStr.includes(q) || styleStr.includes(q) || poStr.includes(q) || buyerStr.includes(q) || supplierStr.includes(q);
      });
    }

    // 3. Status filter
    if (appStatusFilter !== 'All') {
      return searchFiltered.filter(row => {
        const stat = row.status || 'Draft';
        if (appStatusFilter === 'Pending Approval') {
          return stat === 'Pending Approval' || stat === 'Pending';
        }
        return stat.toLowerCase() === appStatusFilter.toLowerCase();
      });
    }

    return searchFiltered;
  };

  const renderAppCalendar = () => {
    const year = appCurrentCalendarDate.getFullYear();
    const month = appCurrentCalendarDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotalDays = new Date(year, month, 0).getDate();

    const days = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({ day: prevTotalDays - i, isCurrentMonth: false });
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const formatDateKey = (d: number) => {
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      return `${year}-${mm}-${dd}`;
    };

    const getBookingCount = (d: number) => {
      const key = formatDateKey(d);
      return bookings.filter(b => b.booking_date === key).length;
    };

    const handlePrevMonth = () => {
      setAppCurrentCalendarDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
      setAppCurrentCalendarDate(new Date(year, month + 1, 1));
    };

    return (
      <div style={{
        background: 'var(--bg-input)',
        border: '1px solid var(--border-muted)',
        borderRadius: '8px',
        padding: '12px',
        maxWidth: '300px',
        margin: '10px 0',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ padding: '2px 6px', minWidth: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border-muted)', color: 'var(--text-primary)', cursor: 'pointer' }}
            onClick={handlePrevMonth}
          >
            &lt;
          </button>
          <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '13px' }}>
            {monthNames[month]} {year}
          </span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ padding: '2px 6px', minWidth: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border-muted)', color: 'var(--text-primary)', cursor: 'pointer' }}
            onClick={handleNextMonth}
          >
            &gt;
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontWeight: 'bold', color: 'var(--text-secondary)', fontSize: '10px', marginBottom: '4px' }}>
          <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {days.map((item, index) => {
            const dateKey = item.isCurrentMonth ? formatDateKey(item.day) : null;
            const count = item.isCurrentMonth ? getBookingCount(item.day) : 0;
            const isSelected = appSelectedCalendarDay === dateKey;

            return (
              <div
                key={index}
                onClick={() => {
                  if (item.isCurrentMonth && dateKey) {
                    setAppSelectedCalendarDay(appSelectedCalendarDay === dateKey ? null : dateKey);
                  }
                }}
                style={{
                  height: '30px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  cursor: item.isCurrentMonth ? 'pointer' : 'default',
                  fontSize: '11px',
                  fontWeight: item.isCurrentMonth ? '600' : '400',
                  color: !item.isCurrentMonth ? 'var(--text-muted)' : (isSelected ? '#000000' : 'var(--text-primary)'),
                  background: isSelected ? 'var(--warning)' : (count > 0 ? 'var(--primary-glow)' : 'transparent'),
                  border: isSelected ? '2px solid var(--warning)' : (count > 0 ? '1px solid var(--primary)' : 'none'),
                  position: 'relative'
                }}
              >
                <span>{item.day}</span>
                {count > 0 && !isSelected && (
                  <span style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    position: 'absolute',
                    bottom: '2px'
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Words translation helper
  const translateToWords = (amount: number) => {
    if (amount === 0) return 'Zero USD';
    const num = Math.floor(amount);
    const wordsList = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const convertLessThanOneThousand = (n: number): string => {
      if (n < 20) return wordsList[n];
      const digit = n % 10;
      if (n < 100) return tens[Math.floor(n / 10)] + (digit ? " " + wordsList[digit] : "");
      return wordsList[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convertLessThanOneThousand(n % 100) : "");
    };

    if (num < 1000) return convertLessThanOneThousand(num) + " USD";
    if (num < 1000000) {
      const thousands = Math.floor(num / 1000);
      const rem = num % 1000;
      return convertLessThanOneThousand(thousands) + " Thousand " + (rem ? convertLessThanOneThousand(rem) : "") + " USD";
    }
    return amount.toFixed(2) + " USD";
  };

  const handleExportExcel = () => {
    const headers = [
      "Fabric Booking Reference", "Created Date", "Basis", "Buyer", "Style", "PO",
      "Fabric Source", "Garments Item", "Body Parts", "Fabric Color", "Yarn Type",
      "Embellishment Type", "Embellishment Name", "Fabric Type", "Fabric Composition",
      "GSM", "Fabric Dia", "Lab Dip No", "Garments Quantity", "UOM", "Budget Quantity",
      "Work Order Quantity", "Short Booking Quantity", "Average Rate", "Amount",
      "Approval Status", "Booking By", "Remarks"
    ];

    const csvRows = [headers.join(",")];

    filteredBookingItems.forEach(row => {
      const shortQty = row.basis === 'Short' ? row.work_order_quantity : 0;
      const values = [
        row.booking_reference || '',
        row.booking_date || '',
        row.basis || '',
        row.buyer || '',
        row.style_no || '',
        row.po_no || '',
        row.yarn_type && row.yarn_type !== 'N/A' ? 'Production' : 'Local',
        row.garments_item || '',
        row.body_parts || '',
        row.fabric_color || row.color || '',
        row.yarn_type || '',
        row.embellishment_type || '',
        row.embellishment_name || '',
        row.fabric_type || '',
        row.fabric_composition || '',
        row.gsm || '',
        row.fabric_dia || '',
        row.lab_dip || '',
        row.garments_quantity || 0,
        row.uom || '',
        row.budget_quantity || 0,
        row.work_order_quantity || 0,
        shortQty,
        row.rate || 0,
        row.amount || 0,
        row.status || '',
        `${row.booking_by || 'Merchandiser'} (${row.created_at || row.booking_date || ''})`,
        (row.remarks || '').replace(/"/g, '""')
      ];

      const escaped = values.map(val => {
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      });

      csvRows.push(escaped.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `fabric_bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>



      {/* TAB 1: DIRECTORY TAB */}
      {!isApprovalOnly && (
        <>

          {/* Bookings Directory List Grid */}
          <div className="dashboard-card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers /> Fabric Booking Directory
              </h3>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--text-secondary)' }}>Filter Mode:</label>
                  <select
                    className="form-control"
                    style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
                    value={filterBasis}
                    onChange={(e) => {
                      setFilterBasis(e.target.value as any);
                      setSelectedCalendarDay(null);
                      setSelectedMonth('');
                      setSelectedYear('2026');
                    }}
                  >
                    <option value="all">Show All Bookings</option>
                    <option value="day">By Specific Day (Calendar)</option>
                    <option value="month">By Specific Month</option>
                    <option value="year">By Specific Year</option>
                  </select>
                </div>

                <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0f766e', color: '#fff', border: 'none' }} onClick={handleExportExcel}>
                  <Download size={16} /> Export to Excel
                </button>
                <button className="btn btn-primary" onClick={handleOpenCreateModal}>
                  <Plus size={16} /> Create Fabric Booking
                </button>
              </div>
            </div>

            {/* Search & Filter Bar (Quotation Approval style) */}
            <div style={{ padding: '20px 20px 0 20px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', width: '100%', background: 'transparent' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search Style, Booking Ref, Buyer, PO, or Supplier..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  style={{ paddingLeft: '36px', height: '36px', background: 'var(--bg-input)', border: '1px solid var(--border-muted)', borderRadius: '6px', color: 'var(--text-primary)' }}
                />
              </div>
              <select
                className="form-control"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ width: '220px', height: '36px', background: 'var(--bg-input)', border: '1px solid var(--border-muted)', borderRadius: '6px', color: 'var(--text-primary)' }}
              >
                <option value="All">All Bookings</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Draft">Draft</option>
              </select>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                Found {filteredBookingItems.length} Records
              </div>
            </div>

            {/* Filter inputs displayed on top when filterBasis is not 'all' */}
            {filterBasis !== 'all' && (
              <div style={{ padding: '0 20px', marginTop: '15px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {filterBasis === 'day' && (
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Click Date to Filter:</div>
                    {renderCalendar()}
                    {selectedCalendarDay ? (
                      <div style={{ marginTop: '10px', background: 'var(--primary-glow)', border: '1px solid var(--primary)', borderRadius: '6px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-primary)' }}>
                        <span>Filtered: <strong>{formatDateString(selectedCalendarDay)}</strong></span>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '2px 6px', fontSize: '10px', minWidth: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border-muted)', color: 'var(--text-primary)', cursor: 'pointer' }}
                          onClick={() => setSelectedCalendarDay(null)}
                        >
                          Clear
                        </button>
                      </div>
                    ) : (
                      <div style={{ marginTop: '10px', background: 'var(--bg-input)', border: '1px dashed var(--border-muted)', borderRadius: '6px', padding: '8px 12px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                        Please click a date on the calendar above.
                      </div>
                    )}
                  </div>
                )}

                {filterBasis === 'month' && (
                  <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-muted)', borderRadius: '8px', padding: '15px', boxShadow: 'var(--shadow-lg)' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Select Month</label>
                    <input
                      type="month"
                      className="form-control"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    />
                    {!selectedMonth && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>Choose a month to start filtering.</span>
                    )}
                  </div>
                )}

                {filterBasis === 'year' && (
                  <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-muted)', borderRadius: '8px', padding: '15px', boxShadow: 'var(--shadow-lg)' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Select Year</label>
                    <select
                      className="form-control"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            <div className="table-wrapper" style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ minWidth: '2200px', fontSize: '0.75rem' }}>
                <thead>
                  <tr>
                    <th>Booking Ref</th>
                    <th>Created Date</th>
                    <th>Basis</th>
                    <th>Buyer</th>
                    <th>Style</th>
                    <th>PO</th>
                    <th>Fabric Source</th>
                    <th>Garments Item</th>
                    <th>Body Parts</th>
                    <th>Fabric Color</th>
                    <th>Yarn Type</th>
                    <th>Emb Type</th>
                    <th>Emb Name</th>
                    <th>Fabric Type</th>
                    <th>Fabric Composition</th>
                    <th>GSM</th>
                    <th>Fabric Dia</th>
                    <th>Lab Dip No</th>
                    <th>Garments Qty</th>
                    <th>UOM</th>
                    <th>Budget Qty</th>
                    <th>WO Qty</th>
                    <th>Short Booking Qty</th>
                    <th>Avg Rate</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Booking By</th>
                    <th>Remarks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookingItems.map((row, idx) => {
                    const shortQty = row.basis === 'Short' ? row.work_order_quantity : 0;
                    const bookingByDetails = `${row.booking_by || 'Merchandiser'} (${row.created_at || row.booking_date || ''})`;

                    return (
                      <tr key={idx}>
                        <td><strong>{row.booking_reference}</strong></td>
                        <td>{row.booking_date}</td>
                        <td>
                          <span className={`badge badge-${row.basis === 'Main' ? 'approved' : 'pending'}`}>{row.basis} Booking</span>
                        </td>
                        <td>{row.buyer || 'N/A'}</td>
                        <td>{row.style_no || 'N/A'}</td>
                        <td>{row.po_no || 'N/A'}</td>
                        <td>{row.yarn_type && row.yarn_type !== 'N/A' ? 'Production' : 'Local'}</td>
                        <td>{row.garments_item || 'N/A'}</td>
                        <td>{row.body_parts || 'N/A'}</td>
                        <td>{row.fabric_color || row.color || 'N/A'}</td>
                        <td>{row.yarn_type || 'N/A'}</td>
                        <td>{row.embellishment_type || 'N/A'}</td>
                        <td>{row.embellishment_name || 'N/A'}</td>
                        <td>{row.fabric_type || 'N/A'}</td>
                        <td>{row.fabric_composition || 'N/A'}</td>
                        <td>{row.gsm || 'N/A'}</td>
                        <td>{row.fabric_dia || 'N/A'}</td>
                        <td>{row.lab_dip || 'N/A'}</td>
                        <td>{row.garments_quantity || 0}</td>
                        <td>{row.uom || 'N/A'}</td>
                        <td>{row.budget_quantity?.toFixed(2) || 0}</td>
                        <td>{row.work_order_quantity?.toFixed(2) || 0}</td>
                        <td>{shortQty?.toFixed(2) || 0}</td>
                        <td>${row.rate?.toFixed(2) || 0}</td>
                        <td style={{ fontWeight: 'bold' }}>${row.amount?.toFixed(2) || 0}</td>
                        <td>
                          <span className={`badge badge-${row.status?.toLowerCase() || 'pending'}`}>{row.status}</span>
                        </td>
                        <td>{bookingByDetails}</td>
                        <td>{row.remarks || 'N/A'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn btn-secondary btn-sm" title="View Print Format" onClick={() => {
                              const b = bookings.find(x => x.id === row.booking_id);
                              if (b) setViewingBooking(b);
                            }}>
                              <Printer size={14} /> View
                            </button>
                            <button className="btn btn-secondary btn-sm" title="Edit Booking Specs" onClick={() => {
                              const b = bookings.find(x => x.id === row.booking_id);
                              if (b) handleOpenEditModal(b);
                            }}>
                              <Edit2 size={14} /> Edit
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              title="Submit to Manager for Approval"
                              style={{ background: '#1d4ed8', color: '#ffffff', border: 'none' }}
                              onClick={() => handleSubmitToManager(row.booking_id)}
                              disabled={row.status === 'Approved' || row.status === 'Pending Approval' || row.status === 'Pending'}
                            >
                              Submit to Manager
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              title="Delete Booking"
                              style={{ background: '#be123c', color: '#ffffff', border: 'none' }}
                              onClick={() => handleDeleteBooking(row.booking_id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredBookingItems.length === 0 && (
                    <tr>
                      <td colSpan={29} style={{ textAlign: 'center', color: '#94a3b8' }}>No fabric bookings matched search parameters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: APPROVAL TAB */}
      {isApprovalOnly && (() => {
        const approvalItemsRows = getFilteredApprovalItemsRows();

        return (
          <div className="dashboard-card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <h3 className="card-title">Fabric Booking Approval Panel</h3>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--text-secondary)' }}>Filter Mode:</label>
                  <select
                    className="form-control"
                    style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
                    value={appFilterBasis}
                    onChange={(e) => {
                      setAppFilterBasis(e.target.value as any);
                      setAppSelectedCalendarDay(null);
                      setAppSelectedMonth('');
                      setAppSelectedYear('2026');
                    }}
                  >
                    <option value="all">Show All Requests</option>
                    <option value="day">By Specific Day (Calendar)</option>
                    <option value="month">By Specific Month</option>
                    <option value="year">By Specific Year</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--text-secondary)' }}>Simulate Role:</label>
                  <select
                    className="form-control"
                    style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
                    value={simulatedRole}
                    onChange={(e) => setSimulatedRole(e.target.value as any)}
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="production_manager">Production Manager</option>
                    <option value="admin_user">Store Manager</option>
                    <option value="unit_user">Merchandiser</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Search & Filter Bar (Quotation Approval style) */}
            <div style={{ padding: '20px 20px 0 20px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', width: '100%', background: 'transparent' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search Style, Booking Ref, Buyer, PO, or Supplier..."
                  value={appSearchText}
                  onChange={e => setAppSearchText(e.target.value)}
                  style={{ paddingLeft: '36px', height: '36px', background: 'var(--bg-input)', border: '1px solid var(--border-muted)', borderRadius: '6px', color: 'var(--text-primary)' }}
                />
              </div>
              <select
                className="form-control"
                value={appStatusFilter}
                onChange={e => setAppStatusFilter(e.target.value)}
                style={{ width: '220px', height: '36px', background: 'var(--bg-input)', border: '1px solid var(--border-muted)', borderRadius: '6px', color: 'var(--text-primary)' }}
              >
                <option value="All">All Requests</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Draft">Draft</option>
              </select>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                Found {approvalItemsRows.length} Records
              </div>
            </div>

            {/* Filter inputs displayed on top when appFilterBasis is not 'all' */}
            {appFilterBasis !== 'all' && (
              <div style={{ padding: '0 20px', marginTop: '15px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {appFilterBasis === 'day' && (
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Click Date to Filter:</div>
                    {renderAppCalendar()}
                    {appSelectedCalendarDay ? (
                      <div style={{ marginTop: '10px', background: 'var(--primary-glow)', border: '1px solid var(--primary)', borderRadius: '6px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-primary)' }}>
                        <span>Filtered: <strong>{formatDateString(appSelectedCalendarDay)}</strong></span>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '2px 6px', fontSize: '10px', minWidth: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border-muted)', color: 'var(--text-primary)', cursor: 'pointer' }}
                          onClick={() => setAppSelectedCalendarDay(null)}
                        >
                          Clear
                        </button>
                      </div>
                    ) : (
                      <div style={{ marginTop: '10px', background: 'var(--bg-input)', border: '1px dashed var(--border-muted)', borderRadius: '6px', padding: '8px 12px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                        Please click a date on the calendar above.
                      </div>
                    )}
                  </div>
                )}

                {appFilterBasis === 'month' && (
                  <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-muted)', borderRadius: '8px', padding: '15px', boxShadow: 'var(--shadow-lg)' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Select Month</label>
                    <input
                      type="month"
                      className="form-control"
                      value={appSelectedMonth}
                      onChange={(e) => setAppSelectedMonth(e.target.value)}
                    />
                    {!appSelectedMonth && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>Choose a month to start filtering.</span>
                    )}
                  </div>
                )}

                {appFilterBasis === 'year' && (
                  <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-muted)', borderRadius: '8px', padding: '15px', boxShadow: 'var(--shadow-lg)' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Select Year</label>
                    <select
                      className="form-control"
                      value={appSelectedYear}
                      onChange={(e) => setAppSelectedYear(e.target.value)}
                    >
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028</option>
                    </select>
                  </div>
                )}
              </div>
            )}


            <div className="table-wrapper" style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ minWidth: '2600px', fontSize: '0.75rem' }}>
                <thead>
                  <tr>
                    <th>SL</th>
                    <th>Buyer</th>
                    <th>Style</th>
                    <th>PO</th>
                    <th>Garments Color</th>
                    <th>Fabric Color</th>
                    <th>Yarn Type</th>
                    <th>Yarn Tag</th>
                    <th>Garment Certificate</th>
                    <th>Emb Type</th>
                    <th>Emb Name</th>
                    <th>Fabric Type</th>
                    <th>Fabric Composition</th>
                    <th>GSM</th>
                    <th>Fabric Dia</th>
                    <th>Lap Dip</th>
                    <th>Garments Quantity</th>
                    <th>Fabric Consumption</th>
                    <th>Total Fabric Quantity (KG)</th>
                    <th>Booking Type</th>
                    <th>Average Rate</th>
                    <th>UOM</th>
                    <th>Amount quantity</th>
                    <th>Amount Booking</th>
                    <th>Quantity ($)</th>
                    <th>Quantity (Yds)</th>
                    <th>Request by & Date</th>
                    <th>Approved by & Date</th>
                    <th>Approved Status (Yes/No)</th>
                    <th>Approval Action</th>
                  </tr>
                </thead>
                <tbody>
                  {approvalItemsRows.map((row, idx) => {
                    const garmentsQty = parseFloat(row.garments_quantity || 0);
                    const woQty = parseFloat(row.work_order_quantity || 0);
                    const cons = garmentsQty > 0 ? (woQty / garmentsQty).toFixed(4) : 'N/A';

                    const totalKg = String(row.uom).toLowerCase() === 'kg' ? woQty.toFixed(2) : '0.00';
                    const totalYds = String(row.uom).toLowerCase() === 'yds' ? woQty.toFixed(2) : '0.00';
                    const bookingAmt = woQty * parseFloat(row.rate || 0);

                    const requestDetails = `${row.booking_by || 'Merchandiser'} (${row.booking_date})`;
                    const approveDetails = row.approved_by ? `${row.approved_by} (${row.approved_date})` : 'N/A';
                    const approvedYesNo = row.status === 'Approved' ? 'Yes' : 'No';

                    return (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{row.buyer || 'N/A'}</td>
                        <td>{row.style_no || 'N/A'}</td>
                        <td>{row.po_no || 'N/A'}</td>
                        <td>{row.color || 'N/A'}</td>
                        <td>{row.fabric_color || row.color || 'N/A'}</td>
                        <td>{row.yarn_type || 'N/A'}</td>
                        <td>{row.yarn_tag || 'YT-991'}</td>
                        <td>{row.garments_cert || 'Oeko-Tex 100'}</td>
                        <td>{row.embellishment_type || 'N/A'}</td>
                        <td>{row.embellishment_name || 'N/A'}</td>
                        <td>{row.fabric_type || 'N/A'}</td>
                        <td>{row.fabric_composition || 'N/A'}</td>
                        <td>{row.gsm || 'N/A'}</td>
                        <td>{row.fabric_dia || 'N/A'}</td>
                        <td>{row.lab_dip || 'N/A'}</td>
                        <td>{garmentsQty}</td>
                        <td>{cons}</td>
                        <td style={{ fontWeight: 'bold' }}>{totalKg}</td>
                        <td>
                          <span className={`badge badge-${row.basis === 'Main' ? 'approved' : 'pending'}`}>{row.basis}</span>
                        </td>
                        <td>${parseFloat(row.rate || 0).toFixed(4)}</td>
                        <td>{row.uom || 'Kg'}</td>
                        <td>{woQty.toFixed(2)}</td>
                        <td style={{ fontWeight: 'bold' }}>${bookingAmt.toFixed(2)}</td>
                        <td>${bookingAmt.toFixed(2)}</td>
                        <td>{totalYds}</td>
                        <td>{requestDetails}</td>
                        <td>{approveDetails}</td>
                        <td>
                          <span className={`badge badge-${row.status === 'Approved' ? 'approved' : 'pending'}`}>{approvedYesNo}</span>
                        </td>
                        <td>
                          {row.status === 'Pending' || row.status === 'Pending Approval' ? (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                className="btn btn-success btn-sm"
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', fontSize: '0.7rem' }}
                                onClick={() => handleApprovalAction(row.booking_id, true)}
                                disabled={simulatedRole !== 'production_manager' && simulatedRole !== 'super_admin'}
                                title={simulatedRole !== 'production_manager' && simulatedRole !== 'super_admin' ? "Only Production Manager can approve" : "Approve Booking"}
                              >
                                <CheckCircle size={12} /> Approve
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', fontSize: '0.7rem' }}
                                onClick={() => handleApprovalAction(row.booking_id, false)}
                                disabled={simulatedRole !== 'production_manager' && simulatedRole !== 'super_admin'}
                                title={simulatedRole !== 'production_manager' && simulatedRole !== 'super_admin' ? "Only Production Manager can reject" : "Reject Booking"}
                              >
                                <XCircle size={12} /> Reject
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', fontSize: '0.7rem', backgroundColor: '#be123c' }}
                                onClick={() => handleDeleteBooking(row.booking_id)}
                                disabled={simulatedRole !== 'production_manager' && simulatedRole !== 'super_admin'}
                                title={simulatedRole !== 'production_manager' && simulatedRole !== 'super_admin' ? "Only Production Manager/Super Admin can delete" : "Delete Booking"}
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>Submitted</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {approvalItemsRows.length === 0 && (
                    <tr>
                      <td colSpan={30} style={{ textAlign: 'center', color: '#94a3b8' }}>No approval requests matching filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* 3. VIEW PRINT/INVOICE MODAL (PDF Sheet replica) */}
      {viewingBooking && (() => {
        // Find budget metadata for booking
        const totalWoAmt = (viewingBooking.items || []).reduce((sum: number, it: any) => sum + (it.amount || 0), 0);
        const garmentsQtySum = (viewingBooking.items || []).reduce((sum: number, it: any) => sum + (it.garments_qty || 0), 0);
        const excessCutVal = garmentsQtySum + 20; // extra cut simulator

        return (
          <div className="modal-overlay" style={{ zIndex: 1100 }}>
            <div className="modal-content" style={{ maxWidth: '1000px', width: '95%' }}>
              <div className="modal-header" style={{ borderBottom: '2px solid #0f172a' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Printer /> Booking Sheet View Format
                </h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => window.print()} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Print Sheet / Save PDF
                  </button>
                  <XCircle className="modal-close" onClick={() => setViewingBooking(null)} />
                </div>
              </div>

              <div id="booking-sheet-print" style={{ padding: '20px', background: '#fff', color: '#0f172a', fontFamily: 'Calibri, Arial, sans-serif', fontSize: '0.75rem' }}>
                {/* Printable Header */}
                <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '2px 0' }}>{userCompany}</h2>
                  <h3 style={{ fontSize: '1.1rem', margin: '2px 0', color: '#475569' }}>{userUnit}</h3>
                  <p style={{ margin: '2px 0', color: '#64748b' }}>Ashulia, Dhaka</p>
                  <div style={{ border: '1px solid #0f172a', padding: '6px', fontWeight: 'bold', display: 'inline-block', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Fabric Booking Sheet
                  </div>
                </div>

                {/* Primary Info Sheet */}
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '4px 8px', background: '#f8fafc', fontWeight: 'bold', borderRight: '1px solid #cbd5e1', width: '15%' }}>Buyer:</td>
                      <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1', width: '18%' }}>{viewingBooking.buyer || 'N/A'}</td>
                      <td style={{ padding: '4px 8px', background: '#f8fafc', fontWeight: 'bold', borderRight: '1px solid #cbd5e1', width: '15%' }}>Booking No:</td>
                      <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1', width: '18%' }}>{viewingBooking.booking_reference}</td>
                      <td style={{ padding: '4px 8px', background: '#f8fafc', fontWeight: 'bold', borderRight: '1px solid #cbd5e1', width: '15%' }}>Booking Date:</td>
                      <td style={{ padding: '4px 8px', width: '19%' }}>{viewingBooking.booking_date}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '4px 8px', background: '#f8fafc', fontWeight: 'bold', borderRight: '1px solid #cbd5e1' }}>Supplier Name:</td>
                      <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>{viewingBooking.supplier_name}</td>
                      <td style={{ padding: '4px 8px', background: '#f8fafc', fontWeight: 'bold', borderRight: '1px solid #cbd5e1' }}>Season:</td>
                      <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>Summer 2026</td>
                      <td style={{ padding: '4px 8px', background: '#f8fafc', fontWeight: 'bold', borderRight: '1px solid #cbd5e1' }}>Delivery Date:</td>
                      <td style={{ padding: '4px 8px' }}>{viewingBooking.delivery_date || 'N/A'}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '4px 8px', background: '#f8fafc', fontWeight: 'bold', borderRight: '1px solid #cbd5e1' }}>Address:</td>
                      <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>Dhaka, Bangladesh</td>
                      <td style={{ padding: '4px 8px', background: '#f8fafc', fontWeight: 'bold', borderRight: '1px solid #cbd5e1' }}>Order Status:</td>
                      <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>Confirm</td>
                      <td style={{ padding: '4px 8px', background: '#f8fafc', fontWeight: 'bold', borderRight: '1px solid #cbd5e1' }}>Approval Status:</td>
                      <td style={{ padding: '4px 8px' }}>{viewingBooking.status}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '4px 8px', background: '#f8fafc', fontWeight: 'bold', borderRight: '1px solid #cbd5e1' }}>Attention:</td>
                      <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>{viewingBooking.attention || 'N/A'}</td>
                      <td style={{ padding: '4px 8px', background: '#f8fafc', fontWeight: 'bold', borderRight: '1px solid #cbd5e1' }}>Dept:</td>
                      <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>Mens Department</td>
                      <td style={{ padding: '4px 8px', background: '#f8fafc', fontWeight: 'bold', borderRight: '1px solid #cbd5e1' }}>Dealing Merchant:</td>
                      <td style={{ padding: '4px 8px' }}>Supervisor Merchant</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '4px 8px', background: '#f8fafc', fontWeight: 'bold', borderRight: '1px solid #cbd5e1' }}>Currency:</td>
                      <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>{viewingBooking.currency || 'USD'}</td>
                      <td style={{ padding: '4px 8px', background: '#f8fafc', fontWeight: 'bold', borderRight: '1px solid #cbd5e1' }}>Garments Qty:</td>
                      <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>{garmentsQtySum} Pcs</td>
                      <td style={{ padding: '4px 8px', background: '#f8fafc', fontWeight: 'bold', borderRight: '1px solid #cbd5e1' }}>Extra Cut Quantity:</td>
                      <td style={{ padding: '4px 8px' }}>{excessCutVal} Pcs</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 8px', background: '#f8fafc', fontWeight: 'bold', borderRight: '1px solid #cbd5e1' }}>Remarks:</td>
                      <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }} colSpan={3}>{viewingBooking.remarks || 'N/A'}</td>
                      <td style={{ padding: '4px 8px', background: '#f8fafc', fontWeight: 'bold', borderRight: '1px solid #cbd5e1' }}>Budget Reference:</td>
                      <td style={{ padding: '4px 8px' }}>{viewingBooking.budget_reference || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Fabric Details Grid */}
                <h4 style={{ fontWeight: 'bold', fontSize: '0.85rem', margin: '15px 0 6px 0', borderBottom: '2px solid #0f172a', paddingBottom: '4px' }}>Fabric Booking Specifications</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', width: '5%' }}>SL</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>Style</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>Gmts Item</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>Body Parts</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>Fabric Composition</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', width: '6%', textAlign: 'right' }}>GSM</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', width: '6%', textAlign: 'right' }}>Dia</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>Gmts Color</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>Fab Color</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', width: '5%', textAlign: 'right' }}>LD</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', width: '8%', textAlign: 'right' }}>Act. Fab. Qty</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', width: '6%', textAlign: 'right' }}>P. Loss %</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', width: '6%', textAlign: 'right' }}>Grey Cons</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', width: '5%' }}>UOM</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', width: '8%', textAlign: 'right' }}>T. Fab. Qty</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', width: '6%', textAlign: 'right' }}>Avg Rate</th>
                      <th style={{ padding: '4px 6px', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(viewingBooking.items || []).map((it: any, i: number) => (
                      <tr key={i} style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{i + 1}</td>
                        <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{it.style_no || viewingBooking.style_no}</td>
                        <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{it.garments_item}</td>
                        <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{it.body_parts}</td>
                        <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{it.fabric_composition}</td>
                        <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>{it.gsm || 180}</td>
                        <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>{it.fabric_dia || 'N/A'}</td>
                        <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{it.color}</td>
                        <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{it.fabric_color}</td>
                        <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>{it.lab_dip || 'N/A'}</td>
                        <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>{it.garments_qty}</td>
                        <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>{it.excess_pct}%</td>
                        <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>{(it.total_qty / (it.garments_qty || 1)).toFixed(4)}</td>
                        <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{it.uom || 'Kg'}</td>
                        <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold' }}>{it.work_order_quantity?.toFixed(2)}</td>
                        <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>${parseFloat(it.rate).toFixed(4)}</td>
                        <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 'bold' }}>${parseFloat(it.amount || (it.work_order_quantity * it.rate)).toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                      <td colSpan={10} style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>Total</td>
                      <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>{garmentsQtySum}</td>
                      <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}></td>
                      <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}></td>
                      <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}></td>
                      <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>{(viewingBooking.items || []).reduce((sum: number, it: any) => sum + (it.work_order_quantity || 0), 0).toFixed(2)}</td>
                      <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}></td>
                      <td style={{ padding: '4px 6px', textAlign: 'right' }}>{formatMoney(totalWoAmt)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Yarn Cost Grid */}
                <h4 style={{ fontWeight: 'bold', fontSize: '0.85rem', margin: '15px 0 6px 0', borderBottom: '2px solid #0f172a', paddingBottom: '4px' }}>Yarn Specifications</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', width: '20%' }}>Unique Id</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', width: '10%' }}>Style</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>Fabric Description</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>Yarn Description</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', width: '6%' }}>UOM</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', width: '8%', textAlign: 'right' }}>Yarn Cons</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', width: '8%', textAlign: 'right' }}>Rate</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', width: '8%', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', width: '10%', textAlign: 'right' }}>Total Yarn Cons</th>
                      <th style={{ padding: '4px 6px', textAlign: 'right' }}>Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(viewingBooking.items || []).filter((it: any) => it.yarn_type && it.yarn_type !== 'N/A').map((it: any, i: number) => {
                      const totalCons = it.work_order_quantity;
                      const totalAmt = totalCons * it.rate;
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{viewingBooking.booking_reference}-{i + 1}</td>
                          <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{it.style_no}</td>
                          <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{it.fabric_type} {it.fabric_composition}</td>
                          <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{it.yarn_type}</td>
                          <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{it.uom}</td>
                          <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>{(totalCons / it.garments_qty).toFixed(4)}</td>
                          <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>${parseFloat(it.rate).toFixed(4)}</td>
                          <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>${(totalCons / it.garments_qty * it.rate).toFixed(4)}</td>
                          <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold' }}>{totalCons.toFixed(2)}</td>
                          <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 'bold' }}>${totalAmt.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Total in words */}
                <div style={{ borderTop: '2px solid #cbd5e1', paddingTop: '10px', marginBottom: '20px' }}>
                  <p style={{ margin: '3px 0', fontSize: '0.85rem' }}>
                    <strong>Total Fabric Amount:</strong> <span style={{ color: '#1d4ed8' }}>{formatMoney(totalWoAmt)} USD</span>
                  </p>
                  <p style={{ margin: '3px 0', fontSize: '0.8rem', textTransform: 'capitalize', fontStyle: 'italic', color: '#475569' }}>
                    <strong>In Words:</strong> {translateToWords(totalWoAmt)} Only.
                  </p>
                </div>

                {/* Terms and Conditions */}
                <div style={{ marginTop: '20px', background: '#f8fafc', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                  <h5 style={{ fontWeight: 'bold', fontSize: '0.8rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '6px' }}>Terms & Conditions:</h5>
                  <ul style={{ margin: 0, paddingLeft: '15px', listStyleType: 'square' }}>
                    {viewingBooking.terms_conditions?.split('\n* ').map((term: string, idx: number) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>{term}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-20 text-right" style={{ marginTop: '20px' }}>
                <button className="btn btn-secondary" onClick={() => setViewingBooking(null)}>Close Print Window</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 4. MAIN FABRIC BOOKING ENTRY MODAL (Phase 1 & 2) */}
      {showModal && (
        <div className="modal-overlay" style={{ zIndex: 1050 }}>
          <div className="modal-content" style={{ maxWidth: '950px', width: '95%' }}>
            <div className="modal-header">
              <h3>{editingBooking ? `Edit Fabric Booking: ${editingBooking.booking_reference}` : 'Create New Fabric Booking'}</h3>
              <XCircle className="modal-close" onClick={() => setShowModal(false)} />
            </div>

            {errorMsg && (
              <div className="alert-message alert-danger" style={{ marginBottom: '15px' }}>
                <AlertCircle size={16} /> {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveBooking}>

              <div className="grid-3" style={{ background: '#f8fafc', padding: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Basis *</label>
                  <select className="form-control" value={basis} onChange={e => setBasis(e.target.value as any)}>
                    <option value="Main">Main Booking</option>
                    <option value="Short">Short Booking</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Style Reference *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedStyle}
                      onChange={e => handleStyleChange(e.target.value)}
                      placeholder="Type Style Reference..."
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ whiteSpace: 'nowrap' }}
                      onClick={handleStyleFetchAndAutofill}
                    >
                      Get & Auto Fill
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Budget Reference ID * (Ctrl + click to select multiple)</label>
                  <select
                    multiple
                    className="form-control"
                    style={{ height: '70px' }}
                    value={selectedBudgetIds}
                    onChange={e => {
                      const values = Array.from(e.target.selectedOptions, opt => opt.value);
                      handleBudgetIdsChange(values);
                    }}
                    required
                  >
                    {budgets.filter(b => !selectedStyle || String(b.style_no).toLowerCase() === selectedStyle.toLowerCase()).map(b => (
                      <option key={b.id} value={b.id.toString()}>{b.budget_reference} (Style: {b.style_no})</option>
                    ))}
                  </select>
                </div>

                {basis === 'Short' && (
                  <div className="form-group" style={{ gridColumn: 'span 3' }}>
                    <label className="form-label">Link Approved Main Bookings * (Ctrl + click to select multiple)</label>
                    <select
                      multiple
                      className="form-control"
                      style={{ height: '70px' }}
                      value={selectedMainBookingIds}
                      onChange={e => {
                        const values = Array.from(e.target.selectedOptions, opt => opt.value);
                        handleMainBookingSelection(values);
                      }}
                      required
                    >
                      {bookings.filter(b => b.basis === 'Main' && b.status === 'Approved').map(b => (
                        <option key={b.id} value={b.id.toString()}>{b.booking_reference} (Style: {b.style_no})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Auto-populated Budget Details Block */}
              <div className="grid-4" style={{ background: '#f1f5f9', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '15px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 'bold' }}>Buyer (Auto)</label>
                  <input type="text" className="form-control" style={{ background: '#e2e8f0', color: '#475569' }} value={buyer} readOnly />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 'bold' }}>Fabric Source (Auto)</label>
                  <input type="text" className="form-control" style={{ background: '#e2e8f0', color: '#475569' }} value={fabricSource} readOnly />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 'bold' }}>Fabric Composition (Auto)</label>
                  <input type="text" className="form-control" style={{ background: '#e2e8f0', color: '#475569' }} value={fabricComposition} readOnly />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 'bold' }}>Dealing Merchant (Auto)</label>
                  <input type="text" className="form-control" style={{ background: '#e2e8f0', color: '#475569' }} value={dealingMerchant} readOnly />
                </div>
              </div>

              {/* Form Metadata Fields */}
              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Booking Date *</label>
                  <input type="date" className="form-control" value={bookingDate} onChange={e => setBookingDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Supplier Name *</label>
                  <input type="text" className="form-control" placeholder="Apex, Aman..." value={supplierName} onChange={e => setSupplierName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Delivery Date *</label>
                  <input type="date" className="form-control" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} required />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Inhouse Date</label>
                  <input type="date" className="form-control" value={inhouseDate} onChange={e => setInhouseDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Pay Mode *</label>
                  <select className="form-control" value={payMode} onChange={e => setPayMode(e.target.value)} required>
                    <option value="Credit">Credit</option>
                    <option value="Import">Import</option>
                    <option value="In House">In House</option>
                    <option value="Within Group">Within Group</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Source *</label>
                  <select className="form-control" value={source} onChange={e => setSource(e.target.value)} required>
                    <option value="Abroad/Import">Abroad/Import</option>
                    <option value="Epz">Epz</option>
                    <option value="Non-Epz/Local">Non-Epz/Local</option>
                    <option value="In House/Inventory">In House/Inventory</option>
                  </select>
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select className="form-control" value={currency} onChange={e => setCurrency(e.target.value)}>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="BDT">BDT (৳)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Attention</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Sales Manager"
                    value={attention}
                    onChange={e => setAttention(e.target.value)}
                    list="attention-suggestions"
                  />
                  <datalist id="attention-suggestions">
                    {attentionSuggestion && <option value={attentionSuggestion} />}
                  </datalist>
                </div>
                <div className="form-group">
                  <label className="form-label">Remarks</label>
                  <input type="text" className="form-control" placeholder="Booking notes..." value={remarks} onChange={e => setRemarks(e.target.value)} />
                </div>
              </div>

              {/* Sub-form popups triggers */}
              <div style={{ display: 'flex', gap: '15px', margin: '15px 0' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCcPopup(true)}>
                  Collar & Cuff info (Browse Option) [{ccList.length} rows configured]
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowTermsPopup(true)}>
                  Terms & Conditions (Browse Option) [{selectedTerms.length} active]
                </button>
                <button type="button" className="btn btn-success btn-sm" style={{ background: '#10b981', borderColor: '#10b981', marginLeft: 'auto' }} onClick={handleGetData}>
                  Get Data (Fetch Cost Spec)
                </button>
              </div>

              {/* Phase 2: Booking Details Table */}
              {bookingItems.length > 0 && (
                <div>
                  <h4 style={{ fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', margin: '20px 0 10px 0' }}>Fabric Booking Specifications (2nd Phase)</h4>
                  <div className="table-wrapper" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    <table className="data-table" style={{ fontSize: '0.75rem' }}>
                      <thead>
                        <tr>
                          <th>Buyer</th>
                          <th>Style</th>
                          <th>PO</th>
                          <th>Garments Item</th>
                          <th>Body Parts</th>
                          <th>Garments Color</th>
                          <th>Fabric Color</th>
                          <th>Yarn Type</th>
                          <th>Emb Type</th>
                          <th>Emb Name</th>
                          <th>Fabric Type</th>
                          <th>Composition</th>
                          <th>GSM</th>
                          <th>Fabric Dia</th>
                          <th>Lab Dip</th>
                          <th>Garments Qty</th>
                          <th>Total Fabric Qty (KG)</th>
                          <th>UOM</th>
                          <th>Budget Qty</th>
                          <th>WO Qty</th>
                          <th>Rate</th>
                          <th>Amount</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookingItems.map((it, idx) => (
                          <tr key={idx}>
                            <td>{it.buyer}</td>
                            <td>{it.style_no}</td>
                            <td>{it.po_no}</td>
                            <td>{it.garments_item}</td>
                            <td>{it.body_parts}</td>
                            <td>{it.color}</td>
                            <td>{it.fabric_color || it.color}</td>
                            <td>{it.yarn_type}</td>
                            <td>{it.embellishment_type || 'N/A'}</td>
                            <td>{it.embellishment_name || 'N/A'}</td>
                            <td>{it.fabric_type}</td>
                            <td>{it.fabric_composition}</td>
                            <td>{it.gsm}</td>
                            <td>{it.fabric_dia}</td>
                            <td>
                              <input
                                type="text"
                                className="form-control"
                                style={{ width: '80px', height: '24px', fontSize: '0.7rem' }}
                                value={it.lab_dip}
                                onChange={e => {
                                  const c = [...bookingItems];
                                  c[idx].lab_dip = e.target.value;
                                  setBookingItems(c);
                                }}
                              />
                            </td>
                            <td>{it.garments_quantity}</td>
                            <td>{it.total_fabric_quantity?.toFixed(2)}</td>
                            <td>{it.uom}</td>
                            <td>{it.budget_quantity?.toFixed(2)}</td>
                            <td>
                              <input
                                type="number"
                                className="form-control"
                                style={{ width: '70px', height: '24px', fontSize: '0.7rem', textAlign: 'right' }}
                                value={it.work_order_quantity}
                                onChange={e => {
                                  const val = parseFloat(e.target.value) || 0;
                                  const c = [...bookingItems];
                                  c[idx].work_order_quantity = val;
                                  c[idx].amount = val * c[idx].rate;
                                  setBookingItems(c);
                                }}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control"
                                style={{ width: '60px', height: '24px', fontSize: '0.7rem', textAlign: 'right' }}
                                value={it.rate}
                                onChange={e => {
                                  const val = parseFloat(e.target.value) || 0;
                                  const c = [...bookingItems];
                                  c[idx].rate = val;
                                  c[idx].amount = c[idx].work_order_quantity * val;
                                  setBookingItems(c);
                                }}
                              />
                            </td>
                            <td style={{ fontWeight: 'bold' }}>${it.amount?.toFixed(2)}</td>
                            <td>
                              <button type="button" className="btn btn-danger btn-sm" style={{ padding: '2px 6px' }} onClick={() => setBookingItems(bookingItems.filter((_, i) => i !== idx))}>
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Button to add custom rows */}
                  <div style={{ marginTop: '10px' }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => {
                      setBookingItems([...bookingItems, {
                        po_no: 'PO-custom',
                        buyer: selectedStyle ? budgets.find(x => x.style_no === selectedStyle)?.buyer || 'Zara' : 'Zara',
                        style_no: selectedStyle || 'Custom',
                        garments_item: 'Polo Shirt',
                        body_parts: 'Body Fabric',
                        color: 'Red',
                        fabric_color: 'Red',
                        yarn_type: 'N/A',
                        embellishment_type: 'N/A',
                        embellishment_name: 'N/A',
                        fabric_type: 'Jersey',
                        fabric_composition: '100% Cotton',
                        gsm: 180,
                        fabric_dia: 'Open Width',
                        lab_dip: '',
                        garments_quantity: 12000,
                        total_fabric_quantity: 1000,
                        uom: 'Kg',
                        budget_quantity: 1000,
                        work_order_quantity: 1000,
                        rate: 5.50,
                        amount: 5500,
                        size: 'M',
                        item_size: 'M',
                        excess_pct: 0,
                        total_qty: 1000
                      }]);
                    }}>
                      + Add Custom Spec Row
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-20 text-right" style={{ marginTop: '20px', borderTop: '1px solid #cbd5e1', paddingTop: '15px' }}>
                <button type="button" className="btn btn-secondary mr-10" style={{ marginRight: '10px' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> {editingBooking ? 'Update Booking' : 'Save Fabric Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL 1: COLLAR & CUFF BROWSE POPUP */}
      {showCcPopup && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }}>
            <div className="modal-header">
              <h3>Collar & Cuff Specifications Popup Manager</h3>
              <XCircle className="modal-close" onClick={() => setShowCcPopup(false)} />
            </div>

            {/* Checkbox copy directives */}
            <div style={{ display: 'flex', gap: '20px', background: '#f8fafc', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', marginBottom: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
                <input type="checkbox" checked={ccCopyAll} onChange={e => setCcCopyAll(e.target.checked)} /> Copy All
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
                <input type="checkbox" checked={ccColorWise} onChange={e => setCcColorWise(e.target.checked)} /> Color Wise
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
                <input type="checkbox" checked={ccSizeWise} onChange={e => setCcSizeWise(e.target.checked)} /> Size Wise
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
                <input type="checkbox" checked={ccPoWise} onChange={e => setCcPoWise(e.target.checked)} /> PO Wise
              </label>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>PO Number</label>
                {bookingItems.length > 0 ? (
                  <select className="form-control" value={ccPo} onChange={e => setCcPo(e.target.value)}>
                    <option value="">Select PO</option>
                    {Array.from(new Set(bookingItems.map(item => item.po_no))).map(po => (
                      <option key={po} value={po}>{po}</option>
                    ))}
                  </select>
                ) : (
                  <input type="text" className="form-control" value={ccPo} onChange={e => setCcPo(e.target.value)} />
                )}
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Garments Color</label>
                {bookingItems.length > 0 ? (
                  <select className="form-control" value={ccColor} onChange={e => setCcColor(e.target.value)}>
                    <option value="">Select Color</option>
                    {Array.from(new Set(bookingItems.map(item => item.color || item.garments_color))).map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                ) : (
                  <input type="text" className="form-control" value={ccColor} onChange={e => setCcColor(e.target.value)} />
                )}
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Garments Size</label>
                {bookingItems.length > 0 ? (
                  <select className="form-control" value={ccGmtSize} onChange={e => setCcGmtSize(e.target.value)}>
                    <option value="">Select Size</option>
                    {Array.from(new Set(bookingItems.map(item => item.size))).map(sz => (
                      <option key={sz} value={sz}>{sz}</option>
                    ))}
                  </select>
                ) : (
                  <input type="text" className="form-control" value={ccGmtSize} onChange={e => setCcGmtSize(e.target.value)} />
                )}
              </div>
            </div>
            <div className="grid-3" style={{ marginBottom: '15px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Item Size</label>
                {bookingItems.length > 0 ? (
                  <select className="form-control" value={ccItemSize} onChange={e => setCcItemSize(e.target.value)}>
                    <option value="">Select Item Size</option>
                    {Array.from(new Set(bookingItems.map(item => item.item_size || item.size))).map(isz => (
                      <option key={isz} value={isz}>{isz}</option>
                    ))}
                  </select>
                ) : (
                  <input type="text" className="form-control" value={ccItemSize} onChange={e => setCcItemSize(e.target.value)} />
                )}
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Garments Qty (Pcs)</label>
                <input type="number" className="form-control" value={ccGmtQty} onChange={e => setCcGmtQty(parseInt(e.target.value) || 0)} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Excess %</label>
                <input type="number" className="form-control" value={ccExcess} onChange={e => setCcExcess(parseInt(e.target.value) || 0)} />
              </div>
            </div>

            <button type="button" className="btn btn-secondary btn-sm" style={{ marginBottom: '15px' }} onClick={handleAddCcLine}>
              + Add Collar/Cuff Line
            </button>

            <div className="table-wrapper" style={{ maxHeight: '180px' }}>
              <table className="data-table" style={{ fontSize: '0.75rem' }}>
                <thead>
                  <tr>
                    <th>PO Number</th>
                    <th>Garments Color</th>
                    <th>Garments Size</th>
                    <th>Item Size</th>
                    <th>Garments Qty</th>
                    <th>Excess %</th>
                    <th>Total Qty</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ccList.map((cc, i) => (
                    <tr key={i}>
                      <td>{cc.po_no}</td>
                      <td>{cc.color}</td>
                      <td>{cc.gmt_size}</td>
                      <td>{cc.item_size}</td>
                      <td>{cc.gmt_qty} pcs</td>
                      <td>{cc.excess}%</td>
                      <td><strong>{cc.total_qty} pcs</strong></td>
                      <td>
                        <button type="button" className="btn btn-danger btn-sm" style={{ padding: '2px 6px' }} onClick={() => setCcList(ccList.filter((_, idx) => idx !== i))}>
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {ccList.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8' }}>No collar & cuff specs configured yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-20 text-right" style={{ marginTop: '15px' }}>
              <button type="button" className="btn btn-secondary mr-10" style={{ marginRight: '10px' }} onClick={() => setShowCcPopup(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleApplyCcRules}>Apply & Close</button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 2: TERMS & CONDITIONS BROWSE POPUP */}
      {showTermsPopup && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div className="modal-content" style={{ maxWidth: '700px', width: '90%' }}>
            <div className="modal-header">
              <h3>Terms & Conditions Browse Template Portal</h3>
              <XCircle className="modal-close" onClick={() => setShowTermsPopup(false)} />
            </div>

            {/* Template Selection list */}
            <div className="table-wrapper" style={{ maxHeight: '250px', marginBottom: '15px' }}>
              <table className="data-table" style={{ fontSize: '0.75rem' }}>
                <thead>
                  <tr>
                    <th style={{ width: '8%', textAlign: 'center' }}>✓</th>
                    <th style={{ width: '8%' }}>SI</th>
                    <th>Terms & Condition</th>
                    <th style={{ width: '12%', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {termsTemplates.map((t, idx) => {
                    const isChecked = selectedTerms.includes(t.text);
                    return (
                      <tr key={t.id}>
                        <td style={{ textAlign: 'center' }}>
                          <input type="checkbox" checked={isChecked} onChange={() => handleToggleTerm(t.text)} style={{ cursor: 'pointer' }} />
                        </td>
                        <td>{String(idx + 1).padStart(2, '0')}</td>
                        <td>{t.text}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button type="button" className="btn btn-danger btn-sm" style={{ padding: '2px 6px' }} onClick={() => {
                            setTermsTemplates(termsTemplates.filter(x => x.id !== t.id));
                            setSelectedTerms(selectedTerms.filter(x => x !== t.text));
                          }}>
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Add new term line */}
            <div style={{ background: '#f8fafc', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Enter custom terms & conditions direct text..."
                value={newTermText}
                onChange={e => setNewTermText(e.target.value)}
              />
              <button type="button" className="btn btn-success btn-sm" style={{ background: '#10b981', borderColor: '#10b981' }} onClick={handleAddTermTemplate}>
                Add Template Line
              </button>
            </div>

            <div className="mt-20 text-right" style={{ marginTop: '15px' }}>
              <button type="button" className="btn btn-primary" onClick={() => setShowTermsPopup(false)}>
                Submit & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
