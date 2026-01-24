import React from 'react';
import { AlertTriangle, Calendar, Clock } from 'lucide-react';
import type { Product } from '../types/Product';


interface ExpiryAlertsProps {
  products: Product[];
}

const ExpiryAlerts: React.FC<ExpiryAlertsProps> = ({ products }) => {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const expiringProducts = products.filter(product => {
    const expiryDate = new Date(product.expiryDate);
    return expiryDate <= thirtyDaysFromNow && expiryDate > now;
  });

  const expiredProducts = products.filter(product => {
    const expiryDate = new Date(product.expiryDate);
    return expiryDate <= now;
  });

  if (expiringProducts.length === 0 && expiredProducts.length === 0) {
    return (
      <div className="bg-white rounded-[32px] border border-[#E5E7EB] p-8 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#B7F000]/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-[#B7F000]/10 transition-all"></div>
        <div className="flex items-center relative z-10">
          <div className="bg-[#B7F000] p-4 rounded-2xl mr-6 rotate-3 shadow-[0_4px_15px_rgba(183,240,0,0.2)]">
            <Calendar className="w-8 h-8 text-[#020617] -rotate-3" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#020617] uppercase tracking-tighter">Asset Integrity Verified</h3>
            <p className="text-[#65A30D] font-bold uppercase text-[10px] tracking-widest mt-1">No chronological obsolescence detected in next 30-day window.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {expiredProducts.length > 0 && (
        <div className="bg-[#020617] rounded-[32px] border border-red-500/20 p-8 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-red-500/10 transition-all"></div>
          <div className="flex items-center mb-8 relative z-10">
            <div className="bg-red-500 p-4 rounded-2xl mr-6 rotate-3">
              <AlertTriangle className="w-8 h-8 text-white -rotate-3" />
            </div>
            <div>
              <h3 className="text-xl font-black text-red-500 uppercase tracking-tighter">Chronological Violation</h3>
              <p className="text-red-500/50 font-bold uppercase text-[10px] tracking-widest mt-1">Immediate extraction required for expired inventory units.</p>
            </div>
          </div>
          <div className="space-y-3 relative z-10">
            {expiredProducts.map(product => (
              <div key={product.id} className="flex items-center justify-between bg-white/5 p-5 rounded-2xl border border-white/10 hover:border-red-500/30 transition-all">
                <div>
                  <p className="font-black text-white uppercase text-sm tracking-tighter">{product.name}</p>
                  <p className="text-[10px] font-bold text-red-500/70 uppercase tracking-widest mt-1">Protocol: Expired {new Date(product.expiryDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-red-500 font-black uppercase text-xs px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20">Qty: {product.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {expiringProducts.length > 0 && (
        <div className="bg-[#020617] rounded-[32px] border border-orange-500/20 p-8 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-orange-500/10 transition-all"></div>
          <div className="flex items-center mb-8 relative z-10">
            <div className="bg-orange-500 p-4 rounded-2xl mr-6 rotate-3">
              <Clock className="w-8 h-8 text-white -rotate-3" />
            </div>
            <div>
              <h3 className="text-xl font-black text-orange-500 uppercase tracking-tighter">Imminent Obsolescence</h3>
              <p className="text-orange-500/50 font-bold uppercase text-[10px] tracking-widest mt-1">Inventory units reaching terminal date within 30-day protocol.</p>
            </div>
          </div>
          <div className="space-y-3 relative z-10">
            {expiringProducts.map(product => {
              const expiryDate = new Date(product.expiryDate);
              const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={product.id} className="flex items-center justify-between bg-white/5 p-5 rounded-2xl border border-white/10 hover:border-orange-500/30 transition-all">
                  <div>
                    <p className="font-black text-white uppercase text-sm tracking-tighter">{product.name}</p>
                    <p className="text-[10px] font-bold text-orange-500/70 uppercase tracking-widest mt-1">
                      Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''} ({expiryDate.toLocaleDateString()})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-orange-500 font-black uppercase text-xs px-3 py-1 bg-orange-500/10 rounded-full border border-orange-500/20">Qty: {product.quantity}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default ExpiryAlerts;