import React from 'react';
import { Package } from 'lucide-react';
import type { Product, Supermarket } from '../types/Product';
import ProductList from './ProductList';
import ExpiryAlerts from './ExpiryAlerts';
import LowStockAlerts from './LowStockAlerts';

interface DashboardProps {
  products: Product[];
  supermarkets?: Supermarket[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onNavigate?: (view: string) => void;
  fallbackStoreName?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ products, supermarkets, onEditProduct, onDeleteProduct, onNavigate, fallbackStoreName }) => {
  if (products.length === 0) {
    return null; // DashboardGraphs handles the main empty state
  }

  return (
    <div className="space-y-8">
      {/* Alerts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ExpiryAlerts products={products} />
        <LowStockAlerts products={products} />
      </div>

      {/* Inventory Overview */}
      <div className="bg-white rounded-[40px] border border-[#E5E7EB] shadow-sm p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#B7F000]/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        
        <div className="flex items-center justify-between mb-12 relative z-10">
          <div className="flex items-center">
            <div className="bg-[#B7F000] p-4 rounded-2xl mr-6 rotate-3 shadow-[0_8px_20px_rgba(183,240,0,0.3)]">
              <Package className="w-8 h-8 text-[#020617] -rotate-3" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-[#020617] tracking-tight">Inventory Registry</h2>
              <p className="text-gray-500 font-medium">Real-time asset management and protocol monitoring.</p>
            </div>
          </div>
        </div>

        {/* Product List */}
        <ProductList 
          products={products} 
          supermarkets={supermarkets}
          onEdit={onEditProduct}
          onDelete={onDeleteProduct}
          onNavigate={onNavigate}
          fallbackStoreName={fallbackStoreName}
          showBarcode={false}
        />
      </div>
    </div>
  );
};

export default Dashboard;
