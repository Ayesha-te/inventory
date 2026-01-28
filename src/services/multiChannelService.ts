/**
 * API Service for Multi-Channel Order Management System
 * Handles communication with Django backend for multi-channel operations
 */

import type { 
  Channel, 
  SKUMapping, 
  StockLevel, 
  EnhancedOrder, 
  AutomationRule, 
  Warehouse, 
  CourierService,
  OrderAnalytics,
  DashboardMetrics,
  ChannelTestResult,
  StockSyncResult,
  OrderImportResult,
  ChannelFormData,
  AutomationRuleFormData,
  WarehouseFormData,
  OrderFilters
} from '../types/MultiChannelTypes';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://uneven-martina-sagiyqwgey-54535183.koyeb.app/';
const ENHANCED_ORDERS_BASE = `${API_BASE_URL}/enhanced-orders`;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.detail || errorMessage;
    } catch (e) {
      // If we can't parse JSON, use the status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

// Helper function to make API requests with better error handling
const apiRequest = async (url: string, options: RequestInit = {}) => {
  try {
    console.log(`Making API request to: ${url}`);
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    });
    const data = await handleResponse(response);
    console.log(`API request successful: ${url}`, data);
    return data;
  } catch (error) {
    console.error(`API request failed: ${url}`, error);
    throw error;
  }
};

export class MultiChannelService {
  // Channel Management
  static async getChannels(): Promise<Channel[]> {
    try {
      const data = await apiRequest(`${ENHANCED_ORDERS_BASE}/channels/`);
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      console.error('Failed to fetch channels:', error);
      // Return empty array as fallback to prevent UI crashes
      return [];
    }
  }

