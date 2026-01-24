import React, { useState } from 'react';
import logoImage from '../assets/logo.png';
import { useNotifications } from '../hooks/useApi';
import { NotificationService } from '../services/apiService';
import { 
  LayoutDashboard, 
  Store, 
  Package, 
  Layers, 
  Users, 
  CreditCard, 
  ShoppingCart, 
  Truck, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Search, 
  Bell, 
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Plus,
  Maximize2
} from 'lucide-react';

interface StockiveDashboardProps {
  user: any;
  onLogout: () => void;
  currentView: string;
  onViewChange: (view: any) => void;
  children?: React.ReactNode;
  products?: any[];
  supermarkets?: any[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const StockiveDashboard: React.FC<StockiveDashboardProps> = ({ 
  user, 
  onLogout, 
  currentView, 
  onViewChange,
  children,
  products = [],
  supermarkets = [],
  searchQuery = '',
  onSearchChange
}) => {
  const { data: notifications = [], refetch: refetchNotifications } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n: any) => !n.is_read).length : 0;

  const handleMarkAsRead = async (id: string | number) => {
    try {
      await NotificationService.markAsRead(id);
      refetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      refetchNotifications();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Calculate real stats
  const totalProducts = products.length;
  const availableStock = products.filter(p => p.quantity > 0).length;
  const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= (p.minStockLevel || 5)).length;
  const outOfStock = products.filter(p => p.quantity <= 0).length;

  // Calculate total value/profit (mock profit for demo)
  const totalValue = products.reduce((sum, p) => sum + (Number(p.price || 0) * Number(p.quantity || 0)), 0);
  
  const navGroups = [
    {
      title: 'Discover',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'stores', label: 'My Stores', icon: <Store size={18} /> },
      ]
    },
    {
      title: 'Inventory',
      items: [
        { id: 'catalog', label: 'Products', icon: <Package size={18} /> },
        { id: 'add-product', label: 'Add Product', icon: <Plus size={18} /> },
        { id: 'orders', label: 'Orders', icon: <ShoppingCart size={18} /> },
        { id: 'multi-channel-orders', label: 'Multi-Channel', icon: <Layers size={18} /> },
        { id: 'clearance', label: 'Clearance', icon: <MoreHorizontal size={18} /> },
      ]
    },
    {
      title: 'Tools',
      items: [
        { id: 'barcode-demo', label: 'Barcodes', icon: <CreditCard size={18} /> },
        { id: 'scanner', label: 'Scanner', icon: <Maximize2 size={18} /> },
        { id: 'pos-sync', label: 'POS Sync', icon: <Truck size={18} /> },
        { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
        { id: 'suppliers', label: 'Suppliers', icon: <Users size={18} /> },
      ]
    },
    {
      title: 'Settings',
      items: [
        { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
        { id: 'help', label: 'Help', icon: <HelpCircle size={18} /> },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#1E293B] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 text-[#1E293B] flex flex-col shrink-0">
        <div className="p-8 flex items-center gap-4">
          <img src={logoImage} alt="Stockive Logo" className="w-12 h-12 object-contain" />
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">Stockive</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar pb-8">
          {navGroups.map((group, gIdx) => (
            <React.Fragment key={gIdx}>
              {gIdx > 0 && <div className="mx-4 my-6 h-px bg-slate-100" />}
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold px-4 mb-3">
                  {group.title}
                </p>
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                      currentView === item.id 
                        ? 'bg-[#B7F000] text-black font-bold shadow-[0_4px_12px_rgba(183,240,0,0.2)]' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span className={currentView === item.id ? 'text-black' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </React.Fragment>
          ))}

          <div className="pt-4 border-t border-slate-100">
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all text-red-500 hover:bg-red-50 font-semibold"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md flex items-center justify-between px-10 shrink-0 z-20 border-b border-slate-200">
          <div className="flex flex-col">
            <h1 className="text-2xl font-extrabold tracking-tight capitalize text-slate-900">
              {currentView.replace(/-/g, ' ')}
            </h1>
          </div>

          <div className="flex items-center gap-8">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-[#B7F000]" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                className="pl-12 pr-6 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm w-72 focus:outline-none focus:ring-2 focus:ring-[#B7F000]/50 transition-all focus:bg-white text-slate-900"
              />
            </div>
            
            <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold leading-none text-slate-900">{user?.first_name ? `${user.first_name} ${user.last_name || ''}` : (user?.name || 'Authorized User')}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{user?.subscription?.plan || 'Professional'} Account</p>
                </div>
                <div className="relative">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Stockive'}`} 
                    alt="Avatar" 
                    className="w-10 h-10 rounded-full border border-slate-200 p-0.5 bg-white shadow-sm"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#B7F000] border-2 border-white rounded-full"></div>
                </div>
                <ChevronDown size={16} className="text-slate-400 cursor-pointer" />
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors ${showNotifications ? 'bg-slate-100 text-[#B7F000]' : ''}`}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                      <h3 className="font-bold text-sm">Notifications</h3>
                      <span className="text-[10px] bg-[#B7F000]/20 text-[#6B8C00] px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {(notifications && notifications.length > 0) ? (
                        notifications.map((n: any) => (
                          <div 
                            key={n.id} 
                            onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                            className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${!n.is_read ? 'bg-slate-50/50' : ''}`}
                          >
                            <div className="flex justify-between items-start">
                              <p className="text-xs font-bold text-slate-900">{n.title || 'Notification'}</p>
                              {!n.is_read && <span className="w-1.5 h-1.5 bg-[#B7F000] rounded-full"></span>}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">{n.message}</p>
                            <p className="text-[9px] text-slate-400 mt-2 uppercase font-bold">{new Date(n.created_at).toLocaleDateString()}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">All caught up!</p>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="w-full p-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-colors border-t border-slate-50"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar bg-[#F8FAFC]">
          {children ? children : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Inventory" value={totalProducts.toLocaleString()} trend="+6.53%" trendUp={true} />
                <StatCard label="Active Stock" value={availableStock.toLocaleString()} trend="-4.24%" trendUp={false} />
                <StatCard label="Threshold Alerts" value={lowStock.toLocaleString()} trend="+1.53%" trendUp={true} />
                <StatCard label="Depleted Assets" value={outOfStock.toLocaleString()} trend="-1.95%" trendUp={false} />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-1 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-lg text-slate-900">Asset Distribution</h3>
                    <button className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 border border-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-50">
                      This Year <ChevronDown size={12} />
                    </button>
                  </div>
                  <div className="relative h-56 flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full border-[20px] border-[#B7F000] flex items-center justify-center relative shadow-[0_8px_30px_rgba(183,240,0,0.15)]">
                      <div className="absolute inset-[-4px] rounded-full border-4 border-white"></div>
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Valuation</p>
                        <p className="text-xl font-black text-slate-900">${(totalValue / 1000).toFixed(1)}K</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 space-y-3">
                    <CategoryLegend color="#B7F000" label="Primary Assets" percentage="45%" value={`$${(totalValue * 0.45 / 1000).toFixed(1)}K`} />
                    <CategoryLegend color="#F1F5F9" label="Secondary" percentage="25%" value={`$${(totalValue * 0.25 / 1000).toFixed(1)}K`} />
                    <CategoryLegend color="#E2E8F0" label="Reserve" percentage="20%" value={`$${(totalValue * 0.20 / 1000).toFixed(1)}K`} />
                    <CategoryLegend color="#CBD5E1" label="Other" percentage="10%" value={`$${(totalValue * 0.10 / 1000).toFixed(1)}K`} />
                  </div>
                </div>

                <div className="xl:col-span-2 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">Fiscal Velocity</h3>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-black text-slate-900">${(totalValue / 50).toFixed(1)}K</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Avg. Daily sales</span>
                      </div>
                    </div>
                    <button className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 border border-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-50">
                      This Week <ChevronDown size={12} />
                    </button>
                  </div>
                  <div className="h-64 flex items-end gap-3 px-2">
                    {[40, 60, 45, 95, 65, 80, 55].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                        <div className="relative w-full flex-1">
                          <div 
                            style={{ height: `${h}%` }} 
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 bg-slate-100 rounded-t-full transition-all group-hover:bg-[#B7F000]"
                          >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#B7F000] border-[3px] border-white shadow-md scale-0 group-hover:scale-100 transition-transform" />
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter group-hover:text-slate-900 transition-colors">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>


              {/* Middle Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-lg text-slate-900">Stock Integrity</h3>
                    <button className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 border border-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-50">
                      Priority <ChevronDown size={12} />
                    </button>
                  </div>
                  <div className="space-y-8">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Available Items</p>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-black text-slate-900">{availableStock}</span>
                          <span className="text-sm text-slate-400 font-bold">/ {totalProducts}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${
                        availableStock > totalProducts / 2 ? 'bg-[#B7F000]/20 text-[#6B8C00]' : 'bg-red-50 text-red-500'
                      }`}>
                        {availableStock > totalProducts / 2 ? 'Optimal' : 'Critical'}
                      </span>
                    </div>
                    <div className="space-y-5 pt-4 border-t border-slate-100">
                      {products.slice(0, 4).map((p, i) => (
                        <StockItem 
                          key={p.id || i}
                          label={p.name} 
                          current={p.quantity} 
                          total={Math.max(p.quantity * 1.5, 50)} 
                        />
                      ))}
                      {products.length === 0 && (
                        <p className="text-center text-slate-400 text-sm py-4 uppercase tracking-widest font-bold">Registry Empty</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-lg text-slate-900">Registry Injection</h3>
                    <button className="text-[10px] font-bold text-[#B7F000] hover:underline uppercase tracking-widest" onClick={() => onViewChange('catalog')}>Full Matrix</button>
                  </div>
                  <div className="space-y-6">
                    {products.slice().reverse().slice(0, 5).map((p, i) => (
                      <RestockItem 
                        key={p.id || i}
                        name={p.name} 
                        qty={`${p.quantity} Units`} 
                        date={p.addedDate || 'Just now'} 
                        img={p.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${p.name}`} 
                      />
                    ))}
                    {products.length === 0 && (
                      <p className="text-center text-slate-400 text-sm py-4 uppercase tracking-widest font-bold">No Recent Activity</p>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-[#B7F000] p-8 rounded-[40px] shadow-[0_0_40px_rgba(183,240,0,0.15)] text-[#020617] relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer">
                    <div className="relative z-10">
                      <h3 className="font-black text-2xl mb-2 uppercase tracking-tighter">Protocol Entry</h3>
                      <p className="text-[#020617]/70 text-sm mb-6 font-bold uppercase tracking-tight">Initiate new asset injection sequence.</p>
                      <button 
                        onClick={() => onViewChange('add-product')}
                        className="bg-[#020617] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg flex items-center gap-2 hover:gap-4 transition-all"
                      >
                        Start Injection <Plus size={16} />
                      </button>
                    </div>
                    <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-[#020617]/5 rounded-full blur-2xl group-hover:bg-[#020617]/10 transition-colors"></div>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] shadow-sm hover:border-[#B7F000]/30 transition-all">
                    <h3 className="font-bold text-lg text-white mb-6">Security Protocol</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5">
                        <div className="w-10 h-10 rounded-xl bg-[#B7F000]/10 flex items-center justify-center">
                          <Layers className="text-[#B7F000] w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-white uppercase tracking-wider">Multi-Channel Sync</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Active & Encrypted</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5">
                        <div className="w-10 h-10 rounded-xl bg-[#B7F000]/10 flex items-center justify-center">
                          <Users className="text-[#B7F000] w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-white uppercase tracking-wider">Auth Status</p>
                          <p className="text-[10px] text-[#B7F000] font-bold uppercase tracking-widest mt-0.5">Verified Admin</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Card */}
              <div className="bg-white/5 rounded-[40px] border border-white/10 shadow-sm overflow-hidden mb-12">
                <div className="p-8 flex items-center justify-between border-b border-white/5">
                  <h3 className="font-bold text-xl text-white">Asset Matrix</h3>
                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 transition-colors group-focus-within:text-[#B7F000]" />
                      <input 
                        type="text" 
                        placeholder="Search matrix..." 
                        className="pl-12 pr-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#B7F000]/50 transition-all focus:bg-white/10 text-white"
                      />
                    </div>
                    <button onClick={() => onViewChange('add-product')} className="flex items-center gap-2 bg-[#B7F000] text-[#020617] px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider shadow-lg hover:scale-[1.02] transition-transform">
                      <Plus size={18} />
                      Inject Asset
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/5">
                        <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Index</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Asset Details</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Serial</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Valuation</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Quantity</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {products.slice(0, 5).map((p, idx) => (
                        <ProductRow 
                          key={p.id || idx}
                          index={idx + 1}
                          id={p.id?.substring(0, 8) || 'SKU-00'+idx}
                          name={p.name}
                          price={`$${p.price}`}
                          qty={p.quantity}
                          category={p.category}
                          status={p.quantity > 10 ? 'In Stock' : (p.quantity > 0 ? 'Low Stock' : 'Depleted')}
                          img={p.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${p.name}`}
                        />
                      ))}
                      {products.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-20 text-center text-gray-500 font-bold uppercase tracking-[0.2em]">
                            <Package className="w-12 h-12 mx-auto mb-4 opacity-10" />
                            Registry Empty
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Sub-components

const StatCard = ({ label, value, trend, trendUp }: { label: string, value: string, trend: string, trendUp: boolean }) => (
  <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group">
    <div className="flex justify-between items-start mb-6">
      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{label}</span>
      <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:text-[#B7F000] transition-colors">
        <Maximize2 size={14} />
      </div>
    </div>
    <div className="flex items-end justify-between">
      <h2 className="text-4xl font-black tracking-tighter text-slate-900">{value}</h2>
      <div className="flex flex-col items-end">
        <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-black shadow-sm ${
          trendUp ? 'bg-[#B7F000] text-black' : 'bg-red-50 text-red-500'
        }`}>
          {trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          {trend}
        </div>
        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-1.5">vs cycle</span>
      </div>
    </div>
  </div>
);

const CategoryLegend = ({ color, label, percentage, value }: { color: string, label: string, percentage: string, value: string }) => (
  <div className="flex items-center justify-between group cursor-default">
    <div className="flex items-center gap-3">
      <div className="w-2.5 h-2.5 rounded-full shadow-sm transition-transform group-hover:scale-125" style={{ backgroundColor: color }} />
      <span className="text-xs text-slate-500 font-bold">{label}</span>
      <span className="text-[10px] text-slate-400 font-black">({percentage})</span>
    </div>
    <span className="text-xs font-black text-slate-900">{value}</span>
  </div>
);

const StockItem = ({ label, current, total }: { label: string, current: number, total: number }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-xs text-slate-500 font-bold">{label}</span>
      <span className="text-[10px] text-slate-400 font-black tracking-tighter uppercase">{current} / {total} Units</span>
    </div>
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
      <div 
        className="h-full bg-[#B7F000] rounded-full transition-all duration-1000 ease-out" 
        style={{ width: `${Math.min((current / total) * 100, 100)}%` }} 
      />
    </div>
  </div>
);

const RestockItem = ({ name, qty, date, img }: { name: string, qty: string, date: string, img: string }) => (
  <div className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 p-3 -m-3 rounded-[24px] transition-all">
    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center p-2 border border-slate-100 transition-transform group-hover:scale-105 group-hover:border-[#B7F000]/30">
      <img src={img} alt={name} className="w-full h-full object-contain" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-black text-slate-900 leading-none mb-1.5">{name}</p>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{qty}</p>
    </div>
    <div className="text-right">
      <p className="text-[10px] text-[#8EBA00] font-black uppercase tracking-tight">{date}</p>
    </div>
  </div>
);

const TrafficItem = ({ source, percentage, trend }: { source: string, percentage: string, trend: 'up' | 'down' }) => (
  <div className="space-y-2">
    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{source}</p>
    <div className="flex items-end justify-between">
      <span className="text-xl font-black text-slate-900">{percentage}</span>
      <div className={`h-8 w-16 ${trend === 'up' ? 'text-[#B7F000]' : 'text-red-500'}`}>
        <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
          <path 
            d={trend === 'up' 
              ? "M0,35 Q20,32 40,15 T100,5" 
              : "M0,5 Q20,8 40,25 T100,35"} 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="4" 
            strokeLinecap="round" 
          />
        </svg>
      </div>
    </div>
  </div>
);

const ActivityItem = ({ user, action, time, img }: { user: string, action: string, time: string, img: string }) => (
  <div className="flex gap-4 group cursor-pointer">
    <div className="shrink-0 relative">
      <img src={img} alt={user} className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm" />
      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#B7F000] border-2 border-white rounded-full"></div>
    </div>
    <div className="flex-1 pb-4 border-b border-slate-100 group-last:border-0 group-last:pb-0">
      <p className="text-xs leading-relaxed text-slate-500">
        <span className="font-black text-slate-900">{user}</span> {action}
      </p>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">{time}</p>
    </div>
  </div>
);

const ProductRow = ({ index, id, name, price, qty, status, img, category }: { index: number, id: string, name: string, price: string, qty: number, status: string, img: string, category?: string }) => (
  <tr className="hover:bg-slate-50/80 transition-all group cursor-pointer">
    <td className="px-8 py-5 text-xs font-black text-slate-400">{index}</td>
    <td className="px-8 py-5">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 p-2 border border-slate-100 group-hover:scale-105 transition-transform group-hover:border-[#B7F000]/30">
          <img src={img} alt={name} className="w-full h-full object-contain" />
        </div>
        <div>
          <p className="text-sm font-black text-slate-900">{name}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{category || 'Uncategorized'}</p>
        </div>
      </div>
    </td>
    <td className="px-8 py-5 text-xs font-bold text-slate-400 tracking-widest">{id}</td>
    <td className="px-8 py-5 text-sm font-black text-slate-900">{price}</td>
    <td className="px-8 py-5 text-sm font-bold text-slate-500">{qty} Units</td>
    <td className="px-8 py-5">
      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${
        status === 'In Stock' ? 'bg-[#B7F000]/20 text-[#6B8C00]' : 
        status === 'Low Stock' ? 'bg-orange-50 text-orange-600' : 
        'bg-red-50 text-red-600'
      }`}>
        {status}
      </span>
    </td>
    <td className="px-8 py-5">
      <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
        <MoreHorizontal size={18} />
      </button>
    </td>
  </tr>
);

export default StockiveDashboard;
