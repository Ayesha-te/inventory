import Auth from './features/auth';
import React, { useState, useEffect, useMemo } from 'react';
import Dashboard from './components/Dashboard';
import ProductScanner from './components/ProductScanner';
import ProductForm from './components/ProductForm';
import SupermarketDashboard from './components/SupermarketDashboard';
import SupermarketDashboardView from './components/SupermarketDashboardView';
import ProductCatalog from './components/ProductCatalog';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import Suppliers from './components/Suppliers';
import SubStoreManagement from './components/SubStoreManagement';
import MultiStoreDashboard from './components/MultiStoreDashboard';
import MultiStoreProductCatalog from './components/MultiStoreProductCatalog';
import MultiStoreProductForm from './components/MultiStoreProductForm';
import AdaptiveProductCatalog from './components/AdaptiveProductCatalog';
import AdaptiveProductForm from './components/AdaptiveProductForm';
import MyStores from './components/MyStores';
import POSSync from './components/POSSync';
import DashboardGraphs from './components/DashboardGraphs';
import BarcodeTicketManager from './components/BarcodeTicketManager';
import StockiveDashboard from './components/StockiveDashboard';

import HelpPage from './components/HelpPage';
import ClearancePage from './components/ClearancePage';
import MultiChannelOrders from './components/MultiChannelOrders';
import ChannelManagement from './components/ChannelManagement';
import StockManagement from './components/StockManagement';
import WarehouseManagement from './components/multiChannel/WarehouseManagement';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useProducts, useCategories, useSuppliers, useSupermarkets } from './hooks/useApi';
import { ProductService, CategoryService, SupplierService, SupermarketService, AuthService } from './services/apiService';
import { analyzeStoreContext, getNavigationItems } from './utils/storeUtils';
import { getSuppliersWithFallback } from './data/demoData';
import DebugStoreInfo from './components/DebugStoreInfo';
import type { Product, Supermarket, User } from './types/Product';


