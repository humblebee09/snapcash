"use client";

import { Receipt } from "@/components/receipt";

import { useState, useEffect } from "react";
import { Check, Clock, Edit, MoreHorizontal, Plus, Search, Trash2, Utensils, X, ShoppingCart, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { formatRupiah } from "@/lib/utils";

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: "available" | "occupied" | "reserved";
  area: "indoor" | "outdoor" | "vip";
  customer?: string;
  startTime?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  stock: number;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: Product;
}

interface OpenOrder {
  id: string;
  customerName?: string;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  orderItems: OrderItem[];
}

export default function TableManagementPage() {
  const { toast } = useToast();
  const [tables, setTables] = useState<Table[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeArea, setActiveArea] = useState("all");

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);

  const [currentTable, setCurrentTable] = useState<Table | null>(null);
  const [currentOrder, setCurrentOrder] = useState<OpenOrder | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [newTable, setNewTable] = useState({ number: 1, capacity: 4, status: "available", area: "indoor" });
  const [productSearch, setProductSearch] = useState("");
  const [productCat, setProductCat] = useState("Semua");
  const [paymentMethod, setPaymentMethod] = useState("Tunai");
  const [cashAmount, setCashAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false)

  // Cart untuk tambah item
  const [itemCart, setItemCart] = useState<{product: Product, quantity: number, note: string, extraPrice: number}[]>([])

  // Opsi produk
  const [isProductOptionsOpen, setIsProductOptionsOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productOptions, setProductOptions] = useState<any[]>([])
  const [selectedChoices, setSelectedChoices] = useState<Record<string, any>>({})
  const [optionNote, setOptionNote] = useState("")

  // Struk
  const [receiptData, setReceiptData] = useState<any>(null)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => { fetchAll() }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [t, p] = await Promise.all([
      fetch("/api/tables").then(r => r.json()),
      fetch("/api/products").then(r => r.json()),
    ]);
    setTables(t);
    setProducts(p);
    setLoading(false);
  };

  const fetchOrderForTable = async (tableId: string) => {
    const orders = await fetch("/api/orders/open").then(r => r.json());
    const order = orders.find((o: any) => o.tableId === tableId);
    setCurrentOrder(order || null);
    return order;
  };

  const filteredTables = tables.filter((t) => {
    const matchesArea = activeArea === "all" || t.area === activeArea;
    const matchesSearch = t.number.toString().includes(searchTerm) ||
      (t.customer && t.customer.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesArea && matchesSearch;
  });

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  // ===== TABLE CRUD =====
  const addTable = async () => {
    await fetch("/api/tables", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newTable) });
    setIsAddDialogOpen(false);
    fetchAll();
  };

  const editTable = async () => {
    if (!currentTable) return;
    await fetch(`/api/tables/${currentTable.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(currentTable) });
    setIsEditDialogOpen(false);
    fetchAll();
  };

  const deleteTable = async () => {
    if (!currentTable) return;
    await fetch(`/api/tables/${currentTable.id}`, { method: "DELETE" });
    setIsDeleteDialogOpen(false);
    fetchAll();
  };

  const updateTableStatus = async (status: "available" | "occupied" | "reserved") => {
    if (!currentTable) return;
    if (status !== "available" && !customerName.trim()) {
      toast({ title: "Required", description: "Nama pelanggan harus diisi" });
      return;
    }
    const data = status === "available"
      ? { status, customer: null, startTime: null }
      : { status, customer: customerName, startTime: new Date().toISOString() };
    await fetch(`/api/tables/${currentTable.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setIsStatusDialogOpen(false);
    setCustomerName("");
    fetchAll();
  };

  // ===== ORDER MANAGEMENT =====
  const handleKelolaMeja = async (table: Table) => {
    setCurrentTable(table);
    const order = await fetchOrderForTable(table.id);
    setIsOrderDialogOpen(true);
  };

  const addItemToOrder = async (product: Product) => {
    if (!currentOrder) return;
    await fetch(`/api/orders/${currentOrder.id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, quantity: 1, price: product.price }),
    });
    const updated = await fetch(`/api/orders/${currentOrder.id}`).then(r => r.json());
    setCurrentOrder(updated);
    fetchAll();
    toast({ title: "Item ditambahkan ✅", description: product.name });
  };

  const removeItemFromOrder = async (itemId: string) => {
    if (!currentOrder) return;
    await fetch(`/api/orders/${currentOrder.id}/items`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    const updated = await fetch(`/api/orders/${currentOrder.id}`).then(r => r.json());
    setCurrentOrder(updated);
    fetchAll();
  };

  const updateItemQty = async (item: OrderItem, delta: number) => {
    if (!currentOrder) return;
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      await removeItemFromOrder(item.id);
      return;
    }
    // Update via add (will merge)
    await fetch(`/api/orders/${currentOrder.id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: item.product.id, quantity: delta, price: item.price }),
    });
    const updated = await fetch(`/api/orders/${currentOrder.id}`).then(r => r.json());
    setCurrentOrder(updated);
    fetchAll();
  };

  const handlePayOrder = async () => {
    if (!currentOrder) return;
    setIsProcessing(true);
    try {
      const cash = parseFloat(cashAmount.replace(/[^\d]/g, "")) || 0;
      const res = await fetch(`/api/orders/${currentOrder.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod, cashAmount: cash, discount: 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const receiptInfo = {
        orderId: currentOrder.id,
        orderType: "dinein",
        tableNumber: currentTable?.number,
        customerName: currentOrder.customerName || currentTable?.customer || undefined,
        items: currentOrder.orderItems.map((i: any) => ({ name: i.product.name, quantity: i.quantity, price: i.price })),
        subtotal: currentOrder.subtotal,
        discount: 0,
        tax: currentOrder.tax,
        total: currentOrder.total,
        paymentMethod,
        cashAmount: paymentMethod === "Tunai" ? cash : 0,
        change: data.change || 0,
        createdAt: new Date().toISOString(),
      }
      setReceiptData(receiptInfo)
      setIsPayDialogOpen(false);
      setIsOrderDialogOpen(false);
      setCashAmount("");
      setPaymentMethod("Tunai");
      setCurrentOrder(null);
      fetchAll();
      setTimeout(() => setIsReceiptOpen(true), 400)
    } catch (e) {
      toast({ title: "Error", description: "Gagal melakukan pembayaran", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  // ===== CART & OPTIONS =====
  const handleProductClickInMeja = async (product: Product) => {
    const res = await fetch(`/api/products/${product.id}/options`)
    const options = await res.json()
    if (Array.isArray(options) && options.length > 0) {
      setSelectedProduct(product)
      setProductOptions(options)
      setSelectedChoices({})
      setOptionNote("")
      setIsProductOptionsOpen(true)
    } else {
      addToItemCart(product, 0, "")
    }
  }

  const confirmProductOption = () => {
    if (!selectedProduct) return
    const missing = productOptions.filter(o => o.required && !selectedChoices[o.id])
    if (missing.length > 0) return
    const extraPrice = Object.values(selectedChoices).reduce((sum: number, c: any) => sum + c.extraPrice, 0)
    const note = Object.values(selectedChoices).map((c: any) => c.name).join(", ") + (optionNote ? ` - ${optionNote}` : "")
    addToItemCart(selectedProduct, extraPrice, note)
    setIsProductOptionsOpen(false)
  }

  const addToItemCart = (product: Product, extraPrice: number, note: string) => {
    setItemCart(prev => {
      const key = `${product.id}-${note}`
      const ex = prev.find(i => i.product.id + "-" + i.note === key)
      if (ex) return prev.map(i => i.product.id + "-" + i.note === key ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product, quantity: 1, note, extraPrice }]
    })
  }

  const removeFromItemCart = (key: string) => {
    setItemCart(prev => prev.filter(i => `${i.product.id}-${i.note}` !== key))
  }

  const confirmAddItems = async () => {
    if (!currentOrder || itemCart.length === 0) return
    setIsProcessing(true)
    try {
      for (const item of itemCart) {
        await fetch(`/api/orders/${currentOrder.id}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price + item.extraPrice,
          }),
        })
      }
      const updated = await fetch(`/api/orders/${currentOrder.id}`).then(r => r.json())
      setCurrentOrder(updated)
      setItemCart([])
      setIsAddItemDialogOpen(false)
      fetchAll()
      toast({ title: `${itemCart.length} item ditambahkan ✅` })
    } catch (e) {
      toast({ title: "Error", description: "Gagal tambah item", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  // ===== HELPERS =====
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800";
      case "occupied": return "bg-red-100 text-red-800";
      case "reserved": return "bg-yellow-100 text-yellow-800";
      default: return "";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "available": return "Tersedia";
      case "occupied": return "Terisi";
      case "reserved": return "Dipesan";
      default: return status;
    }
  };

  const change = currentOrder
    ? Math.max((parseFloat(cashAmount.replace(/[^\d]/g, "")) || 0) - currentOrder.total, 0)
    : 0;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Manajemen Meja</h1>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Cari meja atau pelanggan..." className="w-full pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Tambah Meja</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Tambah Meja Baru</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2"><Label>Nomor Meja</Label><Input type="number" value={newTable.number} onChange={(e) => setNewTable({ ...newTable, number: parseInt(e.target.value) || 0 })} /></div>
                <div className="grid gap-2"><Label>Kapasitas</Label><Input type="number" value={newTable.capacity} onChange={(e) => setNewTable({ ...newTable, capacity: parseInt(e.target.value) || 0 })} /></div>
                <div className="grid gap-2">
                  <Label>Area</Label>
                  <Select value={newTable.area} onValueChange={(v) => setNewTable({ ...newTable, area: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="indoor">Indoor</SelectItem>
                      <SelectItem value="outdoor">Outdoor</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter><Button onClick={addTable}>Simpan</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center p-8"><p className="text-muted-foreground">Memuat data...</p></div>
        ) : (
          <Tabs value={activeArea} onValueChange={setActiveArea} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">Semua</TabsTrigger>
              <TabsTrigger value="indoor">Indoor</TabsTrigger>
              <TabsTrigger value="outdoor">Outdoor</TabsTrigger>
              <TabsTrigger value="vip">VIP</TabsTrigger>
            </TabsList>
            <TabsContent value={activeArea}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredTables.map((table) => (
                  <Card key={table.id} className={`overflow-hidden ${table.status === "occupied" ? "border-orange-200 bg-orange-50 dark:bg-orange-950/20" : ""}`}>
                    <CardHeader className="p-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Meja {table.number}</CardTitle>
                        <Badge className={getStatusColor(table.status)}>{getStatusLabel(table.status)}</Badge>
                      </div>
                      <CardDescription>Kapasitas: {table.capacity} orang • {table.area.toUpperCase()}</CardDescription>
                      {table.status !== "available" && table.customer && (
                        <p className="text-sm font-medium mt-1">👤 {table.customer}</p>
                      )}
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-2">
                      {/* Tombol Kelola Order — muncul jika meja terisi */}
                      {table.status === "occupied" && (
                        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white" size="sm" onClick={() => handleKelolaMeja(table)}>
                          <ShoppingCart className="mr-2 h-4 w-4" />Kelola Order
                        </Button>
                      )}
                      <div className="flex justify-between">
                        <Button variant="outline" size="sm" className="w-full mr-2" onClick={() => { setCurrentTable(table); setCustomerName(""); setIsStatusDialogOpen(true); }}>
                          <Utensils className="mr-2 h-4 w-4" />Ubah Status
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => { setCurrentTable(table); setIsEditDialogOpen(true); }}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setCurrentTable(table); setIsDeleteDialogOpen(true); }}><Trash2 className="mr-2 h-4 w-4" />Hapus</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* ===== DIALOG KELOLA ORDER ===== */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Kelola Order — Meja {currentTable?.number}</DialogTitle>
            <DialogDescription>{currentOrder?.customerName || currentTable?.customer || "Tanpa nama"}</DialogDescription>
          </DialogHeader>

          {currentOrder ? (
            <div className="flex flex-col gap-4 overflow-hidden">
              {/* Daftar item order */}
              <ScrollArea className="max-h-52">
                <div className="space-y-2 pr-2">
                  {currentOrder.orderItems.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">Belum ada item</p>
                  ) : (
                    currentOrder.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">{formatRupiah(item.price)} / item</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateItemQty(item, -1)}><Minus className="h-3 w-3" /></Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateItemQty(item, 1)}><Plus className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => removeItemFromOrder(item.id)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                        <p className="text-sm font-semibold w-24 text-right">{formatRupiah(item.price * item.quantity)}</p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              <Separator />

              {/* Total */}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatRupiah(currentOrder.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Pajak (10%)</span><span>{formatRupiah(currentOrder.tax)}</span></div>
                <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatRupiah(currentOrder.total)}</span></div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Belum ada order aktif untuk meja ini</p>
            </div>
          )}

          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setIsAddItemDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />Tambah Item
            </Button>
            {currentOrder && currentOrder.orderItems.length > 0 && (
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsPayDialogOpen(true)}>
                💳 Bayar Sekarang
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== DIALOG TAMBAH ITEM ===== */}
      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Tambah Item ke Order</DialogTitle></DialogHeader>
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari produk..." className="pl-8" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
          </div>
              {/* Tab Kategori */}
          {(() => {
            const cats = ["Semua", ...Array.from(new Set(products.map(p => p.category)))]
            const [activeCat, setActiveCat] = [productCat, setProductCat]
            const shown = products.filter(p => {
              const matchCat = activeCat === "Semua" || p.category === activeCat
              const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase())
              return matchCat && matchSearch
            })
            return (
              <>
                <div className="flex gap-2 flex-wrap mb-3">
                  {cats.map(cat => (
                    <button key={cat} onClick={() => setActiveCat(cat)}
                      className={`px-3 py-1 rounded-full text-sm border transition-all ${activeCat === cat ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground/30 hover:border-primary"}`}>
                      {cat}
                    </button>
                  ))}
                </div>
                <ScrollArea className="h-80">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pr-2">
                    {shown.map((product) => (
                      <Card key={product.id} className="cursor-pointer hover:border-primary hover:shadow-md transition-all" onClick={() => handleProductClickInMeja(product)}>
                        <div className="aspect-square overflow-hidden rounded-t-lg">
                          <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <CardHeader className="p-2">
                          <p className="text-sm font-semibold truncate">{product.name}</p>
                          <p className="text-sm text-green-600 font-medium">{formatRupiah(product.price)}</p>
                          <p className="text-xs text-muted-foreground">Stok: {product.stock}</p>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )
          })()}

          {/* Preview cart items */}
          {itemCart.length > 0 && (
            <div className="border-t pt-3 mt-2 space-y-2">
              <p className="text-sm font-semibold" style={{color: "#2e7965"}}>Item dipilih ({itemCart.length}):</p>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {itemCart.map(item => (
                  <div key={`${item.product.id}-${item.note}`} className="flex items-center justify-between text-sm rounded-lg px-3 py-2" style={{background: "rgba(46,94,84,0.08)"}}>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.product.name}{item.note ? ` (${item.note})` : ""}</p>
                      <p className="text-xs text-muted-foreground">x{item.quantity} • {formatRupiah((item.product.price + item.extraPrice) * item.quantity)}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button onClick={() => setItemCart(prev => prev.map(i => `${i.product.id}-${i.note}` === `${item.product.id}-${item.note}` ? {...i, quantity: Math.max(1, i.quantity - 1)} : i))}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{background: "rgba(46,94,84,0.15)", color: "#2e7965"}}>-</button>
                      <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                      <button onClick={() => setItemCart(prev => prev.map(i => `${i.product.id}-${i.note}` === `${item.product.id}-${item.note}` ? {...i, quantity: i.quantity + 1} : i))}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{background: "rgba(46,94,84,0.15)", color: "#2e7965"}}>+</button>
                      <button onClick={() => removeFromItemCart(`${item.product.id}-${item.note}`)}
                        className="w-6 h-6 rounded-full flex items-center justify-center ml-1" style={{background: "rgba(220,38,38,0.1)", color: "#dc2626"}}>
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm font-semibold pt-1 border-t">
                <span>Total tambahan:</span>
                <span style={{color: "#2e7965"}}>{formatRupiah(itemCart.reduce((sum, i) => sum + (i.product.price + i.extraPrice) * i.quantity, 0))}</span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setIsAddItemDialogOpen(false); setItemCart([]) }}>Batal</Button>
            <Button onClick={confirmAddItems} disabled={itemCart.length === 0 || isProcessing}>
              {isProcessing ? "Menambahkan..." : `Tambah ${itemCart.length} Item`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== DIALOG PEMBAYARAN ===== */}
      <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pembayaran — Meja {currentTable?.number}</DialogTitle>
            <DialogDescription>{currentOrder?.customerName || currentTable?.customer || "Tanpa nama"}</DialogDescription>
          </DialogHeader>
          {currentOrder && (
            <div className="space-y-4 py-2">
              <div className="flex justify-between font-bold text-lg border-b pb-2">
                <span>Total Tagihan</span>
                <span className="text-green-600">{formatRupiah(currentOrder.total)}</span>
              </div>
              <div>
                <Label>Metode Pembayaran</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="flex gap-4 mt-2">
                  <div className="flex items-center gap-2"><RadioGroupItem value="Tunai" id="pay-tunai" /><Label htmlFor="pay-tunai">Tunai</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="QRIS" id="pay-qris" /><Label htmlFor="pay-qris">QRIS</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="Kartu Debit" id="pay-debit" /><Label htmlFor="pay-debit">Kartu Debit</Label></div>
                </RadioGroup>
              </div>
              {paymentMethod === "Tunai" && (
                <>
                  <div>
                    <Label>Uang Tunai</Label>
                    <Input className="mt-1" placeholder="Rp 0" value={cashAmount}
                      onChange={(e) => { const v = e.target.value.replace(/[^\d]/g, ""); setCashAmount(v ? formatRupiah(parseInt(v)) : "") }} />
                  </div>
                  {cashAmount && (
                    <div className="flex justify-between text-sm bg-blue-50 dark:bg-blue-950 p-2 rounded">
                      <span>Kembalian:</span>
                      <span className="font-bold">{formatRupiah(change)}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPayDialogOpen(false)}>Batal</Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handlePayOrder}
              disabled={isProcessing || (paymentMethod === "Tunai" && (!cashAmount || (parseFloat(cashAmount.replace(/[^\d]/g, "")) || 0) < (currentOrder?.total || 0)))}
            >
              {isProcessing ? "Memproses..." : "✅ Konfirmasi Pembayaran"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== DIALOG EDIT MEJA ===== */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Meja</DialogTitle></DialogHeader>
          {currentTable && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label>Nomor Meja</Label><Input type="number" value={currentTable.number} onChange={(e) => setCurrentTable({ ...currentTable, number: parseInt(e.target.value) || 0 })} /></div>
              <div className="grid gap-2"><Label>Kapasitas</Label><Input type="number" value={currentTable.capacity} onChange={(e) => setCurrentTable({ ...currentTable, capacity: parseInt(e.target.value) || 0 })} /></div>
              <div className="grid gap-2">
                <Label>Area</Label>
                <Select value={currentTable.area} onValueChange={(v: "indoor" | "outdoor" | "vip") => setCurrentTable({ ...currentTable, area: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indoor">Indoor</SelectItem>
                    <SelectItem value="outdoor">Outdoor</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter><Button onClick={editTable}>Simpan Perubahan</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== DIALOG HAPUS MEJA ===== */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Hapus Meja</DialogTitle><DialogDescription>Yakin ingin menghapus Meja {currentTable?.number}?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={deleteTable}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== DIALOG UBAH STATUS ===== */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ubah Status Meja {currentTable?.number}</DialogTitle></DialogHeader>
          {currentTable && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Status Saat Ini</Label>
                <Badge className={`${getStatusColor(currentTable.status)} w-fit`}>{getStatusLabel(currentTable.status)}</Badge>
              </div>
              <div className="grid gap-2">
                <Label>Nama Pelanggan (opsional)</Label>
                <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nama pelanggan..." />
              </div>
              <div className="grid gap-2">
                <Label>Ubah Status Menjadi</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" className="flex-1 justify-start" onClick={() => updateTableStatus("available")}><Check className="mr-2 h-4 w-4 text-green-600" />Tersedia</Button>
                  <Button variant="outline" className="flex-1 justify-start" onClick={() => updateTableStatus("occupied")}><X className="mr-2 h-4 w-4 text-red-600" />Terisi</Button>
                  <Button variant="outline" className="flex-1 justify-start" onClick={() => updateTableStatus("reserved")}><Clock className="mr-2 h-4 w-4 text-yellow-600" />Dipesan</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Opsi Produk */}
      <Dialog open={isProductOptionsOpen} onOpenChange={setIsProductOptionsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
            <DialogDescription>{formatRupiah(selectedProduct?.price || 0)}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {productOptions.map(opt => (
              <div key={opt.id} className="space-y-2">
                <Label className="font-semibold">
                  {opt.name} {opt.required && <span className="text-red-500 text-xs">*wajib</span>}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {opt.choices.map((choice: any) => (
                    <button key={choice.id}
                      onClick={() => setSelectedChoices(prev => ({ ...prev, [opt.id]: choice }))}
                      className={`px-3 py-1.5 rounded-full border text-sm transition-all ${selectedChoices[opt.id]?.id === choice.id ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground/30 hover:border-primary"}`}>
                      {choice.name}{choice.extraPrice > 0 ? ` +${formatRupiah(choice.extraPrice)}` : ""}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="space-y-2">
              <Label>Catatan (opsional)</Label>
              <Input placeholder="Contoh: less ice, extra shot..." value={optionNote} onChange={e => setOptionNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProductOptionsOpen(false)}>Batal</Button>
            <Button onClick={confirmProductOption}>Tambah ke Cart</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Struk */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Struk Pembayaran</DialogTitle></DialogHeader>
          {receiptData && (
            <Receipt
              orderId={receiptData.orderId}
              orderType={receiptData.orderType}
              tableNumber={receiptData.tableNumber}
              customerName={receiptData.customerName}
              items={receiptData.items}
              subtotal={receiptData.subtotal}
              discount={receiptData.discount}
              tax={receiptData.tax}
              total={receiptData.total}
              paymentMethod={receiptData.paymentMethod}
              cashAmount={receiptData.cashAmount}
              change={receiptData.change}
              createdAt={receiptData.createdAt}
              onClose={() => setIsReceiptOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
