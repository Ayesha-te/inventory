/**
 * Enhanced Order Management Service
 * Multi-channel order management similar to MultiOrders.com
 */

import { apiRequest } from './apiService';
import type {
  Channel,
  SKUMapping,
  StockLevel,
  StockReservation,
  ProductBundle,
  AutomationRule,
  EnhancedOrder,
  EnhancedOrderItem,
  Warehouse,
  CourierService,
  PurchaseOrder,
  StockMovement,
  ChannelSyncLog,
  OrderAnalytics,
  OrderListResponse,
  StockSyncResponse,
  AutomationExecutionResult
} from '../types/OrderManagement';

// API Client adapter to use with apiRequest
const apiClient = {
  get: async (url: string, config?: { params?: any }) => {
    const queryString = config?.params ? '?' + new URLSearchParams(config.params).toString() : '';
    return apiRequest(url + queryString, { method: 'GET' });
  },
  post: async (url: string, data?: any) => {
    return apiRequest(url, { method: 'POST', body: data });
  },
  patch: async (url: string, data?: any) => {
    return apiRequest(url, { method: 'PATCH', body: data });
  },
  put: async (url: string, data?: any) => {
    return apiRequest(url, { method: 'PUT', body: data });
  },
  delete: async (url: string) => {
    return apiRequest(url, { method: 'DELETE' });
  }
};

// Channel Management
export class ChannelService {
  static async list(supermarketId?: string): Promise<Channel[]> {
    const params = supermarketId ? { supermarket: supermarketId } : {};
    const response = await apiClient.get('/api/channels/', { params });
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  }

  static async create(data: Partial<Channel>): Promise<Channel> {
    const response = await apiClient.post('/api/channels/', data);
    return response.data;
  }

  static async update(id: string, data: Partial<Channel>): Promise<Channel> {
    const response = await apiClient.patch(`/api/channels/${id}/`, data);
    return response.data;
  }

  static async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/channels/${id}/`);
  }

  static async testConnection(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`/api/channels/${id}/test-connection/`);
    return response.data;
  }

  static async syncOrders(id: string): Promise<{ success: boolean; ordersImported: number; message: string }> {
    const response = await apiClient.post(`/api/channels/${id}/sync-orders/`);
    return response.data;
  }

  static async syncStock(id: string): Promise<StockSyncResponse> {
    const response = await apiClient.post(`/api/channels/${id}/sync-stock/`);
    return response.data;
  }
}

// SKU Mapping Management
export class SKUMappingService {
  static async list(channelId?: string, productId?: string): Promise<SKUMapping[]> {
    const params: any = {};
    if (channelId) params.channel = channelId;
    if (productId) params.product = productId;
    
    const response = await apiClient.get('/api/sku-mappings/', { params });
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  }

  static async create(data: Partial<SKUMapping>): Promise<SKUMapping> {
    const response = await apiClient.post('/api/sku-mappings/', data);
    return response.data;
  }

  static async update(id: string, data: Partial<SKUMapping>): Promise<SKUMapping> {
    const response = await apiClient.patch(`/api/sku-mappings/${id}/`, data);
    return response.data;
  }

  static async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/sku-mappings/${id}/`);
  }

  static async bulkCreate(mappings: Partial<SKUMapping>[]): Promise<SKUMapping[]> {
    const response = await apiClient.post('/api/sku-mappings/bulk-create/', { mappings });
    return response.data;
  }
}

// Stock Management
export class StockManagementService {
  static async getStockLevels(warehouseId?: string, productId?: string): Promise<StockLevel[]> {
    const params: any = {};
    if (warehouseId) params.warehouse = warehouseId;
    if (productId) params.product = productId;
    
    const response = await apiClient.get('/api/stock-levels/', { params });
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  }

  static async updateStockLevel(id: string, data: Partial<StockLevel>): Promise<StockLevel> {
    const response = await apiClient.patch(`/api/stock-levels/${id}/`, data);
    return response.data;
  }

