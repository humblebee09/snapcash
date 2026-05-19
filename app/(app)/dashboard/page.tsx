"use client";

import { useState, useEffect } from "react";
import { DollarSign, ShoppingCart, Package, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRupiah } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, []);

  const formatDate = (d: string) => new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(d));

  if (loading) return <div className="flex justify-center items-center min-h-screen"><p className="text-muted-foreground">Memuat dashboard...</p></div>;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-4 md:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Total Pendapatan</CardDescription><DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><CardTitle className="text-2xl">{formatRupiah(data.totalPendapatan)}</CardTitle></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Transaksi</CardDescription><ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><CardTitle className="text-2xl">+{data.totalTransaksi}</CardTitle></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Produk</CardDescription><Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><CardTitle className="text-2xl">{data.totalProduk}</CardTitle></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Pelanggan</CardDescription><Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><CardTitle className="text-2xl">{data.totalPelanggan}</CardTitle></CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader><CardTitle>Penjualan Mingguan</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.grafik}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis tickFormatter={(v) => `Rp${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatRupiah(v)} />
                  <Bar dataKey="total" fill="#16a34a" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader><CardTitle>Transaksi Terbaru</CardTitle><CardDescription>{data.recentOrders.length} transaksi terakhir</CardDescription></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentOrders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Belum ada transaksi</p>
                ) : (
                  data.recentOrders.map((o: any) => (
                    <div key={o.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                          {o.customer.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{o.customer}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</p>
                        </div>
                      </div>
                      <span className="font-medium text-sm">{formatRupiah(o.total)}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
