import React, { useState } from "react";
import {
  Edit,
  Trash2,
  Package,
  Calendar,
  Search,
  Filter,
  BarChart3,
  FileText,
  Download,
  MapPin,
} from "lucide-react";
import type { Product, Supermarket } from "../types/Product";
import BarcodeTicketManager from "./BarcodeTicketManager";
import barcodeService from "../services/barcodeService";

interface ProductListProps {
  products: Product[];
  supermarkets?: Supermarket[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onNavigate?: (view: string) => void;
  fallbackStoreName?: string; // used when resolution fails
  showBarcode?: boolean;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  supermarkets = [],
  onEdit,
  onDelete,
  onNavigate,
  fallbackStoreName,
  showBarcode = true,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showBarcodeManager, setShowBarcodeManager] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.category).filter(c => !!c && String(c).trim() !== "")))
  ] as string[];

  // Helper function to get supermarket name and details
  const getSupermarketInfo = (supermarketId: string) => {
    if (!supermarketId) return { name: 'Unknown Store', address: '', isSubStore: false };
    
    // Try by ID first
    const byId = supermarkets.find(s => String(s.id) === String(supermarketId));
    if (byId) return { name: byId.name, address: byId.address, isSubStore: byId.isSubStore || false };
    
    // Then try by name (handles older data where supermarketId stored the name)
    const byName = supermarkets.find(
      s => String(s.name).trim().toLowerCase() === String(supermarketId).trim().toLowerCase()
    );
    if (byName) return { name: byName.name, address: byName.address, isSubStore: byName.isSubStore || false };

    // Then try by address (handles cases where supermarketId stored the address/location)
    const byAddress = supermarkets.find(
      s => String(s.address || '').trim().toLowerCase() === String(supermarketId).trim().toLowerCase()
    );
    if (byAddress) return { name: byAddress.name, address: byAddress.address, isSubStore: byAddress.isSubStore || false };
    
    // Final fallback: use provided fallback name (e.g., navbar primary store) or generic label
    return { name: fallbackStoreName || 'Unknown Store', address: '', isSubStore: false };
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || String(product.category).trim() === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getExpiryStatus = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (expiry <= now) return "expired";
    if (expiry <= thirtyDays) return "expiring";
    return "fresh";
  };

  const expiryColorClasses: Record<string, string> = {
    expired: "bg-red-50 text-red-600 border-red-100",
    expiring: "bg-orange-50 text-orange-600 border-orange-100",
    fresh: "bg-green-50 text-green-600 border-green-100",
  };

  // Download individual barcode
  const downloadBarcode = async (product: Product) => {
    if (product.id.startsWith('product-')) {
      alert('Please save this product to the server before downloading a barcode.');
      return;
    }
    try {
      await barcodeService.downloadBarcodeImage(product.id, product.name);
    } catch (error) {
      console.error('Error downloading barcode:', error);
      alert('Failed to download barcode. Please try again.');
    }
  };

  // Download individual ticket
  const downloadTicket = async (product: Product) => {
    if (product.id.startsWith('product-')) {
      alert('Please save this product to the server before downloading a ticket.');
      return;
    }
    try {
      await barcodeService.downloadTicketPDF(product.id, product.name);
    } catch (error) {
      console.error('Error downloading ticket:', error);
      alert('Failed to download ticket. Please try again.');
    }
  };

  if (showBarcodeManager) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setShowBarcodeManager(false)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ← Back to Product List
          </button>
        </div>
        <BarcodeTicketManager
          products={filteredProducts}
          selectedProducts={selectedProducts}
          onSelectionChange={setSelectedProducts}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-black text-[#020617] tracking-tight uppercase">Asset Registry</h2>
          <p className="text-gray-500 font-medium text-sm mt-1">Operational view of active inventory nodes.</p>
        </div>
        <div className="flex items-center gap-4">
          {showBarcode && (
            <button
              onClick={() => setShowBarcodeManager(true)}
              className="flex items-center gap-3 px-8 py-4 bg-[#020617] text-[#B7F000] rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Generate Labels</span>
            </button>
          )}
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col lg:flex-row gap-4 mb-12">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-[#B7F000]" />
          <input
            type="text"
            placeholder="Search assets by identity or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[24px] focus:outline-none focus:ring-2 focus:ring-[#B7F000]/50 text-sm transition-all focus:bg-white font-medium"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pl-14 pr-12 py-5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[24px] focus:outline-none focus:ring-2 focus:ring-[#B7F000]/50 text-sm transition-all focus:bg-white font-black uppercase tracking-widest appearance-none cursor-pointer min-w-[240px]"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "All Classifications" : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Matrix Table */}
      {filteredProducts.length === 0 ? (
        <div className="bg-[#F9FAFB] rounded-[40px] border border-[#E5E7EB] p-24 text-center">
          <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
            <Package className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-black text-[#020617] tracking-tight uppercase mb-4">No Assets Located</h3>
          <p className="text-gray-500 font-medium max-w-sm mx-auto leading-relaxed mb-8">
            The current registry query returned zero matches. Verify your filters or add a new product.
          </p>
          {searchTerm === "" && filterCategory === "all" && (
            <button 
              onClick={() => onNavigate?.('add-product')}
              className="bg-[#B7F000] text-[#020617] font-black px-8 py-4 rounded-2xl shadow-[0_8px_25px_rgba(183,240,0,0.3)] hover:scale-105 transition-all uppercase tracking-widest text-xs"
            >
              Add New Product
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-[#E5E7EB] shadow-sm overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#020617] text-white">
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] first:rounded-tl-[40px]">Identity</th>
                  <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em]">Classification</th>
                  <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em]">Registry Node</th>
                  <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em]">Mass / Density</th>
                  <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em]">Valuation</th>
                  <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em]">Protocol Status</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] last:rounded-tr-[40px]">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const status = getExpiryStatus(product.expiryDate);
                  const supermarketInfo = getSupermarketInfo(product.supermarketId);
                  return (
                    <tr
                      key={product.id}
                      className="group hover:bg-[#B7F000]/5 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-black text-[#020617] text-sm tracking-tight group-hover:text-[#020617] transition-colors">{product.name}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{product.brand || 'No Brand'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{product.category}</span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-[#B7F000]" />
                          <span className="text-[11px] font-bold text-[#020617]">{supermarketInfo.name}</span>
                          {supermarketInfo.isSubStore && (
                            <span className="px-1.5 py-0.5 bg-[#020617] text-[#B7F000] text-[8px] font-black uppercase rounded">Sub</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-[#020617]">{product.quantity} <span className="text-[10px] text-gray-400">PCS</span></span>
                          <span className="text-[10px] font-bold text-gray-400 mt-0.5">{product.weight || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-sm font-black text-[#020617]">${product.price}</span>
                      </td>
                      <td className="px-6 py-6">
                        <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${expiryColorClasses[status]}`}>
                          {status}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-end gap-2">
                          <ActionButton
                            color="blue"
                            icon={<Edit className="w-3 h-3" />}
                            label="Edit"
                            onClick={() => onEdit(product)}
                            size="sm"
                          />
                          {showBarcode && (
                            <ActionButton
                              color="green"
                              icon={<Download className="w-3 h-3" />}
                              label="BARCODE"
                              onClick={() => downloadBarcode(product)}
                              size="sm"
                            />
                          )}
                          <ActionButton
                            color="purple"
                            icon={<FileText className="w-3 h-3" />}
                            label="Ticket"
                            onClick={() => downloadTicket(product)}
                            size="sm"
                          />
                          <ActionButton
                            color="red"
                            icon={<Trash2 className="w-3 h-3" />}
                            label="DELETE"
                            onClick={() => {
                              if (window.confirm("Delete this asset from registry permanently?")) {
                                onDelete(product.id);
                              }
                            }}
                            size="sm"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const ActionButton = ({
  color,
  icon,
  label,
  onClick,
  size = "md",
}: {
  color: "blue" | "red" | "green" | "purple";
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  size?: "sm" | "md";
}) => {
  const colorClasses = {
    blue: "bg-[#020617] text-[#B7F000] hover:bg-[#020617]/80",
    red: "bg-red-500 text-white hover:bg-red-600",
    green: "bg-[#B7F000] text-[#020617] hover:bg-[#A3D900]",
    purple: "bg-purple-600 text-white hover:bg-purple-700",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-[9px]",
    md: "px-4 py-2 text-xs",
  };

  return (
    <button
      onClick={onClick}
      className={`${colorClasses[color]} ${sizeClasses[size]} font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm hover:-translate-y-0.5`}
    >
      {icon}
      <span className="hidden xl:inline">{label}</span>
    </button>
  );
};

export default ProductList;
