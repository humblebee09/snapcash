"use client";

import { useState } from "react";
import {
  AlertCircle,
  ArrowDownUp,
  Edit,
  MoreHorizontal,
  Package,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { cn } from "@/lib/utils";

// Tipe data untuk produk dengan stok
interface ProductStock {
  id: string;
  name: string;
  category: string;
  sku: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  lastUpdated: Date;
}

// Tipe data untuk riwayat stok
interface StockHistory {
  id: string;
  productId: string;
  date: Date;
  type: "in" | "out" | "adjustment";
  quantity: number;
  notes: string;
  operator: string;
}

export default function StockPage() {
  // Data produk dengan stok dummy
  const initialProducts: ProductStock[] = [
    {
      id: "1",
      name: "Kopi Hitam",
      category: "Minuman",
      sku: "MNM-001",
      currentStock: 85,
      minStock: 20,
      maxStock: 100,
      unit: "cup",
      lastUpdated: new Date(2024, 4, 15),
    },
    {
      id: "2",
      name: "Cappuccino",
      category: "Minuman",
      sku: "MNM-002",
      currentStock: 65,
      minStock: 15,
      maxStock: 80,
      unit: "cup",
      lastUpdated: new Date(2024, 4, 14),
    },
    {
      id: "3",
      name: "Latte",
      category: "Minuman",
      sku: "MNM-003",
      currentStock: 12,
      minStock: 15,
      maxStock: 80,
      unit: "cup",
      lastUpdated: new Date(2024, 4, 13),
    },
    {
      id: "4",
      name: "Espresso",
      category: "Minuman",
      sku: "MNM-004",
      currentStock: 45,
      minStock: 10,
      maxStock: 60,
      unit: "cup",
      lastUpdated: new Date(2024, 4, 12),
    },
    {
      id: "5",
      name: "Croissant",
      category: "Makanan",
      sku: "MKN-001",
      currentStock: 25,
      minStock: 10,
      maxStock: 50,
      unit: "pcs",
      lastUpdated: new Date(2024, 4, 15),
    },
    {
      id: "6",
      name: "Sandwich",
      category: "Makanan",
      sku: "MKN-002",
      currentStock: 18,
      minStock: 10,
      maxStock: 40,
      unit: "pcs",
      lastUpdated: new Date(2024, 4, 14),
    },
    {
      id: "7",
      name: "Donat",
      category: "Makanan",
      sku: "MKN-003",
      currentStock: 5,
      minStock: 10,
      maxStock: 50,
      unit: "pcs",
      lastUpdated: new Date(2024, 4, 13),
    },
  ];

  // Data riwayat stok dummy
  const initialStockHistory: StockHistory[] = [
    {
      id: "SH001",
      productId: "1",
      date: new Date(2024, 4, 15, 9, 30),
      type: "in",
      quantity: 20,
      notes: "Pengisian stok rutin",
      operator: "Admin",
    },
    {
      id: "SH002",
      productId: "2",
      date: new Date(2024, 4, 14, 14, 15),
      type: "in",
      quantity: 15,
      notes: "Pengisian stok rutin",
      operator: "Admin",
    },
    {
      id: "SH003",
      productId: "3",
      date: new Date(2024, 4, 13, 11, 45),
      type: "out",
      quantity: 8,
      notes: "Penjualan",
      operator: "Kasir",
    },
    {
      id: "SH004",
      productId: "5",
      date: new Date(2024, 4, 15, 8, 20),
      type: "in",
      quantity: 15,
      notes: "Pengisian stok rutin",
      operator: "Admin",
    },
    {
      id: "SH005",
      productId: "7",
      date: new Date(2024, 4, 13, 16, 30),
      type: "out",
      quantity: 10,
      notes: "Penjualan",
      operator: "Kasir",
    },
    {
      id: "SH006",
      productId: "4",
      date: new Date(2024, 4, 12, 10, 15),
      type: "adjustment",
      quantity: -5,
      notes: "Penyesuaian stok setelah inventaris",
      operator: "Manajer",
    },
  ];

  const [products, setProducts] = useState<ProductStock[]>(initialProducts);
  const [stockHistory, setStockHistory] =
    useState<StockHistory[]>(initialStockHistory);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<ProductStock | null>(
    null
  );
  const [adjustmentData, setAdjustmentData] = useState({
    type: "in" as "in" | "out" | "adjustment",
    quantity: 0,
    notes: "",
  });

  // Filter produk berdasarkan pencarian
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Produk dengan stok di bawah minimum
  const lowStockProducts = products.filter(
    (product) => product.currentStock < product.minStock
  );

  // Menyesuaikan stok produk
  const adjustStock = () => {
    if (currentProduct) {
      let newQuantity = currentProduct.currentStock;
      if (adjustmentData.type === "in") {
        newQuantity += adjustmentData.quantity;
      } else if (adjustmentData.type === "out") {
        newQuantity -= adjustmentData.quantity;
      } else {
        newQuantity = adjustmentData.quantity;
      }

      // Update stok produk
      setProducts(
        products.map((product) =>
          product.id === currentProduct.id
            ? { ...product, currentStock: newQuantity, lastUpdated: new Date() }
            : product
        )
      );

      // Tambahkan riwayat stok
      const newHistory: StockHistory = {
        id: `SH${(stockHistory.length + 1).toString().padStart(3, "0")}`,
        productId: currentProduct.id,
        date: new Date(),
        type: adjustmentData.type,
        quantity:
          adjustmentData.type === "adjustment"
            ? adjustmentData.quantity - currentProduct.currentStock
            : adjustmentData.quantity,
        notes: adjustmentData.notes,
        operator: "Admin", // Idealnya diambil dari user yang login
      };

      setStockHistory([newHistory, ...stockHistory]);

      // Reset form
      setAdjustmentData({
        type: "in",
        quantity: 0,
        notes: "",
      });
      setIsAdjustDialogOpen(false);
    }
  };

  // Mengedit informasi stok produk
  const editProductStock = () => {
    if (currentProduct) {
      setProducts(
        products.map((product) =>
          product.id === currentProduct.id ? currentProduct : product
        )
      );
      setIsEditDialogOpen(false);
    }
  };

  // Mengatur produk yang akan disesuaikan stoknya
  const handleAdjustClick = (product: ProductStock) => {
    setCurrentProduct(product);
    setIsAdjustDialogOpen(true);
  };

  // Mengatur produk yang akan dilihat riwayatnya
  const handleHistoryClick = (product: ProductStock) => {
    setCurrentProduct(product);
    setIsHistoryDialogOpen(true);
  };

  // Mengatur produk yang akan diedit
  const handleEditClick = (product: ProductStock) => {
    setCurrentProduct(product);
    setIsEditDialogOpen(true);
  };

  // Format tanggal
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Mendapatkan label dan warna untuk tipe perubahan stok
  const getStockTypeLabel = (type: string) => {
    switch (type) {
      case "in":
        return { label: "Masuk", color: "bg-green-100 text-green-800" };
      case "out":
        return { label: "Keluar", color: "bg-red-100 text-red-800" };
      case "adjustment":
        return { label: "Penyesuaian", color: "bg-blue-100 text-blue-800" };
      default:
        return { label: type, color: "" };
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Stok</h1>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari produk..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {lowStockProducts.length > 0 && (
          <div className="rounded-lg border-2 p-4 flex items-start gap-3" style={{background: "rgba(220,38,38,0.12)", borderColor: "rgba(220,38,38,0.4)"}}>
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" style={{color: "#b91c1c"}} />
            <div>
              <p className="font-bold text-base" style={{color: "#b91c1c"}}>Peringatan Stok Menipis!</p>
              <p className="text-sm mt-0.5" style={{color: "#991b1b"}}>
                {lowStockProducts.length} produk memiliki stok di bawah batas minimum. Segera lakukan pengisian stok.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {lowStockProducts.slice(0, 5).map(p => (
                  <span key={p.id} className="text-xs px-2 py-1 rounded-full font-medium" style={{background: "rgba(220,38,38,0.15)", color: "#b91c1c"}}>
                    {p.name}: {p.stock} tersisa
                  </span>
                ))}
                {lowStockProducts.length > 5 && (
                  <span className="text-xs px-2 py-1 rounded-full font-medium" style={{background: "rgba(220,38,38,0.15)", color: "#b91c1c"}}>
                    +{lowStockProducts.length - 5} lainnya
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Daftar Stok Produk</CardTitle>
            <CardDescription>
              Kelola stok semua produk yang tersedia di toko Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Stok Saat Ini</TableHead>
                  <TableHead>Min. Stok</TableHead>
                  <TableHead>Terakhir Diperbarui</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      {product.currentStock} {product.unit}
                    </TableCell>
                    <TableCell>
                      {product.minStock} {product.unit}
                    </TableCell>
                    <TableCell>{formatDate(product.lastUpdated)}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          product.currentStock < product.minStock
                            ? "bg-red-100 text-red-800"
                            : product.currentStock >= product.maxStock
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        )}
                      >
                        {product.currentStock < product.minStock
                          ? "Stok Menipis"
                          : product.currentStock >= product.maxStock
                          ? "Stok Penuh"
                          : "Normal"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleAdjustClick(product)}
                          >
                            <ArrowDownUp className="mr-2 h-4 w-4" />
                            Sesuaikan Stok
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleHistoryClick(product)}
                          >
                            <Package className="mr-2 h-4 w-4" />
                            Riwayat Stok
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditClick(product)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Informasi
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* Dialog Penyesuaian Stok */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sesuaikan Stok</DialogTitle>
            <DialogDescription>
              Sesuaikan stok untuk produk: {currentProduct?.name} (Stok saat
              ini: {currentProduct?.currentStock} {currentProduct?.unit})
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Tipe Penyesuaian</Label>
              <Select
                value={adjustmentData.type}
                onValueChange={(value: "in" | "out" | "adjustment") =>
                  setAdjustmentData({ ...adjustmentData, type: value })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Pilih tipe penyesuaian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Stok Masuk</SelectItem>
                  <SelectItem value="out">Stok Keluar</SelectItem>
                  <SelectItem value="adjustment">Penyesuaian Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">
                {adjustmentData.type === "adjustment"
                  ? "Jumlah Stok Baru"
                  : "Jumlah"}
              </Label>
              <Input
                id="quantity"
                type="number"
                value={adjustmentData.quantity || ""}
                onChange={(e) =>
                  setAdjustmentData({
                    ...adjustmentData,
                    quantity: Number.parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Catatan</Label>
              <Input
                id="notes"
                value={adjustmentData.notes}
                onChange={(e) =>
                  setAdjustmentData({
                    ...adjustmentData,
                    notes: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={adjustStock}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Riwayat Stok */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Riwayat Stok</DialogTitle>
            <DialogDescription>
              Riwayat perubahan stok untuk produk: {currentProduct?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Catatan</TableHead>
                  <TableHead>Operator</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentProduct &&
                  stockHistory
                    .filter(
                      (history) => history.productId === currentProduct.id
                    )
                    .map((history) => (
                      <TableRow key={history.id}>
                        <TableCell>{formatDate(history.date)}</TableCell>
                        <TableCell>
                          <Badge
                            className={getStockTypeLabel(history.type).color}
                          >
                            {getStockTypeLabel(history.type).label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {history.type === "in"
                            ? "+"
                            : history.type === "out"
                            ? "-"
                            : ""}
                          {Math.abs(history.quantity)} {currentProduct.unit}
                        </TableCell>
                        <TableCell>{history.notes}</TableCell>
                        <TableCell>{history.operator}</TableCell>
                      </TableRow>
                    ))}
                {currentProduct &&
                  stockHistory.filter(
                    (history) => history.productId === currentProduct.id
                  ).length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-4 text-muted-foreground"
                      >
                        Belum ada riwayat stok untuk produk ini
                      </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit Informasi Stok */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Informasi Stok</DialogTitle>
            <DialogDescription>
              Ubah informasi stok untuk produk: {currentProduct?.name}
            </DialogDescription>
          </DialogHeader>
          {currentProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-sku">SKU</Label>
                <Input
                  id="edit-sku"
                  value={currentProduct.sku}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      sku: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-minStock">Stok Minimum</Label>
                <Input
                  id="edit-minStock"
                  type="number"
                  value={currentProduct.minStock}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      minStock: Number.parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-maxStock">Stok Maksimum</Label>
                <Input
                  id="edit-maxStock"
                  type="number"
                  value={currentProduct.maxStock}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      maxStock: Number.parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-unit">Satuan</Label>
                <Input
                  id="edit-unit"
                  value={currentProduct.unit}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      unit: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={editProductStock}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
