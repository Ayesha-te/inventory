import React from 'react';
import { AlertTriangle, Package } from 'lucide-react';
import type { Product } from '../types/Product';
import { DEFAULT_REORDER_LEVEL } from '../constants/inventory';

interface LowStockAlertsProps {
  products: Product[];
}

const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ products }) => {
  const lowStockProducts = products.filter((product) => {
    const threshold = typeof product.minStockLevel === 'number' ? product.minStockLevel : DEFAULT_REORDER_LEVEL;
    return typeof product.quantity === 'number' && product.quantity <= threshold;
  });

  if (lowStockProducts.length === 0) {
    return (
      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Stock levels look good</h3>
            <p className="text-sm text-slate-500">All products are above their low stock level.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="rounded-2xl bg-red-100 p-3 text-red-700">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Low stock items</h3>
          <p className="text-sm text-slate-500">These products are at or below their low stock level.</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {lowStockProducts.map((product) => {
          const threshold =
            typeof product.minStockLevel === 'number' ? product.minStockLevel : DEFAULT_REORDER_LEVEL;

          return (
            <div key={product.id} className="flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                <p className="text-xs text-red-700">
                  {product.quantity} left (low stock level: {threshold})
                </p>
              </div>
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                Restock soon
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default LowStockAlerts;