function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'stockive-dashboard' | 'supermarket-overview' | 'scanner' | 'add-product' | 'stores' | 'catalog' | 'analytics' | 'pos-sync' | 'settings' | 'barcode-demo' | 'suppliers' | 'purchase-orders' | 'purchasing-reports' | 'clearance' | 'multi-channel-orders' | 'channel-management' | 'stock-management' | 'warehouse-management' | 'login' | 'signup'>('login');
  const [products, setProducts] = useState<Product[]>([]);
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedForBT, setSelectedForBT] = useState<string[]>([]);
  const [initialPlan, setInitialPlan] = useState<string>('BASIC');

  // Initial routing from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const plan = params.get('plan');

    if (plan) {
      setInitialPlan(plan.toUpperCase());
    }

    if (mode === 'signup') {
      setCurrentView('signup');
    } else if (mode === 'login') {
      setCurrentView('login');
    }

    // Clean up URL params to keep it clean after reading
    if (mode || plan) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  // Authentication
  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await AuthService.login(email, password);
      
      if (response.user) {
        const user: User = {
          id: response.user.id,
          email: response.user.email,
          name: `${response.user.first_name} ${response.user.last_name}`.trim() || response.user.email.split('@')[0],
          registrationDate: response.user.registration_date?.split('T')[0] || new Date().toISOString().split('T')[0],
          isVerified: response.user.is_verified || false,
          subscription: {
            plan: response.user.subscription_plan?.toLowerCase() || 'basic',
            expiryDate: response.user.subscription_end_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          }
        };

        setCurrentUser(user);
        setIsAuthenticated(true);
        setCurrentView('stockive-dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const handleSignup = async (email: string, password: string, firstName: string, lastName: string, supermarketName?: string, phone?: string, address?: string, subscriptionPlan?: string) => {
    try {
      const registrationData = {
        email,
        password,
        password_confirm: password,
        first_name: firstName,
        last_name: lastName,
        phone: phone || '',
        address: address || '',
        company_name: supermarketName || '',
        supermarket_name: supermarketName || '',
        subscription_plan: subscriptionPlan || 'BASIC'
      };

      const response = await AuthService.register(registrationData);
      
      if (response.user) {
        const user: User = {
          id: response.user.id,
          email: response.user.email,
          name: `${response.user.first_name} ${response.user.last_name}`.trim() || response.user.email.split('@')[0],
          registrationDate: response.user.registration_date?.split('T')[0] || new Date().toISOString().split('T')[0],
          isVerified: response.user.is_verified || false,
          subscription: {
            plan: response.user.subscription_plan?.toLowerCase() || 'basic',
            expiryDate: response.user.subscription_end_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          }
        };

        setCurrentUser(user);
        setIsAuthenticated(true);

        // If supermarket name provided, create a main store via API
        if (supermarketName) {
          try {
            console.log('Creating main supermarket during signup:', supermarketName);
            
            const createdSupermarket = await SupermarketService.createSupermarketWithDefaults({
              name: supermarketName,
              address: 'Main Location',
              phone: '+1-555-0100',
              email: email,
              description: `${supermarketName} - Main Store`
            });
            
            console.log('Main supermarket created during signup:', createdSupermarket);
            
            const mainStore: Supermarket = {
              id: createdSupermarket.id,
              name: createdSupermarket.name,
              address: createdSupermarket.address,
              phone: createdSupermarket.phone,
              email: createdSupermarket.email,
              description: createdSupermarket.description,
              registrationDate: createdSupermarket.registration_date?.split('T')[0] || new Date().toISOString().split('T')[0],
              isVerified: createdSupermarket.is_verified || false,
              ownerId: user.id,
              isSubStore: false,
              posSystem: {
                enabled: false,
                type: 'none',
                syncEnabled: false
              }
            };
            setSupermarkets([mainStore]);
          } catch (error) {
            console.error('Failed to create main supermarket during signup:', error);
            // Don't fail the entire signup process, just log the error
            console.log('Signup completed but supermarket creation failed. User can create it later.');
          }
        }

        setCurrentView('stockive-dashboard');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setCurrentUser(null);
      setIsAuthenticated(false);
      setProducts([]);
      setSupermarkets([]);
      setCategories([]);
      setSuppliers([]);
      setCurrentView('login');
    }
  };

    // Data Loading
    const loadData = async () => {
    if (!isAuthenticated) return;

    try {
      // Load categories
      const categoriesResponse = await CategoryService.getCategories();
      const categoriesData = Array.isArray(categoriesResponse) ? categoriesResponse : categoriesResponse.results || [];
      const apiCategories = categoriesData.map((cat: any) => cat.name || cat.toString());
      setCategories(Array.from(new Set(apiCategories)).filter(Boolean));

      // Load suppliers
      const suppliersResponse = await SupplierService.getSuppliers();
      const suppliersData = Array.isArray(suppliersResponse) ? suppliersResponse : suppliersResponse.results || [];
      const apiSuppliers = suppliersData.map((sup: any) => sup.name || sup.toString());
      setSuppliers(getSuppliersWithFallback(apiSuppliers));

      // Load products
      const productsResponse = await ProductService.getProducts();
      const productsData = Array.isArray(productsResponse) ? productsResponse : productsResponse.results || [];
      
      const mappedProducts = productsData.map((p: any) => ({
        id: String(p.id ?? ''),
        name: String(p.name ?? ''),
        category: String(p.category_name ?? p.category ?? ''),
        quantity: Number(p.quantity ?? 0),
        expiryDate: String(p.expiry_date ?? p.expiryDate ?? ''),
        supplier: String(p.supplier_name ?? p.supplier ?? ''),
        price: Number(p.selling_price ?? p.price ?? 0),
        addedDate: String(p.added_date ?? p.addedDate ?? new Date().toISOString()),
        supermarketId: String(p.supermarket_id ?? p.supermarket ?? 'default'),
        description: p.description ?? '',
        brand: p.brand ?? '',
        weight: p.weight ?? '',
        origin: p.origin ?? '',
        imageUrl: p.image ?? p.image_url ?? '',
        barcode: String(p.barcode ?? ''),
        halalCertified: (p.halal_certified ?? p.halalCertified) ?? true,
        halalCertificationBody: p.halal_certification_body ?? p.halalCertificationBody ?? '',
        costPrice: p.cost_price ?? undefined,
        sellingPrice: p.selling_price ?? p.price ?? undefined,
        minStockLevel: p.min_stock_level ?? undefined,
        location: p.location ?? '',
        syncedWithPOS: p.synced_with_pos ?? false,
        posId: p.pos_id ? String(p.pos_id) : undefined,
      }));
      setProducts(mappedProducts);

      // Load supermarkets
      const supermarketsResponse = await SupermarketService.getSupermarkets();
      const supermarketsData = Array.isArray(supermarketsResponse) ? supermarketsResponse : supermarketsResponse.results || [];
      
      console.log('🏪 Raw Supermarkets Data:', supermarketsData);
      console.log('👤 Current User for Store Mapping:', currentUser);
      
      // Debug: Log store data (can be removed in production)
      console.log(`Loaded ${supermarketsData.length} stores for user ${currentUser?.email}`);
      
      const mappedSupermarkets = supermarketsData.map((s: any) => {
        // Since getUserSupermarkets() already filters by user, we can trust these stores belong to the user
        let ownerId = s.owner_id ?? s.ownerId ?? s.owner ?? s.user_id ?? s.userId;
        
        // If no owner ID found, assign to current user since API filtered for user stores
        if (!ownerId && currentUser) {
          ownerId = currentUser.id;
          console.log(`Store ${s.name} assigned to current user (API filtered)`);
        }
        
        // Ensure ownerId is a string for consistent comparison
        ownerId = String(ownerId || '');
        
        return {
          id: String(s.id ?? ''),
          name: String(s.name ?? ''),
          address: String(s.address ?? ''),
          phone: String(s.phone ?? ''),
          email: String(s.email ?? ''),
          registrationDate: String(s.registration_date ?? s.registrationDate ?? new Date().toISOString()).split('T')[0],
          isVerified: Boolean(s.is_verified ?? s.isVerified ?? false),
          logo: s.logo ?? '',
          description: s.description ?? '',
          parentId: s.parent_id ?? s.parentId ?? undefined,
          isSubStore: Boolean(s.is_sub_store ?? s.isSubStore ?? false),
          ownerId: String(ownerId || ''),
          posSystem: {
            enabled: Boolean(s.pos_system?.enabled ?? false),
            type: s.pos_system?.type ?? 'none',
            apiKey: s.pos_system?.api_key ?? undefined,
            syncEnabled: Boolean(s.pos_system?.sync_enabled ?? false),
            lastSync: s.pos_system?.last_sync ?? undefined,
          }
        };
      });
      
      console.log('🏪 Mapped Supermarkets:', mappedSupermarkets);
      
      // Ensure user has at least one store
      let finalSupermarkets = mappedSupermarkets;
      const userStores = mappedSupermarkets.filter(s => s.ownerId === currentUser?.id);
      
      if (userStores.length === 0 && currentUser) {
        console.log('⚠️ No stores found for user, creating default store via API');
        try {
          const createdSupermarket = await SupermarketService.createSupermarketWithDefaults({
            name: 'My First Store',
            address: 'Default Address',
            phone: 'N/A',
            email: currentUser.email,
            description: 'Default store created automatically for new user.'
          });

          const newStore: Supermarket = {
            id: createdSupermarket.id,
            name: createdSupermarket.name,
            address: createdSupermarket.address,
            phone: createdSupermarket.phone,
            email: createdSupermarket.email,
            description: createdSupermarket.description,
            registrationDate: createdSupermarket.registration_date?.split('T')[0] || new Date().toISOString().split('T')[0],
            isVerified: createdSupermarket.is_verified || false,
            ownerId: currentUser.id,
            isSubStore: false,
            posSystem: {
              enabled: false,
              type: 'none',
              syncEnabled: false
            }
          };
          finalSupermarkets = [...mappedSupermarkets, newStore];
          console.log('✅ Default store created via API:', newStore);
        } catch (error) {
          console.error('Failed to create default store via API:', error);
        }
      }
      
      setSupermarkets(finalSupermarkets);

    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  // Load data when authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Product Management
  const addProduct = (product: Omit<Product, 'id'>) => {
    const primaryId = primaryStore ? primaryStore.id : supermarkets[0]?.id || 'default';
    const newProduct = {
      ...product,
      // Normalize supermarketId to a string ID
      supermarketId: String((product as any).supermarketId || (product as any).supermarket || primaryId),
      // Ensure price available (prefer sellingPrice)
      price: (product as any).sellingPrice ?? product.price ?? 0,
      id: 'product-' + Date.now()
    } as Product;
    setProducts(prev => [...prev, newProduct]);
  };

  const addBulkProducts = (products: Omit<Product, 'id'>[]) => {
    const newProducts = products.map(product => ({
      ...product,
      // Ensure required display fields are present
      category: product.category || (typeof (product as any).category_name === 'string' ? (product as any).category_name : ''),
      supplier: product.supplier || (typeof (product as any).supplier_name === 'string' ? (product as any).supplier_name : ''),
      supermarketId: product.supermarketId || (typeof (product as any).supermarket === 'string' ? (product as any).supermarket : 'default'),
      price: (product as any).sellingPrice ?? product.price ?? 0,
      id: 'product-' + Date.now() + '-' + Math.random()
    }));
    setProducts(prev => [...prev, ...newProducts]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleProductSave = (product: Product | Omit<Product, 'id'>) => {
    if ('id' in product) {
      updateProduct(product);
    } else {
      addProduct(product);
    }
    setCurrentView('dashboard');
    setEditingProduct(null);
  };

  // Multi-store product save
  const handleMultiStoreSave = (product: Omit<Product, 'id'>, storeIds: string[]) => {
    const multiStoreProducts = storeIds.map(storeId => ({
      ...product,
      supermarketId: storeId,
      id: 'product-' + Date.now() + '-' + Math.random() + '-' + storeId
    }));
    setProducts(prev => [...prev, ...multiStoreProducts]);
    setCurrentView('dashboard');
    setEditingProduct(null);
  };

  // Store Management
  const addSupermarket = async (supermarket: Omit<Supermarket, 'id'>) => {
    try {
      console.log('Creating supermarket via API:', supermarket);
      
      // Call the actual API to create supermarket
      const createdSupermarket = await SupermarketService.createSupermarketWithDefaults({
        name: supermarket.name,
        address: supermarket.address,
        phone: supermarket.phone,
        email: supermarket.email,
        description: supermarket.description
      });
      
      console.log('Supermarket created successfully:', createdSupermarket);
      
      // Update local state with the API response
      const newSupermarket = {
        id: createdSupermarket.id,
        name: createdSupermarket.name,
        address: createdSupermarket.address,
        phone: createdSupermarket.phone,
        email: createdSupermarket.email,
        description: createdSupermarket.description,
        registrationDate: createdSupermarket.registration_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        isVerified: createdSupermarket.is_verified || false,
        ownerId: currentUser?.id || '',
        isSubStore: supermarket.isSubStore || false,
        posSystem: {
          enabled: false,
          type: 'none' as const,
          syncEnabled: false
        }
      } as const;
      
      setSupermarkets((prev) => [...prev, newSupermarket as any]);
      alert('Supermarket created successfully!');
    } catch (error) {
      console.error('Failed to create supermarket:', error);
      alert(`Failed to create supermarket: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  const updateSupermarket = (updatedSupermarket: Supermarket) => {
    setSupermarkets(prev => prev.map(s => s.id === updatedSupermarket.id ? updatedSupermarket : s));
  };

  const deleteSupermarket = (id: string) => {
    setSupermarkets(prev => prev.filter(s => s.id !== id));
    // Also remove products from that store
    setProducts(prev => prev.filter(p => p.supermarketId !== id));
  };

  const updatePOSConfig = (storeId: string, posConfig: Supermarket['posSystem']) => {
    setSupermarkets(prev => prev.map(store => 
      store.id === storeId 
        ? { ...store, posSystem: posConfig }
        : store
    ));
  };

  // Bulk product actions between stores
  const handleBulkProductAction = (action: 'copy' | 'move', productIds: string[], targetStoreId: string) => {
    const sourceProducts = products.filter(p => productIds.includes(p.id));
    
    if (action === 'copy') {
      const copiedProducts = sourceProducts.map(product => ({
        ...product,
        id: 'product-' + Date.now() + '-' + Math.random(),
        supermarketId: targetStoreId
      }));
      setProducts(prev => [...prev, ...copiedProducts]);
    } else if (action === 'move') {
      setProducts(prev => prev.map(product => 
        productIds.includes(product.id)
          ? { ...product, supermarketId: targetStoreId }
          : product
      ));
    }
  };

  // Enhanced bulk actions for multi-store catalog
  const handleMultiStoreBulkAction = (action: string, productIds: string[], targetStoreId?: string) => {
    switch (action) {
      case 'copy':
        if (targetStoreId) {
          handleBulkProductAction('copy', productIds, targetStoreId);
        }
        break;
      case 'move':
        if (targetStoreId) {
          handleBulkProductAction('move', productIds, targetStoreId);
        }
        break;
      case 'delete':
        setProducts(prev => prev.filter(p => !productIds.includes(p.id)));
        break;
      default:
        console.warn('Unknown bulk action:', action);
    }
  };

  // Handle product duplication to multiple stores
  const handleProductDuplication = (product: Product, storeIds: string[]) => {
    const duplicatedProducts = storeIds.map(storeId => ({
      ...product,
      id: 'product-' + Date.now() + '-' + Math.random() + '-' + storeId,
      supermarketId: storeId
    }));
    setProducts(prev => [...prev, ...duplicatedProducts]);
  };

  // Navigate to specific store
  const handleNavigateToStore = (storeId: string) => {
    // Set the store as current context and navigate to catalog
    setCurrentView('catalog');
    // You could also set a selected store context here if needed
  };

  // Get store context and adaptive navigation
  const storeContext = analyzeStoreContext(supermarkets, currentUser);
  const navigationItems = getNavigationItems(storeContext, isAuthenticated, currentUser);
  console.log('Navigation Items:', navigationItems);
  console.log('isAuthenticated:', isAuthenticated);
  console.log('storeContext:', storeContext);

  // Get user's primary store
  const primaryStore = supermarkets.find(s => !s.isSubStore && s.ownerId === currentUser?.id) || supermarkets[0];

  if (isAuthenticated) {
    return (
      <StockiveDashboard 
        user={currentUser} 
        onLogout={handleLogout} 
        currentView={currentView}
        onViewChange={setCurrentView}
        navigationItems={navigationItems}
      >
        {/* Authenticated Views Content */}
        {currentView === 'dashboard' && (
          <div className="space-y-8">
            <DebugStoreInfo stores={supermarkets} currentUser={currentUser} />
            <DashboardGraphs 
              products={products} 
              supermarkets={supermarkets}
            />
            {storeContext.isMultiStore ? (
              <MultiStoreDashboard 
                products={products}
                stores={supermarkets}
                onEditProduct={(product) => {
                  setEditingProduct(product);
                  setCurrentView('add-product');
                }}
                onDeleteProduct={deleteProduct}
                onCopyProduct={(productId, targetStoreId) => {
                  handleBulkProductAction('copy', [productId], targetStoreId);
                }}
                onMoveProduct={(productId, targetStoreId) => {
                  handleBulkProductAction('move', [productId], targetStoreId);
                }}
              />
            ) : (
              <Dashboard 
                products={products}
                supermarkets={supermarkets}
                onEditProduct={(product) => {
                  setEditingProduct(product);
                  setCurrentView('add-product');
                }}
                onDeleteProduct={deleteProduct}
                fallbackStoreName={primaryStore?.name}
              />
            )}
          </div>
        )}

        {currentView === 'stockive-dashboard' && null /* The dashboard content is built into the shell for this view */}

        {currentView === 'supermarket-overview' && currentUser && (
          <SupermarketDashboardView
            user={currentUser}
            supermarkets={supermarkets}
            products={products}
            onViewSupermarket={(supermarketId) => {
              console.log('View supermarket:', supermarketId);
            }}
            onManageSupermarket={(supermarketId) => {
              setCurrentView('stores');
            }}
            onCreateSupermarket={() => {
              setCurrentView('stores');
            }}
          />
        )}

        {currentView === 'scanner' && (
          <ProductScanner products={products} />
        )}

        {currentView === 'add-product' && (
          <div className="space-y-4">
            <DebugStoreInfo stores={supermarkets} currentUser={currentUser} />
            <AdaptiveProductForm
              product={editingProduct}
              stores={supermarkets}
              categories={categories}
              suppliers={suppliers}
              currentUser={currentUser}
              onSave={handleProductSave}
              onCancel={() => {
                setCurrentView('dashboard');
                setEditingProduct(null);
              }}
              onDuplicateToStores={handleProductDuplication}
              onMultiStoreSave={handleMultiStoreSave}
            />
          </div>
        )}

        {currentView === 'catalog' && (
          <AdaptiveProductCatalog
            products={products}
            stores={supermarkets}
            currentUser={currentUser}
            onEditProduct={(product) => {
              setEditingProduct(product);
              setCurrentView('add-product');
            }}
            onDeleteProduct={deleteProduct}
            onCopyProduct={(productId, targetStoreId) => {
              handleBulkProductAction('copy', [productId], targetStoreId);
            }}
            onMoveProduct={(productId, targetStoreId) => {
              handleBulkProductAction('move', [productId], targetStoreId);
            }}
            onBulkAction={handleMultiStoreBulkAction}
          />
        )}

        {currentView === 'stores' && currentUser && (
          <MyStores stores={supermarkets} onNavigateToStore={handleNavigateToStore} />
        )}

        {currentView === 'pos-sync' && (
          <div className="bg-white rounded-3xl border border-gray-100 p-10 shadow-sm">
            <h2 className="text-3xl font-black text-gray-800 mb-6">POS Synchronization</h2>
            <POSSync 
              supermarket={primaryStore ? primaryStore : supermarkets[0]}
              onUpdatePOS={updatePOSConfig}
            />
          </div>
        )}

        {currentView === 'barcode-demo' && (
          <div className="bg-white rounded-3xl border border-gray-100 p-10 shadow-sm">
            <BarcodeTicketManager 
              products={products}
              selectedProducts={selectedForBT}
              onSelectionChange={setSelectedForBT}
            />
          </div>
        )}

        {currentView === 'analytics' && (
          <Analytics 
            products={products}
            supermarkets={supermarkets}
          />
        )}

        {currentView === 'suppliers' && (
          <Suppliers />
        )}

        {currentView === 'multi-channel-orders' && currentUser && (
          <MultiChannelOrders />
        )}

        {currentView === 'clearance' && (
          <ClearancePage />
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
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center font-sans">
      <div className="w-full max-w-4xl p-10">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-[#B7F000] rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-xl">
            <Package className="text-[#020617] w-10 h-10 -rotate-3" />
          </div>
          <h1 className="text-4xl font-black text-[#020617] tracking-tighter mb-2">STOCKIVE</h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px]">Secure Asset Management Ingress</p>
        </div>

        <main>
          {currentView === 'login' && (
            <Auth 
              mode="login" 
              onAuthSuccess={(email, password) => handleLogin(email, password)}
              showSignupOption={() => setCurrentView('signup')}
              initialPlan={initialPlan}
            />
          )}
          {currentView === 'signup' && (
            <Auth 
              mode="signup" 
              onAuthSuccess={(email, password, firstName, lastName, supermarketName, phone, address, subscriptionPlan) => handleSignup(email, password, firstName, lastName, supermarketName, phone, address, subscriptionPlan)}
              showLoginOption={() => setCurrentView('login')}
              initialPlan={initialPlan}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;