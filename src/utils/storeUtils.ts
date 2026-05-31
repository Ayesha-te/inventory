import type { Supermarket, User } from '../types/Product';
import { getAllFeaturesForPlan, normalizePlanName } from '../config/plans';

export interface StoreContext {
  isMultiStore: boolean;
  userStores: Supermarket[];
  mainStore: Supermarket | null;
  subStores: Supermarket[];
  totalStores: number;
}

/**
 * Analyze user's store context to determine single vs multi-store setup
 */
export const analyzeStoreContext = (
  stores: Supermarket[],
  currentUser: User | null
): StoreContext => {
  if (!currentUser) {
    return {
      isMultiStore: false,
      userStores: [],
      mainStore: null,
      subStores: [],
      totalStores: 0,
    };
  }

  // Backend already filters stores by authenticated user, so we can use all stores
  const userStores = stores;

  // Find main store (not a sub-store)
  const mainStore = userStores.find((store) => !store.isSubStore) || null;

  // Find branch stores
  const subStores = userStores.filter((store) => store.isSubStore);

  const totalStores = userStores.length;
  const isMultiStore = totalStores > 1;

  return {
    isMultiStore,
    userStores,
    mainStore,
    subStores,
    totalStores,
  };
};

/**
 * Get store display name with context
 */
export const getStoreDisplayName = (store: Supermarket): string => {
  const suffix = store.isSubStore ? ' (Branch)' : ' (Main Store)';
  return `${store.name}${suffix}`;
};

/**
 * Get navigation items based on store context and user plan
 */
export const getNavigationItems = (
  storeContext: StoreContext,
  isAuthenticated: boolean,
  currentUser: User | null
) => {
  if (!isAuthenticated) {
    return [
      { id: 'login', label: 'Sign In', icon: '🔑' },
      { id: 'signup', label: 'Sign Up', icon: '📝' },
    ];
  }

  const rawPlan =
    (currentUser as any)?.subscription?.plan ||
    (currentUser as any)?.subscription_plan ||
    'BASIC';
  const plan = normalizePlanName(rawPlan);
  const userFeatures = getAllFeaturesForPlan(plan);

  const allNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      feature: 'core_inventory',
    },
    {
      id: 'catalog',
      label: 'Products',
      icon: '📦',
      feature: 'core_inventory',
    },
    {
      id: 'add-product',
      label: 'Add Product',
      icon: '➕',
      feature: 'core_inventory',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: '📈',
      feature: 'basic_analytics',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      feature: 'core_inventory',
    },
    {
      id: 'help',
      label: 'Help',
      icon: '❓',
      feature: 'core_inventory',
    },
    {
      id: 'stores',
      label: 'Stores',
      icon: '🏪',
      feature: 'core_inventory',
    },
    {
      id: 'scanner',
      label: 'Scanner',
      icon: '📱',
      feature: 'barcode_scanner_support',
    },
    {
      id: 'barcode-demo',
      label: 'Barcodes',
      icon: '🏷️',
      feature: 'barcode_scanner_support',
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: '📋',
      feature: 'orders_management',
    },
    {
      id: 'suppliers',
      label: 'Suppliers',
      icon: '🤝',
      feature: 'supplier_management',
    },
    {
      id: 'stock-management',
      label: 'Stock Control',
      icon: '📊',
      feature: 'advanced_inventory',
    },
    {
      id: 'pos-sync',
      label: 'POS Connection',
      icon: '🔄',
      feature: 'pos_integration',
    },
    {
      id: 'clearance',
      label: 'Clearance',
      icon: '🏷️',
      feature: 'clearance_tools',
    },
    {
      id: 'multi-channel-orders',
      label: 'Sales Channels',
      icon: '🌐',
      feature: 'multi_channel_sync',
    },
  ];

  const navItems = allNavItems.filter((item) => userFeatures.has(item.feature));

  // Adjust labels based on plan
  const analyticsItem = navItems.find((item) => item.id === 'analytics');
  if (analyticsItem) {
    analyticsItem.label = userFeatures.has('advanced_analytics')
      ? 'Advanced Analytics'
      : 'Basic Analytics';
  }

  // Adjust label for multi-store context
  if (storeContext.isMultiStore) {
    const dashboardItem = navItems.find((item) => item.id === 'dashboard');
    if (dashboardItem) {
      dashboardItem.label = 'Store Dashboard';
    }
  }

  return navItems;
};
