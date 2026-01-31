import React, { useState, useEffect } from 'react';
import { Save, X, Package, FileSpreadsheet, Camera, Plus, Store, Cpu, Activity, Database, ShieldCheck } from 'lucide-react';
import type { Product, Supermarket } from '../types/Product';
import ExcelUpload from './ExcelUpload';
import ImageImport from './ImageImport';
import { CategoryService, SupplierService } from '../services/apiService';
import { getSavedCurrencies, saveCurrency, getDefaultCurrency } from '../utils/currencyOptions';
import { getSavedCategories, saveCategory } from '../utils/categoryOptions';
import { getSavedSuppliers, saveSupplier, type SupplierOption } from '../utils/supplierOptions';

interface ProductFormProps {
  onSave: (product: Product | Omit<Product, 'id'>) => Promise<void> | void;
  onBulkSave?: (products: Omit<Product, 'id'>[]) => Promise<void> | void;
  onMultiStoreSave?: (product: Omit<Product, 'id'>, storeIds: string[]) => Promise<void> | void;
  initialProduct?: Product | null;
  onCancel: () => void;
  supermarketId: string;
  userStores?: Supermarket[];
  supplierOptions?: SupplierOption[];
  onCategoryCreated?: () => void;
  onSupplierCreated?: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ 
  onSave, 
  onBulkSave, 
  onMultiStoreSave, 
  initialProduct, 
  onCancel, 
  supermarketId, 
  userStores = [],
  onCategoryCreated,
  onSupplierCreated
}) => {
  const [currentView, setCurrentView] = useState<'options' | 'manual' | 'excel' | 'image'>('options');
  const [addToAllStores, setAddToAllStores] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 0,
    expiryDate: '',
    supplier: '',
    price: 0,
    costPrice: 0,
    sellingPrice: 0,
    minStockLevel: 5,
    addedDate: new Date().toISOString().split('T')[0],
    supermarketId: supermarketId,
    description: '',
    brand: '',
    weight: '',
    origin: '',
    halalCertified: false,
    halalCertificationBody: ''
  });

  const selectedStore = userStores.find(store => store.id === (formData.supermarketId || supermarketId));
  const selectedCurrency = selectedStore?.currency || '';

  const [currencyOptions, setCurrencyOptions] = useState<string[]>([]);
  const [currencyMode, setCurrencyMode] = useState<'select' | 'custom'>('select');
  const [currency, setCurrency] = useState<string>('');

  useEffect(() => {
    const opts = getSavedCurrencies();
    setCurrencyOptions(opts);
    setCurrencyMode(opts.length ? 'select' : 'custom');
    if (opts.length > 0) {
      setCurrency(opts[0]);
    } else {
      setCurrency('');
    }
  }, []);

  useEffect(() => {
    if (initialProduct) {
      setFormData({
        name: initialProduct.name,
        category: initialProduct.category,
        quantity: initialProduct.quantity,
        expiryDate: initialProduct.expiryDate,
        supplier: initialProduct.supplier,
        price: initialProduct.price,
        costPrice: initialProduct.costPrice || 0,
        sellingPrice: initialProduct.sellingPrice || 0,
        addedDate: initialProduct.addedDate,
        supermarketId: initialProduct.supermarketId,
        description: initialProduct.description || '',
        brand: initialProduct.brand || '',
        weight: initialProduct.weight || '',
        origin: initialProduct.origin || '',
        halalCertified: !!initialProduct.halalCertified,
        halalCertificationBody: initialProduct.halalCertificationBody || ''
      });
    }
  }, [initialProduct]);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError('');
    setIsSubmitting(true);

    const errors: Record<string, string> = {};

    if (!formData.supermarketId) {
      errors.supermarketId = 'Store selection is required';
    }
    if (!currency) {
      errors.currency = 'Currency selection is required';
    }
    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    }
    if (!formData.category.trim()) {
      errors.category = 'Category is required';
    }
    if (!formData.supplier.trim()) {
      errors.supplier = 'Supplier is required';
    }
    if (!formData.expiryDate) {
      errors.expiryDate = 'Expiry date is required';
    }
    if (formData.costPrice <= 0) {
      errors.costPrice = 'Cost price must be greater than 0';
    }
    if (formData.sellingPrice <= 0) {
      errors.sellingPrice = 'Selling price must be greater than 0';
    }
    if (formData.price < 0) {
      errors.price = 'Display price cannot be negative';
    }
    if (formData.quantity < 0) {
      errors.quantity = 'Quantity cannot be negative';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setGeneralError('Please fix the errors before submitting.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      if (initialProduct) {
        await onSave({
          ...formData,
          id: initialProduct.id,
          price: formData.price || formData.sellingPrice || 0
        });
      } else {
        const productData = {
          ...formData,
          price: formData.price > 0 ? formData.price : (formData.sellingPrice || 0)
        };
        
        if (addToAllStores && userStores.length > 1 && onMultiStoreSave) {
          const allStoreIds = userStores.map(store => store.id);
          await onMultiStoreSave(productData, allStoreIds);
        } else {
          await onSave(productData);
        }
      }
    } catch (err: any) {
      setGeneralError(err?.message || 'Failed to save product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      const numValue = parseFloat(value) || 0;
      setFormData(prev => {
        const newData = { ...prev, [name]: numValue };
        if (name === 'sellingPrice' && (prev.price === 0 || !prev.price)) {
          newData.price = numValue;
        }
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [categoryMode, setCategoryMode] = useState<'select' | 'custom'>('select');
  const [supplierOptions, setSupplierOptions] = useState<SupplierOption[]>([]);
  const [supplierMode, setSupplierMode] = useState<'select' | 'custom'>('select');

  useEffect(() => {
    try {
      const saved = getSavedCategories();
      setCategoryOptions(saved);
      setCategoryMode(saved.length ? 'select' : 'custom');
    } catch {}

    const loadCategories = async () => {
      try {
        const res = await CategoryService.getCategories();
        const list = Array.isArray(res) ? res : (res?.results || []);
        const names = list
          .map((c: any) => String(c?.name || ''))
          .filter(Boolean);
        if (names.length) {
          const merged = Array.from(new Set([...(getSavedCategories() || []), ...names])).sort((a, b) => a.localeCompare(b));
          merged.forEach((n: string) => saveCategory(n));
          setCategoryOptions(merged);
          setCategoryMode('select');
        }
      } catch {}
    };
    loadCategories();

    try {
      const savedSuppliers = getSavedSuppliers();
      setSupplierOptions(savedSuppliers);
      setSupplierMode(savedSuppliers.length ? 'select' : 'custom');
    } catch {}

    const loadSuppliers = async () => {
      try {
        const res = await SupplierService.getSuppliers();
        const list = Array.isArray(res) ? res : (res?.results || []);
        const suppliers = list
          .map((s: any, index: number) => ({
            id: String(s?.id || `backend-${index}`),
            name: String(s?.name || '')
          }))
          .filter(supplier => supplier.name.length > 0);
        
        if (suppliers.length) {
          const saved = getSavedSuppliers();
          const merged: SupplierOption[] = [];
          saved.forEach(supplier => {
            if (!merged.some(s => s.name === supplier.name)) {
              merged.push(supplier);
            }
          });
          suppliers.forEach((supplier: SupplierOption) => {
            if (!merged.some(s => s.name === supplier.name)) {
              merged.push(supplier);
              saveSupplier(supplier.name, supplier.id);
            }
          });
          merged.sort((a, b) => a.name.localeCompare(b.name));
          setSupplierOptions(merged);
          setSupplierMode('select');
        }
      } catch {}
    };
    loadSuppliers();
  }, []);

  const handleAddCategory = async () => {
    const name = window.prompt('Enter new category name');
    if (!name || !name.trim()) return;
    const clean = name.trim();
    try {
      saveCategory(clean);
      const updated = getSavedCategories();
      setCategoryOptions(updated);
      setFormData(prev => ({ ...prev, category: clean }));
      try { 
        await CategoryService.createCategory({ name: clean }); 
        if (onCategoryCreated) onCategoryCreated();
      } catch (e: any) {
        console.error('Backend category creation failed:', e);
      }
    } catch (e: any) {
      alert(e?.message || 'Failed to create category');
    }
  };

  const handleAddSupplier = async () => {
    const name = window.prompt('Enter new supplier name');
    if (!name || !name.trim()) return;
    const clean = name.trim();
    try {
      saveSupplier(clean);
      const updated = getSavedSuppliers();
      setSupplierOptions(updated);
      setFormData(prev => ({ ...prev, supplier: clean }));
      try { 
        await SupplierService.createSupplier({ name: clean }); 
        if (onSupplierCreated) onSupplierCreated();
      } catch (e: any) {
        console.error('Backend supplier creation failed:', e);
      }
    } catch (e: any) {
      alert(e?.message || 'Failed to create supplier');
    }
  };

  const handleAddCurrency = async () => {
    const code = window.prompt('Enter new currency code (e.g., EUR, GBP, CAD)');
    if (!code || !code.trim()) return;
    const clean = code.trim().toUpperCase();
    if (clean.length !== 3) {
      alert('Currency code must be exactly 3 characters');
      return;
    }
    try {
      saveCurrency(clean);
      const updated = getSavedCurrencies();
      setCurrencyOptions(updated);
      setCurrency(clean);
    } catch (e: any) {
      alert(e?.message || 'Failed to add currency');
    }
  };

  const handleExcelImport = (products: Omit<Product, 'id'>[]) => {
    if (onBulkSave) {
      onBulkSave(products);
    }
    onCancel();
  };

  const handleImageImport = (product: Omit<Product, 'id'>) => {
    onSave(product);
    onCancel();
  };

  useEffect(() => {
    if (initialProduct) {
      setCurrentView('manual');
    }
  }, [initialProduct]);

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      {currentView === 'options' && !initialProduct && (
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#B7F000]/5 rounded-full -mr-64 -mt-64 blur-[120px]"></div>
          
          <div className="flex items-center justify-between mb-12 relative z-10">
            <div className="flex items-center">
              <div className="bg-[#B7F000] p-4 rounded-2xl mr-6 shadow-[0_8px_30px_rgba(183,240,0,0.3)]">
                <Package className="w-8 h-8 text-[#020617]" />
              </div>
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-1">ADD PRODUCTS</h2>
                <div className="flex items-center gap-3">
                  <span className="h-1 w-6 bg-[#B7F000] rounded-full"></span>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Choose how to add products</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={onCancel}
              className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-all group"
            >
              <X className="w-6 h-6 text-slate-400 group-hover:text-slate-900" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative z-10">
            {[
              { id: 'manual', icon: Plus, title: 'Manual Entry', desc: 'Type details manually' },
              { id: 'excel', icon: FileSpreadsheet, title: 'Bulk Import', desc: 'Upload many from Excel' },
              { id: 'image', icon: Camera, title: 'Visual Scan', desc: 'Scan product labels' }
            ].map((option) => (
              <div 
                key={option.id}
                onClick={() => setCurrentView(option.id as any)}
                className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 cursor-pointer hover:bg-white hover:border-[#B7F000] hover:shadow-xl hover:shadow-[#B7F000]/5 transition-all duration-500 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#B7F000]/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-[#B7F000]/20 transition-all"></div>
                <div className="text-center relative z-10">
                  <div className="bg-white group-hover:bg-[#B7F000] p-6 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-slate-100 transition-all duration-500 shadow-sm group-hover:shadow-[0_8px_30px_rgba(183,240,0,0.2)]">
                    <option.icon className="w-10 h-10 text-[#B7F000] group-hover:text-[#020617] transition-all duration-500" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight uppercase group-hover:text-slate-800 transition-colors">{option.title}</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">{option.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-slate-900 rounded-[32px] p-8 relative z-10 overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-all"></div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#B7F000] p-1.5 rounded-lg">
                <Cpu className="w-5 h-5 text-[#020617]" />
              </div>
              <h4 className="font-black text-white text-lg uppercase tracking-tight">System Info</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                'Type each product detail',
                'Upload large Excel files',
                'Use AI to read labels'
              ].map((text, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="bg-[#B7F000] w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-2.5 h-2.5 text-[#020617]" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight leading-snug">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentView === 'excel' && (
        <ExcelUpload 
          onProductsExtracted={handleExcelImport}
          onCancel={() => setCurrentView('options')}
          supermarketId={supermarketId}
          storeCurrency={selectedCurrency}
        />
      )}

      {currentView === 'image' && (
        <ImageImport 
          onProductExtracted={handleImageImport}
          onCancel={() => setCurrentView('options')}
          supermarketId={supermarketId}
        />
      )}

      {currentView === 'manual' && (
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#B7F000]/5 rounded-full -mr-48 -mt-48 blur-[100px]"></div>
          
          <div className="flex items-center justify-between mb-12 relative z-10">
            <div className="flex items-center">
              <div className="bg-[#B7F000] p-4 rounded-2xl mr-6 shadow-[0_8px_30px_rgba(183,240,0,0.3)]">
                <Package className="w-8 h-8 text-[#020617]" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-1">
                  {initialProduct ? 'EDIT PRODUCT' : 'ADD PRODUCT'}
                </h2>
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-[#7AA100]" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                    {initialProduct ? 'Update product details' : 'New product information'}
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={initialProduct ? onCancel : () => setCurrentView('options')}
              className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-all group"
            >
              <X className="w-6 h-6 text-slate-400 group-hover:text-slate-900" />
            </button>
          </div>

          {generalError && (
            <div className="bg-red-50 text-red-600 p-5 rounded-2xl mb-8 text-[10px] font-black uppercase tracking-widest border border-red-100 flex items-center gap-3 animate-in slide-in-from-top-4">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Store Node */}
              <div className="space-y-2.5">
                <label className="block text-slate-400 font-black text-[10px] uppercase tracking-wider ml-1">STORE NAME</label>
                <div className="relative group">
                  <select
                    name="supermarketId"
                    value={formData.supermarketId}
                    onChange={handleChange}
                    className={`w-full px-6 py-4 bg-slate-50 border ${fieldErrors.supermarketId ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-[#B7F000]/20 focus:border-[#B7F000] text-slate-900 font-bold outline-none transition-all appearance-none`}
                  >
                    <option value="">Select Store</option>
                    {userStores.map(store => (
                      <option key={store.id} value={store.id}>{store.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-[#B7F000] transition-colors">
                    <Store className="w-5 h-5" />
                  </div>
                </div>
                {fieldErrors.supermarketId && (
                  <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{fieldErrors.supermarketId}</p>
                )}
              </div>

              {/* Base Currency */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <label className="block text-slate-400 font-black text-[10px] uppercase tracking-wider">CURRENCY</label>
                  <button type="button" onClick={handleAddCurrency} className="text-[9px] font-black uppercase tracking-widest text-[#7AA100] hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> NEW
                  </button>
                </div>
                <div className="relative group">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className={`w-full px-6 py-4 bg-slate-50 border ${fieldErrors.currency ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-[#B7F000]/20 focus:border-[#B7F000] text-slate-900 font-bold outline-none transition-all appearance-none`}
                  >
                    <option value="">Select Currency</option>
                    {currencyOptions.map(curr => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-[#B7F000] transition-colors">
                    <Database className="w-5 h-5" />
                  </div>
                </div>
                {fieldErrors.currency && (
                  <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{fieldErrors.currency}</p>
                )}
              </div>

              {/* Product Name */}
              <div className="space-y-2.5 md:col-span-2">
                <label className="block text-slate-400 font-black text-[10px] uppercase tracking-wider ml-1">PRODUCT NAME</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-6 py-4 bg-slate-50 border ${fieldErrors.name ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-[#B7F000]/20 focus:border-[#B7F000] text-slate-900 font-bold outline-none transition-all placeholder:text-slate-300`}
                  placeholder="Enter product name"
                />
                {fieldErrors.name && (
                  <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{fieldErrors.name}</p>
                )}
              </div>

              {/* Classification */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <label className="block text-slate-400 font-black text-[10px] uppercase tracking-wider">CATEGORY</label>
                  <button type="button" onClick={handleAddCategory} className="text-[9px] font-black uppercase tracking-widest text-[#7AA100] hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> NEW
                  </button>
                </div>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-6 py-4 bg-slate-50 border ${fieldErrors.category ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-[#B7F000]/20 focus:border-[#B7F000] text-slate-900 font-bold outline-none transition-all appearance-none`}
                >
                  <option value="">Select Category</option>
                  {categoryOptions.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {fieldErrors.category && (
                  <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{fieldErrors.category}</p>
                )}
              </div>

              {/* Origin Source */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <label className="block text-slate-400 font-black text-[10px] uppercase tracking-wider">SUPPLIER</label>
                  <button type="button" onClick={handleAddSupplier} className="text-[9px] font-black uppercase tracking-widest text-[#7AA100] hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> NEW
                  </button>
                </div>
                <select
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  className={`w-full px-6 py-4 bg-slate-50 border ${fieldErrors.supplier ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-[#B7F000]/20 focus:border-[#B7F000] text-slate-900 font-bold outline-none transition-all appearance-none`}
                >
                  <option value="">Select Supplier</option>
                  {supplierOptions.map(opt => (
                    <option key={String(opt.id)} value={String(opt.name)}>{opt.name}</option>
                  ))}
                </select>
                {fieldErrors.supplier && (
                  <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{fieldErrors.supplier}</p>
                )}
              </div>

              {/* Quantity & Threshold */}
              <div className="space-y-2.5">
                <label className="block text-slate-400 font-black text-[10px] uppercase tracking-wider ml-1">QUANTITY</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#B7F000]/20 focus:border-[#B7F000] text-slate-900 font-bold outline-none transition-all"
                  placeholder="0"
                />
                {fieldErrors.quantity && (
                  <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{fieldErrors.quantity}</p>
                )}
              </div>

              <div className="space-y-2.5">
                <label className="block text-slate-400 font-black text-[10px] uppercase tracking-wider ml-1">LOW STOCK ALERT</label>
                <input
                  type="number"
                  name="minStockLevel"
                  value={formData.minStockLevel}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#B7F000]/20 focus:border-[#B7F000] text-slate-900 font-bold outline-none transition-all"
                  placeholder="5"
                />
              </div>

              {/* Expiration */}
              <div className="space-y-2.5">
                <label className="block text-slate-400 font-black text-[10px] uppercase tracking-wider ml-1">EXPIRY DATE</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className={`w-full px-6 py-4 bg-slate-50 border ${fieldErrors.expiryDate ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-[#B7F000]/20 focus:border-[#B7F000] text-slate-900 font-bold outline-none transition-all`}
                />
                {fieldErrors.expiryDate && (
                  <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{fieldErrors.expiryDate}</p>
                )}
              </div>

              {/* Cost & Selling Price */}
              <div className="space-y-2.5">
                <label className="block text-slate-400 font-black text-[10px] uppercase tracking-wider ml-1">COST PRICE</label>
                <div className="relative group">
                  <input
                    type="number"
                    name="costPrice"
                    value={formData.costPrice}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-6 pr-6 py-4 bg-slate-50 border ${fieldErrors.costPrice ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-[#B7F000]/20 focus:border-[#B7F000] text-slate-900 font-bold outline-none transition-all`}
                  />
                </div>
                {fieldErrors.costPrice && (
                  <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{fieldErrors.costPrice}</p>
                )}
              </div>

              <div className="space-y-2.5">
                <label className="block text-slate-400 font-black text-[10px] uppercase tracking-wider ml-1">SELLING PRICE</label>
                <div className="relative group">
                  <input
                    type="number"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-6 pr-6 py-4 bg-slate-50 border ${fieldErrors.sellingPrice ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-[#B7F000]/20 focus:border-[#B7F000] text-slate-900 font-bold outline-none transition-all`}
                  />
                </div>
                {fieldErrors.sellingPrice && (
                  <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{fieldErrors.sellingPrice}</p>
                )}
              </div>

              <div className="space-y-2.5">
                <label className="block text-slate-400 font-black text-[10px] uppercase tracking-wider ml-1">DISPLAY PRICE</label>
                <div className="relative group">
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-6 pr-6 py-4 bg-slate-50 border ${fieldErrors.price ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-[#B7F000]/20 focus:border-[#B7F000] text-slate-900 font-bold outline-none transition-all`}
                  />
                </div>
                {fieldErrors.price && (
                  <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{fieldErrors.price}</p>
                )}
              </div>

              {/* Secondary Details */}
              <div className="space-y-2.5">
                <label className="block text-slate-400 font-black text-[10px] uppercase tracking-wider ml-1">BRAND</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#B7F000]/20 focus:border-[#B7F000] text-slate-900 font-bold outline-none transition-all"
                  placeholder="Manufacturer / Brand"
                />
              </div>

              <div className="space-y-2.5">
                <label className="block text-slate-400 font-black text-[10px] uppercase tracking-wider ml-1">WEIGHT</label>
                <input
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#B7F000]/20 focus:border-[#B7F000] text-slate-900 font-bold outline-none transition-all"
                  placeholder="e.g., 500g, 1L"
                />
              </div>

              {/* Geographic Source */}
              <div className="space-y-2.5">
                <label className="block text-slate-400 font-black text-[10px] uppercase tracking-wider ml-1">COUNTRY</label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#B7F000]/20 focus:border-[#B7F000] text-slate-900 font-bold outline-none transition-all"
                  placeholder="Country of production"
                />
              </div>

              {/* Ethic Certification */}
              <div className="flex items-center p-6 bg-slate-50 rounded-[32px] border border-slate-200">
                <label className="flex items-center cursor-pointer group w-full">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="halalCertified"
                      checked={formData.halalCertified}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#B7F000]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#020617] after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#B7F000] peer-checked:after:bg-[#020617]"></div>
                  </div>
                  <span className="ml-6 text-[10px] font-black uppercase tracking-widest text-slate-900 group-hover:text-[#7AA100] transition-colors">HALAL CERTIFIED</span>
                </label>
              </div>

              {/* Description */}
              <div className="md:col-span-2 space-y-2.5">
                <label className="block text-slate-400 font-black text-[10px] uppercase tracking-wider ml-1">DESCRIPTION</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#B7F000]/20 focus:border-[#B7F000] text-slate-900 font-bold outline-none transition-all resize-none placeholder:text-slate-300"
                  placeholder="Enter product description..."
                />
              </div>
            </div>

            {/* Sync to all stores */}
            {!initialProduct && userStores.length > 1 && (
              <div className="bg-slate-50 rounded-[40px] p-10 border border-slate-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#B7F000]/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-[#B7F000]/10 transition-all"></div>
                <div className="flex items-center mb-8 relative z-10">
                  <div className="bg-[#B7F000] p-4 rounded-2xl mr-6 shadow-[0_8px_20px_rgba(183,240,0,0.3)]">
                    <Store className="w-8 h-8 text-[#020617]" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-2xl tracking-tight uppercase">Sync with all stores</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Add this product to all your stores at once.</p>
                  </div>
                </div>
                
                <label className="flex items-center cursor-pointer group/label relative z-10 p-6 bg-white rounded-[32px] border border-slate-100 hover:border-[#B7F000]/50 hover:shadow-lg transition-all">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={addToAllStores}
                      onChange={(e) => setAddToAllStores(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-slate-100 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#B7F000]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#020617] after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#B7F000] peer-checked:after:bg-[#020617]"></div>
                  </div>
                  <span className="ml-6 text-sm font-black text-slate-900 uppercase tracking-widest group-hover/label:text-[#7AA100] transition-colors">
                    Sync with all available stores ({userStores.length})
                  </span>
                </label>
                
                {addToAllStores && (
                  <div className="mt-8 flex flex-wrap gap-3 relative z-10 animate-in fade-in zoom-in-95 duration-500">
                    {userStores.map(store => (
                      <span key={store.id} className="px-5 py-2 bg-[#B7F000]/10 rounded-full text-[10px] font-black text-[#7AA100] uppercase tracking-widest border border-[#B7F000]/20">
                        STORE: {store.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-8 mt-16 pt-12 border-t border-slate-100">
              <button
                type="button"
                onClick={onCancel}
                className="px-10 py-5 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all"
              >
                Terminate
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-14 py-6 ${isSubmitting ? 'bg-slate-400' : 'bg-[#B7F000] hover:bg-[#A3D900]'} text-[#020617] rounded-[24px] font-black text-sm uppercase tracking-widest transition-all shadow-[0_12px_40px_rgba(183,240,0,0.4)] hover:shadow-[0_15px_50px_rgba(183,240,0,0.5)] hover:-translate-y-2 flex items-center gap-4`}
              >
                <Save className={`w-6 h-6 ${isSubmitting ? 'animate-pulse' : ''}`} />
                {isSubmitting ? 'Processing...' : (initialProduct ? 'Update Registry' : 'Commit Asset')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductForm;