import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Target,
  HelpCircle,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Layers,
  Settings,
  Plus,
  Save,
  XCircle,
  AlertCircle,
  Eye,
  BookOpen,
  ClipboardCheck,
  Lock,
  ArrowLeft,
  Download,
  FileText,
  Trash,
  Trash2,
  Edit,
  Shield
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import { BudgetView } from './BudgetView';
import { FabricBookingView } from './FabricBookingView';

const API_BASE = 'http://localhost:5000/api';

// ==========================================================================
// Main App Component
// ==========================================================================
export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'crm' | 'crm_mis' | 'inquiry' | 'costing' | 'order' | 'budget' | 'fabric' | 'trims' | 'ta_progress'>('dashboard');
  
  // Master lists
  const [buyers, setBuyers] = useState<any[]>([]);
  const [itemsMaster, setItemsMaster] = useState<any[]>([]);
  const [dbStatus, setDbStatus] = useState<string>('sqlite');

  useEffect(() => {
    fetch(`${API_BASE}/db-status`).then(r => r.json()).then(data => setDbStatus(data.dbType)).catch(() => {});
    fetchBuyers();
    fetchItemsMaster();
  }, []);

  const fetchBuyers = async () => {
    try {
      const res = await fetch(`${API_BASE}/buyers`);
      const data = await res.json();
      setBuyers(data);
    } catch (e) { console.error("Error fetching buyers", e); }
  };

  const fetchItemsMaster = async () => {
    try {
      const res = await fetch(`${API_BASE}/items`);
      const data = await res.json();
      setItemsMaster(data);
    } catch (e) { console.error("Error fetching items", e); }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <div className="sidebar-header">
          <div className="user-avatar" style={{ background: 'var(--primary-gradient)' }}>M</div>
          <span className="sidebar-logo">METAMORPHOSIS</span>
        </div>
        <ul className="sidebar-menu">
          <li className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard className="menu-item-icon" /> Dashboard
          </li>
          <li className={`menu-item ${activeTab === 'crm' ? 'active' : ''}`} onClick={() => setActiveTab('crm')}>
            <Target className="menu-item-icon" /> Sales Target (CRM)
          </li>
          <li className={`menu-item ${activeTab === 'crm_mis' ? 'active' : ''}`} onClick={() => setActiveTab('crm_mis')}>
            <TrendingUp className="menu-item-icon" /> CRM MIS Report
          </li>
          <li className={`menu-item ${activeTab === 'inquiry' ? 'active' : ''}`} onClick={() => setActiveTab('inquiry')}>
            <HelpCircle className="menu-item-icon" /> Quotation Inquiry
          </li>
          <li className={`menu-item ${activeTab === 'costing' ? 'active' : ''}`} onClick={() => setActiveTab('costing')}>
            <DollarSign className="menu-item-icon" /> Price Costing
          </li>
          <li className={`menu-item ${activeTab === 'order' ? 'active' : ''}`} onClick={() => setActiveTab('order')}>
            <ShoppingBag className="menu-item-icon" /> Order Entry
          </li>
          <li className={`menu-item ${activeTab === 'ta_progress' ? 'active' : ''}`} onClick={() => setActiveTab('ta_progress')}>
            <BookOpen className="menu-item-icon" /> T&A Progress
          </li>
          <li className={`menu-item ${activeTab === 'budget' ? 'active' : ''}`} onClick={() => setActiveTab('budget')}>
            <ClipboardCheck className="menu-item-icon" /> Cost Budget
          </li>
          <li className={`menu-item ${activeTab === 'fabric' ? 'active' : ''}`} onClick={() => setActiveTab('fabric')}>
            <Layers className="menu-item-icon" /> Fabric Booking
          </li>
          <li className={`menu-item ${activeTab === 'trims' ? 'active' : ''}`} onClick={() => setActiveTab('trims')}>
            <Settings className="menu-item-icon" /> Trims Booking
          </li>
        </ul>
        <div style={{ padding: '16px', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-muted)' }}>
          DB: <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>{dbStatus.toUpperCase()}</span>
        </div>
      </nav>

      {/* Main Panel */}
      <main className="main-content">
        <header className="top-bar">
          <h1 className="page-title">
            {activeTab === 'dashboard' && 'Dashboard Overview'}
            {activeTab === 'crm' && 'CRM - Monthly Sales Target'}
            {activeTab === 'crm_mis' && 'CRM Sales Target vs Achievement (MIS Report)'}
            {activeTab === 'inquiry' && 'Buyer Inquiries'}
            {activeTab === 'costing' && 'Garments Costing Engine & Price Quotations'}
            {activeTab === 'order' && 'Order Entry & PO Breakdowns'}
            {activeTab === 'ta_progress' && 'Time & Action (T&A) Progress Report'}
            {activeTab === 'budget' && 'Financial Control & Production Budget'}
            {activeTab === 'fabric' && 'Fabric Booking Manager'}
            {activeTab === 'trims' && 'Trims & Accessories Booking'}
          </h1>
          <div className="user-profile">
            <div className="user-info">
              <span className="user-name">Supervisor</span>
              <span className="user-role">Merchandising Manager</span>
            </div>
            <div className="user-avatar" style={{ background: 'var(--secondary-gradient)' }}>S</div>
          </div>
        </header>

        <div className="content-body">
          {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
          {activeTab === 'crm' && <SalesTargetView buyers={buyers} />}
          {activeTab === 'crm_mis' && <SalesTargetMISView buyers={buyers} />}
          {activeTab === 'inquiry' && <QuotationModule buyers={buyers} />}
          {activeTab === 'costing' && <CostingView buyers={buyers} items={itemsMaster} />}
          {activeTab === 'order' && <OrderView buyers={buyers} />}
          {activeTab === 'ta_progress' && <TAProgressView />}
          {activeTab === 'budget' && <BudgetView buyers={buyers} />}
          {activeTab === 'fabric' && <FabricBookingView />}
          {activeTab === 'trims' && <TrimsBookingView />}
        </div>
      </main>
    </div>
  );
}

// ==========================================================================
// SUB-VIEW: Dashboard Overview
// ==========================================================================
function DashboardView({ setActiveTab: _setActiveTab }: { setActiveTab: any }) {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [budgetData, setBudgetData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalInquiries: 0,
    approvedQuotes: 0,
    activeOrders: 0,
    budgetUtilization: 0
  });

  useEffect(() => {
    fetchStats();
    fetchSalesData();
    fetchBudgetData();
  }, []);

  const fetchStats = async () => {
    try {
      const inqRes = await fetch(`${API_BASE}/inquiries`);
      const inq = await inqRes.json();
      const quoteRes = await fetch(`${API_BASE}/quotations`);
      const quotes = await quoteRes.json();
      const orderRes = await fetch(`${API_BASE}/orders`);
      const orders = await orderRes.json();
      const budgetRes = await fetch(`${API_BASE}/budgets`);
      const budgets = await budgetRes.json();

      let totalLimit = 0;
      let totalSpent = 0;
      budgets.forEach((b: any) => {
        totalLimit += parseFloat(b.total_budget_amount || 0);
        totalSpent += parseFloat(b.actual_spend || 0);
      });

      setStats({
        totalInquiries: inq.length,
        approvedQuotes: quotes.filter((q: any) => q.status === 'Approved').length,
        activeOrders: orders.length,
        budgetUtilization: totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0
      });
    } catch (e) { console.error("Error fetching stats", e); }
  };

  const fetchSalesData = async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics/sales-target-vs-achieved`);
      const data = await res.json();
      setSalesData(data);
    } catch (e) { console.error(e); }
  };

  const fetchBudgetData = async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics/budget-spend`);
      const data = await res.json();
      setBudgetData(data);
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-details">
            <h3>Total Inquiries</h3>
            <div className="metric-value">{stats.totalInquiries}</div>
            <div className="metric-sub">Pending buyer review</div>
          </div>
          <div className="metric-icon-wrapper primary"><HelpCircle /></div>
        </div>
        <div className="metric-card">
          <div className="metric-details">
            <h3>Approved Costings</h3>
            <div className="metric-value">{stats.approvedQuotes}</div>
            <div className="metric-sub">FOB prices validated</div>
          </div>
          <div className="metric-icon-wrapper secondary"><DollarSign /></div>
        </div>
        <div className="metric-card">
          <div className="metric-details">
            <h3>Confirmed Orders</h3>
            <div className="metric-value">{stats.activeOrders}</div>
            <div className="metric-sub">Live production jobs</div>
          </div>
          <div className="metric-icon-wrapper warning"><ShoppingBag /></div>
        </div>
        <div className="metric-card">
          <div className="metric-details">
            <h3>Budget Utilization</h3>
            <div className="metric-value">{stats.budgetUtilization.toFixed(1)}%</div>
            <div className="metric-sub">Total actual spent vs budget</div>
          </div>
          <div className="metric-icon-wrapper danger"><TrendingUp /></div>
        </div>
      </div>

      <div className="grid-2 mt-20">
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title"><Target size={18} /> Sales Target vs Confirmed Achievement ({new Date().getFullYear()})</h2>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            {salesData.length === 0 ? (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--text-muted)' }}>
                No approved targets / confirmed orders found to graph.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" />
                  <XAxis dataKey="month" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--border-muted)' }} />
                  <Legend />
                  <Bar dataKey="total_target_val" name="Target Value ($)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total_confirm_val" name="Confirmed Value ($)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title"><ClipboardCheck size={18} /> Production Budget vs Actual Spend by Style</h2>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            {budgetData.length === 0 ? (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--text-muted)' }}>
                No budget entries found to graph.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" />
                  <XAxis dataKey="style_no" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--border-muted)' }} />
                  <Legend />
                  <Bar dataKey="total_budget_amount" name="Budget Limit ($)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual_spend" name="Actual Spend ($)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// SUB-VIEW: CRM & Sales Target (Includes ALL spreadsheet fields)
