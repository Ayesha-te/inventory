import React, { useEffect, useMemo, useRef, useState } from 'react';
import logoImage from '../assets/logo.png';
import { useNotifications } from '../hooks/useApi';
import { NotificationService } from '../services/apiService';
import {
  BarChart3,
  Bell,
  ChevronDown,
  Command,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  Layers,
  LogOut,
  Maximize2,
  MoreHorizontal,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  ScanLine,
  Search,
  Settings,
  ShoppingCart,
  Store,
  Truck,
  Users,
} from 'lucide-react';

interface StockiveDashboardProps {
  user: any;
  onLogout: () => void;
  currentView: string;
  onViewChange: (view: any) => void;
  navigationItems?: { id: string; label: string; icon: string | React.ReactNode }[];
  children?: React.ReactNode;
  products?: any[];
  supermarkets?: any[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const SIDEBAR_STORAGE_KEY = 'stockive.sidebarCollapsed';

const VIEW_META: Record<string, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Track stock, alerts, and store activity from one place.',
  },
  stores: {
    title: 'Stores',
    subtitle: 'Manage your main store and branch stores.',
  },
  catalog: {
    title: 'Products',
    subtitle: 'Search, filter, and manage your product list.',
  },
  'add-product': {
    title: 'Add Product',
    subtitle: 'Add products manually, from Excel, or from a photo.',
  },
  orders: {
    title: 'Orders',
    subtitle: 'Review incoming orders and fulfillment progress.',
  },
  'multi-channel-orders': {
    title: 'Sales Channels',
    subtitle: 'Track marketplace and online store orders together.',
  },
  suppliers: {
    title: 'Suppliers',
    subtitle: 'Manage supplier details, orders, and purchasing history.',
  },
  'stock-management': {
    title: 'Stock Control',
    subtitle: 'Stay ahead of low stock and restocking needs.',
  },
  clearance: {
    title: 'Clearance',
    subtitle: 'Create discounts and offers for slow-moving products.',
  },
  scanner: {
    title: 'Scanner',
    subtitle: 'Find products quickly by barcode or product name.',
  },
  'barcode-demo': {
    title: 'Barcodes',
    subtitle: 'Create and print barcodes and product labels.',
  },
  'pos-sync': {
    title: 'POS Connection',
    subtitle: 'Connect your POS system and keep inventory updated.',
  },
  analytics: {
    title: 'Analytics',
    subtitle: 'View inventory value, stock health, and performance trends.',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Control alerts, security, backups, and regional preferences.',
  },
  help: {
    title: 'Help',
    subtitle: 'Find guides, answers, and support when you need it.',
  },
};

const StockiveDashboard: React.FC<StockiveDashboardProps> = ({
  user,
  onLogout,
  currentView,
  onViewChange,
  navigationItems = [],
  children,
  products = [],
  searchQuery = '',
  onSearchChange,
}) => {
  const { data: notifications = [], refetch: refetchNotifications } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const paletteInputRef = useRef<HTMLInputElement>(null);

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((notification: any) => !notification.is_read).length
    : 0;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      setSidebarCollapsed(saved === 'true');
    } catch {
      setSidebarCollapsed(false);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarCollapsed));
    } catch {
      // Ignore storage failures
    }
  }, [sidebarCollapsed]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setShowCommandPalette(true);
      }

      if (event.key === 'Escape') {
        setShowNotifications(false);
        setShowCommandPalette(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (showCommandPalette) {
      setCommandQuery('');
      window.setTimeout(() => paletteInputRef.current?.focus(), 0);
    }
  }, [showCommandPalette]);

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

  const allowedIds = useMemo(() => new Set(navigationItems.map((item) => item.id)), [navigationItems]);

  const navGroups = useMemo(
    () => [
      {
        title: 'Overview',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
          { id: 'stores', label: 'Stores', icon: <Store size={18} /> },
          { id: 'supermarket-overview', label: 'Store Overview', icon: <Store size={18} /> },
        ],
      },
      {
        title: 'Inventory',
        items: [
          { id: 'catalog', label: 'Products', icon: <Package size={18} /> },
          { id: 'stock-management', label: 'Stock Control', icon: <Package size={18} /> },
          { id: 'clearance', label: 'Clearance', icon: <MoreHorizontal size={18} /> },
        ],
      },
      {
        title: 'Sales',
        items: [
          { id: 'orders', label: 'Orders', icon: <ShoppingCart size={18} /> },
          { id: 'multi-channel-orders', label: 'Sales Channels', icon: <Layers size={18} /> },
        ],
      },
      {
        title: 'Procurement',
        items: [{ id: 'suppliers', label: 'Suppliers', icon: <Users size={18} /> }],
      },
      {
        title: 'Tools',
        items: [
          { id: 'barcode-demo', label: 'Barcodes', icon: <CreditCard size={18} /> },
          { id: 'scanner', label: 'Scanner', icon: <ScanLine size={18} /> },
          { id: 'pos-sync', label: 'POS Connection', icon: <Truck size={18} /> },
        ],
      },
      {
        title: 'Reports',
        items: [{ id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> }],
      },
      {
        title: 'Settings',
        items: [
          { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
          { id: 'help', label: 'Help', icon: <HelpCircle size={18} /> },
        ],
      },
    ],
    []
  );

  const filteredNavGroups = useMemo(
    () =>
      navGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => allowedIds.has(item.id)),
        }))
        .filter((group) => group.items.length > 0),
    [allowedIds, navGroups]
  );

  const quickActions = useMemo(
    () =>
      [
        { id: 'add-product', label: 'Product', icon: <Plus size={16} />, variant: 'primary' as const },
        { id: 'orders', label: 'Order', icon: <ShoppingCart size={16} />, variant: 'secondary' as const },
        { id: 'suppliers', label: 'Supplier', icon: <Users size={16} />, variant: 'secondary' as const },
        { id: 'scanner', label: 'Scan', icon: <ScanLine size={16} />, variant: 'secondary' as const },
      ].filter((action) => allowedIds.has(action.id)),
    [allowedIds]
  );

  const commandItems = useMemo(() => {
    const items = [
      ...quickActions.map((action) => ({
        id: action.id,
        label: action.label === 'Scan' ? 'Open Scanner' : `Open ${action.label}`,
        description: `Go to ${VIEW_META[action.id]?.title || action.label}`,
      })),
      ...filteredNavGroups.flatMap((group) =>
        group.items.map((item) => ({
          id: item.id,
          label: item.label,
          description: group.title,
        }))
      ),
    ];

    return items.filter(
      (item, index, array) => array.findIndex((candidate) => candidate.id === item.id) === index
    );
  }, [filteredNavGroups, quickActions]);

  const filteredCommands = useMemo(() => {
    const query = commandQuery.trim().toLowerCase();
    if (!query) return commandItems;
    return commandItems.filter((item) =>
      `${item.label} ${item.description}`.toLowerCase().includes(query)
    );
  }, [commandItems, commandQuery]);

  const viewMeta = VIEW_META[currentView] || {
    title: currentView.replace(/-/g, ' '),
    subtitle: 'Manage this part of your inventory workspace.',
  };

  const renderedChildren = React.Children.toArray(children).filter(Boolean);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      <aside
        className={`${
          sidebarCollapsed ? 'w-20' : 'w-72'
        } flex shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-300`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
          <div className={`flex min-w-0 items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <img src={logoImage} alt="Stockive Logo" className="h-10 w-10 shrink-0 object-contain" />
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-lg font-black tracking-tight text-slate-900">Stockive</p>
                <p className="truncate text-xs font-medium text-slate-500">Inventory workspace</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setSidebarCollapsed((value) => !value)}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {filteredNavGroups.map((group) => (
            <div key={group.title}>
              {!sidebarCollapsed && (
                <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {group.title}
                </p>
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = currentView === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      title={sidebarCollapsed ? item.label : undefined}
                      onClick={() => onViewChange(item.id)}
                      className={`flex w-full items-center rounded-2xl px-3 py-3 text-sm font-medium transition ${
                        sidebarCollapsed ? 'justify-center' : 'justify-start gap-3'
                      } ${
                        active
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span className={active ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={onLogout}
            className={`flex w-full items-center rounded-2xl px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 ${
              sidebarCollapsed ? 'justify-center' : 'gap-3'
            }`}
            title={sidebarCollapsed ? 'Logout' : undefined}
          >
            <LogOut size={18} />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-black tracking-tight text-slate-900">{viewMeta.title}</h1>
              <p className="mt-1 text-sm text-slate-500">{viewMeta.subtitle}</p>
            </div>

            <div className="flex flex-col gap-3 xl:items-end">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[280px] flex-1 xl:min-w-[360px]">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search products, orders, suppliers..."
                    value={searchQuery}
                    onChange={(event) => onSearchChange?.(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-24 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCommandPalette(true)}
                    className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-50"
                  >
                    <Command className="h-3.5 w-3.5" />
                    Ctrl K
                  </button>
                </div>

                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => onViewChange(action.id)}
                    className={
                      action.variant === 'primary'
                        ? 'inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800'
                        : 'inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
                    }
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </button>
                ))}

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowNotifications((value) => !value)}
                    className={`relative rounded-2xl border px-3 py-3 transition ${
                      showNotifications
                        ? 'border-sky-200 bg-sky-50 text-sky-700'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 z-50 mt-3 w-[340px] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-xl">
                      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                          <p className="text-xs text-slate-500">Updates from your stores and inventory</p>
                        </div>
                        <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                          {unreadCount} new
                        </span>
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        {notifications && notifications.length > 0 ? (
                          notifications.map((notification: any) => (
                            <button
                              key={notification.id}
                              type="button"
                              onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                              className={`w-full border-b border-slate-100 px-4 py-4 text-left transition hover:bg-slate-50 ${
                                notification.is_read ? 'bg-white' : 'bg-sky-50/40'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {notification.title || 'Notification'}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">{notification.message}</p>
                                </div>
                                {!notification.is_read && <span className="mt-1 h-2 w-2 rounded-full bg-sky-500" />}
                              </div>
                              <p className="mt-3 text-[11px] font-medium text-slate-400">
                                {new Date(notification.created_at).toLocaleDateString()}
                              </p>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-10 text-center">
                            <p className="text-sm font-semibold text-slate-700">You&apos;re all caught up</p>
                            <p className="mt-1 text-xs text-slate-500">New alerts will show up here.</p>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleMarkAllAsRead}
                        className="w-full border-t border-slate-100 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        Mark all as read
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-left transition hover:bg-slate-50"
                >
                  <div className="text-right">
                    <p className="text-sm font-semibold leading-none text-slate-900">
                      {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.name || 'Store Admin'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {user?.subscription?.plan || 'Professional'} account
                    </p>
                  </div>
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Stockive'}`}
                    alt="Avatar"
                    className="h-10 w-10 rounded-full border border-slate-200 bg-white p-0.5"
                  />
                  <ChevronDown size={16} className="text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50 px-6 py-6">
          {renderedChildren.length > 0 ? (
            renderedChildren
          ) : (
            <ShellFallback products={products} onViewChange={onViewChange} />
          )}
        </div>
      </main>

      {showCommandPalette && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-900/30 px-4 py-16 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  ref={paletteInputRef}
                  type="text"
                  value={commandQuery}
                  onChange={(event) => setCommandQuery(event.target.value)}
                  placeholder="Search pages and quick actions..."
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
                <span className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-400">
                  ESC
                </span>
              </div>
            </div>

            <div className="max-h-[420px] overflow-y-auto p-3">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onViewChange(item.id);
                      setShowCommandPalette(false);
                    }}
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-slate-50"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">Open</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm font-semibold text-slate-900">No results found</p>
                  <p className="mt-1 text-xs text-slate-500">Try a different keyword.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ShellFallback = ({
  products,
  onViewChange,
}: {
  products: any[];
  onViewChange: (view: string) => void;
}) => {
  const totalValue = products.reduce(
    (sum, product) => sum + Number(product.price || 0) * Number(product.quantity || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MiniPanel label="Products" value={String(products.length)} />
        <MiniPanel label="Inventory Value" value={totalValue > 0 ? `$${totalValue.toLocaleString()}` : '$0.00'} />
        <MiniPanel label="Quick start" value="Add your first product" />
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Start with your first task</h2>
        <p className="mt-1 text-sm text-slate-500">
          Use quick actions to add products, connect your POS, or open reports.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onViewChange('add-product')}
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Add Product
          </button>
          <button
            type="button"
            onClick={() => onViewChange('analytics')}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Open Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

const MiniPanel = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">{value}</p>
  </div>
);

export default StockiveDashboard;
