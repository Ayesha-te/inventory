import React, { useState } from 'react';
import { Search, Package, MapPin, CheckCircle, Calendar, DollarSign, ChevronDown } from 'lucide-react';
import type { Product, Supermarket } from '../types/Product';
import { DEFAULT_REORDER_LEVEL } from '../constants/inventory';

interface ProductCatalogProps {
  products: Product[];
  supermarkets: Supermarket[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ 
  products, 
  supermarkets,
  searchQuery = '',
  onSearchChange
}) => {
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSupermarket, setFilterSupermarket] = useState('all');
  const [sortBy, setSortBy] = useState('price-high');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Build non-empty category list
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(c => !!c && String(c).trim() !== '')))] as string[];

  // Low stock count for alert banner
  const lowStockCount = products.filter(p => {
    const threshold = typeof p.minStockLevel === 'number' ? p.minStockLevel : DEFAULT_REORDER_LEVEL;
    return typeof p.quantity === 'number' && p.quantity <= threshold;
  }).length;

  // Resolve a supermarket display name
  const getSupermarketName = (supermarketRef: string) => {
    if (!supermarketRef) return 'Unknown Store';
    const byId = supermarkets.find(s => String(s.id) === String(supermarketRef));
    if (byId) return byId.name;
    const byName = supermarkets.find(
      s => String(s.name).trim().toLowerCase() === String(supermarketRef).trim().toLowerCase()
    );
    if (byName) return byName.name;
    return supermarketRef || 'Unknown Store';
  };

  const filteredProducts = products
    .filter(product => {
      // Backend already filters by name/barcode if searchQuery is provided
      const matchesCategory = filterCategory === 'all' || String(product.category).trim() === filterCategory;
      const matchesSupermarket = filterSupermarket === 'all' || 
        String(product.supermarketId) === String(filterSupermarket);

      const threshold = typeof product.minStockLevel === 'number' ? product.minStockLevel : DEFAULT_REORDER_LEVEL;
      const isLowStock = typeof product.quantity === 'number' && product.quantity <= threshold;
      const matchesLowStock = !lowStockOnly || isLowStock;

      return matchesCategory && matchesSupermarket && matchesLowStock && (product.halalCertified ?? true);
    })
    .sort((a, b) => {
      const numA = (val: any) => Number(val ?? 0);
      const priceA = numA((a as any).sellingPrice ?? a.price);
      const priceB = numA((b as any).sellingPrice ?? b.price);
      const parseExpiry = (d: string) => {
        const t = new Date(d).getTime();
        return Number.isNaN(t) ? Infinity : t;
      };

      switch (sortBy) {
        case 'price-low': return priceA - priceB;
        case 'price-high': return priceB - priceA;
        case 'expiry': return parseExpiry(a.expiryDate) - parseExpiry(b.expiryDate);
        case 'quantity': return numA(a.quantity) - numA(b.quantity);
        default: return a.name.localeCompare(b.name);
      }
    });

  const getExpiryStatus = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    if (expiry <= now) return { status: 'EXPIRED', color: 'text-red-500', bg: 'bg-red-500/10' };
    if (expiry <= thirtyDaysFromNow) return { status: 'EXPIRING', color: 'text-amber-500', bg: 'bg-amber-500/10' };
    return { status: 'GOOD', color: 'text-[#B7F000]', bg: 'bg-[#B7F000]/10' };
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Info */}
      <div className="bg-white p-10 rounded-[32px] border border-slate-200 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#B7F000]/5 rounded-full -mr-48 -mt-48 blur-[100px]"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center">
            <div className="bg-[#B7F000] p-5 rounded-2xl shadow-[0_8px_30px_rgba(183,240,0,0.2)] mr-6">
              <Package className="w-10 h-10 text-[#020617]" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="bg-[#B7F000]/15 text-[#7AA100] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-[#B7F000]/30">Item List</span>
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Product List</h2>
              <p className="text-slate-500 mt-3 font-medium text-sm max-w-md">List of all products in your stores.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-slate-50 px-8 py-5 rounded-2xl border border-slate-100 text-center min-w-[140px]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Items</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{products.length}</p>
            </div>
            <div className="bg-red-50 px-8 py-5 rounded-2xl border border-red-100 text-center min-w-[140px]">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Low Stock</p>
              <p className="text-3xl font-black text-red-600 tracking-tighter">{lowStockCount}</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-12 relative z-10">
          <div className="relative group lg:col-span-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-[#B7F000]" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="w-full px-6 py-3.5 pl-12 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#B7F000]/50 transition-all focus:bg-white"
            />
          </div>

          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#B7F000]/50 transition-all focus:bg-white appearance-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.filter(cat => cat !== 'all').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filterSupermarket}
              onChange={(e) => setFilterSupermarket(e.target.value)}
              className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#B7F000]/50 transition-all focus:bg-white appearance-none cursor-pointer"
            >
              <option value="all">All Stores</option>
              {supermarkets.map(supermarket => (
                <option key={supermarket.id} value={supermarket.id}>{supermarket.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#B7F000]/50 transition-all focus:bg-white appearance-none cursor-pointer"
            >
              <option value="name">A-Z</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="expiry">Expiry Date</option>
              <option value="quantity">Quantity</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          </div>

          <button 
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
              lowStockOnly 
                ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20' 
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
            }`}
          >
            Low Stock Only
            <div className={`w-2 h-2 rounded-full ${lowStockOnly ? 'bg-white' : 'bg-red-500'} animate-pulse`}></div>
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-[#B7F000] rounded-full"></div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">
              Filter Results: {filteredProducts.length} Items
            </h3>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-slate-200 p-24 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
              <Package className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">No products found</h3>
            <p className="text-slate-400 mt-2 text-sm">Try searching for something else or clear filters.</p>
            <button 
              onClick={() => {
                onSearchChange && onSearchChange('');
                setFilterCategory('all');
                setFilterSupermarket('all');
                setLowStockOnly(false);
              }}
              className="mt-10 bg-[#B7F000] text-black px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-[#B7F000]/20"
            >
              Clear All
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => {
              const expiryStatus = getExpiryStatus(product.expiryDate);
              const threshold = typeof product.minStockLevel === 'number' ? product.minStockLevel : DEFAULT_REORDER_LEVEL;
              const lowStock = typeof product.quantity === 'number' && product.quantity <= threshold;
              
              return (
                <div key={product.id} className="bg-white rounded-[32px] border border-slate-200 p-6 hover:border-[#B7F000] hover:shadow-xl hover:shadow-[#B7F000]/5 transition-all duration-500 flex flex-col group relative overflow-hidden shadow-sm">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#B7F000]/5 rounded-full blur-2xl group-hover:bg-[#B7F000]/10 transition-colors"></div>
                  
                  {/* Product Image */}
                  <div className="h-48 bg-slate-50 rounded-2xl flex items-center justify-center relative overflow-hidden mb-6 border border-slate-100">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <Package className="w-16 h-16 text-slate-200 group-hover:text-[#B7F000]/30 transition-colors" />
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-100 flex items-center shadow-sm">
                        <CheckCircle className="w-2.5 h-2.5 text-[#B7F000] mr-1.5" />
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-wider">Verified</span>
                      </div>
                      {lowStock && (
                        <div className="bg-red-500 px-2.5 py-1 rounded-lg flex items-center shadow-md shadow-red-500/10">
                          <span className="text-[8px] font-black text-white uppercase tracking-wider">Critical</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col flex-grow relative z-10">
                    <div className="mb-4">
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{product.category || 'General'}</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${expiryStatus.bg.replace('/10', '/20')} ${expiryStatus.color.replace('text-[#B7F000]', 'text-[#7AA100]')}`}>
                          {expiryStatus.status}
                        </span>
                      </div>
                      <h4 className="font-black text-lg text-slate-900 tracking-tight leading-tight group-hover:text-slate-800 transition-colors line-clamp-1">{product.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{product.brand || 'System Default'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Price</p>
                        <p className="text-xl font-black text-slate-900 tracking-tighter">${product.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Quantity</p>
                        <p className="text-xl font-black text-slate-900 tracking-tighter">{product.quantity}<span className="text-[10px] ml-1 text-slate-400 font-bold">U</span></p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 mb-6 flex items-center gap-3 rounded-xl border border-slate-100 group-hover:border-[#B7F000]/30 transition-colors">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-100 shadow-sm">
                        <MapPin className="w-4 h-4 text-[#B7F000]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none mb-1">Store</p>
                        <p className="text-[10px] font-bold text-slate-700 truncate">{getSupermarketName(product.supermarketId)}</p>
                      </div>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 bg-slate-50/50 px-3 py-2 rounded-xl border border-slate-100/50">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span className="text-[9px] font-bold text-slate-500 uppercase">{product.expiryDate || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-50/50 px-3 py-2 rounded-xl border border-slate-100/50">
                        <DollarSign className="w-3 h-3 text-slate-400" />
                        <span className="text-[9px] font-bold text-slate-500 uppercase">Margin: 24%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;
