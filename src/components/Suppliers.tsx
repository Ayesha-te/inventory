import React, { useEffect, useMemo, useState } from 'react';
import { 
  Users, 
  Settings as SettingsIcon, 
  Package, 
  Truck, 
  Calendar, 
  DollarSign, 
  FileText, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink,
  Search,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Clock,
  RefreshCw
} from 'lucide-react';
import { SupplierService, ProductService, SupplierProductService, PurchaseOrderService, MappingService, SupermarketService } from '../services/apiService';

interface Supplier {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface ProductOption { id: string; name: string; category?: string }

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [poSummary, setPoSummary] = useState<any[]>([]);
  const [supermarkets, setSupermarkets] = useState<{ id: string; name: string }[]>([]);
  // Reference to scroll to the PO section when starting a PO from supplier row
  const poSectionRef = React.useRef<HTMLDivElement>(null);

  // Create/Edit supplier form
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<{ name: string; email: string; phone: string; address: string; credit_days: string }>({
    name: '', email: '', phone: '', address: '', credit_days: '0'
  });

  // Supplier-Product mapping form
  const [mapForm, setMapForm] = useState<{ supplierId: string; productId: string; supplierPrice: string; availableQty: string }>({
    supplierId: '', productId: '', supplierPrice: '', availableQty: ''
  });

  // Best supplier check form (multi-select products)
  const [bestForm, setBestForm] = useState<{ qty: string }>({ qty: '1' });
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState<boolean>(false);
  const [bestResults, setBestResults] = useState<Record<string, any>>({});

  // For product -> suppliers view
  const [productSupplierQuery, setProductSupplierQuery] = useState<string>('');
  const [productSuppliers, setProductSuppliers] = useState<any[]>([]);

  // PO form (manual) + Excel import
  const [poForm, setPoForm] = useState<{ supplierId: string; supermarketName: string; expectedDate: string; paymentTerms: string; buyerName: string; notes: string }>(
    { supplierId: '', supermarketName: '', expectedDate: '', paymentTerms: 'Net 30', buyerName: '', notes: '' }
  );
  const [poItems, setPoItems] = useState<Array<{ productName: string; quantity: string; unitPrice: string }>>([
    { productName: '', quantity: '1', unitPrice: '0' }
  ]);

  const supplierOptions = useMemo(() => suppliers.map(s => ({ value: String(s.id), label: s.name })), [suppliers]);
  const productOptions = useMemo(() => products.map(p => ({ value: String(p.id), label: p.name })), [products]);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try {
        const [supplierRes, productRes, poRes, smRes] = await Promise.all([
          SupplierService.getSuppliers(),
          ProductService.getProducts(),
          PurchaseOrderService.list().catch(() => ([])),
          SupermarketService.getSupermarkets().catch(() => ([])),
        ]);
        const supplierList: Supplier[] = Array.isArray(supplierRes) ? supplierRes : supplierRes.results || [];
        const productList = (Array.isArray(productRes) ? productRes : productRes.results || []).map((p: any) => ({ id: String(p.id ?? p.uuid ?? ''), name: String(p.name ?? ''), category: String(p.category_name ?? p.category ?? 'General') }));
        const poList = Array.isArray(poRes) ? poRes : poRes.results || [];
        const smList = (Array.isArray(smRes) ? smRes : smRes.results || []).map((s: any) => ({ id: String(s.id ?? s.uuid ?? ''), name: String(s.name ?? '') }));
        console.log('Fetched PO list:', poList);
        setSuppliers(supplierList);
        setProducts(productList);
        setPoSummary(poList);
        setSupermarkets(smList);
      } catch (e: any) {
        setError(e?.message || 'Failed to load suppliers/products/stores');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const resetForm = () => { setEditingId(null); setForm({ name: '', email: '', phone: '', address: '', credit_days: '0' }); };

  const submitSupplier = async () => {
    if (!form.name.trim()) { setError('Supplier name is required'); return; }
    setLoading(true); setError('');
    try {
      const payload = {
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        credit_days: Number(form.credit_days || '0'),
      };
      if (editingId) {
        const updated = await SupplierService.updateSupplier(editingId, payload);
        setSuppliers(prev => prev.map(s => s.id === editingId ? { ...s, ...updated } : s));
      } else {
        const created = await SupplierService.createSupplier(payload);
        setSuppliers(prev => [...prev, created]);
      }
      resetForm();
    } catch (e: any) {
      setError(e?.message || 'Failed to save supplier');
    } finally { setLoading(false); }
  };

  const startEdit = (s: Supplier) => {
    setEditingId(s.id);
    setForm({ name: s.name || '', email: s.email || '', phone: s.phone || '', address: s.address || '', credit_days: String((s as any).credit_days ?? '0') });
  };

  const removeSupplier = async (id: number) => {
    if (!confirm('Delete this supplier?')) return;
    setLoading(true); setError('');
    try {
      await SupplierService.deleteSupplier(id);
      setSuppliers(prev => prev.filter(s => s.id !== id));
      if (editingId === id) resetForm();
    } catch (e: any) {
      setError(e?.message || 'Failed to delete supplier');
    } finally { setLoading(false); }
  };

  const mapSupplierProduct = async () => {
    if (!mapForm.supplierId || !mapForm.productId || !mapForm.supplierPrice) {
      setError('Supplier, Product and Price are required');
      return;
    }
    setLoading(true); setError('');
    try {
      await SupplierProductService.create({
        supplier: Number(mapForm.supplierId),
        product: mapForm.productId,
        supplier_price: Number(mapForm.supplierPrice),
        available_quantity: mapForm.availableQty ? Number(mapForm.availableQty) : undefined,
      });
      setMapForm({ supplierId: '', productId: '', supplierPrice: '', availableQty: '' });
      alert('Supplier mapped to product successfully');
    } catch (e: any) {
      setError(e?.message || 'Failed to map supplier to product');
    } finally { setLoading(false); }
  };

  const findBestSupplier = async () => {
    if (!selectedProductIds.length || !bestForm.qty) { setError('Select at least one product and a quantity'); return; }
    setLoading(true); setError(''); setBestResults({});
    try {
      const qty = Number(bestForm.qty);
      const entries: Record<string, any> = {};
      for (const pid of selectedProductIds) {
        try {
          const res = await SupplierProductService.bestSupplier(pid, qty);
          entries[pid] = res;
        } catch (err) {
          entries[pid] = { error: (err as any)?.message || 'Failed' };
        }
      }
      setBestResults(entries);
    } catch (e: any) {
      setError(e?.message || 'Failed to get best supplier');
    } finally { setLoading(false); }
  };

  const submitPO = async () => {
    if (!poForm.supplierId) { setError('Select supplier for PO'); return; }
    const validItems = poItems.filter(it => it.productName.trim() && Number(it.quantity) > 0);
    if (!validItems.length) { setError('Add at least one line item'); return; }
    setLoading(true); setError('');
    try {
      const supermarketName = (poForm.supermarketName || '').trim();
      if (!supermarketName) {
        setError('Enter an existing supermarket name');
        setLoading(false);
        return;
      }
      // Resolve supermarket name to ID (auto-create if missing)
      const supermarketId = await MappingService.getSupermarketId(supermarketName);

      const payload: any = {
        supplier: Number(poForm.supplierId),
        supermarket: supermarketId, // always send ID
        // Omit po_number so backend auto-generates it
        expected_delivery_date: poForm.expectedDate || undefined,
        payment_terms: poForm.paymentTerms || undefined,
        buyer_name: poForm.buyerName || undefined,
        notes: poForm.notes || undefined,
        items: validItems.map(it => ({ product_text: it.productName, quantity: Number(it.quantity), unit_price: Number(it.unitPrice || '0') })),
      };
      console.log('PO creation payload:', payload);
      await PurchaseOrderService.create(payload);
      setPoForm({ supplierId: '', supermarketName: '', expectedDate: '', paymentTerms: 'Net 30', buyerName: '', notes: '' });
      setPoItems([{ productName: '', quantity: '1', unitPrice: '0' }]);
      const res = await PurchaseOrderService.list();
      console.log('PO list after creation:', res);
      setPoSummary(Array.isArray(res) ? res : res.results || []);
      alert('PO created');
    } catch (e: any) {
      setError(e?.message || 'Failed to create PO');
    } finally { setLoading(false); }
  };

  const downloadPOExcelTemplate = () => {
    const tip = 'expected_delivery_date must be YYYY-MM-DD';
    const rows = [
      ['po_number','supplier_name','supermarket_name','buyer_name','expected_delivery_date','payment_terms','notes','product_name','category_name','quantity','unit_price','_note'],
      ['PO-2025-01','Tech Supplier Ltd','Main Store','Your Business','2025-09-10','Net 30','Optional note','Dell Laptop','Electronics','10','800', tip]
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'po_template.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const handlePOCsvUpload = async (file: File) => {
    setLoading(true); setError('');
    try {
      const text = await file.text();
      const [header, ...lines] = text.split(/\r?\n/).filter(Boolean);
      const cols = header.split(',').map(s => s.replace(/^\"|\"$/g,'').trim());
      const idx = (name: string) => cols.findIndex(c => c.replace(/\"/g,'').toLowerCase() === name);
      const poGroups: Record<string, any> = {};

      // Build a quick lookup for supermarkets by name (case-insensitive)
      const smByName = new Map<string, string>();
      supermarkets.forEach(s => smByName.set(s.name.trim().toLowerCase(), s.id));

      // Helper: normalize date -> YYYY-MM-DD if possible
      const normalizeDate = (val: string) => {
        const v = (val || '').trim();
        if (!v) return '';
        // Allow already-correct format
        if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
        // Try to parse flexible formats like 10/09/2025, 10-09-2025, 10 Sep 2025 etc.
        const d = new Date(v);
        if (!isNaN(d.getTime())) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          return `${yyyy}-${mm}-${dd}`;
        }
        return v; // fallback, backend will validate
      };

      for (const line of lines) {
        const cells = line.match(/\"([^\"]|\"\")*\"|[^,]+/g) || [];
        const val = (i: number) => (cells[i] || '').replace(/^\"|\"$/g,'');
        const poNumber = val(idx('po_number'));
        const supplierName = val(idx('supplier_name'));
        const supermarketName = val(idx('supermarket_name'));
        const buyerName = val(idx('buyer_name'));
        const expectedDate = normalizeDate(val(idx('expected_delivery_date')));
        const paymentTerms = val(idx('payment_terms'));
        const notes = val(idx('notes'));
        const productName = val(idx('product_name'));
        const categoryName = val(idx('category_name'));
        const quantity = Number(val(idx('quantity')) || '0');
        const unitPrice = Number(val(idx('unit_price')) || '0');

        if (!poGroups[poNumber]) poGroups[poNumber] = { po_number: poNumber, supplier_name: supplierName, supermarket_name: supermarketName, buyer_name: buyerName, expected_delivery_date: expectedDate, payment_terms: paymentTerms, notes, items: [] };
        poGroups[poNumber].items.push({ product_name: productName, category_name: categoryName, quantity, unit_price: unitPrice });
      }

      for (const key of Object.keys(poGroups)) {
        const group = poGroups[key];
        const smName = (group.supermarket_name || poForm.supermarketName || '').trim();
        if (!smName) { console.warn('Skipping PO due to missing supermarket name:', group); continue; }

        // Map supermarket name -> id if available
        const smId = smByName.get(smName.toLowerCase());

        // Map supplier name to supplier ID
        const supplierObj = suppliers.find(s => s.name.trim().toLowerCase() === group.supplier_name.trim().toLowerCase());
        const supplierId = supplierObj ? supplierObj.id : null;
        if (!supplierId) {
          setError(`Supplier "${group.supplier_name}" not found. Please add the supplier first.`);
          console.warn('Skipping PO due to missing supplier:', group);
          continue;
        }

        const items = group.items.map((it: any) => ({ product_text: it.product_name, quantity: Number(it.quantity||0), unit_price: Number(it.unit_price||0) }));
        const payload: any = {
          supplier: supplierId,
          // Omit po_number so backend auto-generates it
          expected_delivery_date: group.expected_delivery_date || undefined,
          payment_terms: group.payment_terms || undefined,
          buyer_name: group.buyer_name || undefined,
          notes: group.notes || undefined,
          items,
        };

        // Always resolve supermarket name to ID (auto-create if missing)
        let supermarketId = smId;
        if (!supermarketId) {
          try {
            supermarketId = await MappingService.getSupermarketId(smName);
          } catch (e) {
            const msg = (e as any)?.message || 'Could not resolve supermarket';
            console.warn('Skipping PO due to supermarket resolution failure:', { smName, msg, group });
            setError(`PO ${group.po_number || '(no number)'}: ${msg}`);
            continue; // skip this PO entry
          }
        }
        payload.supermarket = supermarketId;

        console.log('Uploading PO payload:', payload);
        try {
          const resp = await PurchaseOrderService.create(payload);
          console.log('PO upload response:', resp);
        } catch (err: any) {
          const msg = err?.message || 'Upload failed';
          console.error('PO upload error:', err);
          setError(`PO ${group.po_number || '(no number)'}: ${msg}`);
        }
      }
      const res = await PurchaseOrderService.list();
      setPoSummary(Array.isArray(res) ? res : res.results || []);
      alert('POs created from CSV');
    } catch (e: any) {
      setError(e?.message || 'Failed to import PO CSV');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Header */}
      <div className="bg-[#020617] rounded-[40px] p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#B7F000] opacity-5 blur-[100px] -mr-32 -mt-32"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
          <div className="flex items-center">
            <div className="bg-[#B7F000] p-5 rounded-2xl mr-8 rotate-3 shadow-[0_0_30px_rgba(183,240,0,0.3)]">
              <Users className="w-12 h-12 text-[#020617]" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-[#B7F000]/10 text-[#B7F000] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-[#B7F000]/20">Shipping Rules</span>
              </div>
              <h2 className="text-6xl font-black text-white uppercase tracking-tighter leading-none">Supplier List</h2>
              <p className="text-gray-400 mt-4 font-medium uppercase text-sm tracking-widest max-w-md">Manage your suppliers and orders.</p>
            </div>
          </div>
          {loading && (
            <div className="bg-[#1e293b] border border-gray-800 p-4 rounded-3xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#B7F000] animate-pulse"></div>
              <span className="text-white font-bold tracking-tighter uppercase text-xs">Syncing</span>
            </div>
          )}
        </div>
        {error && (
          <div className="mt-8 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4">
            <AlertCircle className="text-red-500 w-6 h-6" />
            <div>
              <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">Error Found</p>
              <p className="text-white font-bold text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Supplier */}
      <section className="bg-[#020617] rounded-[40px] border border-gray-800 overflow-hidden shadow-2xl">
        <div className="p-10 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-widest">
              {editingId ? 'Edit Supplier' : 'Add New Supplier'}
            </h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Add a new supplier to the system</p>
          </div>
          <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center">
            <Plus className="text-[#B7F000] w-6 h-6" />
          </div>
        </div>
        <div className="p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Supplier Name</label>
              <input 
                className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#B7F000]/50 focus:border-[#B7F000] transition-all font-bold placeholder:text-gray-700" 
                placeholder="FULL NAME" 
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Email</label>
              <input 
                className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#B7F000]/50 focus:border-[#B7F000] transition-all font-bold placeholder:text-gray-700" 
                placeholder="EMAIL ADDRESS" 
                value={form.email} 
                onChange={e => setForm({ ...form, email: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Phone</label>
              <input 
                className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#B7F000]/50 focus:border-[#B7F000] transition-all font-bold placeholder:text-gray-700" 
                placeholder="PHONE NUMBER" 
                value={form.phone} 
                onChange={e => setForm({ ...form, phone: e.target.value })} 
              />
            </div>
            <div className="space-y-2 lg:col-span-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Address</label>
              <input 
                className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#B7F000]/50 focus:border-[#B7F000] transition-all font-bold placeholder:text-gray-700" 
                placeholder="PHYSICAL ADDRESS" 
                value={form.address} 
                onChange={e => setForm({ ...form, address: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Payment Terms (Days)</label>
              <input 
                className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#B7F000]/50 focus:border-[#B7F000] transition-all font-bold placeholder:text-gray-700" 
                placeholder="0" 
                type="number" 
                min={0} 
                value={form.credit_days} 
                onChange={e => setForm({ ...form, credit_days: e.target.value })} 
              />
            </div>
          </div>
          <div className="mt-12 flex gap-4">
            <button 
              onClick={submitSupplier} 
              className="px-10 py-5 bg-[#B7F000] text-[#020617] font-black uppercase tracking-widest rounded-2xl hover:bg-[#a2d600] transition-all shadow-[0_0_20px_rgba(183,240,0,0.2)] flex items-center gap-3"
            >
              {editingId ? <><Edit3 size={18} /> Save Changes</> : <><Plus size={18} /> Save Supplier</>}
            </button>
            {editingId && (
              <button 
                onClick={resetForm} 
                className="px-10 py-5 bg-transparent text-white font-black uppercase tracking-widest rounded-2xl border-2 border-gray-800 hover:border-white transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Supplier List */}
      <section className="bg-white rounded-[40px] border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-[#F9FAFB]">
          <div>
            <h3 className="text-xl font-black text-[#020617] uppercase tracking-widest">All Suppliers</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">List of your suppliers</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => {
              const rows = [
                ['Name','Email','Phone','Address','Payment Time','Order Count'],
                ...suppliers.map((s: any) => {
                  const poCount = poSummary.filter((po: any) => po.supplier === s.id || po.supplier_name === s.name).length;
                  return [s.name, s.email||'', s.phone||'', s.address||'', String(s.credit_days ?? ''), String(poCount)];
                })
              ];
              const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = 'suppliers_list.csv'; a.click(); URL.revokeObjectURL(url);
            }} className="flex items-center gap-2 px-6 py-3 bg-[#020617] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-gray-800 transition-all">
              <Download size={14} className="text-[#B7F000]" /> Export List
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#020617] text-white">
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em]">Supplier Name</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em]">Contact</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em]">Address</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em]">Payment Time</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em]">Total Orders</th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {suppliers.map((s: any) => {
                const poCount = poSummary.filter((po: any) => po.supplier === s.id || po.supplier_name === s.name).length;
                return (
                  <tr key={s.id} className="group hover:bg-[#B7F000]/5 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-[#020617] text-sm tracking-tight">{s.name}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">ID: {s.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1">
                        {s.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-[#B7F000]" />
                            <span className="text-[11px] font-bold text-[#020617]">{s.email}</span>
                          </div>
                        )}
                        {s.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-[#B7F000]" />
                            <span className="text-[11px] font-bold text-[#020617]">{s.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-[11px] font-bold text-[#020617]">{s.address || 'UNDEFINED'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-[#B7F000]" />
                        <span className="text-sm font-black text-[#020617]">{s.credit_days ?? '0'} <span className="text-[10px] text-gray-400">DAYS</span></span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className="px-3 py-1 bg-gray-100 text-[#020617] text-[10px] font-black rounded-full border border-gray-200">{poCount} Orders</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setPoForm(prev => ({ ...prev, supplierId: String(s.id) }));
                            const el = document.getElementById('po-section');
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-[#B7F000] text-[#020617] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#a2d600] transition-all"
                        >
                          <Plus size={14} /> New Order
                        </button>
                        <button 
                          onClick={() => startEdit(s)} 
                          className="p-2 text-gray-400 hover:text-[#020617] hover:bg-gray-100 rounded-xl transition-all"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => removeSupplier(s.id)} 
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>




      {/* Purchase Orders on Suppliers page */}
      <section id="po-section" className="bg-[#020617] rounded-[40px] border border-gray-800 overflow-hidden shadow-2xl">
        <div className="p-10 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-widest">Order Management</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Create or import orders</p>
          </div>
          <div className="flex gap-4">
            <button onClick={async () => { downloadPOExcelTemplate(); }} className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl border border-gray-800 hover:border-[#B7F000] transition-all">
              <FileText size={14} className="text-[#B7F000]" /> Template
            </button>
            <label className="flex items-center gap-2 px-6 py-3 bg-[#B7F000] text-[#020617] text-[10px] font-black uppercase tracking-widest rounded-2xl cursor-pointer hover:bg-[#a2d600] transition-all shadow-[0_0_20px_rgba(183,240,0,0.2)]">
              <Upload size={14} /> Import CSV
              <input type="file" accept=".csv" className="hidden" onChange={e => e.target.files && handlePOCsvUpload(e.target.files[0])} />
            </label>
          </div>
        </div>

        <div className="p-12 space-y-12">
          {/* Manual PO Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Supplier</label>
              <select 
                className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#B7F000]/50 focus:border-[#B7F000] transition-all font-bold appearance-none cursor-pointer" 
                value={poForm.supplierId} 
                onChange={e => setPoForm({ ...poForm, supplierId: e.target.value })}
              >
                <option value="">Select Supplier</option>
                {supplierOptions.map(o => <option key={o.value} value={o.value} className="bg-[#020617]">{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Store Name</label>
              <input 
                className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#B7F000]/50 focus:border-[#B7F000] transition-all font-bold placeholder:text-gray-700" 
                placeholder="STORE NAME" 
                value={poForm.supermarketName} 
                onChange={e => setPoForm({ ...poForm, supermarketName: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Delivery Date</label>
              <input 
                type="date" 
                className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#B7F000]/50 focus:border-[#B7F000] transition-all font-bold [color-scheme:dark]" 
                value={poForm.expectedDate} 
                onChange={e => setPoForm({ ...poForm, expectedDate: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Payment Terms</label>
              <input 
                className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#B7F000]/50 focus:border-[#B7F000] transition-all font-bold placeholder:text-gray-700" 
                placeholder="PAYMENT TERMS (e.g. Net 30)" 
                value={poForm.paymentTerms} 
                onChange={e => setPoForm({ ...poForm, paymentTerms: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Buyer Name</label>
              <input 
                className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#B7F000]/50 focus:border-[#B7F000] transition-all font-bold placeholder:text-gray-700" 
                placeholder="YOUR NAME" 
                value={poForm.buyerName} 
                onChange={e => setPoForm({ ...poForm, buyerName: e.target.value })} 
              />
            </div>
            <div className="space-y-2 lg:col-span-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Notes</label>
              <textarea 
                className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#B7F000]/50 focus:border-[#B7F000] transition-all font-bold placeholder:text-gray-700 min-h-[100px]" 
                value={poForm.notes} 
                onChange={e => setPoForm({ ...poForm, notes: e.target.value })} 
              />
            </div>
          </div>

          <div className="bg-gray-900/30 rounded-3xl border border-gray-800/50 p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Package className="text-[#B7F000] w-5 h-5" />
                <h4 className="font-black text-white uppercase tracking-widest text-sm">Order Items</h4>
              </div>
              <button
                type="button"
                onClick={() => setPoItems(prev => [...prev, { productName: '', quantity: '1', unitPrice: '0' }])}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-gray-700 hover:border-[#B7F000] transition-all"
              >
                <Plus size={14} /> Add Another Item
              </button>
            </div>

            <div className="space-y-4">
              {poItems.map((it, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end bg-gray-900/20 p-6 rounded-2xl border border-gray-800/30 group">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Item Name</label>
                    <input
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-5 py-3 text-white text-sm focus:outline-none focus:border-[#B7F000] transition-all font-bold"
                      placeholder="e.g., Apple"
                      value={it.productName}
                      onChange={e => setPoItems(prev => prev.map((row, i) => i === idx ? { ...row, productName: e.target.value } : row))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">How Many</label>
                    <input
                      type="number"
                      min={1}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-5 py-3 text-white text-sm focus:outline-none focus:border-[#B7F000] transition-all font-bold"
                      value={it.quantity}
                      onChange={e => setPoItems(prev => prev.map((row, i) => i === idx ? { ...row, quantity: e.target.value } : row))}
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Price Each</label>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-5 py-3 text-white text-sm focus:outline-none focus:border-[#B7F000] transition-all font-bold"
                        value={it.unitPrice}
                        onChange={e => setPoItems(prev => prev.map((row, i) => i === idx ? { ...row, unitPrice: e.target.value } : row))}
                      />
                    </div>
                    {poItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setPoItems(prev => prev.filter((_, i) => i !== idx))}
                        className="p-3 text-gray-600 hover:text-red-500 transition-colors mt-6"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              onClick={submitPO} 
              className="px-12 py-5 bg-[#B7F000] text-[#020617] font-black uppercase tracking-widest rounded-2xl hover:bg-[#a2d600] transition-all shadow-[0_0_30px_rgba(183,240,0,0.3)] flex items-center gap-3"
            >
              <CheckCircle size={20} /> Create Order
            </button>
          </div>
        </div>
      </section>

      {/* PO Summary (quick view) */}
      <section className="bg-white rounded-[40px] border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-[#F9FAFB]">
          <div>
            <h3 className="text-xl font-black text-[#020617] uppercase tracking-widest">Order History</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">List of all your orders</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => {
              const rows = [
                ['Order#','Supplier','Store','Status','Total','Created'],
                ...poSummary.map((po: any) => [po.po_number || po.id, po.supplier_name || po.supplier, po.supermarket_name || po.supermarket, po.status, po.total_amount ?? '-', po.created_at?.slice(0,10)])
              ];
              const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = 'order_history.csv'; a.click(); URL.revokeObjectURL(url);
            }} className="flex items-center gap-2 px-6 py-3 bg-white text-[#020617] text-[10px] font-black uppercase tracking-widest rounded-2xl border border-gray-200 hover:border-[#020617] transition-all">
              <Download size={14} className="text-[#B7F000]" /> Export List
            </button>
            <button 
              onClick={async () => {
                setLoading(true); setError('');
                try { const res = await PurchaseOrderService.list(); const arr = Array.isArray(res) ? res : res.results || []; setPoSummary(arr); }
                catch (e: any) { setError(e?.message || 'Failed to refresh orders'); }
                finally { setLoading(false); }
              }} 
              className="flex items-center gap-2 px-6 py-3 bg-[#020617] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-gray-800 transition-all"
            >
              <RefreshCw size={14} className="text-[#B7F000]" /> Sync Orders
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#020617] text-white">
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em]">Order #</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em]">Supplier</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em]">Store</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em]">Total Price</th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em]">Date Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {poSummary.map((po: any) => (
                <tr key={po.id} className="group hover:bg-[#B7F000]/5 transition-colors">
                  <td className="px-8 py-6">
                    <span className="font-black text-[#020617] text-sm tracking-tighter">#{po.po_number || po.id}</span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-[11px] font-bold text-[#020617] uppercase tracking-tight">{po.supplier_name || po.supplier}</span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-[#B7F000]" />
                      <span className="text-[11px] font-bold text-[#020617]">{po.supermarket_name || po.supermarket}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      po.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-200' :
                      po.status === 'Pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                      'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-sm font-black text-[#020617]">${Number(po.total_amount ?? 0).toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{po.created_at?.slice(0,10)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}