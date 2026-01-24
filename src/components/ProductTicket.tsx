import React, { forwardRef } from 'react';
import BarcodeGenerator from './BarcodeGenerator';
import QRCodeGenerator from './QRCodeGenerator';
import type { Product } from '../types/Product';

// Safely coerce price-like values (string/number/null) to a number for display
const toMoney = (v: unknown): number => {
  const n = Number.parseFloat(String(v ?? '0'));
  return Number.isFinite(n) ? n : 0;
};

interface ProductTicketProps {
  product: Product;
  includeQR?: boolean;
  ticketSize?: 'small' | 'medium' | 'large';
  className?: string;
}

const ProductTicket = forwardRef<HTMLDivElement, ProductTicketProps>(({
  product,
  includeQR = true,
  ticketSize = 'medium',
  className = ''
}, ref) => {
  const sizeClasses = {
    small: 'w-64 min-h-56',
    medium: 'w-80 min-h-72',
    large: 'w-96 min-h-80'
  };

  const qrData = JSON.stringify({
    name: product.name,
    barcode: product.barcode,
    price: product.price,
    id: product.id
  });

  // Size-based dimensions - adjusted for better scaling
  const dimensions = {
    small: { qrSize: 30, barcodeHeight: 25, fontSize: 9, titleSize: 12, priceSize: 16, padding: 2 },
    medium: { qrSize: 40, barcodeHeight: 30, fontSize: 11, titleSize: 14, priceSize: 20, padding: 3 },
    large: { qrSize: 50, barcodeHeight: 35, fontSize: 13, titleSize: 16, priceSize: 24, padding: 4 }
  };

  return (
    <div 
      ref={ref}
      className={`bg-white border-4 border-primary-dark flex flex-col ${sizeClasses[ticketSize]} ${className}`}
      style={{ 
        pageBreakInside: 'avoid', 
        position: 'relative', 
        zIndex: 1,
        padding: `${dimensions[ticketSize].padding * 4}px`,
        boxShadow: '15px 15px 0px rgba(0,0,0,0.1)'
      }}
    >
      {/* Heavy Industrial Accent */}
      <div className="absolute top-0 left-0 w-full h-2 bg-primary-gold"></div>

      {/* Header */}
      <div className="text-center" style={{ marginBottom: `${dimensions[ticketSize].padding * 2}px`, marginTop: '8px' }}>
        <h3 
          className="font-black theme-text-primary uppercase tracking-tighter mb-1 leading-tight"
          style={{ 
            fontSize: `${dimensions[ticketSize].titleSize}px`,
            wordWrap: 'break-word',
            hyphens: 'auto'
          }}
        >
          {product.name}
        </h3>
        <div 
          className="font-black text-gold"
          style={{ 
            fontSize: `${dimensions[ticketSize].priceSize}px`,
            marginBottom: `${dimensions[ticketSize].padding * 2}px`,
            color: 'var(--primary-gold)'
          }}
        >
          ${toMoney(product.price).toFixed(2)}
        </div>
      </div>

      {/* Barcode */}
      <div 
        className="flex items-center justify-center bg-white p-2 border-y-2 border-gray-100"
        style={{ marginBottom: `${dimensions[ticketSize].padding * 3}px` }}
      >
        <BarcodeGenerator 
          value={product.barcode || ''}
          width={ticketSize === 'small' ? 1.2 : ticketSize === 'medium' ? 1.5 : 1.8}
          height={dimensions[ticketSize].barcodeHeight}
          fontSize={dimensions[ticketSize].fontSize}
          className="max-w-full"
        />
      </div>

      {/* Product Details */}
      <div 
        className="text-center flex-1" 
        style={{ 
          fontSize: `${dimensions[ticketSize].fontSize}px`,
          lineHeight: '1.3',
          marginBottom: `${dimensions[ticketSize].padding * 2}px`
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${dimensions[ticketSize].padding}px` }}>
          {product.brand && (
            <div className="text-[10px] font-bold theme-text-muted uppercase tracking-widest">
              Origin: <span className="theme-text-primary">{product.brand}</span>
            </div>
          )}
          
          {product.category && (
            <div className="text-[10px] font-bold theme-text-muted uppercase tracking-widest">
              Class: <span className="theme-text-primary">{product.category}</span>
            </div>
          )}
          
          {product.weight && (
            <div className="text-[10px] font-bold theme-text-muted uppercase tracking-widest">
              Mass: <span className="theme-text-primary">{product.weight}</span>
            </div>
          )}
        </div>
      </div>

      {/* QR Code (if enabled) - positioned within ticket bounds */}
      {includeQR && (
        <div 
          className="flex justify-center items-center border-t-2 border-primary-gold pt-4" 
          style={{ 
            marginTop: `${dimensions[ticketSize].padding * 2}px`,
            minHeight: `${dimensions[ticketSize].qrSize + dimensions[ticketSize].padding * 2}px`
          }}
        >
          <div className="bg-primary-dark p-1">
            <QRCodeGenerator 
              value={qrData}
              size={dimensions[ticketSize].qrSize}
            />
          </div>
        </div>
      )}
      
      {/* Footer Branding */}
      <div className="mt-4 text-[8px] font-black theme-text-muted uppercase tracking-[0.2em] text-center border-t border-gray-100 pt-2">
        Invanta Strategic Assets
      </div>
    </div>
  );
});

ProductTicket.displayName = 'ProductTicket';

export default ProductTicket;