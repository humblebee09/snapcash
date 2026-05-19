"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Edit, MoreHorizontal, Plus, Search, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatRupiah } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/image-upload";

interface ProductOption {
  id: string;
  name: string;
  required: boolean;
  choices: { id: string; name: string; extraPrice: number }[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  taxEnabled: boolean;
  trackStock: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function ProductPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState("grid");
  const [activeCategory, setActiveCategory] = useState("all");

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({ name: "", price: 0, category: "", stock: 0, image: "", taxEnabled: true, trackStock: true });
  const [formattedPrice, setFormattedPrice] = useState("");
  const [formattedEditPrice, setFormattedEditPrice] = useState("");

  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);
  const [isEditCatDialogOpen, setIsEditCatDialogOpen] = useState(false);
  const [isDeleteCatDialogOpen, setIsDeleteCatDialogOpen] = useState(false);
  const [currentCat, setCurrentCat] = useState<Category | null>(null);
  const [newCat, setNewCat] = useState({ name: "", icon: "" });

  const [isOptionsDialogOpen, setIsOptionsDialogOpen] = useState(false);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [optionsProductId, setOptionsProductId] = useState("");
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionRequired, setNewOptionRequired] = useState(false);
  const [newOptionChoices, setNewOptionChoices] = useState("");

  useEffect(() => { fetchAll() }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [p, c] = await Promise.all([
      fetch("/api/products").then(r => r.json()).catch(() => []),
      fetch("/api/categories").then(r => r.json()).catch(() => []),
    ]);
    setProducts(Array.isArray(p) ? p : []);
    setCategories(Array.isArray(c) ? c : []);
    setLoading(false);
  };

  const fetchOptions = async (productId: string) => {
    if (!productId) return;
    try {
      const res = await fetch(`/api/products/${productId}/options`);
      const data = await res.json();
      setProductOptions(Array.isArray(data) ? data : []);
    } catch { setProductOptions([]); }
  };

  const filteredProducts = products.filter(p => {
    const matchCat = activeCategory === "all" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/[^\d]/g, "");
    setFormattedPrice(v ? formatRupiah(parseInt(v)) : "");
    setNewProduct({ ...newProduct, price: parseInt(v) || 0 });
  };

  const handleEditPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/[^\d]/g, "");
    setFormattedEditPrice(v ? formatRupiah(parseInt(v)) : "");
    setCurrentProduct({ ...currentProduct!, price: parseInt(v) || 0 });
  };

  const addProduct = async () => {
    await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newProduct) });
    setNewProduct({ name: "", price: 0, category: "", stock: 0, image: "", taxEnabled: true, trackStock: true });
    setFormattedPrice("");
    setIsAddDialogOpen(false);
    fetchAll();
    toast({ title: "Produk ditambahkan ✅" });
  };

  const editProduct = async () => {
    if (!currentProduct) return;
    await fetch(`/api/products/${currentProduct.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(currentProduct) });
    setIsEditDialogOpen(false);
    fetchAll();
    toast({ title: "Produk diperbarui ✅" });
  };

  const deleteProduct = async () => {
    if (!currentProduct) return;
    await fetch(`/api/products/${currentProduct.id}`, { method: "DELETE" });
    setIsDeleteDialogOpen(false);
    fetchAll();
  };

  const addCategory = async () => {
    const res = await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newCat) });
    const data = await res.json();
    if (!res.ok) { toast({ title: "Error", description: data.error, variant: "destructive" }); return; }
    setNewCat({ name: "", icon: "" });
    fetchAll();
    toast({ title: "Kategori ditambahkan ✅" });
  };

  const editCategory = async () => {
    if (!currentCat) return;
    await fetch(`/api/categories/${currentCat.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(currentCat) });
    setIsEditCatDialogOpen(false);
    fetchAll();
  };

  const deleteCategory = async () => {
    if (!currentCat) return;
    await fetch(`/api/categories/${currentCat.id}`, { method: "DELETE" });
    setIsDeleteCatDialogOpen(false);
    fetchAll();
  };

  const addOption = async (productId: string) => {
    if (!newOptionName || !newOptionChoices) return;
    const choices = newOptionChoices.split(",").map(c => {
      const parts = c.trim().split(":");
      return { name: parts[0].trim(), extraPrice: parts[1] ? parseInt(parts[1].trim().replace(/[^\d]/g, "")) || 0 : 0 };
    });
    const res = await fetch(`/api/products/${productId}/options`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newOptionName, required: newOptionRequired, choices }),
    });
    if (!res.ok) { toast({ title: "Error", description: "Gagal simpan opsi", variant: "destructive" }); return; }
    setNewOptionName(""); setNewOptionChoices(""); setNewOptionRequired(false);
    await fetchOptions(productId);
    toast({ title: "Opsi ditambahkan ✅" });
  };

  const deleteOption = async (optionId: string, productId: string) => {
    await fetch(`/api/products/${productId}/options/${optionId}`, { method: "DELETE" });
    await fetchOptions(productId);
    toast({ title: "Opsi dihapus" });
  };

  const allCategories = [{ id: "all", name: "Semua", icon: "" }, ...categories];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Manajemen Produk</h1>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Cari produk..." className="w-full pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <Tabs value={activeView} onValueChange={setActiveView}>
              <TabsList className="grid w-[200px] grid-cols-2">
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="table">Tabel</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex gap-2">
            <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><Tag className="mr-2 h-4 w-4" />Kelola Kategori</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Kelola Kategori</DialogTitle></DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map(cat => (
                      <div key={cat.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                        <span className="font-medium">{cat.name}</span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setCurrentCat(cat); setIsEditCatDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-red-500" onClick={() => { setCurrentCat(cat); setIsDeleteCatDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-3">Tambah Kategori Baru</p>
                    <div className="flex gap-2">
                      <Input placeholder="Nama kategori" className="flex-1" value={newCat.name} onChange={e => setNewCat({ ...newCat, name: e.target.value })} />
                      <Button onClick={addCategory} disabled={!newCat.name}><Plus className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
                <DialogFooter><Button variant="outline" onClick={() => setIsCatDialogOpen(false)}>Selesai</Button></DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" />Tambah Produk</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Tambah Produk Baru</DialogTitle></DialogHeader>
                <ScrollArea className="max-h-[70vh]">
                  <div className="grid gap-4 py-4 px-1">
                    <div className="grid gap-2"><Label>Nama Produk</Label><Input value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} /></div>
                    <div className="grid gap-2"><Label>Harga</Label><Input value={formattedPrice} onChange={handlePriceChange} placeholder="Rp 0" /></div>
                    <div className="grid gap-2">
                      <Label>Kategori</Label>
                      <Select value={newProduct.category} onValueChange={v => setNewProduct({ ...newProduct, category: v })}>
                        <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                        <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2"><Label>Stok</Label><Input type="number" value={newProduct.stock || ""} onChange={e => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })} /></div>
                    <div className="grid gap-2"><Label>Gambar Produk</Label><ImageUpload value={newProduct.image} onChange={url => setNewProduct({ ...newProduct, image: url })} /></div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div><p className="text-sm font-medium">Kenakan Pajak (10%)</p><p className="text-xs text-muted-foreground">Pajak dihitung saat transaksi</p></div>
                      <input type="checkbox" checked={newProduct.taxEnabled} onChange={e => setNewProduct({ ...newProduct, taxEnabled: e.target.checked })} className="w-4 h-4 cursor-pointer" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div><p className="text-sm font-medium">Lacak Stok</p><p className="text-xs text-muted-foreground">Stok berkurang otomatis saat terjual</p></div>
                      <input type="checkbox" checked={newProduct.trackStock} onChange={e => setNewProduct({ ...newProduct, trackStock: e.target.checked })} className="w-4 h-4 cursor-pointer" />
                    </div>
                  </div>
                </ScrollArea>
                <DialogFooter><Button onClick={addProduct}>Simpan</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-8"><p className="text-muted-foreground">Memuat data...</p></div>
        ) : (
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="space-y-4">
            <TabsList className="flex flex-wrap h-auto gap-1" style={{background: "#e8f5e9"}}>
              {allCategories.map(cat => (
                <TabsTrigger key={cat.id} value={cat.id === "all" ? "all" : cat.name} className="mb-1">{cat.name}</TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={activeCategory} className="space-y-4">
              {activeView === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map(product => (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="aspect-square relative">
                        <img src={product.image || "/placeholder.svg"} alt={product.name} className="object-cover w-full h-full" />
                      </div>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <CardDescription>{formatRupiah(product.price)} • Stok: {product.trackStock ? product.stock : "∞"}</CardDescription>
                        <div className="flex gap-1 flex-wrap mt-1">
                          <Badge variant="outline" className="text-xs">{product.category}</Badge>
                          {!product.taxEnabled && <Badge className="bg-blue-100 text-blue-800 text-xs">No Tax</Badge>}
                          {!product.trackStock && <Badge className="bg-gray-100 text-gray-800 text-xs">No Track</Badge>}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-2">
                        <div className="flex justify-between">
                          <Button variant="outline" size="sm" onClick={() => { setCurrentProduct(product); setFormattedEditPrice(formatRupiah(product.price)); setIsEditDialogOpen(true); }}>
                            <Edit className="mr-2 h-4 w-4" />Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => { setCurrentProduct(product); setIsDeleteDialogOpen(true); }}>
                            <Trash2 className="mr-2 h-4 w-4" />Hapus
                          </Button>
                        </div>
                        <Button size="sm" className="w-full text-white font-semibold" style={{background: "#2e7965"}} onClick={() => { setOptionsProductId(product.id); setProductOptions([]); fetchOptions(product.id); setIsOptionsDialogOpen(true); }}>
                          Kelola Opsi
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardHeader><CardTitle>Daftar Produk</CardTitle></CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Gambar</TableHead><TableHead>Nama</TableHead><TableHead>Kategori</TableHead>
                          <TableHead>Harga</TableHead><TableHead>Stok</TableHead><TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map(product => (
                          <TableRow key={product.id}>
                            <TableCell><div className="w-12 h-12 rounded-md overflow-hidden"><img src={product.image || "/placeholder.svg"} alt={product.name} className="object-cover w-full h-full" /></div></TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                            <TableCell>{formatRupiah(product.price)}</TableCell>
                            <TableCell>{product.trackStock ? product.stock : "∞"}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Aksi</DropdownMenuLabel><DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => { setCurrentProduct(product); setFormattedEditPrice(formatRupiah(product.price)); setIsEditDialogOpen(true); }}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { setOptionsProductId(product.id); setProductOptions([]); fetchOptions(product.id); setIsOptionsDialogOpen(true); }}>Kelola Opsi</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { setCurrentProduct(product); setIsDeleteDialogOpen(true); }}><Trash2 className="mr-2 h-4 w-4" />Hapus</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Edit Produk */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Produk</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="grid gap-4 py-4 px-1">
              {currentProduct && (
                <>
                  <div className="grid gap-2"><Label>Nama Produk</Label><Input value={currentProduct.name} onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })} /></div>
                  <div className="grid gap-2"><Label>Harga</Label><Input value={formattedEditPrice} onChange={handleEditPriceChange} placeholder="Rp 0" /></div>
                  <div className="grid gap-2">
                    <Label>Kategori</Label>
                    <Select value={currentProduct.category} onValueChange={v => setCurrentProduct({ ...currentProduct, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2"><Label>Stok</Label><Input type="number" value={currentProduct.stock} onChange={e => setCurrentProduct({ ...currentProduct, stock: parseInt(e.target.value) || 0 })} /></div>
                  <div className="grid gap-2"><Label>Gambar Produk</Label><ImageUpload value={currentProduct.image} onChange={url => setCurrentProduct({ ...currentProduct, image: url })} /></div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div><p className="text-sm font-medium">Kenakan Pajak (10%)</p><p className="text-xs text-muted-foreground">Pajak dihitung saat transaksi</p></div>
                    <input type="checkbox" checked={currentProduct.taxEnabled} onChange={e => setCurrentProduct({ ...currentProduct, taxEnabled: e.target.checked })} className="w-4 h-4 cursor-pointer" />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div><p className="text-sm font-medium">Lacak Stok</p><p className="text-xs text-muted-foreground">Stok berkurang otomatis saat terjual</p></div>
                    <input type="checkbox" checked={currentProduct.trackStock} onChange={e => setCurrentProduct({ ...currentProduct, trackStock: e.target.checked })} className="w-4 h-4 cursor-pointer" />
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
          <DialogFooter><Button onClick={editProduct}>Simpan Perubahan</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hapus Produk */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Hapus Produk</DialogTitle><DialogDescription>Yakin ingin menghapus "{currentProduct?.name}"?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={deleteProduct}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Kategori */}
      <Dialog open={isEditCatDialogOpen} onOpenChange={setIsEditCatDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Kategori</DialogTitle></DialogHeader>
          {currentCat && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label>Nama Kategori</Label><Input value={currentCat.name} onChange={e => setCurrentCat({ ...currentCat, name: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter><Button onClick={editCategory}>Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hapus Kategori */}
      <Dialog open={isDeleteCatDialogOpen} onOpenChange={setIsDeleteCatDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Hapus Kategori</DialogTitle><DialogDescription>Yakin ingin menghapus "{currentCat?.name}"?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteCatDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={deleteCategory}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Kelola Opsi Produk */}
      <Dialog open={isOptionsDialogOpen} onOpenChange={setIsOptionsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kelola Opsi Produk</DialogTitle>
            <DialogDescription>Tambah pilihan seperti: Suhu (Ice/Hot), Gula (Normal/Less), dll</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {productOptions.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Opsi Tersimpan ({productOptions.length})</p>
                {productOptions.map(opt => (
                  <div key={opt.id} className="border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-muted/40">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{opt.name}</span>
                        {opt.required && <Badge className="bg-red-100 text-red-700 text-xs px-1.5">Wajib</Badge>}
                        <span className="text-xs text-muted-foreground">{opt.choices.length} pilihan</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-red-500 text-xs gap-1" onClick={() => deleteOption(opt.id, optionsProductId)}>
                        <Trash2 className="h-3 w-3" />Hapus
                      </Button>
                    </div>
                    <div className="px-3 py-2 flex flex-wrap gap-1.5">
                      {opt.choices.map(choice => (
                        <div key={choice.id} className="flex items-center gap-1 bg-background border rounded-full px-2.5 py-1 text-xs">
                          <span>{choice.name}</span>
                          {choice.extraPrice > 0 && <span className="text-green-600 font-medium">+{formatRupiah(choice.extraPrice)}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground text-sm border rounded-lg">Belum ada opsi. Tambahkan di bawah.</div>
            )}
            <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
              <p className="text-sm font-semibold">+ Tambah Opsi Baru</p>
              <div className="grid gap-2">
                <Label className="text-xs">Nama Opsi</Label>
                <Input placeholder="contoh: Suhu, Gula, Ukuran" value={newOptionName} onChange={e => setNewOptionName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Pilihan <span className="text-muted-foreground">(Nama:HargaTambahan, pisah koma)</span></Label>
                <Input placeholder="Ice:0, Hot:0, Warm:0" value={newOptionChoices} onChange={e => setNewOptionChoices(e.target.value)} />
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>Tanpa harga: <code className="bg-muted px-1 rounded">Ice:0, Hot:0</code></p>
                  <p>Dengan harga: <code className="bg-muted px-1 rounded">Regular:0, Large:5000, XL:10000</code></p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="required-opt" checked={newOptionRequired} onChange={e => setNewOptionRequired(e.target.checked)} className="rounded w-4 h-4 cursor-pointer" />
                <Label htmlFor="required-opt" className="cursor-pointer text-sm">Wajib dipilih pelanggan</Label>
              </div>
              <Button onClick={() => addOption(optionsProductId)} disabled={!newOptionName || !newOptionChoices} className="w-full">
                <Plus className="mr-2 h-4 w-4" />Simpan Opsi
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOptionsDialogOpen(false)}>Selesai</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
