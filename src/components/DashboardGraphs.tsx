import React from 'react';
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  CircleDashed,
  DollarSign,
  Package,
  Plus,
  ScanLine,
  Store,
  TrendingUp,
} from 'lucide-react';
import type { Product, Supermarket } from '../types/Product';

interface DashboardGraphsProps {
  products: Product[];
  supermarkets: Supermarket[];
  onNavigate?: (view: string) => void;
}

const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactMoneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const DashboardGraphs: React.FC<DashboardGraphsProps> = ({ products, supermarkets, onNavigate }) => {
  const safeProducts = Array.isArray(products) ? products : [];

  const totalProducts = safeProducts.length;
  const totalUnits = safeProducts.reduce((sum, product) => sum + Number(product.quantity || 0), 0);
  const totalValue = safeProducts.reduce((sum, product) => sum + Number(product.price || 0) * Number(product.quantity || 0), 0);
  const lowStockProducts = safeProducts.filter((product) => Number(product.quantity || 0) <= Number(product.minStockLevel || 5));
  const expiringSoon = safeProducts.filter((product) => {
    const daysUntilExpiry = Math.ceil(
      (new Date(product.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  });

  const monthlyData = Array.from({ length: 6 }, (_, index) => {
    const monthDate = new Date(new Date().getFullYear(), new Date().getMonth() - (5 - index), 1);
    const month = monthDate.toLocaleDateString('en-US', { month: 'short' });

    if (safeProducts.length === 0) {
      return { month, sales: 0, products: 0 };
    }

    const averagePrice = totalUnits > 0 ? totalValue / totalUnits : 0;
    const growthFactor = 0.82 + index * 0.08;
    const monthProducts = Math.max(0, Math.round(totalProducts * growthFactor));
    const monthSales = Math.round(monthProducts * averagePrice * (1.75 + index * 0.1));

    return {
      month,
      products: monthProducts,
      sales: monthSales,
    };
  });

  const maxSales = Math.max(...monthlyData.map((entry) => entry.sales), 1);

  if (safeProducts.length === 0) {
    const posConnected = supermarkets.some((store) => Boolean(store.posSystem?.enabled));
    const onboardingSteps = [
      { label: 'Create Store', done: supermarkets.length > 0, view: 'stores' },
      { label: 'Add Product', done: false, view: 'add-product' },
      { label: 'Connect POS', done: posConnected, view: 'pos-sync' },
      { label: 'Add Supplier', done: false, view: 'suppliers' },
    ];
    const completedSteps = onboardingSteps.filter((step) => step.done).length;
    const progress = Math.round((completedSteps / onboardingSteps.length) * 100);

    return (
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                Welcome to Stockive
              </span>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Set up your inventory workspace</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Complete the basics once, then Stockive can show live stock, sales, and store activity here.
                </p>
              </div>
            </div>

            <div className="min-w-[220px] rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Progress</p>
                <p className="text-sm font-bold text-slate-900">{progress}%</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-3 text-sm text-slate-500">
                {completedSteps} of {onboardingSteps.length} setup steps completed
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {onboardingSteps.map((step) => (
              <button
                key={step.label}
                type="button"
                onClick={() => onNavigate?.(step.view)}
                className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4 text-left transition hover:border-sky-200 hover:bg-sky-50/50"
              >
                <div className="flex items-center gap-3">
                  {step.done ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <CircleDashed className="h-5 w-5 text-slate-300" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{step.label}</p>
                    <p className="text-xs text-slate-500">
                      {step.done ? 'Completed' : 'Open this step'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-400">{step.done ? 'Done' : 'Open'}</span>
              </button>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-900 p-3 text-white">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Quick actions</h3>
                <p className="text-sm text-slate-500">Jump into the tasks inventory teams do most.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {[
                { label: 'Add Product', view: 'add-product', icon: <Package className="h-4 w-4" /> },
                { label: 'Connect POS', view: 'pos-sync', icon: <ScanLine className="h-4 w-4" /> },
                { label: 'Add Supplier', view: 'suppliers', icon: <Store className="h-4 w-4" /> },
              ].map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => onNavigate?.(action.view)}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2">
                    {action.icon}
                    {action.label}
                  </span>
                  <span className="text-slate-400">Open</span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">What will appear here</h3>
            <div className="mt-4 space-y-3">
              <InfoRow label="Store count" value={String(supermarkets.length)} tone="info" />
              <InfoRow label="Live stock alerts" value="0" tone="warning" />
              <InfoRow label="Inventory value" value="$0.00" tone="success" />
            </div>
          </section>
        </aside>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Products"
          value={totalProducts.toLocaleString()}
          meta={`${totalUnits.toLocaleString()} units`}
          tone="slate"
          icon={<Package className="h-5 w-5" />}
          onClick={() => onNavigate?.('catalog')}
        />
        <MetricCard
          label="Inventory Value"
          value={moneyFormatter.format(totalValue)}
          meta="Across all stores"
          tone="blue"
          icon={<DollarSign className="h-5 w-5" />}
          onClick={() => onNavigate?.('analytics')}
        />
        <MetricCard
          label="Low Stock"
          value={lowStockProducts.length.toLocaleString()}
          meta="Needs restocking"
          tone="orange"
          icon={<AlertTriangle className="h-5 w-5" />}
          onClick={() => onNavigate?.('catalog')}
        />
        <MetricCard
          label="Expiring Soon"
          value={expiringSoon.length.toLocaleString()}
          meta="Within 7 days"
          tone="red"
          icon={<Calendar className="h-5 w-5" />}
          onClick={() => onNavigate?.('clearance')}
        />
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Sales trend</h3>
            <p className="text-sm text-slate-500">Estimated monthly movement based on your current inventory mix.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <SummaryChip label="6 month sales" value={compactMoneyFormatter.format(monthlyData.reduce((sum, entry) => sum + entry.sales, 0))} tone="blue" />
            <SummaryChip
              label="Growth"
              value={`+${Math.round((((monthlyData[monthlyData.length - 1]?.sales || 0) - (monthlyData[0]?.sales || 0)) / Math.max(monthlyData[0]?.sales || 1, 1)) * 100)}%`}
              tone="success"
            />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {monthlyData.map((entry) => (
            <div key={entry.month} className="grid grid-cols-[48px_minmax(0,1fr)_90px] items-center gap-4">
              <span className="text-sm font-semibold text-slate-700">{entry.month}</span>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all"
                  style={{ width: `${(entry.sales / maxSales) * 100}%` }}
                />
              </div>
              <span className="text-right text-sm font-semibold text-slate-900">
                {compactMoneyFormatter.format(entry.sales)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const InfoRow = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'info' | 'warning' | 'success';
}) => {
  const toneClasses = {
    info: 'bg-sky-50 text-sky-700',
    warning: 'bg-amber-50 text-amber-700',
    success: 'bg-emerald-50 text-emerald-700',
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>{value}</span>
    </div>
  );
};

const MetricCard = ({
  label,
  value,
  meta,
  tone,
  icon,
  onClick,
}: {
  label: string;
  value: string;
  meta: string;
  tone: 'slate' | 'blue' | 'orange' | 'red';
  icon: React.ReactNode;
  onClick?: () => void;
}) => {
  const toneClasses = {
    slate: 'bg-slate-100 text-slate-700',
    blue: 'bg-sky-100 text-sky-700',
    orange: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[24px] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className={`rounded-2xl p-3 ${toneClasses[tone]}`}>{icon}</div>
        <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
          <TrendingUp className="h-3.5 w-3.5" />
          Live
        </span>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-xs text-slate-400">{meta}</p>
    </button>
  );
};

const SummaryChip = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'blue' | 'success';
}) => {
  const toneClasses = {
    blue: 'bg-sky-50 text-sky-700',
    success: 'bg-emerald-50 text-emerald-700',
  };

  return (
    <div className={`rounded-2xl px-4 py-3 ${toneClasses[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
};

export default DashboardGraphs;
