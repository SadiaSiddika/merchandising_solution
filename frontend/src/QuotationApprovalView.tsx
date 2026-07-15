import React, { useState, useEffect } from 'react';
import { 
  XCircle, 
  Search, 
  Eye, 
  HelpCircle, 
  DollarSign 
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export function QuotationApprovalView({ buyers = [] }: { buyers?: any[] }) {
  const getBuyerName = (buyerId: any) => {
    if (!buyerId) return '';
    const found = buyers.find(b => b.id.toString() === buyerId.toString());
    return found ? found.name : '';
  };
  const [activeSubTab, setActiveSubTab] = useState<'inquiry' | 'quotation'>('inquiry');

  // Lists state
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);

  // Simulation roles
  const [inqSimRole, setInqSimRole] = useState('Merchandising Manager');
  const [quotSimRole, setQuotSimRole] = useState('Store Manager');

  // Search & Filter state
  const [inqSearch, setInqSearch] = useState('');
  const [inqStatusFilter, setInqStatusFilter] = useState('Pending Approval');

  const [quotSearch, setQuotSearch] = useState('');
  const [quotStatusFilter, setQuotStatusFilter] = useState('Unapproved');
  const [actionComments, setActionComments] = useState<{[key: string]: string}>({});

  const [filterBasis, setFilterBasis] = useState<'day' | 'month' | 'year' | 'all'>('all');
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('2026');

  const [quotFilterBasis, setQuotFilterBasis] = useState<'day' | 'month' | 'year' | 'all'>('all');
  const [quotCurrentCalendarDate, setQuotCurrentCalendarDate] = useState(new Date());
  const [quotSelectedCalendarDay, setQuotSelectedCalendarDay] = useState<string | null>(null);
  const [quotSelectedMonth, setQuotSelectedMonth] = useState<string>('');
  const [quotSelectedYear, setQuotSelectedYear] = useState<string>('2026');

  // View Modals state
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<any | null>(null);

  useEffect(() => {
    fetchInquiries();
    fetchQuotations();
  }, []);

  const fetchInquiries = async () => {
    try {
      const res = await fetch(`${API_BASE}/inquiries`);
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
      }
    } catch (e) {
      console.error("Error fetching inquiries:", e);
    }
  };

  const fetchQuotations = async () => {
    try {
      const res = await fetch(`${API_BASE}/quotations`);
      if (res.ok) {
        const data = await res.json();
        setQuotations(data);
      }
    } catch (e) {
      console.error("Error fetching quotations:", e);
    }
  };

  // Inquiry actions
  const handleInquiryStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${API_BASE}/inquiries/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        alert(`Inquiry status updated to ${status}.`);
        fetchInquiries();
      } else {
        alert("Failed to update inquiry status.");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating inquiry status.");
    }
  };

  const handleInquiryApprove = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/inquiries/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved_by: inqSimRole })
      });
      if (res.ok) {
        alert(`Inquiry approved successfully by ${inqSimRole}.`);
        fetchInquiries();
      } else {
        alert("Failed to approve inquiry.");
      }
    } catch (e) {
      console.error(e);
      alert("Error approving inquiry.");
    }
  };

  // Price Quotation actions
  const handleQuotationStatus = async (id: string, status: string, comment: string) => {
    try {
      const res = await fetch(`${API_BASE}/quotations/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved_by: quotSimRole, status, comments: comment })
      });
      if (res.ok) {
        alert(`Quotation ${id} has been marked as ${status}.`);
        setActionComments(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        fetchQuotations();
      } else {
        alert("Failed to update quotation status.");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating quotation status.");
    }
  };

  // Modal loaders
  const loadInquiryDetails = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/inquiries/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedInquiry(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadQuotationDetails = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/quotations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedQuotation(data);
      }
    } catch (e) {
      console.error(e);
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

    const getInquiryCount = (d: number) => {
      const key = formatDateKey(d);
      return inquiries.filter(inq => inq.inquiry_date === key).length;
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
            const count = item.isCurrentMonth ? getInquiryCount(item.day) : 0;
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

  // Inquiry filtering
  const getFilteredInquiries = () => {
    return inquiries.filter(inq => {
      // 1. Basis Filter
      if (filterBasis === 'day') {
        if (!selectedCalendarDay) return false;
        if (inq.inquiry_date !== selectedCalendarDay) return false;
      } else if (filterBasis === 'month') {
        if (!selectedMonth) return false;
        if (!inq.inquiry_date || !inq.inquiry_date.startsWith(selectedMonth)) return false;
      } else if (filterBasis === 'year') {
        if (!selectedYear) return false;
        if (inq.year && inq.year.toString() === selectedYear) {
          // OK
        } else if (inq.inquiry_date) {
          const yr = inq.inquiry_date.split('-')[0];
          if (yr !== selectedYear) return false;
        } else {
          return false;
        }
      }

      // 2. Search & Status Filter
      const matchesSearch = 
        inq.id.toString().includes(inqSearch) ||
        (inq.style_no || '').toLowerCase().includes(inqSearch.toLowerCase()) ||
        (inq.buyer_name || inq.buyer || '').toLowerCase().includes(inqSearch.toLowerCase()) ||
        (inq.team_leader || '').toLowerCase().includes(inqSearch.toLowerCase());

      if (inqStatusFilter === 'All') return matchesSearch;
      return matchesSearch && inq.status === inqStatusFilter;
    });
  };

  const renderQuotCalendar = () => {
    const year = quotCurrentCalendarDate.getFullYear();
    const month = quotCurrentCalendarDate.getMonth();

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

    const getQuotationCount = (d: number) => {
      const key = formatDateKey(d);
      return quotations.filter(q => q.quotation_date === key).length;
    };

    const handlePrevMonth = () => {
      setQuotCurrentCalendarDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
      setQuotCurrentCalendarDate(new Date(year, month + 1, 1));
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
            const count = item.isCurrentMonth ? getQuotationCount(item.day) : 0;
            const isSelected = quotSelectedCalendarDay === dateKey;

            return (
              <div
                key={index}
                onClick={() => {
                  if (item.isCurrentMonth && dateKey) {
                    setQuotSelectedCalendarDay(quotSelectedCalendarDay === dateKey ? null : dateKey);
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

  // Quotation filtering
  const getFilteredQuotations = () => {
    return quotations.filter(q => {
      // 1. Basis Filter
      if (quotFilterBasis === 'day') {
        if (!quotSelectedCalendarDay) return false;
        if (q.quotation_date !== quotSelectedCalendarDay) return false;
      } else if (quotFilterBasis === 'month') {
        if (!quotSelectedMonth) return false;
        if (!q.quotation_date || !q.quotation_date.startsWith(quotSelectedMonth)) return false;
      } else if (quotFilterBasis === 'year') {
        if (!quotSelectedYear) return false;
        if (q.quotation_date) {
          const yr = q.quotation_date.split('-')[0];
          if (yr !== quotSelectedYear) return false;
        } else {
          return false;
        }
      }

      // 2. Search & Status Filter
      const matchesSearch = 
        q.id.toString().includes(quotSearch) ||
        (q.style_no || '').toLowerCase().includes(quotSearch.toLowerCase()) ||
        (q.buyer_name || q.buyer || '').toLowerCase().includes(quotSearch.toLowerCase()) ||
        (q.team_leader || '').toLowerCase().includes(quotSearch.toLowerCase());

      if (quotStatusFilter === 'Unapproved') {
        return matchesSearch && q.status !== 'Approved';
      }
      if (quotStatusFilter === 'Approved') {
        return matchesSearch && q.status === 'Approved';
      }
      if (quotStatusFilter === 'All') {
        return matchesSearch;
      }
      return matchesSearch && q.status === quotStatusFilter;
    });
  };

  return (
    <div className="quotation-approval-view" style={{ animation: 'fadeIn 0.25s ease-out' }}>
      
      {/* Sub-Tabs Switcher */}
      <div className="tab-container" style={{ marginBottom: '20px' }}>
        <div className={`tab ${activeSubTab === 'inquiry' ? 'active' : ''}`} onClick={() => setActiveSubTab('inquiry')}>
          <HelpCircle size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Buyer Inquiry Approvals
        </div>
        <div className={`tab ${activeSubTab === 'quotation' ? 'active' : ''}`} onClick={() => setActiveSubTab('quotation')}>
          <DollarSign size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Price Quotation Approvals
        </div>
      </div>

      {/* ==============================================
          1. BUYER INQUIRY APPROVALS SUB-TAB
          ============================================== */}
      {activeSubTab === 'inquiry' && (
        <div className="dashboard-card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <h2 className="card-title">Buyer Inquiry Approvals</h2>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <label style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filter Mode:</label>
                <select
                  className="form-control"
                  style={{ width: 'auto', height: '36px', padding: '6px 12px', fontSize: '13px' }}
                  value={filterBasis}
                  onChange={(e) => {
                    setFilterBasis(e.target.value as any);
                    setSelectedCalendarDay(null);
                    setSelectedMonth('');
                    setSelectedYear('2026');
                  }}
                >
                  <option value="all">Show All Inquiries</option>
                  <option value="day">By Specific Day (Calendar)</option>
                  <option value="month">By Specific Month</option>
                  <option value="year">By Specific Year</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <label style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Simulate Role:</label>
                <select className="form-control" style={{ width: 'auto', height: '36px' }} value={inqSimRole} onChange={(e) => setInqSimRole(e.target.value)}>
                  <option value="Merchandiser">Merchandiser</option>
                  <option value="Merchandising Manager">Merchandising Manager</option>
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
                value={inqSearch}
                onChange={e => setInqSearch(e.target.value)}
                style={{ paddingLeft: '36px', height: '36px' }}
              />
            </div>
            <select 
              className="form-control" 
              value={inqStatusFilter}
              onChange={e => setInqStatusFilter(e.target.value)}
              style={{ width: '220px', height: '36px' }}
            >
              <option value="Pending Approval">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="Draft">Draft</option>
              <option value="All">All Inquiries</option>
            </select>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
              Found {getFilteredInquiries().length} Inquiries
            </div>
          </div>

          {/* Filter inputs displayed on top when filterBasis is not 'all' */}
          {filterBasis !== 'all' && (
            <div style={{ padding: '0 20px', marginBottom: '20px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
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

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Inquiry ID</th>
                  <th>Buyer</th>
                  <th>Style No</th>
                  <th>Garments Item</th>
                  <th>Season</th>
                  <th>Offer Qty</th>
                  <th>Merchant</th>
                  <th>Leader</th>
                  <th>Date Logged</th>
                  <th>Status</th>
                  <th>Approved By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredInquiries().length === 0 ? (
                  <tr>
                    <td colSpan={12} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                      No matching buyer inquiries found.
                    </td>
                  </tr>
                ) : (
                  getFilteredInquiries().map((inq, idx) => (
                    <tr key={idx}>
                      <td><strong>{inq.id}</strong></td>
                      <td>{getBuyerName(inq.buyer_id) || inq.buyer_name || inq.buyer || 'N/A'}</td>
                      <td>{inq.style_no}</td>
                      <td>{inq.garments_item || 'N/A'}</td>
                      <td>{inq.season || 'N/A'}</td>
                      <td>{(inq.offer_qty || 0).toLocaleString()} {inq.uom}</td>
                      <td>{inq.dealing_merchant || 'N/A'}</td>
                      <td>{inq.team_leader || 'N/A'}</td>
                      <td>{inq.inquiry_date || 'N/A'}</td>
                      <td>
                        <span className={`badge badge-${inq.status.toLowerCase().replace(' ', '-')}`}>
                          {inq.status}
                        </span>
                      </td>
                      <td>{inq.approved_by || 'Not reviewed'}</td>
                      <td>
                        <div className="d-flex gap-10">
                          <button className="btn btn-secondary btn-sm" onClick={() => loadInquiryDetails(inq.id)}>
                            <Eye size={12} /> View
                          </button>

                          {inqSimRole === 'Merchandising Manager' && inq.status === 'Pending Approval' && (
                            <>
                              <button className="btn btn-success btn-sm" onClick={() => handleInquiryApprove(inq.id)}>
                                Approve
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleInquiryStatus(inq.id, 'Draft')}>
                                Reject
                              </button>
                            </>
                          )}
                          {inqSimRole === 'Merchandiser' && inq.status === 'Draft' && (
                            <button className="btn btn-primary btn-sm" onClick={() => handleInquiryStatus(inq.id, 'Pending Approval')}>
                              Submit to Manager
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==============================================
          2. PRICE QUOTATION APPROVALS SUB-TAB
          ============================================== */}
      {activeSubTab === 'quotation' && (
        <div className="dashboard-card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <h2 className="card-title">Price Quotation Approvals</h2>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <label style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filter Mode:</label>
                <select
                  className="form-control"
                  style={{ width: 'auto', height: '36px', padding: '6px 12px', fontSize: '13px' }}
                  value={quotFilterBasis}
                  onChange={(e) => {
                    setQuotFilterBasis(e.target.value as any);
                    setQuotSelectedCalendarDay(null);
                    setQuotSelectedMonth('');
                    setQuotSelectedYear('2026');
                  }}
                >
                  <option value="all">Show All Quotations</option>
                  <option value="day">By Specific Day (Calendar)</option>
                  <option value="month">By Specific Month</option>
                  <option value="year">By Specific Year</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <label style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Simulate Role:</label>
                <select className="form-control" style={{ width: 'auto', height: '36px' }} value={quotSimRole} onChange={(e) => setQuotSimRole(e.target.value)}>
                  <option value="Merchandiser">Merchandiser</option>
                  <option value="Store Manager">Store Manager</option>
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
                placeholder="Search Quotation ID, Style No, Buyer, or Team Leader..." 
                value={quotSearch}
                onChange={e => setQuotSearch(e.target.value)}
                style={{ paddingLeft: '36px', height: '36px' }}
              />
            </div>
            <select 
              className="form-control" 
              value={quotStatusFilter}
              onChange={e => setQuotStatusFilter(e.target.value)}
              style={{ width: '220px', height: '36px' }}
            >
              <option value="Unapproved">Unapproved List</option>
              <option value="Approved">Approved List</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
              <option value="Revised">Revised</option>
              <option value="Resubmitted">Resubmitted</option>
              <option value="All">All Statuses</option>
            </select>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
              Found {getFilteredQuotations().length} Quotations
            </div>
          </div>

          {/* Filter inputs displayed on top when quotFilterBasis is not 'all' */}
          {quotFilterBasis !== 'all' && (
            <div style={{ padding: '0 20px', marginBottom: '20px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {quotFilterBasis === 'day' && (
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Click Date to Filter:</div>
                  {renderQuotCalendar()}
                  {quotSelectedCalendarDay ? (
                    <div style={{ marginTop: '10px', background: 'var(--primary-glow)', border: '1px solid var(--primary)', borderRadius: '6px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-primary)' }}>
                      <span>Filtered: <strong>{formatDateString(quotSelectedCalendarDay)}</strong></span>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '2px 6px', fontSize: '10px', minWidth: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border-muted)', color: 'var(--text-primary)', cursor: 'pointer' }}
                        onClick={() => setQuotSelectedCalendarDay(null)}
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

              {quotFilterBasis === 'month' && (
                <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-muted)', borderRadius: '8px', padding: '15px', boxShadow: 'var(--shadow-lg)' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Select Month</label>
                  <input
                    type="month"
                    className="form-control"
                    value={quotSelectedMonth}
                    onChange={(e) => setQuotSelectedMonth(e.target.value)}
                  />
                  {!quotSelectedMonth && (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>Choose a month to start filtering.</span>
                  )}
                </div>
              )}

              {quotFilterBasis === 'year' && (
                <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-muted)', borderRadius: '8px', padding: '15px', boxShadow: 'var(--shadow-lg)' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Select Year</label>
                  <select
                    className="form-control"
                    value={quotSelectedYear}
                    onChange={(e) => setQuotSelectedYear(e.target.value)}
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
                  <th>Quotation ID</th>
                  <th>Inquiry ID</th>
                  <th>Style No</th>
                  <th>Buyer</th>
                  <th>Team Leader</th>
                  <th>Offer Qty</th>
                  <th>Total Cost</th>
                  <th>Status</th>
                  <th>Approved By</th>
                  <th style={{ width: '35%' }}>Actions & Comment Log</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredQuotations().length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                      No matching price quotations found.
                    </td>
                  </tr>
                ) : (
                  getFilteredQuotations().map((q, idx) => (
                    <tr key={idx}>
                      <td><strong>{q.id}</strong></td>
                      <td>{q.inquiry_id || '-'}</td>
                      <td>{q.style_no}</td>
                      <td>{getBuyerName(q.buyer_id) || q.buyer_name || q.buyer || '-'}</td>
                      <td>{q.team_leader || 'Unassigned'}</td>
                      <td>{(q.offer_qty || 0).toLocaleString()} {q.uom}</td>
                      <td style={{ fontWeight: 600 }}>${q.total_cost || '0.00'}</td>
                      <td>
                        <span className={`status-badge status-${(q.status || 'Draft').toLowerCase().replace(' ', '-')}`}>
                          {q.status}
                        </span>
                        {q.comments && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '200px', fontStyle: 'italic' }}>
                            Comment: "{q.comments}"
                          </div>
                        )}
                      </td>
                      <td>{q.approved_by || 'Not reviewed'}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => loadQuotationDetails(q.id)}>
                              <Eye size={12} /> View
                            </button>

                            {/* Store Manager approval controls */}
                            {quotSimRole === 'Store Manager' && q.status !== 'Approved' && (
                              <>
                                <button className="btn btn-success btn-sm" onClick={() => handleQuotationStatus(q.id, 'Approved', actionComments[q.id] || '')}>Approve</button>
                                <button className="btn btn-warning btn-sm" onClick={() => handleQuotationStatus(q.id, 'Revised', actionComments[q.id] || '')}>Revise</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleQuotationStatus(q.id, 'Rejected', actionComments[q.id] || '')}>Reject</button>
                              </>
                            )}

                            {/* Merchandiser resubmit logic */}
                            {quotSimRole === 'Merchandiser' && (q.status === 'Rejected' || q.status === 'Revised') && (
                              <button className="btn btn-primary btn-sm" onClick={() => handleQuotationStatus(q.id, 'Resubmitted', 'Resubmitted for review')}>Resubmit</button>
                            )}
                          </div>

                          {/* Comment box for reviewer */}
                          {quotSimRole === 'Store Manager' && q.status !== 'Approved' && (
                            <input 
                              type="text" 
                              className="form-control" 
                              style={{ height: '30px', fontSize: '12px' }}
                              placeholder="Add reason for approval, revision or rejection..." 
                              value={actionComments[q.id] || ''}
                              onChange={e => {
                                const val = e.target.value;
                                setActionComments(prev => ({ ...prev, [q.id]: val }));
                              }}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==============================================
          3. BUYER INQUIRY DETAILS VIEW MODAL
          ============================================== */}
      {selectedInquiry && (
        <div className="modal-overlay" onClick={() => setSelectedInquiry(null)}>
          <div className="modal-content" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Buyer Inquiry Detail View (ID: {selectedInquiry.id})</h3>
              <XCircle className="modal-close" onClick={() => setSelectedInquiry(null)} />
            </div>

            <div style={{ padding: '20px' }}>
              <div className="grid-3 mb-20" style={{ borderBottom: '1px solid var(--border-muted)', paddingBottom: '20px' }}>
                <div><strong>Buyer Name:</strong> <div>{selectedInquiry.buyer_name || selectedInquiry.buyer || 'N/A'}</div></div>
                <div><strong>Style No:</strong> <div>{selectedInquiry.style_no}</div></div>
                <div><strong>Style Description:</strong> <div>{selectedInquiry.style_desc || 'N/A'}</div></div>
                <div><strong>Garments Item:</strong> <div>{selectedInquiry.garments_item || 'N/A'}</div></div>
                <div><strong>Item Group:</strong> <div>{selectedInquiry.item_group || 'N/A'}</div></div>
                <div><strong>Brand:</strong> <div>{selectedInquiry.brand || 'N/A'}</div></div>
                <div><strong>Season:</strong> <div>{selectedInquiry.season || 'N/A'}</div></div>
                <div><strong>Offer Quantity:</strong> <div>{(selectedInquiry.offer_qty || 0).toLocaleString()} {selectedInquiry.uom}</div></div>
                <div><strong>Costing Per:</strong> <div>{selectedInquiry.costing_per || 'N/A'}</div></div>
                <div><strong>Department:</strong> <div>{selectedInquiry.department || 'N/A'}</div></div>
                <div><strong>Sample Request:</strong> <div>{selectedInquiry.sample_req || 'No'}</div></div>
                <div><strong>Status:</strong> <div><span className={`badge badge-${selectedInquiry.status.toLowerCase().replace(' ', '-')}`}>{selectedInquiry.status}</span></div></div>
                <div><strong>Dealing Merchant:</strong> <div>{selectedInquiry.dealing_merchant || 'N/A'}</div></div>
                <div><strong>Team Leader:</strong> <div>{selectedInquiry.team_leader || 'N/A'}</div></div>
                <div><strong>Logged By:</strong> <div>{selectedInquiry.quoted_by || 'N/A'}</div></div>
              </div>

              {/* Inquiry Fabrics */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '10px', color: 'var(--primary)' }}>Fabric Requirements</h4>
                <table className="data-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Fabric Type</th>
                      <th>Composition</th>
                      <th>GSM</th>
                      <th>Dia</th>
                      <th>Dia Type</th>
                      <th>Rate ($)</th>
                      <th>Required Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!selectedInquiry.fabrics || selectedInquiry.fabrics.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No fabric requirements logged.</td>
                      </tr>
                    ) : (
                      selectedInquiry.fabrics.map((f: any, i: number) => (
                        <tr key={i}>
                          <td>{f.fabric_type}</td>
                          <td>{f.composition}</td>
                          <td>{f.gsm}</td>
                          <td>{f.dia}</td>
                          <td>{f.dia_type}</td>
                          <td>${f.rate} / {f.uom || 'Kg'}</td>
                          <td>{f.required_qty}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Inquiry Yarns */}
              <div style={{ marginBottom: '10px' }}>
                <h4 style={{ marginBottom: '10px', color: 'var(--primary)' }}>Yarn Details</h4>
                <table className="data-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Composition</th>
                      <th>Count</th>
                      <th>Type</th>
                      <th>Certification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!selectedInquiry.yarns || selectedInquiry.yarns.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No yarn details logged.</td>
                      </tr>
                    ) : (
                      selectedInquiry.yarns.map((y: any, i: number) => (
                        <tr key={i}>
                          <td>{y.yarn_composition}</td>
                          <td>{y.yarn_count}</td>
                          <td>{y.yarn_type}</td>
                          <td>{y.certification || 'None'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-muted)', paddingTop: '15px', paddingBottom: '15px' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedInquiry(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================
          4. PRICE QUOTATION DETAILS VIEW MODAL
          ============================================== */}
      {selectedQuotation && (
        <div className="modal-overlay" onClick={() => setSelectedQuotation(null)}>
          <div className="modal-content" style={{ maxWidth: '900px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Price Quotation Cost Sheet Detail View (ID: {selectedQuotation.id})</h3>
              <XCircle className="modal-close" onClick={() => setSelectedQuotation(null)} />
            </div>

            <div style={{ padding: '20px' }}>
              {/* Primary Info */}
              <div className="grid-4 mb-20" style={{ borderBottom: '1px solid var(--border-muted)', paddingBottom: '20px' }}>
                <div><strong>Style No:</strong> <div>{selectedQuotation.style_no}</div></div>
                <div><strong>Buyer:</strong> <div>{selectedQuotation.buyer_name || selectedQuotation.buyer || 'N/A'}</div></div>
                <div><strong>Inquiry Reference:</strong> <div>{selectedQuotation.inquiry_id || 'Direct Costing'}</div></div>
                <div><strong>Season:</strong> <div>{selectedQuotation.season || 'N/A'}</div></div>
                <div><strong>Offer Qty:</strong> <div>{(selectedQuotation.offer_qty || 0).toLocaleString()} {selectedQuotation.uom}</div></div>
                <div><strong>Costing Per:</strong> <div>{selectedQuotation.costing_per}</div></div>
                <div><strong>Incoterm:</strong> <div>{selectedQuotation.incoterm} ({selectedQuotation.incoterm_place || 'N/A'})</div></div>
                <div><strong>Status:</strong> <div><span className={`status-badge status-${(selectedQuotation.status || 'Draft').toLowerCase().replace(' ', '-')}`}>{selectedQuotation.status}</span></div></div>
              </div>

              {/* Cost Summary Matrix */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', border: '1px solid var(--border-muted)', borderRadius: '6px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Fabric Cost</span>
                  <h3 style={{ margin: '4px 0 0 0', color: 'var(--primary)' }}>${selectedQuotation.fabric_cost || 0}</h3>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', border: '1px solid var(--border-muted)', borderRadius: '6px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Trims Cost</span>
                  <h3 style={{ margin: '4px 0 0 0', color: 'var(--primary)' }}>${selectedQuotation.trims_cost || 0}</h3>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', border: '1px solid var(--border-muted)', borderRadius: '6px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>CM Cost</span>
                  <h3 style={{ margin: '4px 0 0 0', color: 'var(--primary)' }}>${selectedQuotation.cm_cost || 0}</h3>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', border: '1px solid var(--border-muted)', borderRadius: '6px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Other Overhead</span>
                  <h3 style={{ margin: '4px 0 0 0', color: 'var(--primary)' }}>
                    ${(Number(selectedQuotation.emb_cost || 0) + Number(selectedQuotation.wash_cost || 0) + Number(selectedQuotation.comml_cost || 0) + Number(selectedQuotation.other_cost || 0) + Number(selectedQuotation.freight_cost || 0)).toFixed(2)}
                  </h3>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', border: '1px solid var(--primary-glow)', borderRadius: '6px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--primary)' }}>Total Cost</span>
                  <h3 style={{ margin: '4px 0 0 0', color: '#fff' }}>${selectedQuotation.total_cost || 0}</h3>
                </div>
                <div style={{ background: 'rgba(16,185,129,0.05)', padding: '12px', border: '1px solid var(--secondary-glow)', borderRadius: '6px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--secondary)' }}>Revised/Confirm Price</span>
                  <h3 style={{ margin: '4px 0 0 0', color: 'var(--secondary)' }}>
                    ${selectedQuotation.confirm_price || selectedQuotation.revised_price || selectedQuotation.total_cost || 0}
                  </h3>
                </div>
              </div>

              {/* Sub components breakdown */}
              <div className="grid-2" style={{ gap: '20px' }}>
                {/* Fabrics Breakdown */}
                <div>
                  <h4 style={{ marginBottom: '8px', color: 'var(--primary)' }}>Fabric Breakdown</h4>
                  <table className="data-table" style={{ width: '100%', fontSize: '12px' }}>
                    <thead>
                      <tr>
                        <th>Gmt Item</th>
                        <th>Fabric Type</th>
                        <th>Composition</th>
                        <th>Cons.</th>
                        <th>Rate ($)</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!selectedQuotation.fabrics || selectedQuotation.fabrics.length === 0 ? (
                        <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No fabrics logged.</td></tr>
                      ) : (
                        selectedQuotation.fabrics.map((f: any, idx: number) => (
                          <tr key={idx}>
                            <td>{f.gmt_item || 'N/A'}</td>
                            <td>{f.fabric_type || 'N/A'}</td>
                            <td>{f.fabric_composition || 'N/A'}</td>
                            <td>{f.cons_unit} {f.cons_uom}</td>
                            <td>${f.rate}</td>
                            <td><strong>${f.amount}</strong></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Trims Breakdown */}
                <div>
                  <h4 style={{ marginBottom: '8px', color: 'var(--primary)' }}>Trims & Accessories</h4>
                  <table className="data-table" style={{ width: '100%', fontSize: '12px' }}>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>UOM</th>
                        <th>Cons.</th>
                        <th>Rate ($)</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!selectedQuotation.trims || selectedQuotation.trims.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No trims logged.</td></tr>
                      ) : (
                        selectedQuotation.trims.map((t: any, idx: number) => (
                          <tr key={idx}>
                            <td>{t.item_name} <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>({t.supplier})</span></td>
                            <td>{t.cons_uom}</td>
                            <td>{t.cons_unit}</td>
                            <td>${t.rate}</td>
                            <td><strong>${t.amount}</strong></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-muted)', paddingTop: '15px', paddingBottom: '15px' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedQuotation(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