  static async createChannel(channelData: ChannelFormData): Promise<Channel> {
    const response = await fetch(`${ENHANCED_ORDERS_BASE}/channels/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(channelData)
    });
    return handleResponse(response);
  }

  static async updateChannel(id: string, channelData: Partial<ChannelFormData>): Promise<Channel> {
    const response = await fetch(`${ENHANCED_ORDERS_BASE}/channels/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(channelData)
    });
    return handleResponse(response);
  }

  static async deleteChannel(id: string): Promise<void> {
    const response = await fetch(`${ENHANCED_ORDERS_BASE}/channels/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to delete channel: ${response.status}`);
    }
  }

  static async testChannelConnection(channelData: ChannelFormData): Promise<ChannelTestResult> {
    const response = await fetch(`${ENHANCED_ORDERS_BASE}/channels/test-connection/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(channelData)
    });
    return handleResponse(response);
  }

  // SKU Mapping
  static async getSKUMappings(channelId?: string): Promise<SKUMapping[]> {
    const url = channelId 
      ? `${ENHANCED_ORDERS_BASE}/sku-mappings/?channel=${channelId}`
      : `${ENHANCED_ORDERS_BASE}/sku-mappings/`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : data.results || [];
  }

  static async createSKUMapping(mappingData: Omit<SKUMapping, 'id' | 'createdAt' | 'updatedAt'>): Promise<SKUMapping> {
    const response = await fetch(`${ENHANCED_ORDERS_BASE}/sku-mappings/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(mappingData)
    });
    return handleResponse(response);
  }

  static async updateSKUMapping(id: string, mappingData: Partial<SKUMapping>): Promise<SKUMapping> {
    const response = await fetch(`${ENHANCED_ORDERS_BASE}/sku-mappings/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(mappingData)
    });
    return handleResponse(response);
  }

  static async deleteSKUMapping(id: string): Promise<void> {
    const response = await fetch(`${ENHANCED_ORDERS_BASE}/sku-mappings/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to delete SKU mapping: ${response.status}`);
    }
  }

  // Stock Management
  static async getStockLevels(warehouseId?: string): Promise<StockLevel[]> {
    const url = warehouseId 
      ? `${ENHANCED_ORDERS_BASE}/stock-levels/?warehouse=${warehouseId}`
      : `${ENHANCED_ORDERS_BASE}/stock-levels/`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : data.results || [];
  }

  static async updateStockLevels(updates: { productId: string; warehouseId: string; quantity: number }[]): Promise<StockSyncResult> {
    const response = await fetch(`${ENHANCED_ORDERS_BASE}/stock-levels/update/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ updates })
    });
    return handleResponse(response);
  }

  static async syncStockToChannels(channelIds?: string[]): Promise<StockSyncResult> {
    const response = await fetch(`${ENHANCED_ORDERS_BASE}/stock-levels/sync-to-channels/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ channel_ids: channelIds })
    });
    return handleResponse(response);
  }

  // Enhanced Orders
  static async getEnhancedOrders(filters?: OrderFilters): Promise<EnhancedOrder[]> {
    let url = `${ENHANCED_ORDERS_BASE}/enhanced-orders/`;
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.status?.length) params.append('status', filters.status.join(','));
      if (filters.channels?.length) params.append('channels', filters.channels.join(','));
      if (filters.paymentStatus?.length) params.append('payment_status', filters.paymentStatus.join(','));
      if (filters.fulfillmentStatus?.length) params.append('fulfillment_status', filters.fulfillmentStatus.join(','));
      if (filters.priority?.length) params.append('priority', filters.priority.join(','));
      if (filters.search) params.append('search', filters.search);
      if (filters.dateRange) {
        params.append('date_from', filters.dateRange.start);
        params.append('date_to', filters.dateRange.end);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : data.results || [];
  }

  static async getEnhancedOrder(id: string): Promise<EnhancedOrder> {
    const response = await fetch(`${ENHANCED_ORDERS_BASE}/enhanced-orders/${id}/`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }

  static async updateOrderStatus(id: string, status: EnhancedOrder['status'], notes?: string): Promise<EnhancedOrder> {
    const response = await fetch(`${ENHANCED_ORDERS_BASE}/enhanced-orders/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, notes })
    });
    return handleResponse(response);
  }

  static async importChannelOrders(channelIds?: string[]): Promise<OrderImportResult> {
    const response = await fetch(`${ENHANCED_ORDERS_BASE}/enhanced-orders/import/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ channel_ids: channelIds })
    });
    return handleResponse(response);
  }

  // Automation Rules
  static async getAutomationRules(): Promise<AutomationRule[]> {
    const response = await fetch(`${ENHANCED_ORDERS_BASE}/automation-rules/`, {
      headers: getAuthHeaders()
    });
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : data.results || [];
  }

  static async createAutomationRule(ruleData: AutomationRuleFormData): Promise<AutomationRule> {
    const response = await fetch(`${ENHANCED_ORDERS_BASE}/automation-rules/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(ruleData)
    });
    return handleResponse(response);
  }

  static async updateAutomationRule(id: string, ruleData: Partial<AutomationRuleFormData>): Promise<AutomationRule> {
    const response = await fetch(`${ENHANCED_ORDERS_BASE}/automation-rules/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(ruleData)
    });
    return handleResponse(response);
  }

  static async deleteAutomationRule(id: string): Promise<void> {
    const response = await fetch(`${ENHANCED_ORDERS_BASE}/automation-rules/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to delete automation rule: ${response.status}`);
    }
  }

  // Warehouses
  static async getWarehouses(): Promise<Warehouse[]> {
    const response = await fetch(`${ENHANCED_ORDERS_BASE}/warehouses/`, {
      headers: getAuthHeaders()
    });
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : data.results || [];
  }

  static async createWarehouse(warehouseData: WarehouseFormData): Promise<Warehouse> {
    const response = await fetch(`${ENHANCED_ORDERS_BASE}/warehouses/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(warehouseData)
    });
    return handleResponse(response);
  }

  static async updateWarehouse(id: string, warehouseData: Partial<WarehouseFormData>): Promise<Warehouse> {
    const response = await fetch(`${ENHANCED_ORDERS_BASE}/warehouses/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(warehouseData)
    });
    return handleResponse(response);
  }

  static async deleteWarehouse(id: string): Promise<void> {
    const response = await fetch(`${ENHANCED_ORDERS_BASE}/warehouses/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to delete warehouse: ${response.status}`);
    }
  }

  // Courier Services
  static async getCourierServices(): Promise<CourierService[]> {
    const response = await fetch(`${ENHANCED_ORDERS_BASE}/courier-services/`, {
      headers: getAuthHeaders()
    });
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : data.results || [];
  }

  // Analytics and Metrics
  static async getOrderAnalytics(dateRange?: { start: string; end: string }): Promise<OrderAnalytics> {
    let url = `${ENHANCED_ORDERS_BASE}/analytics/`;
    if (dateRange) {
      url += `?date_from=${dateRange.start}&date_to=${dateRange.end}`;
    }
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }

  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await fetch(`${ENHANCED_ORDERS_BASE}/dashboard-metrics/`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }

  // Bulk Operations
  static async bulkUpdateOrderStatus(orderIds: string[], status: EnhancedOrder['status']): Promise<{ success: number; failed: number }> {
    const response = await fetch(`${ENHANCED_ORDERS_BASE}/enhanced-orders/bulk-update-status/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ order_ids: orderIds, status })
    });
    return handleResponse(response);
  }

  static async bulkFulfillOrders(orderIds: string[], warehouseId: string, courierService?: string): Promise<{ success: number; failed: number }> {
    const response = await fetch(`${ENHANCED_ORDERS_BASE}/enhanced-orders/bulk-fulfill/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        order_ids: orderIds, 
        warehouse_id: warehouseId,
        courier_service: courierService 
      })
    });
    return handleResponse(response);
  }

  // Webhook Management (for displaying webhook URLs to users)
  static getWebhookUrls() {
    const baseUrl = API_BASE_URL.replace('/api', '');
    return {
      shopify: `${baseUrl}/api/enhanced-orders/webhooks/shopify/`,
      amazon: `${baseUrl}/api/enhanced-orders/webhooks/amazon/`,
      ebay: `${baseUrl}/api/enhanced-orders/webhooks/ebay/`,
      woocommerce: `${baseUrl}/api/enhanced-orders/webhooks/woocommerce/`,
      etsy: `${baseUrl}/api/enhanced-orders/webhooks/etsy/`
    };
  }
}

export default MultiChannelService;