/**
 * TypeScript interfaces for Multi-Channel Order Management System
 * Similar to MultiOrders.com functionality
 */

// Order Status Types
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type FulfillmentStatus = 'unfulfilled' | 'partial' | 'fulfilled';

export interface Channel {
  id: string;
  name: string;
  type: 'shopify' | 'amazon' | 'ebay' | 'woocommerce' | 'etsy' | 'manual';
  isActive: boolean;
  credentials: {
    apiKey?: string;
    apiSecret?: string;
    storeUrl?: string;
    accessToken?: string;
    refreshToken?: string;
    sellerId?: string;
    marketplaceId?: string;
  };
  settings: {
    autoImportOrders: boolean;
    autoSyncStock: boolean;
    defaultWarehouse?: string;
    orderPrefix?: string;
    stockSyncInterval: number; // minutes
  };
  lastSync?: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SKUMapping {
  id: string;
  internalSku: string;
  channelSku: string;
  channelId: string;
  productName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockLevel {
  id: string;
  productId: string;
  warehouseId: string;
  availableQuantity: number;
  reservedQuantity: number;
  totalQuantity: number;
  reorderLevel: number;
  maxLevel: number;
  lastUpdated: string;
}

export interface EnhancedOrder {
  id: string;
  orderNumber: string;
  channelOrderId: string;
  channelId: string;
  channelName: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  
  // Customer Information
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  
  // Convenience properties for backward compatibility
  customerName: string;
  customerEmail: string;
  
  // Shipping Information
  shippingAddress: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    phone?: string;
  };
  
  billingAddress?: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    phone?: string;
  };
  
  // Order Items
  items: EnhancedOrderItem[];
  
  // Financial Information
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  
  // Shipping Information
  shippingMethod?: string;
  trackingNumber?: string;
  courierService?: string;
  estimatedDelivery?: string;
  
  // Metadata
  tags: string[];
  notes?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Timestamps
  orderDate: string;
  importedAt: string;
  processedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  
  // Automation
  automationRulesApplied: string[];
  isAutomated: boolean;
  
  // Additional properties for compatibility
  warehouseId?: string;
}

export interface EnhancedOrderItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxAmount: number;
  discountAmount: number;
  
  // Fulfillment
  quantityFulfilled: number;
  quantityReserved: number;
  warehouseId?: string;
  
  // Product Details
  variant?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

// Alias for backward compatibility
export type OrderItem = EnhancedOrderItem;

// Automation Rule Types
export type RuleTrigger = 'order_placed' | 'order_updated' | 'payment_received' | 'stock_low' | 'manual';

export interface RuleCondition {
  type: 'channel' | 'order_value' | 'customer_type' | 'shipping_country' | 'product_tags' | 'order_tags' | 'weight';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'in' | 'not_in';
  value: any;
}

export interface RuleAction {
  type: 'assign_tags' | 'set_courier' | 'set_warehouse' | 'set_priority' | 'send_notification' | 'hold_order' | 'auto_fulfill';
  value: any;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  priority: number;
  trigger: RuleTrigger;
  
  // Conditions
  conditions: {
    channels?: string[];
    orderValue?: { min?: number; max?: number };
    customerType?: string[];
    shippingCountry?: string[];
    productTags?: string[];
    orderTags?: string[];
    weight?: { min?: number; max?: number };
  };
  
  // Actions
  actions: {
    assignTags?: string[];
    setCourier?: string;
    setWarehouse?: string;
    setPriority?: 'low' | 'normal' | 'high' | 'urgent';
    sendNotification?: {
      email?: string[];
      message?: string;
    };
    holdOrder?: boolean;
    autoFulfill?: boolean;
  };
  
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  contactPerson: string;
  phone: string;
  email: string;
  isDefault: boolean;
  isActive: boolean;
  priority: number;
  maxCapacity?: number;
  currentUtilization?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourierService {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  supportedCountries: string[];
  services: {
    name: string;
    code: string;
    estimatedDays: number;
    maxWeight?: number;
    price?: number;
  }[];
  apiCredentials?: {
    apiKey?: string;
    apiSecret?: string;
    accountNumber?: string;
    testMode: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BundleComponent {
  id: string;
  bundleProductId: string;
  componentProductId: string;
  quantity: number;
  isOptional: boolean;
}

export interface StockReservation {
  id: string;
  productId: string;
  orderId: string;
  warehouseId: string;
  quantity: number;
  reservedAt: string;
  expiresAt?: string;
  status: 'active' | 'fulfilled' | 'expired' | 'cancelled';
}

// Dashboard and Analytics Types
export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  ordersByChannel: Record<string, number>;
  revenueByChannel: Record<string, number>;
  topProducts: {
    sku: string;
    name: string;
    quantity: number;
    revenue: number;
  }[];
  lowStockAlerts: {
    productId: string;
    sku: string;
    name: string;
    currentStock: number;
    reorderLevel: number;
  }[];
}

export interface DashboardMetrics {
  ordersToday: number;
  ordersThisWeek: number;
  ordersThisMonth: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  pendingOrders: number;
  lowStockItems: number;
  channelsConnected: number;
  automationRulesActive: number;
}

// API Response Types
export interface ApiResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

export interface ChannelTestResult {
  success: boolean;
  message: string;
  details?: any;
}

export interface StockSyncResult {
  success: boolean;
  channelsUpdated: string[];
  errors: string[];
  message: string;
}

export interface OrderImportResult {
  success: boolean;
  ordersImported: number;
  ordersSkipped: number;
  errors: string[];
  message: string;
}

// Form Types
export interface ChannelFormData {
  name: string;
  type: Channel['type'];
  credentials: Channel['credentials'];
  settings: Channel['settings'];
}

export interface AutomationRuleFormData {
  name: string;
  description: string;
  conditions: AutomationRule['conditions'];
  actions: AutomationRule['actions'];
  priority: number;
}

export interface WarehouseFormData {
  name: string;
  code: string;
  address: Warehouse['address'];
  contactPerson: string;
  phone: string;
  email: string;
  isDefault: boolean;
  priority: number;
  maxCapacity?: number;
}

// Filter and Search Types
export interface OrderFilters {
  status?: OrderStatus[];
  channels?: string[];
  channel?: string;
  dateFrom?: string;
  dateTo?: string;
  dateRange?: { start: string; end: string };
  search?: string;
  searchTerm?: string;
  paymentStatus?: PaymentStatus[];
  fulfillmentStatus?: FulfillmentStatus[];
  priority?: string[];
}

export interface ProductFilters {
  categories?: string[];
  suppliers?: string[];
  warehouses?: string[];
  lowStock?: boolean;
  search?: string;
}