// Enhanced Order Management Types for Multi-Channel System

export interface Channel {
  id: string;
  name: string;
  type: 'SHOPIFY' | 'AMAZON' | 'EBAY' | 'ETSY' | 'WOOCOMMERCE' | 'MAGENTO' | 'DARAZ' | 'POS' | 'MANUAL' | 'WEBSITE';
  isActive: boolean;
  credentials: {
    apiKey?: string;
    apiSecret?: string;
    storeUrl?: string;
    accessToken?: string;
    refreshToken?: string;
  };
  settings: {
    autoImportOrders: boolean;
    autoSyncStock: boolean;
    orderImportFrequency: number; // minutes
    stockSyncFrequency: number; // minutes
    defaultWarehouse?: string;
    priceMarkup?: number; // percentage
  };
  lastSync?: string;
  syncStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'SYNCING';
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SKUMapping {
  id: string;
  internalSKU: string;
  channelSKU: string;
  channelId: string;
  productId: string;
  isActive: boolean;
  priceOverride?: number;
  stockOverride?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StockLevel {
  id: string;
  productId: string;
  warehouseId: string;
  available: number;
  reserved: number;
  onOrder: number;
  allocated: number;
  damaged: number;
  total: number;
  reorderPoint: number;
  maxStock: number;
  lastUpdated: string;
}

export interface StockReservation {
  id: string;
  orderId: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  status: 'ACTIVE' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';
  expiresAt: string;
  createdAt: string;
}

export interface ProductBundle {
  id: string;
  name: string;
  sku: string;
  description?: string;
  components: BundleComponent[];
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BundleComponent {
  id: string;
  productId: string;
  quantity: number;
  isOptional: boolean;
}

export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  trigger: {
    event: 'ORDER_PLACED' | 'STOCK_LOW' | 'ORDER_SHIPPED' | 'PAYMENT_RECEIVED';
    conditions: RuleCondition[];
  };
  actions: RuleAction[];
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface RuleCondition {
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'IN';
  value: any;
}

export interface RuleAction {
  type: 'SET_STATUS' | 'ASSIGN_WAREHOUSE' | 'SELECT_COURIER' | 'SEND_EMAIL' | 'CREATE_PO' | 'TAG_ORDER';
  parameters: Record<string, any>;
}

export interface EnhancedOrder {
  id: string;
  orderNumber: string;
  externalOrderId?: string;
  channelId: string;
  channelName: string;
  supermarketId: string;
  
  // Customer Information
  customer: {
    name?: string;
    email?: string;
    phone?: string;
  };
  
  // Shipping Information
  shipping: {
    name?: string;
    phone?: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state?: string;
      postcode: string;
      country: string;
    };
  };
  
  // Order Status
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'RETURNED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED' | 'PARTIAL';
  fulfillmentStatus: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'FAILED';
  
  // Financial
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  
  // Fulfillment
  assignedWarehouseId?: string;
  courierService?: string;
  trackingNumber?: string;
  shippingLabelUrl?: string;
  
  // Items
  items: EnhancedOrderItem[];
  
  // Metadata
  tags: string[];
  notes?: string;
  rawPayload?: any;
  automationRulesApplied: string[];
  
  // Timestamps
  placedAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnhancedOrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxAmount: number;
  discountAmount: number;
  
  // Stock Management
  reservationId?: string;
  allocatedWarehouseId?: string;
  
  // Bundle Information
  bundleId?: string;
  bundleComponents?: BundleComponent[];
  
  // Fulfillment
  status: 'PENDING' | 'RESERVED' | 'ALLOCATED' | 'PICKED' | 'PACKED' | 'SHIPPED';
  
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  supermarketId: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postcode: string;
    country: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
  isDefault: boolean;
  settings: {
    autoAllocateOrders: boolean;
    maxOrdersPerDay?: number;
    operatingHours?: {
      start: string;
      end: string;
      timezone: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CourierService {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  credentials: {
    apiKey?: string;
    apiSecret?: string;
    accountNumber?: string;
  };
  services: CourierServiceOption[];
  settings: {
    autoSelectService: boolean;
    defaultService?: string;
    maxWeight?: number;
    maxDimensions?: {
      length: number;
      width: number;
      height: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CourierServiceOption {
  id: string;
  name: string;
  code: string;
  estimatedDays: number;
  maxWeight: number;
  isActive: boolean;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  supermarketId: string;
  warehouseId?: string;
  
  status: 'DRAFT' | 'SENT' | 'CONFIRMED' | 'PARTIAL' | 'RECEIVED' | 'CANCELLED';
  
  items: PurchaseOrderItem[];
  
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  currency: string;
  
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  
  notes?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  totalCost: number;
  
  status: 'PENDING' | 'PARTIAL' | 'RECEIVED' | 'CANCELLED';
  
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  warehouseId: string;
  type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT' | 'RESERVATION' | 'RELEASE';
  quantity: number;
  reason: string;
  reference?: string; // Order ID, PO ID, etc.
  
  balanceBefore: number;
  balanceAfter: number;
  
  createdBy?: string;
  createdAt: string;
}

export interface ChannelSyncLog {
  id: string;
  channelId: string;
  type: 'ORDER_IMPORT' | 'STOCK_SYNC' | 'PRODUCT_SYNC';
  status: 'SUCCESS' | 'ERROR' | 'WARNING';
  message: string;
  details?: any;
  recordsProcessed: number;
  recordsSuccessful: number;
  recordsFailed: number;
  duration: number; // milliseconds
  createdAt: string;
}

export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  ordersByChannel: Record<string, number>;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
  }>;
  lowStockAlerts: Array<{
    productId: string;
    productName: string;
    currentStock: number;
    reorderPoint: number;
    warehouseId: string;
  }>;
  reorderSuggestions: Array<{
    productId: string;
    productName: string;
    suggestedQuantity: number;
    supplierId: string;
    estimatedCost: number;
  }>;
}

// API Response Types
export interface OrderListResponse {
  results: EnhancedOrder[];
  count: number;
  next?: string;
  previous?: string;
}

export interface StockSyncResponse {
  success: boolean;
  channelsUpdated: string[];
  errors: Array<{
    channelId: string;
    error: string;
  }>;
}

export interface AutomationExecutionResult {
  ruleId: string;
  ruleName: string;
  executed: boolean;
  actions: Array<{
    type: string;
    success: boolean;
    error?: string;
  }>;
}