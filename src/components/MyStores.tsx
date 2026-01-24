import React, { useMemo, useState } from 'react';
import { Store, Building2, ArrowRight, CheckCircle, AlertCircle, Plus, X, Network, MapPin, Phone, Mail, ShieldCheck, Activity } from 'lucide-react';
import type { Supermarket } from '../types/Product';
import { SupermarketService } from '../services/apiService';

interface MyStoresProps {
  stores: Supermarket[];
  onNavigateToStore: (storeId: string) => void;
  onStoreCreated?: (store: any) => void; 
}

const MyStores: React.FC<MyStoresProps> = ({ stores, onNavigateToStore, onStoreCreated }) => {
  const mainStores = useMemo(() => stores.filter(s => !s.isSubStore), [stores]);
  const subStores = useMemo(() => stores.filter(s => s.isSubStore), [stores]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.address.trim()) {
      setError('Name and address are required.');
      return;
    }
    if (!form.parentId) {
      setError('Please select a parent store for the sub-store.');
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
    } catch (err: any) {
      setError(err?.message || 'Failed to create sub-store.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StoreCard: React.FC<{ store: Supermarket }> = ({ store }) => {
    const parentStore = store.parentId ? stores.find(s => s.id === store.parentId) : null;
    return (
      <div className="card p-0 overflow-hidden border-2 border-primary-dark hover:border-primary-gold transition-all">
        <div className="bg-primary-dark p-4 border-b border-primary-gold flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-gold p-2">
              {store.isSubStore ? (
                <Building2 className="w-5 h-5 text-primary-dark" />
              ) : (
                <Store className="w-5 h-5 text-primary-dark" />
              )}
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tighter">{store.name}</h3>
          </div>
          <div className="flex items-center">
            {store.isVerified ? (
              <ShieldCheck className="w-5 h-5 text-primary-gold" />
            ) : (
              <Activity className="w-5 h-5 text-warning" />
            )}
          </div>
        </div>
        <div className="p-6 bg-white">
          <div className="space-y-3 mb-6">
            <div className="flex items-center text-xs font-bold text-gray-600 uppercase tracking-widest">
              <span className={`px-2 py-1 mr-2 ${store.isSubStore ? 'bg-primary-dark text-primary-gold' : 'bg-primary-gold text-primary-dark'}`}>
                {store.isSubStore ? 'Satellite Node' : 'Primary Command Hub'}
              </span>
              {store.isSubStore && parentStore && (
                <span className="text-gray-400">Linked to: {parentStore.name}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
              <MapPin className="w-3 h-3 text-primary-gold" />
              {store.address}
            </div>
          </div>
          <button
            onClick={() => onNavigateToStore(store.id)}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            Engage Terminal
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="view-container">
      {/* Header */}
      <div className="card-primary p-10 mb-8 border-b-4 border-primary-gold">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-primary-gold p-4 mr-6">
              <Network className="w-10 h-10 text-primary-dark" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-black uppercase tracking-tighter">Terminal Network Configuration</h2>
              <div className="h-1 w-20 bg-primary-gold mt-2"></div>
              <p className="text-primary-gold-light mt-4 font-bold uppercase text-xs tracking-widest">Manage multi-node architecture and operational engagement</p>
            </div>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Register Node
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Main Stores */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-black text-primary-dark uppercase tracking-widest">Primary Command Hubs</h2>
            <div className="flex-grow h-px bg-gray-200"></div>
          </div>
          {mainStores.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mainStores.map(store => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed border-gray-200 text-center text-gray-400 font-bold uppercase tracking-widest">
              No primary hubs detected in network.
            </div>
          )}
        </section>

        {/* Sub Stores */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-black text-primary-dark uppercase tracking-widest">Satellite Node Infrastructure</h2>
            <div className="flex-grow h-px bg-gray-200"></div>
          </div>
          {subStores.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subStores.map(store => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed border-gray-200 text-center text-gray-400 font-bold uppercase tracking-widest">
              No satellite nodes active in network.
            </div>
          )}
        </section>
      </div>

      {/* Add Sub-Store Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-primary-dark/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-0 w-full max-w-lg overflow-hidden border-2 border-primary-gold">
            <div className="bg-primary-dark p-6 border-b border-primary-gold flex items-center justify-between">
              <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                <Plus className="w-6 h-6 text-primary-gold" />
                Register Satellite Node
              </h3>
              <button onClick={() => { setShowAdd(false); resetForm(); }} className="text-white hover:text-primary-gold transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 bg-white">
              {error && (
                <div className="bg-error/20 border-l-4 border-error text-error p-4 mb-6 text-xs font-bold uppercase tracking-widest">
                  Protocol Failure: {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label text-xs">Node Nomenclature *</label>
                    <input className="form-input" placeholder="NODE NAME" value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="form-label text-xs">Geographic Coordinates *</label>
                    <input className="form-input" placeholder="PHYSICAL ADDRESS" value={form.address} onChange={e => setForm(s => ({ ...s, address: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="form-label text-xs">Telephonic Link</label>
                    <input className="form-input" placeholder="PHONE" value={form.phone} onChange={e => setForm(s => ({ ...s, phone: e.target.value }))} />
                  </div>
                  <div>
                    <label className="form-label text-xs">Communication Dispatch</label>
                    <input className="form-input" placeholder="EMAIL" value={form.email} onChange={e => setForm(s => ({ ...s, email: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label className="form-label text-xs">Node Description</label>
                  <textarea className="form-input" rows={3} placeholder="OPERATIONAL CONTEXT" value={form.description} onChange={e => setForm(s => ({ ...s, description: e.target.value }))} />
                </div>

                <div>
                  <label className="form-label text-xs">Parent Command Hub *</label>
                  <select className="form-input" value={form.parentId} onChange={e => setForm(s => ({ ...s, parentId: e.target.value }))} required>
                    <option value="">SELECT PARENT HUB</option>
                    {mainStores.map(ms => <option key={ms.id} value={ms.id}>{ms.name}</option>)}
                  </select>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button type="button" className="btn-secondary" onClick={() => { setShowAdd(false); resetForm(); }}>
                    Abort
                  </button>
                  <button type="submit" disabled={isSubmitting} className="btn-primary">
                    {isSubmitting ? 'Processing...' : 'Execute Registration'}
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

export default MyStores;