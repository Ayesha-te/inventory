import React from 'react';
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

const Dashboard: React.FC<DashboardProps> = ({
  products,
  supermarkets,
  onEditProduct,
  onDeleteProduct,
  onNavigate,
  fallbackStoreName,
}) => {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ExpiryAlerts products={products} />
        <LowStockAlerts products={products} />
      </div>

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
  );
};

export default Dashboard;
