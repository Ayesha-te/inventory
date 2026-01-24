import { API_CONFIG, API_ENDPOINTS, HTTP_METHODS, apiRequest, type ProductWithNames } from "../config/api";
import {
  AuthService,
  ProductService,
  CategoryService,
  SupplierService,
  SupermarketService,
  BarcodeService,
  SupplierProductService,
  PurchaseOrderService,
  POSIntegrationService,
  OrdersService,
  WarehouseService,
  RMAService,
  MappingService,
  ClearanceService,
  NotificationService
} from "../config/api";

// Re-export all service classes from api.ts
export {
  AuthService,
  ProductService,
  CategoryService,
  SupplierService,
  SupermarketService,
  BarcodeService,
  SupplierProductService,
  PurchaseOrderService,
  POSIntegrationService,
  OrdersService,
  WarehouseService,
  RMAService,
  MappingService,
  ClearanceService,
  NotificationService,
  API_ENDPOINTS,
  HTTP_METHODS,
  apiRequest
};

// Re-export types
export type { ProductWithNames };


