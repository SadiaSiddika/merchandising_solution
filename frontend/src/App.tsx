import React, { useState, useEffect, useRef } from 'react';
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
  CheckCircle,
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
  Shield,
  Search,
  User,
  Power,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon
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
import { QuotationApprovalView } from './QuotationApprovalView';

const API_BASE = 'http://localhost:5000/api';

// ==========================================================================
// Main App Component
// ==========================================================================
export default function App() {
  const [currentUser, setCurrentUser] = useState<any | null>(() => {
    const saved = localStorage.getItem('metamorphosis_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'crm' | 'crm_mis' | 'inquiry' | 'quotation_approval' | 'costing' | 'order' | 'order_approval' | 'budget' | 'budget_approval' | 'fabric' | 'fabric_approval' | 'trims' | 'trims_approval' | 'ta_progress' | 'user_management'>('dashboard');
  const [editOrderId, setEditOrderId] = useState<number | null>(null);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('metamorphosis_theme') as 'dark' | 'light') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('metamorphosis_theme', theme);
  }, [theme]);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);

  // Store the current width in a ref so mousemove event handler has access to the latest value without re-binding
  const widthRef = useRef(sidebarWidth);
  useEffect(() => {
    widthRef.current = sidebarWidth;
  }, [sidebarWidth]);

  const startResizing = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    let currentWidth = widthRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !sidebarRef.current) return;
      let newWidth = e.clientX;

      // Apply limits and snapping
      if (newWidth < 120) {
        newWidth = 76; // Snap to collapsed width
      } else if (newWidth > 450) {
        newWidth = 450; // Clamp at max width
      } else if (newWidth > 100 && newWidth < 180) {
        newWidth = 180; // Minimum expanded width
      }

      currentWidth = newWidth;

      // Update sidebar DOM style directly for buttery smooth 60fps drag resizing
      sidebarRef.current.style.width = `${newWidth}px`;

      if (newWidth <= 120) {
        sidebarRef.current.classList.add('collapsed');
      } else {
        sidebarRef.current.classList.remove('collapsed');
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        setSidebarWidth(currentWidth); // Sync final width state to React on mouseup release
      }
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      if (sidebarRef.current) {
        sidebarRef.current.classList.add('resizing');
      }
    } else {
      document.body.style.userSelect = '';
      if (sidebarRef.current) {
        sidebarRef.current.classList.remove('resizing');
      }
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Master lists
  const [buyers, setBuyers] = useState<any[]>([]);
  const [itemsMaster, setItemsMaster] = useState<any[]>([]);
  const [dbStatus, setDbStatus] = useState<string>('sqlite');
  const [rolePermissions, setRolePermissions] = useState<any[]>([]);
  const [userPermissions, setUserPermissions] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/db-status`).then(r => r.json()).then(data => setDbStatus(data.dbType)).catch(() => { });
    fetchBuyers();
    fetchItemsMaster();
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const res1 = await fetch(`${API_BASE}/role-permissions`);
      const data1 = await res1.json();
      setRolePermissions(data1);

      const res2 = await fetch(`${API_BASE}/user-permissions`);
      const data2 = await res2.json();
      setUserPermissions(data2);
    } catch (e) {
      console.error("Error fetching permissions", e);
    }
  };

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

  const hasPageAccess = (pageKey: string) => {
    if (!currentUser) return false;
    // Super admin has access to everything
    if (currentUser.role === 'super_admin') return true;

    // Special: user_management is only for super_admin
    if (pageKey === 'user_management') return false;

    // 1. Check user-specific permissions override first
    const userPerm = userPermissions.find(p => p.username === currentUser.username);
    if (userPerm) {
      try {
        const allowed = JSON.parse(userPerm.allowed_pages);
        if (Array.isArray(allowed)) {
          return allowed.includes(pageKey);
        }
      } catch (e) { }
    }

    // 2. Check role-based permissions fallback
    const rolePerm = rolePermissions.find(p => p.role === currentUser.role);
    if (rolePerm) {
      try {
        const allowed = JSON.parse(rolePerm.allowed_pages);
        if (Array.isArray(allowed)) {
          return allowed.includes(pageKey);
        }
      } catch (e) { }
    }

    // 3. Default static fallback if no permission row exists in DB
    const approvalTabs = ['order_approval', 'quotation_approval', 'budget_approval', 'fabric_approval', 'trims_approval'];
    if (approvalTabs.includes(pageKey)) {
      return ['super_admin', 'production_manager', 'merchandiser', 'store_manager', 'merchandiser_manager'].includes(currentUser.role);
    }
    return true;
  };

  useEffect(() => {
    if (currentUser) {
      if (!hasPageAccess(activeTab)) {
        setActiveTab('dashboard');
      }
    }
  }, [activeTab, currentUser, rolePermissions, userPermissions]);

  if (!currentUser) {
    return (
      <LoginSignupView
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          localStorage.setItem('metamorphosis_user', JSON.stringify(user));
        }}
      />
    );
  }

  const isCollapsed = sidebarWidth <= 120;

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <nav
        ref={sidebarRef}
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isResizing ? 'resizing' : ''}`}
        style={{ width: `${sidebarWidth}px` }}
      >
        <div className="sidebar-header">
          <div className="sidebar-header-left">
            <div className="user-avatar" style={{ background: 'var(--primary-gradient)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 'bold', flexShrink: 0 }}>M</div>
            <span className="sidebar-logo">MerchTrack</span>
          </div>
          <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={() => {
              const newWidth = sidebarWidth <= 76 ? 260 : 76;
              setSidebarWidth(newWidth);
              if (sidebarRef.current) {
                sidebarRef.current.style.width = `${newWidth}px`;
              }
            }}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
        <ul className="sidebar-menu">
          {hasPageAccess('dashboard') && (
            <li className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')} title="Dashboard">
              <LayoutDashboard className="menu-item-icon" />
              <span className="menu-item-text">Dashboard</span>
            </li>
          )}
          {hasPageAccess('crm') && (
            <li className={`menu-item ${activeTab === 'crm' ? 'active' : ''}`} onClick={() => setActiveTab('crm')} title="Sales Target (CRM)">
              <Target className="menu-item-icon" />
              <span className="menu-item-text">Sales Target (CRM)</span>
            </li>
          )}
          {hasPageAccess('crm_mis') && (
            <li className={`menu-item ${activeTab === 'crm_mis' ? 'active' : ''}`} onClick={() => setActiveTab('crm_mis')} title="CRM MIS Report">
              <TrendingUp className="menu-item-icon" />
              <span className="menu-item-text">CRM MIS Report</span>
            </li>
          )}
          {hasPageAccess('inquiry') && (
            <li className={`menu-item ${activeTab === 'inquiry' ? 'active' : ''}`} onClick={() => setActiveTab('inquiry')} title="Quotation Inquiry">
              <HelpCircle className="menu-item-icon" />
              <span className="menu-item-text">Quotation Inquiry</span>
            </li>
          )}
          {hasPageAccess('quotation_approval') && (
            <li className={`menu-item ${activeTab === 'quotation_approval' ? 'active' : ''}`} onClick={() => setActiveTab('quotation_approval')} title="Quotation Approval">
              <Shield className="menu-item-icon" />
              <span className="menu-item-text">Quotation Approval</span>
            </li>
          )}
          {hasPageAccess('costing') && (
            <li className={`menu-item ${activeTab === 'costing' ? 'active' : ''}`} onClick={() => setActiveTab('costing')} title="Price Costing">
              <DollarSign className="menu-item-icon" />
              <span className="menu-item-text">Price Costing</span>
            </li>
          )}
          {hasPageAccess('order') && (
            <li className={`menu-item ${activeTab === 'order' ? 'active' : ''}`} onClick={() => setActiveTab('order')} title="Order Entry">
              <ShoppingBag className="menu-item-icon" />
              <span className="menu-item-text">Order Entry</span>
            </li>
          )}
          {hasPageAccess('order_approval') && (
            <li className={`menu-item ${activeTab === 'order_approval' ? 'active' : ''}`} onClick={() => setActiveTab('order_approval')} title="Order Approval">
              <Shield className="menu-item-icon" />
              <span className="menu-item-text">Order Approval</span>
            </li>
          )}
          {hasPageAccess('ta_progress') && (
            <li className={`menu-item ${activeTab === 'ta_progress' ? 'active' : ''}`} onClick={() => setActiveTab('ta_progress')} title="T&A Progress">
              <BookOpen className="menu-item-icon" />
              <span className="menu-item-text">T&A Progress</span>
            </li>
          )}
          {hasPageAccess('budget') && (
            <li className={`menu-item ${activeTab === 'budget' ? 'active' : ''}`} onClick={() => setActiveTab('budget')} title="Cost Budget">
              <ClipboardCheck className="menu-item-icon" />
              <span className="menu-item-text">Cost Budget</span>
            </li>
          )}
          {hasPageAccess('budget_approval') && (
            <li className={`menu-item ${activeTab === 'budget_approval' ? 'active' : ''}`} onClick={() => setActiveTab('budget_approval')} title="Budget Approval">
              <Shield className="menu-item-icon" />
              <span className="menu-item-text">Budget Approval</span>
            </li>
          )}
          {hasPageAccess('fabric') && (
            <li className={`menu-item ${activeTab === 'fabric' ? 'active' : ''}`} onClick={() => setActiveTab('fabric')} title="Fabric Booking">
              <Layers className="menu-item-icon" />
              <span className="menu-item-text">Fabric Booking</span>
            </li>
          )}
          {hasPageAccess('fabric_approval') && (
            <li className={`menu-item ${activeTab === 'fabric_approval' ? 'active' : ''}`} onClick={() => setActiveTab('fabric_approval')} title="Fabric Booking Approval">
              <Shield className="menu-item-icon" />
              <span className="menu-item-text">Fabric Booking Approval</span>
            </li>
          )}
          {hasPageAccess('trims') && (
            <li className={`menu-item ${activeTab === 'trims' ? 'active' : ''}`} onClick={() => setActiveTab('trims')} title="Trims Booking">
              <Settings className="menu-item-icon" />
              <span className="menu-item-text">Trims Booking</span>
            </li>
          )}
          {hasPageAccess('trims_approval') && (
            <li className={`menu-item ${activeTab === 'trims_approval' ? 'active' : ''}`} onClick={() => setActiveTab('trims_approval')} title="Trims Approval">
              <Shield className="menu-item-icon" />
              <span className="menu-item-text">Trims Approval</span>
            </li>
          )}
        </ul>

        {/* User profile logo & name info widget */}
        <div
          onClick={() => {
            if (currentUser.role === 'super_admin') {
              setActiveTab('user_management');
            } else {
              alert("Access Denied: User Management is restricted to Super Admin.");
            }
          }}
          className="sidebar-user-section"
          style={{
            background: activeTab === 'user_management' ? 'rgba(99, 102, 241, 0.15)' : undefined
          }}
          title="System Users List"
        >
          <div className="user-avatar" style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--secondary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: '#fff',
            fontSize: '0.9rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            flexShrink: 0
          }}>
            U
          </div>
          <span className="sidebar-user-text">
            User
          </span>
        </div>

        {/* Theme Toggle Widget */}
        <div className="sidebar-theme-section">
          {isCollapsed ? (
            <button
              type="button"
              className="theme-toggle-compact-btn"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          ) : (
            <div className="theme-toggle-expanded">
              <span className="theme-toggle-label">
                {theme === 'dark' ? 'Night Mode' : 'Day Mode'}
              </span>
              <button
                type="button"
                className={`theme-toggle-switch ${theme}`}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <span className="theme-toggle-handle">
                  {theme === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
                </span>
              </button>
            </div>
          )}
        </div>

        <div className="sidebar-db-section">
          {isCollapsed ? `DB` : `DB: `}<span style={{ color: 'var(--secondary)', fontWeight: 600 }}>{dbStatus.toUpperCase()}</span>
        </div>

        {/* Resize Handle */}
        <div
          className={`sidebar-resizer ${isResizing ? 'resizing' : ''}`}
          onMouseDown={startResizing}
        />
      </nav>

      {/* Main Panel */}
      <main className="main-content">
        <header className="top-bar">
          <h1 className="page-title">
            {activeTab === 'dashboard' && 'Dashboard Overview'}
            {activeTab === 'crm' && 'CRM - Monthly Sales Target'}
            {activeTab === 'crm_mis' && 'CRM Sales Target vs Achievement (MIS Report)'}
            {activeTab === 'inquiry' && 'Buyer Inquiries'}
            {activeTab === 'quotation_approval' && 'Quotation Approval Console'}
            {activeTab === 'costing' && 'Garments Costing Engine & Price Quotations'}
            {activeTab === 'order' && 'Order Entry & PO Breakdowns'}
            {activeTab === 'order_approval' && 'Order Verification & Managerial Approvals'}
            {activeTab === 'ta_progress' && 'Time & Action (T&A) Progress Report'}
            {activeTab === 'budget' && 'Financial Control & Production Budget'}
            {activeTab === 'budget_approval' && 'Budget Approval Console'}
            {activeTab === 'fabric' && 'Fabric Booking Manager'}
            {activeTab === 'fabric_approval' && 'Fabric Booking Approval Portal'}
            {activeTab === 'trims' && 'Trims & Accessories Booking'}
            {activeTab === 'trims_approval' && 'Trims Booking Managerial Approval Panel'}
            {activeTab === 'user_management' && 'User Management & Role-Based Access Control'}
          </h1>
          <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="user-info">
              <span className="user-name">{currentUser.username}</span>
              <span className="user-role">{currentUser.role.replace('_', ' ').toUpperCase()}</span>
            </div>
            <div className="user-avatar" style={{ background: 'var(--secondary-gradient)' }}>
              {currentUser.username.substring(0, 1).toUpperCase()}
            </div>
            <button
              className="btn btn-xs btn-secondary"
              onClick={() => {
                setCurrentUser(null);
                localStorage.removeItem('metamorphosis_user');
              }}
              style={{ padding: '4px 8px', fontSize: '0.75rem', border: '1px solid var(--border-muted)', background: 'transparent' }}
            >
              Log Out
            </button>
          </div>
        </header>

        <div className="content-body">
          {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
          {activeTab === 'crm' && <SalesTargetView buyers={buyers} currentUser={currentUser} />}
          {activeTab === 'crm_mis' && <SalesTargetMISView buyers={buyers} />}
          {activeTab === 'inquiry' && <QuotationModule buyers={buyers} />}
          {activeTab === 'quotation_approval' && <QuotationApprovalView buyers={buyers} />}
          {activeTab === 'costing' && <CostingView buyers={buyers} items={itemsMaster} />}
          {activeTab === 'order' && <OrderView buyers={buyers} editOrderId={editOrderId} setEditOrderId={setEditOrderId} />}
          {activeTab === 'order_approval' && <OrderApprovalView buyers={buyers} setActiveTab={setActiveTab} setEditOrderId={setEditOrderId} />}
          {activeTab === 'ta_progress' && <TAProgressView />}
          {activeTab === 'budget' && <BudgetView buyers={buyers} />}
          {activeTab === 'budget_approval' && <BudgetView buyers={buyers} defaultSubTab="approval" isApprovalOnly={true} />}
          {activeTab === 'fabric' && <FabricBookingView />}
          {activeTab === 'fabric_approval' && <FabricBookingView defaultTab="approval" isApprovalOnly={true} />}
          {activeTab === 'trims' && <TrimsBookingView />}
          {activeTab === 'trims_approval' && <TrimsBookingApprovalView />}
          {activeTab === 'user_management' && (
            <UserManagementView
              currentUser={currentUser}
              rolePermissions={rolePermissions}
              userPermissions={userPermissions}
              fetchPermissions={fetchPermissions}
            />
          )}
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData.length > 0 ? salesData : Array.from({ length: 12 }, (_, i) => ({ month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i], total_target_val: 0, total_confirm_val: 0, total_achieve_val: 0 }))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" />
                <XAxis dataKey="month" stroke="var(--text-secondary)" tick={{ fontSize: 11 }} />
                <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--border-muted)', borderRadius: '8px' }}
                  formatter={(value: any) => [`$${parseFloat(value).toLocaleString()}`, '']} />
                <Legend />
                <Bar dataKey="total_target_val" name="Target Value ($)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total_confirm_val" name="Confirmed ($)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total_achieve_val" name="Achieved ($)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title"><ClipboardCheck size={18} /> Production Budget vs Actual Spend by Style</h2>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            {budgetData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
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
// SUB-VIEW: CRM & Sales Target — Full Redesign
// ==========================================================================
const MONTHS_LIST = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const YEARS_LIST = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

function SalesTargetView({ buyers, currentUser }: { buyers: any[], currentUser: any }) {
  type SubView = 'list' | 'create' | 'edit' | 'view';
  const [subView, setSubView] = useState<SubView>('list');
  const [targets, setTargets] = useState<any[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<any>(null);

  // Master dropdown data
  const [masterBuyingAgents, setMasterBuyingAgents] = useState<string[]>([]);
  const [masterMerchants, setMasterMerchants] = useState<string[]>([]);
  const [masterBrands, setMasterBrands] = useState<string[]>([]);
  const [masterSeasons, setMasterSeasons] = useState<string[]>([]);
  const [masterTeamLeaders, setMasterTeamLeaders] = useState<string[]>([]);

  // Form state
  const blankForm = {
    unit: currentUser?.unit || '',
    buyer_id: '',
    buyer_name: '',
    brand: '',
    style_id: '',
    team_leader: '',
    season: '',
    year: new Date().getFullYear(),
  };
  const blankMonths = MONTHS_LIST.map(m => ({
    month: m,
    target_basic_qty: 0, target_basic_val: 0,
    target_casual_qty: 0, target_casual_val: 0,
    target_fashion_qty: 0, target_fashion_val: 0,
    confirm_qty: 0, confirm_value: 0,
    is_locked: 0
  }));

  const [form, setForm] = useState<any>({ ...blankForm });
  const [monthRows, setMonthRows] = useState<any[]>(blankMonths);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<(() => void) | null>(null);

  // Filter + Role state for list view
  const [filterMode, setFilterMode] = useState<'all' | 'year' | 'buyer' | 'status'>('all');
  const [crmSimRole, setCrmSimRole] = useState('super_admin');
  const [crmSearch, setCrmSearch] = useState('');
  const [crmStatusFilter, setCrmStatusFilter] = useState('All');
  const [crmYearFilter, setCrmYearFilter] = useState(String(new Date().getFullYear()));
  const [crmBuyerFilter, setCrmBuyerFilter] = useState('');

  useEffect(() => { fetchTargets(); fetchMasterData(); }, []);



  const fetchTargets = async () => {
    try {
      const res = await fetch(`${API_BASE}/sales-targets`);
      const data = await res.json();
      setTargets(data);
    } catch (e) { console.error(e); }
  };

  const fetchMasterData = async () => {
    try {
      const [agents, brands, seasons, leaders] = await Promise.all([
        fetch(`${API_BASE}/master/buying-agents`).then(r => r.json()),
        fetch(`${API_BASE}/master/brands`).then(r => r.json()),
        fetch(`${API_BASE}/master/seasons`).then(r => r.json()),
        fetch(`${API_BASE}/master/team-leaders`).then(r => r.json()),
      ]);
      setMasterBuyingAgents(agents);
      setMasterBrands(brands);
      setMasterSeasons(seasons);
      setMasterTeamLeaders(leaders);
    } catch (e) { console.error(e); }
  };

  const loadTargetForEdit = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/sales-targets/${id}`);
      const data = await res.json();
      setSelectedTarget(data);
      setForm({
        unit: data.unit || currentUser?.unit || '',
        buyer_id: String(data.buyer_id || ''),
        buyer_name: data.buyer_name || '',
        style_id: data.style_id || '',
        brand: data.brand || '',
        buying_agent: data.buying_agent || '',
        buying_agent_merchant: data.buying_agent_merchant || '',
        team_leader: data.team_leader || '',
        season: data.season || '',
        year: data.year || new Date().getFullYear(),
        status: data.status || 'Draft'
      });
      setMonthRows(data.months || blankMonths);
    } catch (e) { console.error(e); }
  };

  const loadTargetForView = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/sales-targets/${id}`);
      const data = await res.json();
      setSelectedTarget(data);
      setSubView('view');
    } catch (e) { console.error(e); }
  };

  const validateAndSubmit = (submitFn: () => void) => {
    const buyerVal = (form.buyer_name || '').trim();
    if (!buyerVal) {
      alert('Please fill in the Buyer field.');
      return;
    }
    setPendingSubmit(() => submitFn);
    setShowConfirmPopup(true);
  };

  // Filtered targets for list view
  const getFilteredTargets = () => {
    let list = [...targets];
    const q = crmSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(t =>
        (t.buyer_name || '').toLowerCase().includes(q) ||
        (String(t.id)).includes(q) ||
        (t.buying_agent || '').toLowerCase().includes(q) ||
        (t.team_leader || '').toLowerCase().includes(q)
      );
    }
    if (crmStatusFilter !== 'All') {
      list = list.filter(t => (t.status || '').toLowerCase() === crmStatusFilter.toLowerCase());
    }
    if (filterMode === 'year') {
      list = list.filter(t => String(t.year) === crmYearFilter);
    } else if (filterMode === 'buyer' && crmBuyerFilter) {
      list = list.filter(t => String(t.buyer_id) === crmBuyerFilter || (t.buyer_name || '').toLowerCase().includes(crmBuyerFilter.toLowerCase()));
    }
    // Role-based filter simulation
    if (crmSimRole === 'merchandiser') {
      const name = currentUser?.name || '';
      list = list.filter(t => (t.team_leader || '').toLowerCase() === name.toLowerCase() || name === '');
    }
    return list;
  };

  const handleCreate = async () => {
    try {
      const res = await fetch(`${API_BASE}/sales-targets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok && data.id) {
        // Save month rows
        for (const row of monthRows) {
          const hasData = row.target_basic_qty || row.target_basic_val || row.target_casual_qty ||
            row.target_casual_val || row.target_fashion_qty || row.target_fashion_val;
          if (hasData) {
            await fetch(`${API_BASE}/sales-targets/${data.id}/months/${row.month}`, {
              method: 'PUT', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(row)
            });
          }
        }
        await fetchTargets();
        setSubView('list');
        setForm({ ...blankForm, unit: currentUser?.unit || '' });
        setMonthRows(blankMonths);
      }
    } catch (e) { console.error(e); }
  };

  const handleUpdate = async () => {
    try {
      await fetch(`${API_BASE}/sales-targets/${selectedTarget.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      // Save unlocked month rows
      for (const row of monthRows) {
        if (!row.is_locked) {
          await fetch(`${API_BASE}/sales-targets/${selectedTarget.id}/months/${row.month}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(row)
          });
        }
      }
      await fetchTargets();
      setSubView('list');
    } catch (e) { console.error(e); }
  };

  const handleLockMonth = async (month: string) => {
    if (!selectedTarget) return;
    await fetch(`${API_BASE}/sales-targets/${selectedTarget.id}/months/${encodeURIComponent(month)}/lock`, { method: 'PUT' });
    setMonthRows(prev => prev.map(r => r.month === month ? { ...r, is_locked: 1 } : r));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this sales target and all month data?')) return;
    await fetch(`${API_BASE}/sales-targets/${id}`, { method: 'DELETE' });
    fetchTargets();
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${API_BASE}/sales-targets/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        await fetchTargets();
      }
    } catch (e) { console.error(e); }
  };


  const updateMonthRow = (month: string, field: string, value: number) => {
    setMonthRows(prev => prev.map(r => r.month === month ? { ...r, [field]: value } : r));
  };

  // Totals per row
  const getRowTotals = (row: any) => {
    const tQty = (row.target_basic_qty || 0) + (row.target_casual_qty || 0) + (row.target_fashion_qty || 0);
    const tVal = (row.target_basic_val || 0) + (row.target_casual_val || 0) + (row.target_fashion_val || 0);
    return { tQty, tVal };
  };

  // ---- Custom YES/NO Confirmation Popup ----
  const ConfirmPopup = () => (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-muted)', borderRadius: '16px',
        padding: '40px 48px', maxWidth: '440px', width: '100%', textAlign: 'center',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎯</div>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '1.3rem' }}>
          Create Sales Target
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.6 }}>
          You are creating a <strong>Sales Target & Month</strong> record.<br />
          Do you want to proceed?
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button
            className="btn btn-secondary"
            style={{ minWidth: '100px' }}
            onClick={() => { setShowConfirmPopup(false); setPendingSubmit(null); }}
          >
            NO
          </button>
          <button
            className="btn btn-primary"
            style={{ minWidth: '100px' }}
            onClick={() => {
              setShowConfirmPopup(false);
              if (pendingSubmit) pendingSubmit();
              setPendingSubmit(null);
            }}
          >
            YES
          </button>
        </div>
      </div>
    </div>
  );

  // ---- Auto-fill from Quotation Inquiry by Style No ----
  const [autoFillLoading, setAutoFillLoading] = useState(false);
  const [autoFillMsg, setAutoFillMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const autoFillFromInquiry = async () => {
    const styleNo = (form.style_id || '').trim();
    if (!styleNo) {
      setAutoFillMsg({ type: 'error', text: 'Please enter a Style ID first.' });
      return;
    }
    setAutoFillLoading(true);
    setAutoFillMsg(null);
    try {
      const res = await fetch(`${API_BASE}/inquiries/by-style/${encodeURIComponent(styleNo)}`);
      if (!res.ok) {
        setAutoFillMsg({ type: 'error', text: `No Quotation Inquiry found with Style No "${styleNo}".` });
        return;
      }
      const data = await res.json();
      setForm((f: any) => ({
        ...f,
        buyer_name: data.buyer_name || f.buyer_name,
        buyer_id: '',
        brand: data.brand || f.brand,
      }));
      setAutoFillMsg({ type: 'success', text: `✓ Auto-filled — Buyer: "${data.buyer_name}"${data.brand ? `, Brand: "${data.brand}"` : ''}` });
    } catch {
      setAutoFillMsg({ type: 'error', text: 'Server error. Check connection.' });
    } finally {
      setAutoFillLoading(false);
    }
  };

  // ---- Header Form (shared between create & edit) ----
  const HeaderForm = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
        <div className="form-group">
          <label className="form-label">Buyer *</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Buyer name..."
            value={form.buyer_name || ''}
            onChange={e => setForm((f: any) => ({ ...f, buyer_name: e.target.value, buyer_id: '' }))}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Brand</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Brand name..."
            value={form.brand || ''}
            onChange={e => setForm((f: any) => ({ ...f, brand: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label
            className="form-label"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}
          >
            <span>Style ID</span>
            <button
              type="button"
              onClick={autoFillFromInquiry}
              disabled={autoFillLoading}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '3px 10px', fontSize: '0.72rem', fontWeight: 600,
                background: autoFillLoading ? 'var(--bg-dark)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', border: 'none', borderRadius: '5px',
                cursor: autoFillLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 6px rgba(99,102,241,0.3)',
                opacity: autoFillLoading ? 0.65 : 1,
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {autoFillLoading ? '⏳ Loading...' : '⚡ Get & Auto Fill'}
            </button>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Style No from Quotation Inquiry..."
            value={form.style_id || ''}
            onChange={e => { setForm((f: any) => ({ ...f, style_id: e.target.value })); setAutoFillMsg(null); }}
          />
          {autoFillMsg && (
            <div style={{
              marginTop: '5px', fontSize: '0.75rem', fontWeight: 500,
              color: autoFillMsg.type === 'success' ? '#10b981' : '#ef4444',
              padding: '4px 8px', borderRadius: '4px',
              background: autoFillMsg.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${autoFillMsg.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}>
              {autoFillMsg.text}
            </div>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Year</label>
          <select
            className="form-control"
            value={form.year || new Date().getFullYear()}
            onChange={e => setForm((f: any) => ({ ...f, year: parseInt(e.target.value) }))}
          >
            {[2024, 2025, 2026, 2027, 2028].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  // ---- Month-wise grid ----
  const MonthGrid = ({ editable }: { editable: boolean }) => (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table" style={{ minWidth: '1100px' }}>
        <thead>
          <tr>
            <th rowSpan={2} style={{ background: 'var(--bg-dark)', minWidth: '110px' }}>Month</th>
            <th colSpan={2} style={{ textAlign: 'center', background: 'rgba(99,102,241,0.18)', borderBottom: '2px solid #6366f1' }}>Basic</th>
            <th colSpan={2} style={{ textAlign: 'center', background: 'rgba(16,185,129,0.18)', borderBottom: '2px solid #10b981' }}>Casual Basic</th>
            <th colSpan={2} style={{ textAlign: 'center', background: 'rgba(245,158,11,0.18)', borderBottom: '2px solid #f59e0b' }}>Fashion</th>
            <th colSpan={2} style={{ textAlign: 'center', background: 'rgba(239,68,68,0.12)', borderBottom: '2px solid #ef4444' }}>Total (Auto)</th>
            {editable && <th rowSpan={2} style={{ background: 'var(--bg-dark)' }}>Actions</th>}
          </tr>
          <tr>
            <th style={{ background: 'rgba(99,102,241,0.1)', fontSize: '0.75rem' }}>Target Qty (Pcs)</th>
            <th style={{ background: 'rgba(99,102,241,0.1)', fontSize: '0.75rem' }}>Target Value</th>
            <th style={{ background: 'rgba(16,185,129,0.1)', fontSize: '0.75rem' }}>Target Qty (Pcs)</th>
            <th style={{ background: 'rgba(16,185,129,0.1)', fontSize: '0.75rem' }}>Target Value</th>
            <th style={{ background: 'rgba(245,158,11,0.1)', fontSize: '0.75rem' }}>Target Qty (Pcs)</th>
            <th style={{ background: 'rgba(245,158,11,0.1)', fontSize: '0.75rem' }}>Target Value</th>
            <th style={{ background: 'rgba(239,68,68,0.08)', fontSize: '0.75rem', fontWeight: 700 }}>Total Qty</th>
            <th style={{ background: 'rgba(239,68,68,0.08)', fontSize: '0.75rem', fontWeight: 700 }}>Total Value</th>
          </tr>
        </thead>
        <tbody>
          {monthRows.map((row, idx) => {
            const { tQty, tVal } = getRowTotals(row);
            const locked = !!row.is_locked;
            const isEditable = editable && !locked;
            return (
              <tr key={idx} style={{ background: locked ? 'rgba(16,185,129,0.05)' : undefined }}>
                <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {locked && <Lock size={12} style={{ color: 'var(--secondary)' }} />}
                  {row.month}
                </td>
                {/* Basic */}
                <td>
                  {isEditable ? (
                    <input type="number" step="0.01" className="form-control" style={{ minWidth: '90px', padding: '4px 8px' }}
                      value={row.target_basic_qty || 0}
                      onChange={e => updateMonthRow(row.month, 'target_basic_qty', parseFloat(e.target.value) || 0)} />
                  ) : <span>{(row.target_basic_qty || 0).toLocaleString()}</span>}
                </td>
                <td>
                  {isEditable ? (
                    <input type="number" step="0.01" className="form-control" style={{ minWidth: '90px', padding: '4px 8px' }}
                      value={row.target_basic_val || 0}
                      onChange={e => updateMonthRow(row.month, 'target_basic_val', parseFloat(e.target.value) || 0)} />
                  ) : <span>{(row.target_basic_val || 0).toLocaleString()}</span>}
                </td>
                {/* Casual Basic */}
                <td>
                  {isEditable ? (
                    <input type="number" step="0.01" className="form-control" style={{ minWidth: '90px', padding: '4px 8px' }}
                      value={row.target_casual_qty || 0}
                      onChange={e => updateMonthRow(row.month, 'target_casual_qty', parseFloat(e.target.value) || 0)} />
                  ) : <span>{(row.target_casual_qty || 0).toLocaleString()}</span>}
                </td>
                <td>
                  {isEditable ? (
                    <input type="number" step="0.01" className="form-control" style={{ minWidth: '90px', padding: '4px 8px' }}
                      value={row.target_casual_val || 0}
                      onChange={e => updateMonthRow(row.month, 'target_casual_val', parseFloat(e.target.value) || 0)} />
                  ) : <span>{(row.target_casual_val || 0).toLocaleString()}</span>}
                </td>
                {/* Fashion */}
                <td>
                  {isEditable ? (
                    <input type="number" step="0.01" className="form-control" style={{ minWidth: '90px', padding: '4px 8px' }}
                      value={row.target_fashion_qty || 0}
                      onChange={e => updateMonthRow(row.month, 'target_fashion_qty', parseFloat(e.target.value) || 0)} />
                  ) : <span>{(row.target_fashion_qty || 0).toLocaleString()}</span>}
                </td>
                <td>
                  {isEditable ? (
                    <input type="number" step="0.01" className="form-control" style={{ minWidth: '90px', padding: '4px 8px' }}
                      value={row.target_fashion_val || 0}
                      onChange={e => updateMonthRow(row.month, 'target_fashion_val', parseFloat(e.target.value) || 0)} />
                  ) : <span>{(row.target_fashion_val || 0).toLocaleString()}</span>}
                </td>
                {/* Totals (auto) */}
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{tQty.toLocaleString()}</td>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{tVal.toLocaleString()}</td>
                {editable && (
                  <td>
                    {!locked ? (
                      <button className="btn btn-success btn-sm" title="Confirm & Lock this month"
                        style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                        onClick={() => handleLockMonth(row.month)}>
                        <Lock size={11} /> Confirm
                      </button>
                    ) : (
                      <span style={{ color: 'var(--secondary)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={12} /> Locked
                      </span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ background: 'var(--bg-dark)', fontWeight: 700 }}>
            <td>TOTAL</td>
            <td style={{ color: '#6366f1' }}>{monthRows.reduce((s, r) => s + (r.target_basic_qty || 0), 0).toLocaleString()}</td>
            <td style={{ color: '#6366f1' }}>{monthRows.reduce((s, r) => s + (r.target_basic_val || 0), 0).toLocaleString()}</td>
            <td style={{ color: '#10b981' }}>{monthRows.reduce((s, r) => s + (r.target_casual_qty || 0), 0).toLocaleString()}</td>
            <td style={{ color: '#10b981' }}>{monthRows.reduce((s, r) => s + (r.target_casual_val || 0), 0).toLocaleString()}</td>
            <td style={{ color: '#f59e0b' }}>{monthRows.reduce((s, r) => s + (r.target_fashion_qty || 0), 0).toLocaleString()}</td>
            <td style={{ color: '#f59e0b' }}>{monthRows.reduce((s, r) => s + (r.target_fashion_val || 0), 0).toLocaleString()}</td>
            <td style={{ color: 'var(--primary)', fontSize: '1rem' }}>
              {monthRows.reduce((s, r) => s + (r.target_basic_qty || 0) + (r.target_casual_qty || 0) + (r.target_fashion_qty || 0), 0).toLocaleString()}
            </td>
            <td style={{ color: 'var(--primary)', fontSize: '1rem' }}>
              {monthRows.reduce((s, r) => s + (r.target_basic_val || 0) + (r.target_casual_val || 0) + (r.target_fashion_val || 0), 0).toLocaleString()}
            </td>
            {editable && <td />}
          </tr>
        </tfoot>
      </table>
    </div>
  );

  // ======================== LIST VIEW ========================
  if (subView === 'list') {
    return (
      <div className="dashboard-card">
        {showConfirmPopup && <ConfirmPopup />}
        <div className="card-header" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '15px' }}>
            <h2 className="card-title"><Target /> Sales Target Tracking (CRM)</h2>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>

              {/* Filter Mode */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <label style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--text-secondary)' }}>Filter Mode:</label>
                <select
                  className="form-control"
                  style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
                  value={filterMode}
                  onChange={e => { setFilterMode(e.target.value as any); setCrmYearFilter(String(new Date().getFullYear())); setCrmBuyerFilter(''); }}
                >
                  <option value="all">Show All Targets</option>
                  <option value="year">By Specific Year</option>
                  <option value="buyer">By Specific Buyer</option>
                  <option value="status">By Status</option>
                </select>
              </div>

              {/* Simulate Role */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <label style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--text-secondary)' }}>Simulate Role:</label>
                <select className="form-control" style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }} value={crmSimRole} onChange={e => setCrmSimRole(e.target.value)}>
                  <option value="super_admin">Super Admin</option>
                  <option value="production_manager">Production Manager</option>
                  <option value="store_manager">Store Manager</option>
                  <option value="merchandiser_manager">Merchandising Manager</option>
                  <option value="merchandiser">Merchandiser</option>
                  <option value="others">Others (Buyer)</option>
                </select>
              </div>

              {/* New CRM Target Button */}
              <button className="btn btn-primary" onClick={() => {
                setForm({ ...blankForm, unit: currentUser?.unit || '' });
                setMonthRows(blankMonths);
                setSubView('create');
              }}>
                <Plus size={16} /> New CRM Target
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px 20px', background: 'transparent' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search by Buyer, Ref#, Buying Agent, Team Leader..."
                value={crmSearch}
                onChange={e => setCrmSearch(e.target.value)}
                style={{ paddingLeft: '36px', height: '36px', background: 'var(--bg-input)', border: '1px solid var(--border-muted)', borderRadius: '6px', color: 'var(--text-primary)' }}
              />
            </div>

            {/* Status filter dropdown */}
            <select
              className="form-control"
              value={crmStatusFilter}
              onChange={e => setCrmStatusFilter(e.target.value)}
              style={{ width: '180px', height: '36px', background: 'var(--bg-input)', border: '1px solid var(--border-muted)', borderRadius: '6px', color: 'var(--text-primary)' }}
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Approved">Approved</option>
            </select>

            {/* Year filter (if filterMode === year) */}
            {filterMode === 'year' && (
              <select className="form-control" value={crmYearFilter} onChange={e => setCrmYearFilter(e.target.value)}
                style={{ width: '130px', height: '36px', background: 'var(--bg-input)', border: '1px solid var(--border-muted)', borderRadius: '6px', color: 'var(--text-primary)' }}>
                {YEARS_LIST.map(y => <option key={y} value={String(y)}>{y}</option>)}
              </select>
            )}

            {/* Buyer filter (if filterMode === buyer) */}
            {filterMode === 'buyer' && (
              <input type="text" className="form-control" placeholder="Filter by buyer name..."
                value={crmBuyerFilter} onChange={e => setCrmBuyerFilter(e.target.value)}
                style={{ width: '200px', height: '36px', background: 'var(--bg-input)', border: '1px solid var(--border-muted)', borderRadius: '6px', color: 'var(--text-primary)' }} />
            )}

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500', whiteSpace: 'nowrap' }}>
              Found {getFilteredTargets().length} Target{getFilteredTargets().length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: '1200px' }}>
            <thead>
              <tr>
                <th rowSpan={2} style={{ minWidth: '50px' }}>Ref#</th>
                <th rowSpan={2}>Buyer</th>
                <th rowSpan={2}>Buying Agent</th>
                <th colSpan={2} style={{ textAlign: 'center', background: 'rgba(99,102,241,0.15)', borderBottom: '2px solid #6366f1' }}>Basic</th>
                <th colSpan={2} style={{ textAlign: 'center', background: 'rgba(16,185,129,0.15)', borderBottom: '2px solid #10b981' }}>Casual Basic</th>
                <th colSpan={2} style={{ textAlign: 'center', background: 'rgba(245,158,11,0.15)', borderBottom: '2px solid #f59e0b' }}>Fashion</th>
                <th colSpan={4} style={{ textAlign: 'center', background: 'rgba(239,68,68,0.12)', borderBottom: '2px solid #ef4444' }}>Total</th>
                <th rowSpan={2}>Year</th>
                <th rowSpan={2}>Status</th>
                <th rowSpan={2}>Actions</th>
              </tr>
              <tr>
                <th style={{ background: 'rgba(99,102,241,0.08)', fontSize: '0.7rem' }}>Tgt Qty</th>
                <th style={{ background: 'rgba(99,102,241,0.08)', fontSize: '0.7rem' }}>Tgt Val</th>
                <th style={{ background: 'rgba(16,185,129,0.08)', fontSize: '0.7rem' }}>Tgt Qty</th>
                <th style={{ background: 'rgba(16,185,129,0.08)', fontSize: '0.7rem' }}>Tgt Val</th>
                <th style={{ background: 'rgba(245,158,11,0.08)', fontSize: '0.7rem' }}>Tgt Qty</th>
                <th style={{ background: 'rgba(245,158,11,0.08)', fontSize: '0.7rem' }}>Tgt Val</th>
                <th style={{ background: 'rgba(239,68,68,0.06)', fontSize: '0.7rem' }}>Tgt Qty</th>
                <th style={{ background: 'rgba(239,68,68,0.06)', fontSize: '0.7rem' }}>Tgt Val</th>
                <th style={{ background: 'rgba(239,68,68,0.06)', fontSize: '0.7rem' }}>Ach Qty</th>
                <th style={{ background: 'rgba(239,68,68,0.06)', fontSize: '0.7rem' }}>Ach Val</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredTargets().length === 0 ? (
                <tr><td colSpan={18} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No sales targets found. Click "New CRM Target" to create one.
                </td></tr>
              ) : getFilteredTargets().map((t, idx) => (
                <tr key={idx}>
                  <td><strong>{t.style_id || `ST-${String(t.id).padStart(4, '0')}`}</strong></td>
                  <td><strong>{t.buyer_name || '—'}</strong></td>
                  <td>{t.buying_agent || '—'}</td>
                  {/* Basic */}
                  <td style={{ color: '#6366f1' }}>{parseFloat(t.total_basic_qty || 0).toLocaleString()}</td>
                  <td style={{ color: '#6366f1' }}>{parseFloat(t.total_basic_val || 0).toLocaleString()}</td>
                  {/* Casual Basic */}
                  <td style={{ color: '#10b981' }}>{parseFloat(t.total_casual_qty || 0).toLocaleString()}</td>
                  <td style={{ color: '#10b981' }}>{parseFloat(t.total_casual_val || 0).toLocaleString()}</td>
                  {/* Fashion */}
                  <td style={{ color: '#f59e0b' }}>{parseFloat(t.total_fashion_qty || 0).toLocaleString()}</td>
                  <td style={{ color: '#f59e0b' }}>{parseFloat(t.total_fashion_val || 0).toLocaleString()}</td>
                  {/* Total */}
                  <td style={{ fontWeight: 700 }}>{parseFloat(t.target_qty || 0).toLocaleString()}</td>
                  <td style={{ fontWeight: 700 }}>{parseFloat(t.target_value || 0).toLocaleString()}</td>
                  <td style={{ color: 'var(--secondary)', fontWeight: 600 }}>{parseFloat(t.achieve_qty || 0).toLocaleString()}</td>
                  <td style={{ color: 'var(--secondary)', fontWeight: 600 }}>{parseFloat(t.achieve_value || 0).toLocaleString()}</td>
                  <td>{t.year}</td>
                  <td>
                    <span className={`badge badge-${(t.status || 'draft').toLowerCase()}`}>
                      {t.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap', alignItems: 'center' }}>
                      <button className="btn btn-xs" style={{ padding: '3px 8px', background: 'rgba(99,102,241,0.15)', color: '#6366f1', border: '1px solid #6366f1', borderRadius: '6px', fontSize: '0.72rem' }}
                        title="View Details" onClick={() => loadTargetForView(t.id)}>
                        <Eye size={12} /> View
                      </button>
                      <button className="btn btn-xs" style={{ padding: '3px 8px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid #f59e0b', borderRadius: '6px', fontSize: '0.72rem' }}
                        title="Edit" onClick={async () => { await loadTargetForEdit(t.id); setSubView('edit'); }}>
                        <Edit size={12} /> Edit
                      </button>
                      <button className="btn btn-xs" style={{ padding: '3px 8px', background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', fontSize: '0.72rem' }}
                        title="Delete" onClick={() => handleDelete(t.id)}>
                        <Trash2 size={12} />
                      </button>
                      <button className="btn btn-xs" style={{ padding: '3px 8px', background: 'rgba(99,102,241,0.15)', color: '#6366f1', border: '1px solid #6366f1', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600 }}
                        title="Submit to Manager" onClick={() => { if (confirm('Submit this Sales Target to Manager?')) handleUpdateStatus(t.id, 'Submitted'); }}>
                        ⚡ Submit
                      </button>

                      {t.status === 'Approved' && (
                        <span className="badge badge-approved" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid #10b981', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                          ✓ Approved
                        </span>
                      )}
                      {t.status === 'Rejected' && (
                        <span className="badge badge-rejected" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid #ef4444', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                          ✗ Rejected
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ======================== CREATE VIEW ========================
  if (subView === 'create') {
    return (
      <div className="dashboard-card">
        {showConfirmPopup && <ConfirmPopup />}
        <div className="card-header">
          <h2 className="card-title"><Plus size={18} /> New Sales Target (CRM)</h2>
          <button className="btn btn-secondary" onClick={() => setSubView('list')}>
            <ArrowLeft size={16} /> Back to List
          </button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-muted)', paddingBottom: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} /> Basic Information
          </h4>
          <HeaderForm />
        </div>

        <div>
          <h4 style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-muted)', paddingBottom: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={16} /> Month Wise Target Details
          </h4>
          <MonthGrid editable={true} />
        </div>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => setSubView('list')}>Cancel</button>
          <button className="btn btn-primary" onClick={() => validateAndSubmit(handleCreate)}>
            <Save size={16} /> Save Target
          </button>
        </div>
      </div>
    );
  }

  // ======================== EDIT VIEW ========================
  if (subView === 'edit' && selectedTarget) {
    return (
      <div className="dashboard-card">
        {showConfirmPopup && <ConfirmPopup />}
        <div className="card-header">
          <h2 className="card-title"><Edit size={18} /> Edit Sales Target — {selectedTarget.style_id ? `REF#${selectedTarget.style_id}` : `ST-${String(selectedTarget.id).padStart(4, '0')}`}</h2>
          <button className="btn btn-secondary" onClick={() => setSubView('list')}>
            <ArrowLeft size={16} /> Back to List
          </button>
        </div>

        <div style={{ marginBottom: '8px', padding: '10px 16px', background: 'rgba(245,158,11,0.08)', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.3)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <AlertCircle size={14} style={{ display: 'inline', marginRight: '6px', color: '#f59e0b', verticalAlign: 'middle' }} />
          Confirmed (locked) month rows cannot be changed. Only unlocked rows are editable.
        </div>

        <div style={{ marginBottom: '24px', marginTop: '16px' }}>
          <h4 style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-muted)', paddingBottom: '8px', marginBottom: '16px' }}>
            Basic Information
          </h4>
          <HeaderForm />
        </div>

        <div>
          <h4 style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-muted)', paddingBottom: '8px', marginBottom: '16px' }}>
            Month Wise Target Details
          </h4>
          <MonthGrid editable={true} />
        </div>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => setSubView('list')}>Cancel</button>
          <button className="btn btn-primary" onClick={() => validateAndSubmit(handleUpdate)}>
            <Save size={16} /> Update Target
          </button>
        </div>
      </div>
    );
  }

  // ======================== VIEW PAGE ========================
  if (subView === 'view' && selectedTarget) {
    const months = selectedTarget.months || [];
    return (
      <div className="dashboard-card white-report-view">
        <div className="card-header">
          <h2 className="card-title"><Eye size={18} /> Sales Target Detail — {selectedTarget.style_id ? `REF#${selectedTarget.style_id}` : `ST-${String(selectedTarget.id).padStart(4, '0')}`}</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 14px' }}
              onClick={async () => { await loadTargetForEdit(selectedTarget.id); setSubView('edit'); }}>
              <Edit size={14} /> Edit
            </button>
            <button className="btn btn-secondary" onClick={() => setSubView('list')}>
              <ArrowLeft size={16} /> Back
            </button>
          </div>
        </div>

        {/* Basic Info Card */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px',
          background: 'var(--bg-dark)', borderRadius: '12px', padding: '20px', marginBottom: '24px',
          border: '1px solid var(--border-muted)'
        }}>
          {[
            ['Year', selectedTarget.year],
            ['Buyer', selectedTarget.buyer_name || '—'],
            ['Style ID', selectedTarget.style_id || '—'],
            ['Buying Agent', selectedTarget.buying_agent || '—'],
            ['Buying Agent Merchant', selectedTarget.buying_agent_merchant || '—'],
            ['Status', selectedTarget.status],
            ['Created At', selectedTarget.created_at ? new Date(selectedTarget.created_at).toLocaleDateString() : '—'],
          ].map(([label, val]) => (
            <div key={label as string}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Sales Target Details Table */}
        <h4 style={{ color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={16} /> Sales Target Details
        </h4>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: '1500px' }}>
            <thead>
              <tr>
                <th rowSpan={2} style={{ minWidth: '40px' }}>SL</th>
                <th rowSpan={2} style={{ minWidth: '110px' }}>Month</th>
                <th colSpan={5} style={{ textAlign: 'center', background: 'rgba(99,102,241,0.15)', borderBottom: '2px solid #6366f1' }}>Basic</th>
                <th colSpan={5} style={{ textAlign: 'center', background: 'rgba(16,185,129,0.15)', borderBottom: '2px solid #10b981' }}>Casual Basic</th>
                <th colSpan={5} style={{ textAlign: 'center', background: 'rgba(245,158,11,0.15)', borderBottom: '2px solid #f59e0b' }}>Fashion</th>
                <th colSpan={5} style={{ textAlign: 'center', background: 'rgba(239,68,68,0.12)', borderBottom: '2px solid #ef4444' }}>Total</th>
                <th rowSpan={2} style={{ minWidth: '80px' }}>Currency</th>
              </tr>
              <tr>
                {['Tgt Qty', 'Tgt Val', 'Ach Qty', 'Ach Val', 'Ach %'].map(h => (
                  <th key={`b-${h}`} style={{ background: 'rgba(99,102,241,0.08)', fontSize: '0.68rem' }}>{h}</th>
                ))}
                {['Tgt Qty', 'Tgt Val', 'Ach Qty', 'Ach Val', 'Ach %'].map(h => (
                  <th key={`c-${h}`} style={{ background: 'rgba(16,185,129,0.08)', fontSize: '0.68rem' }}>{h}</th>
                ))}
                {['Tgt Qty', 'Tgt Val', 'Ach Qty', 'Ach Val', 'Ach %'].map(h => (
                  <th key={`f-${h}`} style={{ background: 'rgba(245,158,11,0.08)', fontSize: '0.68rem' }}>{h}</th>
                ))}
                {['Total Qty', 'Total Val', 'Ach Qty', 'Ach Val', 'Ach %'].map(h => (
                  <th key={`t-${h}`} style={{ background: 'rgba(239,68,68,0.06)', fontSize: '0.68rem', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {months.map((m: any, idx: number) => {
                const tQty = (m.target_basic_qty || 0) + (m.target_casual_qty || 0) + (m.target_fashion_qty || 0);
                const tVal = (m.target_basic_val || 0) + (m.target_casual_val || 0) + (m.target_fashion_val || 0);
                const aQty = (m.achieve_basic_qty || 0) + (m.achieve_casual_qty || 0) + (m.achieve_fashion_qty || 0);
                const aVal = (m.achieve_basic_val || 0) + (m.achieve_casual_val || 0) + (m.achieve_fashion_val || 0);
                const bAchPct = m.target_basic_qty ? ((m.achieve_basic_qty || 0) / m.target_basic_qty * 100) : 0;
                const cAchPct = m.target_casual_qty ? ((m.achieve_casual_qty || 0) / m.target_casual_qty * 100) : 0;
                const fAchPct = m.target_fashion_qty ? ((m.achieve_fashion_qty || 0) / m.target_fashion_qty * 100) : 0;
                const totAchPct = tQty ? (aQty / tQty * 100) : 0;
                const pct = (v: number) => <span style={{ color: v >= 100 ? 'var(--secondary)' : v > 0 ? '#f59e0b' : 'var(--text-muted)', fontWeight: 600 }}>{v.toFixed(1)}%</span>;
                return (
                  <tr key={idx} style={{ background: m.is_locked ? 'rgba(16,185,129,0.04)' : undefined }}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {m.is_locked ? <Lock size={11} style={{ color: 'var(--secondary)' }} /> : null}{m.month}
                    </td>
                    {/* Basic */}
                    <td style={{ color: '#6366f1' }}>{(m.target_basic_qty || 0).toLocaleString()}</td>
                    <td style={{ color: '#6366f1' }}>{(m.target_basic_val || 0).toLocaleString()}</td>
                    <td>{(m.achieve_basic_qty || 0).toLocaleString()}</td>
                    <td>{(m.achieve_basic_val || 0).toLocaleString()}</td>
                    <td>{pct(bAchPct)}</td>
                    {/* Casual */}
                    <td style={{ color: '#10b981' }}>{(m.target_casual_qty || 0).toLocaleString()}</td>
                    <td style={{ color: '#10b981' }}>{(m.target_casual_val || 0).toLocaleString()}</td>
                    <td>{(m.achieve_casual_qty || 0).toLocaleString()}</td>
                    <td>{(m.achieve_casual_val || 0).toLocaleString()}</td>
                    <td>{pct(cAchPct)}</td>
                    {/* Fashion */}
                    <td style={{ color: '#f59e0b' }}>{(m.target_fashion_qty || 0).toLocaleString()}</td>
                    <td style={{ color: '#f59e0b' }}>{(m.target_fashion_val || 0).toLocaleString()}</td>
                    <td>{(m.achieve_fashion_qty || 0).toLocaleString()}</td>
                    <td>{(m.achieve_fashion_val || 0).toLocaleString()}</td>
                    <td>{pct(fAchPct)}</td>
                    {/* Total */}
                    <td style={{ fontWeight: 700 }}>{tQty.toLocaleString()}</td>
                    <td style={{ fontWeight: 700 }}>{tVal.toLocaleString()}</td>
                    <td style={{ color: 'var(--secondary)', fontWeight: 600 }}>{aQty.toLocaleString()}</td>
                    <td style={{ color: 'var(--secondary)', fontWeight: 600 }}>{aVal.toLocaleString()}</td>
                    <td>{pct(totAchPct)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>USD</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: 'var(--bg-dark)', fontWeight: 700 }}>
                <td colSpan={2}>GRAND TOTAL</td>
                <td style={{ color: '#6366f1' }}>{months.reduce((s: number, m: any) => s + (m.target_basic_qty || 0), 0).toLocaleString()}</td>
                <td style={{ color: '#6366f1' }}>{months.reduce((s: number, m: any) => s + (m.target_basic_val || 0), 0).toLocaleString()}</td>
                <td>{months.reduce((s: number, m: any) => s + (m.achieve_basic_qty || 0), 0).toLocaleString()}</td>
                <td>{months.reduce((s: number, m: any) => s + (m.achieve_basic_val || 0), 0).toLocaleString()}</td>
                <td>—</td>
                <td style={{ color: '#10b981' }}>{months.reduce((s: number, m: any) => s + (m.target_casual_qty || 0), 0).toLocaleString()}</td>
                <td style={{ color: '#10b981' }}>{months.reduce((s: number, m: any) => s + (m.target_casual_val || 0), 0).toLocaleString()}</td>
                <td>{months.reduce((s: number, m: any) => s + (m.achieve_casual_qty || 0), 0).toLocaleString()}</td>
                <td>{months.reduce((s: number, m: any) => s + (m.achieve_casual_val || 0), 0).toLocaleString()}</td>
                <td>—</td>
                <td style={{ color: '#f59e0b' }}>{months.reduce((s: number, m: any) => s + (m.target_fashion_qty || 0), 0).toLocaleString()}</td>
                <td style={{ color: '#f59e0b' }}>{months.reduce((s: number, m: any) => s + (m.target_fashion_val || 0), 0).toLocaleString()}</td>
                <td>{months.reduce((s: number, m: any) => s + (m.achieve_fashion_qty || 0), 0).toLocaleString()}</td>
                <td>{months.reduce((s: number, m: any) => s + (m.achieve_fashion_val || 0), 0).toLocaleString()}</td>
                <td>—</td>
                <td style={{ fontSize: '1rem' }}>
                  {months.reduce((s: number, m: any) => s + (m.target_basic_qty || 0) + (m.target_casual_qty || 0) + (m.target_fashion_qty || 0), 0).toLocaleString()}
                </td>
                <td style={{ fontSize: '1rem' }}>
                  {months.reduce((s: number, m: any) => s + (m.target_basic_val || 0) + (m.target_casual_val || 0) + (m.target_fashion_val || 0), 0).toLocaleString()}
                </td>
                <td style={{ color: 'var(--secondary)' }}>
                  {months.reduce((s: number, m: any) => s + (m.achieve_basic_qty || 0) + (m.achieve_casual_qty || 0) + (m.achieve_fashion_qty || 0), 0).toLocaleString()}
                </td>
                <td style={{ color: 'var(--secondary)' }}>
                  {months.reduce((s: number, m: any) => s + (m.achieve_basic_val || 0) + (m.achieve_casual_val || 0) + (m.achieve_fashion_val || 0), 0).toLocaleString()}
                </td>
                <td>—</td>
                <td>USD</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  }

  return null;
}


// ==========================================================================
// SUB-VIEW: CRM Sales Target vs Achievement MIS Report
// ==========================================================================
function SalesTargetMISView({ buyers: _buyers }: { buyers: any[] }) {
  const [subView, setSubView] = useState<'list' | 'view'>('list');
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [reportRows, setReportRows] = useState<any[]>([]);

  const loadTargetForView = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/sales-targets/${id}`);
      const data = await res.json();
      setSelectedTarget(data);
      setSubView('view');
    } catch (e) { console.error(e); }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${API_BASE}/sales-targets/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        await fetchReport();
      }
    } catch (e) { console.error(e); }
  };
  const [yearFilter, setYearFilter] = useState('2026');
  const [searchFilter, setSearchFilter] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'year' | 'month'>('all');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [simRole, setSimRole] = useState('Super Admin');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchReport();
  }, [yearFilter, searchFilter, filterMode, selectedMonth, statusFilter]);

  const fetchReport = async () => {
    try {
      let url = `${API_BASE}/reports/sales-target-mis`;
      const res = await fetch(url);
      const data = await res.json();

      // Apply filters in frontend for convenience
      let filtered = data;

      if (filterMode === 'year') {
        filtered = filtered.filter((r: any) => String(r.year) === yearFilter);
      } else if (filterMode === 'month') {
        if (selectedMonth) {
          const [mYear, mMonth] = selectedMonth.split('-');
          filtered = filtered.filter((r: any) =>
            String(r.year) === mYear && String(r.month) === mMonth
          );
        }
      }
      // filterMode === 'all' → show everything

      if (searchFilter) {
        const q = searchFilter.trim().toLowerCase();
        filtered = filtered.filter((r: any) =>
          (r.brand || '').toLowerCase().includes(q) ||
          (r.buyer_name || '').toLowerCase().includes(q)
        );
      }

      // Status filter
      if (statusFilter !== 'All') {
        filtered = filtered.filter((r: any) =>
          (r.status || '').toLowerCase() === statusFilter.toLowerCase()
        );
      }

      // Role-based visibility simulation
      if (simRole === 'Merchandiser') {
        const currentUser = (() => {
          try { const s = localStorage.getItem('metamorphosis_user'); return s ? JSON.parse(s) : null; } catch { return null; }
        })();
        if (currentUser) {
          filtered = filtered.filter((r: any) =>
            (r.assigned_to || '').toLowerCase() === (currentUser.name || '').toLowerCase()
          );
        }
      }

      setReportRows(filtered);
    } catch (e) { console.error("Error fetching MIS report", e); }
  };

  // ======================== VIEW PAGE ========================
  if (subView === 'view' && selectedTarget) {
    const months = selectedTarget.months || [];
    return (
      <div className="dashboard-card white-report-view">
        <div className="card-header">
          <h2 className="card-title"><Eye size={18} /> Sales Target Detail — {selectedTarget.style_id ? `REF#${selectedTarget.style_id}` : `ST-${String(selectedTarget.id).padStart(4, '0')}`}</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={() => setSubView('list')}>
              <ArrowLeft size={16} /> Back
            </button>
          </div>
        </div>

        {/* Basic Info Card */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px',
          background: 'var(--bg-dark)', borderRadius: '12px', padding: '20px', marginBottom: '24px',
          border: '1px solid var(--border-muted)'
        }}>
          {[
            ['Year', selectedTarget.year],
            ['Buyer', selectedTarget.buyer_name || '—'],
            ['Style ID', selectedTarget.style_id || '—'],
            ['Buying Agent', selectedTarget.buying_agent || '—'],
            ['Buying Agent Merchant', selectedTarget.buying_agent_merchant || '—'],
            ['Status', selectedTarget.status],
            ['Created At', selectedTarget.created_at ? new Date(selectedTarget.created_at).toLocaleDateString() : '—'],
          ].map(([label, val]) => (
            <div key={label as string}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Sales Target Details Table */}
        <h4 style={{ color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={16} /> Sales Target Details
        </h4>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: '1500px' }}>
            <thead>
              <tr>
                <th rowSpan={2} style={{ minWidth: '40px' }}>SL</th>
                <th rowSpan={2} style={{ minWidth: '110px' }}>Month</th>
                <th colSpan={5} style={{ textAlign: 'center', background: 'rgba(99,102,241,0.15)', borderBottom: '2px solid #6366f1' }}>Basic</th>
                <th colSpan={5} style={{ textAlign: 'center', background: 'rgba(16,185,129,0.15)', borderBottom: '2px solid #10b981' }}>Casual Basic</th>
                <th colSpan={5} style={{ textAlign: 'center', background: 'rgba(245,158,11,0.15)', borderBottom: '2px solid #f59e0b' }}>Fashion</th>
                <th colSpan={5} style={{ textAlign: 'center', background: 'rgba(239,68,68,0.12)', borderBottom: '2px solid #ef4444' }}>Total</th>
                <th rowSpan={2} style={{ minWidth: '80px' }}>Currency</th>
              </tr>
              <tr>
                {['Tgt Qty', 'Tgt Val', 'Ach Qty', 'Ach Val', 'Ach %'].map(h => (
                  <th key={`b-${h}`} style={{ background: 'rgba(99,102,241,0.08)', fontSize: '0.68rem' }}>{h}</th>
                ))}
                {['Tgt Qty', 'Tgt Val', 'Ach Qty', 'Ach Val', 'Ach %'].map(h => (
                  <th key={`c-${h}`} style={{ background: 'rgba(16,185,129,0.08)', fontSize: '0.68rem' }}>{h}</th>
                ))}
                {['Tgt Qty', 'Tgt Val', 'Ach Qty', 'Ach Val', 'Ach %'].map(h => (
                  <th key={`f-${h}`} style={{ background: 'rgba(245,158,11,0.08)', fontSize: '0.68rem' }}>{h}</th>
                ))}
                {['Total Qty', 'Total Val', 'Ach Qty', 'Ach Val', 'Ach %'].map(h => (
                  <th key={`t-${h}`} style={{ background: 'rgba(239,68,68,0.06)', fontSize: '0.68rem', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {months.map((m: any, idx: number) => {
                const tQty = (m.target_basic_qty || 0) + (m.target_casual_qty || 0) + (m.target_fashion_qty || 0);
                const tVal = (m.target_basic_val || 0) + (m.target_casual_val || 0) + (m.target_fashion_val || 0);
                const aQty = (m.achieve_basic_qty || 0) + (m.achieve_casual_qty || 0) + (m.achieve_fashion_qty || 0);
                const aVal = (m.achieve_basic_val || 0) + (m.achieve_casual_val || 0) + (m.achieve_fashion_val || 0);
                const bAchPct = m.target_basic_qty ? ((m.achieve_basic_qty || 0) / m.target_basic_qty * 100) : 0;
                const cAchPct = m.target_casual_qty ? ((m.achieve_casual_qty || 0) / m.target_casual_qty * 100) : 0;
                const fAchPct = m.target_fashion_qty ? ((m.achieve_fashion_qty || 0) / m.target_fashion_qty * 100) : 0;
                const totAchPct = tQty ? (aQty / tQty * 100) : 0;
                const pct = (v: number) => <span style={{ color: v >= 100 ? 'var(--secondary)' : v > 0 ? '#f59e0b' : 'var(--text-muted)', fontWeight: 600 }}>{v.toFixed(1)}%</span>;
                return (
                  <tr key={idx} style={{ background: m.is_locked ? 'rgba(16,185,129,0.04)' : undefined }}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {m.is_locked ? <Lock size={11} style={{ color: 'var(--secondary)' }} /> : null}{m.month}
                    </td>
                    {/* Basic */}
                    <td style={{ color: '#6366f1' }}>{(m.target_basic_qty || 0).toLocaleString()}</td>
                    <td style={{ color: '#6366f1' }}>{(m.target_basic_val || 0).toLocaleString()}</td>
                    <td>{(m.achieve_basic_qty || 0).toLocaleString()}</td>
                    <td>{(m.achieve_basic_val || 0).toLocaleString()}</td>
                    <td>{pct(bAchPct)}</td>
                    {/* Casual */}
                    <td style={{ color: '#10b981' }}>{(m.target_casual_qty || 0).toLocaleString()}</td>
                    <td style={{ color: '#10b981' }}>{(m.target_casual_val || 0).toLocaleString()}</td>
                    <td>{(m.achieve_casual_qty || 0).toLocaleString()}</td>
                    <td>{(m.achieve_casual_val || 0).toLocaleString()}</td>
                    <td>{pct(cAchPct)}</td>
                    {/* Fashion */}
                    <td style={{ color: '#f59e0b' }}>{(m.target_fashion_qty || 0).toLocaleString()}</td>
                    <td style={{ color: '#f59e0b' }}>{(m.target_fashion_val || 0).toLocaleString()}</td>
                    <td>{(m.achieve_fashion_qty || 0).toLocaleString()}</td>
                    <td>{(m.achieve_fashion_val || 0).toLocaleString()}</td>
                    <td>{pct(fAchPct)}</td>
                    {/* Total */}
                    <td style={{ fontWeight: 700 }}>{tQty.toLocaleString()}</td>
                    <td style={{ fontWeight: 700 }}>{tVal.toLocaleString()}</td>
                    <td style={{ color: 'var(--secondary)', fontWeight: 600 }}>{aQty.toLocaleString()}</td>
                    <td style={{ color: 'var(--secondary)', fontWeight: 600 }}>{aVal.toLocaleString()}</td>
                    <td>{pct(totAchPct)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>USD</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: 'var(--bg-dark)', fontWeight: 700 }}>
                <td colSpan={2}>GRAND TOTAL</td>
                <td style={{ color: '#6366f1' }}>{months.reduce((s: number, m: any) => s + (m.target_basic_qty || 0), 0).toLocaleString()}</td>
                <td style={{ color: '#6366f1' }}>{months.reduce((s: number, m: any) => s + (m.target_basic_val || 0), 0).toLocaleString()}</td>
                <td>{months.reduce((s: number, m: any) => s + (m.achieve_basic_qty || 0), 0).toLocaleString()}</td>
                <td>{months.reduce((s: number, m: any) => s + (m.achieve_basic_val || 0), 0).toLocaleString()}</td>
                <td>—</td>
                <td style={{ color: '#10b981' }}>{months.reduce((s: number, m: any) => s + (m.target_casual_qty || 0), 0).toLocaleString()}</td>
                <td style={{ color: '#10b981' }}>{months.reduce((s: number, m: any) => s + (m.target_casual_val || 0), 0).toLocaleString()}</td>
                <td>{months.reduce((s: number, m: any) => s + (m.achieve_casual_qty || 0), 0).toLocaleString()}</td>
                <td>{months.reduce((s: number, m: any) => s + (m.achieve_casual_val || 0), 0).toLocaleString()}</td>
                <td>—</td>
                <td style={{ color: '#f59e0b' }}>{months.reduce((s: number, m: any) => s + (m.target_fashion_qty || 0), 0).toLocaleString()}</td>
                <td style={{ color: '#f59e0b' }}>{months.reduce((s: number, m: any) => s + (m.target_fashion_val || 0), 0).toLocaleString()}</td>
                <td>{months.reduce((s: number, m: any) => s + (m.achieve_fashion_qty || 0), 0).toLocaleString()}</td>
                <td>{months.reduce((s: number, m: any) => s + (m.achieve_fashion_val || 0), 0).toLocaleString()}</td>
                <td>—</td>
                <td style={{ fontSize: '1rem' }}>
                  {months.reduce((s: number, m: any) => s + (m.target_basic_qty || 0) + (m.target_casual_qty || 0) + (m.target_fashion_qty || 0), 0).toLocaleString()}
                </td>
                <td style={{ fontSize: '1rem' }}>
                  {months.reduce((s: number, m: any) => s + (m.target_basic_val || 0) + (m.target_casual_val || 0) + (m.target_fashion_val || 0), 0).toLocaleString()}
                </td>
                <td style={{ color: 'var(--secondary)' }}>
                  {months.reduce((s: number, m: any) => s + (m.achieve_basic_qty || 0) + (m.achieve_casual_qty || 0) + (m.achieve_fashion_qty || 0), 0).toLocaleString()}
                </td>
                <td style={{ color: 'var(--secondary)' }}>
                  {months.reduce((s: number, m: any) => s + (m.achieve_basic_val || 0) + (m.achieve_casual_val || 0) + (m.achieve_fashion_val || 0), 0).toLocaleString()}
                </td>
                <td>—</td>
                <td>USD</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div className="card-header" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '15px' }}>
          <h2 className="card-title"><TrendingUp /> Target vs Achievement (MIS Analysis)</h2>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>

            {/* Filter Mode */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--text-secondary)' }}>Filter Mode:</label>
              <select
                className="form-control"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
                value={filterMode}
                onChange={(e) => {
                  setFilterMode(e.target.value as any);
                  setSelectedMonth('');
                  setYearFilter(String(new Date().getFullYear()));
                }}
              >
                <option value="all">Show All Targets</option>
                <option value="year">By Specific Year</option>
                <option value="month">By Specific Month</option>
              </select>
            </div>

            {/* Simulate Role */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--text-secondary)' }}>Simulate Role:</label>
              <select
                className="form-control"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
                value={simRole}
                onChange={(e) => setSimRole(e.target.value)}
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Production Manager">Production Manager</option>
                <option value="Store Manager">Store Manager</option>
                <option value="Merchandising Manager">Merchandising Manager</option>
                <option value="Merchandiser">Merchandiser</option>
                <option value="Others">Others (Buyer)</option>
              </select>
            </div>

          </div>
        </div>

        {/* Search & Filter Bar — CRM style */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '4px 0' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>

            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search by Buyer and Brand..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                style={{ paddingLeft: '36px', height: '36px', background: 'var(--bg-input)', border: '1px solid var(--border-muted)', borderRadius: '6px', color: 'var(--text-primary)' }}
              />
            </div>

            {/* Status filter */}
            <select
              className="form-control"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ width: '180px', height: '36px', background: 'var(--bg-input)', border: '1px solid var(--border-muted)', borderRadius: '6px', color: 'var(--text-primary)' }}
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Approved">Approved</option>
            </select>

            {/* Year picker (when filterMode === year) */}
            {filterMode === 'year' && (
              <select
                className="form-control"
                value={yearFilter}
                onChange={e => setYearFilter(e.target.value)}
                style={{ width: '130px', height: '36px', background: 'var(--bg-input)', border: '1px solid var(--border-muted)', borderRadius: '6px', color: 'var(--text-primary)' }}
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            )}

            {/* Month picker (when filterMode === month) */}
            {filterMode === 'month' && (
              <input
                type="month"
                className="form-control"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                style={{ width: '170px', height: '36px', background: 'var(--bg-input)', border: '1px solid var(--border-muted)', borderRadius: '6px', color: 'var(--text-primary)' }}
              />
            )}

            {/* Count */}
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500', whiteSpace: 'nowrap' }}>
              Found {reportRows.length} Target{reportRows.length !== 1 ? 's' : ''}
            </div>
          </div>
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
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reportRows.map((r, idx) => {
              const basicAchPct = r.target_basic_qty > 0 ? (r.confirm_qty / r.target_qty) * 100 : 0;
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
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap', alignItems: 'center' }}>
                      <button className="btn btn-xs" style={{ padding: '3px 8px', background: 'rgba(99,102,241,0.15)', color: '#6366f1', border: '1px solid #6366f1', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600 }}
                        title="View Details" onClick={() => loadTargetForView(r.id)}>
                        <Eye size={12} /> View
                      </button>
                      {r.status === 'Submitted' && (
                        <>
                          <button className="btn btn-xs" style={{ padding: '3px 8px', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid #10b981', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600 }}
                            title="Approve" onClick={() => { if (confirm('Approve this Sales Target?')) handleUpdateStatus(r.id, 'Approved'); }}>
                            ✓ Approve
                          </button>
                          <button className="btn btn-xs" style={{ padding: '3px 8px', background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600 }}
                            title="Reject" onClick={() => { if (confirm('Reject this Sales Target?')) handleUpdateStatus(r.id, 'Rejected'); }}>
                            ✗ Reject
                          </button>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '4px' }}>⏳ Pending</span>
                        </>
                      )}
                      {r.status === 'Approved' && (
                        <span className="badge badge-approved" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid #10b981', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                          ✓ Approved
                        </span>
                      )}
                      {r.status === 'Rejected' && (
                        <span className="badge badge-rejected" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid #ef4444', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                          ✗ Rejected
                        </span>
                      )}
                    </div>
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
const getFlagEmoji = (countryCode: string) => {
  if (!countryCode) return '';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const countriesList = [
  { name: "Afghanistan", code: "AF" },
  { name: "Albania", code: "AL" },
  { name: "Algeria", code: "DZ" },
  { name: "Andorra", code: "AD" },
  { name: "Angola", code: "AO" },
  { name: "Antigua and Barbuda", code: "AG" },
  { name: "Argentina", code: "AR" },
  { name: "Armenia", code: "AM" },
  { name: "Australia", code: "AU" },
  { name: "Austria", code: "AT" },
  { name: "Azerbaijan", code: "AZ" },
  { name: "Bahamas", code: "BS" },
  { name: "Bahrain", code: "BH" },
  { name: "Bangladesh", code: "BD" },
  { name: "Barbados", code: "BB" },
  { name: "Belarus", code: "BY" },
  { name: "Belgium", code: "BE" },
  { name: "Belize", code: "BZ" },
  { name: "Benin", code: "BJ" },
  { name: "Bhutan", code: "BT" },
  { name: "Bolivia", code: "BO" },
  { name: "Bosnia and Herzegovina", code: "BA" },
  { name: "Botswana", code: "BW" },
  { name: "Brazil", code: "BR" },
  { name: "Brunei", code: "BN" },
  { name: "Bulgaria", code: "BG" },
  { name: "Burkina Faso", code: "BF" },
  { name: "Burundi", code: "BI" },
  { name: "Cabo Verde", code: "CV" },
  { name: "Cambodia", code: "KH" },
  { name: "Cameroon", code: "CM" },
  { name: "Canada", code: "CA" },
  { name: "Central African Republic", code: "CF" },
  { name: "Chad", code: "TD" },
  { name: "Chile", code: "CL" },
  { name: "China", code: "CN" },
  { name: "Colombia", code: "CO" },
  { name: "Comoros", code: "KM" },
  { name: "Congo", code: "CG" },
  { name: "Costa Rica", code: "CR" },
  { name: "Croatia", code: "HR" },
  { name: "Cuba", code: "CU" },
  { name: "Cyprus", code: "CY" },
  { name: "Czech Republic", code: "CZ" },
  { name: "Democratic Republic of the Congo", code: "CD" },
  { name: "Denmark", code: "DK" },
  { name: "Djibouti", code: "DJ" },
  { name: "Dominica", code: "DM" },
  { name: "Dominican Republic", code: "DO" },
  { name: "Ecuador", code: "EC" },
  { name: "Egypt", code: "EG" },
  { name: "El Salvador", code: "SV" },
  { name: "Equatorial Guinea", code: "GQ" },
  { name: "Eritrea", code: "ER" },
  { name: "Estonia", code: "EE" },
  { name: "Eswatini", code: "SZ" },
  { name: "Ethiopia", code: "ET" },
  { name: "Fiji", code: "FJ" },
  { name: "Finland", code: "FI" },
  { name: "France", code: "FR" },
  { name: "Gabon", code: "GA" },
  { name: "Gambia", code: "GM" },
  { name: "Georgia", code: "GE" },
  { name: "Germany", code: "DE" },
  { name: "Ghana", code: "GH" },
  { name: "Greece", code: "GR" },
  { name: "Grenada", code: "GD" },
  { name: "Guatemala", code: "GT" },
  { name: "Guinea", code: "GN" },
  { name: "Guinea-Bissau", code: "GW" },
  { name: "Guyana", code: "GY" },
  { name: "Haiti", code: "HT" },
  { name: "Honduras", code: "HN" },
  { name: "Hungary", code: "HU" },
  { name: "Iceland", code: "IS" },
  { name: "India", code: "IN" },
  { name: "Indonesia", code: "ID" },
  { name: "Iran", code: "IR" },
  { code: "IQ", name: "Iraq" },
  { name: "Ireland", code: "IE" },
  { name: "Israel", code: "IL" },
  { name: "Italy", code: "IT" },
  { name: "Jamaica", code: "JM" },
  { name: "Japan", code: "JP" },
  { name: "Jordan", code: "JO" },
  { name: "Kazakhstan", code: "KZ" },
  { name: "Kenya", code: "KE" },
  { name: "Kiribati", code: "KI" },
  { name: "Kuwait", code: "KW" },
  { name: "Kyrgyzstan", code: "KG" },
  { name: "Laos", code: "LA" },
  { name: "Latvia", code: "LV" },
  { name: "Lebanon", code: "LB" },
  { name: "Lesotho", code: "LS" },
  { name: "Liberia", code: "LR" },
  { name: "Libya", code: "LY" },
  { name: "Liechtenstein", code: "LI" },
  { name: "Lithuania", code: "LT" },
  { name: "Luxembourg", code: "LU" },
  { name: "Madagascar", code: "MG" },
  { name: "Malawi", code: "MW" },
  { name: "Malaysia", code: "MY" },
  { name: "Maldives", code: "MV" },
  { name: "Mali", code: "ML" },
  { name: "Malta", code: "MT" },
  { name: "Marshall Islands", code: "MH" },
  { name: "Mauritania", code: "MR" },
  { name: "Mauritius", code: "MU" },
  { name: "Mexico", code: "MX" },
  { name: "Micronesia", code: "FM" },
  { name: "Moldova", code: "MD" },
  { name: "Monaco", code: "MC" },
  { name: "Mongolia", code: "MN" },
  { name: "Montenegro", code: "ME" },
  { name: "Morocco", code: "MA" },
  { name: "Mozambique", code: "MZ" },
  { name: "Myanmar", code: "MM" },
  { name: "Namibia", code: "NA" },
  { name: "Nauru", code: "NR" },
  { name: "Nepal", code: "NP" },
  { name: "Netherlands", code: "NL" },
  { name: "New Zealand", code: "NZ" },
  { name: "Nicaragua", code: "NI" },
  { name: "Niger", code: "NE" },
  { name: "Nigeria", code: "NG" },
  { name: "North Korea", code: "KP" },
  { name: "North Macedonia", code: "MK" },
  { name: "Norway", code: "NO" },
  { name: "Oman", code: "OM" },
  { name: "Pakistan", code: "PK" },
  { name: "Palau", code: "PW" },
  { name: "Palestine", code: "PS" },
  { name: "Panama", code: "PA" },
  { name: "Papua New Guinea", code: "PG" },
  { name: "Paraguay", code: "PY" },
  { name: "Peru", code: "PE" },
  { name: "Philippines", code: "PH" },
  { name: "Poland", code: "PL" },
  { name: "Portugal", code: "PT" },
  { name: "Qatar", code: "QA" },
  { name: "Romania", code: "RO" },
  { name: "Russia", code: "RU" },
  { name: "Rwanda", code: "RW" },
  { name: "Saint Kitts and Nevis", code: "KN" },
  { name: "Saint Lucia", code: "LC" },
  { name: "Saint Vincent and the Grenadines", code: "VC" },
  { name: "Samoa", code: "WS" },
  { name: "San Marino", code: "SM" },
  { name: "Sao Tome and Principe", code: "ST" },
  { name: "Saudi Arabia", code: "SA" },
  { name: "Senegal", code: "SN" },
  { name: "Serbia", code: "RS" },
  { name: "Seychelles", code: "SC" },
  { name: "Sierra Leone", code: "SL" },
  { name: "Singapore", code: "SG" },
  { name: "Slovakia", code: "SK" },
  { name: "Slovenia", code: "SI" },
  { name: "Solomon Islands", code: "SB" },
  { name: "Somalia", code: "SO" },
  { name: "South Africa", code: "ZA" },
  { name: "South Korea", code: "KR" },
  { name: "South Sudan", code: "SS" },
  { name: "Spain", code: "ES" },
  { name: "Sri Lanka", code: "LK" },
  { name: "Sudan", code: "SD" },
  { name: "Suriname", code: "SR" },
  { name: "Sweden", code: "SE" },
  { name: "Switzerland", code: "CH" },
  { name: "Syria", code: "SY" },
  { name: "Tajikistan", code: "TJ" },
  { name: "Tanzania", code: "TZ" },
  { name: "Thailand", code: "TH" },
  { name: "Timor-Leste", code: "TL" },
  { name: "Togo", code: "TG" },
  { name: "Tonga", code: "TO" },
  { name: "Trinidad and Tobago", code: "TT" },
  { name: "Tunisia", code: "TN" },
  { name: "Turkey", code: "TR" },
  { name: "Turkmenistan", code: "TM" },
  { name: "Tuvalu", code: "TV" },
  { name: "Uganda", code: "UG" },
  { name: "Ukraine", code: "UA" },
  { name: "United Arab Emirates", code: "AE" },
  { name: "United Kingdom", code: "GB" },
  { name: "United States", code: "US" },
  { name: "Uruguay", code: "UY" },
  { name: "Uzbekistan", code: "UZ" },
  { name: "Vanuatu", code: "VU" },
  { name: "Vatican City", code: "VA" },
  { name: "Venezuela", code: "VE" },
  { name: "Vietnam", code: "VN" },
  { name: "Yemen", code: "YE" },
  { name: "Zambia", code: "ZM" },
  { name: "Zimbabwe", code: "ZW" }
];

const currenciesList = [
  { code: "AED", name: "United Arab Emirates Dirham" },
  { code: "AFN", name: "Afghan Afghani" },
  { code: "ALL", name: "Albanian Lek" },
  { code: "AMD", name: "Armenian Dram" },
  { code: "ANG", name: "Netherlands Antillean Guilder" },
  { code: "AOA", name: "Angolan Kwanza" },
  { code: "ARS", name: "Argentine Peso" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "AWG", name: "Aruban Florin" },
  { code: "AZN", name: "Azerbaijani Manat" },
  { code: "BAM", name: "Bosnia-Herzegovina Convertible Mark" },
  { code: "BBD", name: "Barbadian Dollar" },
  { code: "BDT", name: "Bangladeshi Taka" },
  { code: "BGN", name: "Bulgarian Lev" },
  { code: "BHD", name: "Bahraini Dinar" },
  { code: "BIF", name: "Burundian Franc" },
  { code: "BMD", name: "Bermudian Dollar" },
  { code: "BND", name: "Brunei Dollar" },
  { code: "BOB", name: "Bolivian Boliviano" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "BSD", name: "Bahamian Dollar" },
  { code: "BTN", name: "Bhutanese Ngultrum" },
  { code: "BWP", name: "Botswanan Pula" },
  { code: "BYN", name: "Belarusian Ruble" },
  { code: "BZD", name: "Belize Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "CDF", name: "Congolese Franc" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "CLP", name: "Chilean Peso" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "COP", name: "Colombian Peso" },
  { code: "CRC", name: "Costa Rican Colón" },
  { code: "CUP", name: "Cuban Peso" },
  { code: "CVE", name: "Cape Verdean Escudo" },
  { code: "CZK", name: "Czech Koruna" },
  { code: "DJF", name: "Djiboutian Franc" },
  { code: "DKK", name: "Danish Krone" },
  { code: "DOP", name: "Dominican Peso" },
  { code: "DZD", name: "Algerian Dinar" },
  { code: "EGP", name: "Egyptian Pound" },
  { code: "ERN", name: "Eritrean Nakfa" },
  { code: "ETB", name: "Ethiopian Birr" },
  { code: "EUR", name: "Euro" },
  { code: "FJD", name: "Fijian Dollar" },
  { code: "FKP", name: "Falkland Islands Pound" },
  { code: "GBP", name: "British Pound" },
  { code: "GEL", name: "Georgian Lari" },
  { code: "GHS", name: "Ghanaian Cedi" },
  { code: "GIP", name: "Gibraltar Pound" },
  { code: "GMD", name: "Gambian Dalasi" },
  { code: "GNF", name: "Guinean Franc" },
  { code: "GTQ", name: "Guatemalan Quetzal" },
  { code: "GYD", name: "Guyanese Dollar" },
  { code: "HKD", name: "Hong Kong Dollar" },
  { code: "HNL", name: "Honduran Lempira" },
  { code: "HRK", name: "Croatian Kuna" },
  { code: "HTG", name: "Haitian Gourde" },
  { code: "HUF", name: "Hungarian Forint" },
  { code: "IDR", name: "Indonesian Rupiah" },
  { code: "ILS", name: "Israeli New Shekel" },
  { code: "INR", name: "Indian Rupee" },
  { code: "IQD", name: "Iraqi Dinar" },
  { code: "IRR", name: "Iranian Rial" },
  { code: "ISK", name: "Icelandic Króna" },
  { code: "JMD", name: "Jamaican Dollar" },
  { code: "JOD", name: "Jordanian Dinar" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "KES", name: "Kenyan Shilling" },
  { code: "KGS", name: "Kyrgystani Som" },
  { code: "KHR", name: "Cambodian Riel" },
  { code: "KMF", name: "Comorian Franc" },
  { code: "KPW", name: "North Korean Won" },
  { code: "KRW", name: "South Korean Won" },
  { code: "KWD", name: "Kuwaiti Dinar" },
  { code: "KYD", name: "Cayman Islands Dollar" },
  { code: "KZT", name: "Kazakhstani Tenge" },
  { code: "LAK", name: "Laotian Kip" },
  { code: "LBP", name: "Lebanese Pound" },
  { code: "LKR", name: "Sri Lankan Rupee" },
  { code: "LRD", name: "Liberian Dollar" },
  { code: "LSL", name: "Lesotho Loti" },
  { code: "LYD", name: "Libyan Dinar" },
  { code: "MAD", name: "Moroccan Dirham" },
  { code: "MDL", name: "Moldovan Leu" },
  { code: "MGA", name: "Malagasy Ariary" },
  { code: "MKD", name: "Macedonian Denar" },
  { code: "MMK", name: "Myanmar Kyat" },
  { code: "MNT", name: "Mongolian Tughrik" },
  { code: "MOP", name: "Macanese Pataca" },
  { code: "MRU", name: "Mauritanian Ouguiya" },
  { code: "MUR", name: "Mauritian Rupee" },
  { code: "MVR", name: "Maldivian Rufiyaa" },
  { code: "MWK", name: "Malawian Kwacha" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "MYR", name: "Malaysian Ringgit" },
  { code: "MZN", name: "Mozambican Metical" },
  { code: "NAD", name: "Namibian Dollar" },
  { code: "NGN", name: "Nigerian Naira" },
  { code: "NIO", name: "Nicaraguan Córdoba" },
  { code: "NOK", name: "Norwegian Krone" },
  { code: "NPR", name: "Nepalese Rupee" },
  { code: "NZD", name: "New Zealand Dollar" },
  { code: "OMR", name: "Omani Rial" },
  { code: "PAB", name: "Panamanian Balboa" },
  { code: "PEN", name: "Peruvian Sol" },
  { code: "PGK", name: "Papua New Guinean Kina" },
  { code: "PHP", name: "Philippine Peso" },
  { code: "PKR", name: "Pakistani Rupee" },
  { code: "PLN", name: "Polish Zloty" },
  { code: "PYG", name: "Paraguayan Guarani" },
  { code: "QAR", name: "Qatari Riyal" },
  { code: "RON", name: "Romanian Leu" },
  { code: "RSD", name: "Serbian Dinar" },
  { code: "RUB", name: "Russian Ruble" },
  { code: "RWF", name: "Rwandan Franc" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "SBD", name: "Solomon Islands Dollar" },
  { code: "SCR", name: "Seychellois Rupee" },
  { code: "SDG", name: "Sudanese Pound" },
  { code: "SEK", name: "Swedish Krona" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "SHP", name: "St. Helena Pound" },
  { code: "SLL", name: "Sierra Leonean Leone" },
  { code: "SOS", name: "Somali Shilling" },
  { code: "SRD", name: "Surinamese Dollar" },
  { code: "SSP", name: "South Sudanese Pound" },
  { code: "STN", name: "São Tomé & Príncipe Dobra" },
  { code: "SVC", name: "Salvadoran Colón" },
  { code: "SYP", name: "Syrian Pound" },
  { code: "SZL", name: "Swazi Lilangeni" },
  { code: "THB", name: "Thai Baht" },
  { code: "TJS", name: "Tajikistani Somoni" },
  { code: "TMT", name: "Turkmenistani Manat" },
  { code: "TND", name: "Tunisian Dinar" },
  { code: "TOP", name: "Tongan Paʻanga" },
  { code: "TRY", name: "Turkish Lira" },
  { code: "TTD", name: "Trinidad & Tobago Dollar" },
  { code: "TWD", name: "New Taiwan Dollar" },
  { code: "TZS", name: "Tanzanian Shilling" },
  { code: "UAH", name: "Ukrainian Hryvnia" },
  { code: "UGX", name: "Ugandan Shilling" },
  { code: "USD", name: "US Dollar" },
  { code: "UYU", name: "Uruguayan Peso" },
  { code: "UZS", name: "Uzbekistani Som" },
  { code: "VES", name: "Venezuelan Bolívar Soberano" },
  { code: "VND", name: "Vietnamese Dong" },
  { code: "VUV", name: "Vanuatu Vatu" },
  { code: "WST", name: "Samoan Tālā" },
  { code: "XAF", name: "Central African CFA Franc" },
  { code: "XCD", name: "East Caribbean Dollar" },
  { code: "XOF", name: "West African CFA Franc" },
  { code: "XPF", name: "CFP Franc" },
  { code: "YER", name: "Yemeni Rial" },
  { code: "ZAR", name: "South African Rand" },
  { code: "ZMW", name: "Zambian Kwacha" },
  { code: "ZWL", name: "Zimbabwean Dollar" }
];

function PriceQuotationView({ buyers }: { buyers: any[] }) {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [simRole, setSimRole] = useState('Merchandiser');
  const [activeTab, setActiveTab] = useState('required');
  const [itemsMaster, setItemsMaster] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
  const [reportDownloadTime, setReportDownloadTime] = useState<string>('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedInquiryData, setSelectedInquiryData] = useState<any>(null);

  const [filterBasis, setFilterBasis] = useState<'day' | 'month' | 'year' | 'all'>('all');
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('2026');

  const currentUser = (() => {
    try {
      const saved = localStorage.getItem('metamorphosis_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  })();

  const canEdit = currentUser && ['super_admin', 'production_manager', 'merchandiser_manager', 'store_manager'].includes(currentUser.role);

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
  const [actionComments, setActionComments] = useState<{ [key: string]: string }>({});

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
    } catch (e) { }
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
    } catch (e) { }
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
    } catch (e) { }
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
    } catch (e) { }
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
    } catch (e) { }
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
    } catch (e) { }
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
    } catch (e) { }
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

  const handleEditQuotation = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/quotations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setEditingId(id.toString());
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

        if (data.inquiry_id) {
          try {
            const inqRes = await fetch(`${API_BASE}/inquiries/${data.inquiry_id}`);
            if (inqRes.ok) {
              const inqData = await inqRes.json();
              setSelectedInquiryData(inqData);
            }
          } catch (e) { console.error(e); }
        } else {
          setSelectedInquiryData(null);
        }
      }
    } catch (e) { console.error(e); }
  };

  const handleView = async (id: string) => {
    try {
      setReportDownloadTime('');
      const res = await fetch(`${API_BASE}/quotations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedQuotation(data);
      }
    } catch (e) { console.error(e); }
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
    } catch (e) { console.error(e); }
  };

  const fetchInquiries = async () => {
    try {
      const res = await fetch(`${API_BASE}/inquiries`);
      const data = await res.json();
      setInquiries(data);
    } catch (e) { console.error(e); }
  };

  const fetchItemsMaster = async () => {
    try {
      const res = await fetch(`${API_BASE}/items`);
      const data = await res.json();
      setItemsMaster(data);
    } catch (e) { console.error(e); }
  };

  const handleInquiryChange = async (inqId: string) => {
    const inq = inquiries.find(i => i.id === inqId);
    if (!inq) {
      setForm({ ...form, inquiry_id: '' });
      setSelectedInquiryData(null);
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

    try {
      const res = await fetch(`${API_BASE}/inquiries/${inqId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedInquiryData(data);
      }
    } catch (e) { console.error(e); }
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
    if (!canEdit) {
      alert("You do not have permission to edit price quotations.");
      return;
    }
    if (!form.style_no) return alert("Style is required");
    const allYarns = fabricCostRows.reduce((acc, f) => acc.concat(f.yarns || []), []);
    const url = editingId ? `${API_BASE}/quotations/${editingId}` : `${API_BASE}/quotations`;
    const method = editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || ''
        },
        body: JSON.stringify({ ...form, garments, fabrics: fabricCostRows, yarns: allYarns, trims: trimsCostRows, embs: embCostRows, washes: washCostRows, commls: commlCostRows, others: otherCostRows, transports: transportCostRows })
      });
      if (res.ok) {
        setShowModal(false);
        setEditingId(null);
        fetchQuotations();
      } else {
        alert("Failed to save quotation. Make sure all required fields are filled correctly.");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving quotation.");
    }
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
    } catch (e) {
      console.error(e);
      alert("Error occurred updating status.");
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

    const getQuotationCount = (d: number) => {
      const key = formatDateKey(d);
      return quotations.filter(q => q.quotation_date === key).length;
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
            const count = item.isCurrentMonth ? getQuotationCount(item.day) : 0;
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

  // A helper check if field should be disabled (locked by inquiry)
  const isLocked = (field: string) => form.inquiry_id && form[field] !== '' && field !== 'image_url' && ['buyer', 'item_group', 'brand', 'style_desc', 'season', 'offer_qty', 'uom'].includes(field);

  if (selectedQuotation) {
    const totalFabricPrice = selectedQuotation.fabrics?.reduce((sum: number, f: any) => sum + (f.total_amount || 0), 0) || 0;
    const calculatedSmv = selectedQuotation.garments?.reduce((sum: number, g: any) => sum + (parseFloat(g.cutting_smv || 0) + parseFloat(g.sewing_smv || 0) + parseFloat(g.finishing_smv || 0)), 0) || 0;
    const fob = selectedQuotation.confirm_price || selectedQuotation.revised_price || selectedQuotation.total_cost || 0;
    const totalValue = fob * (selectedQuotation.offer_qty || 0);

    return (
      <div className="dashboard-card price-quotation-report-view" style={{ padding: '25px', background: 'var(--bg-card)', border: '1px solid var(--border-muted)', borderRadius: '8px', color: 'var(--text-primary)' }}>
        {/* Header Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-muted)', paddingBottom: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Price Quotation Report</h2>
          <button className="btn btn-secondary" onClick={() => { setSelectedQuotation(null); setReportDownloadTime(''); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-input)', border: '1px solid var(--border-muted)', color: 'var(--text-primary)', fontWeight: '600' }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            className="btn btn-success"
            onClick={() => {
              const now = new Date();
              setReportDownloadTime(now.toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
              }));
              setTimeout(() => {
                window.print();
              }, 150);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--secondary)', borderColor: 'var(--secondary)', color: '#fff', fontWeight: '600' }}
          >
            <Download size={16} /> Download Report
          </button>
        </div>

        {reportDownloadTime && (
          <div className="report-download-info" style={{ marginBottom: '20px', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '600', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-muted)', borderRadius: '6px', width: 'fit-content' }}>
            📄 Report Downloaded On: {reportDownloadTime}
          </div>
        )}

        {/* Section 1: Basic & Other Info */}
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '10px' }}>Basic & Other Info</h3>
        <div className="table-wrapper" style={{ marginBottom: '25px' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border-muted)', fontSize: '13px' }}>
            <tbody>
              <tr>
                <td style={{ background: 'var(--bg-input)', fontWeight: 'bold', border: '1px solid var(--border-muted)', padding: '10px', width: '16%', color: 'var(--text-secondary)' }}>Inquiry ID</td>
                <td style={{ border: '1px solid var(--border-muted)', padding: '10px', width: '18%', color: 'var(--text-primary)' }}>{selectedQuotation.inquiry_id || '-'}</td>
                <td style={{ background: 'var(--bg-input)', fontWeight: 'bold', border: '1px solid var(--border-muted)', padding: '10px', width: '16%', color: 'var(--text-secondary)' }}>Style</td>
                <td style={{ border: '1px solid var(--border-muted)', padding: '10px', width: '18%', color: 'var(--text-primary)' }}>{selectedQuotation.style_no || '-'}</td>
                <td style={{ background: 'var(--bg-input)', fontWeight: 'bold', border: '1px solid var(--border-muted)', padding: '10px', width: '16%', color: 'var(--text-secondary)' }}>Buyer</td>
                <td style={{ border: '1px solid var(--border-muted)', padding: '10px', width: '18%', color: 'var(--text-primary)' }}>{selectedQuotation.buyer_name || selectedQuotation.buyer || '-'}</td>
              </tr>
              <tr>
                <td style={{ background: 'var(--bg-input)', fontWeight: 'bold', border: '1px solid var(--border-muted)', padding: '10px', color: 'var(--text-secondary)' }}>Brand Name</td>
                <td style={{ border: '1px solid var(--border-muted)', padding: '10px', color: 'var(--text-primary)' }}>{selectedQuotation.brand || '-'}</td>
                <td style={{ background: 'var(--bg-input)', fontWeight: 'bold', border: '1px solid var(--border-muted)', padding: '10px', color: 'var(--text-secondary)' }}>Style Description</td>
                <td style={{ border: '1px solid var(--border-muted)', padding: '10px', color: 'var(--text-primary)' }}>{selectedQuotation.style_desc || '-'}</td>
                <td style={{ background: 'var(--bg-input)', fontWeight: 'bold', border: '1px solid var(--border-muted)', padding: '10px', color: 'var(--text-secondary)' }}>Offer Quantity</td>
                <td style={{ border: '1px solid var(--border-muted)', padding: '10px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{selectedQuotation.offer_qty?.toLocaleString() || '0'}</td>
              </tr>
              <tr>
                <td style={{ background: 'var(--bg-input)', fontWeight: 'bold', border: '1px solid var(--border-muted)', padding: '10px', color: 'var(--text-secondary)' }}>UOM</td>
                <td style={{ border: '1px solid var(--border-muted)', padding: '10px', color: 'var(--text-primary)' }}>{selectedQuotation.uom || '-'}</td>
                <td style={{ background: 'var(--bg-input)', fontWeight: 'bold', border: '1px solid var(--border-muted)', padding: '10px', color: 'var(--text-secondary)' }}>Costing Per</td>
                <td style={{ border: '1px solid var(--border-muted)', padding: '10px', color: 'var(--text-primary)' }}>{selectedQuotation.costing_per || '-'}</td>
                <td style={{ background: 'var(--bg-input)', fontWeight: 'bold', border: '1px solid var(--border-muted)', padding: '10px', color: 'var(--text-secondary)' }}>Estimate Shipment Date</td>
                <td style={{ border: '1px solid var(--border-muted)', padding: '10px', color: 'var(--text-primary)' }}>{selectedQuotation.est_ship_date || '-'}</td>
              </tr>
              <tr>
                <td style={{ background: 'var(--bg-input)', fontWeight: 'bold', border: '1px solid var(--border-muted)', padding: '10px', color: 'var(--text-secondary)' }}>Size Group</td>
                <td style={{ border: '1px solid var(--border-muted)', padding: '10px', color: 'var(--text-primary)' }}>{selectedQuotation.size_group || '-'}</td>
                <td style={{ background: 'var(--bg-input)', fontWeight: 'bold', border: '1px solid var(--border-muted)', padding: '10px', color: 'var(--text-secondary)' }}>MC/Line</td>
                <td style={{ border: '1px solid var(--border-muted)', padding: '10px', color: 'var(--text-primary)' }}>{selectedQuotation.mc_line || '-'}</td>
                <td style={{ background: 'var(--bg-input)', fontWeight: 'bold', border: '1px solid var(--border-muted)', padding: '10px', color: 'var(--text-secondary)' }}>Production/Line/Hour</td>
                <td style={{ border: '1px solid var(--border-muted)', padding: '10px', color: 'var(--text-primary)' }}>{selectedQuotation.prod_line_hour || '-'}</td>
              </tr>
              <tr>
                <td style={{ background: 'var(--bg-input)', fontWeight: 'bold', border: '1px solid var(--border-muted)', padding: '10px', color: 'var(--text-secondary)' }}>Sewing Efficiency</td>
                <td style={{ border: '1px solid var(--border-muted)', padding: '10px', color: 'var(--text-primary)' }}>{selectedQuotation.sewing_efficiency ? `${selectedQuotation.sewing_efficiency}%` : '-'}</td>
                <td style={{ background: 'var(--bg-input)', fontWeight: 'bold', border: '1px solid var(--border-muted)', padding: '10px', color: 'var(--text-secondary)' }}>Total Cost / Pcs</td>
                <td style={{ border: '1px solid var(--border-muted)', padding: '10px', fontWeight: 'bold', color: 'var(--text-primary)' }}>${selectedQuotation.total_cost?.toFixed(4) || '0.0000'}</td>
                <td style={{ background: 'var(--bg-input)', fontWeight: 'bold', border: '1px solid var(--border-muted)', padding: '10px', color: 'var(--text-secondary)' }}>Final FOB / Pcs</td>
                <td style={{ border: '1px solid var(--border-muted)', padding: '10px', fontWeight: 'bold', color: 'var(--secondary)' }}>${fob.toFixed(4)}</td>
              </tr>
              <tr>
                <td style={{ background: 'var(--bg-input)', fontWeight: 'bold', border: '1px solid var(--border-muted)', padding: '10px', color: 'var(--text-secondary)' }}>Total Order Value</td>
                <td style={{ border: '1px solid var(--border-muted)', padding: '10px', fontWeight: 'bold', color: 'var(--secondary)' }}>${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td style={{ background: 'var(--bg-input)', fontWeight: 'bold', border: '1px solid var(--border-muted)', padding: '10px', color: 'var(--text-secondary)' }}>Total Profit/Loss</td>
                <td style={{ border: '1px solid var(--border-muted)', padding: '10px', color: (selectedQuotation.asking_profit >= 0 ? 'var(--secondary)' : 'var(--danger)'), fontWeight: 'bold' }}>
                  ${selectedQuotation.asking_profit?.toFixed(4) || '0.0000'}
                </td>
                <td style={{ background: 'var(--bg-input)', fontWeight: 'bold', border: '1px solid var(--border-muted)', padding: '10px', color: 'var(--text-secondary)' }}>Remarks</td>
                <td style={{ border: '1px solid var(--border-muted)', padding: '10px', color: 'var(--text-primary)' }}>{selectedQuotation.remarks || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: Garments Items & SMV */}
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '10px' }}>Garments Items & SMV Details</h3>
        <div className="table-wrapper" style={{ marginBottom: '25px' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border-muted)', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-input)' }}>
                <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Garments Item</th>
                <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Set Ratio</th>
                <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Cutting SMV</th>
                <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Sewing SMV</th>
                <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Finishing SMV</th>
                <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Total SMV</th>
              </tr>
            </thead>
            <tbody>
              {selectedQuotation.garments && selectedQuotation.garments.length > 0 ? (
                selectedQuotation.garments.map((g: any, i: number) => (
                  <tr key={i}>
                    <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{g.garments_item}</td>
                    <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{g.set_ratio}</td>
                    <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{g.cutting_smv} min</td>
                    <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{g.sewing_smv} min</td>
                    <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{g.finishing_smv} min</td>
                    <td style={{ border: '1px solid var(--border-muted)', padding: '8px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{g.total_smv} min</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ border: '1px solid var(--border-muted)', padding: '8px', textAlign: 'center', color: 'var(--text-muted)' }}>No garments details available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Section 3: Fabric Specifications */}
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '10px' }}>Fabric & Yarn Costing</h3>
        <div className="table-wrapper" style={{ marginBottom: '25px' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border-muted)', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-input)' }}>
                <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Item Name</th>
                <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Body Part</th>
                <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Composition</th>
                <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Fabric Type</th>
                <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>GSM</th>
                <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Grey Cons</th>
                <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Rate/KG</th>
                <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {selectedQuotation.fabrics && selectedQuotation.fabrics.length > 0 ? (
                selectedQuotation.fabrics.map((f: any, i: number) => (
                  <tr key={i}>
                    <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{f.item_name}</td>
                    <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{f.body_part} ({f.part_type})</td>
                    <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{f.composition}</td>
                    <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{f.fabric_type}</td>
                    <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{f.gsm}</td>
                    <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{f.grey_cons}</td>
                    <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>${f.rate?.toFixed(2)}</td>
                    <td style={{ border: '1px solid var(--border-muted)', padding: '8px', fontWeight: 'bold', color: 'var(--text-primary)' }}>${f.total_amount?.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ border: '1px solid var(--border-muted)', padding: '8px', textAlign: 'center', color: 'var(--text-muted)' }}>No fabric details available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Section 3.5: Yarn Specifications */}
        {selectedQuotation.yarns && selectedQuotation.yarns.length > 0 && (
          <>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '10px' }}>Yarn Cost Details</h3>
            <div className="table-wrapper" style={{ marginBottom: '25px' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border-muted)', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-input)' }}>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Yarn Composition</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Yarn Count</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Yarn Type</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Percentage</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Color</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Cons Qty</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Rate/KG</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedQuotation.yarns.map((y: any, i: number) => (
                    <tr key={i}>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{y.yarn_composition}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{y.yarn_count}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{y.yarn_type}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{y.percentage}%</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{y.color}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{y.cons_qty}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>${y.rate?.toFixed(2)}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', fontWeight: 'bold', color: 'var(--text-primary)' }}>${y.amount?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Section 3.6: Trims Cost Specifications */}
        {selectedQuotation.trims && selectedQuotation.trims.length > 0 && (
          <>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '10px' }}>Trims & Accessories Cost Details</h3>
            <div className="table-wrapper" style={{ marginBottom: '25px' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border-muted)', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-input)' }}>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Garment Item</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Trim Item</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Description</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>UOM</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Cons/Unit</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Extra %</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Total Cons</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Rate</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Total Amount</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Supplier</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedQuotation.trims.map((t: any, i: number) => (
                    <tr key={i}>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{t.gmt_item || '-'}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{t.item_name}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{t.item_desc || '-'}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{t.cons_uom}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{t.cons_unit}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{t.extra_pct}%</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{t.total_cons}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>${t.rate?.toFixed(2)}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', fontWeight: 'bold', color: 'var(--text-primary)' }}>${t.amount?.toFixed(2)}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{t.supplier || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Section 3.7: Embellishment Cost Specifications */}
        {selectedQuotation.embs && selectedQuotation.embs.length > 0 && (
          <>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '10px' }}>Embellishment Cost Details</h3>
            <div className="table-wrapper" style={{ marginBottom: '25px' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border-muted)', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-input)' }}>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Type</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Name</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Body Part</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Description</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Cons/Unit</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Process Loss</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Total Qty</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Rate</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Total Amount</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Supplier</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedQuotation.embs.map((e: any, i: number) => (
                    <tr key={i}>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{e.emb_type}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{e.emb_name}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{e.body_part || '-'}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{e.description || '-'}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{e.cons_unit}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{e.process_loss_pct}%</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{e.total_qty}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>${e.rate?.toFixed(2)}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', fontWeight: 'bold', color: 'var(--text-primary)' }}>${e.amount?.toFixed(2)}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{e.supplier || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Section 3.8: Wash Cost Specifications */}
        {selectedQuotation.washes && selectedQuotation.washes.length > 0 && (
          <>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '10px' }}>Garment Wash Cost Details</h3>
            <div className="table-wrapper" style={{ marginBottom: '25px' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border-muted)', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-input)' }}>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Wash Type</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Wash Name</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Body Part</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Description</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Cons/Unit</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Process Loss</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Total Qty</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Rate</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Total Amount</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-secondary)' }}>Supplier</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedQuotation.washes.map((w: any, i: number) => (
                    <tr key={i}>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{w.wash_type}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{w.wash_name}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{w.body_part || '-'}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{w.description || '-'}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{w.cons_unit}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{w.process_loss_pct}%</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{w.total_qty}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>${w.rate?.toFixed(2)}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', fontWeight: 'bold', color: 'var(--text-primary)' }}>${w.amount?.toFixed(2)}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '8px', color: 'var(--text-primary)' }}>{w.supplier || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Section 3.9: Commercial, Transport & Other Cost Specifications */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '25px' }}>
          {/* Commercial Costs Table */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>Commercial Cost Breakdowns</h4>
            {selectedQuotation.commls && selectedQuotation.commls.length > 0 ? (
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border-muted)', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-input)' }}>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '6px', color: 'var(--text-secondary)' }}>Type</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '6px', color: 'var(--text-secondary)' }}>Rate %</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '6px', color: 'var(--text-secondary)' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedQuotation.commls.map((c: any, i: number) => (
                    <tr key={i}>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '6px', color: 'var(--text-primary)' }}>{c.comml_type}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '6px', color: 'var(--text-primary)' }}>{c.rate_pct}%</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '6px', fontWeight: 'bold', color: 'var(--text-primary)' }}>${c.amount?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No commercial cost details available</p>}
          </div>

          {/* Transport Costs Table */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>Transport Cost Breakdowns</h4>
            {selectedQuotation.transports && selectedQuotation.transports.length > 0 ? (
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border-muted)', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-input)' }}>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '6px', color: 'var(--text-secondary)' }}>Rate</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '6px', color: 'var(--text-secondary)' }}>CBM</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '6px', color: 'var(--text-secondary)' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedQuotation.transports.map((t: any, i: number) => (
                    <tr key={i}>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '6px', color: 'var(--text-primary)' }}>${t.rate?.toFixed(2)}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '6px', color: 'var(--text-primary)' }}>{t.cbm} CBM</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '6px', fontWeight: 'bold', color: 'var(--text-primary)' }}>${t.amount?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No transport cost details available</p>}
          </div>

          {/* Other Costs Table */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>Other Cost Details</h4>
            {selectedQuotation.others && selectedQuotation.others.length > 0 ? (
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border-muted)', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-input)' }}>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '6px', color: 'var(--text-secondary)' }}>Details</th>
                    <th style={{ border: '1px solid var(--border-muted)', padding: '6px', color: 'var(--text-secondary)' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedQuotation.others.map((o: any, i: number) => (
                    <tr key={i}>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '6px', color: 'var(--text-primary)' }}>{o.cost_details}</td>
                      <td style={{ border: '1px solid var(--border-muted)', padding: '6px', fontWeight: 'bold', color: 'var(--text-primary)' }}>${o.amount?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No other cost details available</p>}
          </div>
        </div>

        {/* Section 4: Detailed Component Costs */}
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '10px' }}>Component Costs Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
          {[
            { label: 'Fabric Cost', value: selectedQuotation.fabric_cost },
            { label: 'Trims Cost', value: selectedQuotation.trims_cost },
            { label: 'Embroidery Cost', value: selectedQuotation.emb_cost },
            { label: 'Wash Cost', value: selectedQuotation.wash_cost },
            { label: 'Commercial Cost', value: selectedQuotation.comml_cost },
            { label: 'Lab Test Cost', value: selectedQuotation.lab_test },
            { label: 'Inspection Cost', value: selectedQuotation.inspection_cost },
            { label: 'CM Cost', value: selectedQuotation.cm_cost },
            { label: 'Sample Cost', value: selectedQuotation.sample_cost },
            { label: 'Freight Cost', value: selectedQuotation.freight_cost },
            { label: 'Transport Cost', value: selectedQuotation.transport_cost },
            { label: 'Other Costs', value: selectedQuotation.other_cost }
          ].map((cost, idx) => (
            <div key={idx} className="cost-summary-card" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-muted)', borderRadius: '6px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>{cost.label}</span>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>${(cost.value || 0).toFixed(4)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <h2 className="card-title">Price Quotations</h2>
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
              <option value="all">Show All Quotations</option>
              <option value="day">By Specific Day (Calendar)</option>
              <option value="month">By Specific Month</option>
              <option value="year">By Specific Year</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--text-secondary)' }}>Simulate:</label>
            <select className="form-control" value={simRole} onChange={(e) => setSimRole(e.target.value)} style={{ width: '180px', padding: '6px 12px', fontSize: '13px' }}>
              <option value="Merchandiser">Merchandiser</option>
              <option value="Store Manager">Store Manager</option>
            </select>
          </div>

          {canEdit ? (
            <button className="btn btn-primary" onClick={() => { setForm(defaultForm); setEditingId(null); setSelectedInquiryData(null); setGarments([]); setFabricCostRows([]); setTrimsCostRows([]); setEmbCostRows([]); setWashCostRows([]); setCommlCostRows([]); setOtherCostRows([]); setTransportCostRows([]); setShowModal(true); }}>
              + Add New
            </button>
          ) : (
            <span style={{ color: 'var(--danger)', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              ⚠️ Read-only (Unauthorized)
            </span>
          )}
        </div>
      </div>

      {(() => {
        // Calculate ready to approve team leader wise
        const readyToApproveQuotations = quotations.filter(q => q.status === 'Pending' || q.status === 'Resubmitted');

        const teamLeaderStats: { [key: string]: number } = {};
        readyToApproveQuotations.forEach(q => {
          const leader = q.team_leader || 'Unassigned';
          teamLeaderStats[leader] = (teamLeaderStats[leader] || 0) + 1;
        });

        // Filter and search the quotations list
        const filteredQuotations = quotations.filter(q => {
          // 1. Basis Filter
          if (filterBasis === 'day') {
            if (!selectedCalendarDay) return false;
            if (q.quotation_date !== selectedCalendarDay) return false;
          } else if (filterBasis === 'month') {
            if (!selectedMonth) return false;
            if (!q.quotation_date || !q.quotation_date.startsWith(selectedMonth)) return false;
          } else if (filterBasis === 'year') {
            if (!selectedYear) return false;
            if (q.quotation_date) {
              const yr = q.quotation_date.split('-')[0];
              if (yr !== selectedYear) return false;
            } else {
              return false;
            }
          }

          // 2. Search filter
          const matchesSearch =
            q.id.toString().includes(searchQuery) ||
            (q.style_no || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (q.buyer_name || q.buyer || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (q.team_leader || '').toLowerCase().includes(searchQuery.toLowerCase());

          // 3. Status filter
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
            {/* Filter inputs displayed on top when filterBasis is not 'all' */}
            {filterBasis !== 'all' && (
              <div style={{ padding: '20px 20px 0 20px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
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

            <div className="table-wrapper">
              <table className="data-table" style={{ whiteSpace: 'nowrap' }}>
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Quotation Date</th>
                    <th>Buyer</th>
                    <th>Style</th>
                    <th>Team Leader</th>
                    <th>Inquiry ID</th>
                    <th>Item Group</th>
                    <th>Size Group</th>
                    <th>Category</th>
                    <th>Sustainable Material</th>
                    <th>Certification</th>
                    <th>SMV</th>
                    <th>Fabric Type</th>
                    <th>Fabric Composition</th>
                    <th>GSM</th>
                    <th>Fabric Price/KG</th>
                    <th>Offer Qty</th>
                    <th>FOB ($)</th>
                    <th>Total Value ($)</th>
                    <th>Total Profit/Loss ($)</th>
                    <th>Total Fabric Price ($)</th>
                    <th>Est. Ship Date</th>
                    <th>Remarks</th>
                    <th>Approval Status</th>
                    <th>Actions & Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotations.map(q => (
                    <tr key={q.id}>
                      <td><strong>{q.id}</strong></td>
                      <td>{q.quotation_date || '-'}</td>
                      <td>{q.buyer_name || q.buyer || '-'}</td>
                      <td>{q.style_no}</td>
                      <td>{q.team_leader || 'Unassigned'}</td>
                      <td>{q.inquiry_id || '-'}</td>
                      <td>{q.item_group || '-'}</td>
                      <td>{q.size_group || '-'}</td>
                      <td>{q.garments_category || '-'}</td>
                      <td>{q.sustainable_material || '-'}</td>
                      <td>{q.garments_cert || '-'}</td>
                      <td>{q.calculated_smv ? `${q.calculated_smv.toFixed(2)} min` : (q.smv ? `${q.smv.toFixed(2)} min` : '-')}</td>
                      <td>{q.fabric_type || '-'}</td>
                      <td>{q.fabric_composition || '-'}</td>
                      <td>{q.fabric_gsm || '-'}</td>
                      <td>{q.fabric_rate ? `$${q.fabric_rate.toFixed(2)}` : '-'}</td>
                      <td>{q.offer_qty || '-'} {q.uom || ''}</td>
                      <td>
                        {(() => {
                          const fob = q.confirm_price || q.revised_price || q.total_cost || 0;
                          return `$${fob.toFixed(4)}`;
                        })()}
                      </td>
                      <td>
                        {(() => {
                          const fob = q.confirm_price || q.revised_price || q.total_cost || 0;
                          const val = fob * (q.offer_qty || 0);
                          return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        })()}
                      </td>
                      <td>{q.asking_profit ? `$${q.asking_profit.toFixed(2)}` : '-'}</td>
                      <td>{q.total_fabric_price ? `$${q.total_fabric_price.toFixed(2)}` : '-'}</td>
                      <td>{q.est_ship_date || '-'}</td>
                      <td>{q.remarks || '-'}</td>
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
                      <td style={{ padding: '10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleView(q.id)}>View</button>
                            {canEdit && (
                              <button className="btn btn-sm" style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #cbd5e1' }} onClick={() => handleEditQuotation(q.id)}>Edit</button>
                            )}

                            {/* Actions for Store Manager or whoever can approve */}
                            {simRole === 'Store Manager' && (
                              <>
                                <button className="btn btn-success btn-sm" onClick={() => handleStatusChange(q.id, 'Approved', actionComments[q.id] || '')}>Approve</button>
                                <button className="btn btn-warning btn-sm" onClick={() => handleStatusChange(q.id, 'Revised', actionComments[q.id] || '')}>Revise</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange(q.id, 'Rejected', actionComments[q.id] || '')}>Reject</button>
                              </>
                            )}

                            {/* Action for Merchandiser to resubmit if Rejected or Revised */}
                            {simRole === 'Merchandiser' && (q.status === 'Rejected' || q.status === 'Revised') && (
                              <button className="btn btn-primary btn-sm" onClick={() => handleStatusChange(q.id, 'Resubmitted', 'Resubmitted for review')}>Resubmit</button>
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
                    <tr><td colSpan={25} style={{ textAlign: 'center', padding: '20px' }}>No price quotations found matching criteria.</td></tr>
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
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid var(--border-muted)' }}>
                {['required', 'others', 'list_of_cost', 'costing'].map(tab => (
                  <button
                    key={tab}
                    style={{ padding: '10px 20px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold', color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)', borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent' }}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'required' ? 'Basic Info' : tab === 'others' ? 'Other Info' : tab === 'list_of_cost' ? 'List of Cost' : 'Costing'}
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
                      <input type="text" className="form-control" value={form.style_no} onChange={e => setForm({ ...form, style_no: e.target.value })} disabled={isLocked('style_no')} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Buyer *</label>
                      <input type="text" className="form-control" value={form.buyer} onChange={e => setForm({ ...form, buyer: e.target.value })} disabled={isLocked('buyer')} required />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Brand Name</label>
                      <input type="text" className="form-control" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} disabled={isLocked('brand')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Style Description</label>
                      <input type="text" className="form-control" value={form.style_desc} onChange={e => setForm({ ...form, style_desc: e.target.value })} disabled={isLocked('style_desc')} />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Offer Quantity *</label>
                      <input type="number" className="form-control" value={form.offer_qty} onChange={e => setForm({ ...form, offer_qty: e.target.value })} disabled={isLocked('offer_qty')} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">UOM *</label>
                      <select className="form-control" value={form.uom} onChange={e => setForm({ ...form, uom: e.target.value })} disabled={isLocked('uom')}>
                        <option value="Pcs">Pcs</option>
                        <option value="Set">Set</option>
                        <option value="Pack">Pack</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Costing Per *</label>
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
                      <label className="form-label">Estimate Shipment Date</label>
                      <input type="date" className="form-control" value={form.est_ship_date} onChange={e => setForm({ ...form, est_ship_date: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Size Group *</label>
                      <input type="text" className="form-control" value={form.size_group} onChange={e => setForm({ ...form, size_group: e.target.value })} />
                    </div>

                    <div className="form-group">
                      <label className="form-label">MC/Line *</label>
                      <input type="number" className="form-control" value={form.mc_line} onChange={e => setForm({ ...form, mc_line: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Production/Line/Hour *</label>
                      <input type="number" className="form-control" value={form.prod_line_hour} onChange={e => setForm({ ...form, prod_line_hour: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sewing Eficienecy%</label>
                      <input type="number" className="form-control" value={form.sewing_efficiency} onChange={e => setForm({ ...form, sewing_efficiency: parseFloat(e.target.value) || 0 })} />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Image Upload (From Inquiry ID)</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-input)', padding: '10px', borderRadius: '4px', border: '1px dashed var(--border-muted)' }}>
                        <input type="file" accept="image/*" style={{ display: 'none' }} id="quote-img-upload" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setForm({ ...form, image_url: file.name });
                        }} />
                        <label htmlFor="quote-img-upload" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', textAlign: 'center', margin: 0, background: 'var(--bg-card)', border: '1px solid var(--border-muted)', color: 'var(--text-primary)' }}>Browse Image</label>
                        {form.image_url && <div style={{ fontSize: '11px', color: 'var(--secondary)' }}>✓ {form.image_url}</div>}
                      </div>
                    </div>
                  </div>

                  <h4>Garments Items & SMV</h4>
                  <div style={{ background: 'var(--bg-input)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-muted)', marginBottom: '20px' }}>
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
                        <input type="number" className="form-control" value={gRatio} onChange={e => setGRatio(parseInt(e.target.value) || 0)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Cut SMV</label>
                        <input type="number" className="form-control" value={gCut} onChange={e => setGCut(parseFloat(e.target.value) || 0)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Sew SMV</label>
                        <input type="number" className="form-control" value={gSew} onChange={e => setGSew(parseFloat(e.target.value) || 0)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Fin SMV</label>
                        <input type="number" className="form-control" value={gFin} onChange={e => setGFin(parseFloat(e.target.value) || 0)} />
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
                    <div className="form-group" style={{ position: 'relative' }}>
                      <label className="form-label">Country</label>
                      <div
                        className="form-control"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-muted)',
                          padding: '8px 12px',
                          height: '38px',
                          borderRadius: '4px'
                        }}
                        onClick={() => {
                          setShowCountryDropdown(!showCountryDropdown);
                          setCountrySearch('');
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {(() => {
                            const selected = countriesList.find(c => c.name === form.country);
                            if (selected) {
                              return (
                                <>
                                  <img
                                    src={`https://flagcdn.com/w20/${selected.code.toLowerCase()}.png`}
                                    width="20"
                                    alt=""
                                    style={{ borderRadius: '2px', objectFit: 'contain' }}
                                  />
                                  {selected.name}
                                </>
                              );
                            }
                            return 'Select Country';
                          })()}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>▼</span>
                      </div>

                      {showCountryDropdown && (
                        <>
                          <div
                            style={{
                              position: 'fixed',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              zIndex: 999
                            }}
                            onClick={() => setShowCountryDropdown(false)}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              background: '#ffffff',
                              border: '1px solid var(--border-muted)',
                              borderRadius: '4px',
                              boxShadow: 'var(--shadow-lg)',
                              zIndex: 1000,
                              marginTop: '4px',
                              maxHeight: '220px',
                              overflowY: 'auto',
                              display: 'flex',
                              flexDirection: 'column'
                            }}
                          >
                            <div style={{ padding: '8px', borderBottom: '1px solid var(--border-muted)', position: 'sticky', top: 0, background: '#ffffff', zIndex: 1 }}>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Search country..."
                                style={{ height: '30px', fontSize: '13px' }}
                                value={countrySearch}
                                onChange={e => setCountrySearch(e.target.value)}
                                onClick={e => e.stopPropagation()}
                                autoFocus
                              />
                            </div>
                            <div style={{ overflowY: 'auto', flex: 1 }}>
                              {countriesList
                                .filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()))
                                .map(c => (
                                  <div
                                    key={c.code}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '10px',
                                      padding: '8px 12px',
                                      cursor: 'pointer',
                                      fontSize: '13px',
                                      color: '#1e293b',
                                      background: form.country === c.name ? 'var(--primary-glow)' : 'transparent',
                                      borderBottom: '1px solid #f1f5f9'
                                    }}
                                    onClick={() => {
                                      setForm({ ...form, country: c.name });
                                      setShowCountryDropdown(false);
                                    }}
                                    onMouseEnter={e => {
                                      if (form.country !== c.name) e.currentTarget.style.background = '#f8fafc';
                                    }}
                                    onMouseLeave={e => {
                                      if (form.country !== c.name) e.currentTarget.style.background = 'transparent';
                                    }}
                                  >
                                    <img
                                      src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`}
                                      width="20"
                                      alt=""
                                      style={{ borderRadius: '2px', objectFit: 'contain' }}
                                    />
                                    <span>{c.name}</span>
                                  </div>
                                ))}
                              {countriesList.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())).length === 0 && (
                                <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                                  No countries found
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Currency *</label>
                      <select className="form-control" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                        <option value="">Select Currency</option>
                        {currenciesList.map(curr => (
                          <option key={curr.code} value={curr.code}>{curr.code} ({curr.name})</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sustainable Material *</label>
                      <select className="form-control" value={form.sustainable_material} onChange={e => setForm({ ...form, sustainable_material: e.target.value })}>
                        <option value="">Select Sustainable Material</option>
                        {[
                          "GOTS (Global Organic Textile Standard)",
                          "BCI (Better Cotton Initiative)",
                          "GRS (Global Recycled Standard)",
                          "OCS (Organic Content Standard)",
                          "RCS (Recycled Claim Standard)",
                          "OEKO-TEX Standard 100",
                          "CONVENTIONAL (Non-Organic / Standard)",
                          "COMBINED (OCS & RCS/GRS)",
                          "FSC (Forest Stewardship Council) Viscose",
                          "Lenzing Tencel / Lyocell",
                          "Lenzing Ecovero Viscose",
                          "Recycled Polyester (rPET)",
                          "Organic Cotton (100%)",
                          "Organic Linen",
                          "Hemp (Sustainable)",
                          "Fairtrade Cotton",
                          "Cradle to Cradle (C2C)",
                          "RDS (Responsible Down Standard)",
                          "RWS (Responsible Wool Standard)",
                          "Cotton Made in Africa (CmiA)",
                          "Regenerative Cotton",
                          "Repreve (Recycled Fiber)",
                          "Biodegradable Polyester",
                          "Supima Cotton (Sustainably Grown)"
                        ].map(t => (
                          <option key={t} value={t.split(' (')[0]}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Embellishment Type</label>
                      <select className="form-control" value={form.emb_type} onChange={e => setForm({ ...form, emb_type: e.target.value })}>
                        <option value="">None / Select Embellishment Type</option>
                        {[
                          "Rubber Print",
                          "Plastisol Print",
                          "Discharge Print",
                          "Pigment Print",
                          "High Density Print",
                          "Puff Print",
                          "Foil Print",
                          "Flock Print",
                          "Glitter Print",
                          "Sublimation Print",
                          "Digital Print",
                          "Heat Transfer Print",
                          "Glitter Heat Transfer",
                          "Flat Embroidery",
                          "3D/Puff Embroidery",
                          "Applique Embroidery",
                          "Sequins Work",
                          "Beads Work",
                          "Stone/Rhinestone Work",
                          "Chenille Embroidery",
                          "Laser Cutting/Engraving",
                          "Tie-Dye / Acid Wash",
                          "Lace / Fringe Attachment",
                          "Patch Work (Leather/Woven)"
                        ].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Quotation Date</label>
                      <input type="date" className="form-control" value={form.quotation_date} onChange={e => setForm({ ...form, quotation_date: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Remarks</label>
                      <input type="text" className="form-control" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'costing' && (
                <div style={{ animation: 'fadeIn 0.3s', padding: '15px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'var(--bg-input)', padding: '10px 15px', borderRadius: '6px', border: '1px solid var(--border-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ background: 'var(--primary)', color: 'white', padding: '6px 15px', fontWeight: 'bold', borderRadius: '4px', clipPath: 'polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%)' }}>
                        Costing Section
                      </div>
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        Buyer: <strong style={{ color: 'var(--text-primary)' }}>{form.buyer || 'N/A'}</strong> &nbsp;&nbsp;|&nbsp;&nbsp;
                        Style: <span className="badge badge-success" style={{ background: 'var(--secondary)', color: 'white', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{form.style_no || 'N/A'}</span>
                      </span>
                    </div>
                    <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px' }} onClick={() => alert("Standard Calculator Triggered")}>
                      📊 Calculator
                    </button>
                  </div>

                  {/* 3-Column Layout */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1.6fr', gap: '20px', alignItems: 'start' }}>

                    {/* Left Column: Cost Components */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-muted)', borderRadius: '8px', overflow: 'hidden' }}>
                      <table className="data-table" style={{ margin: 0, width: '100%' }}>
                        <thead>
                          <tr style={{ background: 'var(--bg-input)' }}>
                            <th style={{ width: '40%', padding: '10px', color: 'var(--text-primary)' }}>Particulars</th>
                            <th style={{ width: '30%', padding: '10px', textAlign: 'right', color: 'var(--text-primary)' }}>Mkt. Costing</th>
                            <th style={{ width: '30%', padding: '10px', textAlign: 'right', color: 'var(--text-primary)' }}>% to Q.Price</th>
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
                                <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{row.label}</td>
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
                                      border: row.input ? '1px solid var(--primary)' : '1px solid var(--border-muted)',
                                      background: row.input ? 'var(--bg-input)' : 'var(--bg-darker)',
                                      color: 'var(--text-primary)'
                                    }}
                                    disabled={!row.input}
                                    value={val === 0 ? '0' : val}
                                    onChange={e => handleCostChange(row.field, parseFloat(e.target.value) || 0)}
                                  />
                                </td>
                                <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                                  {pct.toFixed(2)}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Middle Column: Totals & Price Calculations */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-muted)', borderRadius: '8px', overflow: 'hidden' }}>
                      <table className="data-table" style={{ margin: 0, width: '100%' }}>
                        <thead>
                          <tr style={{ background: 'var(--bg-input)' }}>
                            <th style={{ width: '50%', padding: '10px', color: 'var(--text-primary)' }}>Particulars</th>
                            <th style={{ width: '30%', padding: '10px', textAlign: 'right', color: 'var(--text-primary)' }}>Mkt. Costing</th>
                            <th style={{ width: '20%', padding: '10px', textAlign: 'right', color: 'var(--text-primary)' }}>% to Q.P.</th>
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
                                  <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Final Cost Pcs/Set/Pack</td>
                                  <td style={{ padding: '4px 8px' }}>
                                    <input
                                      type="number"
                                      className="form-control"
                                      disabled
                                      style={{ textAlign: 'right', padding: '4px 8px', height: '28px', fontSize: '13px', background: 'var(--bg-darker)', color: 'var(--text-primary)', border: '1px solid var(--border-muted)' }}
                                      value={finalCostPcs.toFixed(4)}
                                    />
                                  </td>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                                    {(askingQuotedPrice > 0 ? (finalCostPcs / askingQuotedPrice) * 100 : 0).toFixed(2)}%
                                  </td>
                                </tr>

                                {/* Asking Profit */}
                                <tr>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>Asking Profit Pcs/Set/Pack</td>
                                  <td style={{ padding: '4px 8px' }}>
                                    <input
                                      type="number"
                                      step="0.0001"
                                      className="form-control"
                                      style={{ textAlign: 'right', padding: '4px 8px', height: '28px', fontSize: '13px', border: '1px solid var(--primary)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                                      value={askingProfit === 0 ? '0' : askingProfit}
                                      onChange={e => handleCostChange('asking_profit', parseFloat(e.target.value) || 0)}
                                    />
                                  </td>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                                    {(askingQuotedPrice > 0 ? (askingProfit / askingQuotedPrice) * 100 : 0).toFixed(2)}%
                                  </td>
                                </tr>

                                {/* Asking Quoted Price */}
                                <tr style={{ background: 'var(--bg-input)' }}>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Asking Quoted Price Pcs/Set/Pack</td>
                                  <td style={{ padding: '4px 8px' }}>
                                    <input
                                      type="number"
                                      className="form-control"
                                      disabled
                                      style={{ textAlign: 'right', padding: '4px 8px', height: '28px', fontSize: '13px', background: 'var(--bg-darker)', color: 'var(--text-primary)', border: '1px solid var(--border-muted)', fontWeight: 'bold' }}
                                      value={askingQuotedPrice.toFixed(4)}
                                    />
                                  </td>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                    100.00%
                                  </td>
                                </tr>

                                {/* Revised Price */}
                                <tr>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>Revised Price/Pcs/Pack</td>
                                  <td style={{ padding: '4px 8px' }}>
                                    <input
                                      type="number"
                                      step="0.0001"
                                      className="form-control"
                                      style={{ textAlign: 'right', padding: '4px 8px', height: '28px', fontSize: '13px', border: '1px solid var(--primary)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                                      value={revisedPrice === 0 ? '0' : revisedPrice}
                                      onChange={e => handleCostChange('revised_price', parseFloat(e.target.value) || 0)}
                                    />
                                  </td>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right', color: 'var(--text-secondary)' }}>0.00%</td>
                                </tr>

                                {/* Confirm Price */}
                                <tr>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: 'bold', color: 'var(--warning)' }}>Confirm Price</td>
                                  <td style={{ padding: '4px 8px' }}>
                                    <input
                                      type="number"
                                      step="0.0001"
                                      className="form-control"
                                      style={{ textAlign: 'right', padding: '4px 8px', height: '28px', fontSize: '13px', border: '1px solid var(--warning)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontWeight: 'bold' }}
                                      value={confirmPrice === 0 ? '0' : confirmPrice}
                                      onChange={e => handleCostChange('confirm_price', parseFloat(e.target.value) || 0)}
                                    />
                                  </td>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right', color: 'var(--text-secondary)' }}>0.00%</td>
                                </tr>

                                {/* Price Before Comn/Dzn/Pack */}
                                <tr>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>Price Before Comn/Dzn/Pack</td>
                                  <td style={{ padding: '4px 8px' }}>
                                    <input
                                      type="number"
                                      className="form-control"
                                      disabled
                                      style={{ textAlign: 'right', padding: '4px 8px', height: '28px', fontSize: '13px', background: 'var(--bg-darker)', color: 'var(--text-primary)', border: '1px solid var(--border-muted)' }}
                                      value={priceBeforeComnDzn.toFixed(4)}
                                    />
                                  </td>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right', color: 'var(--text-secondary)' }}>100%</td>
                                </tr>

                                {/* Prd. Cost /Dzn */}
                                <tr>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>Prd. Cost /Dzn</td>
                                  <td style={{ padding: '4px 8px' }}>
                                    <input
                                      type="number"
                                      className="form-control"
                                      disabled
                                      style={{ textAlign: 'right', padding: '4px 8px', height: '28px', fontSize: '13px', background: 'var(--bg-darker)', color: 'var(--text-primary)', border: '1px solid var(--border-muted)' }}
                                      value={prdCostDzn.toFixed(4)}
                                    />
                                  </td>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right', color: 'var(--text-secondary)' }}>0.00%</td>
                                </tr>

                                {/* Margin Dzn/Pack */}
                                <tr>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>Margin Dzn/Pack</td>
                                  <td style={{ padding: '4px 8px' }}>
                                    <input
                                      type="text"
                                      className="form-control"
                                      disabled
                                      style={{ textAlign: 'right', padding: '4px 8px', height: '28px', fontSize: '13px', background: 'var(--bg-darker)', border: '1px solid var(--border-muted)', fontWeight: 'bold', color: marginDznPack >= 0 ? 'var(--secondary)' : 'var(--danger)' }}
                                      value={marginDznPack.toFixed(4)}
                                    />
                                  </td>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right', color: 'var(--text-secondary)' }}>0.00%</td>
                                </tr>

                                {/* Commi. Dzn/Pack */}
                                <tr>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>Commi. Dzn/Pack</td>
                                  <td style={{ padding: '4px 8px' }}>
                                    <input
                                      type="number"
                                      step="0.0001"
                                      className="form-control"
                                      style={{ textAlign: 'right', padding: '4px 8px', height: '28px', fontSize: '13px', border: '1px solid var(--primary)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                                      value={commiDzn === 0 ? '0' : commiDzn}
                                      onChange={e => handleCostChange('commi_dzn', parseFloat(e.target.value) || 0)}
                                    />
                                  </td>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right', color: 'var(--text-secondary)' }}>0.00%</td>
                                </tr>

                                {/* Price with Commn Dzn/Pack */}
                                <tr>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>Price with Commn Dzn/Pack</td>
                                  <td style={{ padding: '4px 8px' }}>
                                    <input
                                      type="number"
                                      className="form-control"
                                      disabled
                                      style={{ textAlign: 'right', padding: '4px 8px', height: '28px', fontSize: '13px', background: 'var(--bg-darker)', color: 'var(--text-primary)', border: '1px solid var(--border-muted)' }}
                                      value={priceWithCommnDzn.toFixed(4)}
                                    />
                                  </td>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right', color: 'var(--text-secondary)' }}>0.00%</td>
                                </tr>

                                {/* Price with Commn Pcs/Pack */}
                                <tr>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>Price with Commn Pcs/Pack</td>
                                  <td style={{ padding: '4px 8px' }}>
                                    <input
                                      type="number"
                                      className="form-control"
                                      disabled
                                      style={{ textAlign: 'right', padding: '4px 8px', height: '28px', fontSize: '13px', background: 'var(--bg-darker)', color: 'var(--text-primary)', border: '1px solid var(--border-muted)' }}
                                      value={priceWithCommnPcs.toFixed(4)}
                                    />
                                  </td>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right', color: 'var(--text-secondary)' }}>0.00%</td>
                                </tr>

                                {/* Target price */}
                                <tr>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>Target price</td>
                                  <td style={{ padding: '4px 8px' }}>
                                    <input
                                      type="number"
                                      step="0.0001"
                                      className="form-control"
                                      style={{ textAlign: 'right', padding: '4px 8px', height: '28px', fontSize: '13px', border: '1px solid var(--border-muted)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                                      value={targetPrice === 0 ? '0' : targetPrice}
                                      onChange={e => handleCostChange('target_price', parseFloat(e.target.value) || 0)}
                                    />
                                  </td>
                                  <td style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right', color: 'var(--text-secondary)' }}></td>
                                </tr>
                              </>
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>

                    {/* Right Column: Price Comparison & Margin Analysis */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-muted)', borderRadius: '8px', overflow: 'hidden' }}>
                      <table className="data-table" style={{ margin: 0, width: '100%' }}>
                        <thead>
                          <tr style={{ background: 'var(--bg-input)' }}>
                            <th style={{ width: '40%', padding: '10px', color: 'var(--text-primary)' }}>Particulars</th>
                            <th style={{ width: '20%', padding: '10px', textAlign: 'right', color: 'var(--text-primary)' }}>Asking</th>
                            <th style={{ width: '20%', padding: '10px', textAlign: 'right', color: 'var(--text-primary)' }}>Confirmed</th>
                            <th style={{ width: '20%', padding: '10px', textAlign: 'right', color: 'var(--text-primary)' }}>Deviation</th>
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
                                  <td style={{ padding: '10px', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Price With Commn/Pcs/Pack</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', color: 'var(--text-primary)' }}>{priceCommnPcsAsking.toFixed(4)}</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', color: 'var(--text-primary)' }}>{priceCommnPcsConf.toFixed(4)}</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold', color: priceCommnPcsDev >= 0 ? 'var(--secondary)' : 'var(--danger)' }}>{priceCommnPcsDev.toFixed(4)}</td>
                                </tr>

                                {/* Prod. Cost/Pcs/Pack */}
                                <tr>
                                  <td style={{ padding: '10px', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Prod. Cost/Pcs/Pack</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', color: 'var(--text-primary)' }}>{prodCostPcsAsking.toFixed(4)}</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', color: 'var(--text-primary)' }}>{prodCostPcsConf.toFixed(4)}</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', color: 'var(--text-secondary)' }}>{prodCostPcsDev.toFixed(4)}</td>
                                </tr>

                                {/* Margin/Pcs/Pack */}
                                <tr>
                                  <td style={{ padding: '10px', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Margin/Pcs/Pack</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', color: 'var(--text-primary)' }}>{marginPcsAsking.toFixed(4)}</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold', color: marginPcsConf >= 0 ? 'var(--secondary)' : 'var(--danger)' }}>{marginPcsConf.toFixed(4)}</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold', color: marginPcsDev >= 0 ? 'var(--secondary)' : 'var(--danger)' }}>{marginPcsDev.toFixed(4)}</td>
                                </tr>

                                {/* Margin/Dzn */}
                                <tr>
                                  <td style={{ padding: '10px', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Margin/Dzn</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', color: 'var(--text-primary)' }}>{marginDznAsking.toFixed(4)}</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold', color: marginDznConf >= 0 ? 'var(--secondary)' : 'var(--danger)' }}>{marginDznConf.toFixed(4)}</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold', color: marginDznDev >= 0 ? 'var(--secondary)' : 'var(--danger)' }}>{marginDznDev.toFixed(4)}</td>
                                </tr>

                                {/* Margin for Offer Qty */}
                                <tr style={{ background: 'var(--bg-input)' }}>
                                  <td style={{ padding: '10px', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Margin for Offer Qty</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{marginQtyAsking.toFixed(4)}</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold', color: marginQtyConf >= 0 ? 'var(--secondary)' : 'var(--danger)' }}>{marginQtyConf.toFixed(4)}</td>
                                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold', color: marginQtyDev >= 0 ? 'var(--secondary)' : 'var(--danger)' }}>{marginQtyDev.toFixed(4)}</td>
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
                  <h4 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontWeight: 'bold' }}>List of Direct and Indirect Component Costs</h4>

                  {/* Direct Costs */}
                  <div className="grid-3" style={{ marginBottom: '20px' }}>
                    <div className="form-group" style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-muted)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 0 }}>Fabric Cost</label>
                        <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-muted)', color: 'var(--text-primary)' }} onClick={() => handleBrowseOption('fabric_cost', 'Fabric Cost')}>Browse Option</button>
                      </div>
                      <input type="number" className="form-control" style={{ marginTop: '8px' }} value={form.fabric_cost || 0} onChange={e => handleCostChange('fabric_cost', parseFloat(e.target.value) || 0)} />
                    </div>

                    <div className="form-group" style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-muted)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 0 }}>Trims Cost</label>
                        <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-muted)', color: 'var(--text-primary)' }} onClick={() => handleBrowseOption('trims_cost', 'Trims Cost')}>Browse Option</button>
                      </div>
                      <input type="number" className="form-control" style={{ marginTop: '8px' }} value={form.trims_cost || 0} onChange={e => handleCostChange('trims_cost', parseFloat(e.target.value) || 0)} />
                    </div>

                    <div className="form-group" style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-muted)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 0 }}>Emb. Cost</label>
                        <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-muted)', color: 'var(--text-primary)' }} onClick={() => handleBrowseOption('emb_cost', 'Embellishment Cost')}>Browse Option</button>
                      </div>
                      <input type="number" className="form-control" style={{ marginTop: '8px' }} value={form.emb_cost || 0} onChange={e => handleCostChange('emb_cost', parseFloat(e.target.value) || 0)} />
                    </div>
                  </div>

                  <div className="grid-4" style={{ marginBottom: '20px' }}>
                    <div className="form-group" style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-muted)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 0 }}>Gmts. Wash</label>
                        <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-muted)', color: 'var(--text-primary)' }} onClick={() => handleBrowseOption('wash_cost', 'Wash Cost')}>Browse Option</button>
                      </div>
                      <input type="number" className="form-control" style={{ marginTop: '8px' }} value={form.wash_cost || 0} onChange={e => handleCostChange('wash_cost', parseFloat(e.target.value) || 0)} />
                    </div>

                    <div className="form-group" style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-muted)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 0 }}>Comml. Cost</label>
                        <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-muted)', color: 'var(--text-primary)' }} onClick={() => handleBrowseOption('comml_cost', 'Commercial Cost')}>Browse Option</button>
                      </div>
                      <input type="number" className="form-control" style={{ marginTop: '8px' }} value={form.comml_cost || 0} onChange={e => handleCostChange('comml_cost', parseFloat(e.target.value) || 0)} />
                    </div>

                    <div className="form-group" style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-muted)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 0 }}>Transport Cost</label>
                        <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-muted)', color: 'var(--text-primary)' }} onClick={() => handleBrowseOption('transport_cost', 'Transport Cost')}>Browse Option</button>
                      </div>
                      <input type="number" className="form-control" style={{ marginTop: '8px' }} value={form.transport_cost || 0} onChange={e => handleCostChange('transport_cost', parseFloat(e.target.value) || 0)} />
                    </div>

                    <div className="form-group" style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-muted)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 0 }}>Other Cost</label>
                        <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-muted)', color: 'var(--text-primary)' }} onClick={() => handleBrowseOption('other_cost', 'Other Cost')}>Browse Option</button>
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

            <div className="modal-footer" style={{ borderTop: '2px solid #e2e8f0', paddingTop: '20px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {activeTab !== 'required' && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      if (activeTab === 'others') setActiveTab('required');
                      else if (activeTab === 'list_of_cost') setActiveTab('others');
                      else if (activeTab === 'costing') setActiveTab('list_of_cost');
                    }}
                  >
                    Back
                  </button>
                )}
                {activeTab !== 'costing' ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      if (activeTab === 'required') setActiveTab('others');
                      else if (activeTab === 'others') setActiveTab('list_of_cost');
                      else if (activeTab === 'list_of_cost') setActiveTab('costing');
                    }}
                  >
                    Next
                  </button>
                ) : (
                  <button type="button" className="btn btn-primary" onClick={handleSave}>
                    Save Quotation
                  </button>
                )}
              </div>
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
              <div style={{ background: 'var(--bg-darker)', padding: '12px', borderRadius: '4px', textAlign: 'right', fontWeight: 'bold', color: 'var(--text-primary)', border: '1px solid var(--border-muted)' }}>
                Total Cost: ${(browseQty * browseRate).toFixed(2)}
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-muted)', paddingTop: '15px', textAlign: 'right' }}>
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
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: 'var(--bg-input)', border: '1px solid var(--border-muted)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Template Options:</span>
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
              <div style={{ background: 'var(--bg-input)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-muted)', marginBottom: '20px' }}>
                <h4 style={{ color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '15px' }}>Add Fabric Cost Line</h4>

                <div className="grid-3" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Gmt. Item</label>
                    <select className="form-control" value={fabForm.gmt_item} onChange={e => setFabForm({ ...fabForm, gmt_item: e.target.value })}>
                      <option value="">-- Choose Item --</option>
                      {(() => {
                        const linkedInq = inquiries.find(i => i.id === form.inquiry_id);
                        if (linkedInq && linkedInq.garments_item) {
                          const items = linkedInq.garments_item.split(',').map(x => x.trim()).filter(Boolean);
                          return items.map((item, idx) => (
                            <option key={`inq-gmt-${idx}`} value={item}>{item} (From Inquiry)</option>
                          ));
                        }
                        return null;
                      })()}
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
                    <label className="form-label">Fabric Type *</label>
                    <select className="form-control" value={fabForm.fabric_type} onChange={e => setFabForm({ ...fabForm, fabric_type: e.target.value })}>
                      <option value="">-- Choose Fabric Type --</option>
                      {(() => {
                        if (selectedInquiryData && selectedInquiryData.fabrics) {
                          const types = selectedInquiryData.fabrics.map((f: any) => f.fabric_type).filter(Boolean);
                          const uniqueTypes = Array.from(new Set(types)) as string[];
                          return uniqueTypes.map((type, idx) => (
                            <option key={`inq-fab-${idx}`} value={type}>{type} (From Inquiry)</option>
                          ));
                        } else {
                          const linkedInq = inquiries.find(i => i.id === form.inquiry_id);
                          if (linkedInq && linkedInq.fabric_type) {
                            return <option value={linkedInq.fabric_type}>{linkedInq.fabric_type} (From Inquiry)</option>;
                          }
                        }
                        return null;
                      })()}
                      <option value="Single Jersey">Single Jersey</option>
                      <option value="Rib">Rib</option>
                      <option value="Interlock">Interlock</option>
                      <option value="Pique">Pique</option>
                      <option value="Fleece">Fleece</option>
                      <option value="French Terry">French Terry</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fabric Nature (Auto)</label>
                    <input type="text" className="form-control" value={fabForm.fabric_nature} disabled style={{ background: 'var(--bg-darker)', color: 'var(--text-primary)', border: '1px solid var(--border-muted)' }} />
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
                    <input type="number" className="form-control" value={fabForm.rate || 0} disabled style={{ background: 'var(--bg-darker)', color: 'var(--text-primary)', border: '1px solid var(--border-muted)' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount ($) (Auto)</label>
                    <input type="number" className="form-control" value={fabForm.amount || 0} disabled style={{ background: 'var(--bg-darker)', color: 'var(--text-primary)', border: '1px solid var(--border-muted)' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-control" value={fabForm.status} onChange={e => setFabForm({ ...fabForm, status: e.target.value })}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Inline Fabric Consumption Table (Same to same as popup breakdown table) */}
                {consRows.length > 0 && (
                  <div style={{ marginTop: '15px', marginBottom: '20px' }}>
                    <label className="form-label" style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Fabric Consumption Breakdown</label>
                    <table className="data-table" style={{ fontSize: '12px', width: '100%' }}>
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
                            <td>{r.lab_dip || '-'}</td>
                            <td>{r.qty}</td>
                            <td>{r.dia}</td>
                            <td>{r.cons?.toFixed(4)}</td>
                            <td>{r.loss?.toFixed(4)}%</td>
                            <td>{r.req?.toFixed(4)}</td>
                            <td>${r.rate?.toFixed(4)}</td>
                            <td>${r.amount?.toFixed(4)}</td>
                            <td>
                              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setConsRows(consRows.filter((_, i) => i !== idx))}>Remove</button>
                            </td>
                          </tr>
                        ))}
                        <tr style={{ background: 'var(--bg-input)', fontWeight: 'bold' }}>
                          <td colSpan={2}>Total Sum</td>
                          <td>{consRows.reduce((sum, r) => sum + r.qty, 0)}</td>
                          <td>{consRows.reduce((sum, r) => sum + r.dia, 0).toFixed(4)}</td>
                          <td>{consRows.reduce((sum, r) => sum + r.cons, 0).toFixed(4)}</td>
                          <td>{consRows.reduce((sum, r) => sum + r.loss, 0).toFixed(4)}</td>
                          <td>{consRows.reduce((sum, r) => sum + r.req, 0).toFixed(4)}</td>
                          <td>${consRows.reduce((sum, r) => sum + r.rate, 0).toFixed(4)}</td>
                          <td>${consRows.reduce((sum, r) => sum + r.amount, 0).toFixed(4)}</td>
                          <td></td>
                        </tr>
                        <tr style={{ background: 'var(--bg-darker)', fontWeight: 'bold' }}>
                          <td colSpan={2}>Average</td>
                          <td>-</td>
                          <td>{(consRows.reduce((sum, r) => sum + r.dia, 0) / consRows.length).toFixed(4)}</td>
                          <td>{(consRows.reduce((sum, r) => sum + r.cons, 0) / consRows.length).toFixed(4)}</td>
                          <td>{(consRows.reduce((sum, r) => sum + r.loss, 0) / consRows.length).toFixed(4)}</td>
                          <td>{(consRows.reduce((sum, r) => sum + r.req, 0) / consRows.length).toFixed(4)}</td>
                          <td>${(consRows.reduce((sum, r) => sum + r.rate, 0) / consRows.length).toFixed(4)}</td>
                          <td>${(consRows.reduce((sum, r) => sum + r.amount, 0) / consRows.length).toFixed(4)}</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Yarn Costing Section (Condition: Source === 'Production') */}
                {fabForm.fabric_source === 'Production' && (
                  <div style={{ border: '1px solid var(--border-muted)', borderRadius: '6px', padding: '16px', background: 'var(--bg-input)', marginTop: '20px', marginBottom: '20px' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '15px', fontWeight: 'bold' }}>Fabric - Yarn Costing (Production Source)</h4>
                    <div className="grid-3" style={{ marginBottom: '12px' }}>
                      <div className="form-group">
                        <label className="form-label">Fabric Composition</label>
                        <input type="text" className="form-control" value={fabForm.composition} disabled style={{ background: 'var(--bg-darker)', color: 'var(--text-primary)', border: '1px solid var(--border-muted)' }} />
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
                          fabric_composition: fabForm.composition || 'Body',
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
                          <th>Fabric Composition</th>
                          <th>Yarn. Composition *</th>
                          <th>Count *</th>
                          <th>Type *</th>
                          <th>Percentage(%) *</th>
                          <th>Color</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yarnRows.map((y, idx) => (
                          <tr key={idx}>
                            <td>{y.fabric_composition}</td>
                            <td>{y.yarn_composition}</td>
                            <td>{y.yarn_count}</td>
                            <td>{y.yarn_type}</td>
                            <td>{y.percentage}%</td>
                            <td>{y.color}</td>
                            <td>
                              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setYarnRows(yarnRows.filter((_, i) => i !== idx))}>Remove</button>
                            </td>
                          </tr>
                        ))}
                        {yarnRows.length === 0 && (
                          <tr><td colSpan={7} style={{ textAlign: 'center' }}>No yarn costing items added</td></tr>
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
                    const avgLoss = consRows.length > 0 ? consRows.reduce((sum, r) => sum + r.loss, 0) / consRows.length : 0;
                    const avgReq = consRows.length > 0 ? consRows.reduce((sum, r) => sum + r.req, 0) / consRows.length : 0.3;
                    const avgConsVal = consRows.length > 0 ? consRows.reduce((sum, r) => sum + r.cons, 0) / consRows.length : 0;

                    setFabricCostRows([...fabricCostRows, {
                      ...fabForm,
                      grey_cons: avgCons,
                      rate: avgRate,
                      amount: avgCons * avgRate,
                      total_qty: totQtySum || (avgCons * (form.offer_qty || 1000)),
                      total_amount: totalAmt,
                      process_loss: avgLoss,
                      req_val: avgReq,
                      cons_val: avgConsVal,
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
                    <th>Cons</th>
                    <th>Process Loss</th>
                    <th>Req.</th>
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
                      <td>
                        {f.cons_val !== undefined
                          ? f.cons_val?.toFixed(4)
                          : (f.consumption && f.consumption.length > 0)
                            ? (f.consumption.reduce((sum, r) => sum + r.cons, 0) / f.consumption.length).toFixed(4)
                            : f.grey_cons?.toFixed(4)
                        } {f.uom}
                      </td>
                      <td>
                        {f.process_loss !== undefined
                          ? f.process_loss?.toFixed(4) + '%'
                          : (f.consumption && f.consumption.length > 0)
                            ? (f.consumption.reduce((sum, r) => sum + r.loss, 0) / f.consumption.length).toFixed(4) + '%'
                            : '-'
                        }
                      </td>
                      <td>
                        {f.req_val !== undefined
                          ? f.req_val?.toFixed(4)
                          : (f.consumption && f.consumption.length > 0)
                            ? (f.consumption.reduce((sum, r) => sum + r.req, 0) / f.consumption.length).toFixed(4)
                            : '-'
                        }
                      </td>
                      <td>${f.rate?.toFixed(2)}</td>
                      <td>{f.total_qty?.toFixed(1)}</td>
                      <td><strong>${f.total_amount?.toFixed(2)}</strong></td>
                      <td>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setFabricCostRows(fabricCostRows.filter((_, i) => i !== idx))}>Remove</button>
                      </td>
                    </tr>
                  ))}
                  {fabricCostRows.length === 0 && (
                    <tr><td colSpan={11} style={{ textAlign: 'center', padding: '20px' }}>No fabric costs added yet. Use the form above to add lines.</td></tr>
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
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: 'var(--bg-input)', border: '1px solid var(--border-muted)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Template Options:</span>
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
              <div style={{ background: 'var(--bg-input)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-muted)', marginBottom: '20px' }}>
                <h4 style={{ color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '15px' }}>Add Trims Cost Line</h4>

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
                    <input type="text" className="form-control" value={trimsForm.cons_uom} disabled style={{ background: 'var(--bg-darker)', color: 'var(--text-primary)', border: '1px solid var(--border-muted)' }} />
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
                    <input type="number" className="form-control" value={trimsForm.total_cons} disabled style={{ background: 'var(--bg-darker)', color: 'var(--text-primary)', border: '1px solid var(--border-muted)' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rate * (Float)</label>
                    <input type="number" step="0.01" className="form-control" value={trimsForm.rate} onChange={e => handleTrimsValueChange('rate', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount (Auto)</label>
                    <input type="number" className="form-control" value={trimsForm.amount} disabled style={{ background: 'var(--bg-darker)', color: 'var(--text-primary)', border: '1px solid var(--border-muted)' }} />
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
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Total Trims Cost:</span>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)' }}>
                  ${trimsCostRows.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-muted)', paddingTop: '15px', textAlign: 'right' }}>
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
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: 'var(--bg-input)', border: '1px solid var(--border-muted)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Template Options:</span>
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
              <div style={{ background: 'var(--bg-input)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-muted)', marginBottom: '20px' }}>
                <h4 style={{ color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '15px' }}>Add Embellishment Cost Line</h4>

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
                    <input type="number" className="form-control" value={embForm.total_qty} disabled style={{ background: 'var(--bg-darker)', color: 'var(--text-primary)', border: '1px solid var(--border-muted)' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rate * (Float)</label>
                    <input type="number" step="0.01" className="form-control" value={embForm.rate} onChange={e => handleEmbValueChange('rate', parseFloat(e.target.value) || 0)} />
                  </div>
                </div>

                <div className="grid-3" style={{ marginBottom: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Amount (Auto)</label>
                    <input type="number" className="form-control" value={embForm.amount} disabled style={{ background: 'var(--bg-darker)', color: 'var(--text-primary)', border: '1px solid var(--border-muted)' }} />
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', background: 'var(--bg-darker)', padding: '15px', borderRadius: '6px', border: '1px solid var(--border-muted)' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Total Embellishment Cost:</span>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)' }}>
                  ${embCostRows.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-muted)', paddingTop: '15px', textAlign: 'right' }}>
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
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: 'var(--bg-input)', border: '1px solid var(--border-muted)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Template Options:</span>
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
              <div style={{ background: 'var(--bg-input)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-muted)', marginBottom: '20px' }}>
                <h4 style={{ color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '15px' }}>Add Wash Cost Line</h4>

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
                    <input type="number" className="form-control" value={washForm.total_qty} disabled style={{ background: 'var(--bg-darker)', color: 'var(--text-primary)', border: '1px solid var(--border-muted)' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rate * (Float)</label>
                    <input type="number" step="0.01" className="form-control" value={washForm.rate} onChange={e => handleWashValueChange('rate', parseFloat(e.target.value) || 0)} />
                  </div>
                </div>

                <div className="grid-3" style={{ marginBottom: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Amount (Auto)</label>
                    <input type="number" className="form-control" value={washForm.amount} disabled style={{ background: 'var(--bg-darker)', color: 'var(--text-primary)', border: '1px solid var(--border-muted)' }} />
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', background: 'var(--bg-darker)', padding: '15px', borderRadius: '6px', border: '1px solid var(--border-muted)' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Total Wash Cost:</span>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)' }}>
                  ${washCostRows.reduce((sum, w) => sum + w.amount, 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-muted)', paddingTop: '15px', textAlign: 'right' }}>
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
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: 'var(--bg-input)', border: '1px solid var(--border-muted)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Template Options:</span>
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
              <div style={{ background: 'var(--bg-input)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-muted)', marginBottom: '20px' }}>
                <h4 style={{ color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '15px' }}>Add Commercial Cost Line</h4>

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
                    <input type="number" className="form-control" value={commlForm.amount} disabled style={{ background: 'var(--bg-darker)', color: 'var(--text-primary)', border: '1px solid var(--border-muted)' }} />
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', background: 'var(--bg-darker)', padding: '15px', borderRadius: '6px', border: '1px solid var(--border-muted)' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Total Commercial Cost:</span>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)' }}>
                  ${commlCostRows.reduce((sum, c) => sum + c.amount, 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-muted)', paddingTop: '15px', textAlign: 'right' }}>
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
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: 'var(--bg-input)', border: '1px solid var(--border-muted)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Template Options:</span>
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
              <div style={{ background: 'var(--bg-input)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-muted)', marginBottom: '20px' }}>
                <h4 style={{ color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '15px' }}>Add Other Cost Line</h4>

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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', background: 'var(--bg-darker)', padding: '15px', borderRadius: '6px', border: '1px solid var(--border-muted)' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Total Other Cost:</span>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)' }}>
                  ${otherCostRows.reduce((sum, o) => sum + o.amount, 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-muted)', paddingTop: '15px', textAlign: 'right' }}>
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
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: 'var(--bg-input)', border: '1px solid var(--border-muted)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Template Options:</span>
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
              <div style={{ background: 'var(--bg-input)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-muted)', marginBottom: '20px' }}>
                <h4 style={{ color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '15px' }}>Add Transport Cost Line</h4>

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
                    <input type="number" className="form-control" value={transportForm.amount.toFixed(2)} disabled style={{ background: 'var(--bg-darker)', color: 'var(--text-primary)', border: '1px solid var(--border-muted)' }} />
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', background: 'var(--bg-darker)', padding: '15px', borderRadius: '6px', border: '1px solid var(--border-muted)' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Total Transport Cost:</span>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)' }}>
                  ${transportCostRows.reduce((sum, r) => sum + r.amount, 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-muted)', paddingTop: '15px', textAlign: 'right' }}>
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
              <div style={{ background: 'var(--bg-input)', padding: '15px', borderRadius: '6px', border: '1px solid var(--border-muted)', marginBottom: '15px' }}>
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
                    <input type="number" className="form-control" value={parseFloat((cConsVal + cLoss).toFixed(3))} disabled style={{ background: 'var(--bg-darker)', color: 'var(--text-primary)', border: '1px solid var(--border-muted)' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rate * (Float)</label>
                    <input type="number" className="form-control" step="0.01" value={cRate} onChange={e => setCRate(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount (Auto)</label>
                    <input type="number" className="form-control" value={parseFloat(((cConsVal + cLoss) * cRate).toFixed(3))} disabled style={{ background: 'var(--bg-darker)', color: 'var(--text-primary)', border: '1px solid var(--border-muted)' }} />
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
                      <tr style={{ background: 'var(--bg-input)', fontWeight: 'bold' }}>
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
                      <tr style={{ background: 'var(--bg-darker)', fontWeight: 'bold' }}>
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

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-muted)', paddingTop: '15px', textAlign: 'right' }}>
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
  const [editingId, setEditingId] = useState<string | null>(null);

  const currentUser = (() => {
    try {
      const saved = localStorage.getItem('metamorphosis_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  })();

  const canEdit =
    ['Super Admin', 'Production Manager', 'Store Manager', 'Merchandising Manager'].includes(simRole) ||
    (currentUser && ['super_admin', 'production_manager', 'store_manager', 'merchandiser_manager'].includes(currentUser.role));

  const [filterBasis, setFilterBasis] = useState<'day' | 'month' | 'year' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [downloadTime, setDownloadTime] = useState<string>('');

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

  const getFilteredInquiries = () => {
    let basisFiltered = inquiries;
    if (filterBasis === 'day') {
      if (selectedCalendarDay) {
        basisFiltered = inquiries.filter(inq => inq.inquiry_date === selectedCalendarDay);
      } else {
        basisFiltered = [];
      }
    } else if (filterBasis === 'month') {
      if (selectedMonth) {
        basisFiltered = inquiries.filter(inq => {
          if (!inq.inquiry_date) return false;
          return inq.inquiry_date.startsWith(selectedMonth);
        });
      } else {
        basisFiltered = [];
      }
    } else if (filterBasis === 'year') {
      if (selectedYear) {
        basisFiltered = inquiries.filter(inq => {
          if (inq.year && inq.year.toString() === selectedYear) return true;
          if (inq.inquiry_date) {
            const d = new Date(inq.inquiry_date);
            return !isNaN(d.getTime()) && d.getFullYear().toString() === selectedYear;
          }
          return false;
        });
      } else {
        basisFiltered = [];
      }
    }

    let searchFiltered = basisFiltered;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      searchFiltered = basisFiltered.filter(inq => {
        const idVal = String(inq.id || '').toLowerCase();
        const styleVal = String(inq.style_no || '').toLowerCase();
        const buyerVal = String(inq.buyer_name || '').toLowerCase();
        const leaderVal = String(inq.team_leader || '').toLowerCase();
        const merchantVal = String(inq.dealing_merchant || '').toLowerCase();
        return idVal.includes(q) || styleVal.includes(q) || buyerVal.includes(q) || leaderVal.includes(q) || merchantVal.includes(q);
      });
    }

    if (statusFilter !== 'All') {
      return searchFiltered.filter(inq => inq.status === statusFilter);
    }
    return searchFiltered;
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

  const renderInquiriesTable = (items: any[]) => (
    <div className="table-wrapper">
      <table className="data-table" style={{ whiteSpace: 'nowrap' }}>
        <thead>
          <tr>
            <th>Reference</th>
            <th>Buyer</th>
            <th>Style</th>
            <th>Garments Item</th>
            <th>Brand</th>
            <th>Fabric Type</th>
            <th>Fabric Composition</th>
            <th>GSM</th>
            <th>Dia</th>
            <th>Offer Qty</th>
            <th>Order UOM</th>
            <th>Inquiry Date</th>
            <th>Tentative Shipment Date</th>
            <th>Approval Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((inq, idx) => (
            <tr key={idx}>
              <td><strong>{inq.id}</strong></td>
              <td>{inq.buyer_name}</td>
              <td>{inq.style_no}</td>
              <td>{inq.garments_item}</td>
              <td>{inq.brand}</td>
              <td>{inq.fabric_type || '-'}</td>
              <td>{inq.fabric_composition || '-'}</td>
              <td>{inq.gsm || '-'}</td>
              <td>{inq.dia || '-'}</td>
              <td>{inq.offer_qty}</td>
              <td>{inq.uom}</td>
              <td>{inq.inquiry_date}</td>
              <td>{inq.ship_date}</td>
              <td>
                <span className={`badge badge-${inq.status.toLowerCase().replace(' ', '-')}`}>{inq.status}</span>
              </td>
              <td>
                <div className="d-flex gap-10">
                  <button className="btn btn-secondary btn-sm" onClick={() => handleViewDetails(inq.id)}>
                    <Eye size={12} /> View
                  </button>
                  {canEdit && (
                    <button
                      className="btn btn-sm"
                      style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #cbd5e1' }}
                      onClick={() => handleEditInquiry(inq.id)}
                    >
                      Edit
                    </button>
                  )}
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
                  {(simRole === 'Super Admin' || (currentUser && currentUser.role === 'super_admin')) && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteInquiry(inq.id)}>
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Fabric List & Yarn List
  const [fabricsList, setFabricsList] = useState<any[]>([]);
  const [yarnsList, setYarnsList] = useState<any[]>([]);
  const [itemsMaster, setItemsMaster] = useState<any[]>([]);

  const stylesByCompany: Record<string, Array<{ style_no: string, buyer_id: string, item_group: string, brand: string }>> = {
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
    buyer_name: '',
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
    company: '',
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
    if (!form.buyer_name || !form.style_no) {
      alert("Buyer and Style No are required fields.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, year: form.inquiry_date ? new Date(form.inquiry_date).getFullYear() : new Date().getFullYear(), fabrics: fabricsList, yarns: yarnsList })
      });
      if (res.ok) {
        setShowModal(false);
        fetchInquiries();
        setFabricsList([]);
        setYarnsList([]);
        setForm({
          buyer_id: '',
          buyer_name: '',
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
          company: '',
          quoted_by: 'Super admin',
          status: 'Draft'
        });
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Failed to save Quotation Inquiry: ${err.message || 'Server error'}`);
      }
    } catch (e) { console.error(e); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      alert("You do not have permission to edit this Quotation Inquiry.");
      return;
    }
    if (!form.buyer_name || !form.style_no) {
      alert("Buyer and Style No are required fields.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/inquiries/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, year: form.inquiry_date ? new Date(form.inquiry_date).getFullYear() : new Date().getFullYear(), fabrics: fabricsList, yarns: yarnsList })
      });
      if (res.ok) {
        handleCloseModal();
        fetchInquiries();
      } else {
        alert("Failed to update inquiry.");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating inquiry.");
    }
  };

  const handleEditInquiry = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/inquiries/${id}`);
      if (res.ok) {
        const data = await res.json();
        setForm({
          buyer_id: data.buyer_id?.toString() || '',
          buyer_name: data.buyer_name || buyers.find(b => b.id.toString() === data.buyer_id?.toString())?.name || '',
          style_no: data.style_no || '',
          style_desc: data.style_desc || '',
          item_group: data.item_group || 'Basic',
          garments_item: data.garments_item || '',
          brand: data.brand || '',
          year: data.year || new Date().getFullYear(),
          season: data.season || '',
          team_leader: data.team_leader || '',
          dealing_merchant: data.dealing_merchant || '',
          inquiry_date: data.inquiry_date || '',
          sub_date: data.sub_date || '',
          ship_date: data.ship_date || '',
          offer_qty: data.offer_qty || 0,
          uom: data.uom || 'Pcs',
          costing_per: data.costing_per || '1 Dzn',
          department: data.department || 'Kids',
          sample_req: data.sample_req || 'No',
          remarks: data.remarks || '',
          image_url: data.image_url || '',
          company: data.company || 'Demo Factory Ltd.',
          quoted_by: data.quoted_by || 'Super admin',
          status: data.status || 'Draft'
        });
        setFabricsList(data.fabrics || []);
        setYarnsList(data.yarns || []);
        setEditingId(id);
        setShowModal(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this Quotation Inquiry?")) return;
    try {
      const res = await fetch(`${API_BASE}/inquiries/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert("Quotation Inquiry deleted successfully.");
        fetchInquiries();
      } else {
        alert("Failed to delete Quotation Inquiry.");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting Quotation Inquiry.");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFabricsList([]);
    setYarnsList([]);
    setForm({
      buyer_id: '',
      buyer_name: '',
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
      company: '',
      quoted_by: 'Super admin',
      status: 'Draft'
    });
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
      setDownloadTime('');
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
          <button className="btn btn-secondary" onClick={() => { setSelectedInquiry(null); setDownloadTime(''); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', fontWeight: '600' }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            className="btn btn-success"
            onClick={() => {
              const now = new Date();
              setDownloadTime(now.toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
              }));
              setTimeout(() => {
                window.print();
              }, 150);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#22c55e', borderColor: '#22c55e', color: '#fff', fontWeight: '600' }}
          >
            <Download size={16} /> Download
          </button>
          <button className="btn btn-danger" onClick={() => alert("Generating PDF Report...")} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ef4444', borderColor: '#ef4444', color: '#fff', padding: '10px 14px' }}>
            <FileText size={16} />
          </button>
        </div>

        {downloadTime && (
          <div style={{ marginBottom: '20px', color: '#475569', fontSize: '12px', fontWeight: '600', padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', width: 'fit-content' }}>
            📄 Report Downloaded On: {downloadTime}
          </div>
        )}

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '15px' }}>
          <h2 className="card-title"><HelpCircle /> Quotation Inquiries</h2>
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
                <option value="all">Show All Inquiries</option>
                <option value="day">By Specific Day (Calendar)</option>
                <option value="month">By Specific Month</option>
                <option value="year">By Specific Year</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--text-secondary)' }}>Simulate Role:</label>
              <select className="form-control" style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }} value={simRole} onChange={(e) => setSimRole(e.target.value)}>
                <option value="Super Admin">Super Admin</option>
                <option value="Production Manager">Production Manager</option>
                <option value="Store Manager">Store Manager</option>
                <option value="Merchandising Manager">Merchandising Manager</option>
                <option value="Merchandiser">Merchandiser</option>
                <option value="Others">Others (Buyer)</option>
              </select>
            </div>

            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Add Inquiry Log
            </button>
          </div>
        </div>
      </div>

      {/* Stacked Layout: Filter Inputs on Top, Table below */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px', background: 'transparent' }}>
        {/* Search & Filter bar (Quotation Approval style) */}
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', width: '100%', background: 'transparent' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search Inquiry ID, Style No, Buyer, or Team Leader..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '36px', height: '36px', background: 'var(--bg-input)', border: '1px solid var(--border-muted)', borderRadius: '6px', color: 'var(--text-primary)' }}
            />
          </div>
          <select
            className="form-control"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ width: '220px', height: '36px', background: 'var(--bg-input)', border: '1px solid var(--border-muted)', borderRadius: '6px', color: 'var(--text-primary)' }}
          >
            <option value="All">All Inquiries</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="Draft">Draft</option>
          </select>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
            Found {getFilteredInquiries().length} Inquiries
          </div>
        </div>
        {/* Filter inputs displayed on top when filterBasis is not 'all' */}
        {filterBasis !== 'all' && (
          <div style={{ width: '100%', maxWidth: '400px', alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: '15px' }}>
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

        {/* Filtered List Table - Full Width below the inputs */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-input)', border: '1px solid var(--border-muted)', borderRadius: '8px', padding: '10px 15px', boxShadow: 'var(--shadow-glow)' }}>
            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              📁 {filterBasis === 'all' && 'All Inquiries Logs'}
              {filterBasis === 'day' && (selectedCalendarDay ? `Inquiries for Date: ${formatDateString(selectedCalendarDay)}` : 'Inquiries Logs')}
              {filterBasis === 'month' && (selectedMonth ? `Inquiries for Month: ${selectedMonth}` : 'Inquiries Logs')}
              {filterBasis === 'year' && (selectedYear ? `Inquiries for Year: ${selectedYear}` : 'Inquiries Logs')}
            </h4>
            <span className="badge" style={{ background: 'var(--primary-glow)', border: '1px solid var(--primary)', color: 'var(--text-primary)', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
              {getFilteredInquiries().length} Result(s)
            </span>
          </div>

          {getFilteredInquiries().length > 0 ? (
            renderInquiriesTable(getFilteredInquiries())
          ) : (
            <div style={{ padding: '60px 40px', background: 'var(--bg-input)', border: '1px dashed var(--border-muted)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <HelpCircle size={28} style={{ color: 'var(--border-muted)', marginBottom: '10px' }} />
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>No Inquiries Found</div>
              <div style={{ fontSize: '11px', marginTop: '4px' }}>
                {filterBasis === 'day' && !selectedCalendarDay && 'Please select a date on the calendar.'}
                {filterBasis === 'month' && !selectedMonth && 'Please select a filter month.'}
                {filterBasis === 'day' && selectedCalendarDay && 'No inquiries logged on this day.'}
                {filterBasis === 'month' && selectedMonth && 'No inquiries logged in this month.'}
                {filterBasis === 'year' && 'No inquiries logged in this year.'}
                {filterBasis === 'all' && 'No inquiries logged in the database.'}
              </div>
            </div>
          )}
        </div>
      </div>


      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '850px' }}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit CRM Quotation Inquiry Log' : 'Create CRM Quotation Inquiry Log'}</h3>
              <XCircle className="modal-close" onClick={handleCloseModal} />
            </div>

            <form onSubmit={editingId ? handleUpdate : handleCreate}>
              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter company name..."
                    value={form.company}
                    onChange={e => setForm({ ...form, company: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Style ID *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Style ID..."
                    value={form.style_no}
                    onChange={e => setForm({ ...form, style_no: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Style Description</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Style description..."
                    value={form.style_desc}
                    onChange={e => setForm({ ...form, style_desc: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Buyer *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter buyer name..."
                    value={form.buyer_name || ''}
                    onChange={e => {
                      const val = e.target.value;
                      const matched = buyers.find(b => b.name.toLowerCase() === val.trim().toLowerCase());
                      setForm({
                        ...form,
                        buyer_name: val,
                        buyer_id: matched ? matched.id.toString() : '',
                        season: matched ? matched.season : form.season
                      });
                    }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input type="text" className="form-control" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Zara Kids" />
                </div>
              </div>

              <div className="grid-2">
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
                  <label className="form-label">Garments Item *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter garments item (e.g. T-Shirt, Polo)..."
                    value={form.garments_item}
                    onChange={e => setForm({ ...form, garments_item: e.target.value })}
                    required
                  />
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
                <button type="button" className="btn btn-secondary mr-10" style={{ marginRight: '10px' }} onClick={handleCloseModal}>Cancel</button>
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

  const currentUser = (() => {
    try {
      const saved = localStorage.getItem('metamorphosis_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  })();

  const canEdit = currentUser && ['super_admin', 'production_manager', 'merchandiser_manager', 'store_manager'].includes(currentUser.role);

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

    if (!canEdit) {
      alert("You do not have permission to edit price quotations.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/quotations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || ''
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowModal(false);
        fetchQuotations();
      }
    } catch (e) { console.error(e); }
  };

  const handleApprove = async (id: string) => {
    if (!canEdit) {
      alert("You do not have permission to edit price quotations.");
      return;
    }
    try {
      const q = quotations.find(item => item.id === id);
      await fetch(`${API_BASE}/quotations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || ''
        },
        body: JSON.stringify({ ...q, status: 'Approved', approved_by: 'Supervisor', approve_date: new Date().toISOString().split('T')[0] })
      });
      fetchQuotations();
    } catch (e) { console.error(e); }
  };

  const [order_placement_date_state, setOrderPlacementDateState] = useState('');

  return (
    <div className="dashboard-card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="card-title"><DollarSign /> Price Quotations Costing</h2>
        {canEdit ? (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Costing Engine
          </button>
        ) : (
          <span style={{ color: 'var(--danger)', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            ⚠️ Read-only (Unauthorized)
          </span>
        )}
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
                  {q.status === 'Pending' && canEdit && (
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
                              <td>{(parseFloat(r.cutting_smv) + parseFloat(r.sewing_smv) + parseFloat(r.finishing_smv)).toFixed(2)} min</td>
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
function OrderView({ buyers: _buyers, editOrderId, setEditOrderId }: { buyers: any[], editOrderId: number | null, setEditOrderId: (id: number | null) => void }) {
  const buyersList = _buyers || [];
  const [orders, setOrders] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [filterBasis, setFilterBasis] = useState<'day' | 'month' | 'year' | 'all'>('all');
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Data Source sourcing state
  const [dataSource, setDataSource] = useState<'Individual' | 'Price Quotation Reference' | 'Inquiry Reference'>('Individual');
  const [selectedQuotationId, setSelectedQuotationId] = useState('');
  const [selectedInquiryId, setSelectedInquiryId] = useState('');

  // Custom Style input toggler
  const [showCustomStyleInput, setShowCustomStyleInput] = useState(false);
  const [customStyleText, setCustomStyleText] = useState('');

  // Dropdown Master Options
  const categoriesList = ['Jersey', 'Lingerie', 'Denim', 'Woven', 'Knitwear', 'Outerwear'];
  const itemGroupsList = ['Basic', 'T-Shirt', 'Polo Shirt', 'Hoodie', 'Sweatshirt', 'Jacket', 'Jeans', 'Trousers', 'Shorts', 'Socks'];
  const seasonsList = ['Summer 2026', 'Winter 2026', 'Spring 2027', 'Autumn 2027'];
  const teamLeadersList = ['Sarah Connor', 'John Doe', 'Alex Mercer', 'Emma Watson'];
  const dealingMerchantsMap: { [key: string]: string[] } = {
    'Sarah Connor': ['David Miller', 'James Bond'],
    'John Doe': ['Jane Smith', 'Alice Johnson'],
    'Alex Mercer': ['Nick Fury', 'Tony Stark'],
    'Emma Watson': ['Harry Potter', 'Ron Weasley'],
    '': []
  };

  const yarnTypesList = ['Combed Cotton', 'Carded Cotton', 'Open End Cotton', 'Slub Yarn', 'Grey Melange', 'Siro Spun'];
  const yarnCompositionsList = ['100% Cotton', '60% Cotton 40% Polyester', '95% Cotton 5% Spandex', '100% Polyester', '80% Cotton 20% Polyester'];
  const yarnCertificationsList = ['GOTS Certified', 'OEKO-TEX Standard 100', 'BCI Cotton Certified', 'GRS Certified'];

  const fabricTypesList = ['Single Jersey', 'Rib 1x1', 'Rib 2x2', 'Fleece', 'Pique', 'Interlock', 'French Terry'];
  const fabricCompositionsList = ['100% Cotton', '60% Cotton 40% Polyester', '95% Cotton 5% Spandex', '100% Polyester', '80% Cotton 20% Polyester'];

  const embTypesList = ['AOP', 'Placement Print', 'Embroidery', 'Others'];
  const embNamesList = ['Rubber Print', 'Pigment Print', 'High Density Print', 'Logo Embroidery', 'Applique'];
  const garmentsCertsList = ['GOTS', 'OEKO-TEX', 'WRAP', 'BSCI', 'Sedex', 'ISO 9001'];

  const shipModesList = ['Sea', 'Air', 'Road', 'Train', 'Sea/Air', 'Road/Air'];
  const deliveryCountriesList = ['USA', 'UK', 'Germany', 'France', 'Japan', 'Canada', 'Australia', 'Italy'];

  const colorsList = ['Red', 'Blue', 'Black', 'White', 'Navy', 'Grey', 'Green', 'Yellow', 'Pink', 'Purple'];
  const sizesList = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
  const garmentDeptsList = ['Men', 'Women', 'Boys', 'Girls', 'Kids', 'Unisex'];
  const companiesList = ['Demo Factory Ltd.', 'Apex Apparel Group', 'Metamorphosis Fashion', 'Meet Factory Ltd'];
  const unitsList = ['Demo Unit', 'Wash Unit', 'Knitting Unit', 'Apex Unit 1', 'Meet Dhaka Unit'];
  const packingRatiosList = ['Solid Color Solid Size', 'Solid Color Asort Size', 'Asort Color Solid Size', 'Asort Color Asort Size'];
  const delayReasonsList = ['Knitting', 'Dyeing', 'Garments Production'];
  const cutoffValsList = ['1st Cut Off', '2nd Cut Off', '3rd Cut Off', 'Full'];
  const divisionsList = ['Jersey', 'Lingerie'];
  const productTypesList = ['Regular', 'Licensor'];
  const matrixTypesList = [
    'Product with Full Quantity',
    'Packing Ratio with Product Quantity',
    'Color wise Packing Ratio with Product Quantity',
    'Color wise Packing Ratio'
  ];

  // Core Form State
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
    garment_dept: 'Men',
    embellishment_type: '',
    embellishment_name: '',
    embellishment_notes: '',
    yarn_type: '',
    yarn_cert: '',
    yarn_comp: '',
    fabric_type: '',
    fabric_comp: '',
    gsm: 180,
    garments_cert: '',
    ship_mode: 'Sea',
    quality_label: 'A-Grade',
    style_owner: 'Fast Retailing Owner',
    garment_weight: 150,
    avg_weight: 150,
    special_instruction: '',
    terms: '',
    image_url: '',
    company: 'Demo Factory Ltd.',
    unit: 'Demo Unit',
    status: 'Draft'
  });

  // Attached files state
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string; type: string }[]>([]);

  // Current Entering PO Form States
  const [poNo, setPoNo] = useState('');
  const [poStatus, setPoStatus] = useState('Confirm');
  const [poReceivedDate, setPoReceivedDate] = useState(new Date().toISOString().split('T')[0]); // fixed today
  const [exFactoryDate, setExFactoryDate] = useState('');
  const [shipDate, setShipDate] = useState('');
  const [poQty, setPoQty] = useState(5000);
  const [poFob, setPoFob] = useState(4.5);
  const [packingRatio, setPackingRatio] = useState('Solid Color Solid Size');
  const [delayFor, setDelayFor] = useState('');
  const [poActiveStatus, setPoActiveStatus] = useState('Active');
  const [poRemarks, setPoRemarks] = useState('');
  const [printQty, setPrintQty] = useState(0);
  const [embroideryQty, setEmbroideryQty] = useState(0);
  const [deliveryCountry, setDeliveryCountry] = useState('USA');
  const [pcsPerPack, setPcsPerPack] = useState(1);
  const [matrixType, setMatrixType] = useState('Product with Full Quantity');
  const [internalRefNo, setInternalRefNo] = useState('');
  const [commFileNo, setCommFileNo] = useState('');
  const [areaCode, setAreaCode] = useState('');
  const [cutoffDate, setCutoffDate] = useState('');
  const [cutoffVal, setCutoffVal] = useState('Full');
  const [division, setDivision] = useState('Jersey');
  const [countryShipDate, setCountryShipDate] = useState('');
  const [packType, setPackType] = useState('');
  const [portOfDischarge, setPortOfDischarge] = useState('');
  const [productType, setProductType] = useState('Regular');
  const [reqHanger, setReqHanger] = useState('No');
  const [cartonInfo, setCartonInfo] = useState('');

  // Breakdown entry form states (inside current PO context)
  const [breakdownLines, setBreakdownLines] = useState<any[]>([]);
  const [bdColor, setBdColor] = useState('Red');
  const [bdSize, setBdSize] = useState('M');
  const [bdSetQty, setBdSetQty] = useState(1);
  const [bdPcsQty, setBdPcsQty] = useState(2500);
  const [bdExCutPct, setBdExCutPct] = useState(4);
  const [bdArticleNo, setBdArticleNo] = useState('');

  // Total PO breakdowns list
  const [poList, setPoList] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailTab, setDetailTab] = useState<'1st' | '2nd' | '3rd'>('1st');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const currentUser = (() => {
    try {
      const saved = localStorage.getItem('metamorphosis_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  })();

  const [simRole, setSimRole] = useState(() => {
    try {
      const saved = localStorage.getItem('metamorphosis_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (['super_admin', 'production_manager', 'store_manager', 'merchandiser_manager'].includes(u.role)) {
          return u.role;
        }
      }
    } catch (e) { }
    return 'super_admin';
  });

  const canEntry = ['super_admin', 'production_manager', 'store_manager', 'merchandiser_manager'].includes(simRole);

  useEffect(() => {
    if (editOrderId) {
      const loadAndEdit = async () => {
        try {
          const res = await fetch(`${API_BASE}/orders/${editOrderId}`);
          if (res.ok) {
            const data = await res.json();
            setForm({
              style_no: data.style_no || '',
              inquiry_id: data.inquiry_id || '',
              buyer: data.buyer || '',
              style_desc: data.style_desc || '',
              order_status: data.order_status || 'Confirm',
              category: data.category || 'Jersey',
              item_group: data.item_group || 'Basic',
              season: data.season || '',
              team_leader: data.team_leader || '',
              dealing_merchant: data.dealing_merchant || '',
              factory_merchant: data.factory_merchant || '',
              currency: data.currency || 'USD',
              uom: data.uom || 'Pcs',
              smv: data.smv || 12.0,
              repeat_no: data.repeat_no || '1',
              model_code: data.model_code || 101,
              garment_dept: data.garment_dept || 'Men',
              embellishment_type: data.embellishment_type || '',
              embellishment_name: data.embellishment_name || '',
              embellishment_notes: data.embellishment_notes || '',
              yarn_type: data.yarn_type || '',
              yarn_cert: data.yarn_cert || '',
              yarn_comp: data.yarn_comp || '',
              fabric_type: data.fabric_type || '',
              fabric_comp: data.fabric_comp || '',
              gsm: data.gsm || 180,
              garments_cert: data.garments_cert || '',
              ship_mode: data.ship_mode || 'Sea',
              quality_label: data.quality_label || 'A-Grade',
              style_owner: data.style_owner || 'Fast Retailing Owner',
              garment_weight: data.garment_weight || 150,
              avg_weight: data.avg_weight || 150,
              special_instruction: data.special_instruction || '',
              terms: data.terms || '',
              image_url: data.image_url || '',
              company: data.company || 'Demo Factory Ltd.',
              unit: data.unit || 'Demo Unit',
              status: data.status || 'Draft'
            });
            setPoList(data.pos || []);
            setEditingId(editOrderId);
            setShowModal(true);
            setEditOrderId(null);
          }
        } catch (e) {
          console.error(e);
        }
      };
      loadAndEdit();
    }
  }, [editOrderId]);

  useEffect(() => {
    fetchOrders();
    fetchQuotations();
    fetchInquiries();
  }, []);

  // Update lead time dynamically when shipment date or received date changes
  const computedLeadTime = (() => {
    if (!poReceivedDate || !shipDate) return 0;
    const d1 = new Date(poReceivedDate);
    const d2 = new Date(shipDate);
    const diff = d2.getTime() - d1.getTime();
    return diff > 0 ? Math.ceil(diff / (1000 * 3600 * 24)) : 0;
  })();

  // Update week of the year based on shipment date
  const computedWeekNo = (() => {
    if (!shipDate) return 1;
    const d = new Date(shipDate);
    const start = new Date(d.getFullYear(), 0, 1);
    const diff = d.getTime() - start.getTime() + ((start.getTimezoneOffset() - d.getTimezoneOffset()) * 60 * 1000);
    const day = Math.floor(diff / (1000 * 3600 * 24));
    return Math.ceil((day + start.getDay() + 1) / 7);
  })();

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

  const fetchInquiries = async () => {
    try {
      const res = await fetch(`${API_BASE}/inquiries`);
      const data = await res.json();
      setInquiries(data);
    } catch (e) { console.error(e); }
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

    const getOrderCount = (d: number) => {
      const key = formatDateKey(d);
      return orders.filter(o => o.pos && o.pos.some((p: any) => p.ship_date === key)).length;
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
            const count = item.isCurrentMonth ? getOrderCount(item.day) : 0;
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

  const getFilteredOrders = () => {
    let basisFiltered = orders;

    // 1. Basis Filter (by PO Ship Date)
    if (filterBasis === 'day') {
      if (selectedCalendarDay) {
        basisFiltered = orders.filter(o => o.pos && o.pos.some((p: any) => p.ship_date === selectedCalendarDay));
      } else {
        basisFiltered = [];
      }
    } else if (filterBasis === 'month') {
      if (selectedMonth) {
        basisFiltered = orders.filter(o => o.pos && o.pos.some((p: any) => p.ship_date && p.ship_date.startsWith(selectedMonth)));
      } else {
        basisFiltered = [];
      }
    } else if (filterBasis === 'year') {
      if (selectedYear) {
        basisFiltered = orders.filter(o => o.pos && o.pos.some((p: any) => p.ship_date && p.ship_date.startsWith(selectedYear)));
      } else {
        basisFiltered = [];
      }
    }

    // 2. Search Filter
    let searchFiltered = basisFiltered;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      searchFiltered = basisFiltered.filter(o => {
        const idVal = `ord-${o.id}`.toLowerCase();
        const buyerVal = String(o.buyer || '').toLowerCase();
        const styleVal = String(o.style_no || '').toLowerCase();
        const leaderVal = String(o.team_leader || '').toLowerCase();
        const merchantVal = String(o.dealing_merchant || '').toLowerCase();
        const poNames = o.pos?.map((p: any) => p.po_no).join(' ').toLowerCase() || '';

        return idVal.includes(q) || buyerVal.includes(q) || styleVal.includes(q) || leaderVal.includes(q) || merchantVal.includes(q) || poNames.includes(q);
      });
    }

    // 3. Status Filter
    if (statusFilter !== 'All') {
      return searchFiltered.filter(o => (o.status || 'Draft') === statusFilter);
    }
    return searchFiltered;
  };

  const handleSourceChange = (src: 'Individual' | 'Price Quotation Reference' | 'Inquiry Reference') => {
    setDataSource(src);
    setSelectedQuotationId('');
    setSelectedInquiryId('');
    setCustomStyleText('');
    setShowCustomStyleInput(false);

    if (src === 'Price Quotation Reference' && quotations.length === 0) {
      alert("No data found in Price Quotation.");
    }
  };

  // Get Data auto-fill logic
  const handleGetData = async () => {
    if (dataSource === 'Price Quotation Reference') {
      if (!selectedQuotationId) return alert("Please select a completed Price Quotation first.");
      try {
        const res = await fetch(`${API_BASE}/quotations/${selectedQuotationId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();

        const inqRes = await fetch(`${API_BASE}/inquiries/${data.inquiry_id}`);
        const inq = inqRes.ok ? await inqRes.json() : {};

        const resolvedBuyer = inq.buyer_name ||
          buyersList.find((b: any) => b.id.toString() === inq.buyer_id?.toString())?.name ||
          data.buyer ||
          '';

        setForm(prev => ({
          ...prev,
          style_no: data.style_no,
          inquiry_id: data.inquiry_id,
          buyer: resolvedBuyer,
          style_desc: inq.style_desc || data.style_desc || '',
          item_group: inq.garments_item || data.item_group || '',
          season: inq.season || data.season || '',
          uom: inq.uom || data.uom || 'Pcs',
          smv: data.total_smv || 12.0,
          yarn_type: data.yarn_cert || '',
          yarn_comp: inq.fabrics?.[0]?.composition || '',
          yarn_cert: data.yarn_cert || '',
          image_url: data.image_url || inq.image_url || '',
          mc_line: String(data.mc_line || ''),
          prod_line_hour: String(data.prod_line_hour || '')
        }));
        setPoFob(data.fob_price_pc || 0);
        setShipDate(inq.ship_date || '');
        setCountryShipDate(inq.ship_date || '');
      } catch (e) {
        alert("Failed to fetch price quotation data.");
      }
    } else if (dataSource === 'Inquiry Reference') {
      if (!selectedInquiryId) return alert("Please select an Inquiry ID first.");
      try {
        const inqRes = await fetch(`${API_BASE}/inquiries/${selectedInquiryId}`);
        if (!inqRes.ok) throw new Error();
        const inq = await inqRes.json();

        const resolvedBuyer = inq.buyer_name ||
          buyersList.find((b: any) => b.id.toString() === inq.buyer_id?.toString())?.name ||
          '';

        setForm(prev => ({
          ...prev,
          style_no: inq.style_no,
          inquiry_id: inq.id,
          buyer: resolvedBuyer,
          style_desc: inq.style_desc || '',
          item_group: inq.garments_item || '',
          season: inq.season || '',
          uom: inq.uom || 'Pcs',
          image_url: inq.image_url || ''
        }));
        setShipDate(inq.ship_date || '');
        setCountryShipDate(inq.ship_date || '');
      } catch (e) {
        alert("Failed to fetch inquiry details.");
      }
    } else {
      // Individual Sourcing
      if (showCustomStyleInput && customStyleText) {
        setForm(prev => ({ ...prev, style_no: customStyleText }));
      }
      alert("Individual details fetched from Style Master.");
    }
  };

  const handleCheckboxChange = (field: 'yarn_type' | 'yarn_comp' | 'yarn_cert' | 'fabric_type' | 'fabric_comp' | 'embellishment_type', val: string) => {
    let list = form[field] ? form[field].split(', ') : [];
    if (list.includes(val)) {
      list = list.filter(x => x !== val);
    } else {
      list.push(val);
    }
    setForm({ ...form, [field]: list.join(', ') });
  };

  // Add breakdown line
  const handleAddBreakdownLine = () => {
    if (!bdPcsQty || bdPcsQty <= 0) return alert("Enter a valid Pcs Quantity.");
    const planQty = bdPcsQty + Math.round(bdPcsQty * (bdExCutPct / 100));
    const lineAmount = bdPcsQty * poFob;

    setBreakdownLines([...breakdownLines, {
      color: bdColor,
      size: bdSize,
      set_qty: bdSetQty,
      pcs_qty: bdPcsQty,
      rate: poFob,
      ex_cut_pct: bdExCutPct,
      plan_cut_qty: planQty,
      article_no: bdArticleNo || 'A-101',
      amount: lineAmount,
      garments_item: form.style_no || 'Hoodie'
    }]);

    setBdArticleNo('');
  };

  // Add PO to PO list
  const handleAddPO = () => {
    if (!poNo) return alert("Please specify a PO Number.");
    if (!shipDate) return alert("Please specify a Shipment Date.");
    if (breakdownLines.length === 0) return alert("Add at least one color/size breakdown line first.");

    const finalPoQty = breakdownLines.reduce((sum, b) => sum + b.pcs_qty, 0);

    setPoList([...poList, {
      po_no: poNo,
      status: poStatus,
      received_date: poReceivedDate,
      ex_factory_date: exFactoryDate || shipDate,
      ship_date: shipDate,
      week_no: computedWeekNo,
      lead_time: computedLeadTime,
      po_qty: finalPoQty,
      fob_price: poFob,
      fob_in_dzn: poFob * 12,
      carton_info: cartonInfo || `${pcsPerPack} pcs/carton`,
      comm_file_no: commFileNo,
      packing_ratio: packingRatio,
      delay_for: delayFor,
      po_status: poActiveStatus,
      remarks: poRemarks,
      delivery_country: deliveryCountry,
      code: deliveryCountry.substring(0, 2).toUpperCase(),
      area: 'NY',
      area_code: areaCode,
      cutoff_date: cutoffDate || shipDate,
      cutoff_val: cutoffVal,
      division: division,
      country_ship_date: countryShipDate || shipDate,
      pack_type: packType || 'Solid Pack',
      port_of_discharge: portOfDischarge || 'Chittagong Port',
      product_type: productType,
      pcs_per_pack: pcsPerPack,
      req_hanger: reqHanger,
      matrix_type: matrixType,
      internal_ref_no: internalRefNo,
      print_qty: printQty,
      embroidery_qty: embroideryQty,
      breakdown: breakdownLines
    }]);

    // reset fields
    setPoNo('');
    setBreakdownLines([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(f => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
        type: f.type || 'unknown'
      }));
      setAttachedFiles([...attachedFiles, ...newFiles]);
    }
  };

  // Submit Order Save
  const handleSaveOrder = async (statusType: 'Draft' | 'Approved') => {
    if (!canEntry) {
      return alert("You do not have permission to save Order Entries.");
    }
    if (!form.style_no) {
      return alert("Please enter or select a style reference first.");
    }
    if (statusType === 'Approved' && poList.length === 0) {
      return alert("Confirmed orders require at least one PO breakdown link. To save incomplete details, click Draft Save.");
    }

    const payload = {
      ...form,
      status: statusType,
      pos: poList
    };

    try {
      const url = editingId ? `${API_BASE}/orders/${editingId}` : `${API_BASE}/orders`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        handleCloseModal();
        fetchOrders();
      } else {
        alert("Failed to save order entry record.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error saving order.");
    }
  };

  const handleEditOrder = async (order: any) => {
    if (!canEntry) {
      return alert("You do not have permission to edit Order Entries.");
    }
    try {
      const res = await fetch(`${API_BASE}/orders/${order.id}`);
      if (res.ok) {
        const data = await res.json();
        setForm({
          style_no: data.style_no || '',
          inquiry_id: data.inquiry_id || '',
          buyer: data.buyer || '',
          style_desc: data.style_desc || '',
          order_status: data.order_status || 'Confirm',
          category: data.category || 'Jersey',
          item_group: data.item_group || 'Basic',
          season: data.season || '',
          team_leader: data.team_leader || '',
          dealing_merchant: data.dealing_merchant || '',
          factory_merchant: data.factory_merchant || '',
          currency: data.currency || 'USD',
          uom: data.uom || 'Pcs',
          smv: data.smv || 12.0,
          repeat_no: data.repeat_no || '1',
          model_code: data.model_code || 101,
          garment_dept: data.garment_dept || 'Men',
          embellishment_type: data.embellishment_type || '',
          embellishment_name: data.embellishment_name || '',
          embellishment_notes: data.embellishment_notes || '',
          yarn_type: data.yarn_type || '',
          yarn_cert: data.yarn_cert || '',
          yarn_comp: data.yarn_comp || '',
          fabric_type: data.fabric_type || '',
          fabric_comp: data.fabric_comp || '',
          gsm: data.gsm || 180,
          garments_cert: data.garments_cert || '',
          ship_mode: data.ship_mode || 'Sea',
          quality_label: data.quality_label || 'A-Grade',
          style_owner: data.style_owner || 'Fast Retailing Owner',
          garment_weight: data.garment_weight || 150,
          avg_weight: data.avg_weight || 150,
          special_instruction: data.special_instruction || '',
          terms: data.terms || '',
          image_url: data.image_url || '',
          company: data.company || 'Demo Factory Ltd.',
          unit: data.unit || 'Demo Unit',
          status: data.status || 'Draft'
        });
        setPoList(data.pos || []);
        setEditingId(order.id);
        setShowModal(true);
      } else {
        alert("Failed to fetch order details.");
      }
    } catch (e) {
      console.error(e);
      alert("Error loading order.");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setPoList([]);
    setForm({
      style_no: '', inquiry_id: '', buyer: '', style_desc: '', order_status: 'Confirm',
      category: 'Jersey', item_group: 'Basic', season: '', team_leader: '', dealing_merchant: '',
      factory_merchant: '', currency: 'USD', uom: 'Pcs', smv: 12.0, repeat_no: '1', model_code: 101,
      garment_dept: 'Men', embellishment_type: '', embellishment_name: '', embellishment_notes: '',
      yarn_type: '', yarn_cert: '', yarn_comp: '', fabric_type: '', fabric_comp: '', gsm: 180,
      garments_cert: '', ship_mode: 'Sea', quality_label: 'A-Grade', style_owner: 'Fast Retailing Owner',
      garment_weight: 150, avg_weight: 150, special_instruction: '', terms: '', image_url: '',
      company: 'Demo Factory Ltd.', unit: 'Demo Unit', status: 'Draft'
    });
  };

  // Delete Order
  const handleDeleteOrder = async (id: number) => {
    if (!canEntry) {
      return alert("You do not have permission to delete Order Entries.");
    }
    if (!window.confirm("Are you sure you want to delete this Order Entry and all its POs?")) return;
    try {
      const res = await fetch(`${API_BASE}/orders/${id}`, { method: 'DELETE' });
      if (res.ok) fetchOrders();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="dashboard-card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <h2 className="card-title"><ShoppingBag /> Confirmed Orders (Order Entry)</h2>
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
              <option value="all">Show All Orders</option>
              <option value="day">By Specific Day (Calendar)</option>
              <option value="month">By Specific Month</option>
              <option value="year">By Specific Year</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Simulate Role:</label>
            <select
              className="form-control"
              style={{ width: '220px', height: '38px', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-muted)' }}
              value={simRole}
              onChange={(e) => setSimRole(e.target.value)}
            >
              <option value="super_admin">Super Admin</option>
              <option value="production_manager">Production Manager</option>
              <option value="store_manager">Store Manager</option>
              <option value="merchandiser_manager">Merchandiser Manager</option>
              <option value="unit_user">Unit User (Unauthorized)</option>
            </select>
          </div>
          <button
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: canEntry ? 1 : 0.6, cursor: canEntry ? 'pointer' : 'not-allowed' }}
            disabled={!canEntry}
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} /> New Order Entry
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
            placeholder="Search Order ID, Style No, Buyer, PO, or Merchant..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '36px', height: '36px', background: 'var(--bg-input)', border: '1px solid var(--border-muted)', borderRadius: '6px', color: 'var(--text-primary)' }}
          />
        </div>
        <select
          className="form-control"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ width: '220px', height: '36px', background: 'var(--bg-input)', border: '1px solid var(--border-muted)', borderRadius: '6px', color: 'var(--text-primary)' }}
        >
          <option value="All">All Orders</option>
          <option value="Pending Approval">Pending Approval</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Draft">Draft</option>
        </select>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
          Found {getFilteredOrders().length} Orders
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

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Buyer</th>
              <th>Style No</th>
              <th>POs</th>
              <th>Total Qty</th>
              <th>Value</th>
              <th>Ship Date</th>
              <th>Season</th>
              <th>SMV</th>
              <th>Leader</th>
              <th>Merchant</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredOrders().map((o, idx) => {
              const poNames = o.pos?.map((p: any) => p.po_no).join(', ') || 'N/A';
              const maxShipDate = o.pos?.reduce((max: string, p: any) => p.ship_date > max ? p.ship_date : max, '') || 'N/A';
              return (
                <tr key={idx}>
                  <td><strong>ORD-{o.id}</strong></td>
                  <td>{o.buyer}</td>
                  <td>{o.style_no}</td>
                  <td><div style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{poNames}</div></td>
                  <td><strong>{parseFloat(o.total_qty || 0).toLocaleString()} {o.uom}</strong></td>
                  <td><strong>${parseFloat(o.total_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
                  <td>{maxShipDate}</td>
                  <td>{o.season}</td>
                  <td>{o.smv}</td>
                  <td>{o.team_leader || 'N/A'}</td>
                  <td>{o.dealing_merchant || 'N/A'}</td>
                  <td>
                    <span className={`badge badge-${(o.status || 'Draft').toLowerCase().replace(/\s+/g, '-')}`}>{o.status || 'Draft'}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedOrder(o); setDetailTab('1st'); setShowDetailModal(true); }}>
                        1st View
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedOrder(o); setDetailTab('2nd'); setShowDetailModal(true); }}>
                        2nd View
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedOrder(o); setDetailTab('3rd'); setShowDetailModal(true); }}>
                        3rd View
                      </button>
                      {canEntry && (
                        <>
                          <button className="btn btn-warning btn-sm" onClick={() => handleEditOrder(o)}>
                            Edit
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteOrder(o.id)}>
                            <Trash size={12} /> Delete
                          </button>
                          {(o.status === 'Draft' || o.status === 'Rejected' || !o.status) && (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ background: '#0f766e', borderColor: '#0f766e', color: '#fff' }}
                              onClick={async () => {
                                try {
                                  const res = await fetch(`${API_BASE}/orders/${o.id}/approve-status`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: 'Pending Approval' })
                                  });
                                  if (res.ok) {
                                    fetchOrders();
                                    alert("Order submitted for approval!");
                                  } else {
                                    alert("Failed to submit order for approval.");
                                  }
                                } catch (e) {
                                  console.error(e);
                                  alert("Error submitting order.");
                                }
                              }}
                            >
                              Submit Approval
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '95%', width: '1300px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Order & PO Breakdowns' : 'Create New Order & PO Breakdowns'}</h3>
              <XCircle className="modal-close" onClick={handleCloseModal} />
            </div>

            {/* SOURCING CONFIGURATION */}
            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '12px' }}>Data Sourcing Options</h4>
              <div className="grid-3" style={{ alignItems: 'flex-end' }}>
                <div className="form-group">
                  <label className="form-label">Data Source *</label>
                  <select className="form-control" value={dataSource} onChange={e => handleSourceChange(e.target.value as any)}>
                    <option value="Individual">Individual (Style Master)</option>
                    <option value="Price Quotation Reference">Price Quotation Reference</option>
                    <option value="Inquiry Reference">Inquiry Reference (Inquiry ID)</option>
                  </select>
                </div>

                {dataSource === 'Price Quotation Reference' && (
                  <div className="form-group">
                    <label className="form-label">Approved Quotation ID / Style</label>
                    <select className="form-control" value={selectedQuotationId} onChange={e => setSelectedQuotationId(e.target.value)}>
                      <option value="">Select Quotation</option>
                      {quotations.map(q => <option key={q.id} value={q.id}>{q.id} ({q.style_no} - {q.buyer})</option>)}
                    </select>
                  </div>
                )}

                {dataSource === 'Inquiry Reference' && (
                  <div className="form-group">
                    <label className="form-label">Buyer Inquiry ID</label>
                    <select className="form-control" value={selectedInquiryId} onChange={e => setSelectedInquiryId(e.target.value)}>
                      <option value="">Select Inquiry</option>
                      {inquiries.map(i => <option key={i.id} value={i.id}>{i.id} ({i.style_no})</option>)}
                    </select>
                  </div>
                )}

                {dataSource === 'Individual' && (
                  <div className="form-group">
                    <label className="form-label">Style Master Dropdown</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {showCustomStyleInput ? (
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Type custom style..."
                          value={customStyleText}
                          onChange={e => setCustomStyleText(e.target.value)}
                        />
                      ) : (
                        <select className="form-control" value={form.style_no} onChange={e => setForm({ ...form, style_no: e.target.value })}>
                          <option value="">Select Style</option>
                          <option value="ST-TEE-2026">ST-TEE-2026 (T-Shirt)</option>
                          <option value="ST-POLO-99">ST-POLO-99 (Polo Shirt)</option>
                          <option value="ST-JEANS-X">ST-JEANS-X (Jeans)</option>
                          <option value="ST-HOODIE-W">ST-HOODIE-W (Hoodie)</option>
                          <option value="ST-JACKET-Z">ST-JACKET-Z (Jacket)</option>
                        </select>
                      )}
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setShowCustomStyleInput(!showCustomStyleInput)}
                        title="Add Custom Style"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={handleGetData}>
                    Get Data & Auto Fill
                  </button>
                </div>
              </div>
            </div>

            {/* MAIN ORDER ENTRY FORM */}
            <h4 style={{ borderBottom: '1px solid var(--border-muted)', paddingBottom: '8px', marginBottom: '15px' }}>Garment Style Specifications</h4>
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Buyer *</label>
                <select className="form-control" value={form.buyer} onChange={e => setForm({ ...form, buyer: e.target.value })}>
                  <option value="">Select Buyer</option>
                  {buyersList.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  {form.buyer && !buyersList.some(b => b.name === form.buyer) && (
                    <option value={form.buyer}>{form.buyer}</option>
                  )}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Style Reference *</label>
                <input type="text" className="form-control" value={form.style_no} onChange={e => setForm({ ...form, style_no: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Style Description</label>
                <input type="text" className="form-control" value={form.style_desc} onChange={e => setForm({ ...form, style_desc: e.target.value })} />
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Order Status (Hardcoded)</label>
                <select className="form-control" value={form.order_status} onChange={e => setForm({ ...form, order_status: e.target.value })}>
                  <option value="Confirm">Confirm</option>
                  <option value="Projection">Projection</option>
                  <option value="Cancel">Cancel</option>
                  <option value="Reject">Reject</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Garments Item</label>
                <input type="text" className="form-control" value={form.item_group} onChange={e => setForm({ ...form, item_group: e.target.value })} />
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Currency</label>
                <select className="form-control" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">UOM (Hardcoded)</label>
                <select className="form-control" value={form.uom} onChange={e => setForm({ ...form, uom: e.target.value })}>
                  <option value="Pcs">Pcs</option>
                  <option value="Set">Set</option>
                  <option value="Pack">Pack</option>
                </select>
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">GSM (Integer)</label>
                <input type="number" className="form-control" value={form.gsm} onChange={e => setForm({ ...form, gsm: parseInt(e.target.value) || 180 })} />
              </div>
              <div className="form-group">
                <label className="form-label">SMV * (Browse Bulletin / Edit)</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input type="number" step="0.01" className="form-control" value={form.smv} onChange={e => setForm({ ...form, smv: parseFloat(e.target.value) || 0 })} />
                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center' }}>
                    Browse
                    <input type="file" style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Repeat No</label>
                <input type="text" className="form-control" value={form.repeat_no} onChange={e => setForm({ ...form, repeat_no: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Model Code (Integer)</label>
                <input type="number" className="form-control" value={form.model_code} onChange={e => setForm({ ...form, model_code: parseInt(e.target.value) || 101 })} />
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Ship Mode (Hardcoded)</label>
                <select className="form-control" value={form.ship_mode} onChange={e => setForm({ ...form, ship_mode: e.target.value })}>
                  {shipModesList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quality Label</label>
                <input type="text" className="form-control" value={form.quality_label} onChange={e => setForm({ ...form, quality_label: e.target.value })} />
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Garment Weight (g) (Float)</label>
                <input type="number" step="0.1" className="form-control" value={form.garment_weight} onChange={e => setForm({ ...form, garment_weight: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="form-group">
                <label className="form-label">Average Weight (g) (Float)</label>
                <input type="number" step="0.1" className="form-control" value={form.avg_weight} onChange={e => setForm({ ...form, avg_weight: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="form-group">
                <label className="form-label">Sustainable Material *</label>
                <select className="form-control" value={form.garments_cert || 'GOTS'} onChange={e => setForm({ ...form, garments_cert: e.target.value })}>
                  <option value="GOTS">GOTS Certified (Mendatory)</option>
                  <option value="GRS">GRS Polyester (Mendatory)</option>
                  <option value="OEKO-TEX">OEKO-TEX Standard 100</option>
                  <option value="BCI">BCI Cotton</option>
                </select>
              </div>
            </div>

            {/* CHECKBOX GRID FOR MULTIPLE SELECT PROPERTIES */}
            <div style={{ background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)', marginTop: '20px', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '12px' }}>Fabric & Yarn Configuration (Multiple Selection)</h4>

              <div className="grid-2">
                <div>
                  <label className="form-label" style={{ fontWeight: 600 }}>Fabric Types</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                    {fabricTypesList.map(ft => (
                      <label key={ft} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', padding: '4px 8px', background: 'var(--bg-input)', borderRadius: '4px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={form.fabric_type.split(', ').includes(ft)} onChange={() => handleCheckboxChange('fabric_type', ft)} />
                        {ft}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 600 }}>Fabric Compositions</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                    {fabricCompositionsList.map(fc => (
                      <label key={fc} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', padding: '4px 8px', background: 'var(--bg-input)', borderRadius: '4px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={form.fabric_comp.split(', ').includes(fc)} onChange={() => handleCheckboxChange('fabric_comp', fc)} />
                        {fc}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid-3 mt-15">
                <div>
                  <label className="form-label" style={{ fontWeight: 600 }}>Yarn Types</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                    {yarnTypesList.map(yt => (
                      <label key={yt} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={form.yarn_type.split(', ').includes(yt)} onChange={() => handleCheckboxChange('yarn_type', yt)} />
                        {yt}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 600 }}>Yarn Compositions</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                    {yarnCompositionsList.map(yc => (
                      <label key={yc} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={form.yarn_comp.split(', ').includes(yc)} onChange={() => handleCheckboxChange('yarn_comp', yc)} />
                        {yc}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 600 }}>Yarn Certifications</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                    {yarnCertificationsList.map(yc => (
                      <label key={yc} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={form.yarn_cert.split(', ').includes(yc)} onChange={() => handleCheckboxChange('yarn_cert', yc)} />
                        {yc}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* EMBELLISHMENTS SECTION */}
            <div style={{ background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '12px' }}>Embellishment Details</h4>
              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Embellishment Type (Multiple select)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                    {embTypesList.map(et => (
                      <label key={et} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={form.embellishment_type.split(', ').includes(et)} onChange={() => handleCheckboxChange('embellishment_type', et)} />
                        {et}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Embellishment Name</label>
                  <input type="text" className="form-control" value={form.embellishment_name} onChange={e => setForm({ ...form, embellishment_name: e.target.value })} placeholder="Print name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Embellishment Notes</label>
                  <input type="text" className="form-control" value={form.embellishment_notes} onChange={e => setForm({ ...form, embellishment_notes: e.target.value })} placeholder="e.g. Eco friendly dye" />
                </div>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Special Instruction (Browse Option)</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <textarea className="form-control" style={{ height: '80px' }} value={form.special_instruction} onChange={e => setForm({ ...form, special_instruction: e.target.value })} placeholder="Details..." />
                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center', height: '36px' }}>
                    Browse
                    <input type="file" style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Terms</label>
                <textarea className="form-control" style={{ height: '80px' }} value={form.terms} onChange={e => setForm({ ...form, terms: e.target.value })} placeholder="L/C payment details..." />
              </div>
            </div>

            <div className="grid-3 mt-15">
              <div className="form-group">
                <label className="form-label">Design Image Preview</label>
                <div style={{ border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-sm)', height: '144px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                  {form.image_url ? (
                    <img src={form.image_url} alt="Garment design" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No image loaded</span>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Upload Style Image</label>
                <input type="file" className="form-control" onChange={e => {
                  if (e.target.files?.[0]) {
                    const reader = new FileReader();
                    reader.onload = (ev) => setForm({ ...form, image_url: ev.target?.result as string });
                    reader.readAsDataURL(e.target.files[0]);
                  }
                }} />
              </div>
              <div className="form-group">
                <label className="form-label">Multiple File Upload (PDF & Excel)</label>
                <input type="file" multiple accept=".pdf,.xlsx,.xls" className="form-control" onChange={handleFileUpload} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px', maxHeight: '80px', overflowY: 'auto' }}>
                  {attachedFiles.map((file, i) => (
                    <div key={i} style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{file.name} ({file.size})</div>
                  ))}
                </div>
              </div>
            </div>

            {/* PURCHASE ORDER (PO) ENTRY SECTION */}
            <h4 style={{ margin: '24px 0 10px 0', borderBottom: '1px dashed var(--border-muted)', paddingBottom: '8px', color: 'var(--warning)' }}>PO Entry Form</h4>
            <div style={{ background: 'rgba(255,255,255,0.01)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)' }}>
              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Order Status (Hardcoded)</label>
                  <select className="form-control" value={poStatus} onChange={e => setPoStatus(e.target.value)}>
                    <option value="Confirm">Confirm</option>
                    <option value="Projection">Projection</option>
                    <option value="Cancel">Cancel</option>
                    <option value="Reject">Reject</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">PO No *</label>
                  <input type="text" className="form-control" value={poNo} onChange={e => setPoNo(e.target.value)} placeholder="e.g. PO-8871" />
                </div>
                <div className="form-group">
                  <label className="form-label">PO Received Date (Fixed Today)</label>
                  <input type="date" className="form-control" value={poReceivedDate} disabled />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Ex Factory Date</label>
                  <input type="date" className="form-control" value={exFactoryDate} onChange={e => setExFactoryDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Shipment Date *</label>
                  <input type="date" className="form-control" value={shipDate} onChange={e => setShipDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Week (Week No. of Year)</label>
                  <input type="text" className="form-control" value={`Week ${computedWeekNo}`} disabled />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Lead Time (Days)</label>
                  <input type="text" className="form-control" value={`${computedLeadTime} Days`} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">PO Quantity *</label>
                  <input type="number" className="form-control" value={poQty} onChange={e => setPoQty(parseInt(e.target.value) || 0)} />
                </div>
                <div className="form-group">
                  <label className="form-label">FOB Price * ($/Pc)</label>
                  <input type="number" step="0.01" className="form-control" value={poFob} onChange={e => setPoFob(parseFloat(e.target.value) || 0)} />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">FOB In Dzn (Auto Calc)</label>
                  <input type="text" className="form-control" value={`$${(poFob * 12).toFixed(2)}`} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">Carton Info</label>
                  <input type="text" className="form-control" value={cartonInfo} onChange={e => setCartonInfo(e.target.value)} placeholder="e.g. 24 pcs/carton" />
                </div>
                <div className="form-group">
                  <label className="form-label">Internal Ref No</label>
                  <input type="text" className="form-control" value={internalRefNo} onChange={e => setInternalRefNo(e.target.value)} />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Comm File No</label>
                  <input type="text" className="form-control" value={commFileNo} onChange={e => setCommFileNo(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Packing Ratio (Hardcoded)</label>
                  <select className="form-control" value={packingRatio} onChange={e => setPackingRatio(e.target.value)}>
                    {packingRatiosList.map(pr => <option key={pr} value={pr}>{pr}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Delay For (Hardcoded)</label>
                  <select className="form-control" value={delayFor} onChange={e => setDelayFor(e.target.value)}>
                    <option value="">No Delay</option>
                    {delayReasonsList.map(dr => <option key={dr} value={dr}>{dr}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">PO Status (Hardcoded)</label>
                  <select className="form-control" value={poActiveStatus} onChange={e => setPoActiveStatus(e.target.value)}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Remarks</label>
                  <input type="text" className="form-control" value={poRemarks} onChange={e => setPoRemarks(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Print Qty (Integer)</label>
                  <input type="number" className="form-control" value={printQty} onChange={e => setPrintQty(parseInt(e.target.value) || 0)} />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Embroidery Qty (Integer)</label>
                  <input type="number" className="form-control" value={embroideryQty} onChange={e => setEmbroideryQty(parseInt(e.target.value) || 0)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Delivery Country</label>
                  <select className="form-control" value={deliveryCountry} onChange={e => setDeliveryCountry(e.target.value)}>
                    {deliveryCountriesList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Area Code</label>
                  <input type="text" className="form-control" value={areaCode} onChange={e => setAreaCode(e.target.value)} />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Cut-off Date</label>
                  <input type="date" className="form-control" value={cutoffDate} onChange={e => setCutoffDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Cut-Off Dropdown</label>
                  <select className="form-control" value={cutoffVal} onChange={e => setCutoffVal(e.target.value)}>
                    {cutoffValsList.map(cv => <option key={cv} value={cv}>{cv}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Division (Hardcoded)</label>
                  <select className="form-control" value={division} onChange={e => setDivision(e.target.value)}>
                    {divisionsList.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Country Ship Date</label>
                  <input type="date" className="form-control" value={countryShipDate} onChange={e => setCountryShipDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Pack Type</label>
                  <input type="text" className="form-control" value={packType} onChange={e => setPackType(e.target.value)} placeholder="Solid Pack" />
                </div>
                <div className="form-group">
                  <label className="form-label">Port of Discharge</label>
                  <input type="text" className="form-control" value={portOfDischarge} onChange={e => setPortOfDischarge(e.target.value)} placeholder="Chittagong" />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Product Type (Hardcoded)</label>
                  <select className="form-control" value={productType} onChange={e => setProductType(e.target.value)}>
                    {productTypesList.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Pcs Per Pack</label>
                  <input type="number" className="form-control" value={pcsPerPack} onChange={e => setPcsPerPack(parseInt(e.target.value) || 1)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Req. Hanger</label>
                  <input type="text" className="form-control" value={reqHanger} onChange={e => setReqHanger(e.target.value)} placeholder="No" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Matrix Type (Hardcoded)</label>
                <select className="form-control" value={matrixType} onChange={e => setMatrixType(e.target.value)}>
                  {matrixTypesList.map(mt => <option key={mt} value={mt}>{mt}</option>)}
                </select>
              </div>

              {/* GARMENTS ITEM DETAILS & BREAKDOWN GRID */}
              <div style={{ marginTop: '20px', background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-muted)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '12px' }}>Color & Size Breakdown Entry</h4>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Garments Item (Auto from Style)</label>
                    <input type="text" className="form-control" value={form.item_group || 'T-Shirt'} disabled />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Color *</label>
                    <select className="form-control" value={bdColor} onChange={e => setBdColor(e.target.value)}>
                      {colorsList.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Size *</label>
                    <select className="form-control" value={bdSize} onChange={e => setBdSize(e.target.value)}>
                      {sizesList.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Set Quantity (Integer)</label>
                    <input type="number" className="form-control" value={bdSetQty} onChange={e => setBdSetQty(parseInt(e.target.value) || 1)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pcs Quantity (Integer)</label>
                    <input type="number" className="form-control" value={bdPcsQty} onChange={e => setBdPcsQty(parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ex. Cut % (Integer)</label>
                    <input type="number" className="form-control" value={bdExCutPct} onChange={e => setBdExCutPct(parseInt(e.target.value) || 0)} />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Article No</label>
                    <input type="text" className="form-control" value={bdArticleNo} onChange={e => setBdArticleNo(e.target.value)} placeholder="e.g. A-101" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Plan Cut Qty (Auto calculated)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={bdPcsQty + Math.round(bdPcsQty * bdExCutPct / 100)}
                      disabled
                    />
                  </div>
                </div>

                <button type="button" className="btn btn-secondary btn-sm mt-10" onClick={handleAddBreakdownLine}>
                  Add Color-Size Line
                </button>

                {/* Grid display of added breakdown lines */}
                {breakdownLines.length > 0 && (
                  <div style={{ marginTop: '15px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-muted)', textAlign: 'left', fontWeight: 'bold' }}>
                          <th>Color</th>
                          <th>Size</th>
                          <th>Set Qty</th>
                          <th>Pcs Qty</th>
                          <th>Ex Cut %</th>
                          <th>Plan Cut Qty</th>
                          <th>Article No</th>
                          <th>Total Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {breakdownLines.map((line, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border-muted)' }}>
                            <td>{line.color}</td>
                            <td>{line.size}</td>
                            <td>{line.set_qty}</td>
                            <td>{line.pcs_qty} pcs</td>
                            <td>{line.ex_cut_pct}%</td>
                            <td><strong>{line.plan_cut_qty} pcs</strong></td>
                            <td>{line.article_no}</td>
                            <td><strong>${line.amount.toFixed(2)}</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Size wise sums display */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                      <span style={{ fontWeight: 'bold', marginRight: '10px' }}>Size-wise Sums:</span>
                      {(() => {
                        const sums: { [key: string]: number } = {};
                        breakdownLines.forEach(l => { sums[l.size] = (sums[l.size] || 0) + l.plan_cut_qty; });
                        return Object.keys(sums).map(sz => (
                          <span key={sz} className="badge badge-success">{sz}: {sums[sz]} pcs</span>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>

              <button type="button" className="btn btn-primary mt-15" onClick={handleAddPO}>
                <Plus size={14} style={{ marginRight: '6px' }} /> Add PO to Order List
              </button>
            </div>

            {/* PO LINK TABLE DISPLAY */}
            {poList.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>Configured Purchase Orders (POs)</h4>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>PO No</th>
                        <th>Received Date</th>
                        <th>Ex Factory</th>
                        <th>Shipment</th>
                        <th>Qty (Pcs)</th>
                        <th>Rate ($)</th>
                        <th>Value ($)</th>
                        <th>Lead Time</th>
                        <th>Deliv. Country</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {poList.map((po, idx) => (
                        <tr key={idx}>
                          <td><strong>{po.po_no}</strong></td>
                          <td>{po.received_date}</td>
                          <td>{po.ex_factory_date}</td>
                          <td>{po.ship_date} (Wk {po.week_no})</td>
                          <td>{po.po_qty.toLocaleString()} pcs</td>
                          <td>${po.fob_price}</td>
                          <td><strong>${(po.po_qty * po.fob_price).toLocaleString()}</strong></td>
                          <td>{po.lead_time} days</td>
                          <td>{po.delivery_country}</td>
                          <td><span className="badge badge-confirm">{po.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* BUTTON BAR FOR SAVE/DRAFT */}
            <div className="mt-20 text-right" style={{ borderTop: '1px solid var(--border-muted)', paddingTop: '15px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                Cancel
              </button>
              <button type="button" className="btn btn-success" style={{ background: '#f59e0b', color: '#fff', border: 'none' }} onClick={() => handleSaveOrder('Draft')}>
                Draft Save
              </button>
              <button type="button" className="btn btn-primary" onClick={() => handleSaveOrder('Approved')}>
                <Save size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Save & Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 1st, 2nd, 3rd DETAILED TABS MODAL */}
      {showDetailModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '95%', width: '1300px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>Detailed Breakdown Views for ORD-{selectedOrder.id}</h3>
              <XCircle className="modal-close" onClick={() => { setShowDetailModal(false); setSelectedOrder(null); }} />
            </div>

            {/* VIEWS TAB BAR */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-muted)', paddingBottom: '10px', marginBottom: '15px' }}>
              <button
                type="button"
                className={`btn ${detailTab === '1st' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setDetailTab('1st')}
              >
                1st View: Style Spec & Fabrics
              </button>
              <button
                type="button"
                className={`btn ${detailTab === '2nd' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setDetailTab('2nd')}
              >
                2nd View: Purchase Orders (PO)
              </button>
              <button
                type="button"
                className={`btn ${detailTab === '3rd' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setDetailTab('3rd')}
              >
                3rd View: Color & Size breakdown
              </button>
            </div>

            {/* TAB 1: COLOR SIZE BREAKDOWN REPORT */}
            {detailTab === '1st' && (
              <ColorSizeBreakdownReport order={selectedOrder} />
            )}

            {/* TAB 2: PO INFO LIST */}
            {detailTab === '2nd' && (
              <OrderSecondView order={selectedOrder} />
            )}

            {/* TAB 3: COLOR & SIZE BREAKDOWNS */}
            {detailTab === '3rd' && (
              <OrderThirdView order={selectedOrder} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================================================
// SUB-VIEW: Trims Booking (Includes Thread/Carton Formulas + VALIDATIONS)

// ==========================================================================
// SUB-VIEW: Order Approval Module
// ==========================================================================

// ==========================================================================
// SUB-VIEW: Color Size Breakdown Report (Mock spreadsheet sheet layout)
// ==========================================================================
function ColorSizeBreakdownReport({ order }: { order: any }) {
  const uniqueSizes: string[] = [];
  order.pos?.forEach((p: any) => {
    p.breakdown?.forEach((b: any) => {
      if (b.size && !uniqueSizes.includes(b.size)) {
        uniqueSizes.push(b.size);
      }
    });
  });
  if (uniqueSizes.length === 0) {
    uniqueSizes.push('S', 'L', 'M', 'XL');
  }

  let gtActualCut = 0;
  let gtPlanCut = 0;
  let grandTotalValue = 0;

  const poColorGroups: any[] = [];
  order.pos?.forEach((p: any) => {
    const colorsInPo: string[] = [];
    p.breakdown?.forEach((b: any) => {
      if (b.color && !colorsInPo.includes(b.color)) {
        colorsInPo.push(b.color);
      }
    });
    if (colorsInPo.length === 0) {
      colorsInPo.push('blue');
    }

    colorsInPo.forEach(col => {
      const bds = p.breakdown?.filter((b: any) => b.color === col) || [];
      poColorGroups.push({
        po_no: p.po_no,
        po_qty: p.po_qty,
        fob: p.fob_price || 0,
        item_group: order.item_group || 'Casual Basic',
        category: order.category || 'Full polo',
        fabric_comp: order.yarn_comp || order.yarn_cert || 'N/A',
        fabric_type: order.yarn_type || 'N/A',
        gsm: order.gsm || 180,
        delivery_country: p.delivery_country || 'Canada',
        color: col,
        received_date: p.received_date || '1st May 2026',
        ship_date: p.ship_date || '1st Jul 2026',
        breakdowns: bds
      });
    });
  });

  return (
    <div style={{ color: '#000', background: '#fff', padding: '24px', borderRadius: '8px', fontFamily: '"Arial", sans-serif', overflowX: 'auto' }}>

      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <div style={{ border: '2px solid #333', padding: '6px 20px', fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
          Color Size Breakdown Report
        </div>
      </div>

      {/* Header Metadata Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ background: '#f2f2f2' }}>
            <th style={thStyle}>Unique ID</th>
            <th style={thStyle}>Buyer</th>
            <th style={thStyle}>Team Leader</th>
            <th style={thStyle}>Merchant</th>
            <th style={thStyle}>Style</th>
            <th style={thStyle}>Combo</th>
            <th style={thStyle}>SMV</th>
            <th style={thStyle}>T.Style Qty</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Image</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdStyle}>{order.pos?.map((p: any) => p.po_no).join(', ') || `Job-${order.id}`}</td>
            <td style={tdStyle}>{order.buyer}</td>
            <td style={tdStyle}>{order.team_leader}</td>
            <td style={tdStyle}>{order.dealing_merchant || 'N/A'}</td>
            <td style={tdStyle}>{order.style_no}</td>
            <td style={tdStyle}>{order.category || 'N/A'}</td>
            <td style={tdStyle}>{order.smv?.toFixed(2)}</td>
            <td style={tdStyle}>{parseFloat(order.total_qty || 0).toLocaleString()}</td>
            <td style={tdStyle}>{order.order_status || order.status}</td>
            <td style={tdStyle}>
              {order.image_url ? (
                <img src={order.image_url} alt="Style design" style={{ maxHeight: '48px', maxWidth: '48px', objectFit: 'contain' }} />
              ) : (
                <div style={{ fontSize: '0.65rem', color: '#888' }}>No Image</div>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Detailed PO Sheet Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
        <thead>
          <tr style={{ background: '#f2f2f2', fontWeight: 'bold', textAlign: 'center' }}>
            <th style={thStyle}>PO Number</th>
            <th style={thStyle}>PO Qnty.</th>
            <th style={thStyle}>FOB</th>
            <th style={thStyle}>Item</th>
            <th style={thStyle}>Gmts Item Group</th>
            <th style={thStyle}>Fab Comp.</th>
            <th style={thStyle}>Fab Type</th>
            <th style={thStyle}>GSM</th>
            <th style={thStyle}>Country</th>
            <th style={thStyle}>Color</th>
            <th style={thStyle}>PO Receive Date</th>
            <th style={thStyle}>Shipment Date</th>
            <th style={thStyle}>Particulars</th>
            {uniqueSizes.map(sz => (
              <th key={sz} style={thStyle}>{sz}</th>
            ))}
            <th style={thStyle}>Total</th>
            <th style={thStyle}>T. Actual Cut (Pc)</th>
            <th style={thStyle}>T. Plan Cut</th>
            <th style={thStyle}>Total Actual Value</th>
          </tr>
        </thead>
        <tbody>
          {poColorGroups.map((g, idx) => {
            const qtyMap: any = {};
            const rateMap: any = {};
            const exCutMap: any = {};
            const planCutMap: any = {};

            let poColorActualQty = 0;
            let poColorPlanQty = 0;

            uniqueSizes.forEach(sz => {
              const bd = g.breakdowns.find((b: any) => b.size === sz);
              qtyMap[sz] = bd ? parseFloat(bd.pcs_qty || 0) : 0;
              rateMap[sz] = bd ? parseFloat(bd.rate || g.fob || 0) : g.fob || 0;
              exCutMap[sz] = bd ? parseFloat(bd.ex_cut_pct || 0) : 0;
              planCutMap[sz] = bd ? parseFloat(bd.plan_cut_qty || 0) : 0;

              poColorActualQty += qtyMap[sz];
              poColorPlanQty += planCutMap[sz];
            });

            const totalActualValue = poColorActualQty * g.fob;

            gtActualCut += poColorActualQty;
            gtPlanCut += poColorPlanQty;
            grandTotalValue += totalActualValue;

            return (
              <React.Fragment key={idx}>
                {/* Qty Row */}
                <tr>
                  <td rowSpan={4} style={tdStyleCenter}><strong>{g.po_no}</strong></td>
                  <td rowSpan={4} style={tdStyleCenter}>{g.po_qty.toLocaleString()}</td>
                  <td rowSpan={4} style={tdStyleCenter}>${g.fob?.toFixed(4)}</td>
                  <td rowSpan={4} style={tdStyleCenter}>{order.item_group || 'Full polo'}</td>
                  <td rowSpan={4} style={tdStyleCenter}>{order.category || 'Casual Basic'}</td>
                  <td rowSpan={4} style={tdStyleCenter}>{order.yarn_comp || 'N/A'}</td>
                  <td rowSpan={4} style={tdStyleCenter}>{order.yarn_type || 'N/A'}</td>
                  <td rowSpan={4} style={tdStyleCenter}>{order.gsm || 'N/A'}</td>
                  <td rowSpan={4} style={tdStyleCenter}>{g.delivery_country}</td>
                  <td rowSpan={4} style={tdStyleCenter}>{g.color}</td>
                  <td rowSpan={4} style={tdStyleCenter}>{g.received_date}</td>
                  <td rowSpan={4} style={tdStyleCenter}>{g.ship_date}</td>

                  <td style={tdStylePart}>Qty.</td>
                  {uniqueSizes.map(sz => (
                    <td key={sz} style={tdStyleCenter}>{qtyMap[sz] > 0 ? qtyMap[sz] : ''}</td>
                  ))}
                  <td style={tdStyleCenter}><strong>{poColorActualQty.toLocaleString()}</strong></td>

                  <td rowSpan={4} style={tdStyleCenter}><strong>{poColorActualQty.toLocaleString()}</strong></td>
                  <td rowSpan={4} style={tdStyleCenter}><strong>{poColorPlanQty.toLocaleString()}</strong></td>
                  <td rowSpan={4} style={tdStyleCenter}><strong>${totalActualValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
                </tr>

                {/* Rate Row */}
                <tr>
                  <td style={tdStylePart}>Rate</td>
                  {uniqueSizes.map(sz => (
                    <td key={sz} style={tdStyleCenter}>{rateMap[sz] > 0 ? `$${rateMap[sz].toFixed(2)}` : ''}</td>
                  ))}
                  <td style={tdStyleCenter}><strong>${g.fob?.toFixed(2)}</strong></td>
                </tr>

                {/* Ex. Cut % Row */}
                <tr>
                  <td style={tdStylePart}>Ex. Cut %</td>
                  {uniqueSizes.map(sz => (
                    <td key={sz} style={tdStyleCenter}>{exCutMap[sz] > 0 ? `${exCutMap[sz]}%` : ''}</td>
                  ))}
                  <td style={tdStyleCenter}>
                    <strong>
                      {g.breakdowns.length > 0
                        ? (g.breakdowns.reduce((sum: number, b: any) => sum + (b.ex_cut_pct || 0), 0) / g.breakdowns.length).toFixed(1) + '%'
                        : ''}
                    </strong>
                  </td>
                </tr>

                {/* Plan Cut Qty Row */}
                <tr>
                  <td style={tdStylePart}>Plan Cut Qty.</td>
                  {uniqueSizes.map(sz => (
                    <td key={sz} style={tdStyleCenter}><strong>{planCutMap[sz] > 0 ? planCutMap[sz] : ''}</strong></td>
                  ))}
                  <td style={tdStyleCenter}><strong>{poColorPlanQty.toLocaleString()}</strong></td>
                </tr>
              </React.Fragment>
            );
          })}

          {/* Grand Totals Box */}
          <tr style={{ background: '#e6e6e6', fontWeight: 'bold' }}>
            <td colSpan={13 + uniqueSizes.length} style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'right' }}>G.T. Actual Cut</td>
            <td colSpan={3} style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'center' }}><strong>{gtActualCut.toLocaleString()}</strong></td>
          </tr>
          <tr style={{ background: '#e6e6e6', fontWeight: 'bold' }}>
            <td colSpan={13 + uniqueSizes.length} style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'right' }}>G.T. Plan Cut</td>
            <td colSpan={3} style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'center' }}><strong>{gtPlanCut.toLocaleString()}</strong></td>
          </tr>
          <tr style={{ background: '#e6e6e6', fontWeight: 'bold' }}>
            <td colSpan={13 + uniqueSizes.length} style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'right' }}>Grand Total Value</td>
            <td colSpan={3} style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'center' }}><strong>${grandTotalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '6px 8px',
  textAlign: 'center',
  fontWeight: 'bold',
  background: '#f2f2f2',
  color: '#333'
};

const tdStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '6px 8px',
  color: '#333'
};

const tdStyleCenter: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '6px 8px',
  textAlign: 'center',
  color: '#333'
};

const tdStylePart: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '6px 8px',
  background: '#fafafa',
  fontWeight: 'bold',
  color: '#333'
};



// ==========================================================================
// SUB-VIEW: Order Second View (Basic Information & Color Size break down)
// ==========================================================================
function OrderSecondView({ order }: { order: any }) {
  const uniqueSizes: string[] = [];
  order.pos?.forEach((p: any) => {
    p.breakdown?.forEach((b: any) => {
      if (b.size && !uniqueSizes.includes(b.size)) {
        uniqueSizes.push(b.size);
      }
    });
  });
  if (uniqueSizes.length === 0) {
    uniqueSizes.push('S', 'L', 'M', 'XL');
  }

  const firstShipDate = order.pos?.[0]?.ship_date || 'N/A';
  const totalQty = parseFloat(order.total_qty || 0);
  const totalPOs = order.pos?.length || 0;

  return (
    <div style={{ color: '#000', background: '#fff', padding: '24px', borderRadius: '8px', fontFamily: '"Arial", sans-serif', overflowY: 'auto' }}>
      <h3 style={{ borderBottom: '2px solid #333', paddingBottom: '6px', marginBottom: '15px', fontSize: '1rem', fontWeight: 'bold' }}>Basic Information</h3>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
        <table style={{ flex: 1, borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <tbody>
            <tr>
              <td style={infoThStyle}>Buyer :</td>
              <td style={infoTdStyle}>{order.buyer}</td>
            </tr>
            <tr>
              <td style={infoThStyle}>Buying Agent :</td>
              <td style={infoTdStyle}>FAMGLAM LTD</td>
            </tr>
            <tr>
              <td style={infoThStyle}>Order/Style No :</td>
              <td style={infoTdStyle}><strong>{order.style_no}</strong></td>
            </tr>
            <tr>
              <td style={infoThStyle}>Booking No :</td>
              <td style={infoTdStyle}>N/A</td>
            </tr>
            <tr>
              <td style={infoThStyle}>Repeat No :</td>
              <td style={infoTdStyle}>{order.repeat_no || '1'}</td>
            </tr>
            <tr>
              <td style={infoThStyle}>Team Name :</td>
              <td style={infoTdStyle}>{order.team_leader || 'Demo User'}</td>
            </tr>
            <tr>
              <td style={infoThStyle}>Dealing Merchant :</td>
              <td style={infoTdStyle}>{order.dealing_merchant || 'N/A'}</td>
            </tr>
            <tr>
              <td style={infoThStyle}>Fabric Type :</td>
              <td style={infoTdStyle}>{order.fabric_type || 'N/A'}</td>
            </tr>
            <tr>
              <td style={infoThStyle}>GSM :</td>
              <td style={infoTdStyle}>{order.gsm || 'N/A'}</td>
            </tr>
            <tr>
              <td style={infoThStyle}>Yarn Type :</td>
              <td style={infoTdStyle}>{order.yarn_type || 'Combed'}</td>
            </tr>
          </tbody>
        </table>

        <table style={{ flex: 1, borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <tbody>
            <tr>
              <td style={infoThStyle}>Shipment Date :</td>
              <td style={infoTdStyle}>{firstShipDate}</td>
            </tr>
            <tr>
              <td style={infoThStyle}>Order Qty :</td>
              <td style={infoTdStyle}><strong>{totalQty.toLocaleString()}</strong></td>
            </tr>
            <tr>
              <td style={infoThStyle}>Total Number Of PO :</td>
              <td style={infoTdStyle}>{totalPOs}</td>
            </tr>
            <tr>
              <td style={infoThStyle}>Item :</td>
              <td style={infoTdStyle}>{order.item_group || 'Full polo'}</td>
            </tr>
            <tr>
              <td style={infoThStyle}>Fabric Booking No :</td>
              <td style={infoTdStyle}>N/A</td>
            </tr>
            <tr>
              <td style={infoThStyle}>Season :</td>
              <td style={infoTdStyle}>{order.season || 'winter'}</td>
            </tr>
            <tr>
              <td style={infoThStyle}>Remarks For User :</td>
              <td style={infoTdStyle}>{order.special_instruction || 'N/A'}</td>
            </tr>
            <tr>
              <td style={infoThStyle}>Fabric Composition :</td>
              <td style={infoTdStyle}>{order.fabric_comp || 'N/A'}</td>
            </tr>
            <tr>
              <td style={infoThStyle}>Dia :</td>
              <td style={infoTdStyle}>N/A</td>
            </tr>
            <tr>
              <td style={infoThStyle}>Garments Certification :</td>
              <td style={infoTdStyle}>{order.garments_cert || 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {order.pos?.map((po: any, idx: number) => {
        const colorsInPo: string[] = [];
        po.breakdown?.forEach((b: any) => {
          if (b.color && !colorsInPo.includes(b.color)) {
            colorsInPo.push(b.color);
          }
        });
        if (colorsInPo.length === 0) colorsInPo.push('blue');

        const totalSizeQty: any = {};
        const totalSizePlan: any = {};
        let poActualSum = 0;
        let poPlanSum = 0;

        uniqueSizes.forEach(sz => {
          totalSizeQty[sz] = 0;
          totalSizePlan[sz] = 0;
        });

        po.breakdown?.forEach((b: any) => {
          if (b.size) {
            totalSizeQty[b.size] = (totalSizeQty[b.size] || 0) + parseFloat(b.pcs_qty || 0);
            totalSizePlan[b.size] = (totalSizePlan[b.size] || 0) + parseFloat(b.plan_cut_qty || 0);
            poActualSum += parseFloat(b.pcs_qty || 0);
            poPlanSum += parseFloat(b.plan_cut_qty || 0);
          }
        });

        const avgExCut = po.breakdown?.length
          ? (po.breakdown.reduce((sum: number, b: any) => sum + parseFloat(b.ex_cut_pct || 0), 0) / po.breakdown.length).toFixed(0)
          : '5';

        return (
          <div key={idx} style={{ marginTop: '24px', borderTop: '1px solid #ccc', paddingTop: '15px' }}>
            <p style={{ fontSize: '0.88rem', margin: '0 0 6px 0', lineHeight: 1.6 }}>
              <strong>PO NO -</strong>{po.po_no},
              <strong> PO QTY -</strong>{po.po_qty?.toLocaleString()},
              <strong> PRINT-NO -</strong>{po.print_qty ? 'Yes' : 'No'},
              <strong> EMBROIDERY -</strong>{po.embroidery_qty ? 'Yes' : 'No'},
              <strong> UPDATE TIME -</strong>{po.received_date},
              <strong> Shipment Date </strong>{po.ship_date}
            </p>
            <p style={{ fontSize: '0.88rem', margin: '0 0 15px 0', color: '#555' }}>
              <strong>PO REMARKS - </strong>{po.remarks || 'test'}
            </p>

            <h4 style={{ fontSize: '0.82rem', fontWeight: 'bold', margin: '15px 0 8px 0', textTransform: 'uppercase', color: '#333' }}>
              COLOR SIZE BREAK DOWN with Actual Qty
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginBottom: '20px' }}>
              <thead>
                <tr style={{ background: '#f9f9f9' }}>
                  <th style={thStyle}>Color/Size</th>
                  {uniqueSizes.map(sz => <th key={sz} style={thStyle}>{sz}</th>)}
                  <th style={thStyle}>Total QTY</th>
                </tr>
              </thead>
              <tbody>
                {colorsInPo.map(col => {
                  const bds = po.breakdown?.filter((b: any) => b.color === col) || [];
                  let colSum = 0;
                  return (
                    <tr key={col}>
                      <td style={tdStyle}><strong>{col}</strong></td>
                      {uniqueSizes.map(sz => {
                        const bd = bds.find((b: any) => b.size === sz);
                        const val = bd ? parseFloat(bd.pcs_qty || 0) : 0;
                        colSum += val;
                        return <td key={sz} style={tdStyleCenter}>{val > 0 ? val.toLocaleString() : ''}</td>;
                      })}
                      <td style={tdStyleCenter}><strong>{colSum.toLocaleString()}</strong></td>
                    </tr>
                  );
                })}
                <tr style={{ background: '#f5f5f5', fontWeight: 'bold' }}>
                  <td style={tdStyle}>Total</td>
                  {uniqueSizes.map(sz => (
                    <td key={sz} style={tdStyleCenter}>{totalSizeQty[sz] > 0 ? totalSizeQty[sz].toLocaleString() : ''}</td>
                  ))}
                  <td style={tdStyleCenter}><strong>{poActualSum.toLocaleString()}</strong></td>
                </tr>
              </tbody>
            </table>

            <h4 style={{ fontSize: '0.82rem', fontWeight: 'bold', margin: '15px 0 8px 0', textTransform: 'uppercase', color: '#333' }}>
              COLOR SIZE BREAK DOWN with Excess Cutting {avgExCut}%
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginBottom: '20px' }}>
              <thead>
                <tr style={{ background: '#f9f9f9' }}>
                  <th style={thStyle}>Color/Size</th>
                  {uniqueSizes.map(sz => <th key={sz} style={thStyle}>{sz}</th>)}
                  <th style={thStyle}>Total QTY</th>
                </tr>
              </thead>
              <tbody>
                {colorsInPo.map(col => {
                  const bds = po.breakdown?.filter((b: any) => b.color === col) || [];
                  let colSum = 0;
                  return (
                    <tr key={col}>
                      <td style={tdStyle}><strong>{col}</strong></td>
                      {uniqueSizes.map(sz => {
                        const bd = bds.find((b: any) => b.size === sz);
                        const val = bd ? parseFloat(bd.plan_cut_qty || 0) : 0;
                        colSum += val;
                        return <td key={sz} style={tdStyleCenter}>{val > 0 ? val.toLocaleString() : ''}</td>;
                      })}
                      <td style={tdStyleCenter}><strong>{colSum.toLocaleString()}</strong></td>
                    </tr>
                  );
                })}
                <tr style={{ background: '#f5f5f5', fontWeight: 'bold' }}>
                  <td style={tdStyle}>Total</td>
                  {uniqueSizes.map(sz => (
                    <td key={sz} style={tdStyleCenter}>{totalSizePlan[sz] > 0 ? totalSizePlan[sz].toLocaleString() : ''}</td>
                  ))}
                  <td style={tdStyleCenter}><strong>{poPlanSum.toLocaleString()}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

const infoThStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '6px 10px',
  fontWeight: 'bold',
  background: '#fafafa',
  width: '180px',
  color: '#333'
};

const infoTdStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '6px 10px',
  color: '#333'
};



// ==========================================================================
// SUB-VIEW: Order Third View (Color & Size breakdown report)
// ==========================================================================
function OrderThirdView({ order }: { order: any }) {
  const uniqueSizes: string[] = [];
  order.pos?.forEach((p: any) => {
    p.breakdown?.forEach((b: any) => {
      if (b.size && !uniqueSizes.includes(b.size)) {
        uniqueSizes.push(b.size);
      }
    });
  });
  if (uniqueSizes.length === 0) {
    uniqueSizes.push('S', 'L', 'M', 'XL');
  }

  const garmentItems: string[] = [];
  order.pos?.forEach((p: any) => {
    p.breakdown?.forEach((b: any) => {
      const item = b.garments_item || order.item_group || 'Full polo';
      if (!garmentItems.includes(item)) {
        garmentItems.push(item);
      }
    });
  });
  if (garmentItems.length === 0) {
    garmentItems.push(order.item_group || 'Full polo');
  }

  return (
    <div style={{ color: '#000', background: '#fff', padding: '24px', borderRadius: '8px', fontFamily: '"Arial", sans-serif', overflowY: 'auto' }}>

      {garmentItems.map((item, itemIdx) => {
        const itemBds: any[] = [];
        order.pos?.forEach((p: any) => {
          p.breakdown?.forEach((b: any) => {
            const currentItem = b.garments_item || order.item_group || 'Full polo';
            if (currentItem === item) {
              itemBds.push({ ...b, po_no: p.po_no });
            }
          });
        });

        const colors: string[] = [];
        itemBds.forEach(b => {
          if (b.color && !colors.includes(b.color)) {
            colors.push(b.color);
          }
        });
        if (colors.length === 0) colors.push('blue');

        const grandSizePcs: any = {};
        let grandPcsTotal = 0;
        uniqueSizes.forEach(sz => {
          grandSizePcs[sz] = 0;
        });

        return (
          <div key={itemIdx} style={{ marginBottom: '32px' }}>
            <div style={{ display: 'inline-block', background: '#22d3ee', color: '#fff', padding: '6px 20px', fontWeight: 'bold', fontSize: '0.9rem', clipPath: 'polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%)', marginBottom: '10px' }}>
              {item}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', border: '1px solid #ccc' }}>
              <thead>
                <tr style={{ background: '#7dd3fc', color: '#333', fontWeight: 'bold', textAlign: 'center' }}>
                  <th style={thStyle3}>Color & Size</th>
                  <th style={thStyle3}>Particulars</th>
                  {uniqueSizes.map(sz => <th key={sz} style={thStyle3}>{sz}</th>)}
                  <th style={thStyle3}>Total</th>
                  <th style={thStyle3}>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {colors.map(col => {
                  const bds = itemBds.filter(b => b.color === col);

                  const setQty: any = {};
                  const pcsQty: any = {};
                  const rate: any = {};
                  const exCut: any = {};
                  const planCut: any = {};
                  const article: any = {};

                  let totalSet = 0;
                  let totalPcs = 0;
                  let totalPlan = 0;
                  let totalAmount = 0;

                  uniqueSizes.forEach(sz => {
                    const matches = bds.filter(b => b.size === sz);
                    const sQty = matches.reduce((sum, b) => sum + parseFloat(b.set_qty || 0), 0);
                    const pQty = matches.reduce((sum, b) => sum + parseFloat(b.pcs_qty || 0), 0);
                    const rt = matches.length > 0 ? parseFloat(matches[0].rate || 0) : 0;
                    const ex = matches.length > 0 ? parseFloat(matches[0].ex_cut_pct || 0) : 0;
                    const pl = matches.reduce((sum, b) => sum + parseFloat(b.plan_cut_qty || 0), 0);
                    const art = matches.length > 0 ? matches[0].article_no || '' : '';

                    setQty[sz] = sQty;
                    pcsQty[sz] = pQty;
                    rate[sz] = rt;
                    exCut[sz] = ex;
                    planCut[sz] = pl;
                    article[sz] = art;

                    totalSet += sQty;
                    totalPcs += pQty;
                    totalPlan += pl;
                    totalAmount += pQty * rt;

                    grandSizePcs[sz] = (grandSizePcs[sz] || 0) + pQty;
                    grandPcsTotal += pQty;
                  });

                  return (
                    <React.Fragment key={col}>
                      <tr>
                        <td rowSpan={6} style={tdStyle3Center}><strong>{col}</strong></td>
                        <td style={tdStyle3Part}>Set Qty.</td>
                        {uniqueSizes.map(sz => (
                          <td key={sz} style={tdStyle3Gray}>{setQty[sz] > 0 ? setQty[sz] : ''}</td>
                        ))}
                        <td style={tdStyle3Center}>{totalSet}</td>
                        <td rowSpan={6} style={tdStyle3Center}><strong>${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 4 })}</strong></td>
                      </tr>

                      <tr>
                        <td style={tdStyle3Part}>Pcs Qty.</td>
                        {uniqueSizes.map(sz => (
                          <td key={sz} style={tdStyle3Center}>{pcsQty[sz] > 0 ? pcsQty[sz] : ''}</td>
                        ))}
                        <td style={tdStyle3Center}>{totalPcs.toLocaleString()}</td>
                      </tr>

                      <tr>
                        <td style={tdStyle3Part}>Rate</td>
                        {uniqueSizes.map(sz => (
                          <td key={sz} style={tdStyle3Center}>{rate[sz] > 0 ? `$${rate[sz].toFixed(2)}` : ''}</td>
                        ))}
                        <td style={tdStyle3Center}></td>
                      </tr>

                      <tr>
                        <td style={tdStyle3Part}>Ex. Cut %</td>
                        {uniqueSizes.map(sz => (
                          <td key={sz} style={tdStyle3Center}>{exCut[sz] > 0 ? `${exCut[sz]}%` : ''}</td>
                        ))}
                        <td style={tdStyle3Center}></td>
                      </tr>

                      <tr>
                        <td style={tdStyle3Part}>Plan Cut Qty.</td>
                        {uniqueSizes.map(sz => (
                          <td key={sz} style={tdStyle3Gray}><strong>{planCut[sz] > 0 ? planCut[sz] : ''}</strong></td>
                        ))}
                        <td style={tdStyle3Center}><strong>{totalPlan.toLocaleString()}</strong></td>
                      </tr>

                      <tr>
                        <td style={tdStyle3Part}>Article No</td>
                        {uniqueSizes.map(sz => (
                          <td key={sz} style={tdStyle3Center}>{article[sz] || ''}</td>
                        ))}
                        <td style={tdStyle3Center}></td>
                      </tr>
                    </React.Fragment>
                  );
                })}

                <tr style={{ background: '#00bae0', color: '#fff', fontWeight: 'bold' }}>
                  <td colSpan={2} style={{ padding: '8px', border: '1px solid #ccc' }}>Total</td>
                  {uniqueSizes.map(sz => (
                    <td key={sz} style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'center' }}>{grandSizePcs[sz]?.toLocaleString()}</td>
                  ))}
                  <td style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'center' }}>{grandPcsTotal.toLocaleString()}</td>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}></td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

const thStyle3: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '8px',
  textAlign: 'center',
  fontWeight: 'bold',
  background: '#7dd3fc',
  color: '#333'
};

const tdStyle3Center: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '8px',
  textAlign: 'center',
  color: '#333'
};

const tdStyle3Part: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '8px',
  background: '#fafafa',
  fontWeight: 'bold',
  color: '#333'
};

const tdStyle3Gray: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '8px',
  background: '#e5e7eb',
  textAlign: 'center',
  color: '#333'
};


function OrderApprovalView({ buyers, setActiveTab, setEditOrderId }: { buyers: any[], setActiveTab: (tab: any) => void, setEditOrderId: (id: number | null) => void }) {
  const [orders, setOrders] = useState<any[]>([]);
  const currentUser = (() => {
    try {
      const saved = localStorage.getItem('metamorphosis_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  })();
  const [simulatedRole, setSimulatedRole] = useState('Super Admin');
  const [inqSearch, setInqSearch] = useState('');
  const [inqStatusFilter, setInqStatusFilter] = useState('Pending Approval');

  const [filterBasis, setFilterBasis] = useState<'day' | 'month' | 'year' | 'all'>('all');
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('2026');

  // Detail Modal Tab State
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailTab, setDetailTab] = useState<'1st' | '2nd' | '3rd'>('1st');
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Reject/Feedback Modal State
  const [rejectingOrder, setRejectingOrder] = useState<any>(null);
  const [feedbackText, setFeedbackText] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (e) { console.error(e); }
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

    const getOrderCount = (d: number) => {
      const key = formatDateKey(d);
      return orders.filter(o => o.pos && o.pos.some((p: any) => p.ship_date === key)).length;
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
            const count = item.isCurrentMonth ? getOrderCount(item.day) : 0;
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

  const filteredOrders = orders.filter(o => {
    // 1. Basis Filter (by PO Ship Date)
    if (filterBasis === 'day') {
      if (!selectedCalendarDay) return false;
      const matchesDay = o.pos && o.pos.some((p: any) => p.ship_date === selectedCalendarDay);
      if (!matchesDay) return false;
    } else if (filterBasis === 'month') {
      if (!selectedMonth) return false;
      const matchesMonth = o.pos && o.pos.some((p: any) => p.ship_date && p.ship_date.startsWith(selectedMonth));
      if (!matchesMonth) return false;
    } else if (filterBasis === 'year') {
      if (!selectedYear) return false;
      const matchesYear = o.pos && o.pos.some((p: any) => p.ship_date && p.ship_date.startsWith(selectedYear));
      if (!matchesYear) return false;
    }

    // 2. Search Filter
    const q = inqSearch.toLowerCase().trim();
    const matchesSearch =
      String(o.inquiry_id || '').toLowerCase().includes(q) ||
      String(o.id || '').toLowerCase().includes(q) ||
      (o.style_no || '').toLowerCase().includes(q) ||
      (o.buyer || '').toLowerCase().includes(q) ||
      (o.team_leader || '').toLowerCase().includes(q);

    if (inqStatusFilter === 'All') return matchesSearch;

    const orderStatus = o.status || 'Draft';
    if (inqStatusFilter === 'Pending Approval') {
      return matchesSearch && (orderStatus === 'Pending Approval' || orderStatus === 'Pending' || orderStatus === 'Approved' || orderStatus === 'Rejected');
    }
    return matchesSearch && orderStatus === inqStatusFilter;
  });

  // Perform Approval Update
  const handleApproveStatus = async (id: number, targetStatus: 'Approved' | 'Rejected', comment = '') => {
    try {
      const res = await fetch(`${API_BASE}/orders/${id}/approve-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          approved_by: targetStatus === 'Approved' ? simulatedRole : null,
          feedback_comments: comment || null
        })
      });
      if (res.ok) {
        fetchOrders();
        setRejectingOrder(null);
        setFeedbackText('');
      } else {
        alert("Failed to update approval status.");
      }
    } catch (e) {
      console.error(e);
      alert("Error contacting approval endpoint.");
    }
  };

  return (
    <div className="dashboard-card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <h2 className="card-title" style={{ margin: 0 }}><Shield /> Order Verification & Managerial Approval Panel</h2>
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
              <option value="all">Show All Orders</option>
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
              value={simulatedRole}
              onChange={(e) => setSimulatedRole(e.target.value)}
            >
              <option value="Store Manager">Store Manager</option>
              <option value="Production Manager">Production Manager</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Merchandiser Manager">Merchandiser Manager</option>
            </select>
          </div>
        </div>
      </div>

      {/* SEARCH/FILTER PANEL */}
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
          <option value="Rejected">Rejected</option>
          <option value="Draft">Draft</option>
          <option value="All">All Inquiries</option>
        </select>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
          Found {filteredOrders.length} Inquiries
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

      {/* APPROVAL DETAILS LIST TABLE */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>SL</th>
              <th>Buyer</th>
              <th>Style</th>
              <th>PO Numbers</th>
              <th>Actual Qty</th>
              <th>Plan Cut Qty</th>
              <th>FOB Rate</th>
              <th>Extra %</th>
              <th>Gmt Group</th>
              <th>Fabric Type</th>
              <th>Composition</th>
              <th>GSM</th>
              <th>Cert.</th>
              <th>PO Recv Date</th>
              <th>Shipment Date</th>
              <th>Lead Time</th>
              <th>Merchant</th>
              <th>Team Leader</th>
              <th>PO Approved Status</th>
              <th>Approved By</th>
              <th>User Remarks</th>
              <th>Approval Feedback</th>
              <th>Image</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((o, idx) => {
              const isAuthorized = simulatedRole === 'Super Admin' || simulatedRole === 'Merchandiser Manager';
              const poNames = o.pos?.map((p: any) => p.po_no).join(', ') || 'N/A';
              const maxShipDate = o.pos?.reduce((max: string, p: any) => p.ship_date > max ? p.ship_date : max, '') || 'N/A';
              const minRecvDate = o.pos?.reduce((min: string, p: any) => !min || p.received_date < min ? p.received_date : min, '') || 'N/A';
              const maxLeadTime = o.pos?.reduce((max: number, p: any) => p.lead_time > max ? p.lead_time : max, 0) || 0;
              const avgFob = o.pos?.length ? (o.pos.reduce((sum: number, p: any) => sum + p.fob_price, 0) / o.pos.length) : 0;

              // Sum Plan Cut Qty from PO breakdowns
              let totalPlanCut = 0;
              let avgExCutPct = 0;
              if (o.pos) {
                let cnt = 0;
                o.pos.forEach((p: any) => {
                  if (p.breakdown) {
                    p.breakdown.forEach((b: any) => {
                      totalPlanCut += parseFloat(b.plan_cut_qty || 0);
                      avgExCutPct += parseFloat(b.ex_cut_pct || 0);
                      cnt++;
                    });
                  }
                });
                if (cnt > 0) avgExCutPct = avgExCutPct / cnt;
              }

              return (
                <tr key={o.id}>
                  <td>{idx + 1}</td>
                  <td><strong>{o.buyer}</strong></td>
                  <td>{o.style_no}</td>
                  <td><div style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{poNames}</div></td>
                  <td><strong>{parseFloat(o.total_qty || 0).toLocaleString()} pcs</strong></td>
                  <td><strong>{totalPlanCut.toLocaleString()} pcs</strong></td>
                  <td>${avgFob.toFixed(2)}</td>
                  <td>{avgExCutPct.toFixed(1)}%</td>
                  <td>{o.item_group}</td>
                  <td><div style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.fabric_type || 'N/A'}</div></td>
                  <td><div style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.fabric_comp || 'N/A'}</div></td>
                  <td>{o.gsm || 'N/A'}</td>
                  <td>{o.garments_cert || 'N/A'}</td>
                  <td>{minRecvDate}</td>
                  <td>{maxShipDate}</td>
                  <td>{maxLeadTime} Days</td>
                  <td>{o.dealing_merchant || 'N/A'}</td>
                  <td>{o.team_leader || 'N/A'}</td>
                  <td>
                    <span className={`badge badge-${(o.status || 'Draft').toLowerCase().replace(/\s+/g, '-')}`}>
                      {o.status || 'Draft'}
                    </span>
                  </td>
                  <td>{o.approved_by || 'N/A'}</td>
                  <td><div style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.special_instruction || 'N/A'}</div></td>
                  <td><div style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--warning)' }}>{o.feedback_comments || 'N/A'}</div></td>
                  <td>
                    {o.image_url ? (
                      <img src={o.image_url} alt="Order Spec" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px' }} />
                    ) : (
                      <span className="text-muted" style={{ fontSize: '0.7rem' }}>No Image</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedOrder(o); setDetailTab('1st'); setShowDetailModal(true); }}>
                        1st View
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedOrder(o); setDetailTab('2nd'); setShowDetailModal(true); }}>
                        2nd View
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedOrder(o); setDetailTab('3rd'); setShowDetailModal(true); }}>
                        3rd View
                      </button>
                      {currentUser && currentUser.role === 'merchandiser_manager' && (
                        <button className="btn btn-warning btn-sm" onClick={() => { setEditOrderId(o.id); setActiveTab('order'); }}>
                          Edit
                        </button>
                      )}
                      {o.status !== 'Approved' && (
                        <button
                          className="btn btn-success btn-sm"
                          disabled={!isAuthorized}
                          style={!isAuthorized ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                          title={!isAuthorized ? 'Requires simulated role: Super Admin or Merchandiser Manager' : 'Approve Order'}
                          onClick={() => handleApproveStatus(o.id, 'Approved')}
                        >
                          Approve
                        </button>
                      )}
                      {o.status !== 'Rejected' && (
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={!isAuthorized}
                          style={!isAuthorized ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                          title={!isAuthorized ? 'Requires simulated role: Super Admin or Merchandiser Manager' : 'Reject Order'}
                          onClick={() => setRejectingOrder(o)}
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 1st, 2nd, 3rd DETAILED TABS MODAL */}
      {showDetailModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '900px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>Detailed Breakdown Views for ORD-{selectedOrder.id}</h3>
              <XCircle className="modal-close" onClick={() => { setShowDetailModal(false); setSelectedOrder(null); }} />
            </div>

            {/* VIEWS TAB BAR */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-muted)', paddingBottom: '10px', marginBottom: '15px' }}>
              <button
                type="button"
                className={`btn ${detailTab === '1st' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setDetailTab('1st')}
              >
                1st View: Style Spec & Fabrics
              </button>
              <button
                type="button"
                className={`btn ${detailTab === '2nd' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setDetailTab('2nd')}
              >
                2nd View: Purchase Orders (PO)
              </button>
              <button
                type="button"
                className={`btn ${detailTab === '3rd' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setDetailTab('3rd')}
              >
                3rd View: Color & Size breakdown
              </button>
            </div>

            {/* TAB 1: COLOR SIZE BREAKDOWN REPORT */}
            {detailTab === '1st' && (
              <ColorSizeBreakdownReport order={selectedOrder} />
            )}

            {/* TAB 2: PO INFO LIST */}
            {detailTab === '2nd' && (
              <OrderSecondView order={selectedOrder} />
            )}

            {/* TAB 3: COLOR & SIZE BREAKDOWNS */}
            {detailTab === '3rd' && (
              <OrderThirdView order={selectedOrder} />
            )}
          </div>
        </div>
      )}

      {/* REJECT/FEEDBACK MODAL */}
      {rejectingOrder && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Order Reject & Feedback Note</h3>
              <XCircle className="modal-close" onClick={() => setRejectingOrder(null)} />
            </div>
            <div className="form-group">
              <label className="form-label">Feedback / Rejection Reason</label>
              <textarea
                className="form-control"
                style={{ height: '100px' }}
                placeholder="Explain why this order was not approved..."
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
              />
            </div>
            <div className="mt-20 text-right">
              <button className="btn btn-secondary mr-10" style={{ marginRight: '10px' }} onClick={() => setRejectingOrder(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={() => handleApproveStatus(rejectingOrder.id, 'Rejected', feedbackText)}>
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ==========================================================================
function TrimsBookingView() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [viewingBooking, setViewingBooking] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Simulated access controls
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

  // Phase 1 form fields
  const [basis, setBasis] = useState<'Main' | 'Short'>('Main');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedBudgetIds, setSelectedBudgetIds] = useState<string[]>([]);
  const [selectedMainBookingIds, setSelectedMainBookingIds] = useState<string[]>([]);
  const [buyer, setBuyer] = useState('');
  const [bookingLabel, setBookingLabel] = useState<'Style Label' | 'PO Label'>('Style Label');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [source, setSource] = useState('Non-Epz/Local');
  const [supplierName, setSupplierName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [inhouseDate, setInhouseDate] = useState('');
  const [payMode, setPayMode] = useState('Credit');
  const [currency, setCurrency] = useState('USD');
  const [attention, setAttention] = useState('');
  const [remarks, setRemarks] = useState('');
  const [attentionSuggestion, setAttentionSuggestion] = useState('');

  // Phase 2 form fields
  const [bookingItems, setBookingItems] = useState<any[]>([]);
  const [termsConditions, setTermsConditions] = useState('');
  const [readyToApprove, setReadyToApprove] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');
  const [isMainQtyCompleted, setIsMainQtyCompleted] = useState(true);

  // Terms and conditions browse popups
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const termsTemplates = [
    "QC Check: Trim color must match approved lab dips.",
    "Packaging: Each carton must contain maximum 50 pcs.",
    "Delivery: Supplier must deliver in full within 10 days.",
    "Shrinkage: Trims must be pre-shrunk before sewing.",
    "Nickel Free: Metal parts must be nickel-free.",
    "Lead Free: Plastic trims must be lead-free."
  ];

  useEffect(() => {
    fetchBookings();
    fetchBudgets();
    fetchLastAttention();
  }, [simulatedRole]);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/trims-bookings?role=${simulatedRole}&company=${encodeURIComponent(userCompany)}&unit=${encodeURIComponent(userUnit)}`);
      const data = await res.json();
      setBookings(data);
    } catch (e) { console.error(e); }
  };

  const fetchBudgets = async () => {
    try {
      const res = await fetch(`${API_BASE}/budgets`);
      const data = await res.json();
      // Only approved budgets can be linked
      setBudgets(data.filter((b: any) => b.status === 'Approved'));
    } catch (e) { console.error(e); }
  };

  const fetchLastAttention = async () => {
    try {
      const res = await fetch(`${API_BASE}/trims-bookings/last-attention`);
      const data = await res.json();
      if (data.attention) {
        setAttentionSuggestion(data.attention);
      }
    } catch (e) { console.error(e); }
  };

  // Sync selection logic
  const handleStyleChange = (style: string) => {
    setSelectedStyle(style);
    if (!style) {
      setSelectedBudgetIds([]);
      setBuyer('');
      setSupplierName('');
      return;
    }
    const matching = budgets.filter(b => String(b.style_no).toLowerCase() === style.toLowerCase());
    const ids = matching.map(b => b.id.toString());
    setSelectedBudgetIds(ids);
    if (matching.length > 0) {
      setBuyer(matching[0].buyer || '');
      setSupplierName(matching[0].supplier_name || 'Montrims LTD.');
    }
  };

  const handleBudgetIdsChange = (ids: string[]) => {
    setSelectedBudgetIds(ids);
    if (ids.length === 0) {
      setSelectedStyle('');
      setBuyer('');
      setSupplierName('');
      return;
    }
    const firstBudget = budgets.find(b => b.id.toString() === ids[0]);
    if (firstBudget) {
      setSelectedStyle(firstBudget.style_no || '');
      setBuyer(firstBudget.buyer || '');
      setSupplierName(firstBudget.supplier_name || 'Montrims LTD.');
    }
  };

  // Step 2 Item retrieval
  const handleGetData = async (budgetsList: string[], basisType: string, mainBookingsList: string[]) => {
    setErrorMsg('');
    if (basisType === 'Short') {
      if (mainBookingsList.length === 0) return;
      try {
        let itemsAggregated: any[] = [];
        let totalMainQty = 0;
        let totalBudgetQty = 0;

        for (let mainId of mainBookingsList) {
          const res = await fetch(`${API_BASE}/trims-bookings/${mainId}`);
          if (res.ok) {
            const mainBooking = await res.json();
            const items = mainBooking.items || [];

            for (let it of items) {
              totalMainQty += parseFloat(it.work_order_qty || 0);
              totalBudgetQty += parseFloat(it.required_qty || 0);

              itemsAggregated.push({
                ...it,
                id: undefined,
                booking_id: undefined,
                work_order_qty: 0,
                short_booking_qty: 0,
                excess_pct: 0,
                final_wo_qty: 0,
                amount: 0,
                basis: 'Short',
                remarks: `Short Booking Adjustment for Main Ref: ${mainBooking.booking_reference}`
              });
            }
          }
        }

        const enabled = totalMainQty >= totalBudgetQty && totalBudgetQty > 0;
        setIsMainQtyCompleted(enabled);
        setBookingItems(itemsAggregated);
      } catch (e) {
        console.error(e);
        setErrorMsg("Failed to retrieve Main Booking items.");
      }
      return;
    }

    // Main Booking Item Generation
    if (budgetsList.length === 0) return;
    try {
      let itemsAggregated: any[] = [];

      for (let budgetId of budgetsList) {
        const res = await fetch(`${API_BASE}/budgets/${budgetId}`);
        if (!res.ok) continue;
        const budgetDetail = await res.json();

        // Fetch already booked quantities
        const bookedRes = await fetch(`${API_BASE}/trims-bookings/booked-quantity/${budgetId}`);
        const bookedQuantities = bookedRes.ok ? await bookedRes.json() : [];

        // Fetch order details for shipment date
        let orderPos: any[] = [];
        if (budgetDetail.order_id) {
          const orderRes = await fetch(`${API_BASE}/orders/${budgetDetail.order_id}`);
          if (orderRes.ok) {
            const orderDetail = await orderRes.json();
            orderPos = orderDetail.pos || [];
          }
        }

        const trims = budgetDetail.trims || [];
        for (let trim of trims) {
          const consumptions = trim.consumption || [];
          for (let cons of consumptions) {
            // Find booked quantity
            const match = bookedQuantities.find((bq: any) =>
              String(bq.po_no).toLowerCase() === String(cons.po_no).toLowerCase() &&
              String(bq.item_name).toLowerCase() === String(trim.item_name).toLowerCase() &&
              String(bq.garments_color).toLowerCase() === String(cons.color).toLowerCase() &&
              String(bq.item_desc).toLowerCase() === String(trim.item_description).toLowerCase()
            );
            const bookedQty = match ? parseFloat(match.booked_qty || 0) : 0;
            const remainingQty = parseFloat(cons.total_qty || 0) - bookedQty;

            // Find shipment date from order pos
            const matchingPo = orderPos.find(p => String(p.po_no).toLowerCase() === String(cons.po_no).toLowerCase());
            const shipDate = matchingPo ? matchingPo.ship_date : '';

            itemsAggregated.push({
              po_id: cons.id || 1,
              po_no: cons.po_no,
              buyer: budgetDetail.buyer || 'Zara',
              style_no: budgetDetail.style_no || 'test-style',
              garments_item: trim.gmt_item || 'Polo Shirt',
              garments_color: cons.color,
              item_color: cons.color,
              item_name: trim.item_name || 'Sewing Thread',
              item_desc: trim.item_description || 'Standard polyester thread',
              garments_shipment_date: shipDate || 'N/A',
              item_booking_date: new Date().toISOString().split('T')[0],
              item_delivery_date: deliveryDate || new Date().toISOString().split('T')[0],
              supplier: supplierName || trim.n_supplier || 'Montrims LTD.',
              required_qty: cons.total_qty || 0,
              prev_booked_qty: bookedQty,
              work_order_qty: Math.max(0, remainingQty),
              short_booking_qty: 0,
              excess_pct: cons.process_loss_pct || 0,
              final_wo_qty: Math.max(0, remainingQty) * (1 + (cons.process_loss_pct || 0) / 100),
              rate: trim.rate || cons.rate || 0,
              amount: Math.max(0, remainingQty) * (1 + (cons.process_loss_pct || 0) / 100) * (trim.rate || cons.rate || 0),
              uom: trim.cons_uom || 'Cone',
              sensitivity: 'As per Garments Color',
              contrast_color: '',
              remarks: '',
              rmg_quantity: cons.po_qty || 0,
              payment_mode: payMode || 'Credit',
              source: source || 'Non-Epz/Local',
              booking_by: 'Supervisor'
            });
          }
        }
      }

      setBookingItems(itemsAggregated);
      if (itemsAggregated.length === 0) {
        setErrorMsg("Warning: No trims consumption details found for the selected budget(s) in the cost budget. Please check if trims are defined in the Cost Budget.");
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to retrieve budget items.");
    }
  };

  const updateItemField = (index: number, field: string, value: any) => {
    const updated = [...bookingItems];
    updated[index] = {
      ...updated[index],
      [field]: value
    };

    // Calculate Work Order Quantities and Amounts
    const qty = parseFloat(basis === 'Short' ? updated[index].short_booking_qty : updated[index].work_order_qty) || 0;
    const excess = parseInt(updated[index].excess_pct) || 0;
    const finalQty = qty * (1 + excess / 100);
    updated[index].final_wo_qty = finalQty;
    updated[index].amount = finalQty * (parseFloat(updated[index].rate) || 0);

    setBookingItems(updated);
  };

  const handleSaveStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (selectedBudgetIds.length === 0) return alert("Select at least one Budget Reference.");

    const budgetId = selectedBudgetIds[0];
    const generatedRef = `TB-${String(Math.floor(Math.random() * 900) + 100)}-${new Date().toISOString().split('T')[0]}`;

    const payload = {
      booking_reference: generatedRef,
      budget_id: parseInt(budgetId),
      basis,
      main_booking_id: basis === 'Short' && selectedMainBookingIds.length > 0 ? parseInt(selectedMainBookingIds[0]) : null,
      booking_date: bookingDate,
      source,
      supplier_name: supplierName,
      delivery_date: deliveryDate,
      inhouse_date: inhouseDate,
      pay_mode: payMode,
      currency,
      attention,
      remarks,
      booking_label: bookingLabel,
      terms_conditions: termsConditions,
      status: 'Pending',
      company: userCompany,
      unit: userUnit,
      booking_by: 'Supervisor',
      items: []
    };

    try {
      const res = await fetch(`${API_BASE}/trims-bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Over-budget check blocked submission.");
      } else {
        setEditingBookingId(data.id);
        setModalStep(2);
        // Automatically fetch detailed trims consumption rows
        await handleGetData(selectedBudgetIds, basis, selectedMainBookingIds);
      }
    } catch (e) {
      setErrorMsg("Failed to create trims booking. Check connection.");
    }
  };

  const handleSaveStep2 = async () => {
    setErrorMsg('');
    if (!editingBookingId) return;

    // VALIDATION: Don't Book more than Budget Quantity
    for (let it of bookingItems) {
      const enteredQty = parseFloat(basis === 'Short' ? it.short_booking_qty : it.work_order_qty) || 0;
      if (enteredQty + parseFloat(it.prev_booked_qty || 0) > parseFloat(it.required_qty || 0)) {
        return alert(`Validation Block: Item "${it.item_name}" under PO ${it.po_no} exceeds budgeted quantity. Entered: ${enteredQty}, Already Booked: ${it.prev_booked_qty}, Budget Limit: ${it.required_qty}`);
      }
    }

    const payload = {
      status: readyToApprove ? 'Ready to Approve' : 'Pending',
      basis,
      main_booking_id: basis === 'Short' && selectedMainBookingIds.length > 0 ? parseInt(selectedMainBookingIds[0]) : null,
      booking_date: bookingDate,
      source,
      supplier_name: supplierName,
      delivery_date: deliveryDate,
      inhouse_date: inhouseDate,
      pay_mode: payMode,
      currency,
      attention,
      remarks,
      booking_label: bookingLabel,
      terms_conditions: termsConditions,
      booking_by: 'Supervisor',
      items: bookingItems
    };

    try {
      const res = await fetch(`${API_BASE}/trims-bookings/${editingBookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to save booking details.");
      } else {
        setShowModal(false);
        fetchBookings();
      }
    } catch (e) {
      setErrorMsg("Failed to update booking items.");
    }
  };

  const handleApproveBooking = async (id: number, status: 'Approved' | 'Rejected') => {
    try {
      const res = await fetch(`${API_BASE}/trims-bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchBookings();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update approval status.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitToManager = async (bookingId: number) => {
    try {
      const res = await fetch(`${API_BASE}/trims-bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Ready to Approve'
        })
      });
      if (res.ok) {
        alert("Trims booking submitted to manager for approval!");
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
    if (!window.confirm("Are you sure you want to delete this trims booking?")) return;
    try {
      const res = await fetch(`${API_BASE}/trims-bookings/${bookingId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert("Trims booking deleted successfully.");
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

  const handleOpenEdit = async (b: any) => {
    setEditingBookingId(b.booking_id || b.id);
    setBasis(b.basis);
    setSelectedBudgetIds([String(b.budget_id)]);
    const budget = budgets.find(x => x.id === b.budget_id);
    setSelectedStyle(budget ? budget.style_no : '');
    setBuyer(b.buyer || budget?.buyer || '');
    setBookingLabel(b.booking_label || 'Style Label');
    setBookingDate(b.booking_date);
    setSource(b.source);
    setSupplierName(b.supplier_name);
    setDeliveryDate(b.delivery_date);
    setInhouseDate(b.inhouse_date);
    setPayMode(b.pay_mode);
    setCurrency(b.currency);
    setAttention(b.attention);
    setRemarks(b.remarks);
    setTermsConditions(b.terms_conditions || '');
    setReadyToApprove(b.status === 'Ready to Approve');

    // Load existing items
    try {
      const res = await fetch(`${API_BASE}/trims-bookings/${b.booking_id || b.id}`);
      if (res.ok) {
        const fullData = await res.json();
        setBookingItems(fullData.items || []);
      }
    } catch (e) {
      console.error(e);
    }

    setModalStep(2);
    setShowModal(true);
  };

  // Flatten booking items for list representation
  const allBookingItemRows: any[] = [];
  bookings.forEach(b => {
    const items = b.items || [];
    if (items.length === 0) {
      allBookingItemRows.push({
        booking_id: b.id,
        id: b.id,
        booking_reference: b.booking_reference,
        created_date: b.created_date,
        basis: b.basis,
        buyer: b.buyer || 'N/A',
        style_no: b.style_no || 'N/A',
        po_no: 'N/A',
        item_name: 'No items booked yet',
        item_desc: 'Configure items in Step 2',
        garments_color: 'N/A',
        contrast_color: '',
        work_order_qty: 0,
        uom: '-',
        rate: 0,
        amount: 0,
        supplier_name: b.supplier_name,
        delivery_date: b.delivery_date,
        inhouse_date: b.inhouse_date,
        pay_mode: b.pay_mode,
        source: b.source,
        currency: b.currency,
        attention: b.attention,
        remarks: b.remarks,
        booking_label: b.booking_label,
        terms_conditions: b.terms_conditions,
        status: b.status,
        booking_by: b.booking_by,
        company: b.company,
        unit: b.unit,
        approval_date_time: b.approval_date_time,
        budget_id: b.budget_id,
        main_booking_id: b.main_booking_id
      });
    } else {
      items.forEach((it: any) => {
        allBookingItemRows.push({
          ...it,
          booking_id: b.id,
          booking_reference: b.booking_reference,
          created_date: b.created_date,
          basis: b.basis,
          supplier_name: b.supplier_name,
          delivery_date: b.delivery_date,
          inhouse_date: b.inhouse_date,
          pay_mode: b.pay_mode,
          source: b.source,
          currency: b.currency,
          attention: b.attention,
          remarks: b.remarks,
          booking_label: b.booking_label,
          terms_conditions: b.terms_conditions,
          status: b.status,
          booking_by: b.booking_by,
          company: b.company,
          unit: b.unit,
          approval_date_time: b.approval_date_time,
          budget_id: b.budget_id,
          main_booking_id: b.main_booking_id
        });
      });
    }
  });

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
      return bookings.filter(b => b.created_date && b.created_date.startsWith(key)).length;
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
        basisFiltered = allBookingItemRows.filter(row => row.created_date && row.created_date.startsWith(selectedCalendarDay));
      } else {
        basisFiltered = [];
      }
    } else if (filterBasis === 'month') {
      if (selectedMonth) {
        basisFiltered = allBookingItemRows.filter(row => row.created_date && row.created_date.startsWith(selectedMonth));
      } else {
        basisFiltered = [];
      }
    } else if (filterBasis === 'year') {
      if (selectedYear) {
        basisFiltered = allBookingItemRows.filter(row => row.created_date && row.created_date.startsWith(selectedYear));
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
        const buyerStr = String(row.buyer || '').toLowerCase();
        const itemStr = String(row.item_name || '').toLowerCase();
        const supplierStr = String(row.supplier_name || '').toLowerCase();
        return refStr.includes(q) || styleStr.includes(q) || buyerStr.includes(q) || itemStr.includes(q) || supplierStr.includes(q);
      });
    }

    // 3. Status filter
    if (statusFilter !== 'All') {
      return searchFiltered.filter(row => {
        const stat = row.status || 'Draft';
        if (statusFilter === 'Pending Approval') {
          return stat === 'Pending Approval' || stat === 'Pending' || stat === 'Ready to Approve';
        }
        return stat.toLowerCase() === statusFilter.toLowerCase();
      });
    }

    return searchFiltered;
  };

  const filteredBookingItems = getFilteredBookingItems();

  const uniqueStyles = Array.from(new Set(budgets.map(b => b.style_no).filter(Boolean)));
  const approvedMainBookings = bookings.filter(b => b.basis === 'Main' && b.status === 'Approved');

  return (
    <div className="dashboard-card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <h2 className="card-title" style={{ margin: 0 }}><Settings /> Trims & Accessories Bookings</h2>

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

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--text-secondary)' }}>Simulate Role:</label>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
              value={simulatedRole}
              onChange={(e) => setSimulatedRole(e.target.value as any)}
            >
              <option value="super_admin">Super Admin</option>
              <option value="admin_user">Store Manager</option>
              <option value="unit_user">Merchandiser</option>
            </select>
          </div>

          <button className="btn btn-primary" onClick={() => {
            setEditingBookingId(null);
            setModalStep(1);
            setBasis('Main');
            setSelectedStyle('');
            setSelectedBudgetIds([]);
            setSelectedMainBookingIds([]);
            setBuyer('');
            setBookingLabel('Style Label');
            setBookingDate(new Date().toISOString().split('T')[0]);
            setSource('Non-Epz/Local');
            setSupplierName('');
            setDeliveryDate('');
            setInhouseDate('');
            setPayMode('Credit');
            setCurrency('USD');
            setAttention(attentionSuggestion);
            setRemarks('');
            setTermsConditions('');
            setBookingItems([]);
            setReadyToApprove(false);
            setShowModal(true);
          }}>
            <Plus size={16} /> New Trims Booking
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
            placeholder="Search Trims Booking by Style, Booking Ref, Buyer, or Supplier..."
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

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ref / Date</th>
              <th>Basis</th>
              <th>Buyer / Style / PO</th>
              <th>Item / Description</th>
              <th>Garments / Item Color</th>
              <th>Qty (UOM)</th>
              <th>Rate / Value</th>
              <th>Supplier</th>
              <th>Pay Mode / Source</th>
              <th>Approved Date</th>
              <th>Status / By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookingItems.map((row, idx) => (
              <tr key={idx}>
                <td>
                  <strong>{row.booking_reference}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Created: {row.created_date ? new Date(row.created_date).toLocaleDateString() : 'N/A'}</div>
                </td>
                <td><span className={`badge ${row.basis === 'Short' ? 'badge-draft' : 'badge-approved'}`}>{row.basis}</span></td>
                <td>
                  <strong>{row.buyer}</strong>
                  <div style={{ fontSize: '0.8rem' }}>Stl: {row.style_no}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PO: {row.po_no}</div>
                </td>
                <td>
                  {row.item_name}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.item_desc}</div>
                </td>
                <td>
                  Gmt: {row.garments_color}
                  {row.contrast_color && <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Contrast: {row.contrast_color}</div>}
                </td>
                <td>
                  <strong>{row.work_order_qty}</strong> ({row.uom})
                  {row.basis === 'Short' && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Short Qty: {row.short_booking_qty}</div>}
                </td>
                <td>
                  ${row.rate}
                  <div style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Val: ${(row.amount || 0).toFixed(2)}</div>
                </td>
                <td>{row.supplier}</td>
                <td>
                  {row.payment_mode}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.source}</div>
                </td>
                <td>{row.approval_date_time ? new Date(row.approval_date_time).toLocaleString() : 'N/A'}</td>
                <td>
                  <span className={`badge badge-${String(row.status).toLowerCase().replace(/\s+/g, '-')}`}>{row.status}</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>By: {row.booking_by}</div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => handleOpenEdit(row)}>Edit</button>
                    <button className="btn btn-sm btn-secondary" onClick={async () => {
                      try {
                        const res = await fetch(`${API_BASE}/trims-bookings/${row.booking_id || row.id}`);
                        if (res.ok) {
                          const fullData = await res.json();
                          setViewingBooking(fullData);
                        }
                      } catch (e) {
                        console.error(e);
                      }
                    }}>View</button>
                    <button
                      className="btn btn-sm"
                      title="Submit to Manager for Approval"
                      style={{ background: '#1d4ed8', color: '#ffffff', border: 'none' }}
                      onClick={() => handleSubmitToManager(row.booking_id)}
                      disabled={row.status === 'Approved' || row.status === 'Ready to Approve' || row.status === 'Pending Approval'}
                    >
                      Submit to Manager
                    </button>
                    <button
                      className="btn btn-sm"
                      title="Delete Booking"
                      style={{ background: '#be123c', color: '#ffffff', border: 'none' }}
                      onClick={() => handleDeleteBooking(row.booking_id)}
                    >
                      Delete
                    </button>
                  </div>

                </td>
              </tr>
            ))}
            {filteredBookingItems.length === 0 && (
              <tr>
                <td colSpan={12} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No Trims Bookings found matching search criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: modalStep === 1 ? '700px' : '98%', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>{editingBookingId ? 'Modify Trims Booking' : 'Create Trims Booking'} - Step {modalStep} of 2</h3>
              <XCircle className="modal-close" onClick={() => setShowModal(false)} />
            </div>

            {errorMsg && (
              <div className="alert-message alert-danger" style={{ margin: '10px 0' }}>
                <AlertCircle size={16} /> {errorMsg}
              </div>
            )}

            {modalStep === 1 ? (
              <form onSubmit={handleSaveStep1}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Basis *</label>
                    <select className="form-control" value={basis} onChange={e => {
                      setBasis(e.target.value as any);
                      setSelectedMainBookingIds([]);
                    }}>
                      <option value="Main">Main Booking</option>
                      <option value="Short">Short Booking</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Style *</label>
                    <select className="form-control" value={selectedStyle} onChange={e => handleStyleChange(e.target.value)} required>
                      <option value="">Select Style</option>
                      {uniqueStyles.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Budget Reference * (Select multiple if needed)</label>
                    <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-muted)', borderRadius: '6px', padding: '8px', background: 'var(--card-bg)' }}>
                      {budgets.filter(b => !selectedStyle || String(b.style_no).toLowerCase() === selectedStyle.toLowerCase()).map(b => (
                        <label key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontSize: '0.85rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={selectedBudgetIds.includes(b.id.toString())}
                            onChange={e => {
                              const checked = e.target.checked;
                              let newIds = [...selectedBudgetIds];
                              if (checked) {
                                newIds.push(b.id.toString());
                              } else {
                                newIds = newIds.filter(id => id !== b.id.toString());
                              }
                              handleBudgetIdsChange(newIds);
                            }}
                          />
                          {b.budget_reference} (Limit: ${parseFloat(b.total_trims_budget).toFixed(2)})
                        </label>
                      ))}
                    </div>
                  </div>
                  {basis === 'Short' && (
                    <div className="form-group">
                      <label className="form-label">Link Main Booking References * (For Short Booking)</label>
                      <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-muted)', borderRadius: '6px', padding: '8px', background: 'var(--card-bg)' }}>
                        {approvedMainBookings.map(mb => (
                          <label key={mb.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontSize: '0.85rem', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={selectedMainBookingIds.includes(mb.id.toString())}
                              onChange={e => {
                                const checked = e.target.checked;
                                let newIds = [...selectedMainBookingIds];
                                if (checked) {
                                  newIds.push(mb.id.toString());
                                } else {
                                  newIds = newIds.filter(id => id !== mb.id.toString());
                                }
                                setSelectedMainBookingIds(newIds);
                              }}
                            />
                            {mb.booking_reference} (Style: {mb.style_no})
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Buyer</label>
                    <input type="text" className="form-control" value={buyer} disabled />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Booking Scope Label *</label>
                    <select className="form-control" value={bookingLabel} onChange={e => setBookingLabel(e.target.value as any)}>
                      <option value="Style Label">Style Label</option>
                      <option value="PO Label">PO Label</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Booking Date</label>
                    <input type="date" className="form-control" value={bookingDate} onChange={e => setBookingDate(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Source *</label>
                    <select className="form-control" value={source} onChange={e => setSource(e.target.value)}>
                      <option value="Abroad/Import">Abroad/Import</option>
                      <option value="Epz">Epz</option>
                      <option value="Non-Epz/Local">Non-Epz/Local</option>
                      <option value="In House/Inventory">In House/Inventory</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Supplier Name *</label>
                    <input type="text" className="form-control" value={supplierName} onChange={e => setSupplierName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Payment Mode *</label>
                    <select className="form-control" value={payMode} onChange={e => setPayMode(e.target.value)}>
                      <option value="Credit">Credit</option>
                      <option value="Import">Import</option>
                      <option value="In House">In House</option>
                      <option value="Within Group">Within Group</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Delivery Date</label>
                    <input type="date" className="form-control" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Inhouse Date</label>
                    <input type="date" className="form-control" value={inhouseDate} onChange={e => setInhouseDate(e.target.value)} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Currency</label>
                    <select className="form-control" value={currency} onChange={e => setCurrency(e.target.value)}>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="BDT">BDT</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Attention</label>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <input type="text" className="form-control" value={attention} onChange={e => setAttention(e.target.value)} />
                      {attentionSuggestion && (
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAttention(attentionSuggestion)}>Use Last</button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Remarks</label>
                  <input type="text" className="form-control" value={remarks} onChange={e => setRemarks(e.target.value)} />
                </div>

                <div className="mt-20 text-right">
                  <button type="button" className="btn btn-secondary mr-10" style={{ marginRight: '10px' }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary"><Save size={16} /> Save Header (Step 1)</button>
                </div>
              </form>
            ) : (
              <div>
                <div style={{ marginBottom: '15px', background: 'var(--bg-muted)', padding: '10px', borderRadius: '6px' }}>
                  <strong>Style Selected:</strong> {selectedStyle} | <strong>Supplier:</strong> {supplierName} | <strong>Basis:</strong> {basis}
                </div>

                {basis === 'Short' && !isMainQtyCompleted && (
                  <div className="alert-message alert-danger" style={{ marginBottom: '15px' }}>
                    <AlertCircle size={16} /> <strong>Warning:</strong> Selected Main Bookings quantity has not reached the full Budget quantity. Short Booking quantity is disabled until Main Booking completes.
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h4>Step 2: Edit Booking Details List</h4>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleGetData(selectedBudgetIds, basis, selectedMainBookingIds)}>Get/Reload Data</button>
                </div>

                <div className="table-wrapper" style={{ overflowX: 'auto', maxHeight: '400px' }}>
                  <table className="data-table" style={{ minWidth: '1500px', fontSize: '0.85rem' }}>
                    <thead>
                      <tr>
                        <th>Buyer/Style</th>
                        <th>PO No</th>
                        <th>Garments Item</th>
                        <th>Garments Color</th>
                        <th>RMG Qty</th>
                        <th>Req. Qty (Budget)</th>
                        <th>Prev Booked</th>
                        <th>Sensitivity</th>
                        <th>Contrast Color</th>
                        {basis === 'Short' ? <th>Short Booking Qty</th> : <th>Work Order Qty</th>}
                        <th>Excess %</th>
                        <th>Final WO Qty</th>
                        <th>Rate ($)</th>
                        <th>Amount ($)</th>
                        <th>Ship Date</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingItems.map((it, idx) => (
                        <tr key={idx}>
                          <td>
                            <strong>{it.buyer}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stl: {it.style_no}</div>
                          </td>
                          <td>{it.po_no}</td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              value={it.garments_item}
                              onChange={e => updateItemField(idx, 'garments_item', e.target.value)}
                              style={{ width: '130px', padding: '4px' }}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              value={it.garments_color}
                              onChange={e => updateItemField(idx, 'garments_color', e.target.value)}
                              style={{ width: '100px', padding: '4px' }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control"
                              value={it.rmg_quantity}
                              onChange={e => updateItemField(idx, 'rmg_quantity', parseFloat(e.target.value) || 0)}
                              style={{ width: '80px', padding: '4px' }}
                            />
                          </td>
                          <td>{it.required_qty}</td>
                          <td>{it.prev_booked_qty}</td>
                          <td>
                            <select
                              className="form-control"
                              value={it.sensitivity}
                              onChange={e => updateItemField(idx, 'sensitivity', e.target.value)}
                              style={{ width: '140px', padding: '4px' }}
                            >
                              <option value="As per Garments Color">As per Garments Color</option>
                              <option value="Contrast Color">Contrast Color</option>
                              <option value="Size Sensitive">Size Sensitive</option>
                              <option value="Color & Size Sensitive">Color & Size Sensitive</option>
                            </select>
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              value={it.contrast_color}
                              onChange={e => updateItemField(idx, 'contrast_color', e.target.value)}
                              disabled={it.sensitivity !== 'Contrast Color'}
                              style={{ width: '100px', padding: '4px' }}
                            />
                          </td>
                          {basis === 'Short' ? (
                            <td>
                              <input
                                type="number"
                                className="form-control"
                                value={it.short_booking_qty}
                                onChange={e => {
                                  updateItemField(idx, 'short_booking_qty', parseFloat(e.target.value) || 0);
                                  updateItemField(idx, 'work_order_qty', parseFloat(e.target.value) || 0);
                                }}
                                disabled={!isMainQtyCompleted}
                                style={{ width: '90px', padding: '4px', background: !isMainQtyCompleted ? '#f1f5f9' : '#fff' }}
                              />
                            </td>
                          ) : (
                            <td>
                              <input
                                type="number"
                                className="form-control"
                                value={it.work_order_qty}
                                onChange={e => updateItemField(idx, 'work_order_qty', parseFloat(e.target.value) || 0)}
                                style={{ width: '90px', padding: '4px' }}
                              />
                            </td>
                          )}
                          <td>
                            <input
                              type="number"
                              className="form-control"
                              value={it.excess_pct}
                              onChange={e => updateItemField(idx, 'excess_pct', parseInt(e.target.value) || 0)}
                              style={{ width: '70px', padding: '4px' }}
                            />
                          </td>
                          <td><strong>{(it.final_wo_qty || 0).toFixed(2)}</strong></td>
                          <td>
                            <input
                              type="number"
                              className="form-control"
                              value={it.rate}
                              onChange={e => updateItemField(idx, 'rate', parseFloat(e.target.value) || 0)}
                              style={{ width: '70px', padding: '4px' }}
                            />
                          </td>
                          <td><strong>${(it.amount || 0).toFixed(2)}</strong></td>
                          <td>{it.garments_shipment_date}</td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              value={it.remarks}
                              onChange={e => updateItemField(idx, 'remarks', e.target.value)}
                              style={{ width: '120px', padding: '4px' }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Terms and Conditions Section */}
                <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-muted)', paddingTop: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label">Terms & Conditions</label>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowTermsPopup(true)}>Browse Templates</button>
                  </div>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={termsConditions}
                    onChange={e => setTermsConditions(e.target.value)}
                    placeholder="Enter terms and conditions line by line..."
                  />
                  <button type="button" className="btn btn-secondary btn-sm mt-10" style={{ marginTop: '5px' }} onClick={() => setTermsConditions(prev => prev + (prev ? '\n' : '') + "* ")}>Add a line</button>
                </div>

                {/* Attachment Option */}
                <div style={{ marginTop: '15px' }}>
                  <label className="form-label">Attachment Option</label>
                  <input type="file" className="form-control" onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setAttachmentName(e.target.files[0].name);
                    }
                  }} />
                  {attachmentName && <span style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>Selected file: {attachmentName}</span>}
                </div>

                {/* Ready to Approve check */}
                <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="chkApprove"
                    checked={readyToApprove}
                    onChange={e => setReadyToApprove(e.target.checked)}
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                  <label htmlFor="chkApprove" style={{ cursor: 'pointer', fontWeight: 'bold' }}>Ready to Approve</label>
                </div>

                <div className="mt-20 text-right">
                  <button type="button" className="btn btn-secondary mr-10" style={{ marginRight: '10px' }} onClick={() => setModalStep(1)}>Back</button>
                  <button type="button" className="btn btn-primary" onClick={handleSaveStep2}><Save size={16} /> Save & Submit Booking</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Terms & Conditions Selection Modal */}
      {showTermsPopup && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h4>Select Terms & Conditions Template</h4>
              <XCircle className="modal-close" onClick={() => setShowTermsPopup(false)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '15px 0' }}>
              {termsTemplates.map((t, index) => (
                <button
                  key={index}
                  type="button"
                  className="btn btn-secondary"
                  style={{ textAlign: 'left', fontSize: '0.85rem' }}
                  onClick={() => {
                    setTermsConditions(prev => prev + (prev ? '\n' : '') + "* " + t);
                    setShowTermsPopup(false);
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewingBooking && (() => {
        const totalAcQty = (viewingBooking.items || []).reduce((sum: number, it: any) => sum + (it.work_order_qty || 0), 0);
        const totalWoAmt = (viewingBooking.items || []).reduce((sum: number, it: any) => sum + (it.amount || 0), 0);
        const firstItem = viewingBooking.items?.[0] || {};
        const isSensitiveText = firstItem.sensitivity || 'No Sensitive';

        const translateToWordsLocal = (amount: number) => {
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

        return (
          <div className="modal-overlay" style={{ zIndex: 1100 }}>
            <div className="modal-content" style={{ maxWidth: '1100px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="modal-header" style={{ borderBottom: '2px solid #0f172a' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Eye /> Trims Booking Sheet View Format
                </h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => window.print()} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Print Sheet / Save PDF
                  </button>
                  <XCircle className="modal-close" onClick={() => setViewingBooking(null)} />
                </div>
              </div>

              <div id="booking-sheet-print" style={{ padding: '25px', background: '#fff', color: '#0f172a', fontFamily: 'Calibri, Arial, sans-serif', fontSize: '0.85rem' }}>
                {/* Printable Header */}
                <div style={{ textAlign: 'center', marginBottom: '20px', position: 'relative' }}>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '2px 0', fontFamily: 'Arial Black, Impact, sans-serif' }}>{viewingBooking.company || 'Demo Factory Ltd.'}</h2>
                  <h3 style={{ fontSize: '1.25rem', margin: '2px 0', fontWeight: 'bold' }}>{viewingBooking.unit || 'Demo Unit'}</h3>
                  <p style={{ margin: '2px 0', color: '#0f172a', fontSize: '0.85rem' }}>Ashulia, Dhaka</p>

                  {/* PDF Icon replica */}
                  <div style={{ position: 'absolute', right: '10px', top: '10px', color: 'red', cursor: 'pointer', fontSize: '1.75rem' }} onClick={() => window.print()}>
                    <FileText />
                  </div>
                </div>

                {/* Sub Header Table Row */}
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', marginBottom: '15px' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '8px', borderRight: '1px solid #cbd5e1', width: '70%' }}>
                        {isSensitiveText} (Unique Id): {viewingBooking.booking_reference} Style:{firstItem.style_no || 'test'} Po Qty:{firstItem.rmg_quantity || '158760'}
                      </td>
                      <td style={{ padding: '8px', fontWeight: 'bold' }}>
                        Po No: {firstItem.po_no || '45577rtu6'}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Details Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '20px' }}>
                  <thead>
                    <tr style={{ background: '#fff', borderBottom: '1px solid #000', fontWeight: 'bold' }}>
                      <th style={{ padding: '6px 4px', borderRight: '1px solid #000', borderBottom: '1px solid #000', textAlign: 'left' }}>Style</th>
                      <th style={{ padding: '6px 4px', borderRight: '1px solid #000', borderBottom: '1px solid #000', textAlign: 'left' }}>Item</th>
                      <th style={{ padding: '6px 4px', borderRight: '1px solid #000', borderBottom: '1px solid #000', textAlign: 'left' }}>Item Description</th>
                      <th style={{ padding: '6px 4px', borderRight: '1px solid #000', borderBottom: '1px solid #000', textAlign: 'left' }}>Garments Color</th>
                      <th style={{ padding: '6px 4px', borderRight: '1px solid #000', borderBottom: '1px solid #000', textAlign: 'right' }}>Gmts. Qty</th>
                      <th style={{ padding: '6px 4px', borderRight: '1px solid #000', borderBottom: '1px solid #000', textAlign: 'left' }}>Item Color</th>
                      <th style={{ padding: '6px 4px', borderRight: '1px solid #000', borderBottom: '1px solid #000', textAlign: 'left' }}>Garments Certification</th>
                      <th style={{ padding: '6px 4px', borderRight: '1px solid #000', borderBottom: '1px solid #000', textAlign: 'right' }}>Actual Cons</th>
                      <th style={{ padding: '6px 4px', borderRight: '1px solid #000', borderBottom: '1px solid #000', textAlign: 'right' }}>Total Cons.</th>
                      <th style={{ padding: '6px 4px', borderRight: '1px solid #000', borderBottom: '1px solid #000', textAlign: 'right' }}>Ac. Qty</th>
                      <th style={{ padding: '6px 4px', borderRight: '1px solid #000', borderBottom: '1px solid #000', textAlign: 'right' }}>T. Qty</th>
                      <th style={{ padding: '6px 4px', borderRight: '1px solid #000', borderBottom: '1px solid #000', textAlign: 'left' }}>UOM</th>
                      <th style={{ padding: '6px 4px', borderRight: '1px solid #000', borderBottom: '1px solid #000', textAlign: 'right' }}>Rate</th>
                      <th style={{ padding: '6px 4px', borderRight: '1px solid #000', borderBottom: '1px solid #000', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '6px 4px', borderBottom: '1px solid #000', textAlign: 'left' }}>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(viewingBooking.items || []).map((it: any, index: number) => {
                      const actualCons = it.required_qty && it.rmg_quantity ? (it.required_qty / it.rmg_quantity * 12).toFixed(1) : '12';
                      const totalCons = it.final_wo_qty && it.rmg_quantity ? (it.final_wo_qty / it.rmg_quantity * 12).toFixed(1) : '12.6';

                      return (
                        <tr key={index} style={{ borderBottom: '1px solid #000' }}>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #000' }}>{it.style_no}</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #000' }}>{it.item_name}</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #000' }}>{it.item_desc}</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #000' }}>{it.garments_color}</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>{it.rmg_quantity || it.garments_qty}</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #000' }}>{it.item_color || it.garments_color}</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #000' }}>{it.garments_cert || ''}</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>{actualCons}</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>{totalCons}</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>{(it.work_order_qty || 0).toFixed(4)}</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>{Math.round(it.final_wo_qty || 0)}</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #000' }}>{it.uom}</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>{parseFloat(it.rate || 0).toFixed(4)}</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>{parseFloat(it.amount || 0).toFixed(4)}</td>
                          <td style={{ padding: '6px 4px' }}>{it.remarks || ''}</td>
                        </tr>
                      );
                    })}
                    {/* Sub Total Row */}
                    <tr style={{ fontWeight: 'bold', background: '#fff', borderBottom: '1px solid #000' }}>
                      <td colSpan={9} style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>Sub Total</td>
                      <td style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>{totalAcQty.toFixed(0)}</td>
                      <td style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}></td>
                      <td style={{ padding: '6px 4px', borderRight: '1px solid #000' }}></td>
                      <td style={{ padding: '6px 4px', borderRight: '1px solid #000' }}></td>
                      <td style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>{totalWoAmt.toFixed(0)}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>

                {/* Amount details */}
                <div style={{ margin: '15px 0', fontSize: '0.9rem' }}>
                  <div><strong>Total Booking Amount:</strong> {totalWoAmt.toFixed(0)}</div>
                  <div style={{ marginTop: '5px' }}>
                    <strong>Total Booking Amount (in word):</strong> {translateToWordsLocal(totalWoAmt)}
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div style={{ marginTop: '20px' }}>
                  <strong style={{ textDecoration: 'underline' }}>Terms and Conditions:</strong>
                  <ol style={{ paddingLeft: '20px', margin: '5px 0' }}>
                    <li>Earliest Delivery Date (EDD): {viewingBooking.inhouse_date || ''}</li>
                    <li>Latest Delivery Date (EDD): {viewingBooking.delivery_date || ''}</li>
                    <li>Partial Shipment : Not Allowed</li>
                    <li>Allowance of the Qty :</li>
                    <li>Required Certifications :</li>
                    <li>Tests Requirement :</li>
                    <li>Supplier's Challan must have PN's ERP booking number with buyer, style, PO, Color; Otherwise goods will not be received.</li>
                    <li>Delivery must be within working hour & not on holiday</li>
                    <li>Claims Policies : 5%, 10%, 15% claims will be imposed on LC values if delivery is delayed 1-7 days, 8-13 days, 14-21 days consequently</li>
                    <li>Others (If Any) :</li>
                    <li>Multi shipment not allow</li>
                  </ol>
                </div>
              </div>

              <div className="mt-20 text-right" style={{ padding: '15px 0 0 0', borderTop: '1px solid var(--border-muted)' }}>
                <button className="btn btn-secondary" onClick={() => setViewingBooking(null)}>Close View</button>
              </div>
            </div>
          </div>
        );
      })()}
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

// ==========================================================================
// SUB-VIEW: Trims Booking Approval Panel
// ==========================================================================
function TrimsBookingApprovalView() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [appFilterBasis, setAppFilterBasis] = useState<'day' | 'month' | 'year' | 'all'>('all');
  const [appCurrentCalendarDate, setAppCurrentCalendarDate] = useState(new Date());
  const [appSelectedCalendarDay, setAppSelectedCalendarDay] = useState<string | null>(null);
  const [appSelectedMonth, setAppSelectedMonth] = useState<string>('');
  const [appSelectedYear, setAppSelectedYear] = useState<string>('2026');
  const [appSearchText, setAppSearchText] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('Pending Approval');
  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);

  useEffect(() => {
    const closeDropdowns = () => setActiveDropdownId(null);
    window.addEventListener('click', closeDropdowns);
    return () => window.removeEventListener('click', closeDropdowns);
  }, []);


  // Simulated manager role selector
  const [simulatedRole, setSimulatedRole] = useState<'super_admin' | 'admin_user' | 'unit_user'>('super_admin');

  // View Sheet Modal states
  const [viewingBooking, setViewingBooking] = useState<any | null>(null);
  const [viewTab, setViewTab] = useState<'1st' | '2nd' | '3rd'>('1st');

  // Edit Modal states
  const [editingBooking, setEditingBooking] = useState<any | null>(null);
  const [editSupplier, setEditSupplier] = useState('');
  const [editDeliveryDate, setEditDeliveryDate] = useState('');
  const [editInhouseDate, setEditInhouseDate] = useState('');
  const [editPayMode, setEditPayMode] = useState('Credit');
  const [editSource, setEditSource] = useState('Non-Epz/Local');
  const [editAttention, setEditAttention] = useState('');
  const [editRemarks, setEditRemarks] = useState('');

  // Approval Feedback Modal states
  const [actionBookingId, setActionBookingId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<'Approved' | 'Rejected'>('Approved');
  const [feedbackText, setFeedbackText] = useState('');
  const [approverName, setApproverName] = useState('Super Admin');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [simulatedRole]);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/trims-bookings?role=${simulatedRole}&company=Demo Factory Ltd.&unit=Demo Unit`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this trims booking? This will also revert the budget utilization spend.")) return;
    try {
      const res = await fetch(`${API_BASE}/trims-bookings/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert("Trims booking deleted successfully.");
        fetchBookings();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete trims booking.");
      }
    } catch (e) {
      alert("Error deleting booking.");
    }
  };

  const handleOpenApprovalFeedback = (id: number, type: 'Approved' | 'Rejected') => {
    setActionBookingId(id);
    setActionType(type);
    setFeedbackText('');
    setApproverName(simulatedRole === 'super_admin' ? 'Super Admin' : 'Merchandising Manager');
    setShowFeedbackModal(true);
  };

  const handleSaveApproval = async () => {
    if (!actionBookingId) return;
    try {
      const res = await fetch(`${API_BASE}/trims-bookings/${actionBookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: actionType,
          feedback_by_approval_body: feedbackText || (actionType === 'Approved' ? 'Approved, within budget limit.' : 'Rejected by management.'),
          approved_by: approverName
        })
      });
      if (res.ok) {
        setShowFeedbackModal(false);
        fetchBookings();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update booking status.");
      }
    } catch (e) {
      alert("Error saving approval feedback.");
    }
  };

  const handleApproveBookingDirect = async (bookingId: number, status: 'Approved' | 'Rejected') => {
    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this trims booking?`)) return;
    try {
      const todayDateStr = new Date().toISOString().split('T')[0];
      const res = await fetch(`${API_BASE}/trims-bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          feedback_by_approval_body: status === 'Approved' ? 'Approved, within budget limit.' : 'Rejected by management.',
          approved_by: simulatedRole === 'super_admin' ? 'Super Admin' : 'Merchandising Manager',
          approval_date_time: todayDateStr
        })
      });
      if (res.ok) {
        alert(`Booking ${status} successfully!`);
        fetchBookings();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update booking status.");
      }
    } catch (e) {
      alert("Error saving approval status.");
    }
  };

  const handleOpenEdit = (b: any) => {
    setEditingBooking(b);
    setEditSupplier(b.supplier_name || '');
    setEditDeliveryDate(b.delivery_date || '');
    setEditInhouseDate(b.inhouse_date || '');
    setEditPayMode(b.pay_mode || 'Credit');
    setEditSource(b.source || 'Non-Epz/Local');
    setEditAttention(b.attention || '');
    setEditRemarks(b.remarks || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    try {
      const res = await fetch(`${API_BASE}/trims-bookings/${editingBooking.booking_id || editingBooking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier_name: editSupplier,
          delivery_date: editDeliveryDate,
          inhouse_date: editInhouseDate,
          pay_mode: editPayMode,
          source: editSource,
          attention: editAttention,
          remarks: editRemarks
        })
      });
      if (res.ok) {
        setEditingBooking(null);
        fetchBookings();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update booking.");
      }
    } catch (e) {
      alert("Error updating booking header.");
    }
  };

  // Flatten items for table display
  const flattenedRows: any[] = [];
  bookings.forEach((b: any) => {
    const items = b.items || [];
    if (items.length === 0) {
      flattenedRows.push({
        booking_id: b.id,
        id: b.id,
        booking_reference: b.booking_reference,
        basis: b.basis,
        booking_date: b.booking_date,
        source: b.source,
        supplier_name: b.supplier_name,
        delivery_date: b.delivery_date,
        inhouse_date: b.inhouse_date,
        pay_mode: b.pay_mode,
        currency: b.currency,
        attention: b.attention,
        remarks: b.remarks,
        booking_label: b.booking_label,
        terms_conditions: b.terms_conditions,
        status: b.status,
        company: b.company,
        unit: b.unit,
        booking_by: b.booking_by,
        created_date: b.created_date,
        approval_date_time: b.approval_date_time,
        feedback_by_approval_body: b.feedback_by_approval_body,
        approved_by: b.approved_by,
        parentBooking: b,
        buyer: b.buyer || 'N/A',
        style_no: b.style_no || 'N/A',
        po_no: 'N/A',
        item_name: 'No items booked yet',
        item_desc: 'Configure items in Step 2',
        garments_color: 'N/A',
        contrast_color: '',
        work_order_qty: 0,
        uom: '-',
        rate: 0,
        amount: 0
      });
    } else {
      items.forEach((it: any) => {
        flattenedRows.push({
          ...it,
          booking_id: b.id,
          booking_reference: b.booking_reference,
          basis: b.basis,
          booking_date: b.booking_date,
          source: b.source,
          supplier_name: b.supplier_name,
          delivery_date: b.delivery_date,
          inhouse_date: b.inhouse_date,
          pay_mode: b.pay_mode,
          currency: b.currency,
          attention: b.attention,
          remarks: b.remarks,
          booking_label: b.booking_label,
          terms_conditions: b.terms_conditions,
          status: b.status,
          company: b.company,
          unit: b.unit,
          booking_by: b.booking_by,
          created_date: b.created_date,
          approval_date_time: b.approval_date_time,
          feedback_by_approval_body: b.feedback_by_approval_body,
          approved_by: b.approved_by,
          parentBooking: b
        });
      });
    }
  });

  const getFilteredApprovalBookingItems = () => {
    let basisFiltered = flattenedRows;

    // 1. Basis Filter
    if (appFilterBasis === 'day') {
      if (appSelectedCalendarDay) {
        basisFiltered = flattenedRows.filter(row => row.created_date && row.created_date.startsWith(appSelectedCalendarDay));
      } else {
        basisFiltered = [];
      }
    } else if (appFilterBasis === 'month') {
      if (appSelectedMonth) {
        basisFiltered = flattenedRows.filter(row => row.created_date && row.created_date.startsWith(appSelectedMonth));
      } else {
        basisFiltered = [];
      }
    } else if (appFilterBasis === 'year') {
      if (appSelectedYear) {
        basisFiltered = flattenedRows.filter(row => row.created_date && row.created_date.startsWith(appSelectedYear));
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
        const buyerStr = String(row.buyer || '').toLowerCase();
        const itemStr = String(row.item_name || '').toLowerCase();
        const supplierStr = String(row.supplier_name || '').toLowerCase();
        return refStr.includes(q) || styleStr.includes(q) || buyerStr.includes(q) || itemStr.includes(q) || supplierStr.includes(q);
      });
    }

    // 3. Status filter
    if (appStatusFilter !== 'All') {
      return searchFiltered.filter(row => {
        const stat = row.status || 'Draft';
        if (appStatusFilter === 'Pending Approval') {
          return stat === 'Pending Approval' || stat === 'Ready to Approve' || stat === 'Approved' || stat === 'Rejected';
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
      return bookings.filter(b => b.created_date && b.created_date.startsWith(key)).length;
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

  const filteredRows = getFilteredApprovalBookingItems();

  const translateToWordsLocal = (amount: number) => {
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

  return (
    <div className="dashboard-card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <h2 className="card-title" style={{ margin: 0 }}><Shield /> Trims Booking Approval Panel</h2>

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
            placeholder="Search by Buyer, Style, PO, Supplier or Booking Ref..."
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
          Found {filteredRows.length} Records
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

      {/* Main Approval Grid */}
      <div className="table-wrapper" style={{ overflowX: 'auto' }}>
        <table className="data-table" style={{ minWidth: '3500px', fontSize: '0.82rem' }}>
          <thead>
            <tr>
              <th>SL</th>
              <th>Buyer</th>
              <th>Style</th>
              <th>PO</th>
              <th>Garments Type</th>
              <th>Garments Color</th>
              <th>Item Color</th>
              <th>Garments Certification</th>
              <th>Garments Shipment Date</th>
              <th>Item Booking Date</th>
              <th>Item Delivery Date</th>
              <th>Supplier</th>
              <th>Source</th>
              <th>Payment Mode</th>
              <th>Qty as per Quotation</th>
              <th>Qty as per Budget</th>
              <th>Qty as per Booking</th>
              <th>Booking Type</th>
              <th>Unit</th>
              <th>Rate</th>
              <th>WO Total Value</th>
              <th>Deviation (Quote vs WO)</th>
              <th>Requested By & Date</th>
              <th>Approval By & Date</th>
              <th>Approval Status</th>
              <th>User Remarks</th>
              <th>Feedback by Approval Body</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, idx) => {
              const qtyQuotation = Math.round(row.required_qty * 0.95);
              const qtyBudget = row.required_qty;
              const qtyBooking = row.work_order_qty;
              const deviationAmt = qtyBooking - qtyQuotation;
              const deviationPct = qtyQuotation > 0 ? ((deviationAmt / qtyQuotation) * 100).toFixed(1) + "%" : "0%";

              return (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td><strong>{row.buyer}</strong></td>
                  <td>{row.style_no}</td>
                  <td>{row.po_no}</td>
                  <td>{row.garments_item}</td>
                  <td>{row.garments_color}</td>
                  <td>{row.item_color || row.garments_color}</td>
                  <td>{row.garments_cert || 'Oeko-Tex 100'}</td>
                  <td>{row.garments_shipment_date || 'N/A'}</td>
                  <td>{row.booking_date}</td>
                  <td>{row.delivery_date}</td>
                  <td>{row.supplier_name}</td>
                  <td><span className="badge badge-secondary">{row.source}</span></td>
                  <td>{row.pay_mode}</td>
                  <td>{qtyQuotation}</td>
                  <td>{qtyBudget}</td>
                  <td><strong>{qtyBooking}</strong> ({row.uom})</td>
                  <td><span className={`badge ${row.basis === 'Short' ? 'badge-draft' : 'badge-approved'}`}>{row.basis}</span></td>
                  <td>{row.unit}</td>
                  <td>${parseFloat(row.rate).toFixed(4)}</td>
                  <td><strong>${(row.amount || 0).toFixed(2)}</strong></td>
                  <td>
                    <span style={{ color: deviationAmt > 0 ? 'red' : 'green', fontWeight: 'bold' }}>
                      {deviationAmt > 0 ? `+${deviationAmt} (${deviationPct})` : `${deviationAmt} (${deviationPct})`}
                    </span>
                  </td>
                  <td>
                    <div>{row.booking_by}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{row.booking_date}</div>
                  </td>
                  <td>
                    <div>{row.approved_by || 'N/A'}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{row.approval_date_time ? new Date(row.approval_date_time).toLocaleDateString() : 'N/A'}</div>
                  </td>
                  <td>
                    <span className={`badge badge-${String(row.status).toLowerCase().replace(/\s+/g, '-')}`}>
                      {row.status}
                    </span>
                  </td>
                  <td>{row.remarks || 'N/A'}</td>
                  <td>
                    <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                      {row.feedback_by_approval_body || 'No feedback yet.'}
                    </span>
                  </td>
                  <td style={{ background: 'var(--card-bg)', borderLeft: '1px solid var(--border-muted)', padding: '6px 12px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', whiteSpace: 'nowrap' }}>
                      {(row.status === 'Pending Approval' || row.status === 'Ready to Approve') ? (
                        <>
                          <button
                            className="btn btn-success btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', fontSize: '0.75rem' }}
                            onClick={() => handleApproveBookingDirect(row.booking_id, 'Approved')}
                            disabled={simulatedRole !== 'super_admin' && simulatedRole !== 'admin_user'}
                            title={simulatedRole !== 'super_admin' && simulatedRole !== 'admin_user' ? "Only Manager/Admin can approve" : "Approve Booking"}
                          >
                            <CheckCircle size={12} /> Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', fontSize: '0.75rem' }}
                            onClick={() => handleApproveBookingDirect(row.booking_id, 'Rejected')}
                            disabled={simulatedRole !== 'super_admin' && simulatedRole !== 'admin_user'}
                            title={simulatedRole !== 'super_admin' && simulatedRole !== 'admin_user' ? "Only Manager/Admin can reject" : "Reject Booking"}
                          >
                            <XCircle size={12} /> Reject
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                          {row.status === 'Ready to Approve' || row.status === 'Pending Approval' ? 'Pending Approval' : row.status}
                        </span>
                      )}

                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                        onClick={() => { setViewingBooking(row.parentBooking); setViewTab('1st'); }}
                      >
                        1st View
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                        onClick={() => { setViewingBooking(row.parentBooking); setViewTab('2nd'); }}
                      >
                        2nd View
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                        onClick={() => { setViewingBooking(row.parentBooking); setViewTab('3rd'); }}
                      >
                        3rd View
                      </button>

                      <button
                        className="btn btn-primary btn-sm"
                        style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                        onClick={() => handleOpenEdit(row)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', fontSize: '0.75rem', backgroundColor: '#be123c', color: '#ffffff', border: 'none' }}
                        onClick={() => handleDelete(row.booking_id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={28} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No trims bookings found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 3-WAY PRINTABLE MODAL VIEW (SUPPLIER, FACTORY, ACCOUNTS COPY) */}
      {viewingBooking && (() => {
        const totalAcQty = (viewingBooking.items || []).reduce((sum: number, it: any) => sum + (it.work_order_qty || 0), 0);
        const totalWoAmt = (viewingBooking.items || []).reduce((sum: number, it: any) => sum + (it.amount || 0), 0);
        const firstItem = viewingBooking.items?.[0] || {};
        const isSensitiveText = firstItem.sensitivity || 'No Sensitive';

        return (
          <div className="modal-overlay" style={{ zIndex: 1100 }}>
            <div className="modal-content" style={{ maxWidth: '1100px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="modal-header" style={{ borderBottom: '2px solid #0f172a' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Eye /> Printable View Formats
                </h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => window.print()} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Print Copy / Save PDF
                  </button>
                  <XCircle className="modal-close" onClick={() => setViewingBooking(null)} />
                </div>
              </div>

              {/* View copy selector tabs */}
              <div style={{ display: 'flex', gap: '10px', padding: '15px 25px 0 25px', background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                <button
                  className={`btn btn-sm ${viewTab === '1st' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setViewTab('1st')}
                  style={{ borderRadius: '4px 4px 0 0' }}
                >
                  1st View (Supplier Copy)
                </button>
                <button
                  className={`btn btn-sm ${viewTab === '2nd' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setViewTab('2nd')}
                  style={{ borderRadius: '4px 4px 0 0' }}
                >
                  2nd View (Store & Factory Copy)
                </button>
                <button
                  className={`btn btn-sm ${viewTab === '3rd' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setViewTab('3rd')}
                  style={{ borderRadius: '4px 4px 0 0' }}
                >
                  3rd View (Costing & Accounts Copy)
                </button>
              </div>

              <div id="booking-sheet-print" style={{ padding: '25px', background: '#fff', color: '#0f172a', fontFamily: 'Calibri, Arial, sans-serif', fontSize: '0.85rem' }}>

                {/* 1st View copy details */}
                {viewTab === '1st' && (
                  <div>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '20px', position: 'relative' }}>
                      <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '2px 0', fontFamily: 'Arial Black, sans-serif' }}>{viewingBooking.company || 'Demo Factory Ltd.'}</h2>
                      <h3 style={{ fontSize: '1.25rem', margin: '2px 0', fontWeight: 'bold' }}>{viewingBooking.unit || 'Demo Unit'}</h3>
                      <p style={{ margin: '2px 0', color: '#0f172a', fontSize: '0.85rem' }}>Ashulia, Dhaka</p>
                      <div style={{ border: '1px solid #0f172a', padding: '6px', fontWeight: 'bold', display: 'inline-block', marginTop: '10px', textTransform: 'uppercase' }}>
                        Trims Booking Sheet - Supplier Copy (1st)
                      </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', marginBottom: '15px' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '8px', borderRight: '1px solid #cbd5e1', width: '50%' }}>
                            <strong>Unique Reference:</strong> {viewingBooking.booking_reference}
                          </td>
                          <td style={{ padding: '8px' }}>
                            <strong>Supplier Name:</strong> {viewingBooking.supplier_name}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px', borderRight: '1px solid #cbd5e1' }}>
                            <strong>Booking Date:</strong> {viewingBooking.booking_date}
                          </td>
                          <td style={{ padding: '8px' }}>
                            <strong>Delivery Date (EDD):</strong> {viewingBooking.delivery_date || 'N/A'}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px', borderRight: '1px solid #cbd5e1' }}>
                            <strong>Payment Mode:</strong> {viewingBooking.pay_mode} | <strong>Source:</strong> {viewingBooking.source}
                          </td>
                          <td style={{ padding: '8px' }}>
                            <strong>Attention:</strong> {viewingBooking.attention || 'N/A'}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '20px' }}>
                      <thead>
                        <tr style={{ background: '#fff', borderBottom: '1px solid #000', fontWeight: 'bold' }}>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'left' }}>Style</th>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'left' }}>Item</th>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'left' }}>Item Description</th>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'left' }}>Garments Color</th>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'left' }}>Item Color</th>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>WO T. Qty</th>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'left' }}>UOM</th>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>Rate</th>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>Amount</th>
                          <th style={{ padding: '6px 4px', textAlign: 'left' }}>Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(viewingBooking.items || []).map((it: any, idx: number) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #000' }}>
                            <td style={{ padding: '6px 4px', borderRight: '1px solid #000' }}>{it.style_no}</td>
                            <td style={{ padding: '6px 4px', borderRight: '1px solid #000' }}>{it.item_name}</td>
                            <td style={{ padding: '6px 4px', borderRight: '1px solid #000' }}>{it.item_desc}</td>
                            <td style={{ padding: '6px 4px', borderRight: '1px solid #000' }}>{it.garments_color}</td>
                            <td style={{ padding: '6px 4px', borderRight: '1px solid #000' }}>{it.item_color || it.garments_color}</td>
                            <td style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>{Math.round(it.final_wo_qty || 0)}</td>
                            <td style={{ padding: '6px 4px', borderRight: '1px solid #000' }}>{it.uom}</td>
                            <td style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>${parseFloat(it.rate || 0).toFixed(4)}</td>
                            <td style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>${parseFloat(it.amount || 0).toFixed(2)}</td>
                            <td style={{ padding: '6px 4px' }}>{it.remarks || ''}</td>
                          </tr>
                        ))}
                        <tr style={{ fontWeight: 'bold', borderBottom: '1px solid #000' }}>
                          <td colSpan={5} style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>Sub Total</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>{totalAcQty.toFixed(0)}</td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #000' }}></td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #000' }}></td>
                          <td style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>${totalWoAmt.toFixed(2)}</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>

                    <div style={{ margin: '15px 0' }}>
                      <div><strong>Total Booking Amount:</strong> ${totalWoAmt.toFixed(2)}</div>
                      <div style={{ marginTop: '5px' }}>
                        <strong>Total Booking Amount (in word):</strong> {translateToWordsLocal(totalWoAmt)}
                      </div>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                      <strong style={{ textDecoration: 'underline' }}>Terms and Conditions:</strong>
                      <ol style={{ paddingLeft: '20px', margin: '5px 0' }}>
                        <li>Earliest Delivery Date (EDD): {viewingBooking.inhouse_date || ''}</li>
                        <li>Latest Delivery Date (EDD): {viewingBooking.delivery_date || ''}</li>
                        <li>Partial Shipment : Not Allowed</li>
                        <li>Allowance of the Qty :</li>
                        <li>Required Certifications :</li>
                        <li>Tests Requirement :</li>
                        <li>Supplier's Challan must have PN's ERP booking number with buyer, style, PO, Color; Otherwise goods will not be received.</li>
                        <li>Delivery must be within working hour & not on holiday</li>
                        <li>Claims Policies : 5%, 10%, 15% claims will be imposed on LC values if delivery is delayed 1-7 days, 8-13 days, 14-21 days consequently</li>
                        <li>Others (If Any) :</li>
                        <li>Multi shipment not allow</li>
                      </ol>
                    </div>
                  </div>
                )}

                {/* 2nd View Copy details */}
                {viewTab === '2nd' && (
                  <div>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                      <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '2px 0', fontFamily: 'Arial Black, sans-serif' }}>{viewingBooking.company || 'Demo Factory Ltd.'}</h2>
                      <h3 style={{ fontSize: '1.25rem', margin: '2px 0', fontWeight: 'bold' }}>{viewingBooking.unit || 'Demo Unit'}</h3>
                      <p style={{ margin: '2px 0', color: '#0f172a', fontSize: '0.85rem' }}>Ashulia, Dhaka</p>
                      <div style={{ border: '1px solid #0f172a', padding: '6px', fontWeight: 'bold', display: 'inline-block', marginTop: '10px', textTransform: 'uppercase' }}>
                        Routing Sheet Copy - Store & Production (2nd)
                      </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', marginBottom: '15px' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '8px', borderRight: '1px solid #cbd5e1', width: '50%' }}>
                            <strong>PO No:</strong> {firstItem.po_no}
                          </td>
                          <td style={{ padding: '8px' }}>
                            <strong>Buyer Code:</strong> {firstItem.buyer}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px', borderRight: '1px solid #cbd5e1' }}>
                            <strong>Attention Merchant:</strong> {viewingBooking.attention || 'N/A'}
                          </td>
                          <td style={{ padding: '8px' }}>
                            <strong>Internal Reference ID:</strong> {viewingBooking.booking_reference}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '20px' }}>
                      <thead>
                        <tr style={{ background: '#fff', borderBottom: '1px solid #000', fontWeight: 'bold' }}>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'left' }}>PO No</th>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'left' }}>Garments Item</th>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'left' }}>Garments Color</th>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'left' }}>Item Color</th>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>Gmts. Qty</th>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'left' }}>UOM</th>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>Work Order T. Qty</th>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'left' }}>Certification</th>
                          <th style={{ padding: '6px 4px', textAlign: 'left' }}>Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(viewingBooking.items || []).map((it: any, idx: number) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #000' }}>
                            <td style={{ padding: '6px 4px', borderRight: '1px solid #000' }}>{it.po_no}</td>
                            <td style={{ padding: '6px 4px', borderRight: '1px solid #000' }}>{it.garments_item}</td>
                            <td style={{ padding: '6px 4px', borderRight: '1px solid #000' }}>{it.garments_color}</td>
                            <td style={{ padding: '6px 4px', borderRight: '1px solid #000' }}>{it.item_color || it.garments_color}</td>
                            <td style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>{it.rmg_quantity || it.garments_qty}</td>
                            <td style={{ padding: '6px 4px', borderRight: '1px solid #000' }}>{it.uom}</td>
                            <td style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>{Math.round(it.final_wo_qty || 0)}</td>
                            <td style={{ padding: '6px 4px', borderRight: '1px solid #000' }}>{it.garments_cert || 'Oeko-Tex 100'}</td>
                            <td style={{ padding: '6px 4px' }}>{it.remarks || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 3rd View Copy details */}
                {viewTab === '3rd' && (
                  <div>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                      <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '2px 0', fontFamily: 'Arial Black, sans-serif' }}>{viewingBooking.company || 'Demo Factory Ltd.'}</h2>
                      <h3 style={{ fontSize: '1.25rem', margin: '2px 0', fontWeight: 'bold' }}>{viewingBooking.unit || 'Demo Unit'}</h3>
                      <p style={{ margin: '2px 0', color: '#0f172a', fontSize: '0.85rem' }}>Ashulia, Dhaka</p>
                      <div style={{ border: '1px solid #0f172a', padding: '6px', fontWeight: 'bold', display: 'inline-block', marginTop: '10px', textTransform: 'uppercase' }}>
                        Costing & Accounts Reconciliation Sheet (3rd)
                      </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', marginBottom: '15px' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '8px', borderRight: '1px solid #cbd5e1', width: '50%' }}>
                            <strong>Booking Ref:</strong> {viewingBooking.booking_reference}
                          </td>
                          <td style={{ padding: '8px' }}>
                            <strong>Approval Status:</strong> {viewingBooking.status}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px', borderRight: '1px solid #cbd5e1' }}>
                            <strong>Approved By:</strong> {viewingBooking.approved_by || 'N/A'}
                          </td>
                          <td style={{ padding: '8px' }}>
                            <strong>Approved Time:</strong> {viewingBooking.approval_date_time ? new Date(viewingBooking.approval_date_time).toLocaleString() : 'N/A'}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '20px' }}>
                      <thead>
                        <tr style={{ background: '#fff', borderBottom: '1px solid #000', fontWeight: 'bold' }}>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'left' }}>Buyer</th>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'left' }}>Style</th>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'left' }}>Item</th>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'left' }}>UOM</th>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>Qty (Quotation)</th>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>Qty (Budget)</th>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>Qty (Booking)</th>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>Deviation %</th>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>Rate</th>
                          <th style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>Amount</th>
                          <th style={{ padding: '6px 4px', textAlign: 'left' }}>Approval Body Feedback</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(viewingBooking.items || []).map((it: any, idx: number) => {
                          const qtyQuotation = Math.round(it.required_qty * 0.95);
                          const deviationAmt = it.work_order_qty - qtyQuotation;
                          const deviationPct = qtyQuotation > 0 ? ((deviationAmt / qtyQuotation) * 100).toFixed(1) + "%" : "0%";

                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid #000' }}>
                              <td style={{ padding: '6px 4px', borderRight: '1px solid #000' }}>{it.buyer}</td>
                              <td style={{ padding: '6px 4px', borderRight: '1px solid #000' }}>{it.style_no}</td>
                              <td style={{ padding: '6px 4px', borderRight: '1px solid #000' }}>{it.item_name}</td>
                              <td style={{ padding: '6px 4px', borderRight: '1px solid #000' }}>{it.uom}</td>
                              <td style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>{qtyQuotation}</td>
                              <td style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>{it.required_qty}</td>
                              <td style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>{it.work_order_qty}</td>
                              <td style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right', color: deviationAmt > 0 ? 'red' : 'green', fontWeight: 'bold' }}>{deviationPct}</td>
                              <td style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>${parseFloat(it.rate).toFixed(4)}</td>
                              <td style={{ padding: '6px 4px', borderRight: '1px solid #000', textAlign: 'right' }}>${parseFloat(it.amount || 0).toFixed(2)}</td>
                              <td style={{ padding: '6px 4px' }}>{viewingBooking.feedback_by_approval_body || 'No feedback yet.'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="mt-20 text-right" style={{ padding: '15px 25px', borderTop: '1px solid var(--border-muted)' }}>
                <button className="btn btn-secondary" onClick={() => setViewingBooking(null)}>Close View</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* EDIT MODAL FOR BOOKING HEADER */}
      {editingBooking && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px', width: '100%' }}>
            <div className="modal-header">
              <h3>Edit Trims Booking Header Details</h3>
              <XCircle className="modal-close" onClick={() => setEditingBooking(null)} />
            </div>
            <form onSubmit={handleSaveEdit} style={{ padding: '15px' }}>
              <div className="form-group">
                <label className="form-label">Supplier Name</label>
                <input type="text" className="form-control" value={editSupplier} onChange={e => setEditSupplier(e.target.value)} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Delivery Date</label>
                  <input type="date" className="form-control" value={editDeliveryDate} onChange={e => setEditDeliveryDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Inhouse Date</label>
                  <input type="date" className="form-control" value={editInhouseDate} onChange={e => setEditInhouseDate(e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Payment Mode</label>
                  <select className="form-control" value={editPayMode} onChange={e => setEditPayMode(e.target.value)}>
                    <option value="Credit">Credit</option>
                    <option value="Import">Import</option>
                    <option value="In House">In House</option>
                    <option value="Within Group">Within Group</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Source</label>
                  <select className="form-control" value={editSource} onChange={e => setEditSource(e.target.value)}>
                    <option value="Abroad/Import">Abroad/Import</option>
                    <option value="Epz">Epz</option>
                    <option value="Non-Epz/Local">Non-Epz/Local</option>
                    <option value="In House/Inventory">In House/Inventory</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Attention</label>
                <input type="text" className="form-control" value={editAttention} onChange={e => setEditAttention(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Remarks</label>
                <input type="text" className="form-control" value={editRemarks} onChange={e => setEditRemarks(e.target.value)} />
              </div>
              <div className="mt-20 text-right">
                <button type="button" className="btn btn-secondary mr-10" style={{ marginRight: '10px' }} onClick={() => setEditingBooking(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Save size={16} /> Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPROVAL FEEDBACK DIALOG MODAL */}
      {showFeedbackModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px', width: '100%' }}>
            <div className="modal-header">
              <h3>{actionType} Decision & Feedback</h3>
              <XCircle className="modal-close" onClick={() => setShowFeedbackModal(false)} />
            </div>
            <div style={{ padding: '15px' }}>
              <div className="form-group">
                <label className="form-label">Approver Name / Body *</label>
                <input
                  type="text"
                  className="form-control"
                  value={approverName}
                  onChange={e => setApproverName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Feedback Comments / Justification</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder={actionType === 'Approved' ? 'Enter reason for approval...' : 'Enter reason for rejection...'}
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                />
              </div>
              <div className="mt-20 text-right">
                <button type="button" className="btn btn-secondary mr-10" style={{ marginRight: '10px' }} onClick={() => setShowFeedbackModal(false)}>Cancel</button>
                <button type="button" className="btn btn-success" onClick={handleSaveApproval}>
                  <Save size={16} /> Save Decision
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================================================
// SUB-VIEW: Login & Sign Up Portal (Premium Glassmorphism Style)
// ==========================================================================
function LoginSignupView({ onLoginSuccess }: { onLoginSuccess: (user: any) => void }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('merchandiser');
  const [company, setCompany] = useState('Metamorphosis Ltd.');
  const [unit, setUnit] = useState('Demo Unit');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const url = isSignUp ? `${API_BASE}/auth/signup` : `${API_BASE}/auth/login`;
    const payload = isSignUp
      ? { username, password, email, role, company, unit }
      : { username, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data.error || 'Authentication failed. Please try again.');
      }
    } catch (e) {
      setErrorMsg('Network error. Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 10% 20%, rgb(15, 23, 42) 0%, rgb(30, 41, 59) 90.1%)',
      fontFamily: 'Outfit, Inter, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '450px',
        padding: '40px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        color: '#f8fafc',
        transition: 'all 0.3s ease'
      }}>
        {/* Logo / Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#fff',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
            marginBottom: '15px'
          }}>
            M
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '0.05em', margin: '5px 0' }}>MerchTrack</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '2px 0' }}>Enterprise Garments Merchandising ERP</p>
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px', textAlign: 'center', color: '#e2e8f0' }}>
          {isSignUp ? 'Create New Account' : 'Sign In to Your Workspace'}
        </h3>

        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '10px 14px',
            color: '#fca5a5',
            fontSize: '0.85rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontWeight: 'bold' }}>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '6px' }}>Username *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                padding: '10px 14px',
                borderRadius: '8px'
              }}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '6px' }}>Password *</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                padding: '10px 14px',
                borderRadius: '8px'
              }}
            />
          </div>

          {isSignUp && (
            <>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '6px' }}>Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    padding: '10px 14px',
                    borderRadius: '8px'
                  }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '6px' }}>Role *</label>
                <select
                  className="form-control"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    padding: '10px 14px',
                    borderRadius: '8px'
                  }}
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="production_manager">Production Manager</option>
                  <option value="merchandiser">Merchandiser</option>
                  <option value="merchandiser_manager">Merchandiser Manager</option>
                  <option value="store_manager">Store Manager</option>
                  <option value="others">Others</option>
                </select>
              </div>

              <div className="form-row" style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0, flex: 1 }}>
                  <label className="form-label" style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '6px' }}>Company</label>
                  <input
                    type="text"
                    className="form-control"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      padding: '10px 14px',
                      borderRadius: '8px'
                    }}
                  />
                </div>
                <div className="form-group" style={{ margin: 0, flex: 1 }}>
                  <label className="form-label" style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '6px' }}>Unit Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      padding: '10px 14px',
                      borderRadius: '8px'
                    }}
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn"
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: '#fff',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '0.85rem', color: '#94a3b8' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#818cf8',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline'
            }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

        {!isSignUp && (
          <div style={{
            marginTop: '25px',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '0.75rem',
            color: '#a5b4fc',
            lineHeight: '1.4'
          }}>
            <strong>Demo Accounts Available:</strong>
            <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>• <strong>admin / admin</strong> (Super Admin)</div>
              <div>• <strong>production_manager / production_manager</strong> (Production Manager)</div>
              <div>• <strong>merchandiser / merchandiser</strong> (Merchandiser)</div>
              <div>• <strong>store_manager / store_manager</strong> (Store Manager)</div>
              <div>• <strong>user / user</strong> (Others)</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================================================
// SUB-VIEW: User Management & Access Control Panel
// ==========================================================================
function UserManagementView({ currentUser, rolePermissions, userPermissions, fetchPermissions }: { currentUser: any, rolePermissions: any[], userPermissions: any[], fetchPermissions: () => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Form fields (Step 1)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');

  // Form fields (Step 2)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('merchandiser');
  const [email, setEmail] = useState('');

  // Right column state
  const [configTargetType, setConfigTargetType] = useState<'role' | 'user'>('role');
  const [selectedRoleForPerms, setSelectedRoleForPerms] = useState('merchandiser');
  const [selectedUserForPerms, setSelectedUserForPerms] = useState('');
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [showPermsConfig, setShowPermsConfig] = useState(false);

  const availablePages = [
    { key: 'dashboard', label: 'Dashboard Overview' },
    { key: 'crm', label: 'Sales Target (CRM)' },
    { key: 'crm_mis', label: 'CRM MIS Report' },
    { key: 'inquiry', label: 'Quotation Inquiry' },
    { key: 'quotation_approval', label: 'Quotation Approval Console' },
    { key: 'costing', label: 'Price Costing Engine' },
    { key: 'order', label: 'Order Entry & POs' },
    { key: 'order_approval', label: 'Order Approval Console' },
    { key: 'ta_progress', label: 'T&A Progress Report' },
    { key: 'budget', label: 'Cost Budget & control' },
    { key: 'budget_approval', label: 'Budget Approval Console' },
    { key: 'fabric', label: 'Fabric Booking' },
    { key: 'fabric_approval', label: 'Fabric Booking Approval' },
    { key: 'trims', label: 'Trims Booking' },
    { key: 'trims_approval', label: 'Trims Approval' }
  ];

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/users`);
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      console.error("Error fetching users", e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Pre-select first user when users list loads
  useEffect(() => {
    if (users.length > 0 && !selectedUserForPerms) {
      setSelectedUserForPerms(users[0].username);
    }
  }, [users]);

  // Update selected checkboxes when the role or user selection changes
  useEffect(() => {
    if (configTargetType === 'role') {
      const perm = rolePermissions.find(p => p.role === selectedRoleForPerms);
      if (perm) {
        try {
          const allowed = JSON.parse(perm.allowed_pages);
          setSelectedPages(Array.isArray(allowed) ? allowed : []);
        } catch (e) {
          setSelectedPages([]);
        }
      } else {
        setSelectedPages([]);
      }
    } else {
      // User-specific permissions override
      const userPerm = userPermissions.find(p => p.username === selectedUserForPerms);
      if (userPerm) {
        try {
          const allowed = JSON.parse(userPerm.allowed_pages);
          setSelectedPages(Array.isArray(allowed) ? allowed : []);
        } catch (e) {
          setSelectedPages([]);
        }
      } else {
        // Fall back to the role-based permissions of this user
        const userObj = users.find(u => u.username === selectedUserForPerms);
        if (userObj) {
          const rolePerm = rolePermissions.find(p => p.role === userObj.role);
          if (rolePerm) {
            try {
              const allowed = JSON.parse(rolePerm.allowed_pages);
              setSelectedPages(Array.isArray(allowed) ? allowed : []);
            } catch (e) {
              setSelectedPages([]);
            }
          } else {
            setSelectedPages([]);
          }
        } else {
          setSelectedPages([]);
        }
      }
    }
  }, [configTargetType, selectedRoleForPerms, selectedUserForPerms, rolePermissions, userPermissions, users]);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return alert("Username is required");
    if (!editingUser && !password) return alert("Password is required for new user");

    // Automatically determine final email/phone mapping
    let finalEmail = email;
    let finalPhone = '';

    if (phoneOrEmail.includes('@')) {
      if (!finalEmail) finalEmail = phoneOrEmail;
    } else {
      finalPhone = phoneOrEmail;
    }

    const url = editingUser ? `${API_BASE}/users/${editingUser.id}` : `${API_BASE}/users`;
    const method = editingUser ? 'PUT' : 'POST';
    const payload = {
      username,
      role,
      email: finalEmail || null,
      first_name: firstName || null,
      last_name: lastName || null,
      dob: dob || null,
      phone: finalPhone || null,
      ...(password ? { password } : {}) // Only send password if provided
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        alert(editingUser ? "User updated successfully!" : "User created successfully!");
        setFirstName('');
        setLastName('');
        setDob('');
        setPhoneOrEmail('');
        setUsername('');
        setPassword('');
        setRole('merchandiser');
        setEmail('');
        setEditingUser(null);
        setShowUserModal(false);
        fetchUsers();
      } else {
        alert(data.error || "Failed to save user");
      }
    } catch (e) {
      alert("Error connecting to server");
    }
  };

  const handleEditClick = (u: any) => {
    setEditingUser(u);
    setFirstName(u.first_name || '');
    setLastName(u.last_name || '');
    setDob(u.dob || '');
    setPhoneOrEmail(u.phone || u.email || '');
    setUsername(u.username);
    setPassword(''); // Leave password blank unless updating
    setRole(u.role);
    setEmail(u.email || '');
    setWizardStep(1);
    setShowUserModal(true);
  };

  const handleDeleteClick = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        alert("User deleted successfully!");
        fetchUsers();
      } else {
        alert("Failed to delete user");
      }
    } catch (e) {
      alert("Error connecting to server");
    }
  };

  const handleToggleDisable = async (u: any) => {
    const newDisabled = u.disabled == 1 ? 0 : 1;

    try {
      const res = await fetch(`${API_BASE}/users/${u.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disabled: newDisabled })
      });
      if (res.ok) {
        fetchUsers();
      } else {
        console.error("Failed to toggle user status");
      }
    } catch (e) {
      console.error("Error connecting to server", e);
    }
  };

  const handleCheckboxChange = (pageKey: string) => {
    setSelectedPages(prev =>
      prev.includes(pageKey) ? prev.filter(p => p !== pageKey) : [...prev, pageKey]
    );
  };

  const handleSavePermissions = async () => {
    try {
      if (configTargetType === 'role') {
        const res = await fetch(`${API_BASE}/role-permissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: selectedRoleForPerms,
            allowed_pages: selectedPages
          })
        });
        if (res.ok) {
          alert("Role access permissions saved successfully!");
          fetchPermissions();
        } else {
          alert("Failed to save role permissions");
        }
      } else {
        if (!selectedUserForPerms) return alert("Select a username to configure override permissions");
        const res = await fetch(`${API_BASE}/user-permissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: selectedUserForPerms,
            allowed_pages: selectedPages
          })
        });
        if (res.ok) {
          alert(`Override permissions for user "${selectedUserForPerms}" saved successfully!`);
          fetchPermissions();
        } else {
          alert("Failed to save user permissions");
        }
      }
    } catch (e) {
      alert("Error connecting to server");
    }
  };

  const handleResetUserPermissions = async () => {
    if (!selectedUserForPerms) return;
    if (!window.confirm(`Are you sure you want to remove the override for "${selectedUserForPerms}" and reset to role defaults?`)) return;

    try {
      const res = await fetch(`${API_BASE}/user-permissions/${selectedUserForPerms}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert(`Override permissions for user "${selectedUserForPerms}" reset successfully!`);
        fetchPermissions();
      } else {
        alert("Failed to reset user permissions");
      }
    } catch (e) {
      alert("Error connecting to server");
    }
  };

  const proceedToStep2 = () => {
    if (!firstName) return alert("First name is required");
    if (!lastName) return alert("Last name is required");
    if (!phoneOrEmail) return alert("Phone or Email is required");

    // Autofill email in Step 2 if user entered email in Step 1
    if (phoneOrEmail.includes('@') && !email) {
      setEmail(phoneOrEmail);
    }
    setWizardStep(2);
  };

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', padding: '24px' }}>
        {/* LEFT COLUMN: User Management */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Existing Users Table Card */}
          <div className="dashboard-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} /> System Users List
              </h3>
              <button
                type="button"
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.85rem' }}
                onClick={() => {
                  setEditingUser(null);
                  setFirstName('');
                  setLastName('');
                  setDob('');
                  setPhoneOrEmail('');
                  setUsername('');
                  setPassword('');
                  setRole('merchandiser');
                  setEmail('');
                  setWizardStep(1);
                  setShowUserModal(true);
                }}
              >
                <Plus size={16} /> Create New User
              </button>
            </div>

            <div className="table-wrapper" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="data-table" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Full Name</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{
                      opacity: u.disabled === 1 ? 0.55 : 1,
                      backgroundColor: u.disabled === 1 ? 'rgba(239, 68, 68, 0.03)' : 'transparent',
                      transition: 'all 0.2s ease'
                    }}>
                      <td style={{
                        fontWeight: 600,
                        textDecoration: u.disabled === 1 ? 'line-through' : 'none',
                        color: u.disabled === 1 ? 'var(--text-muted)' : 'inherit'
                      }}>
                        {u.disabled === 1 && <Lock size={12} style={{ color: '#f43f5e', marginRight: '6px', verticalAlign: 'middle', display: 'inline-block' }} />}
                        <span style={{ verticalAlign: 'middle' }}>{u.username}</span>
                      </td>
                      <td style={{ textDecoration: u.disabled === 1 ? 'line-through' : 'none', color: u.disabled === 1 ? 'var(--text-muted)' : 'inherit' }}>
                        {u.first_name ? `${u.first_name} ${u.last_name || ''}` : 'N/A'}
                      </td>
                      <td>
                        <span className="badge badge-confirm" style={{ opacity: u.disabled === 1 ? 0.6 : 1 }}>
                          {u.role.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.disabled === 1 ? 'badge-pending' : 'badge-active'}`} style={{
                          background: u.disabled === 1 ? 'rgba(239, 68, 68, 0.2)' : undefined,
                          color: u.disabled === 1 ? '#f87171' : undefined,
                          border: u.disabled === 1 ? '1px solid rgba(239, 68, 68, 0.3)' : undefined
                        }}>
                          {u.disabled === 1 ? 'Disabled' : 'Active'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button type="button" className="btn btn-secondary btn-xs" style={{ padding: '4px 6px' }} title="Edit User" onClick={() => handleEditClick(u)}>
                            <Edit size={12} />
                          </button>
                          <button type="button" className="btn btn-secondary btn-xs" style={{ padding: '4px 6px', color: u.disabled === 1 ? '#22c55e' : '#f43f5e' }} title={u.disabled === 1 ? "Enable User" : "Disable User"} onClick={() => handleToggleDisable(u)}>
                            <Power size={12} />
                          </button>
                          <button type="button" className="btn btn-danger btn-xs" style={{ padding: '4px 6px' }} title="Delete User" onClick={() => handleDeleteClick(u.id)}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Page Access Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="dashboard-card" style={{ padding: '20px', minHeight: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary)' }}>
                <Shield size={20} /> Access Control Rules
              </h3>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--secondary-gradient)', color: '#fff', border: 'none' }}
                onClick={() => setShowPermsConfig(!showPermsConfig)}
              >
                <Plus size={16} /> + List of User
              </button>
            </div>

            {showPermsConfig ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Tabs to switch between Role and Username config */}
                <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-muted)', paddingBottom: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-xs"
                    style={{
                      background: configTargetType === 'role' ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                    onClick={() => setConfigTargetType('role')}
                  >
                    Role-based Rules
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs"
                    style={{
                      background: configTargetType === 'user' ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                    onClick={() => setConfigTargetType('user')}
                  >
                    User-specific Override
                  </button>
                </div>

                {configTargetType === 'role' ? (
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Select Role to Configure Permissions</label>
                    <select
                      className="form-control"
                      value={selectedRoleForPerms}
                      onChange={e => setSelectedRoleForPerms(e.target.value)}
                      style={{ fontWeight: 600 }}
                    >
                      <option value="production_manager">Production Manager</option>
                      <option value="merchandiser">Merchandiser</option>
                      <option value="merchandiser_manager">Merchandiser Manager</option>
                      <option value="store_manager">Store Manager</option>
                      <option value="others">Others (General User)</option>
                    </select>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>Select Username to Override Permissions</label>
                      <select
                        className="form-control"
                        value={selectedUserForPerms}
                        onChange={e => setSelectedUserForPerms(e.target.value)}
                        style={{ fontWeight: 600 }}
                      >
                        {users.map(u => (
                          <option key={u.id} value={u.username}>
                            {u.username} ({u.role.replace('_', ' ').toUpperCase()})
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Indicate whether they have an override or are using fallback */}
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '30px' }}>
                      <span>
                        Status: {userPermissions.some(p => p.username === selectedUserForPerms) ? (
                          <span style={{ color: 'var(--warning)', fontWeight: 600 }}>Custom Override Active</span>
                        ) : (
                          <span style={{ color: 'var(--success)' }}>Inheriting Role Defaults</span>
                        )}
                      </span>
                      {userPermissions.some(p => p.username === selectedUserForPerms) && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs"
                          style={{ padding: '2px 8px', fontSize: '0.7rem', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.3)', minWidth: 'auto' }}
                          onClick={handleResetUserPermissions}
                        >
                          Reset Override
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-muted)', borderRadius: '8px', padding: '16px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-main)' }}>
                    Page Level Access Checkboxes
                  </h4>
                  <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '10px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-muted)' }}>
                          <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Page Name</th>
                          <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600, width: '120px' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {availablePages.map(page => (
                          <tr key={page.key} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '8px 12px' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', margin: 0, userSelect: 'none' }}>
                                <input
                                  type="checkbox"
                                  checked={selectedPages.includes(page.key)}
                                  onChange={() => handleCheckboxChange(page.key)}
                                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                />
                                <span style={{ fontWeight: 500, color: '#f1f5f9' }}>{page.label}</span>
                              </label>
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                              <button
                                type="button"
                                className={`btn btn-xs ${selectedPages.includes(page.key) ? 'btn-primary' : 'btn-secondary'}`}
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '0.75rem',
                                  borderRadius: '6px',
                                  minWidth: '80px',
                                  background: selectedPages.includes(page.key) ? 'rgba(99, 102, 241, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                  color: selectedPages.includes(page.key) ? '#818cf8' : '#f87171',
                                  border: selectedPages.includes(page.key) ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                                  cursor: 'pointer',
                                  fontWeight: 600
                                }}
                                onClick={() => handleCheckboxChange(page.key)}
                              >
                                {selectedPages.includes(page.key) ? 'Enabled' : 'Disabled'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <button type="button" className="btn btn-primary" style={{ display: 'flex', justifySelf: 'flex-start', padding: '10px 20px' }} onClick={handleSavePermissions}>
                  Save Allowed Pages Configuration
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: 'var(--text-muted)', textAlign: 'center' }}>
                <Shield size={48} style={{ opacity: 0.3, marginBottom: '15px' }} />
                <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>
                  Click **"+ List of User"** to setup custom page access control rules for different roles.
                </p>
                <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                  By default, roles will fall back to their standard system access privileges unless configured.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* POPUP MODAL FOR NEW / EDIT USER ACCOUNT WIZARD */}
      {showUserModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000
        }}>
          <div style={{
            width: '90%',
            maxWidth: '500px',
            padding: '30px',
            background: '#1e293b',
            color: '#ffffff',
            border: '2px solid #6366f1',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            borderRadius: '12px',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#818cf8', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <User size={22} /> {editingUser ? `Edit User: ${editingUser.username}` : 'Add New Employee Account'}
              </h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ minWidth: 'auto', padding: '6px 10px', color: '#fff', border: '1px solid #475569' }}
                onClick={() => setShowUserModal(false)}
              >
                <XCircle size={18} />
              </button>
            </div>

            {/* Step Indicators */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', padding: '0 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: wizardStep === 1 ? '#6366f1' : '#1e293b',
                  border: '2px solid #6366f1',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}>1</span>
                <span style={{ fontSize: '0.8rem', fontWeight: wizardStep === 1 ? 600 : 400, color: wizardStep === 1 ? '#fff' : '#94a3b8' }}>Profile Info</span>
              </div>
              <div style={{ flex: 1, height: '2px', background: '#475569', margin: '0 15px' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: wizardStep === 2 ? '#6366f1' : '#1e293b',
                  border: '2px solid #6366f1',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}>2</span>
                <span style={{ fontSize: '0.8rem', fontWeight: wizardStep === 2 ? 600 : 400, color: wizardStep === 2 ? '#fff' : '#94a3b8' }}>Credentials</span>
              </div>
            </div>

            {/* STEP 1: Profile Information */}
            {wizardStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, color: '#e2e8f0' }}>First Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter first name"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required
                    style={{ color: '#ffffff', background: '#0f172a', border: '1px solid #475569' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, color: '#e2e8f0' }}>Last Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter last name"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    required
                    style={{ color: '#ffffff', background: '#0f172a', border: '1px solid #475569' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, color: '#e2e8f0' }}>Date of Birth</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    style={{ color: '#ffffff', background: '#0f172a', border: '1px solid #475569' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, color: '#e2e8f0' }}>Phone or Email *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter phone number or email address"
                    value={phoneOrEmail}
                    onChange={e => setPhoneOrEmail(e.target.value)}
                    required
                    style={{ color: '#ffffff', background: '#0f172a', border: '1px solid #475569' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={proceedToStep2}>
                    Next Step
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1, color: '#fff', border: '1px solid #475569' }}
                    onClick={() => setShowUserModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Credentials and Role */}
            {wizardStep === 2 && (
              <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, color: '#e2e8f0' }}>Username *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    style={{ color: '#ffffff', background: '#0f172a', border: '1px solid #475569' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, color: '#e2e8f0' }}>
                    Password {editingUser ? '(leave blank to keep current)' : '*'}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={editingUser ? "••••••••" : "Enter password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required={!editingUser}
                    style={{ color: '#ffffff', background: '#0f172a', border: '1px solid #475569' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, color: '#e2e8f0' }}>Role *</label>
                  <select className="form-control" value={role} onChange={e => setRole(e.target.value)} style={{ color: '#ffffff', background: '#0f172a', border: '1px solid #475569' }}>
                    <option value="super_admin" style={{ background: '#1e293b' }}>Super Admin</option>
                    <option value="production_manager" style={{ background: '#1e293b' }}>Production Manager</option>
                    <option value="merchandiser" style={{ background: '#1e293b' }}>Merchandiser</option>
                    <option value="merchandiser_manager" style={{ background: '#1e293b' }}>Merchandiser Manager</option>
                    <option value="store_manager" style={{ background: '#1e293b' }}>Store Manager</option>
                    <option value="others" style={{ background: '#1e293b' }}>Others</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, color: '#e2e8f0' }}>Email Address (optional)</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="employee@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ color: '#ffffff', background: '#0f172a', border: '1px solid #475569' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1, color: '#fff', border: '1px solid #475569' }} onClick={() => setWizardStep(1)}>
                    Back
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Save User Account
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

