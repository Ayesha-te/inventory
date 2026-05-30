import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Edit3,
  FileText,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import {
  MappingService,
  PurchaseOrderService,
  SupplierService,
  SupermarketService,
} from '../services/apiService';

interface Supplier {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  credit_days?: number;
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [poSummary, setPoSummary] = useState<any[]>([]);
  const [supermarkets, setSupermarkets] = useState<{ id: string; name: string }[]>([]);
  const poSectionRef = useRef<HTMLDivElement>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    credit_days: '0',
  });

  const [poForm, setPoForm] = useState({
    supplierId: '',
    supermarketName: '',
    expectedDate: '',
    paymentTerms: 'Net 30',
    buyerName: '',
    notes: '',
  });
  const [poItems, setPoItems] = useState<Array<{ productName: string; quantity: string; unitPrice: string }>>([
    { productName: '', quantity: '1', unitPrice: '0' },
  ]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const [supplierRes, poRes, supermarketRes] = await Promise.all([
          SupplierService.getSuppliers(),
          PurchaseOrderService.list().catch(() => []),
          SupermarketService.getSupermarkets().catch(() => []),
        ]);

        const supplierList: Supplier[] = Array.isArray(supplierRes) ? supplierRes : supplierRes.results || [];
        const poList = Array.isArray(poRes) ? poRes : poRes.results || [];
        const supermarketList = (Array.isArray(supermarketRes) ? supermarketRes : supermarketRes.results || []).map(
          (store: any) => ({
            id: String(store.id ?? store.uuid ?? ''),
            name: String(store.name ?? ''),
          })
        );

        setSuppliers(supplierList);
        setPoSummary(poList);
        setSupermarkets(supermarketList);
      } catch (loadError: any) {
        setError(loadError?.message || 'Failed to load suppliers, stores, or orders.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: '', email: '', phone: '', address: '', credit_days: '0' });
  };

  const submitSupplier = async () => {
    if (!form.name.trim()) {
      setError('Supplier name is required.');
      return;
    }

    setLoading(true);
    setError('');

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
        setSuppliers((previous) => previous.map((supplier) => (supplier.id === editingId ? { ...supplier, ...updated } : supplier)));
      } else {
        const created = await SupplierService.createSupplier(payload);
        setSuppliers((previous) => [...previous, created]);
      }

      resetForm();
    } catch (submitError: any) {
      setError(submitError?.message || 'Failed to save supplier.');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (supplier: Supplier) => {
    setEditingId(supplier.id);
    setForm({
      name: supplier.name || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      credit_days: String(supplier.credit_days ?? '0'),
    });
  };

  const removeSupplier = async (id: number) => {
    if (!confirm('Delete this supplier?')) return;

    setLoading(true);
    setError('');

    try {
      await SupplierService.deleteSupplier(id);
      setSuppliers((previous) => previous.filter((supplier) => supplier.id !== id));
      if (editingId === id) resetForm();
    } catch (removeError: any) {
      setError(removeError?.message || 'Failed to delete supplier.');
    } finally {
      setLoading(false);
    }
  };

  const submitPO = async () => {
    if (!poForm.supplierId) {
      setError('Select a supplier before creating the order.');
      return;
    }

    const validItems = poItems.filter(
      (item) => item.productName.trim() && Number(item.quantity) > 0
    );

    if (!validItems.length) {
      setError('Add at least one order item.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const supermarketName = poForm.supermarketName.trim();
      if (!supermarketName) {
        setError('Enter an existing store name.');
        setLoading(false);
        return;
      }

      const supermarketId = await MappingService.getSupermarketId(supermarketName);

      const payload: any = {
        supplier: Number(poForm.supplierId),
        supermarket: supermarketId,
        expected_delivery_date: poForm.expectedDate || undefined,
        payment_terms: poForm.paymentTerms || undefined,
        buyer_name: poForm.buyerName || undefined,
        notes: poForm.notes || undefined,
        items: validItems.map((item) => ({
          product_text: item.productName,
          quantity: Number(item.quantity),
          unit_price: Number(item.unitPrice || '0'),
        })),
      };

      await PurchaseOrderService.create(payload);
      setPoForm({
        supplierId: '',
        supermarketName: '',
        expectedDate: '',
        paymentTerms: 'Net 30',
        buyerName: '',
        notes: '',
      });
      setPoItems([{ productName: '', quantity: '1', unitPrice: '0' }]);

      const refreshedOrders = await PurchaseOrderService.list();
      setPoSummary(Array.isArray(refreshedOrders) ? refreshedOrders : refreshedOrders.results || []);
      alert('Order created successfully.');
    } catch (submitError: any) {
      setError(submitError?.message || 'Failed to create order.');
    } finally {
      setLoading(false);
    }
  };

  const downloadSupplierCsv = () => {
    const rows = [
      ['Name', 'Email', 'Phone', 'Address', 'Payment Days', 'Orders'],
      ...suppliers.map((supplier) => {
        const poCount = poSummary.filter(
          (order: any) => order.supplier === supplier.id || order.supplier_name === supplier.name
        ).length;

        return [
          supplier.name,
          supplier.email || '',
          supplier.phone || '',
          supplier.address || '',
          String(supplier.credit_days ?? ''),
          String(poCount),
        ];
      }),
    ];

    downloadCsv(rows, 'suppliers_list.csv');
  };

  const downloadPOExcelTemplate = () => {
    const rows = [
      [
        'po_number',
        'supplier_name',
        'supermarket_name',
        'buyer_name',
        'expected_delivery_date',
        'payment_terms',
        'notes',
        'product_name',
        'category_name',
        'quantity',
        'unit_price',
      ],
      [
        'PO-2025-01',
        'Tech Supplier Ltd',
        'Main Store',
        'Your Name',
        '2025-09-10',
        'Net 30',
        'Optional note',
        'Dell Laptop',
        'Electronics',
        '10',
        '800',
      ],
    ];

    downloadCsv(rows, 'po_template.csv');
  };

  const handlePOCsvUpload = async (file: File) => {
    setLoading(true);
    setError('');

    try {
      const text = await file.text();
      const [header, ...lines] = text.split(/\r?\n/).filter(Boolean);
      const columns = header.split(',').map((value) => value.replace(/^"|"$/g, '').trim());
      const getIndex = (name: string) =>
        columns.findIndex((column) => column.replace(/"/g, '').toLowerCase() === name);

      const orderGroups: Record<string, any> = {};
      const storeByName = new Map<string, string>();
      supermarkets.forEach((store) => storeByName.set(store.name.trim().toLowerCase(), store.id));

      const normalizeDate = (value: string) => {
        const trimmed = (value || '').trim();
        if (!trimmed) return '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
        const parsed = new Date(trimmed);
        if (!Number.isNaN(parsed.getTime())) {
          const year = parsed.getFullYear();
          const month = String(parsed.getMonth() + 1).padStart(2, '0');
          const day = String(parsed.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
        return trimmed;
      };

      for (const line of lines) {
        const cells = line.match(/"([^"]|"")*"|[^,]+/g) || [];
        const valueAt = (index: number) => (cells[index] || '').replace(/^"|"$/g, '');
        const poNumber = valueAt(getIndex('po_number'));

        if (!orderGroups[poNumber]) {
          orderGroups[poNumber] = {
            po_number: poNumber,
            supplier_name: valueAt(getIndex('supplier_name')),
            supermarket_name: valueAt(getIndex('supermarket_name')),
            buyer_name: valueAt(getIndex('buyer_name')),
            expected_delivery_date: normalizeDate(valueAt(getIndex('expected_delivery_date'))),
            payment_terms: valueAt(getIndex('payment_terms')),
            notes: valueAt(getIndex('notes')),
            items: [],
          };
        }

        orderGroups[poNumber].items.push({
          product_name: valueAt(getIndex('product_name')),
          quantity: Number(valueAt(getIndex('quantity')) || '0'),
          unit_price: Number(valueAt(getIndex('unit_price')) || '0'),
        });
      }

      for (const key of Object.keys(orderGroups)) {
        const group = orderGroups[key];
        const storeName = (group.supermarket_name || poForm.supermarketName || '').trim();
        if (!storeName) continue;

        const supplier = suppliers.find(
          (item) => item.name.trim().toLowerCase() === group.supplier_name.trim().toLowerCase()
        );

        if (!supplier) {
          setError(`Supplier "${group.supplier_name}" not found. Please add it first.`);
          continue;
        }

        let supermarketId = storeByName.get(storeName.toLowerCase());
        if (!supermarketId) {
          try {
            supermarketId = await MappingService.getSupermarketId(storeName);
          } catch (mappingError: any) {
            setError(mappingError?.message || 'Could not find one of the stores in your CSV.');
            continue;
          }
        }

        await PurchaseOrderService.create({
          supplier: supplier.id,
          supermarket: supermarketId,
          expected_delivery_date: group.expected_delivery_date || undefined,
          payment_terms: group.payment_terms || undefined,
          buyer_name: group.buyer_name || undefined,
          notes: group.notes || undefined,
          items: group.items.map((item: any) => ({
            product_text: item.product_name,
            quantity: Number(item.quantity || 0),
            unit_price: Number(item.unit_price || 0),
          })),
        });
      }

      const refreshedOrders = await PurchaseOrderService.list();
      setPoSummary(Array.isArray(refreshedOrders) ? refreshedOrders : refreshedOrders.results || []);
      alert('Orders imported successfully.');
    } catch (uploadError: any) {
      setError(uploadError?.message || 'Failed to import the CSV file.');
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const refreshedOrders = await PurchaseOrderService.list();
      setPoSummary(Array.isArray(refreshedOrders) ? refreshedOrders : refreshedOrders.results || []);
    } catch (refreshError: any) {
      setError(refreshError?.message || 'Failed to refresh orders.');
    } finally {
      setLoading(false);
    }
  };

  const exportOrderHistory = () => {
    const rows = [
      ['Order #', 'Supplier', 'Store', 'Status', 'Total', 'Created'],
      ...poSummary.map((order: any) => [
        order.po_number || order.id,
        order.supplier_name || order.supplier,
        order.supermarket_name || order.supermarket,
        order.status,
        order.total_amount ?? '-',
        order.created_at?.slice(0, 10),
      ]),
    ];

    downloadCsv(rows, 'order_history.csv');
  };

  return (
    <div className="space-y-6 pb-8">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Procurement</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Suppliers</h2>
            <p className="mt-2 text-sm text-slate-500">Manage supplier details and create purchase orders.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {loading && (
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                Updating...
              </span>
            )}
            <button
              type="button"
              onClick={() => poSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <FileText className="h-4 w-4" />
              Go to Orders
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Suppliers" value={suppliers.length} />
        <SummaryCard label="Orders" value={poSummary.length} />
        <SummaryCard label="Stores" value={supermarkets.length} />
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Supplier' : 'Add Supplier'}</h3>
            <p className="text-sm text-slate-500">Keep contact and payment details up to date.</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={submitSupplier}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {editingId ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingId ? 'Save' : 'Add Supplier'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Field label="Supplier Name" value={form.name} onChange={(value) => setForm((state) => ({ ...state, name: value }))} placeholder="Supplier name" />
          <Field label="Email" value={form.email} onChange={(value) => setForm((state) => ({ ...state, email: value }))} placeholder="Email address" />
          <Field label="Phone" value={form.phone} onChange={(value) => setForm((state) => ({ ...state, phone: value }))} placeholder="Phone number" />
          <Field label="Address" value={form.address} onChange={(value) => setForm((state) => ({ ...state, address: value }))} placeholder="Street, city" />
          <Field label="Payment Days" value={form.credit_days} onChange={(value) => setForm((state) => ({ ...state, credit_days: value }))} placeholder="0" type="number" />
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Supplier List</h3>
            <p className="text-sm text-slate-500">Review suppliers and jump straight into new orders.</p>
          </div>
          <button
            type="button"
            onClick={downloadSupplierCsv}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>

        {suppliers.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Supplier</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Contact</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Address</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Payment Days</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Orders</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => {
                  const poCount = poSummary.filter(
                    (order: any) => order.supplier === supplier.id || order.supplier_name === supplier.name
                  ).length;

                  return (
                    <tr key={supplier.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-slate-900">{supplier.name}</p>
                        <p className="mt-1 text-xs text-slate-400">ID {supplier.id}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1.5 text-sm text-slate-600">
                          {supplier.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-slate-400" />
                              <span>{supplier.email}</span>
                            </div>
                          )}
                          {supplier.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-slate-400" />
                              <span>{supplier.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span>{supplier.address || 'Not added'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span>{supplier.credit_days ?? 0} days</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {poCount} orders
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPoForm((previous) => ({ ...previous, supplierId: String(supplier.id) }));
                              poSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            New Order
                          </button>
                          <button
                            type="button"
                            onClick={() => startEdit(supplier)}
                            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSupplier(supplier.id)}
                            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No suppliers added"
            description="Add suppliers to streamline purchasing and create orders faster."
          />
        )}
      </section>

      <section ref={poSectionRef} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Order Management</h3>
            <p className="text-sm text-slate-500">Create a purchase order or import one from a CSV file.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={downloadPOExcelTemplate}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <FileText className="h-4 w-4" />
              Template
            </button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
              <Upload className="h-4 w-4" />
              Import CSV
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(event) => event.target.files && handlePOCsvUpload(event.target.files[0])}
              />
            </label>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SelectField
            label="Supplier"
            value={poForm.supplierId}
            onChange={(value) => setPoForm((state) => ({ ...state, supplierId: value }))}
            options={[
              { value: '', label: 'Select supplier' },
              ...suppliers.map((supplier) => ({ value: String(supplier.id), label: supplier.name })),
            ]}
          />
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Store Name
            </label>
            <input
              list="stockive-store-list"
              value={poForm.supermarketName}
              onChange={(event) => setPoForm((state) => ({ ...state, supermarketName: event.target.value }))}
              placeholder="Main Store"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
            />
            <datalist id="stockive-store-list">
              {supermarkets.map((store) => (
                <option key={store.id} value={store.name} />
              ))}
            </datalist>
          </div>
          <Field
            label="Delivery Date"
            value={poForm.expectedDate}
            onChange={(value) => setPoForm((state) => ({ ...state, expectedDate: value }))}
            placeholder=""
            type="date"
          />
          <Field
            label="Payment Terms"
            value={poForm.paymentTerms}
            onChange={(value) => setPoForm((state) => ({ ...state, paymentTerms: value }))}
            placeholder="Net 30"
          />
          <Field
            label="Buyer Name"
            value={poForm.buyerName}
            onChange={(value) => setPoForm((state) => ({ ...state, buyerName: value }))}
            placeholder="Your name"
          />
          <div className="md:col-span-2 xl:col-span-3">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Notes
            </label>
            <textarea
              rows={3}
              value={poForm.notes}
              onChange={(event) => setPoForm((state) => ({ ...state, notes: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
              placeholder="Optional notes for this order"
            />
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Order Items</h4>
              <p className="text-xs text-slate-500">Add the products you want to order.</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setPoItems((previous) => [...previous, { productName: '', quantity: '1', unitPrice: '0' }])
              }
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Add Item
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {poItems.map((item, index) => (
              <div key={index} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[minmax(0,2fr)_120px_140px_auto]">
                <Field
                  label="Item Name"
                  value={item.productName}
                  onChange={(value) =>
                    setPoItems((previous) =>
                      previous.map((row, rowIndex) => (rowIndex === index ? { ...row, productName: value } : row))
                    )
                  }
                  placeholder="Apple, Milk, Rice..."
                />
                <Field
                  label="Quantity"
                  value={item.quantity}
                  onChange={(value) =>
                    setPoItems((previous) =>
                      previous.map((row, rowIndex) => (rowIndex === index ? { ...row, quantity: value } : row))
                    )
                  }
                  placeholder="1"
                  type="number"
                />
                <Field
                  label="Price Each"
                  value={item.unitPrice}
                  onChange={(value) =>
                    setPoItems((previous) =>
                      previous.map((row, rowIndex) => (rowIndex === index ? { ...row, unitPrice: value } : row))
                    )
                  }
                  placeholder="0.00"
                  type="number"
                />
                <div className="flex items-end justify-end">
                  {poItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setPoItems((previous) => previous.filter((_, rowIndex) => rowIndex !== index))}
                      className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={submitPO}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <CheckCircle className="h-4 w-4" />
            Create Order
          </button>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Order History</h3>
            <p className="text-sm text-slate-500">Review all purchase orders in one list.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={exportOrderHistory}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              type="button"
              onClick={refreshOrders}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {poSummary.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Order #</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Supplier</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Store</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Total</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Created</th>
                </tr>
              </thead>
              <tbody>
                {poSummary.map((order: any) => (
                  <tr key={order.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">#{order.po_number || order.id}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{order.supplier_name || order.supplier}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{order.supermarket_name || order.supermarket}</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                      ${Number(order.total_amount ?? 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-slate-500">
                      {order.created_at?.slice(0, 10)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No orders yet"
            description="Create your first order to start tracking purchasing."
          />
        )}
      </section>
    </div>
  );
}

const SummaryCard = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">{value}</p>
  </div>
);

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) => (
  <div>
    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
    />
  </div>
);

const SelectField = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) => (
  <div>
    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
      {label}
    </label>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const normalized = String(status || '').toUpperCase();
  const classes =
    normalized === 'COMPLETED' || normalized === 'RECEIVED'
      ? 'bg-emerald-50 text-emerald-700'
      : normalized === 'PENDING'
        ? 'bg-amber-50 text-amber-700'
        : 'bg-slate-100 text-slate-700';

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>
      {status || 'Pending'}
    </span>
  );
};

const EmptyState = ({ title, description }: { title: string; description: string }) => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
    <Users className="mx-auto h-10 w-10 text-slate-300" />
    <h4 className="mt-4 text-lg font-bold text-slate-900">{title}</h4>
    <p className="mt-2 text-sm text-slate-500">{description}</p>
  </div>
);

const downloadCsv = (rows: string[][], fileName: string) => {
  const csv = rows
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};