  static async adjustStock(productId: string, warehouseId: string, adjustment: number, reason: string): Promise<StockMovement> {
    const response = await apiClient.post('/api/stock-movements/', {
      product: productId,
      warehouse: warehouseId,
      type: 'ADJUSTMENT',
      quantity: adjustment,
      reason
    });
    return response.data;
  }

  static async reserveStock(orderId: string, items: Array<{ productId: string; warehouseId: string; quantity: number }>): Promise<StockReservation[]> {
    const response = await apiClient.post('/api/stock-reservations/', {
      order: orderId,
      items
    });
    return response.data;
  }

  static async releaseReservation(reservationId: string): Promise<void> {
    await apiClient.patch(`/api/stock-reservations/${reservationId}/`, { status: 'CANCELLED' });
  }

  static async getStockMovements(productId?: string, warehouseId?: string): Promise<StockMovement[]> {
    const params: any = {};
    if (productId) params.product = productId;
    if (warehouseId) params.warehouse = warehouseId;
    
    const response = await apiClient.get('/api/stock-movements/', { params });
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  }

  static async syncStockToChannels(productIds?: string[]): Promise<StockSyncResponse> {
    const response = await apiClient.post('/api/stock-sync/', { product_ids: productIds });
    return response.data;
  }
}

// Bundle Management
export class BundleService {
  static async list(supermarketId?: string): Promise<ProductBundle[]> {
    const params = supermarketId ? { supermarket: supermarketId } : {};
    const response = await apiClient.get('/api/bundles/', { params });
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  }

  static async create(data: Partial<ProductBundle>): Promise<ProductBundle> {
    const response = await apiClient.post('/api/bundles/', data);
    return response.data;
  }

  static async update(id: string, data: Partial<ProductBundle>): Promise<ProductBundle> {
    const response = await apiClient.patch(`/api/bundles/${id}/`, data);
    return response.data;
  }

