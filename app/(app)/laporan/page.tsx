"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, ShoppingBag, Receipt as ReceiptIcon, Package, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Receipt } from "@/components/receipt";

export default function LaporanPage() {
  const [period, setPeriod] = useState("month");
  const [grafik, setGrafik] = useState("harian");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [printReceipt, setPrintReceipt] = useState<any>(null)
  const [isPrintOpen, setIsPrintOpen] = useState(false)

  useEffect(() => {
    setLoading(true);
    fetch(`/api/laporan?period=${period}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, [period]);

  const handlePrintReceipt = (order: any) => {
    setPrintReceipt({
      orderId: order.id,
      orderType: order.orderType,
      tableNumber: order.table?.number,
      customerName: order.customerName || order.customer?.name || undefined,
      items: order.orderItems?.map((i: any) => ({ name: i.product?.name || "Item", quantity: i.quantity, price: i.price })) || [],
      subtotal: order.subtotal,
      discount: order.discount || 0,
      tax: order.tax,
      total: order.total,
      paymentMethod: order.paymentMethod || "Tunai",
      cashAmount: order.cashAmount || 0,
      change: order.change || 0,
      createdAt: order.createdAt,
    })
    setIsPrintOpen(true)
  }

  const formatDate = (d: string) => new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  }).format(new Date(d));

  const getGrafikData = () => {
    if (!data) return []
    if (grafik === "harian") return data.grafikHarian
    if (grafik === "bulanan") return data.grafikBulanan
    return data.grafikTahunan
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Laporan</h1>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hari Ini</SelectItem>
              <SelectItem value="week">7 Hari Terakhir</SelectItem>
              <SelectItem value="month">Bulan Ini</SelectItem>
              <SelectItem value="year">Tahun Ini</SelectItem>
            </SelectContent>
          </Select>
          <a href={`/api/laporan/export?period=${period}`} download>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />Export CSV
            </Button>
          </a>
        </div>
      </header>

      <main className="flex-1 space-y-4 p-4 md:p-8">
        {loading ? (
          <div className="flex justify-center p-8"><p className="text-muted-foreground">Memuat data...</p></div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardDescription>Total Penjualan</CardDescription>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent><p className="text-2xl font-bold text-green-600">{formatRupiah(data.totalPenjualan)}</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardDescription>Total Transaksi</CardDescription>
                  <ReceiptIcon className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent><p className="text-2xl font-bold">{data.totalTransaksi}</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardDescription>Rata-rata Transaksi</CardDescription>
                  <ShoppingBag className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent><p className="text-2xl font-bold">{formatRupiah(data.rataRata)}</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardDescription>Produk Terjual</CardDescription>
                  <Package className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent><p className="text-2xl font-bold">{data.totalProdukTerjual}</p></CardContent>
              </Card>
            </div>

            <Tabs defaultValue="grafik">
              <TabsList>
                <TabsTrigger value="grafik">Grafik Penjualan</TabsTrigger>
                <TabsTrigger value="produk">Produk Terlaris</TabsTrigger>
                <TabsTrigger value="transaksi">Riwayat Transaksi</TabsTrigger>
              </TabsList>

              {/* Tab Grafik */}
              <TabsContent value="grafik">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Grafik Penjualan</CardTitle>
                        <CardDescription>Tren penjualan berdasarkan periode</CardDescription>
                      </div>
                      <Select value={grafik} onValueChange={setGrafik}>
                        <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="harian">Per Hari</SelectItem>
                          <SelectItem value="bulanan">Per Bulan</SelectItem>
                          <SelectItem value="tahunan">Per Tahun</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={getGrafikData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis tickFormatter={v => `Rp${(v/1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v: number) => [formatRupiah(v), "Penjualan"]} labelFormatter={l => `Periode: ${l}`} />
                        <Bar dataKey="total" fill="#16a34a" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    {/* Tabel ringkasan per periode */}
                    <div className="mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow><TableHead>Periode</TableHead><TableHead>Jumlah Transaksi</TableHead><TableHead className="text-right">Total Penjualan</TableHead></TableRow>
                        </TableHeader>
                        <TableBody>
                          {getGrafikData().filter((d: any) => d.total > 0).map((d: any, i: number) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{d.label}{d.day ? ` (${d.day})` : ""}</TableCell>
                              <TableCell>{d.count} transaksi</TableCell>
                              <TableCell className="text-right font-semibold text-green-600">{formatRupiah(d.total)}</TableCell>
                            </TableRow>
                          ))}
                          {getGrafikData().filter((d: any) => d.total > 0).length === 0 && (
                            <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-4">Belum ada data</TableCell></TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab Produk Terlaris */}
              <TabsContent value="produk">
                <Card>
                  <CardHeader><CardTitle>Produk Terlaris</CardTitle><CardDescription>Produk paling banyak terjual pada periode ini</CardDescription></CardHeader>
                  <CardContent>
                    {data.produkTerlaris.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">Belum ada data</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow><TableHead>Peringkat</TableHead><TableHead>Produk</TableHead><TableHead>Qty Terjual</TableHead><TableHead className="text-right">Total Pendapatan</TableHead></TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.produkTerlaris.map((p: any, i: number) => (
                            <TableRow key={i}>
                              <TableCell>
                                <Badge className={i === 0 ? "bg-yellow-100 text-yellow-800" : i === 1 ? "bg-gray-100 text-gray-800" : i === 2 ? "bg-orange-100 text-orange-800" : "bg-blue-50 text-blue-800"}>
                                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">{p.name}</TableCell>
                              <TableCell>{p.qty} item</TableCell>
                              <TableCell className="text-right font-semibold">{formatRupiah(p.total)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab Riwayat Transaksi */}
              <TabsContent value="transaksi">
                <Card>
                  <CardHeader><CardTitle>Riwayat Transaksi</CardTitle><CardDescription>50 transaksi terakhir pada periode ini</CardDescription></CardHeader>
                  <CardContent>
                    {data.orders.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">Belum ada transaksi</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Waktu</TableHead><TableHead>Tipe</TableHead><TableHead>Meja</TableHead>
                            <TableHead>Pelanggan</TableHead><TableHead>Pembayaran</TableHead>
                            <TableHead>Item</TableHead><TableHead className="text-right">Total</TableHead><TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.orders.map((o: any) => (
                            <TableRow key={o.id}>
                              <TableCell className="text-sm">{formatDate(o.createdAt)}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{o.orderType === "dinein" ? "🍽️ Dine In" : "🥡 Take Away"}</Badge>
                              </TableCell>
                              <TableCell>{o.table ? `Meja ${o.table.number}` : "-"}</TableCell>
                              <TableCell>{o.customerName || o.customer?.name || "-"}</TableCell>
                              <TableCell>{o.paymentMethod}</TableCell>
                              <TableCell>{o.orderItems?.length || 0} item</TableCell>
                              <TableCell className="text-right font-semibold text-green-600">{formatRupiah(o.total)}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => handlePrintReceipt(o)} title="Cetak Struk">
                                  <Printer className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
      {/* Dialog Cetak Struk */}
      <Dialog open={isPrintOpen} onOpenChange={setIsPrintOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Cetak Struk</DialogTitle></DialogHeader>
          {printReceipt && (
            <Receipt
              orderId={printReceipt.orderId}
              orderType={printReceipt.orderType}
              tableNumber={printReceipt.tableNumber}
              customerName={printReceipt.customerName}
              items={printReceipt.items}
              subtotal={printReceipt.subtotal}
              discount={printReceipt.discount}
              tax={printReceipt.tax}
              total={printReceipt.total}
              paymentMethod={printReceipt.paymentMethod}
              cashAmount={printReceipt.cashAmount}
              change={printReceipt.change}
              createdAt={printReceipt.createdAt}
              onClose={() => setIsPrintOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
