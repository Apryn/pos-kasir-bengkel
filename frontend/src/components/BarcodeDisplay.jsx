import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { Printer } from 'lucide-react';

export default function BarcodeDisplay({ product }) {
  const svgRef = useRef();

  useEffect(() => {
    if (product?.barcode && svgRef.current) {
      JsBarcode(svgRef.current, product.barcode, {
        format: 'CODE128',
        width: 2,
        height: 60,
        displayValue: true,
        fontSize: 12,
        margin: 8,
      });
    }
  }, [product?.barcode]);

  const handlePrint = () => {
    const svg = svgRef.current?.outerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Barcode - ${product.name}</title>
      <style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:sans-serif;padding:20px}
      h3{margin:0 0 8px;font-size:14px}.barcode-wrap{border:1px solid #ddd;padding:12px;border-radius:8px;text-align:center}
      @media print{button{display:none}}</style></head>
      <body>
        <div class="barcode-wrap">
          <h3>${product.name}</h3>
          <p style="margin:0 0 8px;font-size:12px;color:#666">Rp ${product.price.toLocaleString()}</p>
          ${svg}
        </div>
        <script>window.onload=()=>window.print()</script>
      </body></html>
    `);
    win.document.close();
  };

  if (!product?.barcode) return null;

  return (
    <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-lg border">
      <svg ref={svgRef} />
      <button onClick={handlePrint}
        className="flex items-center gap-1.5 text-sm bg-gray-700 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800">
        <Printer size={14} /> Cetak Barcode
      </button>
    </div>
  );
}
