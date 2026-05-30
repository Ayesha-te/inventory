import React from 'react';
import { AlertTriangle, Calendar, Clock } from 'lucide-react';
import type { Product } from '../types/Product';

interface ExpiryAlertsProps {
  products: Product[];
}

const ExpiryAlerts: React.FC<ExpiryAlertsProps> = ({ products }) => {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const expiringProducts = products.filter((product) => {
    const expiryDate = new Date(product.expiryDate);
    return expiryDate <= thirtyDaysFromNow && expiryDate > now;
  });

  const expiredProducts = products.filter((product) => {
    const expiryDate = new Date(product.expiryDate);
    return expiryDate <= now;
  });

  if (expiringProducts.length === 0 && expiredProducts.length === 0) {
    return (
      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Expiry dates look good</h3>
            <p className="text-sm text-slate-500">No products are expiring in the next 30 days.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Expiry alerts</h3>
          <p className="text-sm text-slate-500">Products that need attention because of expiry timing.</p>
        </div>
      </div>

      {expiredProducts.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <h4 className="text-sm font-semibold text-red-700">Expired products</h4>
          </div>
          <div className="space-y-2">
            {expiredProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                  <p className="text-xs text-red-600">
                    Expired on {new Date(product.expiryDate).toLocaleDateString()}
                  </p>
                </div>
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                  Qty {product.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {expiringProducts.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <h4 className="text-sm font-semibold text-amber-700">Expiring soon</h4>
          </div>
          <div className="space-y-2">
            {expiringProducts.map((product) => {
              const expiryDate = new Date(product.expiryDate);
              const daysUntilExpiry = Math.ceil(
                (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <div key={product.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                    <p className="text-xs text-amber-700">
                      Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''} ({expiryDate.toLocaleDateString()})
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    Qty {product.quantity}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default ExpiryAlerts;
