import React from 'react';
import {
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  Package,
  PieChart,
  Plus,
  Store,
  TrendingUp,
} from 'lucide-react';
import type { Product, Supermarket } from '../types/Product';

interface AnalyticsProps {
  products: Product[];
  supermarkets: Supermarket[];
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const Analytics: React.FC<AnalyticsProps> = ({ products, supermarkets }) => {
  const totalProducts = products.length;
  const totalUnits = products.reduce((sum, product) => sum + Number(product.quantity || 0), 0);
  const totalValue = products.reduce((sum, product) => sum + Number(product.price || 0) * Number(product.quantity || 0), 0);
  const averagePrice = totalUnits > 0 ? totalValue / totalUnits : null;

  const categoryStats = products.reduce((accumulator, product) => {
    const key = product.category || 'Uncategorized';
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {} as Record<string, number>);

  const supermarketStats = products.reduce((accumulator, product) => {
    const supermarket = supermarkets.find((store) => store.id === product.supermarketId);
    const key = supermarket?.name || 'Unknown Store';
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {} as Record<string, number>);

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiredProducts = products.filter((product) => new Date(product.expiryDate) <= now).length;
  const expiringProducts = products.filter((product) => {
    const expiry = new Date(product.expiryDate);
    return expiry <= thirtyDaysFromNow && expiry > now;
  }).length;
  const freshProducts = products.filter((product) => new Date(product.expiryDate) > thirtyDaysFromNow).length;

  const monthlyData = [
    { month: 'Jan', products: 45, value: 12500 },
    { month: 'Feb', products: 52, value: 14200 },
    { month: 'Mar', products: 48, value: 13800 },
    { month: 'Apr', products: 61, value: 16900 },
    { month: 'May', products: 58, value: 15600 },
    { month: 'Jun', products: 65, value: 18200 },
  ];

  const maxMonthValue = Math.max(...monthlyData.map((entry) => entry.value), 1);
  const categoryEntries = Object.entries(categoryStats).sort(([, first], [, second]) => second - first);
  const supermarketEntries = Object.entries(supermarketStats).sort(([, first], [, second]) => second - first);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Reports</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Analytics</h2>
            <p className="mt-2 text-sm text-slate-500">Real-time inventory performance across products and stores.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Generate Report
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Items"
          value={totalProducts.toLocaleString()}
          note={`${totalUnits.toLocaleString()} units in stock`}
          icon={<Package className="h-5 w-5" />}
          tone="slate"
        />
        <MetricCard
          label="Money Value"
          value={currencyFormatter.format(totalValue)}
          note="Current inventory value"
          icon={<DollarSign className="h-5 w-5" />}
          tone="blue"
        />
        <MetricCard
          label="Average Price"
          value={averagePrice === null ? '--' : currencyFormatter.format(averagePrice)}
          note={averagePrice === null ? 'Add products to calculate this' : 'Average per unit'}
          icon={<TrendingUp className="h-5 w-5" />}
          tone="slate"
        />
        <MetricCard
          label="Stores"
          value={supermarkets.length.toLocaleString()}
          note="Active store locations"
          icon={<Store className="h-5 w-5" />}
          tone="slate"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Monthly sales trend</h3>
              <p className="text-sm text-slate-500">A simple view of recent sales movement.</p>
            </div>
            <BarChart3 className="h-5 w-5 text-sky-600" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-6">
            {monthlyData.map((entry) => (
              <div key={entry.month} className="space-y-3 text-center">
                <div className="flex h-48 items-end rounded-2xl bg-slate-50 p-2">
                  <div
                    className="w-full rounded-xl bg-sky-500"
                    style={{ height: `${(entry.value / maxMonthValue) * 100}%` }}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{entry.month}</p>
                  <p className="text-xs text-slate-500">{compactCurrencyFormatter.format(entry.value)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Expiry status</h3>
              <p className="text-sm text-slate-500">See which products need attention soon.</p>
            </div>
            <Calendar className="h-5 w-5 text-amber-500" />
          </div>

          <div className="mt-5 space-y-3">
            <StatusPanel label="Fresh" description="Safe beyond 30 days" value={freshProducts} tone="success" />
            <StatusPanel label="Expiring Soon" description="Within the next 30 days" value={expiringProducts} tone="warning" />
            <StatusPanel label="Expired" description="Needs immediate action" value={expiredProducts} tone="danger" />
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Category mix</h3>
              <p className="text-sm text-slate-500">How your products are distributed across categories.</p>
            </div>
            <PieChart className="h-5 w-5 text-sky-600" />
          </div>

          <div className="mt-5 space-y-4">
            {categoryEntries.length > 0 ? (
              categoryEntries.map(([category, count]) => {
                const percentage = totalProducts > 0 ? (count / totalProducts) * 100 : 0;
                return (
                  <div key={category}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800">{category}</span>
                      <span className="text-sm text-slate-500">
                        {count} items • {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-sky-500" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyBlock text="Add products to see category breakdown." />
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Store performance</h3>
              <p className="text-sm text-slate-500">Product counts and value by store.</p>
            </div>
            <Store className="h-5 w-5 text-slate-600" />
          </div>

          <div className="mt-5 space-y-4">
            {supermarketEntries.length > 0 ? (
              supermarketEntries.map(([name, count]) => {
                const supermarket = supermarkets.find((store) => store.name === name);
                const supermarketProducts = products.filter((product) => product.supermarketId === supermarket?.id);
                const storeValue = supermarketProducts.reduce(
                  (sum, product) => sum + Number(product.price || 0) * Number(product.quantity || 0),
                  0
                );

                return (
                  <div key={name} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{name}</p>
                        <p className="text-xs text-slate-500">{count} products</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {compactCurrencyFormatter.format(storeValue)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyBlock text="Store performance will appear after you add products." />
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const MetricCard = ({
  label,
  value,
  note,
  icon,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  icon: React.ReactNode;
  tone: 'slate' | 'blue';
}) => {
  const toneClasses = {
    slate: 'bg-slate-100 text-slate-700',
    blue: 'bg-sky-100 text-sky-700',
  };

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`rounded-2xl p-3 ${toneClasses[tone]}`}>{icon}</div>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-xs text-slate-400">{note}</p>
    </div>
  );
};

const StatusPanel = ({
  label,
  description,
  value,
  tone,
}: {
  label: string;
  description: string;
  value: number;
  tone: 'success' | 'warning' | 'danger';
}) => {
  const toneClasses = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    danger: 'bg-red-50 text-red-700 border-red-100',
  };

  return (
    <div className={`rounded-2xl border p-4 ${toneClasses[tone]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-xs opacity-80">{description}</p>
        </div>
        <span className="text-2xl font-black">{value}</span>
      </div>
    </div>
  );
};

const EmptyBlock = ({ text }: { text: string }) => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
    {text}
  </div>
);

export default Analytics;
