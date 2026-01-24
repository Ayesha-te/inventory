import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Download, Info, Plus } from 'lucide-react';
import type { Product, UploadSessionType, Supermarket } from '../types/Product';
import { 
  generateExcelTemplate, 
  generateFieldGuide, 
  validateExcelRow, 
  SAMPLE_EXCEL_DATA
} from '../utils/excelTemplates';
import type { ExcelProductRow } from '../utils/excelTemplates';

import { CategoryService, SupplierService, AuthService } from '../services/apiService';
import { handleExcelUploadEnhanced } from '../utils/excelImportService';

interface ExcelUploadProps {
  onProductsExtracted: (products: Product[]) => void;
  onCancel: () => void;
  supermarketId: string;
  storeCurrency?: string; // display-only currency badge
}

interface ExcelRow {
  name: string;
  category: string;
  quantity: number;
  price: number;
  supplier: string;
  expiryDate: string;
  barcode?: string;
  brand?: string;
  weight?: string;
  costPrice?: number;
}

const ExcelUpload: React.FC<ExcelUploadProps> = ({ onProductsExtracted, onCancel, supermarketId, storeCurrency }) => {
  console.log('🚀 ExcelUpload component rendered');
  console.log('🏪 ExcelUpload received supermarketId:', supermarketId);
  console.log('📋 ExcelUpload props:', { onProductsExtracted: !!onProductsExtracted, onCancel: !!onCancel, supermarketId });
  
  // Fetch categories and suppliers dynamically
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    console.log('🔄 ExcelUpload useEffect triggered');
    const fetchData = async () => {
      try {
        console.log('🔑 Getting authentication token...');
        const token = AuthService.getToken();
        if (!token) {
          console.error('❌ No authentication token found. User must be logged in.');
          return;
        }
        console.log('✅ Token found, length:', token.length);

        // Fetch categories with authentication
        console.log('📂 Fetching categories...');
        const categoriesData = await CategoryService.getCategories(token);
        console.log('📂 Categories response:', categoriesData);
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
          console.log('✅ Set categories (array):', categoriesData.length);
        } else if (categoriesData.results) {
          setCategories(categoriesData.results);
          console.log('✅ Set categories (results):', categoriesData.results.length);
        }

        // Fetch suppliers with authentication
        console.log('🏭 Fetching suppliers...');
        const suppliersData = await SupplierService.getSuppliers(token);
        console.log('🏭 Suppliers response:', suppliersData);
        if (Array.isArray(suppliersData)) {
          setSuppliers(suppliersData);
          console.log('✅ Set suppliers (array):', suppliersData.length);
        } else if (suppliersData.results) {
          setSuppliers(suppliersData.results);
          console.log('✅ Set suppliers (results):', suppliersData.results.length);
        }
      } catch (error) {
        console.error('Failed to fetch categories and suppliers:', error);
        if (error instanceof Error && error.message.includes('401')) {
          setAuthError('Authentication required. Please log in to import products.');
        } else {
          setAuthError('Failed to load categories and suppliers. Please try again.');
        }
      }
    };

    fetchData();
  }, []);

  const [uploadSession, setUploadSession] = useState<UploadSessionType | null>(null);
  const [extractedProducts, setExtractedProducts] = useState<Product[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [authError, setAuthError] = useState<string>('');
  const [showGuide, setShowGuide] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [importOptions, setImportOptions] = useState({
    createMissingCategories: true,
    createMissingSuppliers: true
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Currency info note
  const currencyNote = storeCurrency ? `All prices in ${storeCurrency}` : '';

  // Download Excel template
  const downloadTemplate = () => {
    const csvContent = generateExcelTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'product_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download field guide
  const downloadGuide = () => {
    const guideContent = generateFieldGuide();
    const blob = new Blob([guideContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'excel_import_guide.txt');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 File selection triggered');
    const file = event.target.files?.[0];
    if (!file) {
      console.log('❌ No file selected');
      return;
    }
    console.log('✅ File selected:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Check authentication
    const token = AuthService.getToken();
    if (!token) {
      setAuthError('Authentication required. Please log in to import products.');
      return;
    }

    // Validate supermarket ID (UUID)
    console.log('🏪 Validating supermarket ID:', supermarketId);
    const isValidUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(supermarketId);
    if (!supermarketId || supermarketId === 'default' || !isValidUUID) {
      console.log('❌ Invalid supermarket ID detected');
      setAuthError(`Invalid supermarket ID: "${supermarketId}". Please ensure you have a valid supermarket set up and selected. If you just registered, please refresh the page and try again.`);
      return;
    }
    console.log('✅ Supermarket ID validation passed:', supermarketId);

    // Create upload session
    const session: UploadSessionType = {
      id: Date.now().toString(),
      type: 'excel',
      status: 'uploading',
      fileName: file.name,
      progress: 0,
      createdAt: new Date().toISOString()
    };

    setUploadSession(session);
    setErrors([]);
    setAuthError('');
    setImportResult(null);

    try {
      console.log('🚀 Starting Excel import process...');
      console.log('📊 Import data:', {
        fileName: file.name,
        categoriesCount: categories.length,
        suppliersCount: suppliers.length,
        supermarketId,
        hasToken: !!token,
        importOptions
      });
      
      // Show progress
      setUploadSession(prev => prev ? { ...prev, progress: 25 } : null);
      
      // Use the enhanced import service
      console.log('📤 Calling handleExcelUploadEnhanced...');
      const result = await handleExcelUploadEnhanced(
        file,
        categories,
        suppliers,
        supermarketId, // UUID string
        token,
        importOptions
      );
      console.log('✅ Import completed successfully:', result);

      setUploadSession(prev => prev ? { ...prev, progress: 100, status: 'completed' } : null);
      setImportResult(result);

      // Convert result to display format for existing UI
      const displayProducts = result.results
        .filter(r => r.success)
        .map((r, index) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: r.product.name,
          category: r.product.category,
          supplier: r.product.supplier,
          quantity: r.product.quantity,
          price: r.product.selling_price || r.product.cost_price,
          // barcode removed from display, system auto-generates
          brand: r.product.brand || '',
          weight: r.product.weight || '',
          origin: r.product.origin || '',
          description: r.product.description || '',
          location: r.product.location || '',
          addedDate: new Date().toISOString().split('T')[0],
          expiryDate: (() => {
            const ed = r.product.expiry_date as any;
            if (typeof ed === 'string') return ed;
            if (ed && typeof ed === 'object' && typeof ed.toISOString === 'function') return ed.toISOString().split('T')[0];
            return '';
          })(),
          supermarketId: supermarketId || '',
          halalCertified: typeof r.product.halal_certified === 'string' ? r.product.halal_certified.toLowerCase() === 'true' : (r.product.halal_certified ?? true),
          halalCertificationBody: r.product.halal_certification_body || '',
          syncedWithPOS: false
        }));

      setExtractedProducts(displayProducts);

      // Show errors if any
      const failedResults = result.results.filter(r => !r.success);
      if (failedResults.length > 0) {
        setErrors(failedResults.map(r => `${r.product.name}: ${r.error}`));
      }

    } catch (error) {
      console.error('❌ Excel import failed:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        type: typeof error,
        error
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to process Excel file. Please ensure it follows the required format.';
      console.error('❌ Setting error message:', errorMessage);

      setUploadSession(prev => prev ? {
        ...prev,
        status: 'error',
        error: errorMessage
      } : null);

      setErrors([errorMessage]);
    }
  };

  const generateBarcode = () => {
    return Math.floor(100000000000 + Math.random() * 900000000000).toString();
  };

  const handleConfirmImport = () => {
    if (extractedProducts.length > 0) {
      // For UI state, return human-readable products (no IDs)
      const uiProducts = extractedProducts.map(({ id, ...rest }) => rest);
      onProductsExtracted(uiProducts as any);
    }
  };

  const removeProduct = (index: number) => {
    const updated = extractedProducts.filter((_, i) => i !== index);
    setExtractedProducts(updated);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#B7F000]/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        
        <div className="flex items-center justify-between mb-12 relative z-10">
          <div className="flex items-center">
            <div className="bg-[#B7F000] p-4 rounded-2xl mr-6 rotate-3 shadow-[0_8px_30px_rgba(183,240,0,0.3)]">
              <FileSpreadsheet className="w-8 h-8 text-[#020617] -rotate-3" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Bulk Import</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Mass-ingest products via Excel or CSV protocols.</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-all group"
          >
            <XCircle className="w-6 h-6 text-slate-400 group-hover:text-slate-900" />
          </button>
        </div>

        {/* Authentication Error */}
        {authError && (
          <div className="bg-red-50 text-red-600 p-5 rounded-2xl mb-8 text-[10px] font-black uppercase tracking-widest border border-red-100 flex items-center gap-3 animate-in slide-in-from-top-4 relative z-10">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
            {authError}
          </div>
        )}

        {!uploadSession && (
          <div className="relative z-10 space-y-8">
            {/* Template Download Section */}
            <div className="bg-slate-900 rounded-[32px] p-8 border border-slate-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-all"></div>
              <div className="flex items-start gap-6 relative z-10">
                <div className="bg-[#B7F000] p-3 rounded-xl">
                  <Info className="w-6 h-6 text-[#020617]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Ingress Protocol</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8 leading-relaxed">
                    Initialize your data structure by downloading the standardized template. Ensure all headers match the system logic.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={downloadTemplate}
                      className="px-6 py-3 bg-[#B7F000] hover:bg-[#A3D900] text-[#020617] rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_8px_20px_rgba(183,240,0,0.3)] flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Get Template
                    </button>
                    <button
                      onClick={downloadGuide}
                      className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                      <Info className="w-4 h-4 text-[#B7F000]" />
                      Field Guide
                    </button>
                    <button
                      onClick={() => setShowGuide(!showGuide)}
                      className="px-6 py-3 text-[10px] font-black text-[#B7F000] uppercase tracking-widest hover:underline"
                    >
                      {showGuide ? 'Hide' : 'Show'} Specifications
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Format Guide */}
            {showGuide && (
              <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-200 animate-in fade-in slide-in-from-top-4">
                <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-8 flex items-center gap-3">
                  <span className="w-1.5 h-4 bg-[#B7F000] rounded-full"></span>
                  Data Structure Specification
                </h4>
                <div className="grid md:grid-cols-2 gap-12">
                  <div>
                    <h5 className="font-black text-[9px] text-slate-400 uppercase tracking-widest mb-4">Mandatory Parameters</h5>
                    <ul className="space-y-3">
                      {[
                        { label: 'NAME', desc: 'Asset Nomenclature' },
                        { label: 'CATEGORY', desc: 'Class Designation' },
                        { label: 'SUPPLIER', desc: 'Logistics Entity' },
                        { label: 'QUANTITY', desc: 'Density Units (Numeric)' },
                        { label: 'COST_PRICE', desc: 'Ingress Valuation' },
                        { label: 'SELLING_PRICE', desc: 'Market Valuation' },
                        { label: 'EXPIRY_DATE', desc: 'Obsolescence (YYYY-MM-DD)' }
                      ].map(item => (
                        <li key={item.label} className="flex items-center gap-3">
                          <span className="text-[9px] font-black bg-slate-900 text-[#B7F000] px-2 py-0.5 rounded uppercase tracking-widest w-24 text-center">
                            {item.label}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-black text-[9px] text-slate-400 uppercase tracking-widest mb-4">Optional Attributes</h5>
                    <ul className="space-y-3">
                      {[
                        { label: 'BRAND', desc: 'Origin Label' },
                        { label: 'WEIGHT', desc: 'Mass Coefficient' },
                        { label: 'ORIGIN', desc: 'Sovereign Source' },
                        { label: 'DESCRIPTION', desc: 'Internal Meta-data' },
                        { label: 'BARCODE', desc: 'Optical Index' },
                        { label: 'LOCATION', desc: 'Depot Coordinates' }
                      ].map(item => (
                        <li key={item.label} className="flex items-center gap-3">
                          <span className="text-[9px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded border border-slate-200 uppercase tracking-widest w-24 text-center">
                            {item.label}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-[#B7F000]/5 border-l-4 border-[#B7F000] rounded-r-xl">
                  <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">
                    SYSTEM LOGIC: Categories and suppliers will be auto-generated upon detection if not present in core database.
                  </p>
                </div>
              </div>
            )}




            {/* Import Options */}
            <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-200">
              <div className="flex items-start gap-6">
                <div className="bg-[#B7F000] p-3 rounded-xl shadow-sm">
                  <Plus className="w-6 h-6 text-[#020617]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Automated Provisioning</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6 leading-relaxed">
                    Configure how the system handles new entity detection during the ingress process.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <label className="flex items-center group cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={importOptions.createMissingCategories}
                          onChange={(e) => setImportOptions(prev => ({ ...prev, createMissingCategories: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#B7F000]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#020617] after:content-[''] after:absolute after:top-[3.5px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B7F000] peer-checked:after:bg-[#020617]"></div>
                      </div>
                      <span className="ml-4 text-[10px] font-black text-slate-900 uppercase tracking-widest group-hover:text-[#7AA100] transition-colors">Auto-Provision Categories</span>
                    </label>
                    <label className="flex items-center group cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={importOptions.createMissingSuppliers}
                          onChange={(e) => setImportOptions(prev => ({ ...prev, createMissingSuppliers: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#B7F000]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#020617] after:content-[''] after:absolute after:top-[3.5px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B7F000] peer-checked:after:bg-[#020617]"></div>
                      </div>
                      <span className="ml-4 text-[10px] font-black text-slate-900 uppercase tracking-widest group-hover:text-[#7AA100] transition-colors">Auto-Provision Suppliers</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="py-12 flex flex-col items-center">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-xl bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] p-16 text-center cursor-pointer hover:border-[#B7F000] hover:bg-white hover:shadow-2xl hover:shadow-[#B7F000]/5 transition-all group"
              >
                <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:shadow-[0_8px_30px_rgba(183,240,0,0.3)] group-hover:bg-[#B7F000] transition-all">
                  <Upload className="w-10 h-10 text-[#B7F000] group-hover:text-[#020617]" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2 uppercase">Select Ingress Source</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-8">Drop your spreadsheet here or click to browse files.</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Supported: XLSX, XLS, CSV
                </div>
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".xlsx,.xls,.csv"
                className="hidden"
              />
            </div>
          </div>
        )}

        {uploadSession && uploadSession.status === 'uploading' && (
          <div className="text-center py-24 relative z-10">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-[#B7F000]/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                <Upload className="w-10 h-10 text-slate-900 animate-bounce" />
                <div className="absolute inset-0 border-4 border-[#B7F000] border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4 uppercase">Ingesting Data...</h3>
              <div className="w-full bg-slate-100 rounded-full h-3 mb-6 overflow-hidden">
                <div 
                  className="bg-[#B7F000] h-full rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(183,240,0,0.5)]"
                  style={{ width: `${uploadSession.progress}%` }}
                ></div>
              </div>
              <p className="text-slate-900 font-black text-[10px] uppercase tracking-widest">{uploadSession.progress}% Protocol Complete</p>
            </div>
          </div>
        )}

        {uploadSession && uploadSession.status === 'processing' && (
          <div className="text-center py-24 relative z-10">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                <AlertCircle className="w-10 h-10 text-[#B7F000] animate-pulse" />
                <div className="absolute inset-0 border-4 border-[#B7F000]/30 border-t-[#B7F000] rounded-full animate-spin"></div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2 uppercase">Analyzing Payload</h3>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Decoding spreadsheet logic and validating asset parameters.</p>
            </div>
          </div>
        )}

        {uploadSession && uploadSession.status === 'error' && (
          <div className="text-center py-24 relative z-10">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-100">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-red-900 tracking-tight mb-4 uppercase">Ingress Failed</h3>
              <p className="text-red-600 font-bold uppercase tracking-widest text-[10px] mb-12 leading-relaxed">{uploadSession.error}</p>
              <button
                onClick={() => setUploadSession(null)}
                className="px-10 py-4 bg-slate-900 text-[#B7F000] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-2xl transition-all"
              >
                Retry Protocol
              </button>
            </div>
          </div>
        )}

        {uploadSession && uploadSession.status === 'completed' && extractedProducts.length > 0 && (
          <div className="relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-8">
            <div className="bg-[#B7F000] rounded-[32px] p-8 border border-slate-900/5 flex items-center justify-between shadow-[0_8px_30px_rgba(183,240,0,0.2)]">
              <div className="flex items-center gap-6">
                <div className="bg-slate-900 p-3 rounded-2xl">
                  <CheckCircle className="w-8 h-8 text-[#B7F000]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Ingress Success</h3>
                  <p className="text-slate-900/60 text-[10px] font-bold uppercase tracking-widest">
                    {importResult ? 
                      `${importResult.successful} Assets Committed • ${importResult.failed} Failures` :
                      `${extractedProducts.length} Assets Staged for Review`
                    }
                  </p>
                </div>
              </div>
              {importResult && (
                <div className="flex gap-4">
                  <div className="bg-white/50 backdrop-blur-sm px-6 py-3 rounded-2xl text-center min-w-[100px]">
                    <div className="text-xl font-black text-slate-900">{importResult.total}</div>
                    <div className="text-[9px] font-black text-slate-900/50 uppercase tracking-widest">Total</div>
                  </div>
                  <div className="bg-slate-900 px-6 py-3 rounded-2xl text-center min-w-[100px]">
                    <div className="text-xl font-black text-[#B7F000]">{importResult.successful}</div>
                    <div className="text-[9px] font-black text-[#B7F000]/50 uppercase tracking-widest">Ready</div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden">
              <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Staged Assets</h4>
                <span className="px-3 py-1 bg-slate-900 text-[#B7F000] text-[9px] font-black rounded-full uppercase tracking-widest">
                  {extractedProducts.length} Items
                </span>
              </div>
              <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                {extractedProducts.map((product, index) => (
                  <div key={index} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mr-8">
                        <div>
                          <h4 className="font-black text-slate-900 tracking-tight mb-1 uppercase">{product.name}</h4>
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black bg-white border border-slate-200 px-2 py-0.5 rounded uppercase tracking-widest text-slate-400">{product.category}</span>
                            <span className="text-[10px] font-bold text-slate-300">•</span>
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{product.quantity} Units</span>
                            <span className="text-[10px] font-bold text-slate-300">•</span>
                            <span className="text-[10px] font-black text-[#7AA100] uppercase tracking-widest">${product.price}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Expires: {product.expiryDate}</p>
                          <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest opacity-60">Source: {product.supplier}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeProduct(index)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-8 pt-8 border-t border-slate-100">
              <button
                onClick={onCancel}
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all"
              >
                Abort Protocol
              </button>
              <button
                onClick={handleConfirmImport}
                className="px-10 py-5 bg-[#B7F000] hover:bg-[#A3D900] text-[#020617] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-[0_12px_40px_rgba(183,240,0,0.3)] hover:shadow-[0_15px_50px_rgba(183,240,0,0.4)] hover:-translate-y-1 transition-all flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5" />
                Commit {extractedProducts.length} Assets
              </button>
            </div>
          </div>
        )}

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-[32px] p-8 mt-12 animate-in slide-in-from-top-4 relative z-10">
            <h4 className="font-black text-red-900 uppercase tracking-widest text-[10px] mb-4 flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              Ingress Errors Detected
            </h4>
            <ul className="text-[10px] text-red-600 space-y-2 font-black uppercase tracking-widest">
              {errors.map((error, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="opacity-50">•</span>
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelUpload;