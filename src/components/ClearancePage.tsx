import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Tag, Package, Trash2, Edit3, Calendar, Percent } from 'lucide-react';
import type { ClearanceDeal, ClearanceType } from '../types/Clearance';
import { ClearanceService, ProductService } from '../services/apiService';
import type { Product } from '../types/Product';

const typeOptions: { value: ClearanceType; label: string }[] = [
  { value: 'discount', label: 'Discount %' },
  { value: 'flat', label: 'Flat Price' },
  { value: 'bogo', label: 'BOGO (Buy X Get Y)' },
  { value: 'bundle', label: 'Bundle' },
];

const formatPrice = (n: number) => (isFinite(n) ? n.toFixed(2) : '0.00');

const ClearancePage: React.FC = () => {
  const [deals, setDeals] = useState<ClearanceDeal[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClearanceDeal | null>(null);

  const [form, setForm] = useState<{
    productId: string;
    type: ClearanceType;
    value?: number;
    // BOGO
    bogoBuyX?: number;
    bogoGetY?: number;
    // Legacy single-bundle (kept for backward compatibility with existing deals)
    bundleProductId?: string;
    bundlePrice?: number;
    // New multi-item bundles
    bundleItems?: { productId: string; quantity: number }[];
    expiresAt: string;
  }>({
    productId: '',
    type: 'discount',
    value: undefined,
    bogoBuyX: 1,
    bogoGetY: 1,
    bundleProductId: undefined,
    bundlePrice: undefined,
    bundleItems: [],
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [prodRes, dealRes] = await Promise.all([
          ProductService.getProducts(),
          ClearanceService.listDeals(),
        ]);
        const prodList = Array.isArray(prodRes) ? prodRes : (prodRes?.results || []);
        setProducts(prodList.map((p: any) => ({
          id: String(p.id ?? ''),
          name: String(p.name ?? ''),
          category: String(p.category_name ?? p.category ?? ''),
          quantity: Number(p.quantity ?? 0),
          expiryDate: String(p.expiry_date ?? p.expiryDate ?? ''),
          supplier: String(p.supplier_name ?? p.supplier ?? ''),
          price: Number(p.selling_price ?? p.price ?? 0),
          addedDate: String(p.added_date ?? p.addedDate ?? new Date().toISOString()),
          supermarketId: String(p.supermarket_id ?? p.supermarket ?? 'default'),
        })));
        const rawDeals = Array.isArray(dealRes) ? dealRes : (dealRes?.results || []);
        const mapped: ClearanceDeal[] = rawDeals.map((d: any) => ({
          id: String(d.id),
          productId: String(d.product || d.product_id),
          productName: d.product_name,
          type: (d.type || 'discount') as ClearanceType,
          value: d.value ?? undefined,
          // BOGO
          bogoBuyX: d.bogo_buy_x ?? d.bogoBuyX ?? undefined,
          bogoGetY: d.bogo_get_y ?? d.bogoGetY ?? undefined,
          // Bundle N-items
          bundleItems: Array.isArray(d.bundle_items)
            ? d.bundle_items.map((bi: any) => ({
                productId: String(bi.product || bi.product_id),
                productName: bi.product_name,
                quantity: Number(bi.quantity ?? 1),
              }))
            : undefined,
          // Legacy single-bundle mapping for display compatibility
          bundleProductId: d.bundle_product ? String(d.bundle_product) : undefined,
          bundleProductName: d.bundle_product_name,
          bundlePrice: d.bundle_price ?? undefined,
          expiresAt: (d.expires_at || d.expiresAt || '').split('T')[0],
          isActive: d.is_active ?? undefined,
          generatedSku: d.generated_sku ?? d.generatedSku,
          generatedBarcode: d.generated_barcode ?? d.generatedBarcode,
        }));
        setDeals(mapped);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({
      productId: '',
      type: 'discount',
      value: undefined,
      bogoBuyX: 1,
      bogoGetY: 1,
      bundleProductId: undefined,
      bundlePrice: undefined,
      bundleItems: [],
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // minimal validation
    if (!form.productId) return alert('Select a product');
    if (form.type === 'discount' && (form.value === undefined || form.value <= 0 || form.value > 100)) {
      return alert('Enter valid discount % (1-100)');
    }
    if (form.type === 'flat' && (form.value === undefined || form.value <= 0)) {
      return alert('Enter valid flat price');
    }
    if (form.type === 'bundle') {
      // Validate either legacy single-bundle or new bundle items
      const usingLegacy = !!form.bundleProductId;
      const usingNew = (form.bundleItems && form.bundleItems.length > 0);
      if (!usingLegacy && !usingNew) {
        return alert('Add at least one bundle item');
      }
      if (usingLegacy && (!form.bundleProductId || !form.bundlePrice || form.bundlePrice <= 0)) {
        return alert('Select bundle product and a valid bundle price');
      }
      if (usingNew) {
        const invalid = form.bundleItems!.some(bi => !bi.productId || !bi.quantity || bi.quantity <= 0);
        if (invalid) return alert('Each bundle item must have product and quantity > 0');
      }
    }

    const payload: any = {
      product: form.productId,
      type: form.type,
      expires_at: form.expiresAt,
    };
    if (form.type === 'discount') payload.value = form.value;
    if (form.type === 'flat') payload.value = form.value;
    if (form.type === 'bogo') {
      payload.bogo_buy_x = form.bogoBuyX ?? 1;
      payload.bogo_get_y = form.bogoGetY ?? 1;
    }
    if (form.type === 'bundle') {
      if (form.bundleItems && form.bundleItems.length > 0) {
        payload.bundle_items = form.bundleItems.map(bi => ({ product: bi.productId, quantity: bi.quantity }));
      } else {
        payload.bundle_product = form.bundleProductId;
        payload.bundle_price = form.bundlePrice;
      }
    }

    try {
      if (editing) {
        await ClearanceService.updateDeal(editing.id, payload);
      } else {
        await ClearanceService.createDeal(payload);
      }
      // reload
      const dealRes = await ClearanceService.listDeals();
      const rawDeals = Array.isArray(dealRes) ? dealRes : (dealRes?.results || []);
      const mapped: ClearanceDeal[] = rawDeals.map((d: any) => ({
        id: String(d.id),
        productId: String(d.product || d.product_id),
        productName: d.product_name,
        type: (d.type || 'discount') as ClearanceType,
        value: d.value ?? undefined,
        // BOGO
        bogoBuyX: d.bogo_buy_x ?? d.bogoBuyX ?? undefined,
        bogoGetY: d.bogo_get_y ?? d.bogoGetY ?? undefined,
        // Bundle N-items
        bundleItems: Array.isArray(d.bundle_items)
          ? d.bundle_items.map((bi: any) => ({
              productId: String(bi.product || bi.product_id),
              productName: bi.product_name,
              quantity: Number(bi.quantity ?? 1),
            }))
          : undefined,
        // Legacy single-bundle mapping for display compatibility
        bundleProductId: d.bundle_product ? String(d.bundle_product) : undefined,
        bundleProductName: d.bundle_product_name,
        bundlePrice: d.bundle_price ?? undefined,
        expiresAt: (d.expires_at || d.expiresAt || '').split('T')[0],
        isActive: d.is_active ?? undefined,
        generatedSku: d.generated_sku ?? d.generatedSku,
        generatedBarcode: d.generated_barcode ?? d.generatedBarcode,
      }));
      setDeals(mapped);
      setFormOpen(false);
      resetForm();
    } catch (e: any) {
      alert(e?.message || 'Failed to save deal');
    }
  };

  const startEdit = (d: ClearanceDeal) => {
    setEditing(d);
    setFormOpen(true);
    setForm({
      productId: d.productId,
      type: d.type,
      value: d.type === 'discount' || d.type === 'flat' ? d.value : undefined,
      bogoBuyX: d.bogoBuyX ?? 1,
      bogoGetY: d.bogoGetY ?? 1,
      bundleProductId: d.bundleProductId,
      bundlePrice: d.bundlePrice,
      bundleItems: d.bundleItems?.map(bi => ({ productId: bi.productId, quantity: bi.quantity })) || [],
      expiresAt: d.expiresAt,
    });
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this deal?')) return;
    await ClearanceService.deleteDeal(id);
    setDeals(prev => prev.filter(d => d.id !== id));
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="view-container">
      <div className="flex items-center justify-between mb-8 border-b-2 border-primary-gold pb-6">
        <div className="flex flex-col">
          <h2 className="header-title" style={{ fontSize: "1.75rem" }}>Liquidation Protocols</h2>
          <p className="header-subtitle">Strategic Asset Mark-down & Clearance Management</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => { resetForm(); setFormOpen(true); }}>
          <Plus className="w-4 h-4"/> Initiate Liquidation
        </button>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="card bg-primary-offwhite mb-10 space-y-6 border-l-8 border-primary-dark">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Target Asset</label>
              <select className="form-input" value={form.productId} onChange={e => setForm(prev => ({ ...prev, productId: e.target.value }))}>
                <option value="">Select operational asset</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Protocol Type</label>
              <select className="form-input" value={form.type} onChange={e => setForm(prev => ({ ...prev, type: e.target.value as ClearanceType }))}>
                {typeOptions.map(t => (
                  <option key={t.value} value={t.value}>
                    {t.value === 'discount' ? 'Mark-down Coefficient (%)' : 
                     t.value === 'flat' ? 'Static Valuation (Flat)' : 
                     t.value === 'bogo' ? 'Binary Acquisition (BOGO)' : 
                     'Asset Bundle Protocol'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(form.type === 'discount' || form.type === 'flat') && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">{form.type === 'discount' ? 'Coefficient (%)' : 'Liquidation Price'}</label>
                <input className="form-input" type="number" min={0} step={form.type === 'discount' ? 1 : 0.01} value={form.value ?? ''} onChange={e => setForm(prev => ({ ...prev, value: e.target.value === '' ? undefined : Number(e.target.value) }))} />
              </div>
              <div>
                <label className="form-label">Termination Date</label>
                <input className="form-input" type="date" value={form.expiresAt} onChange={e => setForm(prev => ({ ...prev, expiresAt: e.target.value }))} />
              </div>
            </div>
          )}

          {form.type === 'bogo' && (
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="form-label">Acquisition (X)</label>
                <input className="form-input" type="number" min={1} step={1} value={form.bogoBuyX ?? 1} onChange={e => setForm(prev => ({ ...prev, bogoBuyX: Number(e.target.value) || 1 }))} />
              </div>
              <div>
                <label className="form-label">Allocation (Y)</label>
                <input className="form-input" type="number" min={1} step={1} value={form.bogoGetY ?? 1} onChange={e => setForm(prev => ({ ...prev, bogoGetY: Number(e.target.value) || 1 }))} />
              </div>
              <div>
                <label className="form-label">Termination Date</label>
                <input className="form-input" type="date" value={form.expiresAt} onChange={e => setForm(prev => ({ ...prev, expiresAt: e.target.value }))} />
              </div>
            </div>
          )}

          {form.type === 'bundle' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="form-label">Termination Date</label>
                  <input className="form-input" type="date" value={form.expiresAt} onChange={e => setForm(prev => ({ ...prev, expiresAt: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Legacy Valuation</label>
                  <input className="form-input" type="number" min={0} step={0.01} value={form.bundlePrice ?? ''} onChange={e => setForm(prev => ({ ...prev, bundlePrice: e.target.value === '' ? undefined : Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="form-label">Legacy Pair</label>
                  <select className="form-input" value={form.bundleProductId || ''} onChange={e => setForm(prev => ({ ...prev, bundleProductId: e.target.value || undefined }))}>
                    <option value="">Select asset</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="card border-2 border-dashed border-gray-300 p-6">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                  <div className="text-xs font-black theme-text-primary uppercase tracking-widest">Composite Bundle Matrix</div>
                  <button type="button" className="btn-secondary" style={{ padding: "4px 12px", fontSize: "0.7rem" }} onClick={() => setForm(prev => ({ ...prev, bundleItems: [...(prev.bundleItems || []), { productId: '', quantity: 1 }] }))}>Add Component</button>
                </div>
                <div className="space-y-3">
                  {(form.bundleItems || []).map((bi, idx) => (
                    <div key={idx} className="grid md:grid-cols-12 gap-3 items-center">
                      <div className="md:col-span-8">
                        <select className="form-input" style={{ padding: "8px" }} value={bi.productId} onChange={e => setForm(prev => ({ ...prev, bundleItems: (prev.bundleItems || []).map((x, i) => i === idx ? { ...x, productId: e.target.value } : x) }))}>
                          <option value="">Select asset component</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <input className="form-input" style={{ padding: "8px" }} type="number" min={1} step={1} value={bi.quantity} onChange={e => setForm(prev => ({ ...prev, bundleItems: (prev.bundleItems || []).map((x, i) => i === idx ? { ...x, quantity: Number(e.target.value) || 1 } : x) }))} />
                      </div>
                      <div className="md:col-span-2 flex justify-end">
                        <button type="button" className="text-[10px] font-black text-error hover:underline uppercase tracking-widest" onClick={() => setForm(prev => ({ ...prev, bundleItems: (prev.bundleItems || []).filter((_, i) => i !== idx) }))}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button type="submit" className="btn-primary">{editing ? 'Commit Modification' : 'Deploy Protocol'}</button>
            <button type="button" className="btn-secondary" onClick={() => { setFormOpen(false); resetForm(); }}>Abort</button>
          </div>
        </form>
      )}

      <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-rose-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-3">Product</th>
              <th className="p-3">Type</th>
              <th className="p-3">Value</th>
              <th className="p-3">Expires</th>
              <th className="p-3">Active</th>
              <th className="p-3">Codes</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {deals.map(d => (
              <tr key={d.id} className="border-b">
                <td className="p-3">{d.productName || products.find(p => p.id === d.productId)?.name || d.productId}</td>
                <td className="p-3 capitalize">{d.type}</td>
                <td className="p-3">
                  {d.type === 'discount' && d.value ? `${d.value}% off` :
                   d.type === 'flat' && d.value ? `$${formatPrice(d.value)}` :
                   d.type === 'bogo' ? `BOGO: Buy ${d.bogoBuyX || 1} Get ${d.bogoGetY || 1}` :
                   d.type === 'bundle' ? (
                     d.bundleItems && d.bundleItems.length
                      ? `${d.bundleItems.length} items` 
                      : `+ ${d.bundleProductName || products.find(p => p.id === d.bundleProductId)?.name} for $${formatPrice(d.bundlePrice || 0)}`
                   ) : ''}
                </td>
                <td className="p-3">{d.expiresAt}</td>
                <td className="p-3">{d.isActive ? 'Yes' : 'No'}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <button type="button" className="px-2 py-1 border rounded" onClick={async () => {
                      try {
                        const blob = await ClearanceService.getBarcode(d.id);
                        const url = URL.createObjectURL(blob as any);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `clearance_${d.id}_barcode.png`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                      } catch (e: any) {
                        alert(e?.message || 'Failed to download barcode');
                      }
                    }}>Barcode</button>
                    <button type="button" className="px-2 py-1 border rounded" onClick={async () => {
                      try {
                        const blob = await ClearanceService.getTicket(d.id);
                        const url = URL.createObjectURL(blob as any);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `clearance_${d.id}_ticket.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                      } catch (e: any) {
                        alert(e?.message || 'Failed to download ticket');
                      }
                    }}>Ticket</button>
                  </div>
                </td>
                <td className="p-3 flex gap-2">
                  <button className="px-2 py-1 border rounded" onClick={() => startEdit(d)}><Edit3 className="w-4 h-4"/></button>
                  <button className="px-2 py-1 border rounded" onClick={() => remove(d.id)}><Trash2 className="w-4 h-4"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClearancePage;