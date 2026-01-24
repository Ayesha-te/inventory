import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeGeneratorProps {
  value: string;
  format?: 'CODE128' | 'EAN13' | 'UPCA';
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  className?: string;
}

const BarcodeGenerator: React.FC<BarcodeGeneratorProps> = ({
  value,
  format = 'CODE128',
  width = 2,
  height = 100,
  displayValue = true,
  fontSize = 20,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      try {
        JsBarcode(canvasRef.current, value, {
          format: format,
          width: width,
          height: height,
          displayValue: displayValue,
          fontSize: fontSize,
          background: '#ffffff',
          lineColor: '#000000',
          margin: 10,
        });
      } catch (error) {
        console.error('Error generating barcode:', error);
      }
    }
  }, [value, format, width, height, displayValue, fontSize]);

  if (!value) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 p-4 border-2 border-dashed border-gray-300 ${className}`}>
        <span className="text-[10px] font-black theme-text-muted uppercase tracking-widest">Null Identifier</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <canvas ref={canvasRef} className="border-2 border-primary-dark" />
    </div>
  );
};

export default BarcodeGenerator;