import React from 'react';
import { AlertTriangle, Package } from 'lucide-react';
import type { Product } from '../types/Product';
import { DEFAULT_REORDER_LEVEL } from '../constants/inventory';

interface LowStockAlertsProps {
  products: Product[];
}

const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ products }) => {
  const lowStockProducts = products.filter(p => {
    const threshold = typeof p.minStockLevel === 'number' ? p.minStockLevel : DEFAULT_REORDER_LEVEL;
    return typeof p.quantity === 'number' && p.quantity <= threshold;
  });

  if (lowStockProducts.length === 0) {
    return (
      <div className="bg-white rounded-[32px] border border-[#E5E7EB] p-8 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#B7F000]/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-[#B7F000]/10 transition-all"></div>
        <div className="flex items-center relative z-10">
          <div className="bg-[#B7F000] p-4 rounded-2xl mr-6 rotate-3 shadow-[0_4px_15px_rgba(183,240,0,0.2)]">
            <Package className="w-8 h-8 text-[#020617] -rotate-3" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#020617] uppercase tracking-tighter">Stock Density Optimal</h3>
            <p className="text-[#65A30D] font-bold uppercase text-[10px] tracking-widest mt-1">All inventory units maintain sufficient protocol levels.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#020617] rounded-[32px] border border-red-500/20 p-8 shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-red-500/10 transition-all"></div>
      <div className="flex items-center mb-8 relative z-10">
        <div className="bg-red-500 p-4 rounded-2xl mr-6 rotate-3">
          <AlertTriangle className="w-8 h-8 text-white -rotate-3" />
        </div>
        <div>
          <h3 className="text-xl font-black text-red-500 uppercase tracking-tighter">Stock Deficiency</h3>
          <p className="text-red-500/50 font-bold uppercase text-[10px] tracking-widest mt-1">Inventory units at or below minimum reorder threshold.</p>
        </div>
      </div>
      <div className="space-y-3 relative z-10">
        {lowStockProducts.map(product => (
          <div key={product.id} className="flex items-center justify-between bg-white/5 p-5 rounded-2xl border border-white/10 hover:border-red-500/30 transition-all">
            <div>
              <p className="font-black text-white uppercase text-sm tracking-tighter">{product.name}</p>
              <p className="text-[10px] font-bold text-red-500/70 uppercase tracking-widest mt-1">
                Density: {product.quantity} units (Threshold: {typeof product.minStockLevel === 'number' ? product.minStockLevel : DEFAULT_REORDER_LEVEL})
              </p>
            </div>
            <div className="text-right">
              <span className="text-red-500 font-black uppercase text-[10px] tracking-widest px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20">Replenish Required</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LowStockAlerts;