"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

interface ReceiptProps {
  orderId: string;
  orderType: string;
  tableNumber?: number;
  customerName?: string;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  cashAmount?: number;
  change?: number;
  createdAt: string;
  onClose?: () => void;
}

export function Receipt({ orderId, orderType, tableNumber, customerName, items, subtotal, discount, tax, total, paymentMethod, cashAmount, change, createdAt, onClose }: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = receiptRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank", "width=400,height=700");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Struk - SnapCash</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; font-size: 12px; padding: 10px; width: 300px; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 6px 0; }
            .row { display: flex; justify-content: space-between; margin: 2px 0; }
            .title { font-size: 16px; font-weight: bold; }
            .item-name { flex: 1; }
            .item-price { text-align: right; white-space: nowrap; }
          </style>
        </head>
        <body onload="window.print();window.close()">
          ${content}
        </body>
      </html>
    `);
    win.document.close();
  };

  const formatDate = (d: string) => new Intl.DateTimeFormat("id-ID", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  }).format(new Date(d));

  return (
    <div className="space-y-4">
      {/* Preview struk */}
      <div ref={receiptRef} className="font-mono text-xs bg-white text-black p-4 rounded border max-w-xs mx-auto">
        <div className="center">
          <div className="title">SnapCash</div>
          <div>Point of Sale System</div>
          <div className="line" />
        </div>

        <div className="row"><span>No. Order</span><span>{orderId.slice(-8).toUpperCase()}</span></div>
        <div className="row"><span>Tanggal</span><span>{formatDate(createdAt)}</span></div>
        <div className="row"><span>Tipe</span><span>{orderType === "dinein" ? "Dine In" : "Take Away"}</span></div>
        {tableNumber && <div className="row"><span>Meja</span><span>{tableNumber}</span></div>}
        {customerName && <div className="row"><span>Pelanggan</span><span>{customerName}</span></div>}
        <div className="line" />

        <div className="bold" style={{marginBottom: "4px"}}>PESANAN</div>
        {items.map((item, i) => (
          <div key={i}>
            <div>{item.name}</div>
            <div className="row">
              <span style={{paddingLeft: "8px"}}>{item.quantity}x {formatRupiah(item.price)}</span>
              <span>{formatRupiah(item.quantity * item.price)}</span>
            </div>
          </div>
        ))}
        <div className="line" />

        <div className="row"><span>Subtotal</span><span>{formatRupiah(subtotal)}</span></div>
        {discount > 0 && <div className="row"><span>Diskon</span><span>-{formatRupiah(discount)}</span></div>}
        <div className="row"><span>Pajak (10%)</span><span>{formatRupiah(tax)}</span></div>
        <div className="line" />
        <div className="row bold"><span>TOTAL</span><span>{formatRupiah(total)}</span></div>
        <div className="line" />

        <div className="row"><span>Pembayaran</span><span>{paymentMethod}</span></div>
        {paymentMethod === "Tunai" && cashAmount && (
          <>
            <div className="row"><span>Tunai</span><span>{formatRupiah(cashAmount)}</span></div>
            <div className="row"><span>Kembalian</span><span>{formatRupiah(change || 0)}</span></div>
          </>
        )}
        <div className="line" />

        <div className="center" style={{marginTop: "8px"}}>
          <div>Terima kasih!</div>
          <div>Selamat datang kembali</div>
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />Cetak Struk
        </Button>
        {onClose && <Button variant="outline" onClick={onClose}>Tutup</Button>}
      </div>
    </div>
  );
}
