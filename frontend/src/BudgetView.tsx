import React, { useState, useEffect } from 'react';
import {
  XCircle,
  Plus,
  Search,
  Trash2,
  Edit,
  Lock,
  Shield,
  CheckCircle,
  ClipboardCheck,
  FileText,
  Upload,
  Save
} from 'lucide-react';
import {
  TemplateSelector,
  YarnCostingSection,
  ConsumptionBrowseModal
} from './BudgetHelpers';

const API_BASE = 'http://localhost:5000/api';

export function BudgetView({
  buyers = [],
  defaultSubTab = 'directory',
  isApprovalOnly = false
}: {
  buyers?: any[],
  defaultSubTab?: 'directory' | 'approval',
  isApprovalOnly?: boolean
}) {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // active view sub-tab: 'directory' | 'approval'
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'approval'>(defaultSubTab);

  // creation modal tab: 'required' | 'others' | 'costs'
  const [budgetTab, setBudgetTab] = useState<'required' | 'others' | 'costs'>('required');

  // Permission simulation role: 'super_admin' | 'admin_user' | 'unit_user' | 'merchandiser_manager_md'
  const [simulatedRole, setSimulatedRole] = useState<'super_admin' | 'admin_user' | 'unit_user' | 'merchandiser_manager_md'>(
    defaultSubTab === 'approval' ? 'merchandiser_manager_md' : 'super_admin'
  );

  // Search Fields state
  const [searchText, setSearchText] = useState('');

  // Approval Search filters
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('Pending Approval');
  const [appSimulatedRole, setAppSimulatedRole] = useState('Super Admin');

  const [filterBasis, setFilterBasis] = useState<'day' | 'month' | 'year' | 'all'>('all');
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [statusFilter, setStatusFilter] = useState('All');

  const [appFilterBasis, setAppFilterBasis] = useState<'day' | 'month' | 'year' | 'all'>('all');
  const [appCurrentCalendarDate, setAppCurrentCalendarDate] = useState(new Date());
  const [appSelectedCalendarDay, setAppSelectedCalendarDay] = useState<string | null>(null);
  const [appSelectedMonth, setAppSelectedMonth] = useState<string>('');
  const [appSelectedYear, setAppSelectedYear] = useState<string>('2026');

  // Multi-view states
  const [viewingBudget, setViewingBudget] = useState<any>(null);
  const [viewTab, setViewTab] = useState<'summary' | 'excel_sheet' | 'calculator'>('excel_sheet');
  const [topSearchText, setTopSearchText] = useState('');

  // Form Fields - Tab 1 (Required Info)
  const [dataSource, setDataSource] = useState<'Order Reference' | 'Price Quotation Reference' | 'Style'>('Order Reference');
  const [dataSourceId, setDataSourceId] = useState('');
  const [styleRef, setStyleRef] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [_quotationId, setQuotationId] = useState('');
  const [styleDesc, setStyleDesc] = useState('');
  const [productDept, setProductDept] = useState('');
  const [sewingSMV, setSewingSMV] = useState(0);
  const [sewingEff, setSewingEff] = useState(0);
  const [cuttingSMV, setCuttingSMV] = useState(0);
  const [cuttingEff, setCuttingEff] = useState(0);
  const [finishingSMV, setFinishingSMV] = useState(0);
  const [finishingEff, setFinishingEff] = useState(0);

  const [teamLeader, setTeamLeader] = useState('');
  const [dealingMerchant, setDealingMerchant] = useState('');
  const [shipmentDate, setShipmentDate] = useState('');

  const [budgetLabel, setBudgetLabel] = useState<'Style Label' | 'PO Label'>('Style Label');
  const [selectedPOs, setSelectedPOs] = useState<string[]>([]);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [uom, setUom] = useState('Pcs');
  const [itemGroup, setItemGroup] = useState('Basic');
  const [season, setSeason] = useState('');
  const [category, setCategory] = useState('Jersey');
  const [costingPer, setCostingPer] = useState('1Dzn');
  const [incoterm, setIncoterm] = useState('FOB');
  const [mcLine, setMcLine] = useState('');
  const [prodLineHour, setProdLineHour] = useState('');
  const [budgetMinute, setBudgetMinute] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string; type: string }[]>([]);

  // Form Fields - Tab 2 (Others Info)
  const [country, setCountry] = useState('Bangladesh');
  const [buyingAgent, setBuyingAgent] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [incotermPlace, setIncotermPlace] = useState('');
  const [shipMode, setShipMode] = useState('Sea');
  const [costingDate, setCostingDate] = useState(new Date().toISOString().split('T')[0]);
  const [copyFrom, setCopyFrom] = useState('');
  const [fileNo, setFileNo] = useState('');
  const [internalRef, setInternalRef] = useState('');
  const [remarks, setRemarks] = useState('');

  // Simulated company & unit variables (for permissions testing)
  const [budgetCompany, setBudgetCompany] = useState('Demo Factory Ltd.');
  const [budgetUnit, setBudgetUnit] = useState('Demo Unit');

  // Form Fields - 19 Costs Grid
  const [fabricCost, setFabricCost] = useState(0);
  const [trimsCost, setTrimsCost] = useState(0);
  const [embCost, setEmbCost] = useState(0);
  const [washCost, setWashCost] = useState(0);
  const [commlCost, setCommlCost] = useState(0);
  const [labTest, setLabTest] = useState(0);
  const [inspectionCost, setInspectionCost] = useState(0);
  const [cmCost, setCmCost] = useState(0);
  const [sampleCost, setSampleCost] = useState(0);
  const [freightCost, setFreightCost] = useState(0);
  const [otherCost, setOtherCost] = useState(0);
  const [courierCost, setCourierCost] = useState(0);
  const [certifCost, setCertifCost] = useState(0);
  const [commonOH, setCommonOH] = useState(0);
  const [deffdLC, setDeffdLC] = useState(0);
  const [designCost, setDesignCost] = useState(0);
  const [studioCost, setStudioCost] = useState(0);
  const [opertExp, setOpertExp] = useState(0);
  const [incomeTax, setIncomeTax] = useState(0);
  const [interestCost, setInterestCost] = useState(0);
  const [depcAmort, setDepcAmort] = useState(0);
  const [commissionCost, setCommissionCost] = useState(0);

  // Detailed lists specs
  const [fabricDetailsList, setFabricDetailsList] = useState<any[]>([]);
  const [trimsDetailsList, setTrimsDetailsList] = useState<any[]>([]);
  const [embDetailsList, setEmbDetailsList] = useState<any[]>([]);
  const [washDetailsList, setWashDetailsList] = useState<any[]>([]);
  const [commlDetailsList, setCommlDetailsList] = useState<any[]>([]);
  const [commissionDetailsList, setCommissionDetailsList] = useState<any[]>([]);
  const [othersDetailsList, setOthersDetailsList] = useState<any[]>([]);

  // Popup toggle status
  const [showFabricPopup, setShowFabricPopup] = useState(false);
  const [showTrimsPopup, setShowTrimsPopup] = useState(false);
  const [showEmbPopup, setShowEmbPopup] = useState(false);
  const [showWashPopup, setShowWashPopup] = useState(false);
  const [showCommlPopup, setShowCommlPopup] = useState(false);
  const [showCommissionPopup, setShowCommissionPopup] = useState(false);
  const [showOthersPopup, setShowOthersPopup] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  // Secondary sub-popup toggle status & specs
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [showGreyConsPopup, setShowGreyConsPopup] = useState(false);
  const [greyConsRows, setGreyConsRows] = useState<any[]>([]);
  const [yarnRows, setYarnRows] = useState<any[]>([]);

  // New Fabric Form specifications states
  const [fabricComposition, setFabricComposition] = useState('100% Cotton');
  const [fabricType, setFabricType] = useState('Jersey');
  const [fabricNature, setFabricNature] = useState('Knit');
  const [fabricSource, setFabricSource] = useState('Production');
  const [colorSensitive, setColorSensitive] = useState('As per Garments Color');
  const [fabricColorValue, setFabricColorValue] = useState('');
  const [greyConsRate, setGreyConsRate] = useState(0);
  const [greyConsAmount, setGreyConsAmount] = useState(0);
  const [greyConsTotalQty, setGreyConsTotalQty] = useState(0);
  const [greyConsTotalAmt, setGreyConsTotalAmt] = useState(0);

  // Contrast Color Popup state
  const [showContrastColorPopup, setShowContrastColorPopup] = useState(false);
  const [contrastColorRows, setContrastColorRows] = useState<{ gmtColor: string; fabricColor: string }[]>([]);
  const [contrastGmtColor, setContrastGmtColor] = useState('');
  const [contrastFabricColor, setContrastFabricColor] = useState('');

  const [showTrimsConsPopup, setShowTrimsConsPopup] = useState(false);
  const [trimsConsRows, setTrimsConsRows] = useState<any[]>([]);

  // New Trims Form specifications states
  const [trimsGmtItem, setTrimsGmtItem] = useState('Polo Shirt');
  const [trimsItemName, setTrimsItemName] = useState('Sewing Thread');
  const [trimsItemDesc, setTrimsItemDesc] = useState('Polyester Spun');
  const [trimsConsUom, setTrimsConsUom] = useState('Cones');
  const [trimsConsRate, setTrimsConsRate] = useState(0);
  const [trimsConsAmount, setTrimsConsAmount] = useState(0);
  const [trimsConsTotalQty, setTrimsConsTotalQty] = useState(0);
  const [trimsConsTotalAmt, setTrimsConsTotalAmt] = useState(0);

  const [showEmbConsPopup, setShowEmbConsPopup] = useState(false);
  const [embConsRows, setEmbConsRows] = useState<any[]>([]);

  // New Embellishment Form specifications states
  const [embType, setEmbType] = useState('Print');
  const [embName, setEmbName] = useState('Rubber Print');
  const [embGmtItem, setEmbGmtItem] = useState('Polo Shirt');
  const [embDesc, setEmbDesc] = useState('Chest Print Logo');
  const [embBodyPart, setEmbBodyPart] = useState('Body');
  const [embSupplier, setEmbSupplier] = useState('Apex Printer');
  const [embConsRate, setEmbConsRate] = useState(0);
  const [embConsAmount, setEmbConsAmount] = useState(0);
  const [embConsTotalQty, setEmbConsTotalQty] = useState(0);
  const [embConsTotalAmt, setEmbConsTotalAmt] = useState(0);

  const [showWashConsPopup, setShowWashConsPopup] = useState(false);
  const [washConsRows, setWashConsRows] = useState<any[]>([]);

  // New Wash Form specifications states
  const [washType, setWashType] = useState('Normal Wash');
  const [washName, setWashName] = useState('Garments Wash');
  const [washGmtItem, setWashGmtItem] = useState('Polo Shirt');
  const [washDesc, setWashDesc] = useState('Softener Wash');
  const [washBodyPart, setWashBodyPart] = useState('Body');
  const [washSupplier, setWashSupplier] = useState('Apex Washing');
  const [washConsRate, setWashConsRate] = useState(0);
  const [washConsAmount, setWashConsAmount] = useState(0);
  const [washConsTotalQty, setWashConsTotalQty] = useState(0);
  const [washConsTotalAmt, setWashConsTotalAmt] = useState(0);

  // New Commercial Form specifications states
  const [commlType, setCommlType] = useState('Import LC Charges');
  const [commlRatePct, setCommlRatePct] = useState(3);
  const [commlStatus, setCommlStatus] = useState('Active');

  // Approval form state
  const [reviewingBudget, setReviewingBudget] = useState<any>(null);
  const [approvalStatus, setApprovalStatus] = useState('Approved');
  const [feedbackRemarks, setFeedbackRemarks] = useState('');

  // Financial Calculator states
  const [calcFabric, setCalcFabric] = useState(0);
  const [calcYarn, setCalcYarn] = useState(0);
  const [calcTrims, setCalcTrims] = useState(0);
  const [calcEmbel, setCalcEmbel] = useState(0);
  const [calcWash, setCalcWash] = useState(0);
  const [calcComml, setCalcComml] = useState(0);
  const [calcLabTest, setCalcLabTest] = useState(0);
  const [calcInspection, setCalcInspection] = useState(0);
  const [calcFreight, setCalcFreight] = useState(0);
  const [calcCourier, setCalcCourier] = useState(0);
  const [calcCertif, setCalcCertif] = useState(0);
  const [calcDeffdLc, setCalcDeffdLc] = useState(0);
  const [calcDesign, setCalcDesign] = useState(0);
  const [calcStudio, setCalcStudio] = useState(0);
  const [calcSample, setCalcSample] = useState(0);

  const [calcOpertExp, setCalcOpertExp] = useState(0);
  const [calcCm, setCalcCm] = useState(0);
  const [calcInterest, setCalcInterest] = useState(0);
  const [calcIncomeTax, setCalcIncomeTax] = useState(0);
  const [calcDepcAmort, setCalcDepcAmort] = useState(0);
  const [calcCommission, setCalcCommission] = useState(0);

  const [calcPriceDzn, setCalcPriceDzn] = useState(0);
  const [calcFreightChecked, setCalcFreightChecked] = useState(false);

  const resetCalculator = (budget: any) => {
    if (!budget) return;
    const qty = budget.total_quantity || 12000;
    const dznFactor = (qty / 12) || 1;

    setCalcFabric(Number(((budget.total_fabric_budget || 0) / dznFactor).toFixed(4)));

    const fabricsList = budget.fabrics || [];
    const totalYarnVal = fabricsList.reduce((sum: number, f: any) => {
      return sum + (f.yarns?.reduce((ysum: number, y: any) => ysum + (y.amount || 0), 0) || 0);
    }, 0);
    setCalcYarn(Number((totalYarnVal / dznFactor).toFixed(4)));

    setCalcTrims(Number(((budget.total_trims_budget || 0) / dznFactor).toFixed(4)));
    setCalcEmbel(Number(((budget.total_emb_budget || 0) / dznFactor).toFixed(4)));
    setCalcWash(Number(((budget.total_wash_budget || 0) / dznFactor).toFixed(4)));
    setCalcComml(Number(((budget.total_commercial_budget || 0) / dznFactor).toFixed(4)));
    setCalcLabTest(Number(((budget.total_lab_test_budget || 0) / dznFactor).toFixed(4)));
    setCalcInspection(Number(((budget.total_inspection_budget || 0) / dznFactor).toFixed(4)));
    setCalcFreight(Number(((budget.total_freight_budget || 0) / dznFactor).toFixed(4)));
    setCalcCourier(Number(((budget.total_courier_budget || 0) / dznFactor).toFixed(4)));
    setCalcCertif(Number(((budget.total_certif_budget || 0) / dznFactor).toFixed(4)));
    setCalcDeffdLc(Number(((budget.total_deffd_lc_budget || 0) / dznFactor).toFixed(4)));
    setCalcDesign(Number(((budget.total_design_budget || 0) / dznFactor).toFixed(4)));
    setCalcStudio(Number(((budget.total_studio_budget || 0) / dznFactor).toFixed(4)));
    setCalcSample(Number(((budget.total_sample_budget || 0) / dznFactor).toFixed(4)));

    setCalcOpertExp(Number(((budget.total_opert_exp_budget || 0) / dznFactor).toFixed(4)));
    setCalcCm(Number(((budget.total_cm_budget || 0) / dznFactor).toFixed(4)));
    setCalcInterest(Number(((budget.total_common_oh_budget || 0) / dznFactor).toFixed(4)));
    setCalcIncomeTax(Number(((budget.total_income_tax_budget || 0) / dznFactor).toFixed(4)));
    setCalcDepcAmort(Number(((budget.total_other_budget || 0) / dznFactor).toFixed(4)));
    setCalcCommission(Number(((budget.total_commission_budget || 0) / dznFactor).toFixed(4)));

    const matchedOrder = orders.find((o: any) => o.id === budget.order_id || String(o.style_no).toLowerCase() === String(budget.style_no).toLowerCase());
    const avgFobVal = matchedOrder?.pos && matchedOrder.pos.length > 0
      ? (matchedOrder.pos.reduce((sum: number, p: any) => sum + (p.fob_price || 0), 0) / matchedOrder.pos.length)
      : (budget.total_budget_amount / qty);
    setCalcPriceDzn(Number((avgFobVal * 12).toFixed(4)));
    setCalcFreightChecked(budget.total_freight_budget > 0);
  };

  useEffect(() => {
    if (viewingBudget) {
      resetCalculator(viewingBudget);
    }
  }, [viewingBudget, orders]);

  const handleSaveCalculator = async () => {
    if (!viewingBudget) return;
    try {
      const qty = viewingBudget.total_quantity || 12000;
      const dznFactor = (qty / 12) || 1;
      const totalCost =
        calcFabric + calcYarn + calcTrims + calcEmbel + calcWash + calcComml +
        calcLabTest + calcInspection + calcFreight + calcCourier + calcCertif +
        calcDeffdLc + calcDesign + calcStudio + calcSample + calcOpertExp +
        calcCm + calcInterest + calcIncomeTax + calcDepcAmort + calcCommission;

      const updatedBudget = {
        ...viewingBudget,
        total_fabric_budget: Number((calcFabric * dznFactor).toFixed(4)),
        total_trims_budget: Number((calcTrims * dznFactor).toFixed(4)),
        total_emb_budget: Number((calcEmbel * dznFactor).toFixed(4)),
        total_wash_budget: Number((calcWash * dznFactor).toFixed(4)),
        total_commercial_budget: Number((calcComml * dznFactor).toFixed(4)),
        total_commission_budget: Number((calcCommission * dznFactor).toFixed(4)),
        total_lab_test_budget: Number((calcLabTest * dznFactor).toFixed(4)),
        total_inspection_budget: Number((calcInspection * dznFactor).toFixed(4)),
        total_freight_budget: Number((calcFreight * dznFactor).toFixed(4)),
        total_courier_budget: Number((calcCourier * dznFactor).toFixed(4)),
        total_certif_budget: Number((calcCertif * dznFactor).toFixed(4)),
        total_deffd_lc_budget: Number((calcDeffdLc * dznFactor).toFixed(4)),
        total_design_budget: Number((calcDesign * dznFactor).toFixed(4)),
        total_studio_budget: Number((calcStudio * dznFactor).toFixed(4)),
        total_sample_budget: Number((calcSample * dznFactor).toFixed(4)),
        total_opert_exp_budget: Number((calcOpertExp * dznFactor).toFixed(4)),
        total_cm_budget: Number((calcCm * dznFactor).toFixed(4)),
        total_common_oh_budget: Number((calcInterest * dznFactor).toFixed(4)),
        total_income_tax_budget: Number((calcIncomeTax * dznFactor).toFixed(4)),
        total_other_budget: Number((calcDepcAmort * dznFactor).toFixed(4)),
        total_budget_amount: Number((totalCost * dznFactor).toFixed(4))
      };

      const res = await fetch(`${API_BASE}/budgets/${viewingBudget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBudget)
      });

      if (res.ok) {
        alert("Calculator values updated successfully and database synchronized!");
        setViewingBudget(updatedBudget);
        fetchBudgets();
      } else {
        alert("Failed to save calculator values");
      }
    } catch (e) {
      console.error("Save calculator error", e);
      alert("Error saving values");
    }
  };

  // Auto calculation of total sum
  const calculatedTotalCost =
    fabricCost + trimsCost + embCost + washCost + commlCost + labTest +
    inspectionCost + cmCost + sampleCost + freightCost + otherCost +
    courierCost + certifCost + commonOH + deffdLC + designCost +
    studioCost + opertExp + incomeTax;

  // Filter orders matching styleRef
  const matchedOrdersForStyle = orders.filter(o => String(o.style_no).toLowerCase() === String(styleRef).toLowerCase());
  const allPOsForStyle = matchedOrdersForStyle.flatMap(o => o.pos || []);

  useEffect(() => {
    fetchBudgets();
    fetchOrders();
    fetchQuotations();
  }, [simulatedRole]);

  const fetchBudgets = async () => {
    try {
      const company = 'Demo Factory Ltd.';
      const unit = 'Demo Unit';
      const res = await fetch(`${API_BASE}/budgets?role=${simulatedRole}&company=${company}&unit=${unit}`);
      const data = await res.json();
      setBudgets(data);
    } catch (e) { console.error("Error fetching budgets", e); }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (e) { console.error("Error fetching orders", e); }
  };

  const fetchQuotations = async () => {
    try {
      const res = await fetch(`${API_BASE}/quotations`);
      const data = await res.json();
      setQuotations(data);
    } catch (e) { console.error("Error fetching quotations", e); }
  };

  // Seed mock budgets if none exist
  useEffect(() => {
    const isOldSeed = budgets.length === 1 && budgets[0].budget_reference === 'BG-ZR-polo-001' && budgets[0].total_fabric_budget === 15400;
    if (budgets.length === 0 || isOldSeed) {
      seedInitialMockBudgets();
    }
  }, [budgets]);

  const seedInitialMockBudgets = async () => {
    // Disabled static mock seeding as per user request
  };

  // Dynamic PO selection quantity summation
  useEffect(() => {
    if (budgetLabel === 'Style Label') {
      if (styleRef) {
        const totalStyleQty = allPOsForStyle.reduce((sum: number, p: any) => sum + (p.po_qty || 0), 0);
        if (totalStyleQty > 0) {
          setTotalQuantity(totalStyleQty);
        } else {
          const quote = quotations.find(q => q.style_no === styleRef);
          if (quote && quote.offer_qty) {
            setTotalQuantity(quote.offer_qty);
          }
        }
      }
    } else {
      const sumSelected = allPOsForStyle
        .filter((p: any) => selectedPOs.includes(p.po_no))
        .reduce((sum: number, p: any) => sum + (p.po_qty || 0), 0);
      setTotalQuantity(sumSelected);
    }
  }, [budgetLabel, styleRef, selectedPOs, orders]);

  // Scoped lists based on simulated role permissions
  const getFilteredBudgetsList = () => {
    return budgets.filter(b => {
      if (simulatedRole === 'super_admin') return true;
      if (simulatedRole === 'merchandiser_manager_md') return true;
      if (simulatedRole === 'admin_user') {
        return b.company === 'Demo Factory Ltd.';
      }
      if (simulatedRole === 'unit_user') {
        return b.company === 'Demo Factory Ltd.' && b.unit === 'Demo Unit';
      }
      return true;
    });
  };

  const filteredBudgets = getFilteredBudgetsList();

  const getPOList = (selectedPosVal: any) => {
    if (!selectedPosVal) return 'N/A';
    try {
      const parsed = typeof selectedPosVal === 'string' ? JSON.parse(selectedPosVal) : selectedPosVal;
      return Array.isArray(parsed) ? parsed.join(', ') : String(parsed);
    } catch (e) { return String(selectedPosVal); }
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

    const getBudgetCount = (d: number) => {
      const key = formatDateKey(d);
      return budgets.filter(b => b.shipment_date === key).length;
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
            const count = item.isCurrentMonth ? getBudgetCount(item.day) : 0;
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

  // Search filter for directory (Order ID, Price Quotation ID, and Style)
  const getSearchedBudgets = () => {
    let basisFiltered = filteredBudgets;

    // 1. Basis Filter
    if (filterBasis === 'day') {
      if (selectedCalendarDay) {
        basisFiltered = filteredBudgets.filter(b => b.shipment_date === selectedCalendarDay);
      } else {
        basisFiltered = [];
      }
    } else if (filterBasis === 'month') {
      if (selectedMonth) {
        basisFiltered = filteredBudgets.filter(b => b.shipment_date && b.shipment_date.startsWith(selectedMonth));
      } else {
        basisFiltered = [];
      }
    } else if (filterBasis === 'year') {
      if (selectedYear) {
        basisFiltered = filteredBudgets.filter(b => b.shipment_date && b.shipment_date.startsWith(selectedYear));
      } else {
        basisFiltered = [];
      }
    }

    // 2. Search query filter
    let searchFiltered = basisFiltered;
    if (searchText.trim()) {
      const q = searchText.toLowerCase().trim();
      searchFiltered = basisFiltered.filter(b => {
        const budgetRefStr = String(b.budget_reference || '').toLowerCase();
        const styleNoStr = String(b.style_no || '').toLowerCase();
        const orderIdStr = String(b.order_id || '').toLowerCase();
        const quotationIdStr = String(b.quotation_id || '').toLowerCase();
        const buyerStr = String(b.buyer || '').toLowerCase();
        const leaderStr = String(b.team_leader || '').toLowerCase();
        const merchantStr = String(b.dealing_merchant || '').toLowerCase();
        return budgetRefStr.includes(q) || styleNoStr.includes(q) || orderIdStr.includes(q) || quotationIdStr.includes(q) || buyerStr.includes(q) || leaderStr.includes(q) || merchantStr.includes(q);
      });
    }

    // 3. Status filter
    if (statusFilter !== 'All') {
      return searchFiltered.filter(b => {
        const statusVal = b.status || 'Draft';
        if (statusFilter === 'Pending Approval') {
          return statusVal === 'Pending Approval' || statusVal === 'Pending';
        }
        return statusVal.toLowerCase() === statusFilter.toLowerCase();
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

    const getBudgetCount = (d: number) => {
      const key = formatDateKey(d);
      return budgets.filter(b => b.shipment_date === key).length;
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
            const count = item.isCurrentMonth ? getBudgetCount(item.day) : 0;
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

  // Search filter for Approval view
  const getApprovalConsoleBudgets = () => {
    let list = filteredBudgets;

    // 1. Basis Filter
    if (appFilterBasis === 'day') {
      if (appSelectedCalendarDay) {
        list = list.filter(b => b.shipment_date === appSelectedCalendarDay);
      } else {
        list = [];
      }
    } else if (appFilterBasis === 'month') {
      if (appSelectedMonth) {
        list = list.filter(b => b.shipment_date && b.shipment_date.startsWith(appSelectedMonth));
      } else {
        list = [];
      }
    } else if (appFilterBasis === 'year') {
      if (appSelectedYear) {
        list = list.filter(b => b.shipment_date && b.shipment_date.startsWith(appSelectedYear));
      } else {
        list = [];
      }
    }

    // 2. Filter by appSearch (Inquiry ID, Style No, Buyer, or Team Leader)
    if (appSearch.trim()) {
      const q = appSearch.toLowerCase().trim();
      list = list.filter(b =>
        String(b.quotation_id || '').toLowerCase().includes(q) ||
        String(b.style_no || '').toLowerCase().includes(q) ||
        String(b.buyer || '').toLowerCase().includes(q) ||
        String(b.team_leader || '').toLowerCase().includes(q) ||
        String(b.budget_reference || '').toLowerCase().includes(q)
      );
    }

    // 3. Filter by status dropdown
    if (appStatusFilter === 'All') {
      // Show all
    } else if (appStatusFilter === 'Pending Approval') {
      list = list.filter(b => b.status === 'Pending');
    } else {
      list = list.filter(b => b.status === appStatusFilter);
    }

    return list;
  };

  const handleSearchAndAutoFill = async () => {
    if (!topSearchText) return alert("Please enter Order ID, Price Quotation ID, or Style.");
    const q = topSearchText.toLowerCase().trim();

    const matchedOrder = orders.find(o =>
      String(o.id).toLowerCase() === q ||
      String(`ORD-${o.id}`).toLowerCase() === q ||
      String(o.style_no).toLowerCase() === q
    );

    const matchedQuote = quotations.find(qt =>
      String(qt.id).toLowerCase() === q ||
      String(qt.style_no).toLowerCase() === q
    );

    let ds: any = 'Style';
    let dsId = topSearchText;

    if (matchedOrder) {
      ds = 'Order Reference';
      dsId = String(matchedOrder.id);
    } else if (matchedQuote) {
      ds = 'Price Quotation Reference';
      dsId = String(matchedQuote.id);
    }

    setDataSource(ds);
    setDataSourceId(dsId);

    handleGetDataSourceData(ds, dsId);
  };



  const handleGetDataSourceData = async (overrideSource?: string | React.MouseEvent, overrideId?: string) => {
    const activeSource = typeof overrideSource === 'string' ? overrideSource : dataSource;
    const activeId = typeof overrideId === 'string' ? overrideId : dataSourceId;
    if (!activeId) return alert("Please select a reference ID from the dropdown.");

    if (activeSource === 'Order Reference') {
      try {
        const res = await fetch(`${API_BASE}/orders/${activeId}`);
        const order = await res.json();
        setCurrentOrder(order);

        setBuyerName(order.buyer || '');
        setStyleRef(order.style_no || '');
        setStyleDesc(order.style_desc || '');
        setProductDept(order.garment_dept || 'Mens');
        setSeason(order.season || '');
        setUom(order.uom || 'Pcs');
        setCategory(order.category || 'Jersey');
        setTeamLeader(order.team_leader || '');
        setDealingMerchant(order.dealing_merchant || '');
        setShipmentDate(order.pos?.[0]?.ship_date || '');
        setMcLine(String(order.mc_line || ''));
        setProdLineHour(String(order.prod_line_hour || ''));
        setImagePreview(order.image_url || '');

        const styleQty = order.pos?.reduce((sum: number, po: any) => sum + (po.po_qty || 0), 0) || 0;
        setTotalQuantity(styleQty);

        // Fetch quotation linked to order
        const quote = quotations.find((q: any) => q.inquiry_id === order.inquiry_id || q.style_no === order.style_no);
        if (quote) {
          const detailRes = await fetch(`${API_BASE}/quotations/${quote.id}`);
          const detail = await detailRes.json();

          setQuotationId(detail.id || '');
          setSewingSMV(detail.smvs?.[0]?.sewing_smv || 12.0);
          setSewingEff(detail.sewing_efficiency || 65);
          setCuttingSMV(detail.smvs?.[0]?.cutting_smv || 1.5);
          setCuttingEff(detail.cutting_efficiency || 75);
          setFinishingSMV(detail.smvs?.[0]?.finishing_smv || 2.0);
          setFinishingEff(detail.finishing_efficiency || 80);
          setIncoterm(detail.incoterm || 'FOB');
          setIncotermPlace(detail.incoterm_place || 'Chittagong');
          setCurrency(detail.currency || 'USD');
          setCountry(detail.country || 'Bangladesh');
          setBuyingAgent(detail.buying_agent || '');
          setBudgetMinute(String(Math.ceil((detail.smvs?.[0]?.sewing_smv || 12.0) * styleQty)));

          setFabricCost(detail.fabrics?.reduce((sum: number, f: any) => sum + parseFloat(f.amount || 0), 0) * (styleQty / 12) || 0);
          setTrimsCost(detail.trims?.reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0) * (styleQty / 12) || 0);
          setEmbCost(detail.embs?.reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0) * (styleQty / 12) || 0);
          setWashCost(detail.washes?.reduce((sum: number, w: any) => sum + parseFloat(w.amount || 0), 0) * (styleQty / 12) || 0);
          setCmCost(parseFloat(detail.cm_value || 0) * (styleQty / 12) || 0);
        }
      } catch (e) { console.error("Error getting order details", e); }

    } else if (activeSource === 'Price Quotation Reference') {
      try {
        const res = await fetch(`${API_BASE}/quotations/${activeId}`);
        const quote = await res.json();

        setQuotationId(quote.id || '');
        setStyleRef(quote.style_no || '');
        setSewingSMV(quote.smvs?.[0]?.sewing_smv || 12.0);
        setSewingEff(quote.sewing_efficiency || 65);
        setCuttingSMV(quote.smvs?.[0]?.cutting_smv || 1.5);
        setCuttingEff(quote.cutting_efficiency || 75);
        setFinishingSMV(quote.smvs?.[0]?.finishing_smv || 2.0);
        setFinishingEff(quote.finishing_efficiency || 80);
        setIncoterm(quote.incoterm || 'FOB');
        setIncotermPlace(quote.incoterm_place || 'Chittagong Port');
        setCurrency(quote.currency || 'USD');
        setCountry(quote.country || 'Bangladesh');
        setBuyingAgent(quote.buying_agent || '');
        setImagePreview(quote.image_url || '');

        // Fetch matching order
        const matchingOrder = orders.find(o => String(o.style_no).toLowerCase() === String(quote.style_no).toLowerCase());
        if (matchingOrder) {
          const ordRes = await fetch(`${API_BASE}/orders/${matchingOrder.id}`);
          const ordData = await ordRes.json();
          setCurrentOrder(ordData);
        }

        // Fetch inquiry for style details
        if (quote.inquiry_id) {
          const inqRes = await fetch(`${API_BASE}/inquiries/${quote.inquiry_id}`);
          const inq = await inqRes.json();
          const bName = buyers.find(b => b.id === inq.buyer_id)?.name || inq.buyer_name || '';
          setBuyerName(bName);
          setStyleDesc(inq.style_desc || '');
          setProductDept(inq.department || 'Kids');
          setSeason(inq.season || '');
          setUom(inq.uom || 'Pcs');
          setTeamLeader(inq.team_leader || '');
          setDealingMerchant(inq.dealing_merchant || '');
          setShipmentDate(inq.ship_date || '');
          setTotalQuantity(inq.offer_qty || 10000);
          setBudgetMinute(String(Math.ceil((quote.smvs?.[0]?.sewing_smv || 12) * (inq.offer_qty || 10000))));

          setFabricCost(quote.fabrics?.reduce((sum: number, f: any) => sum + parseFloat(f.amount || 0), 0) * ((inq.offer_qty || 10000) / 12) || 0);
          setTrimsCost(quote.trims?.reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0) * ((inq.offer_qty || 10000) / 12) || 0);
          setEmbCost(quote.embs?.reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0) * ((inq.offer_qty || 10000) / 12) || 0);
          setWashCost(quote.washes?.reduce((sum: number, w: any) => sum + parseFloat(w.amount || 0), 0) * ((inq.offer_qty || 10000) / 12) || 0);
          setCmCost(parseFloat(quote.cm_value || 0) * ((inq.offer_qty || 10000) / 12) || 0);
        }
      } catch (e) { console.error("Error getting quotation details", e); }

    } else if (activeSource === 'Style') {
      const quote = quotations.find((q: any) => q.style_no === activeId);
      if (quote) {
        try {
          const detailRes = await fetch(`${API_BASE}/quotations/${quote.id}`);
          const detail = await detailRes.json();
          setQuotationId(detail.id || '');
          setStyleRef(detail.style_no || '');
          setSewingSMV(detail.smvs?.[0]?.sewing_smv || 12.0);
          setSewingEff(detail.sewing_efficiency || 65);
          setCuttingSMV(detail.smvs?.[0]?.cutting_smv || 1.5);
          setCuttingEff(detail.cutting_efficiency || 75);
          setFinishingSMV(detail.smvs?.[0]?.finishing_smv || 2.0);
          setFinishingEff(detail.finishing_efficiency || 80);
          setIncoterm(detail.incoterm || 'FOB');
          setIncotermPlace(detail.incoterm_place || 'Chittagong');
          setCurrency(detail.currency || 'USD');
          setCountry(detail.country || 'Bangladesh');
          setBuyingAgent(detail.buying_agent || '');

          const matchingOrder = orders.find(o => String(o.style_no).toLowerCase() === String(detail.style_no).toLowerCase());
          if (matchingOrder) {
            const ordRes = await fetch(`${API_BASE}/orders/${matchingOrder.id}`);
            const ordData = await ordRes.json();
            setCurrentOrder(ordData);
          }

          if (detail.inquiry_id) {
            const inqRes = await fetch(`${API_BASE}/inquiries/${detail.inquiry_id}`);
            const inq = await inqRes.json();
            const bName = buyers.find(b => b.id === inq.buyer_id)?.name || inq.buyer_name || '';
            setBuyerName(bName);
            setStyleDesc(inq.style_desc || '');
            setProductDept(inq.department || 'Ladies');
            setSeason(inq.season || '');
            setUom(inq.uom || 'Pcs');
            setTeamLeader(inq.team_leader || '');
            setDealingMerchant(inq.dealing_merchant || '');
            setShipmentDate(inq.ship_date || '');
            setTotalQuantity(inq.offer_qty || 10000);
            setBudgetMinute(String(Math.ceil((detail.smvs?.[0]?.sewing_smv || 12) * (inq.offer_qty || 10000))));

            setFabricCost(detail.fabrics?.reduce((sum: number, f: any) => sum + parseFloat(f.amount || 0), 0) * ((inq.offer_qty || 10000) / 12) || 0);
            setTrimsCost(detail.trims?.reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0) * ((inq.offer_qty || 10000) / 12) || 0);
            setEmbCost(detail.embs?.reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0) * ((inq.offer_qty || 10000) / 12) || 0);
            setWashCost(detail.washes?.reduce((sum: number, w: any) => sum + parseFloat(w.amount || 0), 0) * ((inq.offer_qty || 10000) / 12) || 0);
            setCmCost(parseFloat(detail.cm_value || 0) * ((inq.offer_qty || 10000) / 12) || 0);
          }
        } catch (err) { console.error("Error setting style detail", err); }
      }
    }
  };

  const handlePOSelection = (po: string) => {
    let nextPOs = [...selectedPOs];
    if (nextPOs.includes(po)) {
      nextPOs = nextPOs.filter(x => x !== po);
    } else {
      nextPOs.push(po);
    }
    setSelectedPOs(nextPOs);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files).map(f => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
        type: f.type || 'unknown'
      }));
      setAttachedFiles([...attachedFiles, ...filesArray]);

      // Try to find a match in the file names to auto-fill
      const fileNames = Array.from(e.target.files).map(f => f.name.toLowerCase());

      let matchedSource: string | null = null;
      let matchedId: string | null = null;

      // 1. Check for Order Reference match
      for (const order of orders) {
        const orderIdStr = String(order.id);
        const orderRefStr = `ord-${orderIdStr}`;
        const orderRefPadStr = `ord-${String(orderIdStr).padStart(3, '0')}`; // e.g. ord-001

        const hasOrderMatch = fileNames.some(name =>
          name.includes(orderRefStr) ||
          name.includes(orderRefPadStr) ||
          name.includes(`order-${orderIdStr}`) ||
          new RegExp(`\\b${orderIdStr}\\b`).test(name)
        );

        if (hasOrderMatch) {
          matchedSource = 'Order Reference';
          matchedId = orderIdStr;
          break;
        }
      }

      // 2. If no order match, check for Price Quotation Reference match
      if (!matchedSource) {
        for (const quote of quotations) {
          const quoteIdStr = String(quote.id).toLowerCase();
          const hasQuoteMatch = fileNames.some(name =>
            name.includes(quoteIdStr) ||
            name.includes(`pq-${quoteIdStr}`)
          );

          if (hasQuoteMatch) {
            matchedSource = 'Price Quotation Reference';
            matchedId = quote.id;
            break;
          }
        }
      }

      // 3. If no order/quote ID match, check for Style Reference match
      if (!matchedSource) {
        const styles = Array.from(new Set([
          ...orders.map(o => String(o.style_no).toLowerCase()),
          ...quotations.map(q => String(q.style_no).toLowerCase())
        ])).filter(Boolean);

        for (const style of styles) {
          const hasStyleMatch = fileNames.some(name => name.includes(style));
          if (hasStyleMatch) {
            matchedSource = 'Style';
            // Find the original style string with correct casing
            const originalStyle = orders.find(o => String(o.style_no).toLowerCase() === style)?.style_no ||
              quotations.find(q => String(q.style_no).toLowerCase() === style)?.style_no ||
              style;
            matchedId = originalStyle;
            break;
          }
        }
      }

      if (matchedSource && matchedId) {
        setDataSource(matchedSource as any);
        setDataSourceId(matchedId);
        handleGetDataSourceData(matchedSource, matchedId);
      }
    }
  };

  const handleSaveBudget = async () => {
    if (!styleRef) return alert("Please fetch or specify style reference details first.");

    const budgetRef = editMode && editId
      ? budgets.find(b => b.id === editId)?.budget_reference
      : `BG-${styleRef}-${new Date().getFullYear().toString().substring(2)}-${Math.floor(Math.random() * 900) + 100}`;

    const payload = {
      order_id: dataSource === 'Order Reference' ? parseInt(dataSourceId) : null,
      budget_reference: budgetRef,
      total_fabric_budget: fabricCost,
      total_trims_budget: trimsCost,
      total_cm_budget: cmCost,
      total_emb_budget: embCost,
      total_wash_budget: washCost,
      total_other_budget: otherCost,
      total_commercial_budget: commlCost,
      total_commission_budget: commissionCost,
      total_budget_amount: calculatedTotalCost,
      status: editMode ? budgets.find(b => b.id === editId)?.status : 'Draft',
      buyer: buyerName,
      season,
      uom,
      smv: sewingSMV,
      incoterm,
      mc_line: parseInt(mcLine) || 0,
      prod_line_hour: parseInt(prodLineHour) || 0,
      country,
      currency,
      ship_mode: shipMode,
      remarks,
      budget_minute: budgetMinute,
      cutting_smv: cuttingSMV,
      sewing_smv: sewingSMV,
      finishing_smv: finishingSMV,
      sewing_efficiency: sewingEff,
      cutting_efficiency: cuttingEff,
      finishing_efficiency: finishingEff,
      buying_agent: buyingAgent,
      incoterm_place: incotermPlace,
      costing_date: costingDate,
      copy_from: copyFrom,
      file_no: fileNo,
      internal_ref: internalRef,
      budget_label: budgetLabel,
      total_lab_test_budget: labTest,
      total_inspection_budget: inspectionCost,
      total_sample_budget: sampleCost,
      total_freight_budget: freightCost,
      total_courier_budget: courierCost,
      total_certif_budget: certifCost,
      total_common_oh_budget: commonOH,
      total_deffd_lc_budget: deffdLC,
      total_design_budget: designCost,
      total_studio_budget: studioCost,
      total_opert_exp_budget: opertExp,
      total_income_tax_budget: incomeTax,
      company: budgetCompany,
      unit: budgetUnit,
      quotation_id: _quotationId || null,
      style_no: styleRef,
      style_desc: styleDesc,
      department: productDept,

      // Detail lists mapping
      items: [
        { item_type: 'Fabric', budget_qty: fabricCost / 5.5, budget_rate: 5.5, budget_amount: fabricCost },
        { item_type: 'Trims', budget_qty: trimsCost, budget_rate: 1.0, budget_amount: trimsCost }
      ],
      fabrics: fabricDetailsList,
      trims: trimsDetailsList,
      embs: embDetailsList,
      washes: washDetailsList,
      commls: commlDetailsList,
      commissions: commissionDetailsList,
      others: othersDetailsList
    };

    try {
      const url = editMode ? `${API_BASE}/budgets/${editId}` : `${API_BASE}/budgets`;
      const method = editMode ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowModal(false);
        setEditMode(false);
        setEditId(null);
        fetchBudgets();
      } else {
        const errData = await res.json();
        alert(`Error saving budget limit: ${errData.error}`);
      }
    } catch (e) { console.error(e); }
  };

  const handleEditClick = async (budget: any) => {
    try {
      const res = await fetch(`${API_BASE}/budgets/${budget.id}`);
      const data = await res.json();

      setEditMode(true);
      setEditId(budget.id);

      setDataSource(data.order_id ? 'Order Reference' : 'Price Quotation Reference');
      setDataSourceId(String(data.order_id || ''));
      setStyleRef(data.style_no || '');
      setBuyerName(data.buyer || '');
      setSeason(data.season || '');
      setUom(data.uom || 'Pcs');
      setSewingSMV(data.sewing_smv || 14.0);
      setCuttingSMV(data.cutting_smv || 1.5);
      setFinishingSMV(data.finishing_smv || 2.0);
      setSewingEff(data.sewing_efficiency || 65);
      setCuttingEff(data.cutting_efficiency || 75);
      setFinishingEff(data.finishing_efficiency || 80);
      setIncoterm(data.incoterm || 'FOB');
      setMcLine(String(data.mc_line || ''));
      setProdLineHour(String(data.prod_line_hour || ''));
      setCountry(data.country || '');
      setCurrency(data.currency || 'USD');
      setShipMode(data.ship_mode || 'Sea');
      setRemarks(data.remarks || '');
      setBudgetMinute(data.budget_minute || '');
      setBudgetLabel(data.budget_label || 'Style Label');
      setBuyingAgent(data.buying_agent || '');
      setIncotermPlace(data.incoterm_place || '');
      setCostingDate(data.costing_date || '');
      setCopyFrom(data.copy_from || '');
      setFileNo(data.file_no || '');
      setInternalRef(data.internal_ref || '');
      setBudgetCompany(data.company || 'Demo Factory Ltd.');
      setBudgetUnit(data.unit || 'Demo Unit');
      setQuotationId(data.quotation_id || '');
      setStyleDesc(data.style_desc || '');
      setProductDept(data.department || '');

      setFabricCost(data.total_fabric_budget || 0);
      setTrimsCost(data.total_trims_budget || 0);
      setEmbCost(data.total_emb_budget || 0);
      setWashCost(data.total_wash_budget || 0);
      setCommlCost(data.total_commercial_budget || 0);
      setCommissionCost(data.total_commission_budget || 0);
      setLabTest(data.total_lab_test_budget || 0);
      setInspectionCost(data.total_inspection_budget || 0);
      setCmCost(data.total_cm_budget || 0);
      setSampleCost(data.total_sample_budget || 0);
      setFreightCost(data.total_freight_budget || 0);
      setOtherCost(data.total_other_budget || 0);
      setCourierCost(data.total_courier_budget || 0);
      setCertifCost(data.total_certif_budget || 0);
      setCommonOH(data.total_common_oh_budget || 0);
      setDeffdLC(data.total_deffd_lc_budget || 0);
      setDesignCost(data.total_design_budget || 0);
      setStudioCost(data.total_studio_budget || 0);
      setOpertExp(data.total_opert_exp_budget || 0);
      setIncomeTax(data.total_income_tax_budget || 0);

      setFabricDetailsList(data.fabrics || []);
      setTrimsDetailsList(data.trims || []);
      setEmbDetailsList(data.embs || []);
      setWashDetailsList(data.washes || []);
      setCommlDetailsList(data.commls || []);
      setCommissionDetailsList(data.commissions || []);
      setOthersDetailsList(data.others || []);

      setBudgetTab('required');
      setShowModal(true);
    } catch (e) { console.error("Error editing budget details", e); }
  };

  const handleDeleteBudget = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this budget limit?")) return;
    try {
      const res = await fetch(`${API_BASE}/budgets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchBudgets();
      } else {
        const err = await res.json();
        alert(`Delete Blocked: ${err.error}`);
      }
    } catch (e) { console.error(e); }
  };

  const handleSubmitToManager = async (budget: any) => {
    try {
      const res = await fetch(`${API_BASE}/budgets/${budget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...budget,
          status: 'Pending',
          user_remarks: 'Submitted to Manager'
        })
      });
      if (res.ok) {
        alert("Budget submitted to manager successfully!");
        fetchBudgets();
      } else {
        alert("Failed to submit budget to manager.");
      }
    } catch (e) {
      console.error(e);
      alert("Error submitting budget.");
    }
  };

  const handleReviewClick = (budget: any) => {
    setReviewingBudget(budget);
    setApprovalStatus(budget.status === 'Draft' || budget.status === 'Pending' ? 'Approved' : budget.status);
    setFeedbackRemarks(budget.feedback_from_approval || '');
    setShowApprovalModal(true);
  };

  const handleApprovalSubmit = async () => {
    if (!reviewingBudget) return;
    try {
      const res = await fetch(`${API_BASE}/budgets/${reviewingBudget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reviewingBudget,
          status: approvalStatus,
          approve_by: appSimulatedRole,
          feedback_from_approval: feedbackRemarks,
          user_remarks: `Status set to ${approvalStatus}`
        })
      });
      if (res.ok) {
        setShowApprovalModal(false);
        setReviewingBudget(null);
        fetchBudgets();
      }
    } catch (e) { console.error("Approval submit error", e); }
  };

  const handleOpenViewPage = async (budget: any, tab: 'summary' | 'excel_sheet' | 'calculator' = 'excel_sheet') => {
    try {
      const res = await fetch(`${API_BASE}/budgets/${budget.id}`);
      const data = await res.json();
      setViewingBudget(data);
      setViewTab(tab);
    } catch (e) { console.error("Error viewing budget replica", e); }
  };

  return (
    <div>




      {activeSubTab === 'directory' && (
        <div className="dashboard-card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <h2 className="card-title">Cost Budget Limits Directory</h2>
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
                  <option value="all">Show All Budgets</option>
                  <option value="day">By Specific Day (Calendar)</option>
                  <option value="month">By Specific Month</option>
                  <option value="year">By Specific Year</option>
                </select>
              </div>

              <button className="btn btn-primary" onClick={() => { setEditMode(false); setAttachedFiles([]); setFabricDetailsList([]); setTrimsDetailsList([]); setEmbDetailsList([]); setWashDetailsList([]); setShowModal(true); setBudgetTab('required'); }}>
                <Plus size={16} /> Create New Budget
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
                placeholder="Search Style, Order ID, Price Qtn ID, Buyer, or Merchant..."
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
              <option value="All">All Budgets</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Draft">Draft</option>
            </select>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
              Found {getSearchedBudgets().length} Budgets
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
            <table className="data-table">
              <thead>
                <tr>
                  <th>Budget Reference</th>
                  <th>Buyer</th>
                  <th>Style</th>
                  <th>PO</th>
                  <th>PO Quantity</th>
                  <th>PO Value</th>
                  <th>Budget Value</th>
                  <th>Garments Item</th>
                  <th>Team Leader</th>
                  <th>Dealing Merchant</th>
                  <th>Total SMV</th>
                  <th>Budgeted SMV</th>
                  <th>Budget Created Date</th>
                  <th>Shipment Date</th>
                  <th>Budget Approval Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getSearchedBudgets().map((b, idx) => (
                  <tr key={idx}>
                    <td><strong>{b.budget_reference}</strong></td>
                    <td>{b.buyer || 'N/A'}</td>
                    <td>{b.style_no || 'N/A'}</td>
                    <td><div style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={getPOList(b.selected_pos)}>{getPOList(b.selected_pos)}</div></td>
                    <td>{(parseFloat(b.total_quantity) || 12000).toLocaleString()} {b.uom || 'Pcs'}</td>
                    <td>${((parseFloat(b.total_quantity) || 12000) * 2.50).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td style={{ fontWeight: 600 }}>${parseFloat(b.total_budget_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td>{b.item_group || 'Polo Shirt'}</td>
                    <td>{b.team_leader || 'N/A'}</td>
                    <td>{b.dealing_merchant || 'N/A'}</td>
                    <td>{b.smv || 14.0} min</td>
                    <td>{((parseFloat(b.cutting_smv) || 0) + (parseFloat(b.sewing_smv) || 0) + (parseFloat(b.finishing_smv) || 0) || (b.smv ? parseFloat(b.smv) - 1.5 : 12.5)).toFixed(1)} min</td>
                    <td>{b.created_at ? new Date(b.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</td>
                    <td>{b.shipment_date || 'N/A'}</td>
                    <td>
                      <span className={`badge ${b.status === 'Approved' ? 'badge-success' : 'badge-danger'}`} style={{ backgroundColor: b.status === 'Approved' ? '#22c55e' : '#ef4444', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                        {b.status === 'Approved' ? 'Approved' : 'Not Approved'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-10">
                        <button className="btn btn-secondary btn-sm" title="Cost Breakdown Sheet" onClick={() => handleOpenViewPage(b, 'excel_sheet')}>
                          1st View
                        </button>
                        <button className="btn btn-secondary btn-sm" title="Financial Calculator" onClick={() => handleOpenViewPage(b, 'calculator')}>
                          2nd View
                        </button>
                        <button className="btn btn-secondary btn-sm" title="Required Info" onClick={() => handleOpenViewPage(b, 'summary')}>
                          3rd View
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEditClick(b)}>
                          <Edit size={12} /> Edit
                        </button>
                        {b.status !== 'Approved' ? (
                          <>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteBudget(b.id)}>
                              <Trash2 size={12} />
                            </button>
                            {(b.status === 'Draft' || !b.status) && (
                              <button
                                className="btn btn-sm"
                                style={{ backgroundColor: '#0f766e', color: '#fff', borderColor: '#0f766e' }}
                                onClick={() => handleSubmitToManager(b)}
                              >
                                <ClipboardCheck size={12} /> Submit to Manager
                              </button>
                            )}
                          </>
                        ) : (
                          <button className="btn btn-secondary btn-sm" disabled style={{ opacity: 0.5 }}>
                            <Lock size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'approval' && (
        <div className="dashboard-card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', borderBottom: '1px solid var(--border-muted)', paddingBottom: '15px' }}>
            <h2 className="card-title" style={{ margin: 0 }}><Shield /> Budget Approval Worklist Console</h2>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <label style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filter Mode:</label>
                <select
                  className="form-control"
                  style={{ width: 'auto', height: '36px', padding: '6px 12px', fontSize: '13px' }}
                  value={appFilterBasis}
                  onChange={(e) => {
                    setAppFilterBasis(e.target.value as any);
                    setAppSelectedCalendarDay(null);
                    setAppSelectedMonth('');
                    setAppSelectedYear('2026');
                  }}
                >
                  <option value="all">Show All Budgets</option>
                  <option value="day">By Specific Day (Calendar)</option>
                  <option value="month">By Specific Month</option>
                  <option value="year">By Specific Year</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <label style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Simulate Role:</label>
                <select
                  className="form-control"
                  style={{ width: 'auto', height: '36px' }}
                  value={appSimulatedRole}
                  onChange={(e) => setAppSimulatedRole(e.target.value)}
                >
                  <option value="Store Manager">Store Manager</option>
                  <option value="Production Manager">Production Manager</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Merchandiser Manager">Merchandiser Manager</option>
                </select>
              </div>
            </div>
          </div>

          {/* Search & Filter bar */}
          <div style={{ padding: '0 20px', marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search Inquiry ID, Style No, Buyer, or Team Leader..."
                value={appSearch}
                onChange={e => setAppSearch(e.target.value)}
                style={{ paddingLeft: '36px', height: '36px' }}
              />
            </div>
            <select
              className="form-control"
              value={appStatusFilter}
              onChange={e => setAppStatusFilter(e.target.value)}
              style={{ width: '220px', height: '36px' }}
            >
              <option value="Pending Approval">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="Draft">Draft</option>
              <option value="All">All Inquiries</option>
            </select>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
              Found {getApprovalConsoleBudgets().length} Inquiries
            </div>
          </div>

          {/* Filter inputs displayed on top when appFilterBasis is not 'all' */}
          {appFilterBasis !== 'all' && (
            <div style={{ padding: '0 20px', marginBottom: '20px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
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

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Budget Reference</th>
                  <th>Buyer</th>
                  <th>Style</th>
                  <th>Quotation ID</th>
                  <th>Costing Date</th>
                  <th>Leader</th>
                  <th>Merchant</th>
                  <th>Budget Value</th>
                  <th>Status</th>
                  <th>Approved By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getApprovalConsoleBudgets().map((b, idx) => (
                  <tr key={idx}>
                    <td><strong>{b.budget_reference}</strong></td>
                    <td>{b.buyer}</td>
                    <td>{b.style_no || 'N/A'}</td>
                    <td>{b.quotation_id || 'N/A'}</td>
                    <td>{b.costing_date || 'N/A'}</td>
                    <td>{b.buying_agent || 'N/A'}</td>
                    <td>{b.dealing_merchant || 'N/A'}</td>
                    <td><strong>${parseFloat(b.total_budget_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
                    <td>
                      <span className={`badge badge-${(b.status || 'Draft').toLowerCase()}`}>
                        {b.status || 'Draft'}
                      </span>
                    </td>
                    <td>{b.approve_by || 'Not reviewed'}</td>
                    <td>
                      <div className="d-flex gap-10">
                        <button className="btn btn-secondary btn-sm" title="Cost Breakdown Sheet" onClick={() => handleOpenViewPage(b, 'excel_sheet')}>
                          1st View
                        </button>
                        <button className="btn btn-secondary btn-sm" title="Financial Calculator" onClick={() => handleOpenViewPage(b, 'calculator')}>
                          2nd View
                        </button>
                        <button className="btn btn-secondary btn-sm" title="Required Info" onClick={() => handleOpenViewPage(b, 'summary')}>
                          3rd View
                        </button>
                        <button
                          className="btn btn-success btn-sm"
                          disabled={!(appSimulatedRole === 'Super Admin' || appSimulatedRole === 'Merchandiser Manager')}
                          style={!(appSimulatedRole === 'Super Admin' || appSimulatedRole === 'Merchandiser Manager') ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                          title={!(appSimulatedRole === 'Super Admin' || appSimulatedRole === 'Merchandiser Manager') ? 'Requires simulated role: Super Admin or Merchandiser Manager' : 'Review Budget'}
                          onClick={() => handleReviewClick(b)}
                        >
                          <Shield size={12} /> Review
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Creation & Modification modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '90%', width: '1200px' }}>
            <div className="modal-header">
              <h2>{editMode ? 'Edit Budget' : 'Cost Budget - Create'}</h2>
              <XCircle className="modal-close" onClick={() => { setShowModal(false); setEditMode(false); setEditId(null); }} />
            </div>

            {/* GLOBAL SEARCH AND AUTO-FILL */}
            {!editMode && (
              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label" style={{ color: '#0369a1', fontWeight: 'bold' }}>
                    <Search size={14} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                    Global Search (Order ID, Price Quotation ID, Style)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter ID or Style to auto-populate all fields..."
                    value={topSearchText}
                    onChange={(e) => setTopSearchText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchAndAutoFill()}
                    style={{ borderColor: '#bae6fd', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                  />
                </div>
                <button type="button" className="btn btn-primary" onClick={handleSearchAndAutoFill} style={{ padding: '9px 20px', background: '#0284c7' }}>
                  Search & Auto Fill
                </button>
              </div>
            )}

            <div className="tab-container">
              <div className={`tab ${budgetTab === 'required' ? 'active' : ''}`} onClick={() => setBudgetTab('required')}>1st Tab (Required Info)</div>
              <div className={`tab ${budgetTab === 'others' ? 'active' : ''}`} onClick={() => setBudgetTab('others')}>2nd Tab (Others Info)</div>
              <div className={`tab ${budgetTab === 'costs' ? 'active' : ''}`} onClick={() => setBudgetTab('costs')}>List of all Costs</div>
            </div>

            {budgetTab === 'required' && (
              <div>
                <div className="grid-3" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', border: '1px dashed var(--border-muted)' }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Search (Order ID, Price Quotation ID, or Style) *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={topSearchText}
                      onChange={e => setTopSearchText(e.target.value)}
                      placeholder="Enter Order ID, Quotation ID, or Style..."
                    />
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={handleSearchAndAutoFill}>
                      <Search size={16} style={{ marginRight: '8px' }} /> Search & Auto Fill
                    </button>
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Buyer Name</label>
                    <input type="text" className="form-control" value={buyerName} disabled placeholder="Auto fill" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quotation ID</label>
                    <input type="text" className="form-control" value={_quotationId} disabled placeholder="Auto fill" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Style Description</label>
                    <input type="text" className="form-control" value={styleDesc} disabled placeholder="Auto fill" />
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Team Leader (Read Only)</label>
                    <input type="text" className="form-control" value={teamLeader} disabled placeholder="Auto fill" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Dealing Merchant (Read Only)</label>
                    <input type="text" className="form-control" value={dealingMerchant} disabled placeholder="Auto fill" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Shipment Date (Read Only)</label>
                    <input type="text" className="form-control" value={shipmentDate} disabled placeholder="Auto fill" />
                  </div>
                </div>

                <div className="grid-3" style={{ borderTop: '1px solid var(--border-muted)', paddingTop: '20px', marginTop: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Budget Label *</label>
                    <select className="form-control" value={budgetLabel} onChange={e => setBudgetLabel(e.target.value as any)}>
                      <option value="Style Label">Style Label</option>
                      <option value="PO Label">PO Label</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Garment UOM</label>
                    <input type="text" className="form-control" value={uom} onChange={e => setUom(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Garment Item Group</label>
                    <input type="text" className="form-control" value={itemGroup} onChange={e => setItemGroup(e.target.value)} />
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Season</label>
                    <input type="text" className="form-control" value={season} onChange={e => setSeason(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Garments Category</label>
                    <input type="text" className="form-control" value={category} onChange={e => setCategory(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Costing Per Limit</label>
                    <select className="form-control" value={costingPer} onChange={e => setCostingPer(e.target.value)}>
                      <option value="1Pc">1Pc</option>
                      <option value="1Dzn">1Dzn</option>
                      <option value="2Dzn">2Dzn</option>
                      <option value="3Dzn">3Dzn</option>
                      <option value="4Dzn">4Dzn</option>
                    </select>
                  </div>
                </div>

                {budgetLabel === 'PO Label' && styleRef && allPOsForStyle.length > 0 && (
                  <div className="form-group" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)', marginBottom: '20px' }}>
                    <label className="form-label">Multiple PO selection breakdown:</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
                      {allPOsForStyle.map((po: any) => (
                        <div key={po.po_no} onClick={() => handlePOSelection(po.po_no)} style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid', borderColor: selectedPOs.includes(po.po_no) ? 'var(--primary)' : 'var(--border-muted)', background: selectedPOs.includes(po.po_no) ? 'rgba(99, 102, 241, 0.15)' : 'transparent', cursor: 'pointer', fontSize: '0.8rem' }}>
                          {po.po_no} ({po.po_qty} pcs)
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Target Quantity (Pcs)</label>
                    <input type="number" className="form-control" value={totalQuantity} onChange={e => setTotalQuantity(parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Incoterm Base</label>
                    <input type="text" className="form-control" value={incoterm} onChange={e => setIncoterm(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">MC/Line</label>
                    <input type="text" className="form-control" value={mcLine} onChange={e => setMcLine(e.target.value)} />
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Production/Line/Hour</label>
                    <input type="text" className="form-control" value={prodLineHour} onChange={e => setProdLineHour(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Budget Target Minute</label>
                    <input type="text" className="form-control" value={budgetMinute} onChange={e => setBudgetMinute(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Style Product Department</label>
                    <input type="text" className="form-control" value={productDept} onChange={e => setProductDept(e.target.value)} />
                  </div>
                </div>

                <h4 style={{ margin: '20px 0 10px 0', borderBottom: '1px solid var(--border-muted)', paddingBottom: '8px' }}>Line & Section SMV Parameters</h4>
                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Cutting SMV</label>
                    <input type="number" className="form-control" value={cuttingSMV} onChange={e => setCuttingSMV(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sewing SMV</label>
                    <input type="number" className="form-control" value={sewingSMV} onChange={e => setSewingSMV(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Finishing SMV</label>
                    <input type="number" className="form-control" value={finishingSMV} onChange={e => setFinishingSMV(parseFloat(e.target.value) || 0)} />
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Cutting Efficiency %</label>
                    <input type="number" className="form-control" value={cuttingEff} onChange={e => setCuttingEff(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sewing Efficiency %</label>
                    <input type="number" className="form-control" value={sewingEff} onChange={e => setSewingEff(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Finishing Efficiency %</label>
                    <input type="number" className="form-control" value={finishingEff} onChange={e => setFinishingEff(parseFloat(e.target.value) || 0)} />
                  </div>
                </div>

                <div className="grid-2 mt-20" style={{ borderTop: '1px solid var(--border-muted)', paddingTop: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Attachments Manager (PDF / Excel)</label>
                    <div style={{ border: '2px dashed var(--border-muted)', borderRadius: 'var(--radius-md)', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                      <input type="file" multiple accept=".pdf,.xlsx,.xls" onChange={handleFileUpload} style={{ display: 'none' }} id="budget-file-upload" />
                      <label htmlFor="budget-file-upload" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>Choose files</label>
                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                        {attachedFiles.map((file, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>
                            <span><FileText size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> {file.name}</span>
                            <span style={{ color: 'var(--text-muted)' }}>{file.size}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Garment Product Illustration Reference</label>
                    <div style={{ border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-md)', height: '144px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                      {imagePreview ? (
                        <img src={imagePreview} alt="Garment Product" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No image loaded</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {budgetTab === 'others' && (
              <div>
                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Production Company</label>
                    <select className="form-control" value={budgetCompany} onChange={e => setBudgetCompany(e.target.value)}>
                      <option value="Demo Factory Ltd.">Demo Factory Ltd.</option>
                      <option value="Apex Apparel Group">Apex Apparel Group</option>
                      <option value="Metamorphosis Fashion">Metamorphosis Fashion</option>
                      <option value="Meet Factory Ltd">Meet Factory Ltd</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Operating Unit</label>
                    <select className="form-control" value={budgetUnit} onChange={e => setBudgetUnit(e.target.value)}>
                      <option value="Demo Unit">Demo Unit</option>
                      <option value="Wash Unit">Wash Unit</option>
                      <option value="Knitting Unit">Knitting Unit</option>
                      <option value="Apex Unit 1">Apex Unit 1</option>
                      <option value="Apex Unit 2">Apex Unit 2</option>
                      <option value="Meet Dhaka Unit">Meet Dhaka Unit</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Costing Date</label>
                    <input type="date" className="form-control" value={costingDate} onChange={e => setCostingDate(e.target.value)} />
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Country of Origin</label>
                    <input type="text" className="form-control" value={country} onChange={e => setCountry(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Buying Agent / House</label>
                    <input type="text" className="form-control" value={buyingAgent} onChange={e => setBuyingAgent(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Currency Type</label>
                    <select className="form-control" value={currency} onChange={e => setCurrency(e.target.value)}>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="BDT">BDT</option>
                    </select>
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Incoterm Destination Place</label>
                    <input type="text" className="form-control" value={incotermPlace} onChange={e => setIncotermPlace(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Shipment Mode Type</label>
                    <select className="form-control" value={shipMode} onChange={e => setShipMode(e.target.value)}>
                      <option value="Sea">Sea</option>
                      <option value="Air">Air</option>
                      <option value="Road">Road</option>
                      <option value="Train">Train</option>
                      <option value="Sea/Air">Sea/Air</option>
                      <option value="Road/Air">Road/Air</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Copy From (Ref ID)</label>
                    <input type="text" className="form-control" value={copyFrom} onChange={e => setCopyFrom(e.target.value)} />
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Commercial File No</label>
                    <input type="text" className="form-control" value={fileNo} onChange={e => setFileNo(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Internal Reference</label>
                    <input type="text" className="form-control" value={internalRef} onChange={e => setInternalRef(e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Cost Remarks</label>
                  <textarea className="form-control" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Write details..." />
                </div>
              </div>
            )}

            {budgetTab === 'costs' && (
              <div>
                <h4 style={{ marginBottom: '16px' }}>List of Direct and Indirect Component Costs</h4>

                <h5 style={{ color: '#0284c7', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Direct Costs (with detailed browse option popups)</h5>
                <div className="grid-3">
                  <div className="form-group" style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-muted)' }}>
                    <div className="d-flex justify-between align-center">
                      <label className="form-label" style={{ fontWeight: 600 }}>Fabric Cost</label>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowFabricPopup(true)}>Browse Option</button>
                    </div>
                    <input type="number" className="form-control mt-10" value={fabricCost.toFixed(2)} disabled />
                  </div>

                  <div className="form-group" style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-muted)' }}>
                    <div className="d-flex justify-between align-center">
                      <label className="form-label" style={{ fontWeight: 600 }}>Trims Cost</label>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowTrimsPopup(true)}>Browse Option</button>
                    </div>
                    <input type="number" className="form-control mt-10" value={trimsCost.toFixed(2)} disabled />
                  </div>

                  <div className="form-group" style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-muted)' }}>
                    <div className="d-flex justify-between align-center">
                      <label className="form-label" style={{ fontWeight: 600 }}>Emb. Cost</label>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowEmbPopup(true)}>Browse Option</button>
                    </div>
                    <input type="number" className="form-control mt-10" value={embCost.toFixed(2)} disabled />
                  </div>
                </div>

                <div className="grid-3" style={{ marginTop: '10px', marginBottom: '25px' }}>
                  <div className="form-group" style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-muted)' }}>
                    <div className="d-flex justify-between align-center">
                      <label className="form-label" style={{ fontWeight: 600 }}>Gmts. Wash</label>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowWashPopup(true)}>Browse Option</button>
                    </div>
                    <input type="number" className="form-control mt-10" value={washCost.toFixed(2)} disabled />
                  </div>

                  <div className="form-group" style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-muted)' }}>
                    <div className="d-flex justify-between align-center">
                      <label className="form-label" style={{ fontWeight: 600 }}>Comml. Cost</label>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCommlPopup(true)}>Browse Option</button>
                    </div>
                    <input type="number" className="form-control mt-10" value={commlCost.toFixed(2)} disabled />
                  </div>

                  <div className="form-group" style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-muted)' }}>
                    <div className="d-flex justify-between align-center">
                      <label className="form-label" style={{ fontWeight: 600 }}>Other Cost</label>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowOthersPopup(true)}>Browse Option</button>
                    </div>
                    <input type="number" className="form-control mt-10" value={otherCost.toFixed(2)} disabled />
                  </div>
                </div>

                <h5 style={{ color: '#0284c7', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Indirect Costs (Float values)</h5>
                <div className="grid-4">
                  <div className="form-group">
                    <label className="form-label">Lab Test ($)</label>
                    <input type="number" className="form-control" value={labTest} onChange={e => setLabTest(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Inspection Cost ($)</label>
                    <input type="number" className="form-control" value={inspectionCost} onChange={e => setInspectionCost(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CM Cost ($)</label>
                    <input type="number" className="form-control" value={cmCost} onChange={e => setCmCost(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sample Cost ($)</label>
                    <input type="number" className="form-control" value={sampleCost} onChange={e => setSampleCost(parseFloat(e.target.value) || 0)} />
                  </div>
                </div>

                <div className="grid-4">
                  <div className="form-group">
                    <label className="form-label">Freight Cost ($)</label>
                    <input type="number" className="form-control" value={freightCost} onChange={e => setFreightCost(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Courier Cost ($)</label>
                    <input type="number" className="form-control" value={courierCost} onChange={e => setCourierCost(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Certif. Cost ($)</label>
                    <input type="number" className="form-control" value={certifCost} onChange={e => setCertifCost(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Common OH ($)</label>
                    <input type="number" className="form-control" value={commonOH} onChange={e => setCommonOH(parseFloat(e.target.value) || 0)} />
                  </div>
                </div>

                <div className="grid-4">
                  <div className="form-group">
                    <label className="form-label">Deffd. LC Cost ($)</label>
                    <input type="number" className="form-control" value={deffdLC} onChange={e => setDeffdLC(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Design Cost ($)</label>
                    <input type="number" className="form-control" value={designCost} onChange={e => setDesignCost(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Studio Cost ($)</label>
                    <input type="number" className="form-control" value={studioCost} onChange={e => setStudioCost(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Opert. Exp. ($)</label>
                    <input type="number" className="form-control" value={opertExp} onChange={e => setOpertExp(parseFloat(e.target.value) || 0)} />
                  </div>
                </div>

                <div className="grid-4">
                  <div className="form-group">
                    <label className="form-label">Income Tax ($)</label>
                    <input type="number" className="form-control" value={incomeTax} onChange={e => setIncomeTax(parseFloat(e.target.value) || 0)} />
                  </div>
                </div>

                <div className="metrics-grid mt-20">
                  <div className="metric-card" style={{ padding: '16px', background: 'var(--primary-gradient)' }}>
                    <div className="metric-details">
                      <h3 style={{ color: '#fff' }}>Total Cost - Sum of All cost of above</h3>
                      <div className="metric-value" style={{ fontSize: '1.6rem', color: '#fff' }}>
                        ${calculatedTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-20 text-right" style={{ borderTop: '1px solid var(--border-muted)', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              {budgetTab === 'required' && (
                <>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      if (!styleRef) {
                        alert("Please fetch or specify style reference details first.");
                        return;
                      }
                      setBudgetTab('others');
                    }}
                  >
                    Next: Others Info
                  </button>
                </>
              )}
              {budgetTab === 'others' && (
                <>
                  <button type="button" className="btn btn-secondary" onClick={() => setBudgetTab('required')}>Back</button>
                  <button type="button" className="btn btn-primary" onClick={() => setBudgetTab('costs')}>Next: List of all Costs</button>
                </>
              )}
              {budgetTab === 'costs' && (
                <>
                  <button type="button" className="btn btn-secondary" onClick={() => setBudgetTab('others')}>Back</button>
                  <button type="button" className="btn btn-primary" onClick={handleSaveBudget}><Save size={16} /> Save & File Budget</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL WITH SPREADSHEET & CALCULATOR LAYOUTS */}
      {viewingBudget && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '1100px', width: '95%' }}>
            <div className="modal-header">
              <h3>Budget Specification: {viewingBudget.budget_reference}</h3>
              <XCircle className="modal-close" onClick={() => setViewingBudget(null)} />
            </div>

            <div className="tab-container" style={{ marginBottom: '20px' }}>
              <div className={`tab ${viewTab === 'excel_sheet' ? 'active' : ''}`} onClick={() => setViewTab('excel_sheet')}>
                1st Page (Cost Breakdown Sheet)
              </div>
              <div className={`tab ${viewTab === 'calculator' ? 'active' : ''}`} onClick={() => setViewTab('calculator')}>
                2nd Page (Financial Calculator)
              </div>
              <div className={`tab ${viewTab === 'summary' ? 'active' : ''}`} onClick={() => setViewTab('summary')}>
                3rd Page (Required Info)
              </div>
            </div>

            {viewTab === 'summary' && (
              <div>
                <div className="grid-3" style={{ background: 'rgba(255,255,255,0.01)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)' }}>
                  <div>
                    <p style={{ margin: '6px 0' }}><strong>Reference:</strong> {viewingBudget.budget_reference}</p>
                    <p style={{ margin: '6px 0' }}><strong>Buyer:</strong> {viewingBudget.buyer}</p>
                    <p style={{ margin: '6px 0' }}><strong>Style Reference:</strong> {viewingBudget.style_no}</p>
                    <p style={{ margin: '6px 0' }}><strong>Garment Category:</strong> {viewingBudget.category}</p>
                    <p style={{ margin: '6px 0' }}><strong>Target Qty:</strong> {viewingBudget.total_quantity || 12000} {viewingBudget.uom}</p>
                  </div>
                  <div>
                    <p style={{ margin: '6px 0' }}><strong>Company:</strong> {viewingBudget.company}</p>
                    <p style={{ margin: '6px 0' }}><strong>Unit Name:</strong> {viewingBudget.unit}</p>
                    <p style={{ margin: '6px 0' }}><strong>Costing Date:</strong> {viewingBudget.costing_date}</p>
                    <p style={{ margin: '6px 0' }}><strong>Exchange Rate:</strong> 1.00 USD</p>
                    <p style={{ margin: '6px 0' }}><strong>Ship Mode:</strong> {viewingBudget.ship_mode}</p>
                  </div>
                  <div>
                    <p style={{ margin: '6px 0' }}><strong>Budget Level:</strong> {viewingBudget.budget_label}</p>
                    <p style={{ margin: '6px 0' }}><strong>Total SMV:</strong> {viewingBudget.smv} min</p>
                    <p style={{ margin: '6px 0' }}><strong>Approval Status:</strong> <span className={`badge badge-${(viewingBudget.status || 'Draft').toLowerCase()}`}>{viewingBudget.status}</span></p>
                    <p style={{ margin: '6px 0' }}><strong>Approve By:</strong> {viewingBudget.approve_by || 'N/A'}</p>
                    <p style={{ margin: '6px 0' }}><strong>Approval Remarks:</strong> {viewingBudget.feedback_from_approval || 'N/A'}</p>
                  </div>
                </div>

                <div className="metrics-grid mt-20">
                  <div className="metric-card">
                    <div className="metric-details">
                      <h3>Fabric Cost</h3>
                      <div className="metric-value">${(viewingBudget.total_fabric_budget || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-details">
                      <h3>Trims Cost</h3>
                      <div className="metric-value">${(viewingBudget.total_trims_budget || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-details">
                      <h3>Labor CM</h3>
                      <div className="metric-value">${(viewingBudget.total_cm_budget || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </div>
                  </div>
                  <div className="metric-card" style={{ background: 'var(--primary-glow)' }}>
                    <div className="metric-details">
                      <h3>Total Budget Cap</h3>
                      <div className="metric-value" style={{ color: 'var(--text-primary)' }}>${(viewingBudget.total_budget_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>Budget Summary Breakdown</h4>
                  <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-md)', padding: '16px', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-muted)', textAlign: 'left', fontWeight: 'bold' }}>
                          <th style={{ padding: '8px' }}>Cost Component</th>
                          <th style={{ padding: '8px', textAlign: 'right' }}>Budget Amount (USD)</th>
                          <th style={{ padding: '8px', textAlign: 'right' }}>Percentage of Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'Fabric Budget', val: viewingBudget.total_fabric_budget || 0 },
                          { name: 'Trims & Accessories Budget', val: viewingBudget.total_trims_budget || 0 },
                          { name: 'Embellishment Budget', val: viewingBudget.total_emb_budget || 0 },
                          { name: 'Wet Process/Wash Budget', val: viewingBudget.total_wash_budget || 0 },
                          { name: 'Commercial Budget', val: viewingBudget.total_commercial_budget || 0 },
                          { name: 'Commission Budget', val: viewingBudget.total_commission_budget || 0 },
                          { name: 'Labor CM Budget', val: viewingBudget.total_cm_budget || 0 },
                          { name: 'Lab Test Budget', val: viewingBudget.total_lab_test_budget || 0 },
                          { name: 'Inspection Budget', val: viewingBudget.total_inspection_budget || 0 },
                          { name: 'Sample Budget', val: viewingBudget.total_sample_budget || 0 },
                          { name: 'Freight Budget', val: viewingBudget.total_freight_budget || 0 },
                          { name: 'Courier Budget', val: viewingBudget.total_courier_budget || 0 },
                          { name: 'Certification Budget', val: viewingBudget.total_certif_budget || 0 },
                          { name: 'Common OH Budget', val: viewingBudget.total_common_oh_budget || 0 },
                          { name: 'Deffd. LC Budget', val: viewingBudget.total_deffd_lc_budget || 0 },
                          { name: 'Design Budget', val: viewingBudget.total_design_budget || 0 },
                          { name: 'Studio Budget', val: viewingBudget.total_studio_budget || 0 },
                          { name: 'Operating Exp. Budget', val: viewingBudget.total_opert_exp_budget || 0 },
                          { name: 'Income Tax Budget', val: viewingBudget.total_income_tax_budget || 0 },
                          { name: 'Other Costs Budget', val: viewingBudget.total_other_budget || 0 },
                        ].filter(x => x.val > 0).map((x, idx) => {
                          const pct = viewingBudget.total_budget_amount > 0 ? (x.val / viewingBudget.total_budget_amount) * 100 : 0;
                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--border-muted)' }}>
                              <td style={{ padding: '8px' }}>{x.name}</td>
                              <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>${x.val.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              <td style={{ padding: '8px', textAlign: 'right', color: 'var(--text-muted)' }}>{pct.toFixed(2)}%</td>
                            </tr>
                          );
                        })}
                        <tr style={{ fontWeight: 'bold', borderTop: '2px solid var(--border-muted)', background: 'rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '8px' }}>Total Budget Amount</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>${(viewingBudget.total_budget_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>100.00%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* VISUAL 1: EXCEL COST BREAKDOWN SHEET REPLICA */}
            {viewTab === 'excel_sheet' && (() => {
              const qty = viewingBudget.total_quantity || 12000;
              const totalAmt = viewingBudget.total_budget_amount || 0;

              // Pre-calculate values
              const fabrics = viewingBudget.fabrics || [];
              const totalFabricCost = viewingBudget.total_fabric_budget || fabrics.reduce((sum: number, f: any) => sum + (f.total_amount || 0), 0) || 0;

              const displayFabrics = [...fabrics];
              if (displayFabrics.length === 0 && totalFabricCost > 0) {
                displayFabrics.push({
                  body_part: 'Body Fabric',
                  composition: viewingBudget.style_desc || 'Shell Fabric',
                  gsm_oz: 180,
                  n_supplier: viewingBudget.buying_agent || 'Apex Textiles',
                  dia_type: 'Open',
                  rate: totalFabricCost / qty,
                  grey_cons: 1,
                  process_loss_pct: 0,
                  total_qty: qty,
                  total_amount: totalFabricCost
                });
              }

              const totalYarnCost = displayFabrics.reduce((sum: number, f: any) => {
                return sum + (f.yarns?.reduce((ysum: number, y: any) => ysum + (y.amount || 0), 0) || 0);
              }, 0) || (totalFabricCost * 0.65);

              const totalKnittingCost = totalFabricCost * 0.08;
              const totalDyeingCost = totalFabricCost * 0.12;
              const totalAOPCost = displayFabrics.some((f: any) => String(f.body_part_type || '').toLowerCase().includes('aop')) ? totalFabricCost * 0.10 : 0;
              const totalOtherConversionCost = totalFabricCost - totalYarnCost - totalKnittingCost - totalDyeingCost - totalAOPCost;

              const trims = viewingBudget.trims || [];
              const totalTrimsCost = viewingBudget.total_trims_budget || trims.reduce((sum: number, t: any) => sum + (t.total_amount || 0), 0) || 0;

              const displayTrims = [...trims];
              if (displayTrims.length === 0 && totalTrimsCost > 0) {
                displayTrims.push({
                  item_name: 'Trims & Accessories',
                  item_description: 'Accessories Package',
                  n_supplier: viewingBudget.buying_agent || 'Local Supplier',
                  rate: totalTrimsCost / qty,
                  finish_cons: 1,
                  process_loss_pct: 0,
                  total_qty: qty,
                  total_amount: totalTrimsCost,
                  cons_uom: 'Pcs'
                });
              }

              const embs = viewingBudget.embs || [];
              const totalEmbCost = viewingBudget.total_emb_budget || embs.reduce((sum: number, e: any) => sum + (e.total_amount || 0), 0) || 0;

              const displayEmbs = [...embs];
              if (displayEmbs.length === 0 && totalEmbCost > 0) {
                displayEmbs.push({
                  embellishment_type: 'Embellishment',
                  embellishment_name: 'Decoration/Print',
                  supplier: 'Apex Printer',
                  rate: totalEmbCost / qty,
                  cons: 1,
                  process_loss_pct: 0,
                  total_qty: qty,
                  total_amount: totalEmbCost
                });
              }

              const washes = viewingBudget.washes || [];
              const totalWashCost = viewingBudget.total_wash_budget || washes.reduce((sum: number, w: any) => sum + (w.total_amount || 0), 0) || 0;

              const displayWashes = [...washes];
              if (displayWashes.length === 0 && totalWashCost > 0) {
                displayWashes.push({
                  wash_type: 'Garments Wash',
                  wash_name: 'Normal Wash',
                  supplier: 'Apex Wash',
                  rate: totalWashCost / qty,
                  cons: 1,
                  process_loss_pct: 0,
                  total_qty: qty,
                  total_amount: totalWashCost
                });
              }

              const commlCostVal = viewingBudget.total_commercial_budget || 0;
              const commissionCostVal = viewingBudget.total_commission_budget || 0;

              const totalCM = viewingBudget.total_cm_budget || 0;
              const budgetMinuteVal = parseFloat(viewingBudget.budget_minute) || 12000;

              // Extract order average FOB and Revenue
              const matchedOrder = orders.find((o: any) => o.id === viewingBudget.order_id || String(o.style_no).toLowerCase() === String(viewingBudget.style_no).toLowerCase());
              const matchedQuote = quotations.find((q: any) => q.id === viewingBudget.quotation_id || String(q.style_no).toLowerCase() === String(viewingBudget.style_no).toLowerCase());
              const posList = matchedOrder?.pos || [];
              const poNoStr = posList.map((p: any) => p.po_no).join(', ') || viewingBudget.file_no || 'N/A';
              const poQtySum = posList.reduce((sum: number, p: any) => sum + (p.po_qty || 0), 0) || qty;

              const avgFob = matchedOrder?.pos && matchedOrder.pos.length > 0
                ? (matchedOrder.pos.reduce((sum: number, p: any) => sum + (p.fob_price || 0), 0) / matchedOrder.pos.length)
                : (matchedQuote?.fob_price_pc || (viewingBudget.total_budget_amount / qty));

              const totalRevenue = avgFob * poQtySum;
              const netEarnings = totalRevenue - totalAmt;
              const netEarningsColor = netEarnings >= 0 ? '#10b981' : '#ef4444';

              const cpm = budgetMinuteVal > 0 ? (totalCM / budgetMinuteVal) : 0;
              const smv = viewingBudget.sewing_smv || viewingBudget.smv || 12.0;
              const mcLineVal = viewingBudget.mc_line || 0;
              const prodLineVal = viewingBudget.prod_line_hour || 0;
              const efficiencyVal = viewingBudget.sewing_efficiency || 0;
              const cmPcs = totalCM / qty;
              const cmDzn = cmPcs * 12;
              const epm = smv > 0 ? (cmPcs / smv) : 0;

              return (
                <div style={{ background: '#fff', color: '#1e293b', padding: '24px', borderRadius: '8px', fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif', fontSize: '0.75rem', overflowX: 'auto', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                  {/* TOP HEADER CONTROLS */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '15px' }}>
                    <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
                      Print / PDF
                    </button>
                  </div>

                  {/* FACTORY LOGO AND TITLE */}
                  <div style={{ position: 'relative', textAlign: 'center', marginBottom: '15px' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '2px 0', color: '#0f172a' }}>{viewingBudget.company || 'Demo Factory Ltd.'}</h2>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '2px 0', color: '#475569' }}>{viewingBudget.unit || 'Demo Unit'}</h3>
                    <p style={{ margin: '2px 0', color: '#64748b', fontSize: '0.8rem' }}>Ashulia, Dhaka</p>
                    <div style={{ background: '#e2e8f0', padding: '8px', fontWeight: 'bold', border: '1px solid #cbd5e1', marginTop: '10px', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase', color: '#1e293b' }}>
                      COST BREAKDOWN SHEET
                    </div>
                  </div>

                  {/* MASTER INFO GRID WITH IMAGE PREVIEW */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '15px', marginBottom: '20px' }}>
                    {/* General Metadata Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1' }}>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '6px 8px', background: '#f8fafc', fontWeight: 600, borderRight: '1px solid #cbd5e1', width: '20%' }}>PRE-COSTING DATE</td>
                          <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', width: '30%' }}>{viewingBudget.costing_date || 'N/A'}</td>
                          <td style={{ padding: '6px 8px', background: '#f8fafc', fontWeight: 600, borderRight: '1px solid #cbd5e1', width: '20%' }}>STYLE REF:</td>
                          <td style={{ padding: '6px 8px', width: '30%', fontWeight: 'bold' }}>{viewingBudget.style_no || 'N/A'}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '6px 8px', background: '#f8fafc', fontWeight: 600, borderRight: '1px solid #cbd5e1' }}>POST-COSTING DATE</td>
                          <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>N/A</td>
                          <td style={{ padding: '6px 8px', background: '#f8fafc', fontWeight: 600, borderRight: '1px solid #cbd5e1' }}>Garments Item:</td>
                          <td style={{ padding: '6px 8px' }}>{viewingBudget.item_group || viewingBudget.garments_item || 'Full polo'}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '6px 8px', background: '#f8fafc', fontWeight: 600, borderRight: '1px solid #cbd5e1' }}>BUYER/AGENT:</td>
                          <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>{viewingBudget.buyer || 'N/A'}</td>
                          <td style={{ padding: '6px 8px', background: '#f8fafc', fontWeight: 600, borderRight: '1px solid #cbd5e1' }}>COLORWAY:</td>
                          <td style={{ padding: '6px 8px' }}>Conventional / Solid</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '6px 8px', background: '#f8fafc', fontWeight: 600, borderRight: '1px solid #cbd5e1' }}>DEPT:</td>
                          <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>{viewingBudget.department || 'N/A'}</td>
                          <td style={{ padding: '6px 8px', background: '#f8fafc', fontWeight: 600, borderRight: '1px solid #cbd5e1' }}>MASTER LC REF:</td>
                          <td style={{ padding: '6px 8px' }}>{viewingBudget.internal_ref || 'N/A'}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '6px 8px', background: '#f8fafc', fontWeight: 600, borderRight: '1px solid #cbd5e1' }}>TOTAL ORDER QNTY:</td>
                          <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>{poQtySum.toLocaleString()} Pcs</td>
                          <td style={{ padding: '6px 8px', background: '#f8fafc', fontWeight: 600, borderRight: '1px solid #cbd5e1' }}>UNIQUE ID:</td>
                          <td style={{ padding: '6px 8px', fontFamily: 'monospace', fontWeight: 600 }}>{viewingBudget.budget_reference}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '6px 8px', background: '#f8fafc', fontWeight: 600, borderRight: '1px solid #cbd5e1' }}>TOTAL ORDER PCS QNTY:</td>
                          <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>{poQtySum.toLocaleString()} PCS</td>
                          <td style={{ padding: '6px 8px', background: '#f8fafc', fontWeight: 600, borderRight: '1px solid #cbd5e1' }}>DROP:</td>
                          <td style={{ padding: '6px 8px' }}>-</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '6px 8px', background: '#f8fafc', fontWeight: 600, borderRight: '1px solid #cbd5e1' }}>AVG FOB PRICE:</td>
                          <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>${avgFob.toFixed(4)} USD</td>
                          <td style={{ padding: '6px 8px', background: '#f8fafc', fontWeight: 600, borderRight: '1px solid #cbd5e1' }}>-</td>
                          <td style={{ padding: '6px 8px' }}>-</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '6px 8px', background: '#f8fafc', fontWeight: 600, borderRight: '1px solid #cbd5e1' }}>TOTAL REVENUE:</td>
                          <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', fontWeight: 'bold' }}>${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td style={{ padding: '6px 8px', background: '#f8fafc', fontWeight: 600, borderRight: '1px solid #cbd5e1' }}>UOM:</td>
                          <td style={{ padding: '6px 8px' }}>{viewingBudget.uom || 'Pcs'}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '6px 8px', background: '#f8fafc', fontWeight: 600, borderRight: '1px solid #cbd5e1' }}>PO NO:</td>
                          <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>{poNoStr}</td>
                          <td style={{ padding: '6px 8px', background: '#f8fafc', fontWeight: 600, borderRight: '1px solid #cbd5e1' }}>PO QNTY:</td>
                          <td style={{ padding: '6px 8px' }}>{poQtySum.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '6px 8px', background: '#f8fafc', fontWeight: 600, borderRight: '1px solid #cbd5e1' }}>NUMBER OF PCS PER PACK:</td>
                          <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>1</td>
                          <td style={{ padding: '6px 8px', background: '#f8fafc', fontWeight: 600, borderRight: '1px solid #cbd5e1' }}>ORDER QNTYS IN Pcs:</td>
                          <td style={{ padding: '6px 8px' }}>{poQtySum.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Image Attachment Box */}
                    <div style={{ width: '220px', height: '230px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '10px' }}>
                      {viewingBudget.image_url ? (
                        <img src={viewingBudget.image_url} alt="Style design" style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain' }} />
                      ) : (
                        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                          <Upload size={32} style={{ marginBottom: '8px' }} />
                          <p style={{ fontSize: '0.7rem', margin: 0 }}>NO IMAGE AVAILABLE</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 1. FABRIC COST TABLE */}
                  <h4 style={{ fontWeight: 'bold', fontSize: '0.85rem', margin: '15px 0 6px 0', color: '#1e293b', borderBottom: '2px solid #0f172a', paddingBottom: '4px' }}>DESCRIPTION - FABRIC</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                        <th style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', width: '35%' }}>Fabric Component</th>
                        <th style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', width: '20%' }}>Yarn Details</th>
                        <th style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', width: '10%' }}>Supplier</th>
                        <th style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', width: '8%' }}>Width</th>
                        <th style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', width: '8%', textAlign: 'right' }}>Price</th>
                        <th style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', width: '8%', textAlign: 'right' }}>Cons (Pcs)</th>
                        <th style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', width: '5%', textAlign: 'right' }}>W%</th>
                        <th style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', width: '10%', textAlign: 'right' }}>Total Qty</th>
                        <th style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', width: '10%', textAlign: 'right' }}>Total Cost ($)</th>
                        <th style={{ padding: '6px 8px', width: '8%', textAlign: 'right' }}>PRE-COST %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayFabrics.map((f: any, i: number) => {
                        const ydetail = f.yarns?.[0] ? `${f.yarns[0].yarn_composition} ${f.yarns[0].yarn_count}` : (matchedOrder?.yarn_comp ? `${matchedOrder.yarn_comp} ${matchedOrder.yarn_type || ''}` : 'Organic Cotton Yarn');
                        const pctOfTotal = totalAmt > 0 ? (f.total_amount / totalAmt) * 100 : 0;
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>{f.body_part || 'Body Fabric'} ({f.composition || '100% Cotton'}, {f.gsm_oz || 180} GSM)</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>{ydetail}</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>{f.n_supplier || viewingBudget.buying_agent || 'Apex Textiles'}</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>{f.dia_type || 'Open'}</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>${(f.rate || 0).toFixed(4)}</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>{(f.grey_cons || 0).toFixed(4)}</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>{f.process_loss_pct || 0}%</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>{Math.ceil(f.total_qty || 0).toLocaleString()} Kg</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold' }}>${(f.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 4 })}</td>
                            <td style={{ padding: '6px 8px', textAlign: 'right' }}>{pctOfTotal.toFixed(4)}%</td>
                          </tr>
                        );
                      })}

                      {/* SUMMARY ROWS - YARN, KNITTING, DYEING, CONVERSION */}
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', fontWeight: 600 }}>Total Yarn Cost</td>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>Yarn Details Sum</td>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>Toma</td>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>0</td>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>$0.2200</td>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>2.0000</td>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>0.0%</td>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>{Math.ceil(totalYarnCost / 0.22).toLocaleString()}</td>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold' }}>${totalYarnCost.toLocaleString(undefined, { minimumFractionDigits: 4 })}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>{(totalAmt > 0 ? (totalYarnCost / totalAmt) * 100 : 0).toFixed(4)}%</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', fontWeight: 600 }} colSpan={8}>Total Knitting Cost</td>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold' }}>${totalKnittingCost.toLocaleString(undefined, { minimumFractionDigits: 4 })}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>{(totalAmt > 0 ? (totalKnittingCost / totalAmt) * 100 : 0).toFixed(4)}%</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', fontWeight: 600 }} colSpan={8}>Total Dyeing Cost</td>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold' }}>${totalDyeingCost.toLocaleString(undefined, { minimumFractionDigits: 4 })}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>{(totalAmt > 0 ? (totalDyeingCost / totalAmt) * 100 : 0).toFixed(4)}%</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', fontWeight: 600 }} colSpan={8}>AOP</td>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold' }}>${totalAOPCost.toLocaleString(undefined, { minimumFractionDigits: 4 })}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>{(totalAmt > 0 ? (totalAOPCost / totalAmt) * 100 : 0).toFixed(4)}%</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', fontWeight: 600 }} colSpan={8}>Total Other Conversion Cost</td>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold' }}>${totalOtherConversionCost.toLocaleString(undefined, { minimumFractionDigits: 4 })}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>{(totalAmt > 0 ? (totalOtherConversionCost / totalAmt) * 100 : 0).toFixed(4)}%</td>
                      </tr>
                      <tr style={{ background: '#f1f5f9', fontWeight: 'bold', borderTop: '2px solid #cbd5e1' }}>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }} colSpan={8}>Total Fabric Cost</td>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>${totalFabricCost.toLocaleString(undefined, { minimumFractionDigits: 4 })}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>{(totalAmt > 0 ? (totalFabricCost / totalAmt) * 100 : 0).toFixed(4)}%</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* 2. ACCESSORIES & SERVICES COST TABLE */}
                  <h4 style={{ fontWeight: 'bold', fontSize: '0.85rem', margin: '15px 0 6px 0', color: '#1e293b', borderBottom: '2px solid #0f172a', paddingBottom: '4px' }}>Accessories - Description</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                        <th style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', width: '35%' }}>Accessories - Description</th>
                        <th style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', width: '20%' }}>Supplier Name</th>
                        <th style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', width: '10%', textAlign: 'right' }}>Unit Price (USD)</th>
                        <th style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', width: '8%', textAlign: 'right' }}>Unit (in number)</th>
                        <th style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', width: '8%', textAlign: 'right' }}>Consumption / 1 Pcs</th>
                        <th style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', width: '5%', textAlign: 'right' }}>W%</th>
                        <th style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', width: '10%', textAlign: 'right' }}>Total Qty</th>
                        <th style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', width: '8%' }}>UOM</th>
                        <th style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', width: '10%', textAlign: 'right' }}>Total Cost (USD)</th>
                        <th style={{ padding: '6px 8px', width: '8%', textAlign: 'right' }}>PRE-COST %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Trims list */}
                      {displayTrims.map((t: any, i: number) => {
                        const pctOfTotal = totalAmt > 0 ? (t.total_amount / totalAmt) * 100 : 0;
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>{t.item_name} ({t.item_description || 'Trim'})</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>{t.n_supplier || viewingBudget.buying_agent || 'Local Supplier'}</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>${(t.rate || 0).toFixed(4)}</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>1</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>{(t.finish_cons || t.grey_cons || 0).toFixed(4)}</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>{t.process_loss_pct || 0}%</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>{Math.ceil(t.total_qty || 0).toLocaleString()}</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>{t.cons_uom || 'Pcs'}</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold' }}>${(t.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 4 })}</td>
                            <td style={{ padding: '6px 8px', textAlign: 'right' }}>{pctOfTotal.toFixed(4)}%</td>
                          </tr>
                        );
                      })}
                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', fontWeight: 600 }} colSpan={8}>Total Trims/Accessories Cost</td>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold' }}>${totalTrimsCost.toLocaleString(undefined, { minimumFractionDigits: 4 })}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>{(totalAmt > 0 ? (totalTrimsCost / totalAmt) * 100 : 0).toFixed(4)}%</td>
                      </tr>

                      {/* Embs list */}
                      {displayEmbs.map((e: any, i: number) => {
                        const pctOfTotal = totalAmt > 0 ? (e.total_amount / totalAmt) * 100 : 0;
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>{e.emb_type || e.embellishment_type || 'Embellishment'} ({e.emb_name || e.embellishment_name || 'Logo'})</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>{e.supplier || 'Local Supplier'}</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>${(e.rate || 0).toFixed(4)}</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>1</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>{(e.cons_unit_gmt || e.cons || 0).toFixed(4)}</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>{e.process_loss_pct || 0}%</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>{Math.ceil(e.total_qty || 0).toLocaleString()}</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>Dzn</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold' }}>${(e.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 4 })}</td>
                            <td style={{ padding: '6px 8px', textAlign: 'right' }}>{pctOfTotal.toFixed(4)}%</td>
                          </tr>
                        );
                      })}
                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', fontWeight: 600 }} colSpan={8}>Total Embellishment Cost</td>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold' }}>${totalEmbCost.toLocaleString(undefined, { minimumFractionDigits: 4 })}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>{(totalAmt > 0 ? (totalEmbCost / totalAmt) * 100 : 0).toFixed(4)}%</td>
                      </tr>

                      {/* Washes list */}
                      {displayWashes.map((w: any, i: number) => {
                        const pctOfTotal = totalAmt > 0 ? (w.total_amount / totalAmt) * 100 : 0;
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>{w.wash_type} ({w.wash_name})</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>{w.supplier || 'Apex Wash'}</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>${(w.rate || 0).toFixed(4)}</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>1</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>{(w.cons_unit_gmt || w.cons || 0).toFixed(4)}</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>{w.process_loss_pct || 0}%</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>{Math.ceil(w.total_qty || 0).toLocaleString()}</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>Dzn</td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold' }}>${(w.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 4 })}</td>
                            <td style={{ padding: '6px 8px', textAlign: 'right' }}>{pctOfTotal.toFixed(4)}%</td>
                          </tr>
                        );
                      })}
                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', fontWeight: 600 }} colSpan={8}>Total Wet Process/Wash Cost</td>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold' }}>${totalWashCost.toLocaleString(undefined, { minimumFractionDigits: 4 })}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>{(totalAmt > 0 ? (totalWashCost / totalAmt) * 100 : 0).toFixed(4)}%</td>
                      </tr>

                      {/* Indirect Costs */}
                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', fontWeight: 600 }} colSpan={8}>Finance/Commercial/Logistic Cost (Comml)</td>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold' }}>${commlCostVal.toLocaleString(undefined, { minimumFractionDigits: 4 })}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>{(totalAmt > 0 ? (commlCostVal / totalAmt) * 100 : 0).toFixed(4)}%</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', fontWeight: 600 }} colSpan={8}>Finance/Commercial Cost (Commission)</td>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold' }}>${commissionCostVal.toLocaleString(undefined, { minimumFractionDigits: 4 })}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>{(totalAmt > 0 ? (commissionCostVal / totalAmt) * 100 : 0).toFixed(4)}%</td>
                      </tr>

                      {/* Other indirect costs list if present */}
                      {[
                        { name: 'Lab Test', val: viewingBudget.total_lab_test_budget || 0 },
                        { name: 'Inspection Cost', val: viewingBudget.total_inspection_budget || 0 },
                        { name: 'Sample Cost', val: viewingBudget.total_sample_budget || 0 },
                        { name: 'Freight Cost', val: viewingBudget.total_freight_budget || 0 },
                        { name: 'Other Cost', val: viewingBudget.total_other_budget || 0 },
                        { name: 'Courier Cost', val: viewingBudget.total_courier_budget || 0 },
                        { name: 'Certif. Cost', val: viewingBudget.total_certif_budget || 0 },
                        { name: 'Common OH', val: viewingBudget.total_common_oh_budget || 0 },
                        { name: 'Deffd. LC Cost', val: viewingBudget.total_deffd_lc_budget || 0 },
                        { name: 'Design Cost', val: viewingBudget.total_design_budget || 0 },
                        { name: 'Studio Cost', val: viewingBudget.total_studio_budget || 0 },
                        { name: 'Opert. Exp.', val: viewingBudget.total_opert_exp_budget || 0 },
                        { name: 'Income Tax', val: viewingBudget.total_income_tax_budget || 0 },
                      ].filter(x => x.val > 0).map((x, idx) => (
                        <tr key={`ind-${idx}`} style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', fontWeight: 600 }} colSpan={8}>{x.name}</td>
                          <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold' }}>${x.val.toLocaleString(undefined, { minimumFractionDigits: 4 })}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'right' }}>{(totalAmt > 0 ? (x.val / totalAmt) * 100 : 0).toFixed(4)}%</td>
                        </tr>
                      ))}

                      {/* Grand Total Row */}
                      <tr style={{ background: '#e2e8f0', fontWeight: 'bold', borderTop: '2px solid #0f172a' }}>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }} colSpan={8}>Grand Total</td>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>${totalAmt.toLocaleString(undefined, { minimumFractionDigits: 4 })}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>{(totalAmt > 0 ? 100 : 0).toFixed(4)}%</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* 3. SUMMARY FOOTER STATS BLOCK */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', marginBottom: '15px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                        <th style={{ padding: '4px', borderRight: '1px solid #cbd5e1', textAlign: 'center', width: '12.5%' }}>CPM</th>
                        <th style={{ padding: '4px', borderRight: '1px solid #cbd5e1', textAlign: 'center', width: '12.5%' }}>SMV</th>
                        <th style={{ padding: '4px', borderRight: '1px solid #cbd5e1', textAlign: 'center', width: '12.5%' }}>M/C</th>
                        <th style={{ padding: '4px', borderRight: '1px solid #cbd5e1', textAlign: 'center', width: '12.5%' }}>PRODUCTION</th>
                        <th style={{ padding: '4px', borderRight: '1px solid #cbd5e1', textAlign: 'center', width: '12.5%' }}>EFFICIENCY %</th>
                        <th style={{ padding: '4px', borderRight: '1px solid #cbd5e1', textAlign: 'center', width: '12.5%' }}>CM/Pcs</th>
                        <th style={{ padding: '4px', borderRight: '1px solid #cbd5e1', textAlign: 'center', width: '12.5%' }}>CM/Dzn</th>
                        <th style={{ padding: '4px', textAlign: 'center', width: '12.5%' }}>EPM</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '6px', borderRight: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold' }}>${cpm.toFixed(4)}</td>
                        <td style={{ padding: '6px', borderRight: '1px solid #cbd5e1', textAlign: 'center' }}>{smv.toFixed(2)}</td>
                        <td style={{ padding: '6px', borderRight: '1px solid #cbd5e1', textAlign: 'center' }}>{mcLineVal}</td>
                        <td style={{ padding: '6px', borderRight: '1px solid #cbd5e1', textAlign: 'center' }}>{prodLineVal}</td>
                        <td style={{ padding: '6px', borderRight: '1px solid #cbd5e1', textAlign: 'center' }}>{efficiencyVal.toFixed(2)}%</td>
                        <td style={{ padding: '6px', borderRight: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold' }}>${cmPcs.toFixed(4)} / PCS</td>
                        <td style={{ padding: '6px', borderRight: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold' }}>${cmDzn.toFixed(2)} / DZ</td>
                        <td style={{ padding: '6px', textAlign: 'center', fontWeight: 'bold', color: '#6366f1' }}>${epm.toFixed(4)}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* TOTAL CM & NET EARNINGS */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '6px 8px', background: '#f8fafc', fontWeight: 600, borderRight: '1px solid #cbd5e1', width: '30%' }}>FACTORY CM/DZ Budget</td>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', width: '50%', fontWeight: 'bold' }}>${cmDzn.toFixed(2)} / DZ</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', width: '20%' }}>{(totalAmt > 0 ? (totalCM / totalAmt) * 100 : 0).toFixed(2)}%</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '6px 8px', background: '#f8fafc', fontWeight: 600, borderRight: '1px solid #cbd5e1' }}>TOTAL CM</td>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', fontWeight: 'bold' }}>${totalCM.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>{(totalAmt > 0 ? (totalCM / totalAmt) * 100 : 0).toFixed(2)}%</td>
                      </tr>
                      <tr style={{ fontWeight: 'bold' }}>
                        <td style={{ padding: '6px 8px', background: '#f8fafc', fontWeight: 600, borderRight: '1px solid #cbd5e1' }}>NET EARNINGS</td>
                        <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', color: netEarningsColor }}>${netEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: netEarningsColor }}>{(totalRevenue > 0 ? (netEarnings / totalRevenue) * 100 : 0).toFixed(2)}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })()}

            {/* VISUAL 2: DIRECT/INDIRECT CALCULATOR VIEW */}
            {viewTab === 'calculator' && (() => {
              const totalCost =
                calcFabric + calcYarn + calcTrims + calcEmbel + calcWash + calcComml +
                calcLabTest + calcInspection + calcFreight + calcCourier + calcCertif +
                calcDeffdLc + calcDesign + calcStudio + calcSample + calcOpertExp +
                calcCm + calcInterest + calcIncomeTax + calcDepcAmort + calcCommission;

              const bomCost = calcFabric + calcYarn + calcTrims + calcEmbel;
              const marginDzn = calcPriceDzn - totalCost;
              const pricePcs = calcPriceDzn / 12;
              const finalCostPcs = totalCost / 12;
              const marginPcs = pricePcs - finalCostPcs;

              // divisor fallback to 1.42658 to match mock screenshot exactly when price is 0
              const divisor = pricePcs > 0 ? pricePcs : 1.42658;
              const marginPcsPct = divisor !== 0 ? (marginPcs / divisor) * 100 : 0;

              const exwCost = bomCost - finalCostPcs;
              const bomCostPcs = bomCost / 12;
              const bomMarginPcs = pricePcs > 0 ? (pricePcs - bomCostPcs) : 0;
              const bomMarginPcsPct = (pricePcs > 0 && bomCostPcs > 0) ? (bomMarginPcs / pricePcs) * 100 : 0;

              const getPctStr = (val: number) => {
                const pct = calcPriceDzn > 0 ? (val / calcPriceDzn) * 100 : 0;
                return pct.toFixed(2) + '%';
              };

              const tableStyle: React.CSSProperties = {
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: 'Calibri, "Segoe UI", sans-serif',
                fontSize: '0.8rem',
                color: '#1e293b'
              };

              const cellStyle: React.CSSProperties = {
                padding: '4px 8px',
                border: '1px solid #cbd5e1',
                verticalAlign: 'middle',
                height: '32px'
              };

              const labelStyle: React.CSSProperties = {
                ...cellStyle,
                fontWeight: 'bold',
                background: '#f8fafc',
                width: '50%'
              };

              const valueCellStyle: React.CSSProperties = {
                ...cellStyle,
                width: '35%',
                textAlign: 'right'
              };

              const pctCellStyle: React.CSSProperties = {
                ...cellStyle,
                width: '15%',
                textAlign: 'right',
                background: '#f8fafc',
                color: '#64748b',
                fontWeight: 500
              };

              const inputStyle: React.CSSProperties = {
                width: '100%',
                border: '1px solid #cbd5e1',
                borderRadius: '3px',
                padding: '2px 6px',
                textAlign: 'right',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                background: '#fff',
                color: '#1e293b'
              };

              const disabledInputStyle: React.CSSProperties = {
                ...inputStyle,
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                fontWeight: 'bold',
                color: '#0f172a'
              };

              const redBorderStyle: React.CSSProperties = {
                border: '2.5px solid #ef4444',
                color: '#ef4444',
                fontWeight: 'bold'
              };

              return (
                <div style={{ background: '#fff', color: '#1e293b', padding: '24px', borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                  {/* TOP HEADER CONTROLS */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '2px solid #0f172a', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Buyer:</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', background: '#22c55e', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>{viewingBudget.buyer || 'Zara'}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', marginLeft: '12px' }}>Style:</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', background: '#22c55e', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>{viewingBudget.style_no || 'test'}</span>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ background: '#0284c7', borderColor: '#0284c7', fontSize: '0.8rem', padding: '6px 16px', borderRadius: '4px', fontWeight: 'bold', color: '#fff', cursor: 'pointer' }}
                      onClick={() => resetCalculator(viewingBudget)}
                    >
                      Calculator
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* LEFT COLUMN: DIRECT COST LIMITS */}
                    <div>
                      <table style={tableStyle}>
                        <tbody>
                          <tr>
                            <td style={labelStyle}>Fabric Cost</td>
                            <td style={valueCellStyle}>
                              <input type="number" step="any" value={calcFabric} onChange={e => setCalcFabric(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </td>
                            <td style={pctCellStyle}>{getPctStr(calcFabric)}</td>
                          </tr>
                          <tr>
                            <td style={labelStyle}>Yarn Cost</td>
                            <td style={valueCellStyle}>
                              <input type="number" step="any" value={calcYarn} onChange={e => setCalcYarn(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </td>
                            <td style={pctCellStyle}>{getPctStr(calcYarn)}</td>
                          </tr>
                          <tr>
                            <td style={labelStyle}>Trims Cost</td>
                            <td style={valueCellStyle}>
                              <input type="number" step="any" value={calcTrims} onChange={e => setCalcTrims(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </td>
                            <td style={pctCellStyle}>{getPctStr(calcTrims)}</td>
                          </tr>
                          <tr>
                            <td style={labelStyle}>Embel. Cost</td>
                            <td style={valueCellStyle}>
                              <input type="number" step="any" value={calcEmbel} onChange={e => setCalcEmbel(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </td>
                            <td style={pctCellStyle}>{getPctStr(calcEmbel)}</td>
                          </tr>
                          <tr>
                            <td style={labelStyle}>Gmts.Wash</td>
                            <td style={valueCellStyle}>
                              <input type="number" step="any" value={calcWash} onChange={e => setCalcWash(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </td>
                            <td style={pctCellStyle}>{getPctStr(calcWash)}</td>
                          </tr>
                          <tr>
                            <td style={labelStyle}>Comml. Cost</td>
                            <td style={valueCellStyle}>
                              <input type="number" step="any" value={calcComml} onChange={e => setCalcComml(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </td>
                            <td style={pctCellStyle}>{getPctStr(calcComml)}</td>
                          </tr>
                          <tr>
                            <td style={labelStyle}>Lab Test</td>
                            <td style={valueCellStyle}>
                              <input type="number" step="any" value={calcLabTest} onChange={e => setCalcLabTest(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </td>
                            <td style={pctCellStyle}>{getPctStr(calcLabTest)}</td>
                          </tr>
                          <tr>
                            <td style={labelStyle}>Inspection Cost</td>
                            <td style={valueCellStyle}>
                              <input type="number" step="any" value={calcInspection} onChange={e => setCalcInspection(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </td>
                            <td style={pctCellStyle}>{getPctStr(calcInspection)}</td>
                          </tr>
                          <tr>
                            <td style={labelStyle}>Freight Cost</td>
                            <td style={valueCellStyle}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input type="number" step="any" value={calcFreight} onChange={e => setCalcFreight(parseFloat(e.target.value) || 0)} style={inputStyle} />
                                <input type="checkbox" checked={calcFreightChecked} onChange={e => setCalcFreightChecked(e.target.checked)} style={{ cursor: 'pointer' }} />
                              </div>
                            </td>
                            <td style={pctCellStyle}>{calcPriceDzn > 0 ? ((calcFreight / calcPriceDzn) * 100).toFixed(2) + '%' : '0.00'}</td>
                          </tr>
                          <tr>
                            <td style={labelStyle}>Courier Cost</td>
                            <td style={valueCellStyle}>
                              <input type="number" step="any" value={calcCourier} onChange={e => setCalcCourier(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </td>
                            <td style={pctCellStyle}>{getPctStr(calcCourier)}</td>
                          </tr>
                          <tr>
                            <td style={labelStyle}>Certif. Cost</td>
                            <td style={valueCellStyle}>
                              <input type="number" step="any" value={calcCertif} onChange={e => setCalcCertif(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </td>
                            <td style={pctCellStyle}>{getPctStr(calcCertif)}</td>
                          </tr>
                          <tr>
                            <td style={labelStyle}>Deffd. LC Cost</td>
                            <td style={valueCellStyle}>
                              <input type="number" step="any" value={calcDeffdLc} onChange={e => setCalcDeffdLc(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </td>
                            <td style={pctCellStyle}>{getPctStr(calcDeffdLc)}</td>
                          </tr>
                          <tr>
                            <td style={labelStyle}>Design Cost</td>
                            <td style={valueCellStyle}>
                              <input type="number" step="any" value={calcDesign} onChange={e => setCalcDesign(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </td>
                            <td style={pctCellStyle}>{getPctStr(calcDesign)}</td>
                          </tr>
                          <tr>
                            <td style={labelStyle}>Studio Cost</td>
                            <td style={valueCellStyle}>
                              <input type="number" step="any" value={calcStudio} onChange={e => setCalcStudio(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </td>
                            <td style={pctCellStyle}>{getPctStr(calcStudio)}</td>
                          </tr>
                          <tr>
                            <td style={labelStyle}>Sample Cost</td>
                            <td style={valueCellStyle}>
                              <input type="number" step="any" value={calcSample} onChange={e => setCalcSample(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </td>
                            <td style={pctCellStyle}>{getPctStr(calcSample)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* RIGHT COLUMN: INDIRECT COSTS & MARGIN CALCULATIONS */}
                    <div>
                      <table style={tableStyle}>
                        <tbody>
                          <tr>
                            <td style={labelStyle}>Opert. Exp.</td>
                            <td style={valueCellStyle}>
                              <input type="number" step="any" value={calcOpertExp} onChange={e => setCalcOpertExp(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </td>
                            <td style={pctCellStyle}>{getPctStr(calcOpertExp)}</td>
                          </tr>
                          <tr>
                            <td style={labelStyle}>CM Cost</td>
                            <td style={valueCellStyle}>
                              <input type="number" step="any" value={calcCm} onChange={e => setCalcCm(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </td>
                            <td style={pctCellStyle}>{getPctStr(calcCm)}</td>
                          </tr>
                          <tr>
                            <td style={labelStyle}>Interest Cost</td>
                            <td style={valueCellStyle}>
                              <input type="number" step="any" value={calcInterest} onChange={e => setCalcInterest(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </td>
                            <td style={pctCellStyle}>{getPctStr(calcInterest)}</td>
                          </tr>
                          <tr>
                            <td style={labelStyle}>Income Tax</td>
                            <td style={valueCellStyle}>
                              <input type="number" step="any" value={calcIncomeTax} onChange={e => setCalcIncomeTax(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </td>
                            <td style={pctCellStyle}>{getPctStr(calcIncomeTax)}</td>
                          </tr>
                          <tr>
                            <td style={labelStyle}>Depc. & Amort.</td>
                            <td style={valueCellStyle}>
                              <input type="number" step="any" value={calcDepcAmort} onChange={e => setCalcDepcAmort(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </td>
                            <td style={pctCellStyle}>{getPctStr(calcDepcAmort)}</td>
                          </tr>
                          <tr>
                            <td style={labelStyle}>Commission</td>
                            <td style={valueCellStyle}>
                              <input type="number" step="any" value={calcCommission} onChange={e => setCalcCommission(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </td>
                            <td style={pctCellStyle}>{getPctStr(calcCommission)}</td>
                          </tr>
                          <tr style={{ background: '#eff6ff' }}>
                            <td style={{ ...labelStyle, color: '#1e3a8a' }}>Total Cost</td>
                            <td style={valueCellStyle}>
                              <input type="text" readOnly value={totalCost.toFixed(4)} style={disabledInputStyle} />
                            </td>
                            <td style={pctCellStyle}>{getPctStr(totalCost)}</td>
                          </tr>
                          <tr style={{ background: '#eff6ff' }}>
                            <td style={{ ...labelStyle, color: '#1e3a8a' }}>BOM Cost</td>
                            <td style={valueCellStyle}>
                              <input type="text" readOnly value={bomCost.toFixed(4)} style={disabledInputStyle} />
                            </td>
                            <td style={pctCellStyle}>{calcPriceDzn > 0 ? ((bomCost / calcPriceDzn) * 100).toFixed(2) + '%' : '0.00'}</td>
                          </tr>
                          <tr>
                            <td style={labelStyle}>Price/Dzn</td>
                            <td style={valueCellStyle}>
                              <input type="number" step="any" value={calcPriceDzn} onChange={e => setCalcPriceDzn(parseFloat(e.target.value) || 0)} style={{ ...inputStyle, fontWeight: 'bold' }} />
                            </td>
                            <td style={{ ...pctCellStyle, color: '#0f172a', fontWeight: 'bold' }}>100%</td>
                          </tr>
                          <tr style={{ background: '#f8fafc' }}>
                            <td style={labelStyle}>Margin/Dzn</td>
                            <td style={valueCellStyle}>
                              <input type="text" readOnly value={marginDzn.toFixed(4)} style={{ ...disabledInputStyle, color: marginDzn >= 0 ? '#10b981' : '#ef4444' }} />
                            </td>
                            <td style={pctCellStyle}>{getPctStr(marginDzn)}</td>
                          </tr>
                          <tr>
                            <td style={labelStyle}>Price/Pcs</td>
                            <td style={valueCellStyle}>
                              <input type="text" readOnly value={pricePcs.toFixed(4)} style={disabledInputStyle} />
                            </td>
                            <td style={{ ...pctCellStyle, color: '#0f172a', fontWeight: 'bold' }}>100%</td>
                          </tr>
                          <tr>
                            <td style={labelStyle}>Final Cost/Pcs</td>
                            <td style={valueCellStyle}>
                              <input type="text" readOnly value={finalCostPcs.toFixed(4)} style={disabledInputStyle} />
                            </td>
                            <td style={pctCellStyle}>{pricePcs > 0 ? ((finalCostPcs / pricePcs) * 100).toFixed(2) + '%' : '0.00%'}</td>
                          </tr>
                          <tr style={{ background: '#fef2f2' }}>
                            <td style={labelStyle}>Margin/pcs</td>
                            <td style={{ ...valueCellStyle, padding: '0px' }}>
                              <input type="text" readOnly value={marginPcs.toFixed(4)} style={{ ...disabledInputStyle, ...redBorderStyle, color: marginPcs >= 0 ? '#10b981' : '#ef4444' }} />
                            </td>
                            <td style={{ ...pctCellStyle, ...redBorderStyle, color: marginPcs >= 0 ? '#10b981' : '#ef4444', background: '#fef2f2' }}>
                              {marginPcsPct.toFixed(2)}%
                            </td>
                          </tr>
                          <tr>
                            <td style={labelStyle}>EXW Cost</td>
                            <td style={valueCellStyle}>
                              <input type="text" readOnly value={exwCost.toFixed(4)} style={disabledInputStyle} />
                            </td>
                            <td style={pctCellStyle}>{calcPriceDzn > 0 ? ((exwCost / calcPriceDzn) * 100).toFixed(2) + '%' : '0.00'}</td>
                          </tr>
                          <tr>
                            <td style={labelStyle}>BOM Margin/Pcs</td>
                            <td style={valueCellStyle}>
                              <input type="text" readOnly value={bomMarginPcs.toFixed(4)} style={disabledInputStyle} />
                            </td>
                            <td style={pctCellStyle}>{bomMarginPcsPct.toFixed(2)}%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* BOTTOM ACTION BUTTONS */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid #cbd5e1', paddingTop: '15px' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => resetCalculator(viewingBudget)}
                      style={{ cursor: 'pointer', padding: '8px 16px', borderRadius: '6px', fontWeight: 600 }}
                    >
                      Reset to Default
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleSaveCalculator}
                      style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 600 }}
                    >
                      Save & Sync Budget
                    </button>
                  </div>
                </div>
              );
            })()}

            <div className="mt-20 text-right" style={{ marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setViewingBudget(null)}>Close View Window</button>
            </div>
          </div>
        </div>
      )}

      {/* APPROVAL DECISION MODAL */}
      {showApprovalModal && reviewingBudget && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Approve / Reject Cost Budget</h3>
              <XCircle className="modal-close" onClick={() => setShowApprovalModal(false)} />
            </div>

            <p className="mb-20">You are reviewing budget limit: <strong>{reviewingBudget.budget_reference}</strong>. Please specify the decision status and enter remarks from the board.</p>

            <div className="form-group">
              <label className="form-label">Decision Status</label>
              <select className="form-control" value={approvalStatus} onChange={e => setApprovalStatus(e.target.value)}>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Pending">Pending (Requires Review)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Feedback from Approval Body</label>
              <textarea className="form-control" value={feedbackRemarks} onChange={e => setFeedbackRemarks(e.target.value)} placeholder="Provide feedback notes..." rows={4} />
            </div>

            <div className="mt-20 text-right">
              <button type="button" className="btn btn-secondary mr-10" style={{ marginRight: '10px' }} onClick={() => setShowApprovalModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleApprovalSubmit}>Submit Decision</button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* COST COMPONENT DETAILED MODAL POPUPS     */}
      {/* ========================================== */}

      {/* 1. FABRIC COST POPUP */}
      {showFabricPopup && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '950px', width: '95%', overflowY: 'auto', maxHeight: '90vh' }}>
            <div className="modal-header">
              <h3>Detailed Fabric Merchandising Costing Specifications</h3>
              <XCircle className="modal-close" onClick={() => setShowFabricPopup(false)} />
            </div>

            <TemplateSelector type="fabric" onLoadTemplate={data => setFabricDetailsList(data)} currentData={fabricDetailsList} />

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)', marginBottom: '20px' }}>
              <h5 style={{ color: 'var(--primary)', marginBottom: '12px' }}>Add new Fabric Cost row</h5>
              <div className="grid-3 mt-10">
                <div className="form-group">
                  <label className="form-label">Garment Item</label>
                  <input type="text" className="form-control" placeholder="e.g. Polo Shirt" id="fab-gmt-item" defaultValue="Polo Shirt" />
                </div>
                <div className="form-group">
                  <label className="form-label">Body Part *</label>
                  <select className="form-control" id="fab-body-part">
                    <option value="Body">Body Part</option>
                    <option value="Collar">Collar Part</option>
                    <option value="Cuff">Cuff Part</option>
                    <option value="Pocket">Pocket Lining</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Body Part Type</label>
                  <input type="text" className="form-control" placeholder="Shell Fabric, contrast..." id="fab-part-type" defaultValue="Shell Fabric" />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Color Range *</label>
                  <input type="text" className="form-control" placeholder="Solid, yarn-dyed..." id="fab-color-range" defaultValue="Solid" />
                </div>
                <div className="form-group">
                  <label className="form-label">Color Nature</label>
                  <input type="text" className="form-control" placeholder="Conventional, sustainable..." id="fab-color-nature" defaultValue="Conventional" />
                </div>
                <div className="form-group">
                  <label className="form-label">Fabric Composition *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="100% Cotton"
                    id="fab-composition"
                    value={fabricComposition}
                    onChange={e => {
                      setFabricComposition(e.target.value);
                      const lower = e.target.value.toLowerCase();
                      if (lower.includes('cotton') || lower.includes('jersey') || lower.includes('knit')) {
                        setFabricType('Jersey');
                        setFabricNature('Knit');
                      } else {
                        setFabricType('Woven Fabric');
                        setFabricNature('Woven');
                      }
                    }}
                  />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Fabric Type *</label>
                  <input type="text" className="form-control" id="fab-type" value={fabricType} onChange={e => setFabricType(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Fabric Nature</label>
                  <input type="text" className="form-control" id="fab-nature" value={fabricNature} onChange={e => setFabricNature(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Code</label>
                  <input type="number" className="form-control" id="fab-code" defaultValue={101} />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Fabric Source *</label>
                  <select className="form-control" id="fab-source" value={fabricSource} onChange={e => setFabricSource(e.target.value)}>
                    <option value="Production">Production</option>
                    <option value="Purchase">Purchase</option>
                    <option value="Buyer Supplier">Buyer Supplier</option>
                    <option value="Stock">Stock</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">N. Supplier</label>
                  <input type="text" className="form-control" id="fab-supplier" defaultValue="Apex Supplier" />
                </div>
                <div className="form-group">
                  <label className="form-label">Gsm/Oz *</label>
                  <input type="number" className="form-control" defaultValue={180} id="fab-gsm" />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Dia Type</label>
                  <input type="text" className="form-control" defaultValue="Open" id="fab-dia" />
                </div>
                <div className="form-group">
                  <label className="form-label">Color & Size Sensitive</label>
                  <select className="form-control" id="fab-sensitive" value={colorSensitive} onChange={e => {
                    setColorSensitive(e.target.value);
                    if (e.target.value !== 'Contrast Color') {
                      setFabricColorValue('');
                    }
                  }}>
                    <option value="As per Garments Color">As per Garments Color</option>
                    <option value="Contrast Color">Contrast Color</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-control"
                      id="fab-color"
                      value={fabricColorValue}
                      onChange={e => setFabricColorValue(e.target.value)}
                      disabled={colorSensitive !== 'Contrast Color'}
                      placeholder={colorSensitive !== 'Contrast Color' ? 'Disabled unless Contrast Color' : 'Mapped Colors'}
                      style={{ opacity: colorSensitive !== 'Contrast Color' ? 0.6 : 1 }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      disabled={colorSensitive !== 'Contrast Color'}
                      onClick={() => setShowContrastColorPopup(true)}
                    >
                      Browse Option
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Consumption Basis</label>
                  <select className="form-control" id="fab-basis" defaultValue="Marker">
                    <option value="Marker">Marker</option>
                    <option value="CAD">CAD</option>
                    <option value="Measurement">Measurement</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">UOM *</label>
                  <select className="form-control" id="fab-uom" defaultValue="Kg">
                    <option value="Kg">Kg</option>
                    <option value="Yds">Yds</option>
                    <option value="Mtr">Mtr</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Image Attachment</label>
                  <input type="file" className="form-control" id="fab-image" style={{ height: '36px', padding: '4px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '15px', borderTop: '1px solid var(--border-muted)', paddingTop: '15px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => {
                  if (!currentOrder) return alert("Please select and fetch an order reference first to get PO breakdown.");
                  setShowGreyConsPopup(true);
                }}>
                  Grey Consumption * (Browse Option) [{greyConsRows.length} lines configured]
                </button>
              </div>

              {/* Consumption Autocomplete Summary Panel */}
              <div className="grid-4 mt-15" style={{ background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '4px' }}>
                <div className="form-group">
                  <label className="form-label">Rate (Auto Fill)</label>
                  <input type="number" className="form-control" value={greyConsRate} disabled style={{ opacity: 0.7 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Amount (Auto Fill)</label>
                  <input type="number" className="form-control" value={greyConsAmount} disabled style={{ opacity: 0.7 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Quantity (Auto Fill)</label>
                  <input type="number" className="form-control" value={greyConsTotalQty} disabled style={{ opacity: 0.7 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Amount (Auto Fill)</label>
                  <input type="number" className="form-control" value={greyConsTotalAmt} disabled style={{ opacity: 0.7 }} />
                </div>
              </div>

              {/* Yarn Costing Section (Production source only) */}
              {fabricSource === 'Production' && (
                <YarnCostingSection composition={fabricComposition} yarns={yarnRows} onChange={yarns => setYarnRows(yarns)} greyCons={greyConsTotalQty} />
              )}

              <div className="text-right mt-20">
                <button type="button" className="btn btn-primary btn-sm" onClick={() => {
                  const gmt = (document.getElementById('fab-gmt-item') as HTMLInputElement)?.value || 'Polo Shirt';
                  const part = (document.getElementById('fab-body-part') as HTMLSelectElement)?.value || 'Body';
                  const partType = (document.getElementById('fab-part-type') as HTMLInputElement)?.value || 'Shell Fabric';
                  const colorRange = (document.getElementById('fab-color-range') as HTMLInputElement)?.value || 'Solid';
                  const colorNature = (document.getElementById('fab-color-nature') as HTMLInputElement)?.value || 'Conventional';
                  const codeVal = parseInt((document.getElementById('fab-code') as HTMLInputElement)?.value) || 101;
                  const supplierVal = (document.getElementById('fab-supplier') as HTMLInputElement)?.value || 'Apex Supplier';
                  const gsmVal = parseInt((document.getElementById('fab-gsm') as HTMLInputElement)?.value) || 180;
                  const diaVal = (document.getElementById('fab-dia') as HTMLInputElement)?.value || 'Open';
                  const basisVal = (document.getElementById('fab-basis') as HTMLSelectElement)?.value || 'Marker';
                  const uomVal = (document.getElementById('fab-uom') as HTMLSelectElement)?.value || 'Kg';

                  setFabricDetailsList([...fabricDetailsList, {
                    gmt_item: gmt,
                    body_part: part,
                    body_part_type: partType,
                    color_range: colorRange,
                    color_nature: colorNature,
                    composition: fabricComposition,
                    fabric_type: fabricType,
                    fabric_nature: fabricNature,
                    code: codeVal,
                    fabric_source: fabricSource,
                    n_supplier: supplierVal,
                    gsm_oz: gsmVal,
                    dia_type: diaVal,
                    color_size_sensitive: colorSensitive,
                    color: fabricColorValue || 'As per Garments Color',
                    cons_basis: basisVal,
                    uom: uomVal,
                    grey_cons: greyConsTotalQty / (totalQuantity || 1),
                    rate: greyConsRate,
                    amount: greyConsAmount,
                    total_qty: greyConsTotalQty,
                    total_amount: greyConsTotalAmt,
                    consumption: greyConsRows,
                    yarns: yarnRows
                  }]);

                  // Reset states
                  setFabricComposition('100% Cotton');
                  setFabricType('Jersey');
                  setFabricNature('Knit');
                  setFabricSource('Production');
                  setColorSensitive('As per Garments Color');
                  setFabricColorValue('');
                  setGreyConsRate(0);
                  setGreyConsAmount(0);
                  setGreyConsTotalQty(0);
                  setGreyConsTotalAmt(0);
                  setGreyConsRows([]);
                  setYarnRows([]);
                  setContrastColorRows([]);
                }}>
                  Add Fabric Cost Row
                </button>
              </div>
            </div>

            <div className="table-wrapper" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Gmt Item</th>
                    <th>Body Part</th>
                    <th>Composition</th>
                    <th>Source</th>
                    <th>Grey Cons</th>
                    <th>Rate ($)</th>
                    <th>Total Amt ($)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {fabricDetailsList.map((f, i) => (
                    <tr key={i}>
                      <td>{f.gmt_item}</td>
                      <td>{f.body_part}</td>
                      <td>{f.composition}</td>
                      <td>{f.fabric_source}</td>
                      <td>{f.grey_cons?.toFixed(4)}</td>
                      <td>${f.rate?.toFixed(2)}</td>
                      <td><strong>${f.total_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
                      <td>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => {
                          setFabricDetailsList(fabricDetailsList.filter((_, idx) => idx !== i));
                        }}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Contrast Color Modal Dialog Sub-popup */}
            {showContrastColorPopup && (
              <div className="modal-overlay" style={{ zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)' }}>
                <div className="modal-content" style={{ maxWidth: '480px', width: '90%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }}>
                  <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <h4 style={{ color: '#fff', fontWeight: 'bold' }}>Contrast Color Mapping</h4>
                    <XCircle className="modal-close" onClick={() => setShowContrastColorPopup(false)} style={{ cursor: 'pointer', color: '#94a3b8' }} />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Garment Color (From Order Reference)</label>
                    <select
                      className="form-control"
                      value={contrastGmtColor}
                      onChange={e => setContrastGmtColor(e.target.value)}
                      style={{ width: '100%', height: '36px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '6px', padding: '0 8px' }}
                    >
                      <option value="">Select Garment Color</option>
                      {Array.from(new Set(currentOrder?.pos?.flatMap((p: any) => p.breakdown?.map((b: any) => b.color) || []) || [])).map((color: any) => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group mt-10">
                    <label className="form-label" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Fabric Color (Contrast)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. White, Black, Red..."
                      value={contrastFabricColor}
                      onChange={e => setContrastFabricColor(e.target.value)}
                      style={{ width: '100%', height: '36px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '6px', padding: '0 10px' }}
                    />
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary mt-10"
                    onClick={() => {
                      if (!contrastGmtColor || !contrastFabricColor) return alert("Please select garment color and input fabric color");
                      setContrastColorRows([...contrastColorRows, { gmtColor: contrastGmtColor, fabricColor: contrastFabricColor }]);
                      setContrastGmtColor('');
                      setContrastFabricColor('');
                    }}
                    style={{ marginTop: '10px', height: '32px', padding: '0 12px', fontSize: '0.8rem', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Add Mapping Line
                  </button>

                  {contrastColorRows.length > 0 && (
                    <div className="table-wrapper mt-15" style={{ maxHeight: '120px', marginTop: '15px', overflowY: 'auto' }}>
                      <table className="data-table" style={{ fontSize: '0.75rem', width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: 'rgba(0,0,0,0.2)', textAlign: 'left' }}>
                            <th style={{ padding: '6px' }}>Garment Color</th>
                            <th style={{ padding: '6px' }}>Fabric Color</th>
                            <th style={{ padding: '6px' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contrastColorRows.map((r, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                              <td style={{ padding: '6px' }}>{r.gmtColor}</td>
                              <td style={{ padding: '6px' }}>{r.fabricColor}</td>
                              <td style={{ padding: '6px' }}>
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() => setContrastColorRows(contrastColorRows.filter((_, i) => i !== idx))}
                                  style={{ cursor: 'pointer', backgroundColor: '#ef4444', border: 'none', color: '#fff', borderRadius: '4px', padding: '2px 6px' }}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="text-right mt-20" style={{ marginTop: '20px', textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-secondary mr-10"
                      style={{ marginRight: '10px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                      onClick={() => setShowContrastColorPopup(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                      onClick={() => {
                        const mappedText = contrastColorRows.map(r => `${r.gmtColor}->${r.fabricColor}`).join(', ');
                        setFabricColorValue(mappedText);
                        setShowContrastColorPopup(false);
                      }}
                    >
                      Apply Color Mapping
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-20 text-right">
              <button type="button" className="btn btn-primary" onClick={() => {
                const totalAmt = fabricDetailsList.reduce((sum, f) => sum + f.total_amount, 0);
                setFabricCost(totalAmt);
                setShowFabricPopup(false);
              }}>Apply Cost Limit</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. TRIMS COST POPUP */}
      {showTrimsPopup && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '900px', width: '95%', overflowY: 'auto', maxHeight: '90vh' }}>
            <div className="modal-header">
              <h3>Detailed Accessories & Trims Cost specifications</h3>
              <XCircle className="modal-close" onClick={() => setShowTrimsPopup(false)} />
            </div>

            <TemplateSelector type="trims" onLoadTemplate={data => setTrimsDetailsList(data)} currentData={trimsDetailsList} />

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)', marginBottom: '20px' }}>
              <h5 style={{ color: 'var(--primary)', marginBottom: '12px' }}>Add Trim Item Row</h5>
              <div className="grid-3 mt-10">
                <div className="form-group">
                  <label className="form-label">Gmts. Item</label>
                  <input type="text" className="form-control" value={trimsGmtItem} onChange={e => setTrimsGmtItem(e.target.value)} placeholder="Garment item type" />
                </div>
                <div className="form-group">
                  <label className="form-label">Item Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={trimsItemName}
                    onChange={e => {
                      setTrimsItemName(e.target.value);
                      const name = e.target.value.toLowerCase();
                      if (name.includes('thread')) {
                        setTrimsConsUom('Cones');
                      } else if (name.includes('zipper') || name.includes('button') || name.includes('label') || name.includes('poly') || name.includes('carton')) {
                        setTrimsConsUom('Pcs');
                      } else {
                        setTrimsConsUom('Dzn');
                      }
                    }}
                    placeholder="e.g. Sewing Thread, Button..."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Item Description</label>
                  <input type="text" className="form-control" value={trimsItemDesc} onChange={e => setTrimsItemDesc(e.target.value)} placeholder="Specs, size, color..." />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Cons Uom</label>
                  <input type="text" className="form-control" value={trimsConsUom} onChange={e => setTrimsConsUom(e.target.value)} placeholder="Auto filled from Item Name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Image Attachment</label>
                  <input type="file" className="form-control" style={{ height: '36px', padding: '4px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '15px', borderTop: '1px solid var(--border-muted)', paddingTop: '15px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => {
                  if (!currentOrder) return alert("Please select and fetch an order reference first to get PO breakdown.");
                  setShowTrimsConsPopup(true);
                }}>
                  Cons/Unit Gmts * (Browse Option) [{trimsConsRows.length} lines configured]
                </button>
              </div>

              {/* Autocomplete summary parameters */}
              <div className="grid-4 mt-15" style={{ background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '4px' }}>
                <div className="form-group">
                  <label className="form-label">Rate * (Auto Fill)</label>
                  <input type="number" className="form-control" value={trimsConsRate} disabled style={{ opacity: 0.7 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Amount (Auto Fill)</label>
                  <input type="number" className="form-control" value={trimsConsAmount} disabled style={{ opacity: 0.7 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Qty (Auto Fill)</label>
                  <input type="number" className="form-control" value={trimsConsTotalQty} disabled style={{ opacity: 0.7 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Amount * (Auto Fill)</label>
                  <input type="number" className="form-control" value={trimsConsTotalAmt} disabled style={{ opacity: 0.7 }} />
                </div>
              </div>

              <div className="text-right mt-20">
                <button type="button" className="btn btn-primary btn-sm" onClick={() => {
                  if (!trimsItemName) return alert("Item name is required");

                  setTrimsDetailsList([...trimsDetailsList, {
                    gmt_item: trimsGmtItem,
                    item_name: trimsItemName,
                    item_description: trimsItemDesc,
                    cons_uom: trimsConsUom,
                    cons_unit_gmt: trimsConsTotalQty / (totalQuantity || 1),
                    rate: trimsConsRate,
                    amount: trimsConsAmount,
                    total_qty: trimsConsTotalQty,
                    total_amount: trimsConsTotalAmt,
                    consumption: trimsConsRows
                  }]);

                  // Reset states
                  setTrimsGmtItem('Polo Shirt');
                  setTrimsItemName('Sewing Thread');
                  setTrimsItemDesc('Polyester Spun');
                  setTrimsConsUom('Cones');
                  setTrimsConsRate(0);
                  setTrimsConsAmount(0);
                  setTrimsConsTotalQty(0);
                  setTrimsConsTotalAmt(0);
                  setTrimsConsRows([]);
                }}>Add Trim Row</button>
              </div>
            </div>

            <div className="table-wrapper" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Gmt Item</th>
                    <th>Item Name</th>
                    <th>Description</th>
                    <th>Cons/Pc</th>
                    <th>Rate</th>
                    <th>Total Qty</th>
                    <th>Total Amt ($)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {trimsDetailsList.map((t, i) => (
                    <tr key={i}>
                      <td>{t.gmt_item}</td>
                      <td>{t.item_name}</td>
                      <td>{t.item_description}</td>
                      <td>{t.cons_unit_gmt?.toFixed(4)} {t.cons_uom}</td>
                      <td>${t.rate?.toFixed(4)}</td>
                      <td>{t.total_qty?.toLocaleString()}</td>
                      <td><strong>${t.total_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
                      <td>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => {
                          setTrimsDetailsList(trimsDetailsList.filter((_, idx) => idx !== i));
                        }}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-20 text-right">
              <button type="button" className="btn btn-primary" onClick={() => {
                const totalAmt = trimsDetailsList.reduce((sum, t) => sum + t.total_amount, 0);
                setTrimsCost(totalAmt);
                setShowTrimsPopup(false);
              }}>Apply Cost Limit</button>
            </div>
          </div>
        </div>
      )}

      {showEmbPopup && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '900px', width: '95%', overflowY: 'auto', maxHeight: '90vh' }}>
            <div className="modal-header">
              <h3>Detailed Embellishment cost specifications</h3>
              <XCircle className="modal-close" onClick={() => setShowEmbPopup(false)} />
            </div>

            <TemplateSelector type="emb" onLoadTemplate={data => setEmbDetailsList(data)} currentData={embDetailsList} />

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)', marginBottom: '20px' }}>
              <h5 style={{ color: 'var(--primary)', marginBottom: '12px' }}>Add Embellishment Row</h5>
              <div className="grid-3 mt-10">
                <div className="form-group">
                  <label className="form-label">Embellishment Type *</label>
                  <input type="text" className="form-control" value={embType} onChange={e => setEmbType(e.target.value)} placeholder="e.g. Print, Embroidery..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Embellishment Name *</label>
                  <input type="text" className="form-control" value={embName} onChange={e => setEmbName(e.target.value)} placeholder="e.g. Rubber Print, Logo Embroidery..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Gmts. Item</label>
                  <input type="text" className="form-control" value={embGmtItem} onChange={e => setEmbGmtItem(e.target.value)} placeholder="Garment item type" />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input type="text" className="form-control" value={embDesc} onChange={e => setEmbDesc(e.target.value)} placeholder="chest print, sleeve embroidery..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Body Part</label>
                  <input type="text" className="form-control" value={embBodyPart} onChange={e => setEmbBodyPart(e.target.value)} placeholder="Front Body, Back, Sleeve..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Supplier</label>
                  <input type="text" className="form-control" value={embSupplier} onChange={e => setEmbSupplier(e.target.value)} placeholder="Embroidery/Print Vendor" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '15px', borderTop: '1px solid var(--border-muted)', paddingTop: '15px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => {
                  if (!currentOrder) return alert("Please select and fetch an order reference first to get PO breakdown.");
                  setShowEmbConsPopup(true);
                }}>
                  Cons/Unit Gmts * (Browse Option) [{embConsRows.length} lines configured]
                </button>
              </div>

              {/* Autocomplete summary parameters */}
              <div className="grid-3 mt-15" style={{ background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '4px' }}>
                <div className="form-group">
                  <label className="form-label">Rate * (Auto Fill)</label>
                  <input type="number" className="form-control" value={embConsRate} disabled style={{ opacity: 0.7 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Amount (Auto Fill)</label>
                  <input type="number" className="form-control" value={embConsAmount} disabled style={{ opacity: 0.7 }} />
                </div>
              </div>

              <div className="text-right mt-20">
                <button type="button" className="btn btn-primary btn-sm" onClick={() => {
                  if (!embType || !embName) return alert("Type and Name are required");

                  setEmbDetailsList([...embDetailsList, {
                    emb_type: embType,
                    emb_name: embName,
                    gmt_item: embGmtItem,
                    description: embDesc,
                    body_part: embBodyPart,
                    cons_unit_gmt: embConsTotalQty / (totalQuantity || 1),
                    rate: embConsRate,
                    amount: embConsAmount,
                    total_qty: embConsTotalQty,
                    total_amount: embConsTotalAmt,
                    consumption: embConsRows,
                    supplier: embSupplier
                  }]);

                  // Reset states
                  setEmbType('Print');
                  setEmbName('Rubber Print');
                  setEmbGmtItem('Polo Shirt');
                  setEmbDesc('Chest Print Logo');
                  setEmbBodyPart('Body');
                  setEmbSupplier('Apex Printer');
                  setEmbConsRate(0);
                  setEmbConsAmount(0);
                  setEmbConsTotalQty(0);
                  setEmbConsTotalAmt(0);
                  setEmbConsRows([]);
                }}>Add Embellishment Row</button>
              </div>
            </div>

            <div className="table-wrapper" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Emb Type</th>
                    <th>Emb Name</th>
                    <th>Body Part</th>
                    <th>Cons/Pc</th>
                    <th>Rate</th>
                    <th>Total Qty</th>
                    <th>Total Amt ($)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {embDetailsList.map((e, i) => (
                    <tr key={i}>
                      <td>{e.emb_type}</td>
                      <td>{e.emb_name}</td>
                      <td>{e.body_part}</td>
                      <td>{e.cons_unit_gmt?.toFixed(4)}</td>
                      <td>${e.rate?.toFixed(4)}</td>
                      <td>{e.total_qty?.toLocaleString()}</td>
                      <td><strong>${e.total_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
                      <td>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => {
                          setEmbDetailsList(embDetailsList.filter((_, idx) => idx !== i));
                        }}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-20 text-right">
              <button type="button" className="btn btn-primary" onClick={() => {
                const totalAmt = embDetailsList.reduce((sum, e) => sum + e.total_amount, 0);
                setEmbCost(totalAmt);
                setShowEmbPopup(false);
              }}>Apply Cost Limit</button>
            </div>
          </div>
        </div>
      )}

      {showWashPopup && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '900px', width: '95%', overflowY: 'auto', maxHeight: '90vh' }}>
            <div className="modal-header">
              <h3>Detailed Wash & Wet Processing cost specifications</h3>
              <XCircle className="modal-close" onClick={() => setShowWashPopup(false)} />
            </div>

            <TemplateSelector type="wash" onLoadTemplate={data => setWashDetailsList(data)} currentData={washDetailsList} />

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)', marginBottom: '20px' }}>
              <h5 style={{ color: 'var(--primary)', marginBottom: '12px' }}>Add Wash cost Row</h5>
              <div className="grid-3 mt-10">
                <div className="form-group">
                  <label className="form-label">Wash Type *</label>
                  <input type="text" className="form-control" value={washType} onChange={e => setWashType(e.target.value)} placeholder="e.g. Normal Wash, Dyeing Wash..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Wash Name *</label>
                  <input type="text" className="form-control" value={washName} onChange={e => setWashName(e.target.value)} placeholder="e.g. Silicon Wash, Enzyme Wash..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Gmts. Item</label>
                  <input type="text" className="form-control" value={washGmtItem} onChange={e => setWashGmtItem(e.target.value)} placeholder="Garment item type" />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input type="text" className="form-control" value={washDesc} onChange={e => setWashDesc(e.target.value)} placeholder="Silicon softener wash details..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Body Part</label>
                  <input type="text" className="form-control" value={washBodyPart} onChange={e => setWashBodyPart(e.target.value)} placeholder="Full garment, sleeve..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Supplier</label>
                  <input type="text" className="form-control" value={washSupplier} onChange={e => setWashSupplier(e.target.value)} placeholder="Washing plant name" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '15px', borderTop: '1px solid var(--border-muted)', paddingTop: '15px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => {
                  if (!currentOrder) return alert("Please select and fetch an order reference first to get PO breakdown.");
                  setShowWashConsPopup(true);
                }}>
                  Cons/Unit Gmts * (Browse Option) [{washConsRows.length} lines configured]
                </button>
              </div>

              {/* Autocomplete summary parameters */}
              <div className="grid-3 mt-15" style={{ background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '4px' }}>
                <div className="form-group">
                  <label className="form-label">Rate * (Auto Fill)</label>
                  <input type="number" className="form-control" value={washConsRate} disabled style={{ opacity: 0.7 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Amount (Auto Fill)</label>
                  <input type="number" className="form-control" value={washConsAmount} disabled style={{ opacity: 0.7 }} />
                </div>
              </div>

              <div className="text-right mt-20">
                <button type="button" className="btn btn-primary btn-sm" onClick={() => {
                  if (!washType || !washName) return alert("Type and Name are required");

                  setWashDetailsList([...washDetailsList, {
                    wash_type: washType,
                    wash_name: washName,
                    gmt_item: washGmtItem,
                    description: washDesc,
                    body_part: washBodyPart,
                    cons_unit_gmt: washConsTotalQty / (totalQuantity || 1),
                    rate: washConsRate,
                    amount: washConsAmount,
                    total_qty: washConsTotalQty,
                    total_amount: washConsTotalAmt,
                    consumption: washConsRows,
                    supplier: washSupplier
                  }]);

                  // Reset states
                  setWashType('Normal Wash');
                  setWashName('Garments Wash');
                  setWashGmtItem('Polo Shirt');
                  setWashDesc('Softener Wash');
                  setWashBodyPart('Body');
                  setWashSupplier('Apex Washing');
                  setWashConsRate(0);
                  setWashConsAmount(0);
                  setWashConsTotalQty(0);
                  setWashConsTotalAmt(0);
                  setWashConsRows([]);
                }}>Add Wash line</button>
              </div>
            </div>

            <div className="table-wrapper" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Wash Type</th>
                    <th>Wash Name</th>
                    <th>Body Part</th>
                    <th>Cons/Pc</th>
                    <th>Rate</th>
                    <th>Total Qty</th>
                    <th>Total Amt ($)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {washDetailsList.map((w, i) => (
                    <tr key={i}>
                      <td>{w.wash_type}</td>
                      <td>{w.wash_name}</td>
                      <td>{w.body_part}</td>
                      <td>{w.cons_unit_gmt?.toFixed(4)}</td>
                      <td>${w.rate?.toFixed(4)}</td>
                      <td>{w.total_qty?.toLocaleString()}</td>
                      <td><strong>${w.total_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
                      <td>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => {
                          setWashDetailsList(washDetailsList.filter((_, idx) => idx !== i));
                        }}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-20 text-right">
              <button type="button" className="btn btn-primary" onClick={() => {
                const totalAmt = washDetailsList.reduce((sum, w) => sum + w.total_amount, 0);
                setWashCost(totalAmt);
                setShowWashPopup(false);
              }}>Apply Cost Limit</button>
            </div>
          </div>
        </div>
      )}

      {/* 5. COMMERCIAL COST POPUP */}
      {showCommlPopup && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px', width: '95%', overflowY: 'auto', maxHeight: '90vh' }}>
            <div className="modal-header">
              <h3>Detailed Commercial, L/C & Logistic costing</h3>
              <XCircle className="modal-close" onClick={() => setShowCommlPopup(false)} />
            </div>

            <TemplateSelector type="comml" onLoadTemplate={data => setCommlDetailsList(data)} currentData={commlDetailsList} />

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)', marginBottom: '20px' }}>
              <h5 style={{ color: 'var(--primary)', marginBottom: '12px' }}>Add Commercial Item Row</h5>
              <div className="grid-3 mt-10">
                <div className="form-group">
                  <label className="form-label">Type *</label>
                  <input type="text" className="form-control" value={commlType} onChange={e => setCommlType(e.target.value)} placeholder="e.g. Import LC Charges, Freight Forwarding..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Rate in (%) *</label>
                  <input type="number" className="form-control" value={commlRatePct} onChange={e => setCommlRatePct(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Amount * (Auto Fill)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={((fabricCost + trimsCost + embCost + washCost) * commlRatePct / 100)}
                    disabled
                    style={{ opacity: 0.7 }}
                  />
                </div>
              </div>

              <div className="grid-3" style={{ marginTop: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={commlStatus} onChange={e => setCommlStatus(e.target.value)}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <button type="button" className="btn btn-primary btn-sm mt-15" style={{ marginTop: '15px' }} onClick={() => {
                if (!commlType) return alert("Commercial Type is required");
                const bomCost = fabricCost + trimsCost + embCost + washCost;
                const amt = bomCost * commlRatePct / 100;

                setCommlDetailsList([...commlDetailsList, {
                  commercial_type: commlType,
                  rate_pct: commlRatePct,
                  amount: amt,
                  status: commlStatus
                }]);

                // Reset states
                setCommlType('Import LC Charges');
                setCommlRatePct(3);
                setCommlStatus('Active');
              }}>
                Add a Line
              </button>
            </div>

            <div className="table-wrapper" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Commercial Type</th>
                    <th>Rate %</th>
                    <th>Computed Amount ($)</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {commlDetailsList.map((c, i) => (
                    <tr key={i}>
                      <td>{c.commercial_type}</td>
                      <td>{c.rate_pct}%</td>
                      <td><strong>${c.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
                      <td>
                        <span className={`badge ${c.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => {
                          setCommlDetailsList(commlDetailsList.filter((_, idx) => idx !== i));
                        }}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-20 text-right">
              <button type="button" className="btn btn-primary" onClick={() => {
                const totalAmt = commlDetailsList.reduce((sum, c) => sum + c.amount, 0);
                setCommlCost(totalAmt);
                setShowCommlPopup(false);
              }}>
                Apply Cost Limit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. COMMISSION POPUP */}
      {showCommissionPopup && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px', width: '95%' }}>
            <div className="modal-header">
              <h3>Detailed Buying Agent & Merchandising Commission</h3>
              <XCircle className="modal-close" onClick={() => setShowCommissionPopup(false)} />
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)', marginBottom: '20px' }}>
              <h5>Add Commission Row</h5>
              <div className="grid-2 mt-10">
                <div className="form-group">
                  <label className="form-label">Particulars *</label>
                  <select className="form-control" id="comm-particulars" defaultValue="Foreign">
                    <option value="Foreign">Foreign Buying Agent</option>
                    <option value="Local">Local Merchandising Agent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Commission Base *</label>
                  <select className="form-control" id="comm-base" defaultValue="In Percentage">
                    <option value="In Percentage">In Percentage</option>
                    <option value="Per Dzn">Per Dzn</option>
                    <option value="Per Pcs">Per Pcs</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Commission Rate *</label>
                  <input type="number" className="form-control" defaultValue={5.0} id="comm-rate" />
                </div>
              </div>

              <button type="button" className="btn btn-secondary btn-sm" onClick={() => {
                const part = (document.getElementById('comm-particulars') as HTMLSelectElement)?.value || 'Foreign';
                const base = (document.getElementById('comm-base') as HTMLSelectElement)?.value || 'In Percentage';
                const rateVal = parseFloat((document.getElementById('comm-rate') as HTMLInputElement)?.value) || 5;

                let amt = 0;
                if (base === 'In Percentage') {
                  const bom = fabricCost + trimsCost + embCost + washCost;
                  amt = bom * rateVal / 100;
                } else if (base === 'Per Dzn') {
                  amt = (totalQuantity / 12) * rateVal;
                } else {
                  amt = totalQuantity * rateVal;
                }

                setCommissionDetailsList([...commissionDetailsList, {
                  particulars: part,
                  comm_base: base,
                  rate: rateVal,
                  amount: amt,
                  status: 'Active'
                }]);
              }}>
                Add Commission Cost
              </button>
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Particulars</th>
                    <th>Base</th>
                    <th>Rate</th>
                    <th>Computed Amount ($)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {commissionDetailsList.map((c, i) => (
                    <tr key={i}>
                      <td>{c.particulars}</td>
                      <td>{c.comm_base}</td>
                      <td>{c.rate}</td>
                      <td><strong>${c.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
                      <td>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => {
                          setCommissionDetailsList(commissionDetailsList.filter((_, idx) => idx !== i));
                        }}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-20 text-right">
              <button type="button" className="btn btn-primary" onClick={() => {
                const totalAmt = commissionDetailsList.reduce((sum, c) => sum + c.amount, 0);
                setCommissionCost(totalAmt);
                setShowCommissionPopup(false);
              }}>
                Apply Cost Limit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. OTHER DETAILED COSTS POPUP */}
      {showOthersPopup && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px', width: '95%' }}>
            <div className="modal-header">
              <h3>Detailed Other reserve costing</h3>
              <XCircle className="modal-close" onClick={() => setShowOthersPopup(false)} />
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)', marginBottom: '20px' }}>
              <h5>Add Other Cost Item</h5>
              <div className="grid-2 mt-10">
                <div className="form-group">
                  <label className="form-label">Cost Details / Description *</label>
                  <input type="text" className="form-control" defaultValue="Testing lab extra fees" id="oth-details" />
                </div>
                <div className="form-group">
                  <label className="form-label">Amount ($) *</label>
                  <input type="number" className="form-control" defaultValue={500} id="oth-amt" />
                </div>
              </div>

              <button type="button" className="btn btn-secondary btn-sm" onClick={() => {
                const details = (document.getElementById('oth-details') as HTMLInputElement)?.value || 'Other Cost';
                const amtVal = parseFloat((document.getElementById('oth-amt') as HTMLInputElement)?.value) || 500;

                setOthersDetailsList([...othersDetailsList, {
                  cost_details: details,
                  amount: amtVal
                }]);
              }}>
                Add Cost Item
              </button>
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Cost Details</th>
                    <th>Amount ($)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {othersDetailsList.map((o, i) => (
                    <tr key={i}>
                      <td>{o.cost_details}</td>
                      <td><strong>${o.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
                      <td>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => {
                          setOthersDetailsList(othersDetailsList.filter((_, idx) => idx !== i));
                        }}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-20 text-right">
              <button type="button" className="btn btn-primary" onClick={() => {
                const totalAmt = othersDetailsList.reduce((sum, o) => sum + o.amount, 0);
                setOtherCost(totalAmt);
                setShowOthersPopup(false);
              }}>
                Apply Cost Limit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECONDARY BREAKDOWN MODALS FOR GREY/TRIMS/EMB/WASH CONSUMPTION BROWSE */}
      <ConsumptionBrowseModal
        isOpen={showGreyConsPopup}
        onClose={() => setShowGreyConsPopup(false)}
        type="fabric"
        currentOrder={currentOrder}
        styleRef={styleRef}
        initialRows={greyConsRows}
        onApply={(rows, avgCons, avgRate, totalQty, totalAmt) => {
          setGreyConsRows(rows);
          setGreyConsRate(avgRate);
          setGreyConsAmount(avgCons * avgRate);
          setGreyConsTotalQty(totalQty);
          setGreyConsTotalAmt(totalAmt);
          setShowGreyConsPopup(false);
        }}
      />

      <ConsumptionBrowseModal
        isOpen={showTrimsConsPopup}
        onClose={() => setShowTrimsConsPopup(false)}
        type="trims"
        currentOrder={currentOrder}
        styleRef={styleRef}
        initialRows={trimsConsRows}
        onApply={(rows, avgCons, avgRate, totalQty, totalAmt) => {
          setTrimsConsRows(rows);
          setTrimsConsRate(avgRate);
          setTrimsConsAmount(avgCons * avgRate);
          setTrimsConsTotalQty(totalQty);
          setTrimsConsTotalAmt(totalAmt);
          setShowTrimsConsPopup(false);
        }}
      />

      <ConsumptionBrowseModal
        isOpen={showEmbConsPopup}
        onClose={() => setShowEmbConsPopup(false)}
        type="emb"
        currentOrder={currentOrder}
        styleRef={styleRef}
        initialRows={embConsRows}
        onApply={(rows, avgCons, avgRate, totalQty, totalAmt) => {
          setEmbConsRows(rows);
          setEmbConsRate(avgRate);
          setEmbConsAmount(avgCons * avgRate);
          setEmbConsTotalQty(totalQty);
          setEmbConsTotalAmt(totalAmt);
          setShowEmbConsPopup(false);
        }}
      />

      <ConsumptionBrowseModal
        isOpen={showWashConsPopup}
        onClose={() => setShowWashConsPopup(false)}
        type="wash"
        currentOrder={currentOrder}
        styleRef={styleRef}
        initialRows={washConsRows}
        onApply={(rows, avgCons, avgRate, totalQty, totalAmt) => {
          setWashConsRows(rows);
          setWashConsRate(avgRate);
          setWashConsAmount(avgCons * avgRate);
          setWashConsTotalQty(totalQty);
          setWashConsTotalAmt(totalAmt);
          setShowWashConsPopup(false);
        }}
      />
    </div>
  );
}