  static async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/bundles/${id}/`);
  }

  static async checkAvailability(bundleId: string, warehouseId: string): Promise<{ available: boolean; maxQuantity: number; missingComponents: string[] }> {
    const response = await apiClient.get(`/api/bundles/${bundleId}/check-availability/`, {
      params: { warehouse: warehouseId }
    });
    return response.data;
  }
}

// Automation Rules
export class AutomationService {
  static async listRules(supermarketId?: string): Promise<AutomationRule[]> {
    const params = supermarketId ? { supermarket: supermarketId } : {};
    const response = await apiClient.get('/api/automation-rules/', { params });
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  }

  static async createRule(data: Partial<AutomationRule>): Promise<AutomationRule> {
    const response = await apiClient.post('/api/automation-rules/', data);
    return response.data;
  }

  static async updateRule(id: string, data: Partial<AutomationRule>): Promise<AutomationRule> {
    const response = await apiClient.patch(`/api/automation-rules/${id}/`, data);
    return response.data;
  }

  static async deleteRule(id: string): Promise<void> {
    await apiClient.delete(`/api/automation-rules/${id}/`);
  }

  static async testRule(id: string, testData: any): Promise<AutomationExecutionResult> {
    const response = await apiClient.post(`/api/automation-rules/${id}/test/`, testData);
    return response.data;
  }

  static async executeRule(id: string, orderId: string): Promise<AutomationExecutionResult> {
    const response = await apiClient.post(`/api/automation-rules/${id}/execute/`, { order_id: orderId });
    return response.data;
  }
}

// Enhanced Order Management
export class EnhancedOrderService {
  static async list(filters?: {
    status?: string;
    channel?: string;
    supermarket?: string;
    payment_status?: string;
    fulfillment_status?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<OrderListResponse> {
    const response = await apiClient.get('/api/enhanced-orders/', { params: filters });
    return response.data;
  }

  static async get(id: string): Promise<EnhancedOrder> {
    const response = await apiClient.get(`/api/enhanced-orders/${id}/`);
    return response.data;
  }

  static async create(data: Partial<EnhancedOrder>): Promise<EnhancedOrder> {
    const response = await apiClient.post('/api/enhanced-orders/', data);
    return response.data;
  }

  static async update(id: string, data: Partial<EnhancedOrder>): Promise<EnhancedOrder> {
    const response = await apiClient.patch(`/api/enhanced-orders/${id}/`, data);
    return response.data;
  }

  static async updateStatus(id: string, status: string, note?: string): Promise<EnhancedOrder> {
    const response = await apiClient.patch(`/api/enhanced-orders/${id}/update-status/`, { status, note });
    return response.data;
  }

  static async assignWarehouse(id: string, warehouseId: string): Promise<EnhancedOrder> {
    const response = await apiClient.patch(`/api/enhanced-orders/${id}/assign-warehouse/`, { warehouse_id: warehouseId });
    return response.data;
  }

  static async allocateStock(id: string): Promise<{ success: boolean; message: string; allocations: any[] }> {
    const response = await apiClient.post(`/api/enhanced-orders/${id}/allocate-stock/`);
    return response.data;
  }

  static async generateShippingLabel(id: string, courierService: string): Promise<{ success: boolean; labelUrl: string; trackingNumber: string }> {
    const response = await apiClient.post(`/api/enhanced-orders/${id}/generate-label/`, { courier_service: courierService });
    return response.data;
  }

  static async markAsShipped(id: string, trackingNumber: string, courierService: string): Promise<EnhancedOrder> {
    const response = await apiClient.patch(`/api/enhanced-orders/${id}/mark-shipped/`, {
      tracking_number: trackingNumber,
      courier_service: courierService
    });
    return response.data;
  }

  static async cancel(id: string, reason: string): Promise<EnhancedOrder> {
    const response = await apiClient.patch(`/api/enhanced-orders/${id}/cancel/`, { reason });
    return response.data;
  }

  static async bulkUpdateStatus(orderIds: string[], status: string): Promise<{ success: number; failed: number; errors: any[] }> {
    const response = await apiClient.post('/api/enhanced-orders/bulk-update-status/', {
      order_ids: orderIds,
      status
    });
    return response.data;
  }

  static async importOrders(channelId: string, orders: any[]): Promise<{ success: number; failed: number; errors: any[] }> {
    const response = await apiClient.post('/api/enhanced-orders/import/', {
      channel_id: channelId,
      orders
    });
    return response.data;
  }
}

// Warehouse Management
export class WarehouseManagementService {
  static async list(supermarketId?: string): Promise<Warehouse[]> {
    const params = supermarketId ? { supermarket: supermarketId } : {};
    const response = await apiClient.get('/api/warehouses/', { params });
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  }

  static async create(data: Partial<Warehouse>): Promise<Warehouse> {
    const response = await apiClient.post('/api/warehouses/', data);
    return response.data;
  }

  static async update(id: string, data: Partial<Warehouse>): Promise<Warehouse> {
    const response = await apiClient.patch(`/api/warehouses/${id}/`, data);
    return response.data;
  }

  static async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/warehouses/${id}/`);
  }

  static async getCapacity(id: string): Promise<{ totalOrders: number; maxCapacity: number; utilizationPercent: number }> {
    const response = await apiClient.get(`/api/warehouses/${id}/capacity/`);
    return response.data;
  }
}

// Courier Service Management
export class CourierManagementService {
  static async list(supermarketId?: string): Promise<CourierService[]> {
    const params = supermarketId ? { supermarket: supermarketId } : {};
    const response = await apiClient.get('/api/courier-services/', { params });
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  }

  static async create(data: Partial<CourierService>): Promise<CourierService> {
    const response = await apiClient.post('/api/courier-services/', data);
    return response.data;
  }

  static async update(id: string, data: Partial<CourierService>): Promise<CourierService> {
    const response = await apiClient.patch(`/api/courier-services/${id}/`, data);
    return response.data;
  }

