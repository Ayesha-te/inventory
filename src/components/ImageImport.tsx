import React, { useState, useRef } from 'react';
import { Camera, Image, CheckCircle, XCircle, AlertCircle, Edit3, Info, Download, HelpCircle } from 'lucide-react';
import type { Product, Supermarket, User } from '../types/Product';
import { 
  generateImageImportGuide, 
  validateImageData, 
  IMAGE_CAPTURE_GUIDELINES,
  EXTRACTABLE_INFORMATION
} from '../utils/imageTemplates';
import type { ImageProductData } from '../utils/imageTemplates';

interface ImageImportProps {
  onProductExtracted: (product: Omit<Product, 'id'>, storeIds?: string[]) => void;
  onCancel: () => void;
  supermarkets?: Supermarket[]; // for multi-store selection
  currentUser?: User | null;
  supermarketId?: string; // fallback single store id
}





interface ExtractedData {
  name?: string;
  brand?: string;
  weight?: string;
  price?: number;
  barcode?: string;
  expiryDate?: string;
  category?: string;
  confidence: number;
}

const ImageImport: React.FC<ImageImportProps> = ({ onProductExtracted, onCancel, supermarkets = [], currentUser = null, supermarketId }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});
  const [showGuide, setShowGuide] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Multi-store selection
  const isMultiStore = Array.isArray(supermarkets) && supermarkets.length > 1;
  const [addToMultipleStores, setAddToMultipleStores] = useState(false);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [addToAllStores, setAddToAllStores] = useState(false);

  // Download image import guide
  const downloadGuide = () => {
    const guideContent = generateImageImportGuide();
    const blob = new Blob([guideContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'image_import_guide.txt');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);

    // Create image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // Use the image-to-text service to extract fields
      const { extractTextFromImage } = await import('../services/imageToText');
      const result = await extractTextFromImage(file);

      const normalized: ExtractedData = {
        name: result.name,
        brand: result.brand,
        weight: result.weight,
        price: result.price,
        barcode: result.barcode,
        expiryDate: result.expiryDate,
        category: result.category,
        confidence: result.confidence,
      };

      setExtractedData(normalized);
      
      // Initialize editing form with extracted data
      setEditingProduct({
        name: normalized.name,
        brand: normalized.brand,
        weight: normalized.weight,
        price: normalized.price,
        sellingPrice: normalized.price,
        barcode: normalized.barcode,
        expiryDate: normalized.expiryDate,
        category: normalized.category,
        addedDate: new Date().toISOString().split('T')[0],
        supermarketId,
        halalCertified: true,
        quantity: 1,
        supplier: ''
      });

    } catch (err: any) {
      const msg = err?.message || 'Failed to process image. Please try again.';
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEditingProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirmProduct = () => {
    if (editingProduct.name && editingProduct.category && editingProduct.quantity && editingProduct.price && editingProduct.supplier && editingProduct.expiryDate) {
      const baseProduct = editingProduct as Omit<Product, 'id'>;
      if (isMultiStore && addToMultipleStores) {
        const storeIds = addToAllStores ? supermarkets.map(s => s.id) : selectedStores;
        onProductExtracted(baseProduct, storeIds);
      } else {
        onProductExtracted({ ...baseProduct, supermarketId: supermarketId || baseProduct.supermarketId || '' });
      }
    }
  };

  const categories = ['Meat', 'Dairy', 'Snacks', 'Beverages', 'Frozen', 'Bakery', 'Condiments', 'Other'];

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#B7F000]/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        
        <div className="flex items-center justify-between mb-12 relative z-10">
          <div className="flex items-center">
            <div className="bg-[#B7F000] p-4 rounded-2xl mr-6 rotate-3 shadow-[0_8px_30px_rgba(183,240,0,0.3)]">
              <Camera className="w-8 h-8 text-[#020617] -rotate-3" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Visual Scan</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Analyze product photos for automated data mapping.</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-all group"
          >
            <XCircle className="w-6 h-6 text-slate-400 group-hover:text-slate-900" />
          </button>
        </div>

        {/* Photo Guidelines Section */}
        <div className="bg-slate-900 rounded-[32px] p-8 mb-12 border border-slate-800 relative overflow-hidden group z-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-all"></div>
          <div className="flex items-start gap-6 relative z-10">
            <div className="bg-[#B7F000] p-3 rounded-xl">
              <HelpCircle className="w-6 h-6 text-[#020617]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Capture Guidelines</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8 leading-relaxed">
                Follow these tips to ensure accurate data extraction and high-fidelity asset recognition.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={downloadGuide}
                  className="px-6 py-3 bg-[#B7F000] hover:bg-[#A3D900] text-[#020617] rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_8px_20px_rgba(183,240,0,0.3)] flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Get Protocol Guide
                </button>
                <button
                  onClick={() => setShowGuide(!showGuide)}
                  className="px-6 py-3 text-[10px] font-black text-[#B7F000] uppercase tracking-widest hover:underline"
                >
                  {showGuide ? 'Hide' : 'Show'} Expert Tips
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Guidelines Details */}
        {showGuide && (
          <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-200 mb-12 animate-in fade-in slide-in-from-top-4 z-10 relative">
            <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-8 flex items-center gap-3">
              <span className="w-1.5 h-4 bg-[#B7F000] rounded-full"></span>
              Optical Capture Requirements
            </h4>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h5 className="font-black text-[9px] text-slate-400 uppercase tracking-widest mb-4">Lighting & Quality</h5>
                <ul className="space-y-3">
                  {[...IMAGE_CAPTURE_GUIDELINES.lighting, ...IMAGE_CAPTURE_GUIDELINES.quality].map((tip, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-[#B7F000] rounded-full mt-1.5"></div>
                      <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tight leading-snug">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-black text-[9px] text-slate-400 uppercase tracking-widest mb-4">Positioning</h5>
                <ul className="space-y-3">
                  {[...IMAGE_CAPTURE_GUIDELINES.positioning, ...IMAGE_CAPTURE_GUIDELINES.content].map((tip, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-[#B7F000] rounded-full mt-1.5"></div>
                      <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tight leading-snug">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-12 grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
                <h6 className="font-black text-[9px] text-emerald-600 uppercase tracking-widest mb-3">Commit List</h6>
                <ul className="text-[10px] text-emerald-800 space-y-1.5 font-black uppercase tracking-widest">
                  <li>✓ Product identity</li>
                  <li>✓ Brand origin</li>
                  <li>✓ Mass / Volume</li>
                  <li>✓ Optical barcode</li>
                  <li>✓ Price point</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm">
                <h6 className="font-black text-[9px] text-red-600 uppercase tracking-widest mb-3">Avoidance</h6>
                <ul className="text-[10px] text-red-800 space-y-1.5 font-black uppercase tracking-widest">
                  <li>✗ Lens blur</li>
                  <li>✗ Glare & flare</li>
                  <li>✗ Deep shadows</li>
                  <li>✗ Multiple targets</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h6 className="font-black text-[9px] text-slate-900 uppercase tracking-widest mb-3">Best Practices</h6>
                <ul className="text-[10px] text-slate-400 space-y-1.5 font-black uppercase tracking-widest">
                  <li>✓ Uniform lux</li>
                  <li>✓ Orthogonal angle</li>
                  <li>✓ Macro focus</li>
                  <li>✓ Solid backdrop</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {!selectedImage && !isProcessing && (
          <div className="relative z-10">
            <div className="bg-slate-50 rounded-[40px] p-16 border border-slate-200 text-center">
              <div className="bg-white w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                <Camera className="w-12 h-12 text-[#B7F000]" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4 uppercase">Initialize Optical Scan</h3>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-12 max-w-lg mx-auto leading-relaxed">
                Capture or upload a clear photo of the asset label for automated data extraction.
              </p>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                capture="environment"
                className="hidden"
              />
              
              <div className="flex gap-6 justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-10 py-5 bg-[#B7F000] hover:bg-[#A3D900] text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_8px_25px_rgba(183,240,0,0.3)] hover:shadow-[0_12px_30px_rgba(183,240,0,0.4)] hover:-translate-y-1 flex items-center gap-3"
                >
                  <Camera className="w-5 h-5" />
                  Live Capture
                </button>
                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.removeAttribute('capture');
                      fileInputRef.current.click();
                    }
                  }}
                  className="px-10 py-5 bg-slate-900 text-[#B7F000] rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:shadow-2xl hover:-translate-y-1 flex items-center gap-3"
                >
                  <Image className="w-5 h-5" />
                  Upload Frame
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-200">
                <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-[10px] flex items-center gap-3">
                  <span className="w-1.5 h-3 bg-[#B7F000] rounded-full"></span>
                  Extraction Scope
                </h4>
                <ul className="space-y-4">
                  {[
                    'Product Identity & Brand',
                    'Price Point & Weight',
                    'Barcode & Category',
                    'Expiry Date Protocol'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-[#B7F000]/10 rounded-lg flex items-center justify-center border border-[#B7F000]/20">
                        <div className="w-1 h-1 bg-[#B7F000] rounded-full"></div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900 rounded-[32px] p-8 border border-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-all"></div>
                <h4 className="font-black text-white mb-6 uppercase tracking-widest text-[10px] flex items-center gap-3 relative z-10">
                  <span className="w-1.5 h-3 bg-[#B7F000] rounded-full"></span>
                  Quick Protocol
                </h4>
                <ul className="space-y-4 relative z-10">
                  {[
                    'High-Intensity Lighting',
                    'Clear Label Visibility',
                    'Glare/Shadow Avoidance',
                    'Orthogonal Angle'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                        <CheckCircle className="w-3 h-3 text-[#B7F000]" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="bg-slate-50 rounded-[40px] p-16 border border-slate-200 text-center relative z-10">
            {selectedImage && (
              <div className="mb-12 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent rounded-[32px] z-10"></div>
                <img 
                  src={selectedImage} 
                  alt="Processing" 
                  className="w-48 h-48 object-cover rounded-[32px] mx-auto shadow-2xl border-4 border-white relative z-0"
                />
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#B7F000] text-slate-900 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl z-20 animate-bounce">
                  Scanning Asset
                </div>
              </div>
            )}
            
            <div className="max-w-md mx-auto">
              <div className="flex justify-center gap-1.5 mb-8">
                {[0, 1, 2].map((i) => (
                  <div 
                    key={i} 
                    className="w-3 h-3 bg-[#B7F000] rounded-full animate-bounce" 
                    style={{ animationDelay: `${i * 0.1}s` }}
                  ></div>
                ))}
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3 uppercase">Analyzing Frame</h3>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] leading-relaxed">
                The Optical Intelligence Engine is extracting asset parameters and validating brand authenticity.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 rounded-[32px] p-8 border border-red-100 flex items-start gap-6 mb-8 relative z-10">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-red-100">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h4 className="font-black text-red-900 uppercase tracking-widest text-[10px] mb-2">Protocol Exception</h4>
              <p className="text-red-700 font-bold text-xs uppercase tracking-tight mb-4 leading-relaxed">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setSelectedImage(null);
                }}
                className="px-6 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
              >
                Reset Ingress Stream
              </button>
            </div>
          </div>
        )}

        {extractedData && selectedImage && !isProcessing && (
          <div className="space-y-12 relative z-10">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="relative group">
                <div className="absolute inset-0 bg-[#B7F000]/20 blur-2xl group-hover:bg-[#B7F000]/30 transition-all opacity-0 group-hover:opacity-100"></div>
                <img 
                  src={selectedImage} 
                  alt="Product" 
                  className="w-full h-full object-cover rounded-[40px] shadow-2xl border-4 border-white relative z-10"
                />
              </div>

              <div>
                <div className="bg-slate-50 rounded-[32px] p-8 mb-8 border border-slate-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#B7F000]/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="bg-[#B7F000] p-2 rounded-lg shadow-[0_4px_15px_rgba(183,240,0,0.3)]">
                      <CheckCircle className="w-5 h-5 text-slate-900" />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                      Asset Decoded
                    </h3>
                  </div>
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-end gap-2">
                      <span className="text-5xl font-black text-slate-900 tracking-tighter">
                        {Math.round(extractedData.confidence * 100)}%
                      </span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Confidence Level</span>
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                      High-fidelity recognition of asset parameters achieved. Verify decoded metadata below.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm">
                  <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-[10px] flex items-center gap-3">
                    <span className="w-1.5 h-4 bg-[#B7F000] rounded-full"></span>
                    Decoded Parameters
                  </h4>
                  <div className="space-y-4">
                    {[
                      { label: 'Asset Identity', value: extractedData.name },
                      { label: 'Brand Origin', value: extractedData.brand },
                      { label: 'Market Value', value: extractedData.price ? `$${extractedData.price}` : null },
                      { label: 'Net Weight', value: extractedData.weight },
                      { label: 'Classification', value: extractedData.category }
                    ].map((field, i) => (
                      <div key={i} className="flex items-center justify-between pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{field.label}</span>
                        <span className="text-xs font-black text-slate-900 uppercase">{field.value || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-[40px] p-12 border border-slate-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#B7F000]/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-[#B7F000]/10 transition-all"></div>
              <div className="flex items-center gap-4 mb-10 relative z-10">
                <div className="bg-slate-900 p-3 rounded-xl rotate-3 shadow-lg">
                  <Edit3 className="w-6 h-6 text-[#B7F000] -rotate-3" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Final Registry Protocol</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Identity *</label>
                  <input
                    type="text"
                    value={editingProduct.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter asset name"
                    className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold text-sm focus:border-[#B7F000] focus:ring-4 focus:ring-[#B7F000]/10 transition-all outline-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classification *</label>
                  <select
                    value={editingProduct.category || ''}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold text-sm focus:border-[#B7F000] focus:ring-4 focus:ring-[#B7F000]/10 transition-all outline-none appearance-none"
                    required
                  >
                    <option value="">Select classification</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Source Supplier *</label>
                  <input
                    type="text"
                    value={editingProduct.supplier || ''}
                    onChange={(e) => handleInputChange('supplier', e.target.value)}
                    placeholder="Enter supplier entity"
                    className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold text-sm focus:border-[#B7F000] focus:ring-4 focus:ring-[#B7F000]/10 transition-all outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity *</label>
                    <input
                      type="number"
                      value={editingProduct.quantity || 1}
                      onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold text-sm focus:border-[#B7F000] focus:ring-4 focus:ring-[#B7F000]/10 transition-all outline-none"
                      min="1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Value *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingProduct.price || ''}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                      placeholder="0.00"
                      className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold text-sm focus:border-[#B7F000] focus:ring-4 focus:ring-[#B7F000]/10 transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiration Protocol *</label>
                  <input
                    type="date"
                    value={editingProduct.expiryDate || ''}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold text-sm focus:border-[#B7F000] focus:ring-4 focus:ring-[#B7F000]/10 transition-all outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand Origin</label>
                    <input
                      type="text"
                      value={editingProduct.brand || ''}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      placeholder="Brand"
                      className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold text-sm focus:border-[#B7F000] focus:ring-4 focus:ring-[#B7F000]/10 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mass / Volume</label>
                    <input
                      type="text"
                      value={editingProduct.weight || ''}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      placeholder="e.g. 500g"
                      className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold text-sm focus:border-[#B7F000] focus:ring-4 focus:ring-[#B7F000]/10 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Multi-store selection */}
              {isMultiStore && (
                <div className="bg-white rounded-[32px] p-8 mt-12 border border-slate-200 relative z-10 shadow-sm">
                  <div className="flex items-center mb-6">
                    <label className="relative flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={addToMultipleStores}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setAddToMultipleStores(checked);
                          if (!checked) {
                            setSelectedStores([]);
                            setAddToAllStores(false);
                          }
                        }}
                        className="sr-only"
                      />
                      <div className={`w-6 h-6 rounded-lg border-2 transition-all mr-4 flex items-center justify-center ${addToMultipleStores ? 'bg-[#B7F000] border-[#B7F000]' : 'border-slate-200 bg-slate-50'}`}>
                        {addToMultipleStores && <CheckCircle className="w-4 h-4 text-slate-900" />}
                      </div>
                      <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Global Sync Protocol</span>
                    </label>
                  </div>

                  {addToMultipleStores && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-top-4">
                      <label className="relative flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={addToAllStores}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setAddToAllStores(checked);
                            if (checked) {
                              setSelectedStores(supermarkets.map(s => s.id));
                            } else {
                              setSelectedStores([]);
                            }
                          }}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-md border-2 transition-all mr-3 flex items-center justify-center ${addToAllStores ? 'bg-[#B7F000] border-[#B7F000]' : 'border-slate-200 bg-slate-50'}`}>
                          {addToAllStores && <CheckCircle className="w-3 h-3 text-slate-900" />}
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sync with all active nodes ({supermarkets.length})</span>
                      </label>

                      {!addToAllStores && (
                        <div className="space-y-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Target Nodes</p>
                          <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {supermarkets.map(store => (
                              <label key={store.id} className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-[#B7F000]/30 transition-all cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={selectedStores.includes(store.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedStores(prev => [...prev, store.id]);
                                    } else {
                                      setSelectedStores(prev => prev.filter(id => id !== store.id));
                                    }
                                  }}
                                  className="sr-only"
                                />
                                <div className={`w-4 h-4 rounded-md border-2 transition-all mr-3 flex items-center justify-center ${selectedStores.includes(store.id) ? 'bg-[#B7F000] border-[#B7F000]' : 'border-slate-300 bg-white'}`}>
                                  {selectedStores.includes(store.id) && <CheckCircle className="w-3 h-3 text-slate-900" />}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${selectedStores.includes(store.id) ? 'text-slate-900' : 'text-slate-400'}`}>
                                  {store.name}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-12 border-t border-slate-200 mt-12 relative z-10">
                <button
                  onClick={() => {
                    setExtractedData(null);
                    setSelectedImage(null);
                    setEditingProduct({});
                  }}
                  className="px-10 py-5 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-slate-200"
                >
                  Reject Scan
                </button>
                <button
                  onClick={handleConfirmProduct}
                  disabled={!editingProduct.name || !editingProduct.category || !editingProduct.supplier || !editingProduct.quantity || !editingProduct.price || !editingProduct.expiryDate}
                  className="px-12 py-5 bg-[#B7F000] hover:bg-[#A3D900] disabled:bg-slate-100 disabled:text-slate-400 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_8px_25px_rgba(183,240,0,0.3)] hover:shadow-[0_12px_30px_rgba(183,240,0,0.4)] flex items-center justify-center gap-3 hover:-translate-y-1 active:translate-y-0"
                >
                  <CheckCircle className="w-5 h-5" />
                  Commit to Registry
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageImport;