import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth.tsx';
import { useProducts, useCategories, useSuppliers, useSupermarkets, useOrders } from './hooks/useApi';
import { ProductService, CategoryService, SupplierService, SupermarketService } from './services/apiService';
import Auth from './features/auth';
import Dashboard from './components/Dashboard';
import ProductScanner from './components/ProductScanner';
import ProductForm from './components/ProductForm';
import ProductCatalog from './components/ProductCatalog';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import SubStoreManagement from './components/SubStoreManagement';
import MyStores from './components/MyStores';
import POSSync from './components/POSSync';
import DashboardGraphs from './components/DashboardGraphs';
import BarcodeTicketManager from './components/BarcodeTicketManager';
import { STORAGE_KEYS } from './constants/storageKeys';
import Suppliers from './components/Suppliers';
import StockiveDashboard from './components/StockiveDashboard';
import ClearancePage from './components/ClearancePage';
import MultiChannelOrders from './components/MultiChannelOrders';
import HelpPage from './components/HelpPage';
import logoImage from './assets/logo.png';

import type { Product, User } from './types/Product';

// Main App Content Component
const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading, login, logout, register } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'scanner' | 'add-product' | 'stores' | 'catalog' | 'analytics' | 'pos-sync' | 'settings' | 'barcode-demo' | 'suppliers' | 'clearance' | 'orders' | 'multi-channel-orders' | 'help' | 'login' | 'signup'>('login');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedForBT, setSelectedForBT] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // API data hooks
  const { data: products, loading: productsLoading, refetch: refetchProducts } = useProducts({ search: searchQuery });
  const { data: categories, refetch: refetchCategories } = useCategories();
  const { data: suppliers, refetch: refetchSuppliers } = useSuppliers();
  const { data: supermarkets, refetch: refetchSupermarkets } = useSupermarkets();
  const { data: orders, refetch: refetchOrders } = useOrders();

  // Handle authentication
  const handleLogin = async (email: string, password: string, supermarketName?: string) => {
    try {
      await login(email, password);
      setCurrentView('dashboard');
    } catch (error: any) {
      console.error('Login failed:', error);
      // Surface meaningful error back to Auth component
      throw new Error(error?.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleSignup = async (email: string, password: string, firstName: string, lastName: string, supermarketName?: string, phone?: string, address?: string) => {
    try {
      // Validate required fields
      if (!supermarketName?.trim()) {
        throw new Error('Supermarket name is required');
      }

      const userData = {
        email,
        password,
        password_confirm: password, // Add password confirmation field
        first_name: firstName || email.split('@')[0],
        last_name: lastName || '',
        phone: phone || '',
        address: address || '',
        company_name: supermarketName,
        supermarket_name: supermarketName
      };
      
      console.log('Registering user:', userData);
      await register(userData);
      
      // After successful registration, login to get token
      console.log('Logging in after registration...');
      await login(email, password);
      
      // After login, refresh supermarkets (auto-created on backend during registration)
      try {
        await refetchSupermarkets();
      } catch (e) {
        console.warn('Failed to refresh supermarkets after signup:', e);
      }
      
      setCurrentView('dashboard');
    } catch (error: any) {
      console.error('Signup failed:', error);
      // Bubble backend validation like password too short, email taken
      throw new Error(error?.message || 'Registration failed. Please check your details.');
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentView('login');
  };

  // Product management
  const handleProductSave = async (productData: Product | Omit<Product, 'id'>) => {
    try {
      console.log('Saving product data:', productData);
      
      // Transform the data to match backend expectations
      const transformedData = await transformProductDataForAPI(productData);
      console.log('Transformed data for API:', transformedData);
      
      if ('id' in productData) {
        // Update existing product
        await ProductService.updateProduct(productData.id, transformedData);
        alert('Product updated successfully!');
      } else {
        // Create new product
        await ProductService.createProduct(transformedData);
        alert('Product created successfully!');
      }
      
      // Refresh products list
      refetchProducts();
      setCurrentView('dashboard');
      setEditingProduct(null);
    } catch (error) {
      console.error('Failed to save product:', error);
      
      // Show user-friendly error message
      let errorMessage = 'Failed to save product. ';
      if (error instanceof Error) {
        if (error.message.includes('category')) {
          errorMessage += 'There was an issue with the category.';
        } else if (error.message.includes('supplier')) {
          errorMessage += 'There was an issue with the supplier.';
        } else if (error.message.includes('supermarket')) {
          errorMessage += 'No supermarket is available. Please go to Settings to create a supermarket, or try logging out and registering again.';
        } else if (error.message.includes('required')) {
          errorMessage += 'Please fill in all required fields.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Please check your input and try again.';
      }
      
      alert(errorMessage);
      throw error;
    }
  };

  // Helper function to transform product data for API
  const transformProductDataForAPI = async (productData: Product | Omit<Product, 'id'>) => {
    let categoryId = null;
    let supplierId = null;
    
    // Debug logging to identify the issue
    console.log("DEBUG categories:", categories);
    console.log("DEBUG categories type:", typeof categories);
    console.log("DEBUG categories is array:", Array.isArray(categories));
    console.log("DEBUG suppliers:", suppliers);
    console.log("DEBUG suppliers type:", typeof suppliers);
    console.log("DEBUG suppliers is array:", Array.isArray(suppliers));
    
    // Validate category by name and map to ID (auto-create if missing)
    if (productData.category) {
      const categoriesArray = Array.isArray(categories) ? categories : Object.values(categories || {});
      const normalize = (v: any) => String(v || '').trim().toLowerCase();
      const getCatName = (c: any) => (typeof c === 'string' ? c : c?.name);
      const getCatId = (c: any) => (c?.id || c?.pk || c?.uuid || c?.data?.id);
      const existingCategory = categoriesArray.find((cat: any) => normalize(getCatName(cat)) === normalize(productData.category));
      
      const catId = getCatId(existingCategory);
      if (catId) {
        categoryId = catId;
      } else {
        try {
          const created = await CategoryService.createCategory({ name: productData.category });
          categoryId = getCatId(created) || null;
        } catch (e) {
          console.warn('Category creation failed, trying to find existing:', e);
          // Fallback: fetch fresh categories and try to find it (maybe it was created by another process or recently)
          try {
            const freshRes = await CategoryService.getCategories();
            const freshList = Array.isArray(freshRes) ? freshRes : (freshRes?.results || []);
            const found = freshList.find((cat: any) => normalize(getCatName(cat)) === normalize(productData.category));
            categoryId = getCatId(found) || null;
          } catch (fetchErr) {
            console.error('Fallback fetch failed:', fetchErr);
          }
          
          if (!categoryId) {
            throw new Error(`Category not found and could not be created: ${productData.category}`);
          }
        }
      }
    }
    
    // Validate supplier by name and map to ID (auto-create if missing)
    if (productData.supplier) {
      const suppliersArray = Array.isArray(suppliers) ? suppliers : Object.values(suppliers || {});
      const normalize = (v: any) => String(v || '').trim().toLowerCase();
      const getSupName = (s: any) => (typeof s === 'string' ? s : s?.name);
      const getSupId = (s: any) => (s?.id || s?.pk || s?.uuid || s?.data?.id);
      const existingSupplier = suppliersArray.find((sup: any) => normalize(getSupName(sup)) === normalize(productData.supplier));
      
      const supId = getSupId(existingSupplier);
      if (supId) {
        supplierId = supId;
      } else {
        try {
          const created = await SupplierService.createSupplier({ name: productData.supplier });
          supplierId = getSupId(created) || null;
        } catch (e) {
          console.warn('Supplier creation failed, trying to find existing:', e);
          // Fallback: fetch fresh suppliers and try to find it
          try {
            const freshRes = await SupplierService.getSuppliers();
            const freshList = Array.isArray(freshRes) ? freshRes : (freshRes?.results || []);
            const found = freshList.find((sup: any) => normalize(getSupName(sup)) === normalize(productData.supplier));
            supplierId = getSupId(found) || null;
          } catch (fetchErr) {
            console.error('Fallback fetch failed:', fetchErr);
          }

          if (!supplierId) {
            throw new Error(`Supplier not found and could not be created: ${productData.supplier}`);
          }
        }
      }
    }
    
    // Determine supermarket ID:
    // 1) Use explicitly provided productData.supermarketId (if any)
    // 2) Use persisted selection from localStorage (STORAGE_KEYS.CURRENT_SUPERMARKET_ID)
    // 3) Fallback to the first available from fetched list
    const supermarketsArray = Array.isArray(supermarkets) ? supermarkets : Object.values(supermarkets || {});
    let supermarketId =
      // @ts-ignore - productData may be Omit<Product, 'id'>
      (productData as any).supermarketId ||
      (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.CURRENT_SUPERMARKET_ID) : null) ||
      supermarketsArray?.[0]?.id || null;

    // Log all supermarkets to aid debugging
    try {
      console.log('All supermarkets:', supermarketsArray.map((s: any) => ({ id: s.id, name: s.name })));
    } catch {}

    console.log('Chosen supermarketId:', supermarketId);
    
    // If no supermarket exists, try to fetch fresh data first, then create one if still none
    if (!supermarketId) {
      console.log("No supermarket found in cached data, fetching fresh data...");
      
      try {
        // Try to fetch fresh supermarkets data directly
        const freshSupermarkets = await SupermarketService.getSupermarkets();
        const freshSupermarketsArray = Array.isArray(freshSupermarkets) ? freshSupermarkets : freshSupermarkets.results || [];
        
        console.log("Fresh supermarkets data:", freshSupermarketsArray);
        
        if (freshSupermarketsArray.length > 0) {
          supermarketId = freshSupermarketsArray[0].id;
          console.log("Found supermarket in fresh data:", supermarketId);
        } else {
          console.log("No supermarket found even in fresh data, creating default supermarket...");
          
          const defaultSupermarketData = {
            name: (user as any)?.company_name || `${user?.first_name || 'My'} Supermarket` || 'Default Supermarket',
            description: 'Default supermarket created automatically',
            address: (user as any)?.address || 'Address not provided',
            phone: (user as any)?.phone || 'Phone not provided',
            email: user?.email || 'admin@example.com',
            is_active: true
          };
          
          const newSupermarket = await SupermarketService.createSupermarketWithDefaults(defaultSupermarketData);
          supermarketId = newSupermarket.id;
          
          console.log("Default supermarket created:", newSupermarket);
        }
        
        // Refresh supermarkets data in the hook
        await refetchSupermarkets();
        
      } catch (error) {
        console.error('Failed to fetch or create supermarket:', error);
        throw new Error('Unable to create or find a supermarket. Please contact support or try again later.');
      }
    }
    
    // Transform the data structure
    const apiData = {
      name: productData.name,
      description: productData.description || '',
      category: categoryId,
      supplier: supplierId,
      supermarket: supermarketId,
      brand: productData.brand || '',
      barcode: productData.barcode,
      cost_price: productData.costPrice || productData.price || 0,
      selling_price: productData.sellingPrice || productData.price || 0,
      price: productData.price || productData.sellingPrice || 0,
      quantity: productData.quantity,
      min_stock_level: productData.minStockLevel || 5,
      weight: productData.weight || '',
      origin: productData.origin || '',
      expiry_date: productData.expiryDate,
      location: productData.location || '',
      // halal_certified: productData.halalCertified || false,
      // halal_certification_body: productData.halalCertificationBody || '',
      image_url: productData.imageUrl || '',
      is_active: true
    };

    return apiData;
  };

  const handleProductDelete = async (productId: string) => {
    try {
      await ProductService.deleteProduct(productId);
      refetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  };

  // Navigation items
  const navigationItems = isAuthenticated ? [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'catalog', label: 'Products', icon: '📦' },
    { id: 'add-product', label: 'Add Products', icon: '➕' },
    { id: 'orders', label: 'Orders', icon: '📋' },
    { id: 'multi-channel-orders', label: 'Multi-Channel Orders', icon: '🌐' },
    { id: 'clearance', label: 'Clearance', icon: '🏷️' },
    { id: 'barcode-demo', label: 'Barcodes & Tickets', icon: '🏷️' },
    { id: 'scanner', label: 'Scanner', icon: '📱' },
    { id: 'stores', label: 'My Stores', icon: '🏪' },
    { id: 'pos-sync', label: 'POS Sync', icon: '🔄' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'suppliers', label: 'Suppliers', icon: '🤝' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ] : [];
  
  // Small helper to allow in-app links to switch tabs
  const navigate = (viewId: typeof currentView) => setCurrentView(viewId);

  // Determine selected supermarket: saved selection -> first available
  const savedSupermarketId = (typeof window !== 'undefined') ? localStorage.getItem(STORAGE_KEYS.CURRENT_SUPERMARKET_ID) : null;
  const selectedSupermarket = (supermarkets || []).find((s: any) => String(s.id) === String(savedSupermarketId)) || (supermarkets && supermarkets[0]) || null;
  
  // Debug supermarket data
  console.log('🏪 Supermarkets data:', supermarkets);
  console.log('🏪 Selected supermarket:', selectedSupermarket);
  console.log('🏪 Supermarket ID being passed:', selectedSupermarket?.id?.toString() || '(none)');

  if (isLoading) {
    return (
      <div className="min-h-screen theme-bg-secondary flex items-center justify-center">
        <div className="text-center">
          <img src={logoImage} alt="Stockive Logo" className="w-32 h-32 mx-auto mb-6 animate-pulse object-contain" />
          <div className="spinner mx-auto mb-4" style={{ width: '64px', height: '64px' }}></div>
          <h2 className="theme-text-primary text-xl font-semibold">Loading Stockive...</h2>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <StockiveDashboard 
        user={user} 
        onLogout={handleLogout} 
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          setEditingProduct(null);
        }}
        products={products || []}
        supermarkets={supermarkets || []}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      >
        {/* Authenticated Views Content */}
        {currentView === 'dashboard' && (
          <div className="space-y-8">
            {products && (
              <>
                <DashboardGraphs 
                  products={products} 
                  supermarkets={supermarkets || []}
                  onNavigate={(view) => setCurrentView(view as any)}
                />
                <Dashboard 
                  products={products} 
                  supermarkets={supermarkets || []}
                  selectedSupermarketId={selectedSupermarket?.id?.toString() || ''}
                  onEditProduct={(product) => {
                    setEditingProduct(product);
                    setCurrentView('add-product');
                  }}
                  onDeleteProduct={handleProductDelete}
                  onNavigate={(view) => setCurrentView(view as any)}
                />
              </>
            )}
            {productsLoading && (
              <div className="text-center py-12">
                <div className="spinner mx-auto mb-4" style={{ width: '64px', height: '64px' }}></div>
                <p className="theme-text-muted">Loading products...</p>
              </div>
            )}
          </div>
        )}

        {currentView === 'scanner' && products && (
          <ProductScanner products={products} />
        )}

        {currentView === 'add-product' && (
          <div className="bg-white rounded-[32px] border border-[#E5E7EB] p-10 shadow-sm">
            <h2 className="text-[#020617] text-3xl font-black mb-4 tracking-tight">Add Products</h2>
            <p className="text-gray-500 font-medium mb-8">
              Easily add new products to your inventory using manual entry, Excel upload, or image scan.
            </p>
            <ProductForm 
              onSave={handleProductSave}
              onCategoryCreated={() => refetchCategories()}
              onSupplierCreated={() => refetchSuppliers()}
              onBulkSave={async (products) => {
                // Handle bulk save
                for (const product of products) {
                  await ProductService.createProduct(product);
                }
                refetchProducts();
              }}
              initialProduct={editingProduct}
              supermarketId={selectedSupermarket?.id?.toString() || ''}
              userStores={supermarkets || []}
              supplierOptions={(suppliers || []).map((s: any) => ({ id: s.id, name: s.name }))}
              onCancel={() => {
                setCurrentView('dashboard');
                setEditingProduct(null);
              }}
            />
          </div>
        )}

        {currentView === 'catalog' && products && (
          <ProductCatalog 
            products={products}
            supermarkets={supermarkets || []}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {currentView === 'barcode-demo' && products && (
          <div className="bg-white rounded-[32px] border border-[#E5E7EB] p-10 shadow-sm">
            <BarcodeTicketManager
              products={products}
              selectedProducts={selectedForBT}
              onSelectionChange={setSelectedForBT}
            />
          </div>
        )}

        {currentView === 'stores' && user && (
          <MyStores 
            stores={supermarkets || []}
            onNavigateToStore={(storeId: string) => {
              try {
                if (typeof window !== 'undefined') {
                  localStorage.setItem(STORAGE_KEYS.CURRENT_SUPERMARKET_ID, String(storeId));
                }
                setCurrentView('dashboard');
              } catch {}
            }}
          />
        )}

        {currentView === 'pos-sync' && (
          <div className="bg-white rounded-[32px] border border-[#E5E7EB] p-10 shadow-sm">
            <h2 className="text-[#020617] text-3xl font-black mb-4 tracking-tight">POS Sync</h2>
            <p className="text-gray-500 font-medium mb-8">
              Connect your inventory with your Point-of-Sale (POS) system.
            </p>
            <POSSync 
              supermarket={selectedSupermarket as any}
              onUpdatePOS={(storeId, posConfig) => {
                // Handle POS update
              }}
            />
          </div>
        )}

        {currentView === 'analytics' && (
          <Analytics 
            products={products || []}
            supermarkets={supermarkets || []}
          />
        )}

        {currentView === 'suppliers' && (
          <div className="bg-white rounded-[32px] border border-[#E5E7EB] p-10 shadow-sm">
            <Suppliers />
          </div>
        )}

        {currentView === 'clearance' && (
          <div className="bg-white rounded-[32px] border border-[#E5E7EB] p-10 shadow-sm">
            <ClearancePage />
          </div>
        )}

        {currentView === 'orders' && (
          <div className="bg-white rounded-[32px] border border-[#E5E7EB] p-10 shadow-sm">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[#020617] text-3xl font-black mb-2 tracking-tight">Orders Management</h2>
                  <p className="text-gray-500 font-medium">Manage and track all your orders in one place</p>
                </div>
                <button className="bg-[#B7F000] text-[#020617] font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all">
                  New Order
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-[#F9FAFB] p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Total Orders</h3>
                  <p className="text-2xl font-black text-[#020617]">{(orders || []).length}</p>
                </div>
                <div className="bg-[#F9FAFB] p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Pending</h3>
                  <p className="text-2xl font-black text-[#020617]">{(orders || []).filter((o: any) => o.status === 'PENDING').length}</p>
                </div>
                <div className="bg-[#F9FAFB] p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Processing</h3>
                  <p className="text-2xl font-black text-[#020617]">{(orders || []).filter((o: any) => o.status === 'PROCESSING').length}</p>
                </div>
                <div className="bg-[#F9FAFB] p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Completed</h3>
                  <p className="text-2xl font-black text-[#020617]">{(orders || []).filter((o: any) => o.status === 'DELIVERED' || o.status === 'COMPLETED').length}</p>
                </div>
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[#020617]">Recent Orders</h3>
                  <div className="flex gap-2">
                    <button className="text-xs font-bold px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">Filter</button>
                    <button className="text-xs font-bold px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">Export</button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Order ID</th>
                        <th className="text-left py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer</th>
                        <th className="text-left py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Date</th>
                        <th className="text-left py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                        <th className="text-left py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Currency</th>
                        <th className="text-left py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(orders || []).length > 0 ? (orders || []).map((order: any) => (
                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-4 font-bold text-sm text-[#020617]">#{order.external_order_id || order.id.substring(0, 8)}</td>
                          <td className="py-4 px-4 text-sm font-medium">{order.customer_name || 'N/A'}</td>
                          <td className="py-4 px-4 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 ${
                              order.status === 'DELIVERED' || order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                              order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                            } text-[10px] font-black uppercase tracking-wider rounded-lg`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-black text-sm">${Number(order.total_amount).toFixed(2)}</td>
                          <td className="py-4 px-4">
                            <button className="text-[#020617] font-bold text-xs hover:underline">View</button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-500">No orders found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'multi-channel-orders' && isAuthenticated && user && (
          <div className="bg-white rounded-[32px] border border-[#E5E7EB] p-10 shadow-sm">
            <MultiChannelOrders currentUser={user} />
          </div>
        )}

        {currentView === 'settings' && (
          <Settings />
        )}

        {currentView === 'help' && (
          <HelpPage />
        )}
      </StockiveDashboard>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="inline-flex p-6 bg-white rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.05)] border border-gray-100 mb-8 transition-all hover:shadow-[0_25px_50px_rgba(0,0,0,0.08)]">
            <img 
              src={logoImage} 
              alt="Stockive Logo" 
              className="h-10 w-auto object-contain"
            />
          </div>
          <h1 className="text-4xl font-black text-[#020617] tracking-tight mb-2">STOCKIVE</h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">Cloud Inventory Management</p>
        </div>

        <div className="bg-white rounded-[40px] border border-[#E5E7EB] p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
          {currentView === 'login' || currentView === 'signup' ? (
            <>
              {currentView === 'login' && (
                <Auth 
                  mode="login" 
                  onAuthSuccess={handleLogin}
                  showSignupOption={() => setCurrentView('signup')}
                />
              )}
              {currentView === 'signup' && (
                <Auth 
                  mode="signup" 
                  onAuthSuccess={handleSignup}
                  showLoginOption={() => setCurrentView('login')}
                />
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4">Redirecting to login...</h2>
              <button 
                onClick={() => setCurrentView('login')}
                className="bg-[#020617] text-white px-8 py-3 rounded-xl font-bold"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-10 text-center">
          <p className="text-gray-400 text-xs font-medium">© 2024 Stockive IMS. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

// Main App Component with Auth Provider
const AppWithAPI: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default AppWithAPI;