// ==========================================================================
function SalesTargetView({ buyers }: { buyers: any[] }) {
  const [targets, setTargets] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    buyer_id: '',
    brand: '',
    buying_agent: '',
    buying_agent_merchant: '',
    team_leader: '',
    season: '',
    year: new Date().getFullYear(),
    month: 'January',
    target_basic_qty: 0,
    target_basic_val: 0,
    target_casual_qty: 0,
    target_casual_val: 0,
    target_fashion_qty: 0,
    target_fashion_val: 0,
    status: 'Draft'
  });

  useEffect(() => {
    fetchTargets();
  }, []);

  const fetchTargets = async () => {
    try {
      const res = await fetch(`${API_BASE}/sales-targets`);
      const data = await res.json();
      setTargets(data);
    } catch (e) { console.error(e); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.buyer_id || !form.team_leader || !form.season) {
      alert("Please fill up all required fields.");
      return;
    }

    // Popup confirmation check (Excel constraint)
    const proceed = window.confirm("You are creating sales Target & Month\nDo you want to proceed?");
    if (!proceed) return;

    // Totals calculate
    const totalQty = parseFloat(form.target_basic_qty as any || 0) + parseFloat(form.target_casual_qty as any || 0) + parseFloat(form.target_fashion_qty as any || 0);
    const totalVal = parseFloat(form.target_basic_val as any || 0) + parseFloat(form.target_casual_val as any || 0) + parseFloat(form.target_fashion_val as any || 0);

    const payload = {
      ...form,
      target_qty: totalQty,
      target_value: totalVal
    };

    try {
      const res = await fetch(`${API_BASE}/sales-targets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowModal(false);
        fetchTargets();
      }
    } catch (e) { console.error(e); }
  };

  const handleApprove = async (id: number) => {
    try {
      const target = targets.find(t => t.id === id);
      await fetch(`${API_BASE}/sales-targets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...target, status: 'Approved' })
      });
      fetchTargets();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h2 className="card-title"><Target /> Sales Target Tracking (CRM)</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New CRM Target
        </button>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Buyer</th>
              <th>Brand</th>
              <th>Season</th>
              <th>Year</th>
              <th>Month</th>
              <th>Leader</th>
              <th>Target basic Qty</th>
              <th>Target casual Qty</th>
              <th>Target fashion Qty</th>
              <th>Total Qty</th>
              <th>Total Value</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {targets.map((t, idx) => {
              const isLocked = t.status === 'Approved';
              return (
                <tr key={idx}>
                  <td><strong>{t.buyer_name}</strong></td>
                  <td>{t.brand}</td>
                  <td>{t.season}</td>
                  <td>{t.year}</td>
                  <td>{t.month}</td>
                  <td>{t.team_leader}</td>
                  <td>{parseFloat(t.target_basic_qty || 0).toLocaleString()}</td>
                  <td>{parseFloat(t.target_casual_qty || 0).toLocaleString()}</td>
                  <td>{parseFloat(t.target_fashion_qty || 0).toLocaleString()}</td>
                  <td><strong>{parseFloat(t.target_qty).toLocaleString()} pcs</strong></td>
                  <td><strong>${parseFloat(t.target_value).toLocaleString()}</strong></td>
                  <td>
                    <span className={`badge badge-${t.status.toLowerCase()}`}>
                      {t.status} {isLocked && <Lock size={12} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />}
                    </span>
                  </td>
                  <td>
                    {t.status === 'Draft' ? (
                      <button className="btn btn-success btn-sm" onClick={() => handleApprove(t.id)}>
                        Approve
                      </button>
                    ) : (
                      <span className="text-muted"><Lock size={14} /> Locked</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3>New Sales Target (CRM Module)</h3>
              <XCircle className="modal-close" onClick={() => setShowModal(false)} />
            </div>
            <form onSubmit={handleCreate}>
              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Buyer *</label>
                  <select className="form-control" value={form.buyer_id} onChange={e => setForm({ ...form, buyer_id: e.target.value })} required>
                    <option value="">Select Buyer</option>
                    {buyers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Brand Name</label>
                  <input type="text" className="form-control" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="Brand" />
                </div>
                <div className="form-group">
                  <label className="form-label">Buying Agent</label>
                  <input type="text" className="form-control" value={form.buying_agent} onChange={e => setForm({ ...form, buying_agent: e.target.value })} placeholder="Buying Agent" />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Buying Agent Merchant</label>
                  <input type="text" className="form-control" value={form.buying_agent_merchant} onChange={e => setForm({ ...form, buying_agent_merchant: e.target.value })} placeholder="Merchant" />
                </div>
                <div className="form-group">
                  <label className="form-label">Team Leader *</label>
                  <input type="text" className="form-control" value={form.team_leader} onChange={e => setForm({ ...form, team_leader: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Season *</label>
                  <input type="text" className="form-control" value={form.season} onChange={e => setForm({ ...form, season: e.target.value })} required placeholder="e.g. Summer 2026" />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Year *</label>
                  <select className="form-control" value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) })}>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Month *</label>
                  <select className="form-control" value={form.month} onChange={e => setForm({ ...form, month: e.target.value })}>
                    {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="Draft">Draft</option>
                    <option value="Approved">Approved</option>
                  </select>
                </div>
              </div>

              <h4 style={{ margin: '20px 0 10px 0', borderBottom: '1px solid var(--border-muted)', paddingBottom: '8px' }}>Month Wise Target Details</h4>
              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Basic Target Qty (Pcs)</label>
                  <input type="number" className="form-control" value={form.target_basic_qty} onChange={e => setForm({ ...form, target_basic_qty: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Casual Basic Target Qty</label>
                  <input type="number" className="form-control" value={form.target_casual_qty} onChange={e => setForm({ ...form, target_casual_qty: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Fashion Target Qty</label>
                  <input type="number" className="form-control" value={form.target_fashion_qty} onChange={e => setForm({ ...form, target_fashion_qty: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Basic Target Value ($)</label>
                  <input type="number" className="form-control" value={form.target_basic_val} onChange={e => setForm({ ...form, target_basic_val: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Casual Basic Target Value</label>
                  <input type="number" className="form-control" value={form.target_casual_val} onChange={e => setForm({ ...form, target_casual_val: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Fashion Target Value</label>
                  <input type="number" className="form-control" value={form.target_fashion_val} onChange={e => setForm({ ...form, target_fashion_val: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>

              <div className="mt-20 text-right">
                <button type="button" className="btn btn-secondary mr-10" style={{ marginRight: '10px' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Save size={16} /> Save Target</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================================================
// SUB-VIEW: CRM Sales Target vs Achievement MIS Report
// ==========================================================================
function SalesTargetMISView({ buyers: _buyers }: { buyers: any[] }) {
  const [reportRows, setReportRows] = useState<any[]>([]);
  const [yearFilter, setYearFilter] = useState('2026');
  const [brandFilter, setBrandFilter] = useState('');

  useEffect(() => {
    fetchReport();
  }, [yearFilter, brandFilter]);

  const fetchReport = async () => {
    try {
      let url = `${API_BASE}/reports/sales-target-mis`;
      const res = await fetch(url);
      const data = await res.json();
      
      // Apply filters in frontend for convenience
      let filtered = data;
      if (yearFilter) {
        filtered = filtered.filter((r: any) => String(r.year) === yearFilter);
      }
      if (brandFilter) {
        filtered = filtered.filter((r: any) => r.brand && r.brand.toLowerCase().includes(brandFilter.toLowerCase()));
      }
      setReportRows(filtered);
    } catch (e) { console.error("Error fetching MIS report", e); }
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h2 className="card-title"><TrendingUp /> Target vs Achievement (MIS Analysis)</h2>
        <div className="d-flex gap-10">
          <select className="form-control" style={{ width: '120px' }} value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
          <input
            type="text"
            className="form-control"
            style={{ width: '180px' }}
            placeholder="Search Brand..."
            value={brandFilter}
            onChange={e => setBrandFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Brand</th>
              <th>Buyer</th>
              <th>Season</th>
              <th>Month</th>
              <th>Year</th>
              <th>Basic (Tgt Qty / Ach Qty / Ach %)</th>
              <th>Casual Basic (Tgt Qty / Ach Qty / Ach %)</th>
              <th>Fashion (Tgt Qty / Ach Qty / Ach %)</th>
              <th>Total Qty Target</th>
              <th>Confirm Ach Qty</th>
              <th>Target Value</th>
              <th>Confirm Ach Value</th>
              <th>Ach Value %</th>
            </tr>
          </thead>
          <tbody>
            {reportRows.map((r, idx) => {
              const basicAchPct = r.target_basic_qty > 0 ? (r.confirm_qty / r.target_qty) * 100 : 0; // estimate
              const casualAchPct = r.target_casual_qty > 0 ? (r.confirm_qty / r.target_qty) * 100 : 0;
              const fashionAchPct = r.target_fashion_qty > 0 ? (r.confirm_qty / r.target_qty) * 100 : 0;
              const totalValPct = r.target_value > 0 ? (r.confirm_value / r.target_value) * 100 : 0;

              return (
                <tr key={idx}>
                  <td><strong>{r.brand || 'N/A'}</strong></td>
                  <td>{r.buyer_name}</td>
                  <td>{r.season}</td>
                  <td>{r.month}</td>
                  <td>{r.year}</td>
                  <td>
                    {r.target_basic_qty} / {r.confirm_qty} / {basicAchPct.toFixed(0)}%
                  </td>
                  <td>
                    {r.target_casual_qty} / {r.confirm_qty} / {casualAchPct.toFixed(0)}%
                  </td>
                  <td>
                    {r.target_fashion_qty} / {r.confirm_qty} / {fashionAchPct.toFixed(0)}%
                  </td>
                  <td><strong>{parseFloat(r.target_qty).toLocaleString()}</strong></td>
                  <td style={{ color: 'var(--secondary)' }}>{parseFloat(r.confirm_qty || 0).toLocaleString()}</td>
                  <td><strong>${parseFloat(r.target_value).toLocaleString()}</strong></td>
                  <td style={{ color: 'var(--secondary)', fontWeight: 600 }}>${parseFloat(r.confirm_value || 0).toLocaleString()}</td>
                  <td style={{ fontWeight: 600, color: totalValPct >= 100 ? 'var(--secondary)' : 'var(--warning)' }}>
                    {totalValPct.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================================================
// SUB-VIEW: Quotation Module (Wraps Buyer Inquiry & Price Quotation)
// ==========================================================================

// ==========================================================================
// SUB-VIEW: Price Quotation (Phase 3)
// ==========================================================================
function PriceQuotationView({ buyers }: { buyers: any[] }) {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [simRole, setSimRole] = useState('Merchandiser');
  const [activeTab, setActiveTab] = useState('required');
  const [itemsMaster, setItemsMaster] = useState<any[]>([]);

  const defaultForm = {
    inquiry_id: '', style_no: '', buyer: '', garments_category: '', brand: '', style_desc: '',
    item_group: '', department: '', season: '', offer_qty: '', uom: '', costing_per: '1 Pcs',
    incoterm: 'FOB', team_leader: '', dealing_merchant: '', est_ship_date: '', size_group: '',
    mc_line: 0, prod_line_hour: 0, sewing_efficiency: 0, cutting_efficiency: 0, finishing_efficiency: 0,
    qc_efficiency: 0, prep_efficiency: 0, yarn_cert: '', size_grading: 0, country: '', buying_agent: '',
    buying_merchant: '', currency: 'USD', color_range: '', sustainable_material: 'GOTS', garments_cert: '',
    emb_type: '', emb_name: '', confirm_date: '', quotation_date: '', order_place_date: '', emb_note: '',
    incoterm_place: '', exchange_rate: 0, pcs_carton: '', cbm_carton: '', remarks: '', image_url: '',
    fabric_cost: 0, trims_cost: 0, emb_cost: 0, wash_cost: 0, comml_cost: 0, lab_test: 0, inspection_cost: 0,
    cm_cost: 0, sample_cost: 0, freight_cost: 0, other_cost: 0, courier_cost: 0, certif_cost: 0, common_oh: 0,
    deffd_lc: 0, design_cost: 0, studio_cost: 0, opert_exp: 0, income_tax: 0, total_cost: 0,
    transport_cost: 0, asking_profit: 0, revised_price: 0, confirm_price: 0, commi_dzn: 0, target_price: 0
  };
  const [form, setForm] = useState(defaultForm);
  const [garments, setGarments] = useState<any[]>([]);

  // Quotation Approval States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Unapproved');
  const [actionComments, setActionComments] = useState<{[key: string]: string}>({});

  // Browse modal states for cost options
  const [browseModal, setBrowseModal] = useState<{ show: boolean, field: string, title: string }>({ show: false, field: '', title: '' });
  const [browseItemName, setBrowseItemName] = useState('');
  const [browseRate, setBrowseRate] = useState(0);
  const [browseQty, setBrowseQty] = useState(0);

  // Detailed Fabric cost states
  const [showFabricBrowsePopup, setShowFabricBrowsePopup] = useState(false);
  const [fabricCostRows, setFabricCostRows] = useState<any[]>([]);

  // Detailed Trims cost states
  const [showTrimsBrowsePopup, setShowTrimsBrowsePopup] = useState(false);
  const [trimsCostRows, setTrimsCostRows] = useState<any[]>([]);
  const [trimsForm, setTrimsForm] = useState({
    gmt_item: '',
    item_name: 'Metal Button',
    item_desc: 'Standard metal snaps',
    cons_uom: 'Pcs',
    cons_unit: 12,
    extra_pct: 5,
    total_cons: 12.6,
    rate: 0.12,
    amount: 1.512,
    supplier: 'YKK Zippers',
    status: 'Active'
  });

  const [trimsTemplateName, setTrimsTemplateName] = useState('');
  const [savedTrimsTemplates, setSavedTrimsTemplates] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('quotation_trims_templates');
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    return [
      {
        name: 'Standard Polo Trims Template',
        rows: [
          { gmt_item: 'Polo Shirt', item_name: 'Metal Button', item_desc: 'Front Placket Snaps', cons_uom: 'Pcs', cons_unit: 3, extra_pct: 5, total_cons: 3.15, rate: 0.15, amount: 0.47, supplier: 'YKK Zippers', status: 'Active' },
          { gmt_item: 'Polo Shirt', item_name: 'Main Woven Label', item_desc: 'Brand main neck label', cons_uom: 'Pcs', cons_unit: 1, extra_pct: 0, total_cons: 1, rate: 0.08, amount: 0.08, supplier: 'Avery Dennison', status: 'Active' }
        ]
      }
    ];
  });

  const handleSaveTrimsTemplate = () => {
    if (!trimsTemplateName.trim()) return alert("Enter a template name");
    const newTemplate = { name: trimsTemplateName, rows: trimsCostRows };
    const updated = [...savedTrimsTemplates.filter(t => t.name !== trimsTemplateName), newTemplate];
    setSavedTrimsTemplates(updated);
    localStorage.setItem('quotation_trims_templates', JSON.stringify(updated));
    setTrimsTemplateName('');
    alert(`Template "${trimsTemplateName}" saved successfully.`);
  };

  const handleLoadTrimsTemplate = (name: string) => {
    const t = savedTrimsTemplates.find(x => x.name === name);
    if (t) {
      setTrimsCostRows(t.rows || []);
    }
  };

  const handleTrimsItemNameChange = (val: string) => {
    let uom = 'Pcs';
    if (val.toLowerCase().includes('thread')) uom = 'Cone';
    else if (val.toLowerCase().includes('zipper')) uom = 'Pcs';
    else if (val.toLowerCase().includes('button')) uom = 'Dzn';
    else if (val.toLowerCase().includes('tape')) uom = 'Yds';
    
    setTrimsForm(prev => {
      const totCons = prev.cons_unit * (1 + prev.extra_pct / 100);
      return {
        ...prev,
        item_name: val,
        cons_uom: uom,
        total_cons: parseFloat(totCons.toFixed(3)),
        amount: parseFloat((totCons * prev.rate).toFixed(3))
      };
    });
  };

  const handleTrimsValueChange = (field: string, val: any) => {
    setTrimsForm(prev => {
      const updated = { ...prev, [field]: val };
      const totCons = updated.cons_unit * (1 + updated.extra_pct / 100);
      updated.total_cons = parseFloat(totCons.toFixed(3));
      updated.amount = parseFloat((totCons * updated.rate).toFixed(3));
      return updated;
    });
  };

  // Detailed Embellishment cost states
  const [showEmbBrowsePopup, setShowEmbBrowsePopup] = useState(false);
  const [embCostRows, setEmbCostRows] = useState<any[]>([]);
  const [embForm, setEmbForm] = useState({
    emb_type: 'Print',
    emb_name: 'Rubber Print',
    gmt_item: '',
    description: 'Chest Print design',
    body_part: 'Front',
    cons_unit: 1,
    process_loss_pct: 3,
    total_qty: 1.03,
    rate: 0.25,
    amount: 0.2575,
    supplier: 'Apex Print Ltd',
    status: 'Active'
  });

  const [embTemplateName, setEmbTemplateName] = useState('');
  const [savedEmbTemplates, setSavedEmbTemplates] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('quotation_emb_templates');
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    return [
      {
        name: 'Standard Polo Print Template',
        rows: [
          { emb_type: 'Print', emb_name: 'Rubber Print', gmt_item: 'Polo Shirt', description: 'Left Chest Logo', body_part: 'Front Left', cons_unit: 1, process_loss_pct: 5, total_qty: 1.05, rate: 0.18, amount: 0.19, supplier: 'Apex Print Ltd', status: 'Active' }
        ]
      }
    ];
  });

  const handleSaveEmbTemplate = () => {
    if (!embTemplateName.trim()) return alert("Enter a template name");
    const newTemplate = { name: embTemplateName, rows: embCostRows };
    const updated = [...savedEmbTemplates.filter(t => t.name !== embTemplateName), newTemplate];
    setSavedEmbTemplates(updated);
    localStorage.setItem('quotation_emb_templates', JSON.stringify(updated));
    setEmbTemplateName('');
    alert(`Template "${embTemplateName}" saved successfully.`);
  };

  const handleLoadEmbTemplate = (name: string) => {
    const t = savedEmbTemplates.find(x => x.name === name);
    if (t) {
      setEmbCostRows(t.rows || []);
    }
  };

  const handleEmbValueChange = (field: string, val: any) => {
    setEmbForm(prev => {
      const updated = { ...prev, [field]: val };
      const totQty = updated.cons_unit * (1 + updated.process_loss_pct / 100);
      updated.total_qty = parseFloat(totQty.toFixed(3));
      updated.amount = parseFloat((totQty * updated.rate).toFixed(3));
      return updated;
    });
  };

  // Detailed Wash cost states
  const [showWashBrowsePopup, setShowWashBrowsePopup] = useState(false);
  const [washCostRows, setWashCostRows] = useState<any[]>([]);
  const [washForm, setWashForm] = useState({
    wash_type: 'Enzyme',
    wash_name: 'Enzyme Wash',
    gmt_item: '',
    description: 'Enzyme wash for soft feel',
    body_part: 'Garment Piece',
    cons_unit: 1,
    process_loss_pct: 2,
    total_qty: 1.02,
    rate: 0.18,
    amount: 0.1836,
    supplier: 'Apex Washing Ltd',
    status: 'Active'
  });

  const [washTemplateName, setWashTemplateName] = useState('');
  const [savedWashTemplates, setSavedWashTemplates] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('quotation_wash_templates');
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    return [
      {
        name: 'Standard Polo Wash Template',
        rows: [
          { wash_type: 'Enzyme', wash_name: 'Enzyme Wash', gmt_item: 'Polo Shirt', description: 'Enzyme wash', body_part: 'Garment Piece', cons_unit: 1, process_loss_pct: 2, total_qty: 1.02, rate: 0.15, amount: 0.15, supplier: 'Apex Washing Ltd', status: 'Active' }
        ]
      }
    ];
  });

  const handleSaveWashTemplate = () => {
    if (!washTemplateName.trim()) return alert("Enter a template name");
    const newTemplate = { name: washTemplateName, rows: washCostRows };
    const updated = [...savedWashTemplates.filter(t => t.name !== washTemplateName), newTemplate];
    setSavedWashTemplates(updated);
    localStorage.setItem('quotation_wash_templates', JSON.stringify(updated));
    setWashTemplateName('');
    alert(`Template "${washTemplateName}" saved successfully.`);
  };

  const handleLoadWashTemplate = (name: string) => {
    const t = savedWashTemplates.find(x => x.name === name);
    if (t) {
      setWashCostRows(t.rows || []);
    }
  };

  const handleWashValueChange = (field: string, val: any) => {
    setWashForm(prev => {
      const updated = { ...prev, [field]: val };
      const totQty = updated.cons_unit * (1 + updated.process_loss_pct / 100);
      updated.total_qty = parseFloat(totQty.toFixed(3));
      updated.amount = parseFloat((totQty * updated.rate).toFixed(3));
      return updated;
    });
  };

  // Detailed Commercial cost states
  const [showCommlBrowsePopup, setShowCommlBrowsePopup] = useState(false);
  const [commlCostRows, setCommlCostRows] = useState<any[]>([]);

  // Calculation helper for direct cost
  const getDirectCost = () => {
    return (
      (form.fabric_cost || 0) +
      (form.trims_cost || 0) +
      (form.emb_cost || 0) +
      (form.wash_cost || 0) +
      (form.lab_test || 0) +
      (form.inspection_cost || 0) +
      (form.cm_cost || 0) +
      (form.sample_cost || 0) +
      (form.freight_cost || 0) +
      (form.other_cost || 0) +
      (form.courier_cost || 0) +
      (form.certif_cost || 0)
    );
  };

  const [commlForm, setCommlForm] = useState({
    comml_type: 'Export LC Charges',
    rate_pct: 1,
    amount: 0,
    status: 'Active'
  });

  // Automatically update comml amount when rate_pct or direct cost changes
  useEffect(() => {
    const direct = getDirectCost();
    const amt = direct * (commlForm.rate_pct / 100);
    setCommlForm(prev => ({ ...prev, amount: parseFloat(amt.toFixed(3)) }));
  }, [commlForm.rate_pct, form.fabric_cost, form.trims_cost, form.emb_cost, form.wash_cost, form.lab_test, form.inspection_cost, form.cm_cost, form.sample_cost, form.freight_cost, form.other_cost, form.courier_cost, form.certif_cost]);

  const [commlTemplateName, setCommlTemplateName] = useState('');
  const [savedCommlTemplates, setSavedCommlTemplates] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('quotation_comml_templates');
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    return [
      {
        name: 'Standard Export Commercial Template',
        rows: [
          { comml_type: 'Export LC Charges', rate_pct: 1, amount: 0.15, status: 'Active' }
        ]
      }
    ];
  });

  const handleSaveCommlTemplate = () => {
    if (!commlTemplateName.trim()) return alert("Enter a template name");
    const newTemplate = { name: commlTemplateName, rows: commlCostRows };
    const updated = [...savedCommlTemplates.filter(t => t.name !== commlTemplateName), newTemplate];
    setSavedCommlTemplates(updated);
    localStorage.setItem('quotation_comml_templates', JSON.stringify(updated));
    setCommlTemplateName('');
    alert(`Template "${commlTemplateName}" saved successfully.`);
  };

  const handleLoadCommlTemplate = (name: string) => {
    const t = savedCommlTemplates.find(x => x.name === name);
    if (t) {
      setCommlCostRows(t.rows || []);
    }
  };

  // Detailed Other cost states
  const [showOtherBrowsePopup, setShowOtherBrowsePopup] = useState(false);
  const [otherCostRows, setOtherCostRows] = useState<any[]>([]);
  const [otherForm, setOtherForm] = useState({
    cost_details: 'Custom Testing Charge',
    amount: 100
  });

  const [otherTemplateName, setOtherTemplateName] = useState('');
  const [savedOtherTemplates, setSavedOtherTemplates] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('quotation_other_templates');
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    return [
      {
        name: 'Standard Other Charges Template',
        rows: [
          { cost_details: 'Standard Courier Fee', amount: 50 }
        ]
      }
    ];
  });

  const handleSaveOtherTemplate = () => {
    if (!otherTemplateName.trim()) return alert("Enter a template name");
    const newTemplate = { name: otherTemplateName, rows: otherCostRows };
    const updated = [...savedOtherTemplates.filter(t => t.name !== otherTemplateName), newTemplate];
    setSavedOtherTemplates(updated);
    localStorage.setItem('quotation_other_templates', JSON.stringify(updated));
    setOtherTemplateName('');
    alert(`Template "${otherTemplateName}" saved successfully.`);
  };

  const handleLoadOtherTemplate = (name: string) => {
    const t = savedOtherTemplates.find(x => x.name === name);
    if (t) {
      setOtherCostRows(t.rows || []);
    }
  };

  // Detailed Transport cost states
  const [showTransportBrowsePopup, setShowTransportBrowsePopup] = useState(false);
  const [transportCostRows, setTransportCostRows] = useState<any[]>([]);
  const [transportForm, setTransportForm] = useState({
    rate: 15.5,
    cbm: 12.0,
    amount: 186.0
  });

  const [transportTemplateName, setTransportTemplateName] = useState('');
  const [savedTransportTemplates, setSavedTransportTemplates] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('quotation_transport_templates');
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    return [
      {
        name: 'Standard Container Shipping',
        rows: [
          { rate: 20.0, cbm: 15.0, amount: 300.0 }
        ]
      }
    ];
  });

  const handleSaveTransportTemplate = () => {
    if (!transportTemplateName.trim()) return alert("Enter a template name");
    const newTemplate = { name: transportTemplateName, rows: transportCostRows };
    const updated = [...savedTransportTemplates.filter(t => t.name !== transportTemplateName), newTemplate];
    setSavedTransportTemplates(updated);
    localStorage.setItem('quotation_transport_templates', JSON.stringify(updated));
    setTransportTemplateName('');
    alert(`Template "${transportTemplateName}" saved successfully.`);
  };

  const handleLoadTransportTemplate = (name: string) => {
    const t = savedTransportTemplates.find(x => x.name === name);
    if (t) {
      setTransportCostRows(t.rows || []);
    }
  };
  const [fabForm, setFabForm] = useState({
    gmt_item: '',
    body_part: 'Body',
    body_part_type: 'Shell Fabric',
    color_range: 'Solid',
    color_nature: 'Conventional',
    composition: '100% Cotton',
    fabric_type: 'Single Jersey',
    fabric_nature: 'Knit',
    code: 101,
    fabric_source: 'Production',
    n_supplier: 'Apex Textiles',
    gsm_oz: 180,
    dia_type: 'Open Width',
    cons_basis: 'Marker',
    uom: 'Kg',
    rate: 0,
    amount: 0,
    status: 'Active'
  });

  // Consumption sub-popup states
  const [showConsBrowseModal, setShowConsBrowseModal] = useState(false);
  const [consRows, setConsRows] = useState<any[]>([]);
  const [cSize, setCSize] = useState('M');
  const [cLabDip, setCLabDip] = useState('LD-9921');
  const [cQty, setCQty] = useState(1000);
  const [cDia, setCDia] = useState(68);
  const [cConsVal, setCConsVal] = useState(0.25);
  const [cLoss, setCLoss] = useState(0.02);
  const [cRate, setCRate] = useState(4.5);

  // Yarn costing states
  const [yarnRows, setYarnRows] = useState<any[]>([]);
  const [yComp, setYComp] = useState('100% Cotton Yarn');
  const [yCount, setYCount] = useState('30s');
  const [yType, setYType] = useState('Combed');
  const [yPct, setYPct] = useState(100);
  const [yColor, setYColor] = useState('White');

  // Templates
  const [templateName, setTemplateName] = useState('');
  const [savedTemplates, setSavedTemplates] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('quotation_fabric_templates');
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    return [
      {
        name: 'Standard Cotton Polo Template',
        rows: [
          {
            gmt_item: 'Polo Shirt',
            body_part: 'Body',
            body_part_type: 'Shell Fabric',
            color_range: 'Solid',
            color_nature: 'Conventional',
            composition: '100% Cotton',
            fabric_type: 'Single Jersey',
            fabric_nature: 'Knit',
            code: 101,
            fabric_source: 'Production',
            n_supplier: 'Apex Textiles',
            gsm_oz: 180,
            dia_type: 'Open Width',
            cons_basis: 'Marker',
            uom: 'Kg',
            rate: 4.5,
            amount: 1.42,
            total_qty: 1500,
            total_amount: 6750,
            status: 'Active',
            consumption: [
              { size: 'M', lab_dip: 'LD-102', qty: 5000, dia: 68, cons: 0.28, loss: 0.02, req: 0.30, rate: 4.5, amount: 1.35 },
              { size: 'L', lab_dip: 'LD-102', qty: 5000, dia: 70, cons: 0.30, loss: 0.02, req: 0.32, rate: 4.5, amount: 1.44 }
            ],
            yarns: [
              { yarn_composition: '100% Cotton Yarn', yarn_count: '30s', yarn_type: 'Combed', percentage: 100, color: 'White', cons_qty: 0.32, rate: 3.5, amount: 1.12 }
            ]
          }
        ]
      }
    ];
  });

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return alert("Enter a template name");
    const newTemplate = { name: templateName, rows: fabricCostRows };
    const updated = [...savedTemplates.filter(t => t.name !== templateName), newTemplate];
    setSavedTemplates(updated);
    localStorage.setItem('quotation_fabric_templates', JSON.stringify(updated));
    setTemplateName('');
    alert(`Template "${templateName}" saved successfully.`);
  };

  const handleLoadTemplate = (name: string) => {
    const t = savedTemplates.find(x => x.name === name);
    if (t) {
      setFabricCostRows(t.rows || []);
    }
  };

  const handleFabCompositionChange = (val: string) => {
    let type = 'Single Jersey';
    let nature = 'Knit';
    if (val.toLowerCase().includes('cotton')) {
      type = 'Single Jersey';
      nature = 'Knit';
    } else if (val.toLowerCase().includes('poly')) {
      type = 'Microfiber';
      nature = 'Woven';
    } else if (val.toLowerCase().includes('span') || val.toLowerCase().includes('rib')) {
      type = 'Rib Knit';
      nature = 'Knit';
    } else {
      type = 'Interlock';
      nature = 'Knit';
    }
    setFabForm(prev => ({
      ...prev,
      composition: val,
      fabric_type: type,
      fabric_nature: nature
    }));
  };

  const handleBrowseOption = (field: string, title: string) => {
    if (field === 'fabric_cost') {
      setShowFabricBrowsePopup(true);
    } else if (field === 'trims_cost') {
      setShowTrimsBrowsePopup(true);
    } else if (field === 'emb_cost') {
      setShowEmbBrowsePopup(true);
    } else if (field === 'wash_cost') {
      setShowWashBrowsePopup(true);
    } else if (field === 'comml_cost') {
      setShowCommlBrowsePopup(true);
    } else if (field === 'other_cost') {
      setShowOtherBrowsePopup(true);
    } else if (field === 'transport_cost') {
      setShowTransportBrowsePopup(true);
    } else {
      setBrowseItemName('');
      setBrowseRate(0);
      setBrowseQty(0);
      setBrowseModal({ show: true, field, title });
    }
  };

  const handleCostChange = (field: string, val: number) => {
    const updatedForm = { ...form, [field]: val };
    const total = 
      (updatedForm.fabric_cost || 0) +
      (updatedForm.trims_cost || 0) +
      (updatedForm.emb_cost || 0) +
      (updatedForm.wash_cost || 0) +
      (updatedForm.comml_cost || 0) +
      (updatedForm.lab_test || 0) +
      (updatedForm.inspection_cost || 0) +
      (updatedForm.cm_cost || 0) +
      (updatedForm.sample_cost || 0) +
      (updatedForm.freight_cost || 0) +
      (updatedForm.transport_cost || 0) +
      (updatedForm.other_cost || 0) +
      (updatedForm.courier_cost || 0) +
      (updatedForm.certif_cost || 0) +
      (updatedForm.common_oh || 0) +
      (updatedForm.deffd_lc || 0) +
      (updatedForm.design_cost || 0) +
      (updatedForm.studio_cost || 0) +
      (updatedForm.opert_exp || 0) +
      (updatedForm.income_tax || 0);
    updatedForm.total_cost = total;
    setForm(updatedForm);
  };

  const handleView = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/quotations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setForm({
          ...defaultForm,
          ...data,
          fabric_cost: data.fabric_cost || 0,
          trims_cost: data.trims_cost || 0,
          emb_cost: data.emb_cost || 0,
          wash_cost: data.wash_cost || 0,
          comml_cost: data.comml_cost || 0,
          lab_test: data.lab_test || 0,
          inspection_cost: data.inspection_cost || 0,
          cm_cost: data.cm_cost || 0,
          sample_cost: data.sample_cost || 0,
          freight_cost: data.freight_cost || 0,
          other_cost: data.other_cost || 0,
          courier_cost: data.courier_cost || 0,
          certif_cost: data.certif_cost || 0,
          common_oh: data.common_oh || 0,
          deffd_lc: data.deffd_lc || 0,
          design_cost: data.design_cost || 0,
          studio_cost: data.studio_cost || 0,
          opert_exp: data.opert_exp || 0,
          income_tax: data.income_tax || 0,
          total_cost: data.total_cost || 0
        });
        setGarments(data.garments || []);
        setFabricCostRows(data.fabrics || []);
        setTrimsCostRows(data.trims || []);
        setEmbCostRows(data.embs || []);
        setWashCostRows(data.washes || []);
        setCommlCostRows(data.commls || []);
        setOtherCostRows(data.others || []);
        setTransportCostRows(data.transports || []);
        setShowModal(true);
      }
    } catch(e) { console.error(e); }
  };


  // Sub-table state
  const [gItem, setGItem] = useState('');
  const [gRatio, setGRatio] = useState(1);
  const [gCut, setGCut] = useState(0);
  const [gSew, setGSew] = useState(0);
  const [gFin, setGFin] = useState(0);

  useEffect(() => {
    fetchQuotations();
    fetchInquiries();
    fetchItemsMaster();
  }, []);

  const fetchQuotations = async () => {
    try {
      const res = await fetch(`${API_BASE}/quotations`);
      const data = await res.json();
      setQuotations(data);
    } catch(e) { console.error(e); }
  };

  const fetchInquiries = async () => {
    try {
      const res = await fetch(`${API_BASE}/inquiries`);
      const data = await res.json();
      setInquiries(data);
    } catch(e) { console.error(e); }
  };

  const fetchItemsMaster = async () => {
    try {
      const res = await fetch(`${API_BASE}/items`);
      const data = await res.json();
      setItemsMaster(data);
    } catch(e) { console.error(e); }
  };

  const handleInquiryChange = (inqId: string) => {
    const inq = inquiries.find(i => i.id === inqId);
    if (!inq) {
      setForm({ ...form, inquiry_id: '' });
      return;
    }
    
    setForm({
      ...form,
      inquiry_id: inq.id,
      style_no: inq.style_no,
      buyer: inq.buyer_name || '',
      item_group: inq.item_group || '',
      brand: inq.brand || '',
      style_desc: inq.style_desc || '',
      season: inq.season || '',
      offer_qty: inq.offer_qty || '',
      uom: inq.uom || '',
      image_url: inq.image_url || ''
    });
  };

  const handleAddGarmentLine = () => {
    if (!gItem) return alert("Select a Garment Item first");
    setGarments([...garments, {
      garments_item: gItem,
      set_ratio: gRatio,
      cutting_smv: gCut,
      sewing_smv: gSew,
      finishing_smv: gFin,
      total_smv: gCut + gSew + gFin
    }]);
    setGItem(''); setGRatio(1); setGCut(0); setGSew(0); setGFin(0);
  };

  const handleSave = async () => {
    if (!form.style_no) return alert("Style is required");
    const allYarns = fabricCostRows.reduce((acc, f) => acc.concat(f.yarns || []), []);
    try {
      const res = await fetch(`${API_BASE}/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, garments, fabrics: fabricCostRows, yarns: allYarns, trims: trimsCostRows, embs: embCostRows, washes: washCostRows, commls: commlCostRows, others: otherCostRows, transports: transportCostRows })
      });
      if (res.ok) {
        setShowModal(false);
        fetchQuotations();
      }
    } catch(e) { console.error(e); }
  };

  const handleStatusChange = async (id: string, status: string, comment: string) => {
    try {
      const res = await fetch(`${API_BASE}/quotations/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved_by: simRole, status, comments: comment })
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
    } catch(e) { 
      console.error(e); 
      alert("Error occurred updating status.");
    }
  };

  // A helper check if field should be disabled (locked by inquiry)
  const isLocked = (field: string) => form.inquiry_id && form[field] !== '' && field !== 'image_url' && ['buyer', 'item_group', 'brand', 'style_desc', 'season', 'offer_qty', 'uom'].includes(field);

  return (
    <div className="dashboard-card" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="card-title">Price Quotations</h2>
        <div style={{ display: 'flex', gap: '15px' }}>
          <select className="form-control" value={simRole} onChange={(e) => setSimRole(e.target.value)} style={{ width: '200px' }}>
            <option value="Merchandiser">Simulate: Merchandiser</option>
            <option value="Store Manager">Simulate: Store Manager</option>
          </select>
          <button className="btn btn-primary" onClick={() => { setForm(defaultForm); setGarments([]); setFabricCostRows([]); setTrimsCostRows([]); setEmbCostRows([]); setWashCostRows([]); setCommlCostRows([]); setOtherCostRows([]); setTransportCostRows([]); setShowModal(true); }}>
            + Add New
          </button>
        </div>
      </div>
      
      {(() => {
        // Calculate ready to approve team leader wise
        const readyToApproveQuotations = quotations.filter(q => q.status === 'Pending' || q.status === 'Resubmitted');
        
        const teamLeaderStats: {[key: string]: number} = {};
        readyToApproveQuotations.forEach(q => {
          const leader = q.team_leader || 'Unassigned';
          teamLeaderStats[leader] = (teamLeaderStats[leader] || 0) + 1;
        });

        // Filter and search the quotations list
        const filteredQuotations = quotations.filter(q => {
          const matchesSearch = 
            q.id.toString().includes(searchQuery) ||
            (q.style_no || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (q.buyer_name || q.buyer || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (q.team_leader || '').toLowerCase().includes(searchQuery.toLowerCase());
            
          if (statusFilter === 'Unapproved') {
            return matchesSearch && q.status !== 'Approved';
          }
          if (statusFilter === 'Approved') {
            return matchesSearch && q.status === 'Approved';
          }
          if (statusFilter === 'All') {
            return matchesSearch;
          }
          return matchesSearch && q.status === statusFilter;
        });

        return (
          <>
            {/* Team Leader Wise Stats */}
            <div style={{ padding: '0 20px', marginBottom: '20px' }}>
              <h4 style={{ color: '#475569', fontWeight: 'bold', marginBottom: '10px' }}>Ready to Approve (Team Leader Wise)</h4>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                {Object.keys(teamLeaderStats).length === 0 ? (
                  <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '10px 15px', borderRadius: '6px', fontSize: '14px', color: '#64748b' }}>
                    No quotations ready to approve.
                  </div>
                ) : (
                  Object.entries(teamLeaderStats).map(([leader, count]) => (
                    <div key={leader} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 'bold', color: '#1e3a8a' }}>{leader}</span>
                      <span className="badge badge-primary" style={{ background: '#2563eb', color: 'white', borderRadius: '20px', padding: '3px 8px', fontSize: '12px' }}>
                        {count} Ready
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div style={{ padding: '0 20px', marginBottom: '15px', display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '15px', flex: 1 }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search by ID, Style No, Buyer, or Team Leader..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ maxWidth: '400px' }}
                />
                <select 
                  className="form-control" 
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  style={{ maxWidth: '200px' }}
                >
                  <option value="Unapproved">Unapproved List</option>
                  <option value="Approved">Approved List</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Revised">Revised</option>
                  <option value="Resubmitted">Resubmitted</option>
                  <option value="All">All Statuses</option>
                </select>
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                Showing {filteredQuotations.length} Quotation(s)
              </div>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Inquiry ID</th>
                    <th>Style No</th>
                    <th>Buyer</th>
                    <th>Team Leader</th>
                    <th>Offer Qty</th>
                    <th>Total Cost</th>
                    <th>Status</th>
                    <th style={{ width: '40%' }}>Actions & Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotations.map(q => (
                    <tr key={q.id}>
                      <td><strong>{q.id}</strong></td>
                      <td>{q.inquiry_id || '-'}</td>
                      <td>{q.style_no}</td>
                      <td>{q.buyer_name || q.buyer || '-'}</td>
                      <td><strong style={{ color: '#475569' }}>{q.team_leader || 'Unassigned'}</strong></td>
                      <td>{q.offer_qty || '-'} {q.uom || ''}</td>
                      <td>${q.total_cost || '0.00'}</td>
                      <td>
                        <span className={`status-badge status-${(q.status || 'Draft').toLowerCase().replace(' ', '-')}`}>
                          {q.status}
                        </span>
                        {q.comments && (
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', maxWidth: '200px', fontStyle: 'italic' }}>
                            Note: "{q.comments}"
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleView(q.id)}>View</button>
                            
                            {/* Actions for Store Manager or whoever can approve */}
                            {simRole === 'Store Manager' && (
                              <>
                                <button className="btn btn-primary btn-sm" style={{ background: '#10b981', borderColor: '#10b981' }} onClick={() => handleStatusChange(q.id, 'Approved', actionComments[q.id] || '')}>Approve</button>
                                <button className="btn btn-primary btn-sm" style={{ background: '#f59e0b', borderColor: '#f59e0b' }} onClick={() => handleStatusChange(q.id, 'Revised', actionComments[q.id] || '')}>Revise</button>
                                <button className="btn btn-primary btn-sm" style={{ background: '#ef4444', borderColor: '#ef4444' }} onClick={() => handleStatusChange(q.id, 'Rejected', actionComments[q.id] || '')}>Reject</button>
                              </>
                            )}
                            
                            {/* Action for Merchandiser to resubmit if Rejected or Revised */}
                            {simRole === 'Merchandiser' && (q.status === 'Rejected' || q.status === 'Revised') && (
                              <button className="btn btn-primary btn-sm" style={{ background: '#3b82f6', borderColor: '#3b82f6' }} onClick={() => handleStatusChange(q.id, 'Resubmitted', 'Resubmitted for review')}>Resubmit</button>
                            )}
                          </div>
                          
                          {simRole === 'Store Manager' && q.status !== 'Approved' && (
                            <input 
                              type="text" 
                              className="form-control" 
                              placeholder="Add comment (optional)..."
                              style={{ height: '28px', fontSize: '12px', padding: '4px 8px' }}
                              value={actionComments[q.id] || ''}
                              onChange={e => setActionComments({ ...actionComments, [q.id]: e.target.value })}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredQuotations.length === 0 && (
                    <tr><td colSpan={9} style={{ textAlign: 'center', padding: '20px' }}>No price quotations found matching criteria.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        );
      })()}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '900px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>Create Price Quotation</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0' }}>
                {['required', 'others', 'costing', 'list_of_cost'].map(tab => (
                  <button 
                    key={tab}
                    style={{ padding: '10px 20px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold', color: activeTab === tab ? '#3b82f6' : '#64748b', borderBottom: activeTab === tab ? '3px solid #3b82f6' : '3px solid transparent' }}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'required' ? 'Basic Info' : tab === 'others' ? 'Other Info' : tab === 'costing' ? 'Costing' : 'List of Cost'}
                  </button>
                ))}
              </div>

              {activeTab === 'required' && (
                <div style={{ animation: 'fadeIn 0.3s' }}>
                  <div className="grid-3" style={{ marginBottom: '20px' }}>
                    <div className="form-group">
                      <label className="form-label">Inquiry Id</label>
                      <select className="form-control" value={form.inquiry_id} onChange={(e) => handleInquiryChange(e.target.value)}>
                        <option value="">-- Select Inquiry --</option>
                        {inquiries.map(i => <option key={i.id} value={i.id}>{i.id} ({i.style_no})</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Style *</label>
                      <input type="text" className="form-control" value={form.style_no} onChange={e => setForm({...form, style_no: e.target.value})} disabled={isLocked('style_no')} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Buyer *</label>
                      <input type="text" className="form-control" value={form.buyer} onChange={e => setForm({...form, buyer: e.target.value})} disabled={isLocked('buyer')} required />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Garments Category</label>
                      <select className="form-control" value={form.garments_category} onChange={e => setForm({...form, garments_category: e.target.value})}>
                        <option value="">Select Category</option>
                        <option value="Knit">Knit</option>
                        <option value="Woven">Woven</option>
                        <option value="Sweater">Sweater</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Brand Name</label>
                      <input type="text" className="form-control" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} disabled={isLocked('brand')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Style Description</label>
                      <input type="text" className="form-control" value={form.style_desc} onChange={e => setForm({...form, style_desc: e.target.value})} disabled={isLocked('style_desc')} />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Garments Item Group</label>
                      <input type="text" className="form-control" value={form.item_group} onChange={e => setForm({...form, item_group: e.target.value})} disabled={isLocked('item_group')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Garment Department</label>
                      <select className="form-control" value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                        <option value="Kids">Kids</option>
                        <option value="Ladies">Ladies</option>
                        <option value="Mens">Mens</option>
                        <option value="Boys">Boys</option>
                        <option value="Girls">Girls</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Season</label>
                      <input type="text" className="form-control" value={form.season} onChange={e => setForm({...form, season: e.target.value})} disabled={isLocked('season')} />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Offer Quantity *</label>
                      <input type="number" className="form-control" value={form.offer_qty} onChange={e => setForm({...form, offer_qty: e.target.value})} disabled={isLocked('offer_qty')} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">UOM *</label>
                      <select className="form-control" value={form.uom} onChange={e => setForm({...form, uom: e.target.value})} disabled={isLocked('uom')}>
                        <option value="Pcs">Pcs</option>
                        <option value="Set">Set</option>
                        <option value="Pack">Pack</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Costing Per *</label>
                      <select className="form-control" value={form.costing_per} onChange={e => setForm({...form, costing_per: e.target.value})}>
                        <option value="1 Pcs">1 Pcs</option>
                        <option value="1 Dzn">1 Dzn</option>
                        <option value="2 Dzn">2 Dzn</option>
                        <option value="3 Dzn">3 Dzn</option>
                        <option value="4 Dzn">4 Dzn</option>
                        <option value="1 Pack">1 Pack</option>
                        <option value="1 Set">1 Set</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Incoterm *</label>
                      <select className="form-control" value={form.incoterm} onChange={e => setForm({...form, incoterm: e.target.value})}>
                        {['FOB', 'CFR', 'CIF', 'FCA', 'CPT', 'EXW', 'FAS', 'DAF', 'DES', 'DEQ', 'DDP', 'TT', 'CTG'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Estimate Shipment Date</label>
                      <input type="date" className="form-control" value={form.est_ship_date} onChange={e => setForm({...form, est_ship_date: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Size Group *</label>
                      <input type="text" className="form-control" value={form.size_group} onChange={e => setForm({...form, size_group: e.target.value})} />
                    </div>

                    <div className="form-group">
                      <label className="form-label">MC/Line *</label>
                      <input type="number" className="form-control" value={form.mc_line} onChange={e => setForm({...form, mc_line: parseFloat(e.target.value) || 0})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Production/Line/Hour *</label>
                      <input type="number" className="form-control" value={form.prod_line_hour} onChange={e => setForm({...form, prod_line_hour: parseFloat(e.target.value) || 0})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sewing Eficienecy%</label>
                      <input type="number" className="form-control" value={form.sewing_efficiency} onChange={e => setForm({...form, sewing_efficiency: parseFloat(e.target.value) || 0})} />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Image Upload (From Inquiry ID)</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px dashed #cbd5e1' }}>
                        <input type="file" accept="image/*" style={{ display: 'none' }} id="quote-img-upload" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setForm({ ...form, image_url: file.name });
                        }} />
                        <label htmlFor="quote-img-upload" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', textAlign: 'center', margin: 0 }}>Browse Image</label>
                        {form.image_url && <div style={{ fontSize: '11px', color: '#00695c' }}>✓ {form.image_url}</div>}
                      </div>
                    </div>
                  </div>
                  
                  <h4>Garments Items & SMV</h4>
                  <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                    <div className="grid-3" style={{ gridTemplateColumns: 'repeat(6, 1fr) auto', gap: '10px', alignItems: 'end' }}>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Garments Item</label>
                        <select className="form-control" value={gItem} onChange={e => setGItem(e.target.value)}>
                          <option value="">Select Item</option>
                          {itemsMaster.map(im => <option key={im.id} value={im.item_name}>{im.item_name}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Set Ratio</label>
                        <input type="number" className="form-control" value={gRatio} onChange={e => setGRatio(parseInt(e.target.value)||0)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Cut SMV</label>
                        <input type="number" className="form-control" value={gCut} onChange={e => setGCut(parseFloat(e.target.value)||0)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Sew SMV</label>
                        <input type="number" className="form-control" value={gSew} onChange={e => setGSew(parseFloat(e.target.value)||0)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Fin SMV</label>
                        <input type="number" className="form-control" value={gFin} onChange={e => setGFin(parseFloat(e.target.value)||0)} />
                      </div>
                      <button className="btn btn-primary" onClick={handleAddGarmentLine} style={{ height: '38px', marginBottom: '15px' }}>Add Line</button>
                    </div>

                    <table className="data-table" style={{ marginTop: '15px' }}>
                      <thead><tr><th>Item</th><th>Ratio</th><th>Cut SMV</th><th>Sew SMV</th><th>Fin SMV</th><th>Total SMV</th><th>Action</th></tr></thead>
                      <tbody>
                        {garments.map((g, idx) => (
                          <tr key={idx}>
                            <td>{g.garments_item}</td><td>{g.set_ratio}</td><td>{g.cutting_smv}</td><td>{g.sewing_smv}</td><td>{g.finishing_smv}</td><td><strong>{g.total_smv}</strong></td>
                            <td><button className="btn btn-secondary btn-sm" onClick={() => setGarments(garments.filter((_, i) => i !== idx))}>Delete</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'others' && (
                <div style={{ animation: 'fadeIn 0.3s' }}>
                  <div className="grid-3">
                    <div className="form-group">
                      <label className="form-label">Country</label>
                      <select className="form-control" value={form.country} onChange={e => setForm({...form, country: e.target.value})}>
                        <option value="">Select Country</option>
                        <option value="USA">USA</option>
                        <option value="UK">UK</option>
                        <option value="EU">EU</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Currency *</label>
                      <select className="form-control" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="BDT">BDT</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sustainable Material *</label>
                      <select className="form-control" value={form.sustainable_material} onChange={e => setForm({...form, sustainable_material: e.target.value})}>
                        {['GOTS', 'OCS', 'RCS/GRS', 'OEKOTEX', 'BCI', 'CONVENTIONAL', 'COMBINED (OCS & RCS/GRS)'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Embellishment Type</label>
                      <select className="form-control" value={form.emb_type} onChange={e => setForm({...form, emb_type: e.target.value})}>
                        <option value="">None</option>
                        <option value="Print">Print</option>
                        <option value="Embroidery">Embroidery</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Quotation Date</label>
                      <input type="date" className="form-control" value={form.quotation_date} onChange={e => setForm({...form, quotation_date: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Remarks</label>
                      <input type="text" className="form-control" value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'costing' && (
                <div style={{ animation: 'fadeIn 0.3s', padding: '15px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#f8fafc', padding: '10px 15px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ background: '#3b82f6', color: 'white', padding: '6px 15px', fontWeight: 'bold', borderRadius: '4px', clipPath: 'polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%)' }}>
                        Costing Section
                      </div>
                      <span style={{ fontSize: '14px', color: '#64748b' }}>
                        Buyer: <strong style={{ color: '#1e293b' }}>{form.buyer || 'N/A'}</strong> &nbsp;&nbsp;|&nbsp;&nbsp; 
                        Style: <span className="badge badge-success" style={{ background: '#10b981', color: 'white', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{form.style_no || 'N/A'}</span>
                      </span>
                    </div>
                    <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px' }} onClick={() => alert("Standard Calculator Triggered")}>
                      📊 Calculator
                    </button>
                  </div>

                  {/* 3-Column Layout */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1.6fr', gap: '20px', alignItems: 'start' }}>
                    
                    {/* Left Column: Cost Components */}
                    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                      <table className="data-table" style={{ margin: 0, width: '100%' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc' }}>
                            <th style={{ width: '40%', padding: '10px' }}>Particulars</th>
                            <th style={{ width: '30%', padding: '10px', textAlign: 'right' }}>Mkt. Costing</th>
                            <th style={{ width: '30%', padding: '10px', textAlign: 'right' }}>% to Q.Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { label: 'Fabric Cost', field: 'fabric_cost', input: true },
                            { label: 'Trims Cost', field: 'trims_cost', input: true },
                            { label: 'Emb. Cost', field: 'emb_cost', input: true },
                            { label: 'Gmts. Wash', field: 'wash_cost', input: true },
                            { label: 'Comml. Cost', field: 'comml_cost', input: true },
                            { label: 'Lab Test', field: 'lab_test', input: false },
                            { label: 'Inspection Cost', field: 'inspection_cost', input: false },
                            { label: 'CM Cost', field: 'cm_cost', input: false },
                            { label: 'Sample Cost', field: 'sample_cost', input: false },
                            { label: 'Freight Cost', field: 'freight_cost', input: false },
                            { label: 'Transport Cost', field: 'transport_cost', input: true },
                            { label: 'Other Cost', field: 'other_cost', input: true },
                            { label: 'Courier Cost', field: 'courier_cost', input: false },
                            { label: 'Certif. Cost', field: 'certif_cost', input: false },
                            { label: 'Common OH', field: 'common_oh', input: false },
                            { label: 'Deffd. LC Cost', field: 'deffd_lc', input: false }
                          ].map(row => {
                            const val = form[row.field] || 0;
                            
                            const fabricCost = parseFloat(form.fabric_cost) || 0;
                            const trimsCost = parseFloat(form.trims_cost) || 0;
                            const embCost = parseFloat(form.emb_cost) || 0;
                            const washCost = parseFloat(form.wash_cost) || 0;
                            const commlCost = parseFloat(form.comml_cost) || 0;
                            const labTest = parseFloat(form.lab_test) || 0;
                            const inspectionCost = parseFloat(form.inspection_cost) || 0;
                            const cmCost = parseFloat(form.cm_cost) || 0;
                            const sampleCost = parseFloat(form.sample_cost) || 0;
                            const freightCost = parseFloat(form.freight_cost) || 0;
                            const transportCost = parseFloat(form.transport_cost) || 0;
                            const otherCost = parseFloat(form.other_cost) || 0;
                            const courierCost = parseFloat(form.courier_cost) || 0;
                            const certifCost = parseFloat(form.certif_cost) || 0;
                            const commonOH = parseFloat(form.common_oh) || 0;
                            const deffdLC = parseFloat(form.deffd_lc) || 0;
                            const sumOfCosts = fabricCost + trimsCost + embCost + washCost + commlCost + labTest + inspectionCost + cmCost + sampleCost + freightCost + transportCost + otherCost + courierCost + certifCost + commonOH + deffdLC;
                            const finalCostPcs = form.costing_per === '1 Dzn' ? sumOfCosts / 12 : sumOfCosts;
                            const askingProfit = parseFloat(form.asking_profit) || 0;
                            const askingQuotedPrice = finalCostPcs + askingProfit;
                            const pct = askingQuotedPrice > 0 ? (val / askingQuotedPrice) * 100 : 0;
                            
                            return (
                              <tr key={row.field}>
                                <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>{row.label}</td>
                                <td style={{ padding: '4px 8px' }}>
                                  <input 
                                    type="number" 
                                    step="0.0001"
                                    className="form-control" 
                                    style={{ 
                                      textAlign: 'right', 
                                      padding: '4px 8px', 
                                      height: '28px',
                                      fontSize: '13px',
                                      border: row.input ? '1px solid #93c5fd' : '1px solid #cbd5e1', 
                                      background: row.input ? 'white' : '#f1f5f9' 
                                    }}
                                    disabled={!row.input}
                                    value={val === 0 ? '0' : val}
                                    onChange={e => handleCostChange(row.field, parseFloat(e.target.value) || 0)}
                                  />
                                </td>
                                <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right', color: '#64748b' }}>
                                  {pct.toFixed(2)}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Middle Column: Totals & Price Calculations */}
                    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                      <table className="data-table" style={{ margin: 0, width: '100%' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc' }}>
                            <th style={{ width: '50%', padding: '10px' }}>Particulars</th>
                            <th style={{ width: '30%', padding: '10px', textAlign: 'right' }}>Mkt. Costing</th>
                            <th style={{ width: '20%', padding: '10px', textAlign: 'right' }}>% to Q.P.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const fabricCost = parseFloat(form.fabric_cost) || 0;
                            const trimsCost = parseFloat(form.trims_cost) || 0;
                            const embCost = parseFloat(form.emb_cost) || 0;
                            const washCost = parseFloat(form.wash_cost) || 0;
                            const commlCost = parseFloat(form.comml_cost) || 0;
                            const labTest = parseFloat(form.lab_test) || 0;
                            const inspectionCost = parseFloat(form.inspection_cost) || 0;
                            const cmCost = parseFloat(form.cm_cost) || 0;
                            const sampleCost = parseFloat(form.sample_cost) || 0;
                            const freightCost = parseFloat(form.freight_cost) || 0;
                            const transportCost = parseFloat(form.transport_cost) || 0;
                            const otherCost = parseFloat(form.other_cost) || 0;
                            const courierCost = parseFloat(form.courier_cost) || 0;
                            const certifCost = parseFloat(form.certif_cost) || 0;
                            const commonOH = parseFloat(form.common_oh) || 0;
                            const deffdLC = parseFloat(form.deffd_lc) || 0;

                            const sumOfCosts = fabricCost + trimsCost + embCost + washCost + commlCost + labTest + inspectionCost + cmCost + sampleCost + freightCost + transportCost + otherCost + courierCost + certifCost + commonOH + deffdLC;
                            const finalCostPcs = form.costing_per === '1 Dzn' ? sumOfCosts / 12 : sumOfCosts;
                            
                            const askingProfit = parseFloat(form.asking_profit) || 0;
                            const askingQuotedPrice = finalCostPcs + askingProfit;
                            const revisedPrice = parseFloat(form.revised_price) || 0;
                            const confirmPrice = parseFloat(form.confirm_price) || 0;
                            
                            const priceBeforeComnDzn = confirmPrice * 12;
                            const prdCostDzn = finalCostPcs * 12;
                            const marginDznPack = priceBeforeComnDzn - prdCostDzn;
                            
                            const commiDzn = parseFloat(form.commi_dzn) || 0;
                            const priceWithCommnDzn = priceBeforeComnDzn + commiDzn;
                            const priceWithCommnPcs = priceWithCommnDzn / 12;
                            const targetPrice = parseFloat(form.target_price) || 0;

                            return (
                              <>
                                {/* Final Cost */}
                                <tr>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: 'bold', color: '#1e293b' }}>Final Cost Pcs/Set/Pack</td>
                                  <td style={{ padding: '4px 8px' }}>
                                    <input 
                                      type="number" 
                                      className="form-control" 
                                      disabled 
                                      style={{ textAlign: 'right', padding: '4px 8px', height: '28px', fontSize: '13px', background: '#f1f5f9' }} 
                                      value={finalCostPcs.toFixed(4)} 
                                    />
                                  </td>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right', color: '#64748b' }}>
                                    {(askingQuotedPrice > 0 ? (finalCostPcs / askingQuotedPrice) * 100 : 0).toFixed(2)}%
                                  </td>
                                </tr>

                                {/* Asking Profit */}
                                <tr>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Asking Profit Pcs/Set/Pack</td>
                                  <td style={{ padding: '4px 8px' }}>
                                    <input 
                                      type="number" 
                                      step="0.0001"
                                      className="form-control" 
                                      style={{ textAlign: 'right', padding: '4px 8px', height: '28px', fontSize: '13px', border: '1px solid #93c5fd' }} 
                                      value={askingProfit === 0 ? '0' : askingProfit} 
                                      onChange={e => handleCostChange('asking_profit', parseFloat(e.target.value) || 0)}
                                    />
                                  </td>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right', color: '#64748b' }}>
                                    {(askingQuotedPrice > 0 ? (askingProfit / askingQuotedPrice) * 100 : 0).toFixed(2)}%
                                  </td>
                                </tr>

                                {/* Asking Quoted Price */}
                                <tr style={{ background: '#f8fafc' }}>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: 'bold', color: '#1e293b' }}>Asking Quoted Price Pcs/Set/Pack</td>
                                  <td style={{ padding: '4px 8px' }}>
                                    <input 
                                      type="number" 
                                      className="form-control" 
                                      disabled 
                                      style={{ textAlign: 'right', padding: '4px 8px', height: '28px', fontSize: '13px', background: '#f1f5f9', fontWeight: 'bold' }} 
                                      value={askingQuotedPrice.toFixed(4)} 
                                    />
                                  </td>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right', fontWeight: 'bold', color: '#475569' }}>
                                    100.00%
                                  </td>
                                </tr>

                                {/* Revised Price */}
                                <tr>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Revised Price/Pcs/Pack</td>
                                  <td style={{ padding: '4px 8px' }}>
                                    <input 
                                      type="number" 
                                      step="0.0001"
                                      className="form-control" 
                                      style={{ textAlign: 'right', padding: '4px 8px', height: '28px', fontSize: '13px', border: '1px solid #93c5fd' }} 
                                      value={revisedPrice === 0 ? '0' : revisedPrice} 
                                      onChange={e => handleCostChange('revised_price', parseFloat(e.target.value) || 0)}
                                    />
                                  </td>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right', color: '#64748b' }}>0.00%</td>
                                </tr>

                                {/* Confirm Price */}
                                <tr>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: 'bold', color: '#b45309' }}>Confirm Price</td>
                                  <td style={{ padding: '4px 8px' }}>
                                    <input 
                                      type="number" 
                                      step="0.0001"
                                      className="form-control" 
                                      style={{ textAlign: 'right', padding: '4px 8px', height: '28px', fontSize: '13px', border: '1px solid #f59e0b', background: '#fef3c7', fontWeight: 'bold' }} 
                                      value={confirmPrice === 0 ? '0' : confirmPrice} 
                                      onChange={e => handleCostChange('confirm_price', parseFloat(e.target.value) || 0)}
                                    />
                                  </td>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right', color: '#64748b' }}>0.00%</td>
                                </tr>

                                {/* Price Before Comn/Dzn/Pack */}
                                <tr>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Price Before Comn/Dzn/Pack</td>
                                  <td style={{ padding: '4px 8px' }}>
                                    <input 
                                      type="number" 
                                      className="form-control" 
                                      disabled 
                                      style={{ textAlign: 'right', padding: '4px 8px', height: '28px', fontSize: '13px', background: '#f1f5f9' }} 
                                      value={priceBeforeComnDzn.toFixed(4)} 
                                    />
                                  </td>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right', color: '#64748b' }}>100%</td>
                                </tr>

                                {/* Prd. Cost /Dzn */}
                                <tr>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Prd. Cost /Dzn</td>
                                  <td style={{ padding: '4px 8px' }}>
                                    <input 
                                      type="number" 
                                      className="form-control" 
                                      disabled 
                                      style={{ textAlign: 'right', padding: '4px 8px', height: '28px', fontSize: '13px', background: '#f1f5f9' }} 
                                      value={prdCostDzn.toFixed(4)} 
                                    />
                                  </td>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right', color: '#64748b' }}>0.00%</td>
                                </tr>

                                {/* Margin Dzn/Pack */}
                                <tr>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Margin Dzn/Pack</td>
                                  <td style={{ padding: '4px 8px' }}>
                                    <input 
                                      type="text" 
                                      className="form-control" 
                                      disabled 
                                      style={{ textAlign: 'right', padding: '4px 8px', height: '28px', fontSize: '13px', background: '#f1f5f9', fontWeight: 'bold', color: marginDznPack >= 0 ? '#10b981' : '#ef4444' }} 
                                      value={marginDznPack.toFixed(4)} 
                                    />
                                  </td>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right', color: '#64748b' }}>0.00%</td>
                                </tr>

                                {/* Commi. Dzn/Pack */}
                                <tr>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Commi. Dzn/Pack</td>
                                  <td style={{ padding: '4px 8px' }}>
                                    <input 
                                      type="number" 
                                      step="0.0001"
                                      className="form-control" 
                                      style={{ textAlign: 'right', padding: '4px 8px', height: '28px', fontSize: '13px', border: '1px solid #93c5fd' }} 
                                      value={commiDzn === 0 ? '0' : commiDzn} 
                                      onChange={e => handleCostChange('commi_dzn', parseFloat(e.target.value) || 0)}
                                    />
                                  </td>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right', color: '#64748b' }}>0.00%</td>
                                </tr>

                                {/* Price with Commn Dzn/Pack */}
                                <tr>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Price with Commn Dzn/Pack</td>
                                  <td style={{ padding: '4px 8px' }}>
                                    <input 
                                      type="number" 
                                      className="form-control" 
                                      disabled 
                                      style={{ textAlign: 'right', padding: '4px 8px', height: '28px', fontSize: '13px', background: '#f1f5f9' }} 
                                      value={priceWithCommnDzn.toFixed(4)} 
                                    />
                                  </td>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right', color: '#64748b' }}>0.00%</td>
                                </tr>

                                {/* Price with Commn Pcs/Pack */}
                                <tr>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Price with Commn Pcs/Pack</td>
                                  <td style={{ padding: '4px 8px' }}>
                                    <input 
                                      type="number" 
                                      className="form-control" 
                                      disabled 
                                      style={{ textAlign: 'right', padding: '4px 8px', height: '28px', fontSize: '13px', background: '#f1f5f9' }} 
                                      value={priceWithCommnPcs.toFixed(4)} 
                                    />
                                  </td>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right', color: '#64748b' }}>0.00%</td>
                                </tr>

                                {/* Target price */}
                                <tr>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Target price</td>
                                  <td style={{ padding: '4px 8px' }}>
                                    <input 
                                      type="number" 
                                      step="0.0001"
                                      className="form-control" 
                                      style={{ textAlign: 'right', padding: '4px 8px', height: '28px', fontSize: '13px', border: '1px solid #cbd5e1' }} 
                                      value={targetPrice === 0 ? '0' : targetPrice} 
                                      onChange={e => handleCostChange('target_price', parseFloat(e.target.value) || 0)}
                                    />
                                  </td>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right', color: '#64748b' }}></td>
                                </tr>
                              </>
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>

                    {/* Right Column: Price Comparison & Margin Analysis */}
                    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                      <table className="data-table" style={{ margin: 0, width: '100%' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc' }}>
                            <th style={{ width: '40%', padding: '10px' }}>Particulars</th>
                            <th style={{ width: '20%', padding: '10px', textAlign: 'right' }}>Asking</th>
                            <th style={{ width: '20%', padding: '10px', textAlign: 'right' }}>Confirmed</th>
                            <th style={{ width: '20%', padding: '10px', textAlign: 'right' }}>Deviation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const fabricCost = parseFloat(form.fabric_cost) || 0;
                            const trimsCost = parseFloat(form.trims_cost) || 0;
                            const embCost = parseFloat(form.emb_cost) || 0;
                            const washCost = parseFloat(form.wash_cost) || 0;
                            const commlCost = parseFloat(form.comml_cost) || 0;
                            const labTest = parseFloat(form.lab_test) || 0;
                            const inspectionCost = parseFloat(form.inspection_cost) || 0;
                            const cmCost = parseFloat(form.cm_cost) || 0;
                            const sampleCost = parseFloat(form.sample_cost) || 0;
                            const freightCost = parseFloat(form.freight_cost) || 0;
                            const transportCost = parseFloat(form.transport_cost) || 0;
                            const otherCost = parseFloat(form.other_cost) || 0;
                            const courierCost = parseFloat(form.courier_cost) || 0;
                            const certifCost = parseFloat(form.certif_cost) || 0;
                            const commonOH = parseFloat(form.common_oh) || 0;
                            const deffdLC = parseFloat(form.deffd_lc) || 0;

                            const sumOfCosts = fabricCost + trimsCost + embCost + washCost + commlCost + labTest + inspectionCost + cmCost + sampleCost + freightCost + transportCost + otherCost + courierCost + certifCost + commonOH + deffdLC;
                            const finalCostPcs = form.costing_per === '1 Dzn' ? sumOfCosts / 12 : sumOfCosts;

                            const askingProfit = parseFloat(form.asking_profit) || 0;
                            const askingQuotedPrice = finalCostPcs + askingProfit;
                            const confirmPrice = parseFloat(form.confirm_price) || 0;
                            const offerQty = parseFloat(form.offer_qty) || 0;

                            // Price with Commn/Pcs/Pack
                            const priceCommnPcsAsking = askingQuotedPrice;
                            const priceCommnPcsConf = confirmPrice;
                            const priceCommnPcsDev = priceCommnPcsConf - priceCommnPcsAsking;

                            // Prod. Cost/Pcs/Pack
                            const prodCostPcsAsking = finalCostPcs;
                            const prodCostPcsConf = finalCostPcs;
                            const prodCostPcsDev = 0;

                            // Margin/Pcs/Pack
                            const marginPcsAsking = askingProfit;
                            const marginPcsConf = confirmPrice - finalCostPcs;
                            const marginPcsDev = marginPcsConf - marginPcsAsking;

                            // Margin/Dzn
                            const marginDznAsking = marginPcsAsking * 12;
                            const marginDznConf = marginPcsConf * 12;
                            const marginDznDev = marginPcsDev * 12;

                            // Margin for Offer Qty
                            const marginQtyAsking = marginPcsAsking * offerQty;
                            const marginQtyConf = marginPcsConf * offerQty;
                            const marginQtyDev = marginPcsDev * offerQty;

                            return (
                              <>
                                {/* Price with Commn/Pcs/Pack */}
                                <tr>
                                  <td style={{ padding: '10px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Price With Commn/Pcs/Pack</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px' }}>{priceCommnPcsAsking.toFixed(4)}</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px' }}>{priceCommnPcsConf.toFixed(4)}</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold', color: priceCommnPcsDev >= 0 ? '#10b981' : '#ef4444' }}>{priceCommnPcsDev.toFixed(4)}</td>
                                </tr>

                                {/* Prod. Cost/Pcs/Pack */}
                                <tr>
                                  <td style={{ padding: '10px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Prod. Cost/Pcs/Pack</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px' }}>{prodCostPcsAsking.toFixed(4)}</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px' }}>{prodCostPcsConf.toFixed(4)}</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', color: '#64748b' }}>{prodCostPcsDev.toFixed(4)}</td>
                                </tr>

                                {/* Margin/Pcs/Pack */}
                                <tr>
                                  <td style={{ padding: '10px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Margin/Pcs/Pack</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px' }}>{marginPcsAsking.toFixed(4)}</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold', color: marginPcsConf >= 0 ? '#10b981' : '#ef4444' }}>{marginPcsConf.toFixed(4)}</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold', color: marginPcsDev >= 0 ? '#10b981' : '#ef4444' }}>{marginPcsDev.toFixed(4)}</td>
                                </tr>

                                {/* Margin/Dzn */}
                                <tr>
                                  <td style={{ padding: '10px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Margin/Dzn</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px' }}>{marginDznAsking.toFixed(4)}</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold', color: marginDznConf >= 0 ? '#10b981' : '#ef4444' }}>{marginDznConf.toFixed(4)}</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold', color: marginDznDev >= 0 ? '#10b981' : '#ef4444' }}>{marginDznDev.toFixed(4)}</td>
                                </tr>

                                {/* Margin for Offer Qty */}
                                <tr style={{ background: '#f8fafc' }}>
                                  <td style={{ padding: '10px', fontSize: '13px', fontWeight: 'bold', color: '#1e293b' }}>Margin for Offer Qty</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold' }}>{marginQtyAsking.toFixed(4)}</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold', color: marginQtyConf >= 0 ? '#10b981' : '#ef4444' }}>{marginQtyConf.toFixed(4)}</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold', color: marginQtyDev >= 0 ? '#10b981' : '#ef4444' }}>{marginQtyDev.toFixed(4)}</td>
                                </tr>
                              </>
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>

                  </div>
                </div>
              )}

              {activeTab === 'list_of_cost' && (
                <div style={{ animation: 'fadeIn 0.3s' }}>
                  <h4 style={{ marginBottom: '16px', color: '#1e293b', fontWeight: 'bold' }}>List of Direct and Indirect Component Costs</h4>
                  
                  {/* Direct Costs */}
                  <div className="grid-3" style={{ marginBottom: '20px' }}>
                    <div className="form-group" style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="form-label" style={{ fontWeight: 600, color: '#334155', marginBottom: 0 }}>Fabric Cost</label>
                        <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: '12px' }} onClick={() => handleBrowseOption('fabric_cost', 'Fabric Cost')}>Browse Option</button>
                      </div>
                      <input type="number" className="form-control" style={{ marginTop: '8px' }} value={form.fabric_cost || 0} onChange={e => handleCostChange('fabric_cost', parseFloat(e.target.value) || 0)} />
                    </div>

                    <div className="form-group" style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="form-label" style={{ fontWeight: 600, color: '#334155', marginBottom: 0 }}>Trims Cost</label>
                        <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: '12px' }} onClick={() => handleBrowseOption('trims_cost', 'Trims Cost')}>Browse Option</button>
                      </div>
                      <input type="number" className="form-control" style={{ marginTop: '8px' }} value={form.trims_cost || 0} onChange={e => handleCostChange('trims_cost', parseFloat(e.target.value) || 0)} />
                    </div>

                    <div className="form-group" style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="form-label" style={{ fontWeight: 600, color: '#334155', marginBottom: 0 }}>Emb. Cost</label>
                        <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: '12px' }} onClick={() => handleBrowseOption('emb_cost', 'Embellishment Cost')}>Browse Option</button>
                      </div>
                      <input type="number" className="form-control" style={{ marginTop: '8px' }} value={form.emb_cost || 0} onChange={e => handleCostChange('emb_cost', parseFloat(e.target.value) || 0)} />
                    </div>
                  </div>

                  <div className="grid-4" style={{ marginBottom: '20px' }}>
                    <div className="form-group" style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="form-label" style={{ fontWeight: 600, color: '#334155', marginBottom: 0 }}>Gmts. Wash</label>
                        <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: '12px' }} onClick={() => handleBrowseOption('wash_cost', 'Wash Cost')}>Browse Option</button>
                      </div>
                      <input type="number" className="form-control" style={{ marginTop: '8px' }} value={form.wash_cost || 0} onChange={e => handleCostChange('wash_cost', parseFloat(e.target.value) || 0)} />
                    </div>

                    <div className="form-group" style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="form-label" style={{ fontWeight: 600, color: '#334155', marginBottom: 0 }}>Comml. Cost</label>
                        <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: '12px' }} onClick={() => handleBrowseOption('comml_cost', 'Commercial Cost')}>Browse Option</button>
                      </div>
                      <input type="number" className="form-control" style={{ marginTop: '8px' }} value={form.comml_cost || 0} onChange={e => handleCostChange('comml_cost', parseFloat(e.target.value) || 0)} />
                    </div>

                    <div className="form-group" style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="form-label" style={{ fontWeight: 600, color: '#334155', marginBottom: 0 }}>Transport Cost</label>
                        <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: '12px' }} onClick={() => handleBrowseOption('transport_cost', 'Transport Cost')}>Browse Option</button>
                      </div>
                      <input type="number" className="form-control" style={{ marginTop: '8px' }} value={form.transport_cost || 0} onChange={e => handleCostChange('transport_cost', parseFloat(e.target.value) || 0)} />
                    </div>

                    <div className="form-group" style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="form-label" style={{ fontWeight: 600, color: '#334155', marginBottom: 0 }}>Other Cost</label>
                        <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: '12px' }} onClick={() => handleBrowseOption('other_cost', 'Other Cost')}>Browse Option</button>
                      </div>
                      <input type="number" className="form-control" style={{ marginTop: '8px' }} value={form.other_cost || 0} onChange={e => handleCostChange('other_cost', parseFloat(e.target.value) || 0)} />
                    </div>
                  </div>

                  {/* Indirect Costs Grid */}
                  <div className="grid-4" style={{ marginBottom: '15px' }}>
                    <div className="form-group">
                      <label className="form-label">Lab Test ($)</label>
                      <input type="number" className="form-control" value={form.lab_test || 0} onChange={e => handleCostChange('lab_test', parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Inspection Cost ($)</label>
                      <input type="number" className="form-control" value={form.inspection_cost || 0} onChange={e => handleCostChange('inspection_cost', parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">CM Cost ($)</label>
                      <input type="number" className="form-control" value={form.cm_cost || 0} onChange={e => handleCostChange('cm_cost', parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sample Cost ($)</label>
                      <input type="number" className="form-control" value={form.sample_cost || 0} onChange={e => handleCostChange('sample_cost', parseFloat(e.target.value) || 0)} />
                    </div>
                  </div>

                  <div className="grid-4" style={{ marginBottom: '15px' }}>
                    <div className="form-group">
                      <label className="form-label">Freight Cost ($)</label>
                      <input type="number" className="form-control" value={form.freight_cost || 0} onChange={e => handleCostChange('freight_cost', parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Courier Cost ($)</label>
                      <input type="number" className="form-control" value={form.courier_cost || 0} onChange={e => handleCostChange('courier_cost', parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Certif. Cost ($)</label>
                      <input type="number" className="form-control" value={form.certif_cost || 0} onChange={e => handleCostChange('certif_cost', parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Common OH ($)</label>
                      <input type="number" className="form-control" value={form.common_oh || 0} onChange={e => handleCostChange('common_oh', parseFloat(e.target.value) || 0)} />
                    </div>
                  </div>

                  <div className="grid-4" style={{ marginBottom: '15px' }}>
                    <div className="form-group">
                      <label className="form-label">Deffd. LC Cost ($)</label>
                      <input type="number" className="form-control" value={form.deffd_lc || 0} onChange={e => handleCostChange('deffd_lc', parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Design Cost ($)</label>
                      <input type="number" className="form-control" value={form.design_cost || 0} onChange={e => handleCostChange('design_cost', parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Studio Cost ($)</label>
                      <input type="number" className="form-control" value={form.studio_cost || 0} onChange={e => handleCostChange('studio_cost', parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Opert. Exp. ($)</label>
                      <input type="number" className="form-control" value={form.opert_exp || 0} onChange={e => handleCostChange('opert_exp', parseFloat(e.target.value) || 0)} />
                    </div>
                  </div>

                  <div className="grid-4" style={{ marginBottom: '20px' }}>
                    <div className="form-group">
                      <label className="form-label">Income Tax ($)</label>
                      <input type="number" className="form-control" value={form.income_tax || 0} onChange={e => handleCostChange('income_tax', parseFloat(e.target.value) || 0)} />
                    </div>
                  </div>

                  {/* Summary / Total Cost */}
                  <div style={{ background: '#e2e8f0', padding: '15px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>Total Quotation Cost:</span>
                    <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f766e' }}>${(form.total_cost || 0).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer" style={{ borderTop: '2px solid #e2e8f0', paddingTop: '20px', marginTop: '20px', textAlign: 'right' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ marginRight: '10px' }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save Quotation</button>
            </div>
          </div>
        </div>
      )}

      {browseModal.show && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ width: '500px' }}>
            <div className="modal-header">
              <h3>Browse & Calculate: {browseModal.title}</h3>
              <button className="modal-close" onClick={() => setBrowseModal({ show: false, field: '', title: '' })}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '15px' }}>
                Select an item and enter details to calculate cost for this quotation.
              </p>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Item / Template Name</label>
                <select className="form-control" value={browseItemName} onChange={e => {
                  setBrowseItemName(e.target.value);
                  if (e.target.value.includes('Fabric')) setBrowseRate(4.5);
                  else if (e.target.value.includes('Trim') || e.target.value.includes('Button') || e.target.value.includes('Zipper')) setBrowseRate(0.8);
                  else if (e.target.value.includes('Print') || e.target.value.includes('Embroidery')) setBrowseRate(1.2);
                  else if (e.target.value.includes('Wash')) setBrowseRate(0.5);
                  else setBrowseRate(2.0);
                }}>
                  <option value="">-- Choose Item / Template --</option>
                  {browseModal.field === 'fabric_cost' && (
                    <>
                      <option value="100% Cotton Single Jersey Fabric">100% Cotton Single Jersey Fabric</option>
                      <option value="Cotton Polyester Blend Rib Fabric">Cotton Polyester Blend Rib Fabric</option>
                      <option value="Organic Cotton Interlock Fabric">Organic Cotton Interlock Fabric</option>
                    </>
                  )}
                  {browseModal.field === 'trims_cost' && (
                    <>
                      <option value="Metal Buttons Template">Metal Buttons Template</option>
                      <option value="Nylon Zipper Template">Nylon Zipper Template</option>
                      <option value="Main Woven Labels Template">Main Woven Labels Template</option>
                    </>
                  )}
                  {browseModal.field === 'emb_cost' && (
                    <>
                      <option value="Rubber Chest Print">Rubber Chest Print</option>
                      <option value="Logo Embroidery 5000 stitches">Logo Embroidery 5000 stitches</option>
                      <option value="Allover Discharge Print">Allover Discharge Print</option>
                    </>
                  )}
                  {browseModal.field === 'wash_cost' && (
                    <>
                      <option value="Normal Enzyme Wash">Normal Enzyme Wash</option>
                      <option value="Silicone Softener Wash">Silicone Softener Wash</option>
                      <option value="Tie Dye Wash">Tie Dye Wash</option>
                    </>
                  )}
                  {browseModal.field === 'comml_cost' && (
                    <>
                      <option value="Commercial Export LC Charges">Commercial Export LC Charges</option>
                      <option value="Forwarder Documentation Fees">Forwarder Documentation Fees</option>
                    </>
                  )}
                  {browseModal.field === 'other_cost' && (
                    <>
                      <option value="Special Protective Packaging">Special Protective Packaging</option>
                      <option value="Testing & Inspection Overhead">Testing & Inspection Overhead</option>
                    </>
                  )}
                </select>
              </div>
              <div className="grid-2" style={{ marginBottom: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Quantity / Unit Cons.</label>
                  <input type="number" className="form-control" value={browseQty} onChange={e => setBrowseQty(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit Rate ($)</label>
                  <input type="number" className="form-control" value={browseRate} onChange={e => setBrowseRate(parseFloat(e.target.value) || 0)} />
                </div>
              </div>
              <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '4px', textAlign: 'right', fontWeight: 'bold', color: '#1e293b' }}>
                Total Cost: ${(browseQty * browseRate).toFixed(2)}
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid #cbd5e1', paddingTop: '15px', textAlign: 'right' }}>
              <button className="btn btn-secondary" onClick={() => setBrowseModal({ show: false, field: '', title: '' })} style={{ marginRight: '8px' }}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                const computedCost = browseQty * browseRate;
                handleCostChange(browseModal.field, computedCost);
                setBrowseModal({ show: false, field: '', title: '' });
              }}>Apply Cost</button>
            </div>
          </div>
        </div>
      )}

      {showFabricBrowsePopup && (
        <div className="modal-overlay" style={{ zIndex: 1050 }}>
          <div className="modal-content" style={{ width: '1000px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>Detailed Fabric Merchandising Costing Specifications</h2>
              <button className="modal-close" onClick={() => setShowFabricBrowsePopup(false)}>×</button>
            </div>
            
            <div className="modal-body">
              {/* Template Selector */}
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: '#f1f5f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <span style={{ fontWeight: 'bold', color: '#334155' }}>Template Options:</span>
                <select className="form-control" style={{ width: '220px' }} onChange={e => handleLoadTemplate(e.target.value)}>
                  <option value="">-- Load Saved Template --</option>
                  {savedTemplates.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                </select>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Template Name to Save" 
                  style={{ width: '220px' }} 
                  value={templateName} 
                  onChange={e => setTemplateName(e.target.value)} 
                />
                <button className="btn btn-primary" onClick={handleSaveTemplate}>Save Template</button>
              </div>

              {/* Form to Add Fabric Cost Row */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
                <h4 style={{ color: '#1e293b', fontWeight: 'bold', marginBottom: '15px' }}>Add Fabric Cost Line</h4>
                
                <div className="grid-3" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Gmt. Item</label>
                    <select className="form-control" value={fabForm.gmt_item} onChange={e => setFabForm({ ...fabForm, gmt_item: e.target.value })}>
                      <option value="">-- Choose Item --</option>
                      {itemsMaster.map(i => <option key={i.id} value={i.item_name}>{i.item_name}</option>)}
                      {itemsMaster.length === 0 && (
                        <>
                          <option value="Girls Swimming Costume">Girls Swimming Costume</option>
                          <option value="Mens Cotton Polo">Mens Cotton Polo</option>
                          <option value="Ladies Knit Tanktop">Ladies Knit Tanktop</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Body Part *</label>
                    <select className="form-control" value={fabForm.body_part} onChange={e => setFabForm({ ...fabForm, body_part: e.target.value })}>
                      <option value="Body">Body</option>
                      <option value="Collar">Collar</option>
                      <option value="Cuff">Cuff</option>
                      <option value="Sleeve">Sleeve</option>
                      <option value="Pocket Lining">Pocket Lining</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Body Part Type</label>
                    <input type="text" className="form-control" value={fabForm.body_part_type} onChange={e => setFabForm({ ...fabForm, body_part_type: e.target.value })} />
                  </div>
                </div>

                <div className="grid-3" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Color Range *</label>
                    <select className="form-control" value={fabForm.color_range} onChange={e => setFabForm({ ...fabForm, color_range: e.target.value })}>
                      <option value="Solid">Solid</option>
                      <option value="Solid Melange">Solid Melange</option>
                      <option value="Yarn Dyed">Yarn Dyed</option>
                      <option value="Striped">Striped</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Color Nature</label>
                    <select className="form-control" value={fabForm.color_nature} onChange={e => setFabForm({ ...fabForm, color_nature: e.target.value })}>
                      <option value="Conventional">Conventional</option>
                      <option value="Organic">Organic</option>
                      <option value="Sustainable">Sustainable</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fabric Composition *</label>
                    <select className="form-control" value={fabForm.composition} onChange={e => handleFabCompositionChange(e.target.value)}>
                      <option value="100% Cotton">100% Cotton</option>
                      <option value="60% Cotton 40% Polyester">60% Cotton 40% Polyester</option>
                      <option value="95% Cotton 5% Spandex">95% Cotton 5% Spandex</option>
                      <option value="100% Polyester">100% Polyester</option>
                      <option value="Organic Bamboo Knit">Organic Bamboo Knit</option>
                    </select>
                  </div>
                </div>

                <div className="grid-3" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Fabric Type * (Auto)</label>
                    <input type="text" className="form-control" value={fabForm.fabric_type} disabled style={{ background: '#f1f5f9' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fabric Nature (Auto)</label>
                    <input type="text" className="form-control" value={fabForm.fabric_nature} disabled style={{ background: '#f1f5f9' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Code (Integer)</label>
                    <input type="number" className="form-control" value={fabForm.code} onChange={e => setFabForm({ ...fabForm, code: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>

                <div className="grid-3" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Source *</label>
                    <select className="form-control" value={fabForm.fabric_source} onChange={e => setFabForm({ ...fabForm, fabric_source: e.target.value })}>
                      <option value="Production">Production</option>
                      <option value="Purchase">Purchase</option>
                      <option value="Buyer Supplier">Buyer Supplier</option>
                      <option value="Stock">Stock</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Supplier</label>
                    <select className="form-control" value={fabForm.n_supplier} onChange={e => setFabForm({ ...fabForm, n_supplier: e.target.value })}>
                      <option value="Apex Textiles">Apex Textiles</option>
                      <option value="Beximco Fabrics">Beximco Fabrics</option>
                      <option value="Liz Fashion">Liz Fashion</option>
                      <option value="Ha-meem Group">Ha-meem Group</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gsm/Oz *</label>
                    <input type="number" className="form-control" value={fabForm.gsm_oz} onChange={e => setFabForm({ ...fabForm, gsm_oz: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>

                <div className="grid-3" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Dia Type</label>
                    <select className="form-control" value={fabForm.dia_type} onChange={e => setFabForm({ ...fabForm, dia_type: e.target.value })}>
                      <option value="Open Width">Open Width</option>
                      <option value="Tubular">Tubular</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Consumption Basis</label>
                    <select className="form-control" value={fabForm.cons_basis} onChange={e => setFabForm({ ...fabForm, cons_basis: e.target.value })}>
                      <option value="Marker">Marker</option>
                      <option value="CAD">CAD</option>
                      <option value="Measurement">Measurement</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">UOM *</label>
                    <select className="form-control" value={fabForm.uom} onChange={e => setFabForm({ ...fabForm, uom: e.target.value })}>
                      <option value="Kg">Kg</option>
                      <option value="Yds">Yds</option>
                      <option value="Mtr">Mtr</option>
                    </select>
                  </div>
                </div>

                <div className="grid-4" style={{ marginBottom: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Consumption *</label>
                    <button type="button" className="btn btn-secondary" style={{ display: 'block', width: '100%' }} onClick={() => setShowConsBrowseModal(true)}>
                      Browse Option ({consRows.length} lines)
                    </button>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rate ($) (Auto)</label>
                    <input type="number" className="form-control" value={fabForm.rate || 0} disabled style={{ background: '#f1f5f9' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount ($) (Auto)</label>
                    <input type="number" className="form-control" value={fabForm.amount || 0} disabled style={{ background: '#f1f5f9' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-control" value={fabForm.status} onChange={e => setFabForm({ ...fabForm, status: e.target.value })}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Yarn Costing Section (Condition: Source === 'Production') */}
                {fabForm.fabric_source === 'Production' && (
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '16px', background: '#fff', marginTop: '20px', marginBottom: '20px' }}>
                    <h4 style={{ color: '#0f766e', marginBottom: '15px', fontWeight: 'bold' }}>Fabric - Yarn Costing (Production Source)</h4>
                    <div className="grid-3" style={{ marginBottom: '12px' }}>
                      <div className="form-group">
                        <label className="form-label">Fabric Composition</label>
                        <input type="text" className="form-control" value={fabForm.composition} disabled style={{ background: '#f1f5f9' }} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Yarn. Composition *</label>
                        <select className="form-control" value={yComp} onChange={e => setYComp(e.target.value)}>
                          <option value="100% Cotton Yarn">100% Cotton Yarn</option>
                          <option value="CVC Yarn">CVC Yarn</option>
                          <option value="TC Yarn">TC Yarn</option>
                          <option value="100% Polyester Yarn">100% Polyester Yarn</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Yarn Count *</label>
                        <select className="form-control" value={yCount} onChange={e => setYCount(e.target.value)}>
                          <option value="20s">20s</option>
                          <option value="24s">24s</option>
                          <option value="28s">28s</option>
                          <option value="30s">30s</option>
                          <option value="34s">34s</option>
                          <option value="40s">40s</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid-3" style={{ marginBottom: '15px' }}>
                      <div className="form-group">
                        <label className="form-label">Yarn Type</label>
                        <select className="form-control" value={yType} onChange={e => setYType(e.target.value)}>
                          <option value="Combed">Combed</option>
                          <option value="Carded">Carded</option>
                          <option value="Siro">Siro</option>
                          <option value="Slub">Slub</option>
                          <option value="Open End">Open End</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Percentage(%) *</label>
                        <input type="number" className="form-control" value={yPct} onChange={e => setYPct(parseInt(e.target.value) || 0)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Color</label>
                        <input type="text" className="form-control" value={yColor} onChange={e => setYColor(e.target.value)} />
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => {
                        if (!yComp) return alert("Select Yarn Composition");
                        const estimatedCons = (fabForm.amount || 0.3) * (yPct / 100);
                        const rate = 3.5;
                        setYarnRows([...yarnRows, {
                          yarn_composition: yComp,
                          yarn_count: yCount,
                          yarn_type: yType,
                          percentage: yPct,
                          color: yColor,
                          cons_qty: parseFloat(estimatedCons.toFixed(3)),
                          process_loss_pct: 5,
                          supplier: fabForm.n_supplier,
                          rate: rate,
                          amount: parseFloat((estimatedCons * 1.05 * rate).toFixed(3))
                        }]);
                      }}>Add Yarn Line</button>
                    </div>

                    <table className="data-table" style={{ fontSize: '12px' }}>
                      <thead>
                        <tr>
                          <th>Yarn Composition</th>
                          <th>Count</th>
                          <th>Type</th>
                          <th>%</th>
                          <th>Color</th>
                          <th>Qty</th>
                          <th>Amount</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yarnRows.map((y, idx) => (
                          <tr key={idx}>
                            <td>{y.yarn_composition}</td>
                            <td>{y.yarn_count}</td>
                            <td>{y.yarn_type}</td>
                            <td>{y.percentage}%</td>
                            <td>{y.color}</td>
                            <td>{y.cons_qty}</td>
                            <td>${y.amount}</td>
                            <td>
                              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setYarnRows(yarnRows.filter((_, i) => i !== idx))}>Remove</button>
                            </td>
                          </tr>
                        ))}
                        {yarnRows.length === 0 && (
                          <tr><td colSpan={8} style={{ textAlign: 'center' }}>No yarn costing items added</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                <div style={{ textAlign: 'right' }}>
                  <button type="button" className="btn btn-primary" onClick={() => {
                    if (!fabForm.gmt_item) return alert("Select Garment Item");
                    
                    const totQtySum = consRows.reduce((sum, r) => sum + r.qty, 0);
                    const totAmtSum = consRows.reduce((sum, r) => sum + r.amount, 0);
                    const avgCons = consRows.length > 0 ? consRows.reduce((sum, r) => sum + r.req, 0) / consRows.length : 0.3;
                    const avgRate = totQtySum > 0 ? totAmtSum / totQtySum : 4.5;
                    const totalAmt = totAmtSum || (avgCons * (form.offer_qty || 1000) * avgRate);

                    setFabricCostRows([...fabricCostRows, {
                      ...fabForm,
                      grey_cons: avgCons,
                      rate: avgRate,
                      amount: avgCons * avgRate,
                      total_qty: totQtySum || (avgCons * (form.offer_qty || 1000)),
                      total_amount: totalAmt,
                      consumption: consRows,
                      yarns: yarnRows
                    }]);

                    setConsRows([]);
                    setYarnRows([]);
                    setFabForm({
                      gmt_item: '',
                      body_part: 'Body',
                      body_part_type: 'Shell Fabric',
                      color_range: 'Solid',
                      color_nature: 'Conventional',
                      composition: '100% Cotton',
                      fabric_type: 'Single Jersey',
                      fabric_nature: 'Knit',
                      code: 101,
                      fabric_source: 'Production',
                      n_supplier: 'Apex Textiles',
                      gsm_oz: 180,
                      dia_type: 'Open Width',
                      cons_basis: 'Marker',
                      uom: 'Kg',
                      rate: 0,
                      amount: 0,
                      status: 'Active'
                    });
                  }}>Add Fabric Cost Row</button>
                </div>
              </div>

              {/* Added Fabric Cost Rows Table */}
              <h4 style={{ color: '#1e293b', fontWeight: 'bold', marginBottom: '10px' }}>Added Fabric Costs List</h4>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Gmt Item</th>
                    <th>Body Part</th>
                    <th>Composition</th>
                    <th>Source</th>
                    <th>Grey Cons</th>
                    <th>Rate</th>
                    <th>Total Qty</th>
                    <th>Total Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {fabricCostRows.map((f, idx) => (
                    <tr key={idx}>
                      <td>{f.gmt_item}</td>
                      <td>{f.body_part} ({f.body_part_type})</td>
                      <td>{f.composition} ({f.fabric_type})</td>
                      <td>{f.fabric_source}</td>
                      <td>{f.grey_cons?.toFixed(3)} {f.uom}</td>
                      <td>${f.rate?.toFixed(2)}</td>
                      <td>{f.total_qty?.toFixed(1)}</td>
                      <td><strong>${f.total_amount?.toFixed(2)}</strong></td>
                      <td>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setFabricCostRows(fabricCostRows.filter((_, i) => i !== idx))}>Remove</button>
                      </td>
                    </tr>
                  ))}
                  {fabricCostRows.length === 0 && (
                    <tr><td colSpan={9} style={{ textAlign: 'center', padding: '20px' }}>No fabric costs added yet. Use the form above to add lines.</td></tr>
                  )}
                </tbody>
              </table>

              {/* Summary and Apply */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', background: '#f1f5f9', padding: '15px', borderRadius: '6px' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#334155' }}>Total Fabric Cost:</span>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f766e' }}>
                  ${fabricCostRows.reduce((sum, f) => sum + f.total_amount, 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid #cbd5e1', paddingTop: '15px', textAlign: 'right' }}>
              <button className="btn btn-secondary" onClick={() => setShowFabricBrowsePopup(false)} style={{ marginRight: '8px' }}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                const totalAmt = fabricCostRows.reduce((sum, f) => sum + f.total_amount, 0);
                handleCostChange('fabric_cost', totalAmt);
                setShowFabricBrowsePopup(false);
              }}>Apply Fabric Cost</button>
            </div>
          </div>
        </div>
      )}

      {showTrimsBrowsePopup && (
        <div className="modal-overlay" style={{ zIndex: 1050 }}>
          <div className="modal-content" style={{ width: '1000px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>Detailed Trims Merchandising Costing Specifications</h2>
              <button className="modal-close" onClick={() => setShowTrimsBrowsePopup(false)}>×</button>
            </div>
            
            <div className="modal-body">
              {/* Template Selector */}
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: '#f1f5f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <span style={{ fontWeight: 'bold', color: '#334155' }}>Template Options:</span>
                <select className="form-control" style={{ width: '220px' }} onChange={e => handleLoadTrimsTemplate(e.target.value)}>
                  <option value="">-- Load Saved Template --</option>
                  {savedTrimsTemplates.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                </select>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Template Name to Save" 
                  style={{ width: '220px' }} 
                  value={trimsTemplateName} 
                  onChange={e => setTrimsTemplateName(e.target.value)} 
                />
                <button className="btn btn-primary" onClick={handleSaveTrimsTemplate}>Save Template</button>
              </div>

              {/* Form to Add Trims Cost Row */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
                <h4 style={{ color: '#1e293b', fontWeight: 'bold', marginBottom: '15px' }}>Add Trims Cost Line</h4>
                
                <div className="grid-3" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Gmts. Item</label>
                    <select className="form-control" value={trimsForm.gmt_item} onChange={e => setTrimsForm({ ...trimsForm, gmt_item: e.target.value })}>
                      <option value="">-- Choose Item --</option>
                      {itemsMaster.map(i => <option key={i.id} value={i.item_name}>{i.item_name}</option>)}
                      {itemsMaster.length === 0 && (
                        <>
                          <option value="Girls Swimming Costume">Girls Swimming Costume</option>
                          <option value="Mens Cotton Polo">Mens Cotton Polo</option>
                          <option value="Ladies Knit Tanktop">Ladies Knit Tanktop</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Item Name *</label>
                    <select className="form-control" value={trimsForm.item_name} onChange={e => handleTrimsItemNameChange(e.target.value)}>
                      <option value="Metal Button">Metal Button</option>
                      <option value="Main Woven Label">Main Woven Label</option>
                      <option value="Size Printed Label">Size Printed Label</option>
                      <option value="Care Label">Care Label</option>
                      <option value="Hang Tag">Hang Tag</option>
                      <option value="Poly Bag">Poly Bag</option>
                      <option value="Sewing Thread 50/2">Sewing Thread 50/2</option>
                      <option value="Elastic Tape">Elastic Tape</option>
                      <option value="Drawcord">Drawcord</option>
                      <option value="Nylon Zipper 5#">Nylon Zipper 5#</option>
                      <option value="Carton Box">Carton Box</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Item Description</label>
                    <input type="text" className="form-control" value={trimsForm.item_desc} onChange={e => setTrimsForm({ ...trimsForm, item_desc: e.target.value })} />
                  </div>
                </div>

                <div className="grid-3" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Cons Uom (Auto)</label>
                    <input type="text" className="form-control" value={trimsForm.cons_uom} disabled style={{ background: '#f1f5f9' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cons/Unit Gmts * (Float)</label>
                    <input type="number" step="0.01" className="form-control" value={trimsForm.cons_unit} onChange={e => handleTrimsValueChange('cons_unit', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Extra % (Integer)</label>
                    <input type="number" className="form-control" value={trimsForm.extra_pct} onChange={e => handleTrimsValueChange('extra_pct', parseInt(e.target.value) || 0)} />
                  </div>
                </div>

                <div className="grid-3" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Total Cons (Auto)</label>
                    <input type="number" className="form-control" value={trimsForm.total_cons} disabled style={{ background: '#f1f5f9' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rate * (Float)</label>
                    <input type="number" step="0.01" className="form-control" value={trimsForm.rate} onChange={e => handleTrimsValueChange('rate', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount (Auto)</label>
                    <input type="number" className="form-control" value={trimsForm.amount} disabled style={{ background: '#f1f5f9' }} />
                  </div>
                </div>

                <div className="grid-2" style={{ marginBottom: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Supplier</label>
                    <select className="form-control" value={trimsForm.supplier} onChange={e => setTrimsForm({ ...trimsForm, supplier: e.target.value })}>
                      <option value="Apex Accessories">Apex Accessories</option>
                      <option value="Liz Accessories">Liz Accessories</option>
                      <option value="YKK Zippers">YKK Zippers</option>
                      <option value="Avery Dennison">Avery Dennison</option>
                      <option value="Mainetti Hangers">Mainetti Hangers</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-control" value={trimsForm.status} onChange={e => setTrimsForm({ ...trimsForm, status: e.target.value })}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <button type="button" className="btn btn-primary" onClick={() => {
                    if (!trimsForm.gmt_item) return alert("Select Garment Item");
                    
                    setTrimsCostRows([...trimsCostRows, { ...trimsForm }]);
                    
                    // Reset
                    setTrimsForm({
                      gmt_item: '',
                      item_name: 'Metal Button',
                      item_desc: 'Standard metal snaps',
                      cons_uom: 'Pcs',
                      cons_unit: 12,
                      extra_pct: 5,
                      total_cons: 12.6,
                      rate: 0.12,
                      amount: 1.512,
                      supplier: 'YKK Zippers',
                      status: 'Active'
                    });
                  }}>Add Trims Cost Row</button>
                </div>
              </div>

              {/* Added Trims Cost Rows Table */}
              <h4 style={{ color: '#1e293b', fontWeight: 'bold', marginBottom: '10px' }}>Added Trims Costs List</h4>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Gmt Item</th>
                    <th>Item Name</th>
                    <th>Description</th>
                    <th>UOM</th>
                    <th>Cons</th>
                    <th>Extra %</th>
                    <th>Total Cons</th>
                    <th>Rate</th>
                    <th>Amount</th>
                    <th>Supplier</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {trimsCostRows.map((t, idx) => (
                    <tr key={idx}>
                      <td>{t.gmt_item}</td>
                      <td>{t.item_name}</td>
                      <td>{t.item_desc}</td>
                      <td>{t.cons_uom}</td>
                      <td>{t.cons_unit}</td>
                      <td>{t.extra_pct}%</td>
                      <td>{t.total_cons}</td>
                      <td>${t.rate?.toFixed(2)}</td>
                      <td><strong>${t.amount?.toFixed(2)}</strong></td>
                      <td>{t.supplier}</td>
                      <td>
                        <span className={`badge badge-${t.status === 'Active' ? 'success' : 'secondary'}`}>{t.status}</span>
                      </td>
                      <td>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setTrimsCostRows(trimsCostRows.filter((_, i) => i !== idx))}>Remove</button>
                      </td>
                    </tr>
                  ))}
                  {trimsCostRows.length === 0 && (
                    <tr><td colSpan={12} style={{ textAlign: 'center', padding: '20px' }}>No trims costs added yet. Use the form above to add lines.</td></tr>
                  )}
                </tbody>
              </table>

              {/* Summary and Apply */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', background: '#f1f5f9', padding: '15px', borderRadius: '6px' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#334155' }}>Total Trims Cost:</span>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f766e' }}>
                  ${trimsCostRows.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid #cbd5e1', paddingTop: '15px', textAlign: 'right' }}>
              <button className="btn btn-secondary" onClick={() => setShowTrimsBrowsePopup(false)} style={{ marginRight: '8px' }}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                const totalAmt = trimsCostRows.reduce((sum, t) => sum + t.amount, 0);
                handleCostChange('trims_cost', totalAmt);
                setShowTrimsBrowsePopup(false);
              }}>Apply Trims Cost</button>
            </div>
          </div>
        </div>
      )}

      {showEmbBrowsePopup && (
        <div className="modal-overlay" style={{ zIndex: 1050 }}>
          <div className="modal-content" style={{ width: '1000px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>Detailed Embellishment Merchandising Costing Specifications</h2>
              <button className="modal-close" onClick={() => setShowEmbBrowsePopup(false)}>×</button>
            </div>
            
            <div className="modal-body">
              {/* Template Selector */}
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: '#f1f5f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <span style={{ fontWeight: 'bold', color: '#334155' }}>Template Options:</span>
                <select className="form-control" style={{ width: '220px' }} onChange={e => handleLoadEmbTemplate(e.target.value)}>
                  <option value="">-- Load Saved Template --</option>
                  {savedEmbTemplates.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                </select>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Template Name to Save" 
                  style={{ width: '220px' }} 
                  value={embTemplateName} 
                  onChange={e => setEmbTemplateName(e.target.value)} 
                />
                <button className="btn btn-primary" onClick={handleSaveEmbTemplate}>Save Template</button>
              </div>

              {/* Form to Add Embellishment Cost Row */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
                <h4 style={{ color: '#1e293b', fontWeight: 'bold', marginBottom: '15px' }}>Add Embellishment Cost Line</h4>
                
                <div className="grid-3" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Embellishment Type *</label>
                    <select className="form-control" value={embForm.emb_type} onChange={e => setEmbForm({ ...embForm, emb_type: e.target.value })}>
                      <option value="Print">Print</option>
                      <option value="Embroidery">Embroidery</option>
                      <option value="Special Finish">Special Finish</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Embellishment Name *</label>
                    <select className="form-control" value={embForm.emb_name} onChange={e => setEmbForm({ ...embForm, emb_name: e.target.value })}>
                      <option value="Rubber Print">Rubber Print</option>
                      <option value="Plastisol Print">Plastisol Print</option>
                      <option value="Pigment Print">Pigment Print</option>
                      <option value="Logo Embroidery">Logo Embroidery</option>
                      <option value="High Density Print">High Density Print</option>
                      <option value="Heat Transfer Label">Heat Transfer Label</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gmts. Item</label>
                    <select className="form-control" value={embForm.gmt_item} onChange={e => setEmbForm({ ...embForm, gmt_item: e.target.value })}>
                      <option value="">-- Choose Item --</option>
                      {itemsMaster.map(i => <option key={i.id} value={i.item_name}>{i.item_name}</option>)}
                      {itemsMaster.length === 0 && (
                        <>
                          <option value="Girls Swimming Costume">Girls Swimming Costume</option>
                          <option value="Mens Cotton Polo">Mens Cotton Polo</option>
                          <option value="Ladies Knit Tanktop">Ladies Knit Tanktop</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid-3" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Description (Text)</label>
                    <input type="text" className="form-control" value={embForm.description} onChange={e => setEmbForm({ ...embForm, description: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Body Part</label>
                    <select className="form-control" value={embForm.body_part} onChange={e => setEmbForm({ ...embForm, body_part: e.target.value })}>
                      <option value="Front">Front</option>
                      <option value="Back">Back</option>
                      <option value="Sleeve">Sleeve</option>
                      <option value="Collar">Collar</option>
                      <option value="Chest">Chest</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cons / Unit Gmts * (Float)</label>
                    <input type="number" step="0.01" className="form-control" value={embForm.cons_unit} onChange={e => handleEmbValueChange('cons_unit', parseFloat(e.target.value) || 0)} />
                  </div>
                </div>

                <div className="grid-3" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Process Loss (%) (Integer)</label>
                    <input type="number" className="form-control" value={embForm.process_loss_pct} onChange={e => handleEmbValueChange('process_loss_pct', parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Qty (Auto)</label>
                    <input type="number" className="form-control" value={embForm.total_qty} disabled style={{ background: '#f1f5f9' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rate * (Float)</label>
                    <input type="number" step="0.01" className="form-control" value={embForm.rate} onChange={e => handleEmbValueChange('rate', parseFloat(e.target.value) || 0)} />
                  </div>
                </div>

                <div className="grid-3" style={{ marginBottom: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Amount (Auto)</label>
                    <input type="number" className="form-control" value={embForm.amount} disabled style={{ background: '#f1f5f9' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Supplier</label>
                    <select className="form-control" value={embForm.supplier} onChange={e => setEmbForm({ ...embForm, supplier: e.target.value })}>
                      <option value="Apex Print Ltd">Apex Print Ltd</option>
                      <option value="Liz Embroidery Ltd">Liz Embroidery Ltd</option>
                      <option value="Universal Emb & Print">Universal Emb & Print</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-control" value={embForm.status} onChange={e => setEmbForm({ ...embForm, status: e.target.value })}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <button type="button" className="btn btn-primary" onClick={() => {
                    if (!embForm.gmt_item) return alert("Select Garment Item");
                    
                    setEmbCostRows([...embCostRows, { ...embForm }]);
                    
                    // Reset
                    setEmbForm({
                      emb_type: 'Print',
                      emb_name: 'Rubber Print',
                      gmt_item: '',
                      description: 'Chest Print design',
                      body_part: 'Front',
                      cons_unit: 1,
                      process_loss_pct: 3,
                      total_qty: 1.03,
                      rate: 0.25,
                      amount: 0.2575,
                      supplier: 'Apex Print Ltd',
                      status: 'Active'
                    });
                  }}>Add Embellishment Cost Row</button>
                </div>
              </div>

              {/* Added Embellishment Cost Rows Table */}
              <h4 style={{ color: '#1e293b', fontWeight: 'bold', marginBottom: '10px' }}>Added Embellishments List</h4>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Name</th>
                    <th>Gmt Item</th>
                    <th>Description</th>
                    <th>Body Part</th>
                    <th>Cons</th>
                    <th>Loss %</th>
                    <th>Total Qty</th>
                    <th>Rate</th>
                    <th>Amount</th>
                    <th>Supplier</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {embCostRows.map((e, idx) => (
                    <tr key={idx}>
                      <td>{e.emb_type}</td>
                      <td>{e.emb_name}</td>
                      <td>{e.gmt_item}</td>
                      <td>{e.description}</td>
                      <td>{e.body_part}</td>
                      <td>{e.cons_unit}</td>
                      <td>{e.process_loss_pct}%</td>
                      <td>{e.total_qty}</td>
                      <td>${e.rate?.toFixed(2)}</td>
                      <td><strong>${e.amount?.toFixed(2)}</strong></td>
                      <td>{e.supplier}</td>
                      <td>
                        <span className={`badge badge-${e.status === 'Active' ? 'success' : 'secondary'}`}>{e.status}</span>
                      </td>
                      <td>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEmbCostRows(embCostRows.filter((_, i) => i !== idx))}>Remove</button>
                      </td>
                    </tr>
                  ))}
                  {embCostRows.length === 0 && (
                    <tr><td colSpan={13} style={{ textAlign: 'center', padding: '20px' }}>No embellishments added yet. Use the form above to add lines.</td></tr>
                  )}
                </tbody>
              </table>

              {/* Summary and Apply */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', background: '#f1f5f9', padding: '15px', borderRadius: '6px' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#334155' }}>Total Embellishment Cost:</span>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f766e' }}>
                  ${embCostRows.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid #cbd5e1', paddingTop: '15px', textAlign: 'right' }}>
              <button className="btn btn-secondary" onClick={() => setShowEmbBrowsePopup(false)} style={{ marginRight: '8px' }}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                const totalAmt = embCostRows.reduce((sum, e) => sum + e.amount, 0);
                handleCostChange('emb_cost', totalAmt);
                setShowEmbBrowsePopup(false);
              }}>Apply Embellishment Cost</button>
            </div>
          </div>
        </div>
      )}

      {showWashBrowsePopup && (
        <div className="modal-overlay" style={{ zIndex: 1050 }}>
          <div className="modal-content" style={{ width: '1000px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>Detailed Garment Wash Merchandising Costing Specifications</h2>
              <button className="modal-close" onClick={() => setShowWashBrowsePopup(false)}>×</button>
            </div>
            
            <div className="modal-body">
              {/* Template Selector */}
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: '#f1f5f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <span style={{ fontWeight: 'bold', color: '#334155' }}>Template Options:</span>
                <select className="form-control" style={{ width: '220px' }} onChange={e => handleLoadWashTemplate(e.target.value)}>
                  <option value="">-- Load Saved Template --</option>
                  {savedWashTemplates.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                </select>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Template Name to Save" 
                  style={{ width: '220px' }} 
                  value={washTemplateName} 
                  onChange={e => setWashTemplateName(e.target.value)} 
                />
                <button className="btn btn-primary" onClick={handleSaveWashTemplate}>Save Template</button>
              </div>

              {/* Form to Add Wash Cost Row */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
                <h4 style={{ color: '#1e293b', fontWeight: 'bold', marginBottom: '15px' }}>Add Wash Cost Line</h4>
                
                <div className="grid-3" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Wash Type *</label>
                    <select className="form-control" value={washForm.wash_type} onChange={e => setWashForm({ ...washForm, wash_type: e.target.value })}>
                      <option value="Enzyme">Enzyme</option>
                      <option value="Stone">Stone</option>
                      <option value="Bleach">Bleach</option>
                      <option value="Acid">Acid</option>
                      <option value="Silicon">Silicon</option>
                      <option value="Tie Dye">Tie Dye</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Wash Name *</label>
                    <select className="form-control" value={washForm.wash_name} onChange={e => setWashForm({ ...washForm, wash_name: e.target.value })}>
                      <option value="Normal Enzyme Wash">Normal Enzyme Wash</option>
                      <option value="Heavy Stone Wash">Heavy Stone Wash</option>
                      <option value="Bleach Wash">Bleach Wash</option>
                      <option value="Acid Wash">Acid Wash</option>
                      <option value="Silicone Softener Wash">Silicone Softener Wash</option>
                      <option value="Tie Dye Wash">Tie Dye Wash</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gmts. Item</label>
                    <select className="form-control" value={washForm.gmt_item} onChange={e => setWashForm({ ...washForm, gmt_item: e.target.value })}>
                      <option value="">-- Choose Item --</option>
                      {itemsMaster.map(i => <option key={i.id} value={i.item_name}>{i.item_name}</option>)}
                      {itemsMaster.length === 0 && (
                        <>
                          <option value="Girls Swimming Costume">Girls Swimming Costume</option>
                          <option value="Mens Cotton Polo">Mens Cotton Polo</option>
                          <option value="Ladies Knit Tanktop">Ladies Knit Tanktop</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid-3" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Wash Description</label>
                    <input type="text" className="form-control" value={washForm.description} onChange={e => setWashForm({ ...washForm, description: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Body Part</label>
                    <select className="form-control" value={washForm.body_part} onChange={e => setWashForm({ ...washForm, body_part: e.target.value })}>
                      <option value="Garment Piece">Garment Piece</option>
                      <option value="Panel Area">Panel Area</option>
                      <option value="Pocket Only">Pocket Only</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cons / Unit Gmts * (Float)</label>
                    <input type="number" step="0.01" className="form-control" value={washForm.cons_unit} onChange={e => handleWashValueChange('cons_unit', parseFloat(e.target.value) || 0)} />
                  </div>
                </div>

                <div className="grid-3" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Process Loss (%) (Integer)</label>
                    <input type="number" className="form-control" value={washForm.process_loss_pct} onChange={e => handleWashValueChange('process_loss_pct', parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Qty (Auto)</label>
                    <input type="number" className="form-control" value={washForm.total_qty} disabled style={{ background: '#f1f5f9' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rate * (Float)</label>
                    <input type="number" step="0.01" className="form-control" value={washForm.rate} onChange={e => handleWashValueChange('rate', parseFloat(e.target.value) || 0)} />
                  </div>
                </div>

                <div className="grid-3" style={{ marginBottom: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Amount (Auto)</label>
                    <input type="number" className="form-control" value={washForm.amount} disabled style={{ background: '#f1f5f9' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Supplier</label>
                    <select className="form-control" value={washForm.supplier} onChange={e => setWashForm({ ...washForm, supplier: e.target.value })}>
                      <option value="Apex Washing Ltd">Apex Washing Ltd</option>
                      <option value="Liz Washing Ltd">Liz Washing Ltd</option>
                      <option value="Clean & Soft Washers">Clean & Soft Washers</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-control" value={washForm.status} onChange={e => setWashForm({ ...washForm, status: e.target.value })}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <button type="button" className="btn btn-primary" onClick={() => {
                    if (!washForm.gmt_item) return alert("Select Garment Item");
                    
                    setWashCostRows([...washCostRows, { ...washForm }]);
                    
                    // Reset
                    setWashForm({
                      wash_type: 'Enzyme',
                      wash_name: 'Enzyme Wash',
                      gmt_item: '',
                      description: 'Enzyme wash for soft feel',
                      body_part: 'Garment Piece',
                      cons_unit: 1,
                      process_loss_pct: 2,
                      total_qty: 1.02,
                      rate: 0.18,
                      amount: 0.1836,
                      supplier: 'Apex Washing Ltd',
                      status: 'Active'
                    });
                  }}>Add Wash Cost Row</button>
                </div>
              </div>

              {/* Added Wash Cost Rows Table */}
              <h4 style={{ color: '#1e293b', fontWeight: 'bold', marginBottom: '10px' }}>Added Garment Wash List</h4>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Name</th>
                    <th>Gmt Item</th>
                    <th>Description</th>
                    <th>Body Part</th>
                    <th>Cons</th>
                    <th>Loss %</th>
                    <th>Total Qty</th>
                    <th>Rate</th>
                    <th>Amount</th>
                    <th>Supplier</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {washCostRows.map((w, idx) => (
                    <tr key={idx}>
                      <td>{w.wash_type}</td>
                      <td>{w.wash_name}</td>
                      <td>{w.gmt_item}</td>
                      <td>{w.description}</td>
                      <td>{w.body_part}</td>
                      <td>{w.cons_unit}</td>
                      <td>{w.process_loss_pct}%</td>
                      <td>{w.total_qty}</td>
                      <td>${w.rate?.toFixed(2)}</td>
                      <td><strong>${w.amount?.toFixed(2)}</strong></td>
                      <td>{w.supplier}</td>
                      <td>
                        <span className={`badge badge-${w.status === 'Active' ? 'success' : 'secondary'}`}>{w.status}</span>
                      </td>
                      <td>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setWashCostRows(washCostRows.filter((_, i) => i !== idx))}>Remove</button>
                      </td>
                    </tr>
                  ))}
                  {washCostRows.length === 0 && (
                    <tr><td colSpan={13} style={{ textAlign: 'center', padding: '20px' }}>No wash costing lines added yet. Use the form above to add lines.</td></tr>
                  )}
                </tbody>
              </table>

              {/* Summary and Apply */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', background: '#f1f5f9', padding: '15px', borderRadius: '6px' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#334155' }}>Total Wash Cost:</span>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f766e' }}>
                  ${washCostRows.reduce((sum, w) => sum + w.amount, 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid #cbd5e1', paddingTop: '15px', textAlign: 'right' }}>
              <button className="btn btn-secondary" onClick={() => setShowWashBrowsePopup(false)} style={{ marginRight: '8px' }}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                const totalAmt = washCostRows.reduce((sum, w) => sum + w.amount, 0);
                handleCostChange('wash_cost', totalAmt);
                setShowWashBrowsePopup(false);
              }}>Apply Wash Cost</button>
            </div>
          </div>
        </div>
      )}

      {showCommlBrowsePopup && (
        <div className="modal-overlay" style={{ zIndex: 1050 }}>
          <div className="modal-content" style={{ width: '1000px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>Detailed Commercial Merchandising Costing Specifications</h2>
              <button className="modal-close" onClick={() => setShowCommlBrowsePopup(false)}>×</button>
            </div>
            
            <div className="modal-body">
              {/* Template Selector */}
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: '#f1f5f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <span style={{ fontWeight: 'bold', color: '#334155' }}>Template Options:</span>
                <select className="form-control" style={{ width: '220px' }} onChange={e => handleLoadCommlTemplate(e.target.value)}>
                  <option value="">-- Load Saved Template --</option>
                  {savedCommlTemplates.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                </select>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Template Name to Save" 
                  style={{ width: '220px' }} 
                  value={commlTemplateName} 
                  onChange={e => setCommlTemplateName(e.target.value)} 
                />
                <button className="btn btn-primary" onClick={handleSaveCommlTemplate}>Save Template</button>
              </div>

              {/* Form to Add Commercial Cost Row */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
                <h4 style={{ color: '#1e293b', fontWeight: 'bold', marginBottom: '15px' }}>Add Commercial Cost Line</h4>
                
                <div className="grid-3" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Type *</label>
                    <select className="form-control" value={commlForm.comml_type} onChange={e => setCommlForm({ ...commlForm, comml_type: e.target.value })}>
                      <option value="Export LC Charges">Export LC Charges</option>
                      <option value="Import LC Charges">Import LC Charges</option>
                      <option value="Forwarder Documentation Fees">Forwarder Documentation Fees</option>
                      <option value="Insurance Overhead">Insurance Overhead</option>
                      <option value="Bank Commission">Bank Commission</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rate in (%) * (Integer)</label>
                    <input type="number" className="form-control" value={commlForm.rate_pct} onChange={e => setCommlForm({ ...commlForm, rate_pct: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount * (Auto Formula)</label>
                    <input type="number" className="form-control" value={commlForm.amount} disabled style={{ background: '#f1f5f9' }} />
                  </div>
                </div>

                <div className="grid-2" style={{ marginBottom: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-control" value={commlForm.status} onChange={e => setCommlForm({ ...commlForm, status: e.target.value })}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={() => {
                      setCommlCostRows([...commlCostRows, { ...commlForm }]);
                      
                      // Reset
                      setCommlForm({
                        comml_type: 'Export LC Charges',
                        rate_pct: 1,
                        amount: 0,
                        status: 'Active'
                      });
                    }}>Add Commercial Cost Row</button>
                  </div>
                </div>
              </div>

              {/* Added Commercial Cost Rows Table */}
              <h4 style={{ color: '#1e293b', fontWeight: 'bold', marginBottom: '10px' }}>Added Commercial Costs List</h4>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Rate (%)</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {commlCostRows.map((c, idx) => (
                    <tr key={idx}>
                      <td>{c.comml_type}</td>
                      <td>{c.rate_pct}%</td>
                      <td><strong>${c.amount?.toFixed(2)}</strong></td>
                      <td>
                        <span className={`badge badge-${c.status === 'Active' ? 'success' : 'secondary'}`}>{c.status}</span>
                      </td>
                      <td>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCommlCostRows(commlCostRows.filter((_, i) => i !== idx))}>Remove</button>
                      </td>
                    </tr>
                  ))}
                  {commlCostRows.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>No commercial costs added yet. Use the form above to add lines.</td></tr>
                  )}
                </tbody>
              </table>

              {/* Summary and Apply */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', background: '#f1f5f9', padding: '15px', borderRadius: '6px' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#334155' }}>Total Commercial Cost:</span>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f766e' }}>
                  ${commlCostRows.reduce((sum, c) => sum + c.amount, 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid #cbd5e1', paddingTop: '15px', textAlign: 'right' }}>
              <button className="btn btn-secondary" onClick={() => setShowCommlBrowsePopup(false)} style={{ marginRight: '8px' }}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                const totalAmt = commlCostRows.reduce((sum, c) => sum + c.amount, 0);
                handleCostChange('comml_cost', totalAmt);
                setShowCommlBrowsePopup(false);
              }}>Apply Commercial Cost</button>
            </div>
          </div>
        </div>
      )}

      {showOtherBrowsePopup && (
        <div className="modal-overlay" style={{ zIndex: 1050 }}>
          <div className="modal-content" style={{ width: '800px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>Detailed Other Merchandising Costing Specifications</h2>
              <button className="modal-close" onClick={() => setShowOtherBrowsePopup(false)}>×</button>
            </div>
            
            <div className="modal-body">
              {/* Template Selector */}
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: '#f1f5f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <span style={{ fontWeight: 'bold', color: '#334155' }}>Template Options:</span>
                <select className="form-control" style={{ width: '220px' }} onChange={e => handleLoadOtherTemplate(e.target.value)}>
                  <option value="">-- Load Saved Template --</option>
                  {savedOtherTemplates.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                </select>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Template Name to Save" 
                  style={{ width: '220px' }} 
                  value={otherTemplateName} 
                  onChange={e => setOtherTemplateName(e.target.value)} 
                />
                <button className="btn btn-primary" onClick={handleSaveOtherTemplate}>Save Template</button>
              </div>

              {/* Form to Add Other Cost Row */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
                <h4 style={{ color: '#1e293b', fontWeight: 'bold', marginBottom: '15px' }}>Add Other Cost Line</h4>
                
                <div className="grid-2" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Cost Details *</label>
                    <input type="text" className="form-control" placeholder="e.g. Courier charges" value={otherForm.cost_details} onChange={e => setOtherForm({ ...otherForm, cost_details: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount * (Float)</label>
                    <input type="number" step="0.01" className="form-control" value={otherForm.amount} onChange={e => setOtherForm({ ...otherForm, amount: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <button type="button" className="btn btn-primary" onClick={() => {
                    if (!otherForm.cost_details.trim()) return alert("Cost Details is required");
                    setOtherCostRows([...otherCostRows, { ...otherForm }]);
                    
                    // Reset
                    setOtherForm({
                      cost_details: '',
                      amount: 0
                    });
                  }}>Add Other Cost Row</button>
                </div>
              </div>

              {/* Added Other Cost Rows Table */}
              <h4 style={{ color: '#1e293b', fontWeight: 'bold', marginBottom: '10px' }}>Added Other Costs List</h4>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Cost Details</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {otherCostRows.map((o, idx) => (
                    <tr key={idx}>
                      <td>{o.cost_details}</td>
                      <td><strong>${o.amount?.toFixed(2)}</strong></td>
                      <td>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOtherCostRows(otherCostRows.filter((_, i) => i !== idx))}>Remove</button>
                      </td>
                    </tr>
                  ))}
                  {otherCostRows.length === 0 && (
                    <tr><td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>No other costs added yet. Use the form above to add lines.</td></tr>
                  )}
                </tbody>
              </table>

              {/* Summary and Apply */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', background: '#f1f5f9', padding: '15px', borderRadius: '6px' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#334155' }}>Total Other Cost:</span>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f766e' }}>
                  ${otherCostRows.reduce((sum, o) => sum + o.amount, 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid #cbd5e1', paddingTop: '15px', textAlign: 'right' }}>
              <button className="btn btn-secondary" onClick={() => setShowOtherBrowsePopup(false)} style={{ marginRight: '8px' }}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                const totalAmt = otherCostRows.reduce((sum, o) => sum + o.amount, 0);
                handleCostChange('other_cost', totalAmt);
                setShowOtherBrowsePopup(false);
              }}>Apply Other Cost</button>
            </div>
          </div>
        </div>
      )}

      {showTransportBrowsePopup && (
        <div className="modal-overlay" style={{ zIndex: 1050 }}>
          <div className="modal-content" style={{ width: '800px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>Detailed Transport Costing Specifications</h2>
              <button className="modal-close" onClick={() => setShowTransportBrowsePopup(false)}>×</button>
            </div>
            
            <div className="modal-body">
              {/* Template Selector */}
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: '#f1f5f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <span style={{ fontWeight: 'bold', color: '#334155' }}>Template Options:</span>
                <select className="form-control" style={{ width: '220px' }} onChange={e => handleLoadTransportTemplate(e.target.value)}>
                  <option value="">-- Load Saved Template --</option>
                  {savedTransportTemplates.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                </select>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Template Name to Save" 
                  style={{ width: '220px' }} 
                  value={transportTemplateName} 
                  onChange={e => setTransportTemplateName(e.target.value)} 
                />
                <button className="btn btn-primary" onClick={handleSaveTransportTemplate}>Save Template</button>
              </div>

              {/* Form to Add Transport Cost Row */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
                <h4 style={{ color: '#1e293b', fontWeight: 'bold', marginBottom: '15px' }}>Add Transport Cost Line</h4>
                
                <div className="grid-3" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Rate * (Float)</label>
                    <input type="number" step="0.01" className="form-control" value={transportForm.rate} onChange={e => {
                      const r = parseFloat(e.target.value) || 0;
                      setTransportForm({ ...transportForm, rate: r, amount: r * transportForm.cbm });
                    }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CBM * (Float)</label>
                    <input type="number" step="0.01" className="form-control" value={transportForm.cbm} onChange={e => {
                      const c = parseFloat(e.target.value) || 0;
                      setTransportForm({ ...transportForm, cbm: c, amount: transportForm.rate * c });
                    }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Amount * (Auto Fillup)</label>
                    <input type="number" className="form-control" value={transportForm.amount.toFixed(2)} disabled style={{ background: '#f1f5f9' }} />
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <button type="button" className="btn btn-primary" onClick={() => {
                    if (transportForm.rate <= 0 || transportForm.cbm <= 0) return alert("Rate and CBM must be greater than 0");
                    setTransportCostRows([...transportCostRows, { ...transportForm }]);
                    
                    // Reset
                    setTransportForm({
                      rate: 0,
                      cbm: 0,
                      amount: 0
                    });
                  }}>Add Transport Cost Row</button>
                </div>
              </div>

              {/* Added Transport Cost Rows Table */}
              <h4 style={{ color: '#1e293b', fontWeight: 'bold', marginBottom: '10px' }}>Added Transport Costs List</h4>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rate</th>
                    <th>CBM</th>
                    <th>Total Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transportCostRows.map((t, idx) => (
                    <tr key={idx}>
                      <td>${t.rate?.toFixed(2)}</td>
                      <td>{t.cbm?.toFixed(2)} CBM</td>
                      <td><strong>${t.amount?.toFixed(2)}</strong></td>
                      <td>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setTransportCostRows(transportCostRows.filter((_, i) => i !== idx))}>Remove</button>
                      </td>
                    </tr>
                  ))}
                  {transportCostRows.length === 0 && (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>No transport costs added yet. Use the form above to add lines.</td></tr>
                  )}
                </tbody>
              </table>

              {/* Summary and Apply */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', background: '#f1f5f9', padding: '15px', borderRadius: '6px' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#334155' }}>Total Transport Cost:</span>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f766e' }}>
                  ${transportCostRows.reduce((sum, r) => sum + r.amount, 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid #cbd5e1', paddingTop: '15px', textAlign: 'right' }}>
              <button className="btn btn-secondary" onClick={() => setShowTransportBrowsePopup(false)} style={{ marginRight: '8px' }}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                const totalAmt = transportCostRows.reduce((sum, r) => sum + r.amount, 0);
                handleCostChange('transport_cost', totalAmt);
                setShowTransportBrowsePopup(false);
              }}>Apply Transport Cost</button>
            </div>
          </div>
        </div>
      )}

      {showConsBrowseModal && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div className="modal-content" style={{ width: '800px', maxWidth: '90vw' }}>
            <div className="modal-header">
              <h3>Consumption Breakdown Specs</h3>
              <button className="modal-close" onClick={() => setShowConsBrowseModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '15px' }}>
                <div className="grid-3" style={{ marginBottom: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Gmts Size (Text)</label>
                    <input type="text" className="form-control" value={cSize} onChange={e => setCSize(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">LAB Dip No (Text)</label>
                    <input type="text" className="form-control" value={cLabDip} onChange={e => setCLabDip(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quantity * (Integer)</label>
                    <input type="number" className="form-control" value={cQty} onChange={e => setCQty(parseInt(e.target.value) || 0)} />
                  </div>
                </div>

                <div className="grid-3" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Dia * (Integer)</label>
                    <input type="number" className="form-control" value={cDia} onChange={e => setCDia(parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cons * (Float)</label>
                    <input type="number" className="form-control" step="0.01" value={cConsVal} onChange={e => setCConsVal(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Process Loss (Float)</label>
                    <input type="number" className="form-control" step="0.01" value={cLoss} onChange={e => setCLoss(parseFloat(e.target.value) || 0)} />
                  </div>
                </div>

                <div className="grid-3" style={{ marginBottom: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Requirement (Auto)</label>
                    <input type="number" className="form-control" value={parseFloat((cConsVal + cLoss).toFixed(3))} disabled style={{ background: '#f1f5f9' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rate * (Float)</label>
                    <input type="number" className="form-control" step="0.01" value={cRate} onChange={e => setCRate(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount (Auto)</label>
                    <input type="number" className="form-control" value={parseFloat(((cConsVal + cLoss) * cRate).toFixed(3))} disabled style={{ background: '#f1f5f9' }} />
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => {
                    const req = cConsVal + cLoss;
                    const amt = req * cRate;
                    setConsRows([...consRows, {
                      size: cSize,
                      lab_dip: cLabDip,
                      qty: cQty,
                      dia: cDia,
                      cons: cConsVal,
                      loss: cLoss,
                      req: req,
                      rate: cRate,
                      amount: amt
                    }]);
                    setCSize('');
                  }}>Add Line</button>
                </div>
              </div>

              <table className="data-table" style={{ fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Lab Dip</th>
                    <th>Qty</th>
                    <th>Dia</th>
                    <th>Cons</th>
                    <th>Loss</th>
                    <th>Req</th>
                    <th>Rate</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {consRows.map((r, idx) => (
                    <tr key={idx}>
                      <td>{r.size}</td>
                      <td>{r.lab_dip}</td>
                      <td>{r.qty}</td>
                      <td>{r.dia}</td>
                      <td>{r.cons}</td>
                      <td>{r.loss}</td>
                      <td>{r.req?.toFixed(3)}</td>
                      <td>${r.rate}</td>
                      <td>${r.amount?.toFixed(2)}</td>
                      <td>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setConsRows(consRows.filter((_, i) => i !== idx))}>Remove</button>
                      </td>
                    </tr>
                  ))}
                  {consRows.length > 0 && (
                    <>
                      <tr style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
                        <td colSpan={2}>Total Sum</td>
                        <td>{consRows.reduce((sum, r) => sum + r.qty, 0)}</td>
                        <td>{consRows.reduce((sum, r) => sum + r.dia, 0)}</td>
                        <td>{consRows.reduce((sum, r) => sum + r.cons, 0).toFixed(2)}</td>
                        <td>{consRows.reduce((sum, r) => sum + r.loss, 0).toFixed(2)}</td>
                        <td>{consRows.reduce((sum, r) => sum + r.req, 0).toFixed(2)}</td>
                        <td>${consRows.reduce((sum, r) => sum + r.rate, 0).toFixed(2)}</td>
                        <td>${consRows.reduce((sum, r) => sum + r.amount, 0).toFixed(2)}</td>
                        <td></td>
                      </tr>
                      <tr style={{ background: '#e2e8f0', fontWeight: 'bold' }}>
                        <td colSpan={2}>Average</td>
                        <td>-</td>
                        <td>{(consRows.reduce((sum, r) => sum + r.dia, 0) / consRows.length).toFixed(1)}</td>
                        <td>{(consRows.reduce((sum, r) => sum + r.cons, 0) / consRows.length).toFixed(3)}</td>
                        <td>{(consRows.reduce((sum, r) => sum + r.loss, 0) / consRows.length).toFixed(3)}</td>
                        <td>{(consRows.reduce((sum, r) => sum + r.req, 0) / consRows.length).toFixed(3)}</td>
                        <td>${(consRows.reduce((sum, r) => sum + r.rate, 0) / consRows.length).toFixed(2)}</td>
                        <td>${(consRows.reduce((sum, r) => sum + r.amount, 0) / consRows.length).toFixed(2)}</td>
                        <td></td>
                      </tr>
                    </>
                  )}
                  {consRows.length === 0 && (
                    <tr><td colSpan={10} style={{ textAlign: 'center' }}>No consumption items added</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid #cbd5e1', paddingTop: '15px', textAlign: 'right' }}>
              <button className="btn btn-secondary" onClick={() => setShowConsBrowseModal(false)} style={{ marginRight: '8px' }}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                if (consRows.length === 0) return alert("Add at least one line of consumption data");
                const avgCons = consRows.reduce((sum, r) => sum + r.req, 0) / consRows.length;
                const avgRate = consRows.reduce((sum, r) => sum + r.rate, 0) / consRows.length;
                
                setFabForm(prev => ({
                  ...prev,
                  rate: parseFloat(avgRate.toFixed(2)),
                  amount: parseFloat((avgCons * avgRate).toFixed(2))
                }));
                setShowConsBrowseModal(false);
              }}>Apply Consumption</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuotationModule({ buyers }: { buyers: any[] }) {
  const [activeSubTab, setActiveSubTab] = useState('buyer_inquiry');

  return (
    <div className="quotation-module">
      <div className="sub-navbar" style={{ display: 'flex', gap: '15px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px' }}>
        <button 
          className={`btn ${activeSubTab === 'buyer_inquiry' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('buyer_inquiry')}
          style={{ fontSize: '15px', padding: '10px 20px', fontWeight: 'bold' }}
        >
          Buyer Inquiry
        </button>
        <button 
          className={`btn ${activeSubTab === 'price_quotation' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('price_quotation')}
          style={{ fontSize: '15px', padding: '10px 20px', fontWeight: 'bold' }}
        >
          Price Quotation
        </button>
      </div>

      <div className="quotation-content">
        {activeSubTab === 'buyer_inquiry' && <InquiryView buyers={buyers} />}
        {activeSubTab === "price_quotation" && <PriceQuotationView buyers={buyers} />}
      </div>
    </div>
  );
}

// ==========================================================================
// SUB-VIEW: Quotation Inquiry (Includes ALL spreadsheet fields)
// ==========================================================================
function InquiryView({ buyers }: { buyers: any[] }) {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [simRole, setSimRole] = useState('Merchandiser');
  
  // Fabric List & Yarn List
  const [fabricsList, setFabricsList] = useState<any[]>([]);
  const [yarnsList, setYarnsList] = useState<any[]>([]);
  const [itemsMaster, setItemsMaster] = useState<any[]>([]);

  const stylesByCompany: Record<string, Array<{style_no: string, buyer_id: string, item_group: string, brand: string}>> = {
    'Demo Factory Ltd.': [
      { style_no: 'test', buyer_id: '', item_group: 'Fashion', brand: 'NewYorker' },
      { style_no: 'Style-1001', buyer_id: '', item_group: 'Basic', brand: 'Zara' }
    ],
    'Metamorphosis Apparels': [
      { style_no: 'Style-2002', buyer_id: '', item_group: 'Casual Basic', brand: 'H&M' },
      { style_no: 'Style-3003', buyer_id: '', item_group: 'Basic', brand: 'Zara' }
    ]
  };

  const teamLeaders = ["Demo User", "John Doe", "Jane Smith", "Ken Tanaka"];
  const merchantsByLeader: Record<string, string[]> = {
    "Demo User": ["Mahade Hasan", "Tariqul Islam"],
    "John Doe": ["Alice Johnson", "Bob Brown"],
    "Jane Smith": ["Charlie Green", "David White"],
    "Ken Tanaka": ["Taro Yamada", "Yuki Sato"]
  };

  const [form, setForm] = useState({
    buyer_id: '',
    style_no: '',
    style_desc: '',
    item_group: 'Basic',
    garments_item: '',
    brand: '',
    year: new Date().getFullYear(),
    season: '',
    team_leader: '',
    dealing_merchant: '',
    inquiry_date: new Date().toISOString().split('T')[0],
    sub_date: '',
    ship_date: '',
    offer_qty: 0,
    uom: 'Pcs',
    costing_per: '1 Dzn',
    department: 'Kids',
    sample_req: 'No',
    remarks: '',
    image_url: '',
    company: 'Demo Factory Ltd.',
    quoted_by: 'Super admin',
    status: 'Draft'
  });

  // Subform inputs
  const [composition, setComposition] = useState('');
  const [fabricType, setFabricType] = useState('');
  const [gsm, setGsm] = useState(160);
  const [dia, setDia] = useState(60);
  const [diaType, setDiaType] = useState('Open');
  const [fabricUom, _setFabricUom] = useState('Kg');
  const [fabricRate, setFabricRate] = useState(5.5);
  const [requiredQty, setRequiredQty] = useState(0);

  const [yarnComposition, setYarnComposition] = useState('');
  const [yarnCount, setYarnCount] = useState('30s');
  const [yarnType, setYarnType] = useState('Combed');
  const [yarnCert, setYarnCert] = useState('GOTS');

  useEffect(() => {
    fetchInquiries();
    fetchItemsMaster();
  }, []);

  const fetchItemsMaster = async () => {
    try {
      const res = await fetch(`${API_BASE}/items`);
      const data = await res.json();
      setItemsMaster(data);
    } catch (e) { console.error(e); }
  };

  const handleStyleChange = (selectedStyleNo: string) => {
    if (selectedStyleNo === 'custom_style') {
      setForm(f => ({ ...f, style_no: 'custom_style' }));
      return;
    }
    const companyStyles = stylesByCompany[form.company] || [];
    const styleObj = companyStyles.find(s => s.style_no === selectedStyleNo);
    if (styleObj) {
      const foundBuyer = buyers.find(b => b.name.toLowerCase() === styleObj.brand.toLowerCase());
      const buyerIdVal = foundBuyer ? foundBuyer.id.toString() : '';
      const seasonVal = foundBuyer ? foundBuyer.season : '';
      
      setForm(f => ({
        ...f,
        style_no: selectedStyleNo,
        buyer_id: buyerIdVal,
        item_group: styleObj.item_group,
        brand: styleObj.brand,
        season: seasonVal
      }));
    } else {
      setForm(f => ({ ...f, style_no: selectedStyleNo }));
    }
  };

  const fetchInquiries = async () => {
    try {
      const res = await fetch(`${API_BASE}/inquiries`);
      const data = await res.json();
      setInquiries(data);
    } catch (e) { console.error(e); }
  };

  const handleAddFabricLine = () => {
    if (!composition || !fabricType) return alert("Fill up Fabric details composition and type.");
    setFabricsList([...fabricsList, {
      composition, fabric_type: fabricType, gsm, dia, dia_type: diaType, uom: fabricUom, rate: fabricRate, required_qty: requiredQty
    }]);
    setComposition('');
    setFabricType('');
  };

  const handleAddYarnLine = () => {
    if (!yarnComposition) return alert("Fill up Yarn composition.");
    setYarnsList([...yarnsList, {
      composition: form.style_no, yarn_composition: yarnComposition, yarn_count: yarnCount, yarn_type: yarnType, certification: yarnCert
    }]);
    setYarnComposition('');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.buyer_id || !form.style_no) {
      alert("Buyer and Style No are required fields.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, fabrics: fabricsList, yarns: yarnsList })
      });
      if (res.ok) {
        setShowModal(false);
        fetchInquiries();
        setFabricsList([]);
        setYarnsList([]);
        setForm({
          buyer_id: '',
          style_no: '',
          style_desc: '',
          item_group: 'Basic',
          garments_item: '',
          brand: '',
          year: new Date().getFullYear(),
          season: '',
          team_leader: '',
          dealing_merchant: '',
          inquiry_date: new Date().toISOString().split('T')[0],
          sub_date: '',
          ship_date: '',
          offer_qty: 0,
          uom: 'Pcs',
          costing_per: '1 Dzn',
          department: 'Kids',
          sample_req: 'No',
          remarks: '',
          image_url: '',
          company: 'Demo Factory Ltd.',
          quoted_by: 'Super admin',
          status: 'Draft'
        });
      }
    } catch (e) { console.error(e); }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${API_BASE}/inquiries/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchInquiries();
    } catch (e) { console.error(e); }
  };

  const handleApproveInquiry = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/inquiries/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved_by: 'Supervisor' })
      });
      if (res.ok) fetchInquiries();
    } catch (e) { console.error(e); }
  };

  const handleViewDetails = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/inquiries/${id}`);
      const data = await res.json();
      setSelectedInquiry(data);
    } catch (e) { console.error(e); }
  };

  if (selectedInquiry) {
    const buyerObj = buyers.find(b => b.id.toString() === selectedInquiry.buyer_id?.toString());
    const buyerName = selectedInquiry.buyer_name || buyerObj?.name || 'NewYorker';
    const inqYear = selectedInquiry.year || (selectedInquiry.inquiry_date ? new Date(selectedInquiry.inquiry_date).getFullYear() : '2026');
    const fabricsRate = selectedInquiry.fabrics && selectedInquiry.fabrics[0] ? selectedInquiry.fabrics[0].rate : 0.30;
    const tentativeVal = selectedInquiry.offer_qty * fabricsRate;

    return (
      <div className="dashboard-card" style={{ padding: '25px', background: '#fff', borderRadius: '8px' }}>
        {/* Header Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #cbd5e1', paddingBottom: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>Quotation Inquiry</h2>
          <button className="btn btn-secondary" onClick={() => setSelectedInquiry(null)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', fontWeight: '600' }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button className="btn btn-success" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#22c55e', borderColor: '#22c55e', color: '#fff', fontWeight: '600' }}>
            <Download size={16} /> Download
          </button>
          <button className="btn btn-danger" onClick={() => alert("Generating PDF Report...")} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ef4444', borderColor: '#ef4444', color: '#fff', padding: '10px 14px' }}>
            <FileText size={16} />
          </button>
        </div>

        {/* 3-column Grid Information Table */}
        <div className="table-wrapper" style={{ marginBottom: '30px', overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', fontSize: '13px' }}>
            <tbody>
              {/* Row 1 */}
              <tr>
                <td style={{ background: '#f8fafc', fontWeight: 'bold', border: '1px solid #cbd5e1', padding: '10px', width: '15%', color: '#334155' }}>Inquiry ID</td>
                <td style={{ background: '#e0f2fe', border: '1px solid #cbd5e1', padding: '10px', width: '18%', fontWeight: '600', color: '#0369a1' }}>{selectedInquiry.id}</td>
                <td style={{ background: '#f8fafc', fontWeight: 'bold', border: '1px solid #cbd5e1', padding: '10px', width: '15%', color: '#334155' }}>Company Name</td>
                <td style={{ background: '#e0f2fe', border: '1px solid #cbd5e1', padding: '10px', width: '18%', fontWeight: '600', color: '#0369a1' }}>{selectedInquiry.company || 'Demo Factory Ltd.'}</td>
                <td style={{ background: '#f8fafc', fontWeight: 'bold', border: '1px solid #cbd5e1', padding: '10px', width: '15%', color: '#334155' }}>Buyer Name</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '10px', width: '19%', color: '#334155' }}>{buyerName}</td>
              </tr>
              {/* Row 2 */}
              <tr>
                <td style={{ background: '#f8fafc', fontWeight: 'bold', border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>Style ID</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>{selectedInquiry.style_no}</td>
                <td style={{ background: '#f8fafc', fontWeight: 'bold', border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>Style Description</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>{selectedInquiry.style_desc || ''}</td>
                <td style={{ background: '#f8fafc', fontWeight: 'bold', border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>Garment Item</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>{selectedInquiry.garments_item}</td>
              </tr>
              {/* Row 3 */}
              <tr>
                <td style={{ background: '#f8fafc', fontWeight: 'bold', border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>Season</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>{selectedInquiry.season}</td>
                <td style={{ background: '#f8fafc', fontWeight: 'bold', border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>Inquiry Date</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>{selectedInquiry.inquiry_date}</td>
                <td style={{ background: '#f8fafc', fontWeight: 'bold', border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>Quantity</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>{selectedInquiry.offer_qty}</td>
              </tr>
              {/* Row 4 */}
              <tr>
                <td style={{ background: '#f8fafc', fontWeight: 'bold', border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>Year</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>{inqYear}</td>
                <td style={{ background: '#f8fafc', fontWeight: 'bold', border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>Tentative Unit Price</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>{selectedInquiry.tentative_price || fabricsRate}</td>
                <td style={{ background: '#f8fafc', fontWeight: 'bold', border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>Tentative Value</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>{tentativeVal.toLocaleString()}</td>
              </tr>
              {/* Row 5 */}
              <tr>
                <td style={{ background: '#f8fafc', fontWeight: 'bold', border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>Team Lead</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>{selectedInquiry.team_leader}</td>
                <td style={{ background: '#f8fafc', fontWeight: 'bold', border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>Dealing Merchant</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>{selectedInquiry.dealing_merchant}</td>
                <td style={{ background: '#f8fafc', fontWeight: 'bold', border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>Quotation Submission Date</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>{selectedInquiry.sub_date}</td>
              </tr>
              {/* Row 6 */}
              <tr>
                <td style={{ background: '#f8fafc', fontWeight: 'bold', border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>Required Sample</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>{selectedInquiry.sample_req}</td>
                <td style={{ background: '#f8fafc', fontWeight: 'bold', border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>Tentative Shipment Date</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>{selectedInquiry.ship_date}</td>
                <td style={{ background: '#f8fafc', fontWeight: 'bold', border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>Costing Per</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>{selectedInquiry.costing_per}</td>
              </tr>
              {/* Row 7 */}
              <tr>
                <td style={{ background: '#f8fafc', fontWeight: 'bold', border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>Remarks</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>{selectedInquiry.remarks}</td>
                <td style={{ background: '#f8fafc', fontWeight: 'bold', border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>Prepared By</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '10px', color: '#334155' }}>{selectedInquiry.quoted_by || 'Super admin'}</td>
                <td style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '10px' }}></td>
                <td style={{ border: '1px solid #cbd5e1', padding: '10px' }}></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Side-by-Side Specifications Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Fabric Specifications */}
          <div>
            <h3 style={{ marginBottom: '10px', fontSize: '15px', fontWeight: 'bold', color: '#1e293b' }}>Fabric Details</h3>
            <div className="table-wrapper">
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'left', color: '#334155' }}>Fabric Composition</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'left', color: '#334155' }}>Fabric Type</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'left', color: '#334155' }}>Fabric GSM/OZ</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'left', color: '#334155' }}>Dia</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'left', color: '#334155' }}>UOM</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'left', color: '#334155' }}>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInquiry.fabrics && selectedInquiry.fabrics.length > 0 ? (
                    selectedInquiry.fabrics.map((f: any, i: number) => (
                      <tr key={i}>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px', color: '#334155' }}>{f.composition}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px', color: '#334155' }}>{f.fabric_type}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px', color: '#334155' }}>{f.gsm}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px', color: '#334155' }}>{f.dia}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px', color: '#334155' }}>{f.uom}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px', color: '#334155' }}>{f.rate}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center', color: '#64748b' }}>No fabric details available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Yarn Specifications */}
          <div>
            <h3 style={{ marginBottom: '10px', fontSize: '15px', fontWeight: 'bold', color: '#1e293b' }}>Yarn Details</h3>
            <div className="table-wrapper">
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'left', color: '#334155' }}>Fabric Composition</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'left', color: '#334155' }}>Yarn Composition</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'left', color: '#334155' }}>Yarn Count</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'left', color: '#334155' }}>Yarn Type</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'left', color: '#334155' }}>Certification</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInquiry.yarns && selectedInquiry.yarns.length > 0 ? (
                    selectedInquiry.yarns.map((y: any, i: number) => (
                      <tr key={i}>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px', color: '#334155' }}>{y.composition}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px', color: '#334155' }}>{y.yarn_composition}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px', color: '#334155' }}>{y.yarn_count}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px', color: '#334155' }}>{y.yarn_type}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '8px', color: '#334155' }}>{y.certification}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center', color: '#64748b' }}>No yarn details available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div className="card-header" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h2 className="card-title"><HelpCircle /> Quotation Inquiries</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ fontWeight: 'bold' }}>Simulate Role:</label>
            <select className="form-control" style={{ width: 'auto' }} value={simRole} onChange={(e) => setSimRole(e.target.value)}>
              <option value="Merchandiser">Merchandiser</option>
              <option value="Merchandising Manager">Merchandising Manager</option>
            </select>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Add Inquiry Log
            </button>
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table" style={{ whiteSpace: 'nowrap' }}>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Buyer</th>
              <th>Style</th>
              <th>Garments Item</th>
              <th>Garments Item Group</th>
              <th>Brand</th>
              <th>Season</th>
              <th>Fabric Type</th>
              <th>Fabric Composition</th>
              <th>GSM</th>
              <th>Dia</th>
              <th>Offer Qty</th>
              <th>Order UOM</th>
              <th>Inquiry Date</th>
              <th>Tentative Shipment Date</th>
              <th>Year</th>
              <th>Approval Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inq, idx) => (
              <tr key={idx}>
                <td><strong>{inq.id}</strong></td>
                <td>{inq.buyer_name}</td>
                <td>{inq.style_no}</td>
                <td>{inq.garments_item}</td>
                <td>{inq.item_group}</td>
                <td>{inq.brand}</td>
                <td>{inq.season}</td>
                <td>{inq.fabric_type || '-'}</td>
                <td>{inq.fabric_composition || '-'}</td>
                <td>{inq.gsm || '-'}</td>
                <td>{inq.dia || '-'}</td>
                <td>{inq.offer_qty}</td>
                <td>{inq.uom}</td>
                <td>{inq.inquiry_date}</td>
                <td>{inq.ship_date}</td>
                <td>{inq.year}</td>
                <td>
                  <span className={`badge badge-${inq.status.toLowerCase().replace(' ', '-')}`}>{inq.status}</span>
                </td>
                <td>
                  <div className="d-flex gap-10">
                    <button className="btn btn-secondary btn-sm" onClick={() => handleViewDetails(inq.id)}>
                      <Eye size={12} /> View
                    </button>
                    {simRole === 'Merchandiser' && inq.status === 'Draft' && (
                      <button className="btn btn-primary btn-sm" onClick={() => handleUpdateStatus(inq.id, 'Pending Approval')}>
                        Submit to Manager
                      </button>
                    )}
                    {simRole === 'Merchandising Manager' && inq.status === 'Pending Approval' && (
                      <button className="btn btn-success btn-sm" onClick={() => handleUpdateStatus(inq.id, 'Approved')}>
                        Approve
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '850px' }}>
            <div className="modal-header">
              <h3>Create CRM Quotation Inquiry Log</h3>
              <XCircle className="modal-close" onClick={() => setShowModal(false)} />
            </div>
            
            <form onSubmit={handleCreate}>
              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <select 
                    className="form-control" 
                    value={form.company} 
                    onChange={e => {
                      const comp = e.target.value;
                      setForm({ ...form, company: comp, style_no: '', buyer_id: '', brand: '', season: '', item_group: 'Basic' });
                    }} 
                    required
                  >
                    <option value="Demo Factory Ltd.">Demo Factory Ltd.</option>
                    <option value="Metamorphosis Apparels">Metamorphosis Apparels</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Style ID * (From Master)</label>
                  <select 
                    className="form-control" 
                    value={form.style_no} 
                    onChange={e => handleStyleChange(e.target.value)} 
                    required
                  >
                    <option value="">Select Style ID</option>
                    {(stylesByCompany[form.company] || []).map(s => (
                      <option key={s.style_no} value={s.style_no}>{s.style_no}</option>
                    ))}
                    <option value="custom_style">+ Custom Style ID</option>
                  </select>
                </div>
                {form.style_no === 'custom_style' || (!(stylesByCompany[form.company] || []).map(s => s.style_no).includes(form.style_no) && form.style_no) ? (
                  <div className="form-group">
                    <label className="form-label">Custom Style ID Name *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Type custom style ID..."
                      value={form.style_no === 'custom_style' ? '' : form.style_no}
                      onChange={e => setForm({ ...form, style_no: e.target.value })}
                      required
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Style Description</label>
                    <input type="text" className="form-control" value={form.style_desc} onChange={e => setForm({ ...form, style_desc: e.target.value })} placeholder="Style description..." />
                  </div>
                )}
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Buyer * (User Assigned)</label>
                  <select 
                    className="form-control" 
                    value={form.buyer_id} 
                    onChange={e => {
                      const bid = e.target.value;
                      const b = buyers.find(buyer => buyer.id.toString() === bid);
                      setForm({ ...form, buyer_id: bid, season: b ? b.season : form.season });
                    }} 
                    required
                  >
                    <option value="">Select Buyer</option>
                    {/* User wise validation: Currently logged-in user can access all buyers */}
                    {buyers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Garment Item Group *</label>
                  <select className="form-control" value={form.item_group} onChange={e => setForm({ ...form, item_group: e.target.value })}>
                    <option value="Basic">Basic</option>
                    <option value="Casual Basic">Casual Basic</option>
                    <option value="Fashion">Fashion</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input type="text" className="form-control" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Zara Kids" />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Year *</label>
                  <select className="form-control" value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) })}>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Season * (Auto from Buyer)</label>
                  <input type="text" className="form-control" value={form.season} onChange={e => setForm({ ...form, season: e.target.value })} placeholder="Auto-populated or type season..." required />
                </div>
                <div className="form-group">
                  <label className="form-label">Team Leader *</label>
                  <select 
                    className="form-control" 
                    value={form.team_leader} 
                    onChange={e => {
                      const leader = e.target.value;
                      const merchants = merchantsByLeader[leader] || [];
                      setForm({ ...form, team_leader: leader, dealing_merchant: merchants[0] || '' });
                    }}
                    required
                  >
                    <option value="">Select Team Leader</option>
                    {teamLeaders.map(leader => (
                      <option key={leader} value={leader}>{leader}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Dealing Merchant *</label>
                  <select 
                    className="form-control" 
                    value={form.dealing_merchant} 
                    onChange={e => setForm({ ...form, dealing_merchant: e.target.value })}
                    required
                  >
                    <option value="">Select Dealing Merchant</option>
                    {(merchantsByLeader[form.team_leader] || []).map(merchant => (
                      <option key={merchant} value={merchant}>{merchant}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Inquiry Date *</label>
                  <input type="date" className="form-control" value={form.inquiry_date} onChange={e => setForm({ ...form, inquiry_date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Quotation Submission Date *</label>
                  <input type="date" className="form-control" value={form.sub_date} onChange={e => setForm({ ...form, sub_date: e.target.value })} required />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Tentative Shipment Date</label>
                  <input type="date" className="form-control" value={form.ship_date} onChange={e => setForm({ ...form, ship_date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Offer Qty *</label>
                  <input type="number" className="form-control" value={form.offer_qty} onChange={e => setForm({ ...form, offer_qty: parseInt(e.target.value) || 0 })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Order UOM *</label>
                  <select className="form-control" value={form.uom} onChange={e => setForm({ ...form, uom: e.target.value })}>
                    <option value="Pcs">Pcs</option>
                    <option value="Set">Set</option>
                    <option value="Pack">Pack</option>
                  </select>
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Costing Per</label>
                  <select className="form-control" value={form.costing_per} onChange={e => setForm({ ...form, costing_per: e.target.value })}>
                    <option value="1 Pcs">1 Pcs</option>
                    <option value="1 Dzn">1 Dzn</option>
                    <option value="2 Dzn">2 Dzn</option>
                    <option value="3 Dzn">3 Dzn</option>
                    <option value="4 Dzn">4 Dzn</option>
                    <option value="1 Pack">1 Pack</option>
                    <option value="1 Set">1 Set</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Item Department</label>
                  <select className="form-control" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                    <option value="Kids">Kids</option>
                    <option value="Ladies">Ladies</option>
                    <option value="Mens">Mens</option>
                    <option value="Boys">Boys</option>
                    <option value="Girls">Girls</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Required Sample</label>
                  <select className="form-control" value={form.sample_req} onChange={e => setForm({ ...form, sample_req: e.target.value })}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Garments Item * (Multiple Selection from Master)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '4px', maxHeight: '110px', overflowY: 'auto' }}>
                    {itemsMaster.map(item => {
                      const isChecked = form.garments_item.split(', ').includes(item.item_name);
                      return (
                        <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '12px', userSelect: 'none' }}>
                          <input 
                            type="checkbox" 
                            checked={isChecked} 
                            onChange={(e) => {
                              let currentItems = form.garments_item ? form.garments_item.split(', ') : [];
                              if (e.target.checked) {
                                if (!currentItems.includes(item.item_name)) {
                                  currentItems.push(item.item_name);
                                }
                              } else {
                                currentItems = currentItems.filter(x => x !== item.item_name);
                              }
                              setForm({ ...form, garments_item: currentItems.join(', ') });
                            }}
                          />
                          {item.item_name}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Upload Image / File</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px dashed #cbd5e1' }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                      id="inquiry-image-upload" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setForm({ ...form, image_url: file.name });
                          alert(`File "${file.name}" uploaded successfully!`);
                        }
                      }}
                    />
                    <label htmlFor="inquiry-image-upload" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0, textAlign: 'center' }}>
                      Browse File
                    </label>
                    {form.image_url ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#e6fffa', padding: '4px 8px', borderRadius: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#00695c', fontWeight: 'bold', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '130px' }}>
                          ✓ {form.image_url}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => setForm({ ...form, image_url: '' })}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                          title="Delete File"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>No file uploaded</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Quoted By (Automatic)</label>
                  <input type="text" className="form-control" value={form.quoted_by} disabled style={{ background: '#f1f5f9', cursor: 'not-allowed' }} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Remarks</label>
                  <input type="text" className="form-control" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} placeholder="General remarks..." />
                </div>
              </div>

              {/* Grid sections */}
              <div className="grid-2 mt-20" style={{ borderTop: '1px solid var(--border-muted)', paddingTop: '20px' }}>
                <div>
                  <h4 style={{ marginBottom: '10px' }}>Fabric Details Table</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Fabric Composition *</label>
                      <input type="text" className="form-control" value={composition} onChange={e => setComposition(e.target.value)} placeholder="e.g. 100% Cotton" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Fabric Type *</label>
                      <input type="text" className="form-control" value={fabricType} onChange={e => setFabricType(e.target.value)} placeholder="e.g. Single Jersey" />
                    </div>
                  </div>
                  <div className="grid-3">
                    <div className="form-group">
                      <label className="form-label">GSM/OZ</label>
                      <input type="number" className="form-control" value={gsm} onChange={e => setGsm(parseInt(e.target.value) || 0)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Dia</label>
                      <input type="number" className="form-control" value={dia} onChange={e => setDia(parseInt(e.target.value) || 0)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Dia Type</label>
                      <input type="text" className="form-control" value={diaType} onChange={e => setDiaType(e.target.value)} placeholder="Open/Tubular" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Rate</label>
                      <input type="number" className="form-control" value={fabricRate} onChange={e => setFabricRate(parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Required Qty</label>
                      <input type="number" className="form-control" value={requiredQty} onChange={e => setRequiredQty(parseFloat(e.target.value) || 0)} />
                    </div>
                  </div>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddFabricLine}>Add Fabric Line</button>

                  <div className="table-wrapper mt-20" style={{ maxHeight: '120px' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Comp</th>
                          <th>Type</th>
                          <th>Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fabricsList.map((f, i) => (
                          <tr key={i}>
                            <td>{f.composition}</td>
                            <td>{f.fabric_type}</td>
                            <td>{f.required_qty} kg</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 style={{ marginBottom: '10px' }}>Yarn Details Table</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Yarn Composition *</label>
                      <input type="text" className="form-control" value={yarnComposition} onChange={e => setYarnComposition(e.target.value)} placeholder="e.g. 100% Cotton Organic" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Yarn Count *</label>
                      <input type="text" className="form-control" value={yarnCount} onChange={e => setYarnCount(e.target.value)} placeholder="30s" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Yarn Type *</label>
                      <input type="text" className="form-control" value={yarnType} onChange={e => setYarnType(e.target.value)} placeholder="Combed" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Certification</label>
                      <input type="text" className="form-control" value={yarnCert} onChange={e => setYarnCert(e.target.value)} placeholder="GOTS" />
                    </div>
                  </div>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddYarnLine}>Add Yarn Line</button>

                  <div className="table-wrapper mt-20" style={{ maxHeight: '120px' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Composition</th>
                          <th>Count</th>
                          <th>Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yarnsList.map((y, i) => (
                          <tr key={i}>
                            <td>{y.yarn_composition}</td>
                            <td>{y.yarn_count}</td>
                            <td>{y.yarn_type}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="mt-20 text-right">
                <button type="button" className="btn btn-secondary mr-10" style={{ marginRight: '10px' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Save size={16} /> Save Inquiry Log</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================================================
// SUB-VIEW: Costing & Price Quotations (Includes ALL spreadsheet fields)
// ==========================================================================
function CostingView({ buyers: _buyers, items: _items }: { buyers: any[], items: any[] }) {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedInquiryId, setSelectedInquiryId] = useState('');
  const [costingTab, setCostingTab] = useState<'required' | 'others' | 'costing_grid'>('required');
  const [yarnCert, _setYarnCert] = useState('GOTS');

  // Direct Cost States
  const [fabrics, setFabrics] = useState<any[]>([]);
  const [trims, setTrims] = useState<any[]>([]);
  const [embs, setEmbs] = useState<any[]>([]);
  const [washes, setWashes] = useState<any[]>([]);

  // Other Cost Inputs
  const [desiredMargin, setDesiredMargin] = useState(5.0);
  const [commercialPct, setCommercialPct] = useState(5.0);
  const [commissionPct, setCommissionPct] = useState(0.0);
  const [totalCost, setTotalCost] = useState(0);
  const [fobDoz, setFobDoz] = useState(0);
  const [fobPc, setFobPc] = useState(0);
  const [cmDoz, setCmDoz] = useState(0);

  // Spreadsheet required costing fields
  const [sizeGroup, setSizeGroup] = useState('4-8 Years');
  const [mcLine, setMcLine] = useState(12);
  const [prodLineHour, setProdLineHour] = useState(150);
  const [sewingEfficiency, setSewingEfficiency] = useState(65);
  const [cuttingEfficiency, setCuttingEfficiency] = useState(80);
  const [finishingEfficiency, setFinishingEfficiency] = useState(85);
  const [qcEfficiency, _setQcEfficiency] = useState(90);
  const [prepEfficiency, _setPrepEfficiency] = useState(90);
  const [sizeGrading, setSizeGrading] = useState(2);
  
  // SMV Bulletins Grid
  const [smvRows, setSmvRows] = useState<any[]>([
    { item_name: 'Girls Swimming Costume', set_ratio: 1, cutting_smv: 1.5, sewing_smv: 12.0, finishing_smv: 3.0 }
  ]);
  const [bulletinGmtItem, setBulletinGmtItem] = useState('');
  const [bulletinSetRatio, setBulletinSetRatio] = useState(1);
  const [bulletinCut, setBulletinCut] = useState(0.0);
  const [bulletinSew, setBulletinSew] = useState(0.0);
  const [bulletinFin, setBulletinFin] = useState(0.0);

  // Production Yarn Costing sub-form
  const [yarnCostsList, setYarnCostsList] = useState<any[]>([]);
  const [ycComp, setYcComp] = useState('');
  const [ycCount, setYcCount] = useState('30s');
  const [ycType, setYcType] = useState('Combed');
  const [ycPct, setYcPct] = useState(100);
  const [ycColor, setYcColor] = useState('Red');
  const [ycQty, setYcQty] = useState(100);
  const [ycLoss, _setYcLoss] = useState(5);
  const [ycSupplier, _setYcSupplier] = useState('');
  const [ycRate, setYcRate] = useState(3.5);

  // Others Info Tab
  const [country, setCountry] = useState('Bangladesh');
  const [buyingAgent, setBuyingAgent] = useState('Zara Agent');
  const [buyingHouseMerchant, setBuyingHouseMerchant] = useState('Inditex Merchandiser');
  const [currency, setCurrency] = useState('USD');
  const [colorRange, setColorRange] = useState('Solid Multi');
  const [sustainableMaterial, setSustainableMaterial] = useState('BCI');
  const [garmentsCert, _setGarmentsCert] = useState('OEKOTEX');
  const [_embType, _setEmbType] = useState('Print');
  const [embName, _setEmbName] = useState('Placement Print');
  const [confirmDate, _setConfirmDate] = useState('');
  const [exchangeRate, setExchangeRate] = useState(1.0);
  const [pcsPerCarton, setPcsPerCarton] = useState(24);
  const [cbmPerCarton, setCbmPerCarton] = useState(0.08);

  // Dynamic calculations
  const [cmPctOnFob, setCmPctOnFob] = useState(0);
  const [cmcPctOnFob, setCmcPctOnFob] = useState(0);

  useEffect(() => {
    fetchQuotations();
    fetchInquiries();
  }, []);

  const getCalculatedTotalSMV = () => {
    if (smvRows.length === 0) return 1.0; // Default to 1 as per Excel spec
    return smvRows.reduce((sum, r) => sum + (parseFloat(r.cutting_smv || 0) + parseFloat(r.sewing_smv || 0) + parseFloat(r.finishing_smv || 0)), 0);
  };

  useEffect(() => {
    calculateTotalCost();
  }, [fabrics, trims, embs, washes, smvRows, desiredMargin, commercialPct, commissionPct, sewingEfficiency]);

  const fetchQuotations = async () => {
    try {
      const res = await fetch(`${API_BASE}/quotations`);
      const data = await res.json();
      setQuotations(data);
    } catch (e) { console.error(e); }
  };

  const fetchInquiries = async () => {
    try {
      const res = await fetch(`${API_BASE}/inquiries`);
      const data = await res.json();
      setInquiries(data.filter((i: any) => i.status === 'Approved' || i.status === 'Draft'));
    } catch (e) { console.error(e); }
  };

  const handleInquiryChange = async (inqId: string) => {
    setSelectedInquiryId(inqId);
    if (!inqId) return;

    try {
      const res = await fetch(`${API_BASE}/inquiries/${inqId}`);
      const data = await res.json();

      setBuyingAgent(data.brand || 'Zara Agent');
      
      // Auto-set SMV row from items Master or inquiry
      setSmvRows([
        { item_name: data.garments_item || 'Girls Swimming Costume', set_ratio: 1, cutting_smv: 1.5, sewing_smv: 12.0, finishing_smv: 3.0 }
      ]);

      if (data.fabrics) {
        const mappedFabrics = data.fabrics.map((f: any) => ({
          item_name: data.garments_item || 'Swimming Costume',
          body_part: 'Body',
          part_type: 'Shell Fabric',
          color_range: 'Solid',
          color_nature: 'Conventional',
          composition: f.composition,
          fabric_type: f.fabric_type,
          source: 'Purchase',
          supplier: 'Default Supplier',
          gsm: f.gsm,
          dia_type: f.dia_type,
          cons_basis: 'Marker',
          uom: 'Kg',
          grey_cons: 3.8, 
          rate: f.rate || 5.5,
          amount: 3.8 * (f.rate || 5.5),
          total_qty: 3.8,
          total_amount: 3.8 * (f.rate || 5.5),
          process_loss_pct: 10
        }));
        setFabrics(mappedFabrics);
      }

      setTrims([
        { item_name: 'Sewing Thread', item_desc: 'Spun Polyester', cons_uom: 'Cones', cons_unit: 1.5, extra_pct: 15, total_cons: 1.72, rate: 1.2, amount: 2.06, supplier: 'Coats' },
        { item_name: 'Buttons', item_desc: 'Plastic Button', cons_uom: 'Pcs', cons_unit: 12, extra_pct: 5, total_cons: 12.6, rate: 0.1, amount: 1.26, supplier: 'Local supplier' }
      ]);
      setEmbs([
        { emb_type: 'Print', emb_name: 'Rubber Print', item_name: 'Garment', description: 'Front print', body_part: 'Body Front', cons_unit: 12, process_loss_pct: 5, total_qty: 12.6, rate: 0.15, amount: 1.89, supplier: 'Emb Print Ltd' }
      ]);
      setWashes([
        { wash_type: 'Wash', wash_name: 'Softener Wash', item_name: 'Garment', description: 'Soft rinse', body_part: 'Full', cons_unit: 12, process_loss_pct: 2, total_qty: 12.24, rate: 0.08, amount: 0.98, supplier: 'Local Wash Co' }
      ]);
    } catch (e) { console.error(e); }
  };

  const handleAddSmvRow = () => {
    if (!bulletinGmtItem) return alert("Enter item name first.");
    setSmvRows([...smvRows, {
      item_name: bulletinGmtItem,
      set_ratio: bulletinSetRatio,
      cutting_smv: bulletinCut,
      sewing_smv: bulletinSew,
      finishing_smv: bulletinFin
    }]);
    setBulletinGmtItem('');
    setBulletinCut(0);
    setBulletinSew(0);
    setBulletinFin(0);
  };

  const handleAddYarnCostLine = () => {
    if (!ycComp) return alert("Fill composition first.");
    const totalAmount = ycQty * ycRate;
    setYarnCostsList([...yarnCostsList, {
      yarn_composition: ycComp,
      yarn_count: ycCount,
      yarn_type: ycType,
      percentage: ycPct,
      color: ycColor,
      cons_qty: ycQty,
      process_loss_pct: ycLoss,
      supplier: ycSupplier,
      rate: ycRate,
      amount: totalAmount
    }]);
    setYcComp('');
  };

  const calculateTotalCost = () => {
    const totalFabric = fabrics.reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);
    const totalTrims = trims.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const totalEmb = embs.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const totalWash = washes.reduce((sum, w) => sum + parseFloat(w.amount || 0), 0);

    const activeSMV = getCalculatedTotalSMV();
    const laborRateMin = 150 / (26 * 8 * 60); // approx $0.012/min
    const cmValue = (activeSMV * laborRateMin * 12) / (sewingEfficiency / 100);
    setCmDoz(cmValue);

    const directCost = totalFabric + totalTrims + totalEmb + totalWash + cmValue;
    setTotalCost(directCost);

    const divisor = 1 - (commercialPct / 100) - (commissionPct / 100);
    const fobPriceDoz = divisor > 0 ? (directCost + desiredMargin) / divisor : 0;
    setFobDoz(fobPriceDoz);
    
    const singleFob = fobPriceDoz / 12;
    setFobPc(singleFob);

    // Standardized CM% and CMC% calculation equations from Excel
    const computedCmPct = singleFob > 0 ? (((12 / 12) * cmValue + desiredMargin) / fobPriceDoz) * 100 : 0;
    setCmPctOnFob(computedCmPct);
    setCmcPctOnFob(commercialPct + commissionPct + computedCmPct);
  };

  const handleSaveQuotation = async () => {
    if (!selectedInquiryId) return alert("Select an Inquiry first.");
    const inquiry = inquiries.find(i => i.id === selectedInquiryId);

    const payload = {
      inquiry_id: selectedInquiryId,
      style_no: inquiry?.style_no,
      status: 'Pending',
      desired_margin: desiredMargin,
      commercial_pct: commercialPct,
      commission_pct: commissionPct,
      total_cost: totalCost,
      fob_price_doz: fobDoz,
      fob_price_pc: fobPc,
      cm_value: cmDoz,
      cmc_pct: cmcPctOnFob,
      comments: `Calculated from bulletin SMV: ${getCalculatedTotalSMV()}`,
      
      // Cost specs
      size_group: sizeGroup,
      mc_line: mcLine,
      prod_line_hour: prodLineHour,
      sewing_efficiency: sewingEfficiency,
      cutting_efficiency: cuttingEfficiency,
      finishing_efficiency: finishingEfficiency,
      qc_efficiency: qcEfficiency,
      prep_efficiency: prepEfficiency,
      yarn_cert: yarnCert,
      size_grading: sizeGrading,
      exchange_rate: exchangeRate,
      pcs_per_carton: pcsPerCarton,
      cbm_per_carton: cbmPerCarton,
      country: country,
      buying_agent: buyingAgent,
      buying_house_merchant: buyingHouseMerchant,
      currency: currency,
      color_range: colorRange,
      sustainable_material: sustainableMaterial,
      garments_cert: garmentsCert,
      confirm_date: confirmDate,
      quotation_date: new Date().toISOString().split('T')[0],
      order_placement_date: order_placement_date_state,
      embellishment_note: embName,
      incoterm_place: country,

      fabrics,
      trims,
      embs,
      washes,
      smvs: smvRows,
      yarns: yarnCostsList
    };

    try {
      const res = await fetch(`${API_BASE}/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowModal(false);
        fetchQuotations();
      }
    } catch (e) { console.error(e); }
  };

  const handleApprove = async (id: string) => {
    try {
      const q = quotations.find(item => item.id === id);
      await fetch(`${API_BASE}/quotations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...q, status: 'Approved', approved_by: 'Supervisor', approve_date: new Date().toISOString().split('T')[0] })
      });
      fetchQuotations();
    } catch (e) { console.error(e); }
  };

  const [order_placement_date_state, setOrderPlacementDateState] = useState('');

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h2 className="card-title"><DollarSign /> Price Quotations Costing</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Costing Engine
        </button>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Quotation ID</th>
              <th>Style No</th>
              <th>Buyer</th>
              <th>Total Cost /Dzn</th>
              <th>FOB /Dzn</th>
              <th>FOB /Pc</th>
              <th>CM /Dzn</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((q, idx) => (
              <tr key={idx}>
                <td><strong>{q.id}</strong></td>
                <td>{q.style_no}</td>
                <td>{q.buyer_name}</td>
                <td>${parseFloat(q.total_cost || 0).toFixed(2)}</td>
                <td>${parseFloat(q.fob_price_doz || 0).toFixed(2)}</td>
                <td style={{ color: 'var(--secondary)', fontWeight: 600 }}>${parseFloat(q.fob_price_pc || 0).toFixed(2)}</td>
                <td>${parseFloat(q.cm_value || 0).toFixed(2)}</td>
                <td>
                  <span className={`badge badge-${q.status.toLowerCase()}`}>{q.status}</span>
                </td>
                <td>
                  {q.status === 'Pending' && (
                    <button className="btn btn-success btn-sm" onClick={() => handleApprove(q.id)}>
                      Approve Costing
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '950px' }}>
            <div className="modal-header">
              <h3>Direct Material & Labor Costing Engine</h3>
              <XCircle className="modal-close" onClick={() => setShowModal(false)} />
            </div>

            <div className="tab-container">
              <div className={`tab ${costingTab === 'required' ? 'active' : ''}`} onClick={() => setCostingTab('required')}>Required Info (Tab 1)</div>
              <div className={`tab ${costingTab === 'others' ? 'active' : ''}`} onClick={() => setCostingTab('others')}>Others Info (Tab 2)</div>
              <div className={`tab ${costingTab === 'costing_grid' ? 'active' : ''}`} onClick={() => setCostingTab('costing_grid')}>Detailed Cost Grids</div>
            </div>

            {costingTab === 'required' && (
              <div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Link Quotation Inquiry ID *</label>
                    <select className="form-control" value={selectedInquiryId} onChange={e => handleInquiryChange(e.target.value)}>
                      <option value="">Select Inquiry</option>
                      {inquiries.map(inq => <option key={inq.id} value={inq.id}>{inq.id} ({inq.style_no})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Size Group *</label>
                    <input type="text" className="form-control" value={sizeGroup} onChange={e => setSizeGroup(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Desired Margin ($/Dzn) *</label>
                    <input type="number" className="form-control" value={desiredMargin} onChange={e => setDesiredMargin(parseFloat(e.target.value) || 0)} />
                  </div>
                </div>

                <div className="grid-3 mt-10">
                  <div className="form-group">
                    <label className="form-label">MC/Line *</label>
                    <input type="number" className="form-control" value={mcLine} onChange={e => setMcLine(parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Production/Line/Hour *</label>
                    <input type="number" className="form-control" value={prodLineHour} onChange={e => setProdLineHour(parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Size Grading (%)</label>
                    <input type="number" className="form-control" value={sizeGrading} onChange={e => setSizeGrading(parseFloat(e.target.value) || 0)} />
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Sewing Efficiency %</label>
                    <input type="number" className="form-control" value={sewingEfficiency} onChange={e => setSewingEfficiency(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cutting Efficiency %</label>
                    <input type="number" className="form-control" value={cuttingEfficiency} onChange={e => setCuttingEfficiency(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Finishing Efficiency %</label>
                    <input type="number" className="form-control" value={finishingEfficiency} onChange={e => setFinishingEfficiency(parseFloat(e.target.value) || 0)} />
                  </div>
                </div>

                <h4 style={{ margin: '20px 0 10px 0', borderBottom: '1px solid var(--border-muted)', paddingBottom: '8px' }}>SMV Bulletin Calculation</h4>
                <div className="grid-2">
                  <div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Gmt Item Name</label>
                        <input type="text" className="form-control" value={bulletinGmtItem} onChange={e => setBulletinGmtItem(e.target.value)} placeholder="Basic T-Shirt" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Set Ratio</label>
                        <input type="number" className="form-control" value={bulletinSetRatio} onChange={e => setBulletinSetRatio(parseInt(e.target.value) || 1)} />
                      </div>
                    </div>
                    <div className="grid-3">
                      <div className="form-group">
                        <label className="form-label">Cutting SMV</label>
                        <input type="number" className="form-control" value={bulletinCut} onChange={e => setBulletinCut(parseFloat(e.target.value) || 0)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Sewing SMV</label>
                        <input type="number" className="form-control" value={bulletinSew} onChange={e => setBulletinSew(parseFloat(e.target.value) || 0)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Finishing SMV</label>
                        <input type="number" className="form-control" value={bulletinFin} onChange={e => setBulletinFin(parseFloat(e.target.value) || 0)} />
                      </div>
                    </div>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddSmvRow}>Add Item to SMV Bulletin</button>
                  </div>
                  <div>
                    <div className="table-wrapper" style={{ maxHeight: '180px' }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Item Name</th>
                            <th>Ratio</th>
                            <th>SMV Sum</th>
                          </tr>
                        </thead>
                        <tbody>
                          {smvRows.map((r, i) => (
                            <tr key={i}>
                              <td>{r.item_name}</td>
                              <td>{r.set_ratio}</td>
                              <td>{(parseFloat(r.cutting_smv)+parseFloat(r.sewing_smv)+parseFloat(r.finishing_smv)).toFixed(2)} min</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {costingTab === 'others' && (
              <div>
                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input type="text" className="form-control" value={country} onChange={e => setCountry(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Buying Agent</label>
                    <input type="text" className="form-control" value={buyingAgent} onChange={e => setBuyingAgent(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Buying House Merchant</label>
                    <input type="text" className="form-control" value={buyingHouseMerchant} onChange={e => setBuyingHouseMerchant(e.target.value)} />
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Currency</label>
                    <select className="form-control" value={currency} onChange={e => setCurrency(e.target.value)}>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Color Range</label>
                    <input type="text" className="form-control" value={colorRange} onChange={e => setColorRange(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sustainable Material *</label>
                    <select className="form-control" value={sustainableMaterial} onChange={e => setSustainableMaterial(e.target.value)}>
                      <option value="BCI">BCI</option>
                      <option value="GOTS">GOTS</option>
                      <option value="OCS">OCS</option>
                      <option value="RCS/GRS">RCS/GRS</option>
                      <option value="OEKOTEX">OEKOTEX</option>
                      <option value="CONVENTIONAL">CONVENTIONAL</option>
                    </select>
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Exchange Rate</label>
                    <input type="number" className="form-control" value={exchangeRate} onChange={e => setExchangeRate(parseFloat(e.target.value) || 1.0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pcs / Carton</label>
                    <input type="number" className="form-control" value={pcsPerCarton} onChange={e => setPcsPerCarton(parseInt(e.target.value) || 24)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CBM / Carton</label>
                    <input type="number" className="form-control" value={cbmPerCarton} onChange={e => setCbmPerCarton(parseFloat(e.target.value) || 0.08)} />
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Commercial Cost Rate (%)</label>
                    <input type="number" className="form-control" value={commercialPct} onChange={e => setCommercialPct(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Buying House Commission (%)</label>
                    <input type="number" className="form-control" value={commissionPct} onChange={e => setCommissionPct(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Order Placement Date</label>
                    <input type="date" className="form-control" value={order_placement_date_state} onChange={e => setOrderPlacementDateState(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {costingTab === 'costing_grid' && (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <h4 style={{ marginBottom: '8px' }}>Fabric Consumption & Cost Detailed Grid</h4>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Gmt Item</th>
                        <th>Body Part *</th>
                        <th>Composition *</th>
                        <th>Fabric Type *</th>
                        <th>Source *</th>
                        <th>Supplier</th>
                        <th>Grey Cons *</th>
                        <th>Rate ($/Kg)</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fabrics.map((f, idx) => (
                        <tr key={idx}>
                          <td>{f.item_name}</td>
                          <td>{f.body_part}</td>
                          <td>{f.composition}</td>
                          <td>{f.fabric_type}</td>
                          <td>{f.source}</td>
                          <td>{f.supplier}</td>
                          <td>
                            <input
                              type="number"
                              className="detail-table-input"
                              value={f.grey_cons}
                              onChange={e => {
                                const newGrey = parseFloat(e.target.value) || 0;
                                const updated = [...fabrics];
                                updated[idx].grey_cons = newGrey;
                                updated[idx].amount = newGrey * f.rate;
                                setFabrics(updated);
                              }}
                            />
                          </td>
                          <td>{f.rate}</td>
                          <td>${parseFloat(f.amount || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Yarn Costing sub-form if source is Production */}
                {fabrics.some(f => f.source === 'Production') && (
                  <div style={{ border: '1px solid var(--primary-glow)', borderRadius: 'var(--radius-md)', padding: '16px', marginTop: '20px' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Yarn Costing (For Production Source Fabrics)</h4>
                    <div className="grid-3">
                      <div className="form-group">
                        <label className="form-label">Yarn Composition *</label>
                        <input type="text" className="form-control" value={ycComp} onChange={e => setYcComp(e.target.value)} placeholder="100% Cotton" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Yarn Count *</label>
                        <input type="text" className="form-control" value={ycCount} onChange={e => setYcCount(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Yarn Type *</label>
                        <input type="text" className="form-control" value={ycType} onChange={e => setYcType(e.target.value)} />
                      </div>
                    </div>
                    <div className="grid-4">
                      <div className="form-group">
                        <label className="form-label">Percentage %</label>
                        <input type="number" className="form-control" value={ycPct} onChange={e => setYcPct(parseInt(e.target.value) || 100)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Color</label>
                        <input type="text" className="form-control" value={ycColor} onChange={e => setYcColor(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Cons Qty (Kg)</label>
                        <input type="number" className="form-control" value={ycQty} onChange={e => setYcQty(parseFloat(e.target.value) || 0)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Rate ($/Kg)</label>
                        <input type="number" className="form-control" value={ycRate} onChange={e => setYcRate(parseFloat(e.target.value) || 0)} />
                      </div>
                    </div>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddYarnCostLine}>Add Yarn Cost Line</button>
                    
                    <div className="table-wrapper mt-20" style={{ maxHeight: '120px' }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Yarn Comp</th>
                            <th>Count</th>
                            <th>Color</th>
                            <th>Qty</th>
                            <th>Rate</th>
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {yarnCostsList.map((yc, idx) => (
                            <tr key={idx}>
                              <td>{yc.yarn_composition}</td>
                              <td>{yc.yarn_count}</td>
                              <td>{yc.color}</td>
                              <td>{yc.cons_qty} kg</td>
                              <td>${yc.rate}</td>
                              <td>${parseFloat(yc.amount || 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <h4 style={{ margin: '20px 0 8px 0' }}>Trims / Accessories Cost Detailed Grid</h4>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Item Name *</th>
                        <th>UOM</th>
                        <th>Cons/Unit Gmt *</th>
                        <th>Extra %</th>
                        <th>Total Cons</th>
                        <th>Rate *</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trims.map((t, idx) => (
                        <tr key={idx}>
                          <td>{t.item_name}</td>
                          <td>{t.cons_uom}</td>
                          <td>{t.cons_unit}</td>
                          <td>{t.extra_pct}%</td>
                          <td>{t.total_cons}</td>
                          <td>
                            <input
                              type="number"
                              className="detail-table-input"
                              value={t.rate}
                              onChange={e => {
                                const newRate = parseFloat(e.target.value) || 0;
                                const updated = [...trims];
                                updated[idx].rate = newRate;
                                updated[idx].amount = t.total_cons * newRate;
                                setTrims(updated);
                              }}
                            />
                          </td>
                          <td>${parseFloat(t.amount || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h4 style={{ margin: '20px 0 8px 0' }}>Embellishments Cost Detailed Grid</h4>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Emb Type *</th>
                        <th>Emb Name *</th>
                        <th>Cons/Unit *</th>
                        <th>Rate *</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {embs.map((e, idx) => (
                        <tr key={idx}>
                          <td>{e.emb_type}</td>
                          <td>{e.emb_name}</td>
                          <td>{e.cons_unit}</td>
                          <td>{e.rate}</td>
                          <td>${parseFloat(e.amount || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Overall Costs Dashboard Preview */}
            <div className="metrics-grid mt-20" style={{ marginBottom: '20px' }}>
              <div className="metric-card" style={{ padding: '16px' }}>
                <div className="metric-details">
                  <h3>Direct Costs (Dzn)</h3>
                  <div className="metric-value" style={{ fontSize: '1.1rem' }}>${(totalCost - cmDoz).toFixed(2)}</div>
                </div>
              </div>
              <div className="metric-card" style={{ padding: '16px' }}>
                <div className="metric-details">
                  <h3>CM Labor (Dzn)</h3>
                  <div className="metric-value" style={{ fontSize: '1.1rem', color: 'var(--info)' }}>${cmDoz.toFixed(2)}</div>
                </div>
              </div>
              <div className="metric-card" style={{ padding: '16px' }}>
                <div className="metric-details">
                  <h3>CM% on FOB</h3>
                  <div className="metric-value" style={{ fontSize: '1.1rem', color: 'var(--warning)' }}>{cmPctOnFob.toFixed(1)}%</div>
                </div>
              </div>
              <div className="metric-card" style={{ padding: '16px', background: 'var(--secondary-glow)' }}>
                <div className="metric-details">
                  <h3 style={{ color: 'var(--secondary)' }}>Est. FOB /Pc</h3>
                  <div className="metric-value" style={{ fontSize: '1.3rem', color: 'var(--secondary)' }}>${fobPc.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="mt-20 text-right">
              <button className="btn btn-secondary mr-10" style={{ marginRight: '10px' }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveQuotation}><Save size={16} /> Save Costing</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================================================
// SUB-VIEW: Order Entry & PO Breakdown (Includes ALL spreadsheet fields)
// ==========================================================================
function OrderView({ buyers: _buyers }: { buyers: any[] }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuotationId, setSelectedQuotationId] = useState('');

  const [form, setForm] = useState({
    style_no: '',
    inquiry_id: '',
    buyer: '',
    style_desc: '',
    order_status: 'Confirm',
    category: 'Jersey',
    item_group: 'Basic',
    season: '',
    team_leader: '',
    dealing_merchant: '',
    factory_merchant: '',
    currency: 'USD',
    uom: 'Pcs',
    smv: 12.0,
    repeat_no: '1',
    model_code: 101,
    garment_dept: 'Kids',
    embellishment_type: 'Print',
    embellishment_name: 'Placement Print',
    embellishment_notes: 'Eco friendly ink',
    yarn_type: 'Combed Yarn',
    yarn_cert: 'GOTS Certified',
    yarn_comp: '100% Cotton Organic',
    ship_mode: 'Sea',
    quality_label: 'A-Grade',
    style_owner: 'Fast Retailing Owner',
    garment_weight: 150,
    avg_weight: 150,
    special_instruction: 'Handle carefully',
    terms: 'L/C 60 days payment',
    status: 'Draft'
  });

  // PO booking breakdown entry state
  const [poNo, setPoNo] = useState('');
  const [poQty, setPoQty] = useState(5000);
  const [poFob, setPoFob] = useState(4.5);
  const [shipDate, setShipDate] = useState('');
  const [packingRatio, setPackingRatio] = useState('Solid Color Solid Size');
  const [delayFor, setDelayFor] = useState('None');
  const [poList, setPoList] = useState<any[]>([]);

  // Detailed fields
  const [internalRefNo, setInternalRefNo] = useState('');
  const [commFileNo, setCommFileNo] = useState('');
  const [_printQty, _setPrintQty] = useState(0);
  const [_embroideryQty, _setEmbroideryQty] = useState(0);
  const [deliveryCountry, setDeliveryCountry] = useState('USA');
  const [areaCode, setAreaCode] = useState('US-NY');
  const [cutoffDate, setCutoffDate] = useState('');
  const [cutoffVal, _setCutoffVal] = useState('Full');
  const [division, setDivision] = useState('Jersey');
  const [productType, setProductType] = useState('Regular');
  const [pcsPerPack, setPcsPerPack] = useState(1);
  const [matrixType, setMatrixType] = useState('Product with Full Quantity');

  useEffect(() => {
    fetchOrders();
    fetchQuotations();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (e) { console.error(e); }
  };

  const fetchQuotations = async () => {
    try {
      const res = await fetch(`${API_BASE}/quotations`);
      const data = await res.json();
      setQuotations(data.filter((q: any) => q.status === 'Approved'));
    } catch (e) { console.error(e); }
  };

  const handleQuotationChange = async (qId: string) => {
    setSelectedQuotationId(qId);
    if (!qId) return;

    try {
      const res = await fetch(`${API_BASE}/quotations/${qId}`);
      const data = await res.json();

      const inqRes = await fetch(`${API_BASE}/inquiries/${data.inquiry_id}`);
      const inq = await inqRes.json();

      setForm({
        ...form,
        style_no: data.style_no,
        inquiry_id: data.inquiry_id,
        buyer: inq.buyer_name,
        season: inq.season,
        uom: inq.uom,
        smv: data.total_smv || 16.5,
        style_desc: inq.style_desc,
        yarn_type: data.yarn_cert || 'Combed Cotton',
        yarn_comp: inq.fabrics?.[0]?.composition || '100% Cotton',
        yarn_cert: data.yarn_cert || 'OEKOTEX'
      });
      setPoFob(data.fob_price_pc);
      setShipDate(inq.ship_date);
    } catch (e) { console.error(e); }
  };

  const handleAddPO = () => {
    if (!poNo || !shipDate) return alert("Fill up PO No and Shipment Date.");
    
    const today = new Date();
    const target = new Date(shipDate);
    const leadTime = Math.ceil((target.getTime() - today.getTime()) / (1000 * 3600 * 24));
    const weekNo = Math.ceil(target.getDate() / 7); // estimate

    const breakdown = [
      { color: 'Red', size: 'M', set_qty: 1, pcs_qty: Math.floor(poQty/2), rate: poFob, ex_cut_pct: 4, plan_cut_qty: Math.floor(poQty/2 * 1.04), article_no: 'A-101', amount: Math.floor(poQty/2) * poFob, garments_item: form.style_no },
      { color: 'Blue', size: 'L', set_qty: 1, pcs_qty: Math.ceil(poQty/2), rate: poFob, ex_cut_pct: 4, plan_cut_qty: Math.ceil(poQty/2 * 1.04), article_no: 'A-102', amount: Math.ceil(poQty/2) * poFob, garments_item: form.style_no }
    ];

    setPoList([...poList, {
      po_no: poNo,
      status: 'Confirm',
      received_date: today.toISOString().split('T')[0],
      ex_factory_date: shipDate,
      ship_date: shipDate,
      week_no: weekNo,
      lead_time: leadTime > 0 ? leadTime : 60,
      po_qty: poQty,
      fob_price: poFob,
      fob_in_dzn: poFob * 12,
      carton_info: `${pcsPerPack} pcs/carton`,
      comm_file_no: commFileNo,
      packing_ratio: packingRatio,
      delay_for: delayFor,
      po_status: 'Active',
      remarks: 'Seeded breakdown',
      delivery_country: deliveryCountry,
      code: deliveryCountry.substring(0, 2),
      area: 'NY',
      area_code: areaCode,
      cutoff_date: cutoffDate,
      cutoff_val: cutoffVal,
      division: division,
      country_ship_date: shipDate,
      pack_type: 'Solid Pack',
      port_of_discharge: 'Chittagong',
      product_type: productType,
      pcs_per_pack: pcsPerPack,
      req_hanger: 'No',
      matrix_type: matrixType,
      breakdown
    }]);

    setPoNo('');
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.style_no || poList.length === 0) {
      alert("Missing style number or PO breakdown list.");
      return;
    }

    const payload = {
      ...form,
      status: 'Approved',
      pos: poList
    };

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowModal(false);
        fetchOrders();
        setPoList([]);
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h2 className="card-title"><ShoppingBag /> Confirmed Orders (Order Entry)</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Order Entry
        </button>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Style No</th>
              <th>Buyer</th>
              <th>Season</th>
              <th>Total Order Qty</th>
              <th>Order Value ($)</th>
              <th>Embellishment Spec</th>
              <th>Yarn Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o, idx) => (
              <tr key={idx}>
                <td><strong>ORD-{o.id}</strong></td>
                <td>{o.style_no}</td>
                <td>{o.buyer}</td>
                <td>{o.season}</td>
                <td>{parseFloat(o.total_qty || 0).toLocaleString()} pcs</td>
                <td>${parseFloat(o.total_value || 0).toLocaleString()}</td>
                <td>{o.embellishment_type} ({o.embellishment_name})</td>
                <td>{o.yarn_type}</td>
                <td>
                  <span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '920px' }}>
            <div className="modal-header">
              <h3>Create New Order & PO Breakdowns</h3>
              <XCircle className="modal-close" onClick={() => setShowModal(false)} />
            </div>

            <form onSubmit={handleCreateOrder}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Link Approved Costing *</label>
                  <select className="form-control" value={selectedQuotationId} onChange={e => handleQuotationChange(e.target.value)}>
                    <option value="">Select Approved Quotation</option>
                    {quotations.map(q => <option key={q.id} value={q.id}>{q.id} ({q.style_no})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Style No</label>
                  <input type="text" className="form-control" value={form.style_no} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">Buyer</label>
                  <input type="text" className="form-control" value={form.buyer} disabled />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Season</label>
                  <input type="text" className="form-control" value={form.season} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">Order UOM</label>
                  <input type="text" className="form-control" value={form.uom} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">SMV (Min)</label>
                  <input type="number" className="form-control" value={form.smv} disabled />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Repeat No</label>
                  <input type="text" className="form-control" value={form.repeat_no} onChange={e => setForm({ ...form, repeat_no: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Model Code</label>
                  <input type="number" className="form-control" value={form.model_code} onChange={e => setForm({ ...form, model_code: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Garment Department</label>
                  <input type="text" className="form-control" value={form.garment_dept} onChange={e => setForm({ ...form, garment_dept: e.target.value })} />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Embellishment Type</label>
                  <select className="form-control" value={form.embellishment_type} onChange={e => setForm({ ...form, embellishment_type: e.target.value })}>
                    <option value="Print">Print</option>
                    <option value="AOP">AOP</option>
                    <option value="Embroidery">Embroidery</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Embellishment Name</label>
                  <input type="text" className="form-control" value={form.embellishment_name} onChange={e => setForm({ ...form, embellishment_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Embellishment Notes</label>
                  <input type="text" className="form-control" value={form.embellishment_notes} onChange={e => setForm({ ...form, embellishment_notes: e.target.value })} />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Yarn Type</label>
                  <input type="text" className="form-control" value={form.yarn_type} onChange={e => setForm({ ...form, yarn_type: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Yarn Certification</label>
                  <input type="text" className="form-control" value={form.yarn_cert} onChange={e => setForm({ ...form, yarn_cert: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Yarn Composition</label>
                  <input type="text" className="form-control" value={form.yarn_comp} onChange={e => setForm({ ...form, yarn_comp: e.target.value })} />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Ship Mode</label>
                  <select className="form-control" value={form.ship_mode} onChange={e => setForm({ ...form, ship_mode: e.target.value })}>
                    <option value="Sea">Sea</option>
                    <option value="Air">Air</option>
                    <option value="Road">Road</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Quality Label</label>
                  <input type="text" className="form-control" value={form.quality_label} onChange={e => setForm({ ...form, quality_label: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Style Owner</label>
                  <input type="text" className="form-control" value={form.style_owner} onChange={e => setForm({ ...form, style_owner: e.target.value })} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Special Instruction</label>
                  <textarea className="form-control" value={form.special_instruction} onChange={e => setForm({ ...form, special_instruction: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Terms</label>
                  <textarea className="form-control" value={form.terms} onChange={e => setForm({ ...form, terms: e.target.value })} />
                </div>
              </div>

              {/* PO Section */}
              <h4 style={{ margin: '20px 0 10px 0', borderBottom: '1px dashed var(--border-muted)', paddingBottom: '8px' }}>Purchase Order (PO) Details</h4>
              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">PO Number *</label>
                  <input type="text" className="form-control" value={poNo} onChange={e => setPoNo(e.target.value)} placeholder="e.g. PO-8871" />
                </div>
                <div className="form-group">
                  <label className="form-label">PO Quantity (Pcs) *</label>
                  <input type="number" className="form-control" value={poQty} onChange={e => setPoQty(parseInt(e.target.value) || 0)} />
                </div>
                <div className="form-group">
                  <label className="form-label">FOB Price ($/Pc)</label>
                  <input type="number" className="form-control" value={poFob} disabled />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Shipment Date *</label>
                  <input type="date" className="form-control" value={shipDate} onChange={e => setShipDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Packing Ratio</label>
                  <select className="form-control" value={packingRatio} onChange={e => setPackingRatio(e.target.value)}>
                    <option value="Solid Color Solid Size">Solid Color Solid Size</option>
                    <option value="Solid Color Asort Size">Solid Color Asort Size</option>
                    <option value="Asort Color Solid Size">Asort Color Solid Size</option>
                    <option value="Asort Color Asort Size">Asort Color Asort Size</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Delay For</label>
                  <select className="form-control" value={delayFor} onChange={e => setDelayFor(e.target.value)}>
                    <option value="None">None</option>
                    <option value="Knitting">Knitting</option>
                    <option value="Dyeing">Dyeing</option>
                    <option value="Garments Production">Garments Production</option>
                  </select>
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Internal Ref No</label>
                  <input type="text" className="form-control" value={internalRefNo} onChange={e => setInternalRefNo(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Comm File No</label>
                  <input type="text" className="form-control" value={commFileNo} onChange={e => setCommFileNo(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Pcs Per Pack</label>
                  <input type="number" className="form-control" value={pcsPerPack} onChange={e => setPcsPerPack(parseInt(e.target.value) || 1)} />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Delivery Country</label>
                  <input type="text" className="form-control" value={deliveryCountry} onChange={e => setDeliveryCountry(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Area Code</label>
                  <input type="text" className="form-control" value={areaCode} onChange={e => setAreaCode(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Cut-off Date</label>
                  <input type="date" className="form-control" value={cutoffDate} onChange={e => setCutoffDate(e.target.value)} />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Division</label>
                  <select className="form-control" value={division} onChange={e => setDivision(e.target.value)}>
                    <option value="Jersey">Jersey</option>
                    <option value="Lingerie">Lingerie</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Matrix Type</label>
                  <select className="form-control" value={matrixType} onChange={e => setMatrixType(e.target.value)}>
                    <option value="Product with Full Quantity">Product with Full Quantity</option>
                    <option value="Packing Ratio with Product Qty">Packing Ratio with Product Qty</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Product Type</label>
                  <select className="form-control" value={productType} onChange={e => setProductType(e.target.value)}>
                    <option value="Regular">Regular</option>
                    <option value="Licensor">Licensor</option>
                  </select>
                </div>
              </div>

              <button type="button" className="btn btn-secondary mt-10" onClick={handleAddPO}>Add PO Breakdown Link</button>

              <div className="table-wrapper mt-20">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>PO No</th>
                      <th>Qty (Pcs)</th>
                      <th>FOB</th>
                      <th>Ship Date</th>
                      <th>Lead Time</th>
                      <th>Packing Ratio</th>
                      <th>Color-Size Breakdowns</th>
                    </tr>
                  </thead>
                  <tbody>
                    {poList.map((po, idx) => (
                      <tr key={idx}>
                        <td>{po.po_no}</td>
                        <td>{po.po_qty} pcs</td>
                        <td>${po.fob_price}</td>
                        <td>{po.ship_date}</td>
                        <td>{po.lead_time} days</td>
                        <td>{po.packing_ratio}</td>
                        <td>
                          {po.breakdown.map((b: any, i: number) => (
                            <span key={i} className="badge badge-draft" style={{ marginRight: '4px' }}>
                              {b.color}-{b.size} ({b.pcs_qty} pcs, Ex: {b.ex_cut_pct}%)
                            </span>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-20 text-right">
                <button type="button" className="btn btn-secondary mr-10" style={{ marginRight: '10px' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Save size={16} /> Save Confirmed Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Legacy inline FabricBookingView removed. Replaced by import from ./FabricBookingView.tsx

// ==========================================================================
// SUB-VIEW: Trims Booking (Includes Thread/Carton Formulas + VALIDATIONS)
// ==========================================================================
function TrimsBookingView() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    booking_reference: '',
    budget_id: '',
    basis: 'Main',
    main_booking_id: '',
    booking_date: new Date().toISOString().split('T')[0],
    source: 'Non-Epz/Local',
    supplier_name: 'Coats Thread',
    delivery_date: '',
    inhouse_date: '',
    pay_mode: 'Credit',
    currency: 'USD',
    attention: 'Attention trims manager',
    remarks: 'Approved trims booking',
    booking_label: 'Style Label',
    terms_conditions: 'Standard inspection check'
  });

  // Trims Booking item specs
  const [trimType, setTrimType] = useState<'Thread' | 'Carton'>('Thread');
  const [gmtQty, setGmtQty] = useState(10000);
  const [rate, setRate] = useState(1.2);
  const [calculatedQty, setCalculatedQty] = useState(0);

  useEffect(() => {
    fetchBookings();
    fetchBudgets();
  }, []);

  useEffect(() => {
    // Thread Formula: qty * 15m * 1.15 / 5000 -> ceil
    if (trimType === 'Thread') {
      const totalMeters = gmtQty * 15 * 1.15;
      const cones = Math.ceil(totalMeters / 5000);
      setCalculatedQty(cones);
      setRate(1.2);
    } else {
      // Carton Formula: ceil(qty / 24) * 1.02
      const cartons = Math.ceil(gmtQty / 24) * 1.02;
      setCalculatedQty(Math.ceil(cartons));
      setRate(2.5);
    }
  }, [trimType, gmtQty]);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/trims-bookings`);
      const data = await res.json();
      setBookings(data);
    } catch (e) { console.error(e); }
  };

  const fetchBudgets = async () => {
    try {
      const res = await fetch(`${API_BASE}/budgets`);
      const data = await res.json();
      setBudgets(data.filter((b: any) => b.status === 'Approved'));
    } catch (e) { console.error(e); }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.budget_id) return alert("Select a Budget Reference.");

    const items = [{
      po_id: 1,
      garments_color: 'Red',
      item_color: 'Red',
      item_name: trimType === 'Thread' ? 'Sewing Thread' : 'Cartons',
      item_desc: trimType === 'Thread' ? 'Spun Poly Cone' : 'Master Carton 5-Ply',
      required_qty: calculatedQty,
      work_order_qty: calculatedQty,
      excess_pct: trimType === 'Thread' ? 15 : 2,
      final_wo_qty: calculatedQty,
      rate,
      amount: calculatedQty * rate
    }];

    const payload = {
      ...form,
      booking_reference: `TB-${String(Math.floor(Math.random() * 900) + 100)}-${new Date().toISOString().split('T')[0]}`,
      status: 'Approved',
      items
    };

    try {
      const res = await fetch(`${API_BASE}/trims-bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Over-budget blocker triggered.");
      } else {
        setShowModal(false);
        fetchBookings();
      }
    } catch (e) {
      setErrorMsg("Failed to book trims. Please check budget limits.");
    }
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h2 className="card-title"><Settings /> Trims & Accessories Bookings</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Trims Booking
        </button>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Budget Ref</th>
              <th>Style No</th>
              <th>Basis</th>
              <th>Supplier</th>
              <th>Pay Mode</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b, idx) => (
              <tr key={idx}>
                <td><strong>{b.booking_reference}</strong></td>
                <td>{b.budget_reference}</td>
                <td>{b.style_no}</td>
                <td>{b.basis} Booking</td>
                <td>{b.supplier_name}</td>
                <td>{b.pay_mode}</td>
                <td>
                  <span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3>Create Trims Booking</h3>
              <XCircle className="modal-close" onClick={() => setShowModal(false)} />
            </div>

            {errorMsg && (
              <div className="alert-message alert-danger">
                <AlertCircle size={16} /> {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateBooking}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Link Production Budget *</label>
                  <select className="form-control" value={form.budget_id} onChange={e => setForm({ ...form, budget_id: e.target.value })} required>
                    <option value="">Select Budget</option>
                    {budgets.map(b => <option key={b.id} value={b.id}>{b.budget_reference} (Limit: ${parseFloat(b.total_trims_budget).toFixed(2)})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Trim Item type</label>
                  <select className="form-control" value={trimType} onChange={e => setTrimType(e.target.value as any)}>
                    <option value="Thread">Sewing Thread (Cones)</option>
                    <option value="Carton">Cartons (Units)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Booking Scope Label</label>
                  <select className="form-control" value={form.booking_label} onChange={e => setForm({ ...form, booking_label: e.target.value })}>
                    <option value="Style Label">Style Label</option>
                    <option value="PO Label">PO Label</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Terms & Conditions</label>
                  <input type="text" className="form-control" value={form.terms_conditions} onChange={e => setForm({ ...form, terms_conditions: e.target.value })} />
                </div>
              </div>

              <div className="form-row mt-20" style={{ borderTop: '1px dashed var(--border-muted)', paddingTop: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Garment Quantity (Pcs)</label>
                  <input type="number" className="form-control" value={gmtQty} onChange={e => setGmtQty(parseInt(e.target.value) || 0)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Auto Calculated Booking Qty</label>
                  <input type="text" className="form-control" value={`${calculatedQty} ${trimType === 'Thread' ? 'Cones' : 'Cartons'}`} disabled />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Unit Rate ($)</label>
                  <input type="number" className="form-control" value={rate} onChange={e => setRate(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Supplier Cost</label>
                  <input type="text" className="form-control" value={`$${(calculatedQty * rate).toFixed(2)}`} disabled />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Supplier Name</label>
                  <input type="text" className="form-control" value={form.supplier_name} onChange={e => setForm({ ...form, supplier_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Mode</label>
                  <select className="form-control" value={form.pay_mode} onChange={e => setForm({ ...form, pay_mode: e.target.value })}>
                    <option value="Credit">Credit</option>
                    <option value="Import">Import</option>
                    <option value="In House">In House</option>
                  </select>
                </div>
              </div>

              <div className="mt-20 text-right">
                <button type="button" className="btn btn-secondary mr-10" style={{ marginRight: '10px' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Save size={16} /> Place Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================================================
// SUB-VIEW: Time & Action (T&A) Progress Report Tracker
// ==========================================================================
function TAProgressView() {
  const [milestones, setMilestones] = useState<any[]>([]);

  useEffect(() => {
    fetchMilestones();
  }, []);

  const fetchMilestones = async () => {
    try {
      const res = await fetch(`${API_BASE}/reports/ta-progress`);
      const data = await res.json();
      setMilestones(data);
    } catch (e) { console.error("Error fetching milestones", e); }
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h2 className="card-title"><BookOpen /> Time & Action Progress Report (Style wise)</h2>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Style No</th>
              <th>Buyer</th>
              <th>Season</th>
              <th>Merchant</th>
              <th>Inquiry Logged</th>
              <th>Quotation Sent</th>
              <th>Fabric Inhouse</th>
              <th>Trims Inhouse</th>
              <th>Target Shipment</th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((m, idx) => {
              return (
                <tr key={idx}>
                  <td><strong>{m.style_no}</strong></td>
                  <td>{m.buyer}</td>
                  <td>{m.season}</td>
                  <td>{m.dealing_merchant || 'N/A'}</td>
                  <td>
                    <span className={`badge ${m.inquiry_date ? 'badge-approved' : 'badge-draft'}`}>
                      {m.inquiry_date ? `Done (${m.inquiry_date})` : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${m.sub_date ? 'badge-approved' : 'badge-draft'}`}>
                      {m.sub_date ? `Sent (${m.sub_date})` : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${m.fabric_booking_date ? 'badge-approved' : 'badge-draft'}`}>
                      {m.fabric_booking_date ? `Booked (${m.fabric_booking_date})` : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${m.trims_booking_date ? 'badge-approved' : 'badge-draft'}`}>
                      {m.trims_booking_date ? `Booked (${m.trims_booking_date})` : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <strong>{m.first_ship_date || 'N/A'}</strong>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
