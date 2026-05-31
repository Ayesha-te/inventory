import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Mail,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
  Store,
  X,
} from 'lucide-react';
import type { Supermarket } from '../types/Product';
import { SupermarketService } from '../services/apiService';

interface MyStoresProps {
  stores: Supermarket[];
  onNavigateToStore: (storeId: string) => void;
  onStoreCreated?: (store: any) => void;
  canAddBranch?: boolean;
  storeLimitMessage?: string;
}

const MyStores: React.FC<MyStoresProps> = ({
  stores,
  onNavigateToStore,
  onStoreCreated,
  canAddBranch = true,
  storeLimitMessage = '',
}) => {
  const mainStores = useMemo(() => stores.filter((store) => !store.isSubStore), [stores]);
  const subStores = useMemo(() => stores.filter((store) => store.isSubStore), [stores]);
  const verifiedStores = useMemo(() => stores.filter((store) => store.isVerified).length, [stores]);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    description: '',
    parentId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setForm({ name: '', address: '', phone: '', email: '', description: '', parentId: '' });
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.address.trim()) {
      setError('Store name and address are required.');
      return;
    }

    if (!form.parentId) {
      setError('Please choose the main store for this branch.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: form.name,
        address: form.address,
        phone: form.phone,
        email: form.email,
        description: form.description,
        is_sub_store: true,
        parent: form.parentId,
      };

      const created = await SupermarketService.createSupermarket(payload);
      setShowAdd(false);
      resetForm();
      onStoreCreated?.(created);
    } catch (submitError: any) {
      setError(submitError?.message || 'Could not add this branch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Store network</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">My Stores</h2>
            <p className="mt-2 text-sm text-slate-500">Manage your main store and branch stores from one place.</p>
            {storeLimitMessage && (
              <p className="mt-2 text-sm font-medium text-slate-600">{storeLimitMessage}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              if (canAddBranch) {
                setShowAdd(true);
              }
            }}
            disabled={!canAddBranch}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            <Plus className="h-4 w-4" />
            Add Branch
          </button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Main Stores" value={mainStores.length} />
        <SummaryCard label="Branch Stores" value={subStores.length} />
        <SummaryCard label="Verified Stores" value={verifiedStores} />
      </div>

      <StoreSection
        title="Main Stores"
        emptyText="No main stores added yet."
        stores={mainStores}
        allStores={stores}
        onNavigateToStore={onNavigateToStore}
      />

      <StoreSection
        title="Branch Stores"
        emptyText="No branch stores added yet."
        stores={subStores}
        allStores={stores}
        onNavigateToStore={onNavigateToStore}
      />

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add Branch Store</h3>
                <p className="text-sm text-slate-500">Add a branch and link it to one of your main stores.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAdd(false);
                  resetForm();
                }}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Store Name"
                    value={form.name}
                    onChange={(value) => setForm((state) => ({ ...state, name: value }))}
                    placeholder="Store name"
                  />
                  <Field
                    label="Address"
                    value={form.address}
                    onChange={(value) => setForm((state) => ({ ...state, address: value }))}
                    placeholder="Store address"
                  />
                  <Field
                    label="Phone"
                    value={form.phone}
                    onChange={(value) => setForm((state) => ({ ...state, phone: value }))}
                    placeholder="Phone number"
                  />
                  <Field
                    label="Email"
                    value={form.email}
                    onChange={(value) => setForm((state) => ({ ...state, email: value }))}
                    placeholder="Email address"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))}
                    placeholder="Add a short note about this store"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Main Store
                  </label>
                  <select
                    value={form.parentId}
                    onChange={(event) => setForm((state) => ({ ...state, parentId: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                  >
                    <option value="">Select a main store</option>
                    {mainStores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdd(false);
                      resetForm();
                    }}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? 'Saving...' : 'Add Branch'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StoreSection = ({
  title,
  emptyText,
  stores,
  allStores,
  onNavigateToStore,
}: {
  title: string;
  emptyText: string;
  stores: Supermarket[];
  allStores: Supermarket[];
  onNavigateToStore: (storeId: string) => void;
}) => (
  <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-5 flex items-center justify-between">
      <div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">Open a store or review its details.</p>
      </div>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
        {stores.length}
      </span>
    </div>

    {stores.length > 0 ? (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stores.map((store) => (
          <StoreCard
            key={store.id}
            store={store}
            allStores={allStores}
            onNavigateToStore={onNavigateToStore}
          />
        ))}
      </div>
    ) : (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
        {emptyText}
      </div>
    )}
  </section>
);

const StoreCard = ({
  store,
  allStores,
  onNavigateToStore,
}: {
  store: Supermarket;
  allStores: Supermarket[];
  onNavigateToStore: (storeId: string) => void;
}) => {
  const parentStore = store.parentId ? allStores.find((candidate) => candidate.id === store.parentId) : null;

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`rounded-2xl p-3 ${store.isSubStore ? 'bg-sky-100 text-sky-700' : 'bg-slate-900 text-white'}`}>
            {store.isSubStore ? <Building2 className="h-5 w-5" /> : <Store className="h-5 w-5" />}
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">{store.name}</h4>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  store.isSubStore ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {store.isSubStore ? 'Branch Store' : 'Main Store'}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  store.isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}
              >
                {store.isVerified ? 'Verified' : 'Needs Review'}
              </span>
            </div>
          </div>
        </div>

        {store.isVerified && <ShieldCheck className="h-5 w-5 text-emerald-500" />}
      </div>

      <div className="mt-5 space-y-3 text-sm text-slate-600">
        <InfoLine icon={<MapPin className="h-4 w-4 text-slate-400" />} text={store.address} />
        {store.phone && <InfoLine icon={<Phone className="h-4 w-4 text-slate-400" />} text={store.phone} />}
        {store.email && <InfoLine icon={<Mail className="h-4 w-4 text-slate-400" />} text={store.email} />}
        {store.isSubStore && parentStore && (
          <InfoLine icon={<ArrowRight className="h-4 w-4 text-slate-400" />} text={`Part of ${parentStore.name}`} />
        )}
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={() => onNavigateToStore(store.id)}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Open Store
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">{value}</p>
  </div>
);

const InfoLine = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center gap-2">
    {icon}
    <span>{text}</span>
  </div>
);

const Field = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) => (
  <div>
    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
      {label}
    </label>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
    />
  </div>
);

export default MyStores;
