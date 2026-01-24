import React, { useState } from 'react';
import { Scan, Search, Package, CheckCircle, XCircle } from 'lucide-react';
import type { Product } from '../types/Product'; 




interface ProductScannerProps {
  products: Product[];
}

const ProductScanner: React.FC<ProductScannerProps> = ({ products }) => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleScan = () => {
    if (!barcodeInput.trim()) return;
    
    setIsScanning(true);
    setNotFound(false);
    
    // Simulate scanning delay
    setTimeout(() => {
      const foundProduct = products.find(p => p.name.toLowerCase().includes(barcodeInput.trim().toLowerCase()));
      
      if (foundProduct) {
        setScannedProduct(foundProduct);
      } else {
        setNotFound(true);
        setScannedProduct(null);
      }
      
      setIsScanning(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  const clearScan = () => {
    setBarcodeInput('');
    setScannedProduct(null);
    setNotFound(false);
  };

  const getExpiryStatus = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    if (expiry <= now) return { status: 'expired', color: 'text-red-600', bg: 'bg-red-100' };
    if (expiry <= thirtyDaysFromNow) return { status: 'expiring', color: 'text-amber-600', bg: 'bg-amber-100' };
    return { status: 'fresh', color: 'text-green-600', bg: 'bg-green-100' };
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#B7F000]/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        
        <div className="text-center mb-12 relative z-10">
          <div className="bg-slate-900 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-2xl">
            <Scan className="w-12 h-12 text-[#B7F000] -rotate-3" />
          </div>
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="bg-[#B7F000] text-slate-900 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-[0_4px_15px_rgba(183,240,0,0.3)]">Registry Protocol</span>
          </div>
          <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter mb-4 leading-none">Optical Scanner</h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] max-w-sm mx-auto leading-relaxed">Initialize high-speed asset verification and global inventory synchronization sequence.</p>
        </div>

        {/* Scanner Input */}
        <div className="max-w-2xl mx-auto mb-12 relative z-10">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-[#B7F000]" />
              <input
                type="text"
                placeholder="Initialize scan sequence..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-6 py-5 pl-14 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#B7F000]/10 focus:border-[#B7F000] text-lg transition-all text-slate-900 font-bold placeholder:text-slate-300"
              />
            </div>
            <button
              onClick={handleScan}
              disabled={!barcodeInput.trim() || isScanning}
              className="px-10 py-5 bg-[#B7F000] hover:bg-[#A3D900] disabled:bg-slate-100 disabled:text-slate-400 text-slate-900 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_8px_25px_rgba(183,240,0,0.3)] hover:shadow-[0_12px_30px_rgba(183,240,0,0.4)] hover:-translate-y-1 active:scale-[0.98]"
            >
              {isScanning ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  <span>Syncing</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Execute Scan</span>
                </>
              )}
            </button>
          </div>
          
          <div className="flex justify-center mt-6">
            <button
              onClick={clearScan}
              className="text-slate-400 hover:text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
            >
              Reset Protocol Sequence
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="max-w-2xl mx-auto relative z-10">
          {isScanning && (
            <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-12 text-center animate-pulse">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                <Package className="w-10 h-10 text-[#B7F000]" />
              </div>
              <p className="text-slate-900 font-black uppercase tracking-[0.2em] text-sm">Querying Global Matrix...</p>
            </div>
          )}

          {notFound && (
            <div className="bg-red-50 border border-red-100 rounded-[32px] p-8 animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-red-100 shadow-sm shrink-0">
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-red-900 uppercase tracking-tighter mb-1">Asset Not Located</h3>
                  <p className="text-red-500 font-bold uppercase text-[10px] tracking-widest">
                    Identity <span className="text-red-900">"{barcodeInput}"</span> failed verification.
                  </p>
                </div>
              </div>
            </div>
          )}

          {scannedProduct && (
            <div className="bg-slate-50 rounded-[32px] border border-slate-200 p-10 animate-in zoom-in-95 duration-500 shadow-sm">
              <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-6 h-6 text-[#B7F000]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Asset Identified</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-0.5">Verified Registry Match</p>
                  </div>
                </div>
                <div className="bg-[#B7F000] text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[0_4px_15px_rgba(183,240,0,0.3)]">
                  Matrix Synchronized
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-black text-[#7AA100] uppercase tracking-[0.2em]">{scannedProduct.category || 'General Classification'}</span>
                    <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mt-1 leading-none">{scannedProduct.name}</h4>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">{scannedProduct.brand || 'Proprietary Brand'}</p>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Supply Node</span>
                      <span className="text-sm font-black text-slate-900 uppercase">{scannedProduct.supplier || 'UNSPECIFIED'}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Fiscal Value</span>
                      <span className="text-3xl font-black text-slate-900 tracking-tighter">${scannedProduct.price}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-[#020617] p-6 rounded-[24px] border border-gray-800 relative overflow-hidden group hover:border-[#B7F000]/50 transition-colors">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#B7F000]/5 rounded-full -mr-10 -mt-10"></div>
                    <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Inventory Density</h5>
                    <div className="flex justify-between items-end">
                      <div>
                        <span className={`text-5xl font-black tracking-tighter ${
                          scannedProduct.quantity > 10 ? 'text-white' : 
                          scannedProduct.quantity > 5 ? 'text-orange-500' : 'text-red-500'
                        }`}>
                          {scannedProduct.quantity}
                        </span>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-3">Units</span>
                      </div>
                      <div className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                        scannedProduct.quantity > 10 ? 'bg-[#B7F000]/10 text-[#B7F000] border-[#B7F000]/20' : 
                        scannedProduct.quantity > 5 ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {scannedProduct.quantity > 10 ? 'Optimal' : scannedProduct.quantity > 5 ? 'Threshold' : 'Critical'}
                      </div>
                    </div>
                  </div>

                  <div className={`p-6 rounded-[24px] border group hover:bg-gray-900 transition-colors ${
                    getExpiryStatus(scannedProduct.expiryDate).status === 'fresh' ? 'bg-[#B7F000]/5 border-[#B7F000]/20' :
                    getExpiryStatus(scannedProduct.expiryDate).status === 'expiring' ? 'bg-orange-500/5 border-orange-500/20' :
                    'bg-red-500/5 border-red-500/20'
                  }`}>
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Obsolescence Tracking</h5>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Expiry Vector</span>
                        <span className="text-sm font-black text-white">
                          {new Date(scannedProduct.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-gray-800">
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Protocol Status</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                          getExpiryStatus(scannedProduct.expiryDate).status === 'fresh' ? 'text-[#B7F000] border-[#B7F000]/20 bg-[#B7F000]/10' :
                          getExpiryStatus(scannedProduct.expiryDate).status === 'expiring' ? 'text-orange-500 border-orange-500/20 bg-orange-500/10' :
                          'text-red-500 border-red-500/20 bg-red-500/10'
                        }`}>
                          {getExpiryStatus(scannedProduct.expiryDate).status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-10 pt-8 border-t border-gray-800 flex gap-4">
                <button className="flex-1 bg-[#B7F000] text-[#020617] py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:bg-[#a2d600] hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(183,240,0,0.2)]">
                  Update Registry
                </button>
                <button className="flex-1 bg-transparent text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs border-2 border-gray-800 transition-all hover:border-white hover:scale-[1.02] active:scale-[0.98]">
                  Print Asset Ticket
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductScanner;