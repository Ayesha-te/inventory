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
      totalStores: 0
    };
  }

  // Backend already filters stores by authenticated user, so we can use all stores
  const userStores = stores;
  
  // Find main store (not a sub-store)
  const mainStore = userStores.find(store => !store.isSubStore) || null;
  
  // Find sub-stores
  const subStores = userStores.filter(store => store.isSubStore);
  
  const totalStores = userStores.length;
  const isMultiStore = totalStores > 1;

  return {
    isMultiStore,
    userStores,
    mainStore,
    subStores,
    totalStores
  };
};

/**
 * Get store display name with context
 */
export const getStoreDisplayName = (store: Supermarket): string => {
  const suffix = store.isSubStore ? ' (Sub-Store)' : ' (Main Store)';
  return `${store.name}${suffix}`;
};

/**
 * Get navigation items based on store context and user plan
 */
export const getNavigationItems = (storeContext: StoreContext, isAuthenticated: boolean, currentUser: User | null) => {
  if (!isAuthenticated) {
    return [
      { id: 'login', label: 'Login', icon: '🔑' },
      { id: 'signup', label: 'Sign Up', icon: '📝' }
    ];
  }

  const rawPlan =
    (currentUser as any)?.subscription?.plan ||
    (currentUser as any)?.subscription_plan ||
    'STARTER';
  const plan = normalizePlanName(rawPlan);
  const userFeatures = getAllFeaturesForPlan(plan);

  const allNavItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: '📊',
      feature: 'core_inventory' // All plans have this
    },
    { 
      id: 'catalog', 
      label: 'Product Catalog', 
      icon: '📦',
      feature: 'core_inventory' 
    },
    { 
      id: 'add-product', 
      label: 'Add Product', 
      icon: '➕',
      feature: 'core_inventory'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: '📈',
      feature: 'basic_analytics'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: '⚙️',
      feature: 'core_inventory'
    },
    { 
      id: 'help', 
      label: 'Help & Support', 
      icon: '❓',
      feature: 'core_inventory'
    },
    { 
      id: 'stores', 
      label: 'Store Management', 
      icon: '🏪',
      feature: 'core_inventory' 
    },
    { 
      id: 'scanner', 
      label: 'Scanner', 
      icon: '📱',
      feature: 'barcode_scanner_support'
    },
    { 
      id: 'barcode-demo', 
      label: 'Barcode Support', 
      icon: '🏷️',
      feature: 'barcode_scanner_support'
    },
    { 
      id: 'orders', 
      label: 'Orders Management', 
      icon: '📋',
      feature: 'orders_management'
    },
    { 
      id: 'suppliers', 
      label: 'Supplier Management', 
      icon: '🤝',
      feature: 'supplier_management'
    },
    { 
      id: 'stock-management', 
      label: 'Advanced Stock Control', 
      icon: '📊',
      feature: 'advanced_inventory'
    },
    { 
      id: 'pos-sync', 
      label: 'POS Integration', 
      icon: '🔄',
      feature: 'pos_integration'
    },
    { 
      id: 'clearance', 
      label: 'Clearance Tools', 
      icon: '🏷️',
      feature: 'advanced_analytics'
    },
    { 
      id: 'multi-channel-orders', 
      label: 'Multi-Channel Sync', 
      icon: '🌐',
      feature: 'multi_channel_sync'
    },
  ];

  let navItems = allNavItems.filter(item => userFeatures.has(item.feature));

  // Adjust labels based on plan
  const analyticsItem = navItems.find(i => i.id === 'analytics');
  if (analyticsItem) {
    if (userFeatures.has('advanced_analytics')) {
      analyticsItem.label = 'Advanced Analytics';
    } else {
      analyticsItem.label = 'Basic Analytics';
    }
  }

  // Adjust label for multi-store context
  if (storeContext.isMultiStore) {
    const dashboardItem = navItems.find(i => i.id === 'dashboard');
    if (dashboardItem) dashboardItem.label = 'Multi-Store Dashboard';
  }

  return navItems;
};