  static async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/courier-services/${id}/`);
  }

  static async testConnection(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`/api/courier-services/${id}/test-connection/`);
    return response.data;
  }

  static async getShippingRates(id: string, orderData: any): Promise<{ rates: any[]; error?: string }> {
    const response = await apiClient.post(`/api/courier-services/${id}/get-rates/`, orderData);
    return response.data;
  }
}

// Purchase Order Management
export class PurchaseOrderService {
  static async list(supermarketId?: string, status?: string): Promise<PurchaseOrder[]> {
    const params: any = {};
    if (supermarketId) params.supermarket = supermarketId;
    if (status) params.status = status;
    
    const response = await apiClient.get('/api/purchase-orders/', { params });
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  }

  static async create(data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const response = await apiClient.post('/api/purchase-orders/', data);
    return response.data;
  }

  static async update(id: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const response = await apiClient.patch(`/api/purchase-orders/${id}/`, data);
    return response.data;
  }

  static async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/purchase-orders/${id}/`);
  }

  static async generateFromReorderPoints(supermarketId: string, warehouseId?: string): Promise<PurchaseOrder[]> {
    const response = await apiClient.post('/api/purchase-orders/generate-from-reorder-points/', {
      supermarket: supermarketId,
      warehouse: warehouseId
    });
    return response.data;
  }

  static async markAsReceived(id: string, receivedItems: Array<{ itemId: string; quantityReceived: number }>): Promise<PurchaseOrder> {
    const response = await apiClient.patch(`/api/purchase-orders/${id}/mark-received/`, { received_items: receivedItems });
    return response.data;
  }
}

// Analytics and Reporting
export class OrderAnalyticsService {
  static async getOrderAnalytics(supermarketId: string, dateFrom?: string, dateTo?: string): Promise<OrderAnalytics> {
    const params: any = { supermarket: supermarketId };
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    
    const response = await apiClient.get('/api/order-analytics/', { params });
    return response.data;
  }

  static async getChannelPerformance(supermarketId: string, dateFrom?: string, dateTo?: string): Promise<any> {
    const params: any = { supermarket: supermarketId };
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    
    const response = await apiClient.get('/api/channel-performance/', { params });
    return response.data;
  }

  static async getStockAlerts(supermarketId: string): Promise<any> {
    const response = await apiClient.get('/api/stock-alerts/', { params: { supermarket: supermarketId } });
    return response.data;
  }

  static async getSyncLogs(channelId?: string, type?: string): Promise<ChannelSyncLog[]> {
    const params: any = {};
    if (channelId) params.channel = channelId;
    if (type) params.type = type;
    
    const response = await apiClient.get('/api/sync-logs/', { params });
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  }
}

// Utility Functions
export class OrderManagementUtils {
  static generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random}`;
  }

  static calculateOrderTotals(items: EnhancedOrderItem[]): {
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
  } {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = items.reduce((sum, item) => sum + item.taxAmount, 0);
    const discountAmount = items.reduce((sum, item) => sum + item.discountAmount, 0);
    const totalAmount = subtotal + taxAmount - discountAmount;

    return { subtotal, taxAmount, discountAmount, totalAmount };
  }

  static validateStockAvailability(items: EnhancedOrderItem[], stockLevels: StockLevel[]): {
    isValid: boolean;
    errors: Array<{ productId: string; requested: number; available: number }>;
  } {
    const errors: Array<{ productId: string; requested: number; available: number }> = [];

    for (const item of items) {
      const stock = stockLevels.find(s => s.productId === item.productId);
      if (!stock || stock.available < item.quantity) {
        errors.push({
          productId: item.productId,
          requested: item.quantity,
          available: stock?.available || 0
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  static getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      'PENDING': 'yellow',
      'CONFIRMED': 'blue',
      'PROCESSING': 'orange',
      'SHIPPED': 'purple',
      'DELIVERED': 'green',
      'RETURNED': 'red',
      'CANCELLED': 'gray'
    };
    return statusColors[status] || 'gray';
  }
}