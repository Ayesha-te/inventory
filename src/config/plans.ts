export const PLAN_ORDER = ['BASIC', 'STARTER', 'PRO'] as const;

export const PLAN_LABELS: Record<string, string> = {
  BASIC: 'Basic',
  STARTER: 'Starter',
  PRO: 'Pro',
};

export const PLAN_LIMITS: Record<string, { maxStores: number | null }> = {
  BASIC: {
    maxStores: 1,
  },
  STARTER: {
    maxStores: 3,
  },
  PRO: {
    maxStores: null,
  },
};

export const SUBSCRIPTION_PLANS: { [key: string]: { inherits?: string; features: string[] } } = {
  BASIC: {
    features: [
      'single_store',
      'core_inventory',
      'expiry_alerts',
      'email_notifications',
      'basic_analytics',
      'standard_support',
    ],
  },
  STARTER: {
    inherits: 'BASIC',
    features: [
      'store_management',
      'advanced_inventory',
      'barcode_scanner_support',
      'orders_management',
      'supplier_management',
      'stock_level_alerts',
      'detailed_reports',
    ],
  },
  PRO: {
    inherits: 'STARTER',
    features: [
      'unlimited_products',
      'multi_channel_sync',
      'pos_integration',
      'advanced_analytics',
      'clearance_tools',
      'priority_support',
    ],
  },
};

export const VIEW_TO_FEATURE_MAP: { [key: string]: string } = {
    'stores': 'core_inventory',
    'scanner': 'barcode_scanner_support',
    'barcode-demo': 'barcode_scanner_support',
    'orders': 'orders_management',
    'suppliers': 'supplier_management',
    'pos-sync': 'pos_integration',
    'clearance': 'clearance_tools',
    'multi-channel-orders': 'multi_channel_sync',
    'analytics': 'basic_analytics',
};

export const LEGACY_PLAN_ALIASES: Record<string, string> = {
  FREE: 'BASIC',
  STANDARD: 'STARTER',
  PREMIUM: 'PRO',
  OTHER: 'PRO',
};

export function normalizePlanName(plan?: string | null): string {
  const normalized = String(plan || 'BASIC').toUpperCase();
  return LEGACY_PLAN_ALIASES[normalized] || normalized;
}

export function getPlanLabel(plan?: string | null): string {
  return PLAN_LABELS[normalizePlanName(plan)] || 'Basic';
}

export function getAllFeaturesForPlan(plan: string): Set<string> {
  const planName = normalizePlanName(plan);
  const planConfig = SUBSCRIPTION_PLANS[planName];
  if (!planConfig) {
    return new Set();
  }

  let features = new Set(planConfig.features);
  if (planConfig.inherits) {
    const inheritedFeatures = getAllFeaturesForPlan(planConfig.inherits);
    inheritedFeatures.forEach(feature => features.add(feature));
  }

  return features;
}

export function getRequiredPlanForFeature(feature: string): string {
  for (const plan of PLAN_ORDER) {
    if (getAllFeaturesForPlan(plan).has(feature)) {
      return PLAN_LABELS[plan];
    }
  }

  return PLAN_LABELS.BASIC;
}

export function getMaxStoresForPlan(plan?: string | null): number | null {
  const normalizedPlan = normalizePlanName(plan);
  return PLAN_LIMITS[normalizedPlan]?.maxStores ?? PLAN_LIMITS.BASIC.maxStores;
}
