export const PLAN_ORDER = ['STARTER', 'BASIC', 'STANDARD', 'PREMIUM'] as const;

export const PLAN_LABELS: Record<string, string> = {
  STARTER: 'Starter',
  BASIC: 'Basic',
  STANDARD: 'Standard',
  PREMIUM: 'Premium',
};

export const SUBSCRIPTION_PLANS: { [key: string]: { inherits?: string; features: string[] } } = {
  STARTER: {
    features: [
      'single_store',
      'core_inventory',
    ],
  },
  BASIC: {
    inherits: 'STARTER',
    features: [
      'expiry_alerts',
      'email_notifications',
      'mobile_app_access',
    ],
  },
  STANDARD: {
    inherits: 'BASIC',
    features: [
      'store_management',
      'unlimited_products',
      'barcode_scanner_support',
      'orders_management',
      'supplier_management',
      'basic_analytics',
      'standard_support',
    ],
  },
  PREMIUM: {
    inherits: 'STANDARD',
    features: [
      'advanced_inventory',
      'multi_channel_sync',
      'pos_integration',
      'advanced_analytics',
      'api_access',
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
    'clearance': 'advanced_analytics',
    'multi-channel-orders': 'multi_channel_sync',
    'analytics': 'basic_analytics',
};

export const LEGACY_PLAN_ALIASES: Record<string, string> = {
  FREE: 'STARTER',
  OTHER: 'PREMIUM',
  PRO: 'PREMIUM',
};

export function normalizePlanName(plan?: string | null): string {
  const normalized = String(plan || 'STARTER').toUpperCase();
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

  return PLAN_LABELS.STARTER;
}
