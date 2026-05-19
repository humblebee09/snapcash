"use client";

import { Receipt } from "@/components/receipt";

import type React from "react";
import { useState, useEffect } from "react";
import { Minus, Plus, Search, Tag, Trash2, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatRupiah } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ProductOptionChoice { id: string; name: string; extraPrice: number; }
interface ProductOption { id: string; name: string; required: boolean; choices: ProductOptionChoice[]; }
interface Product { id: string; name: string; price: number; category: string; image: string; stock: number; taxEnabled: boolean; trackStock: boolean; }
interface CartItem extends Product { quantity: number; originalId?: string; }
interface Table { id: string; number: number; capacity: number; status: string; area: string; customer?: string; }
interface OpenOrder { id: string; tableId: string; table: Table; customerName: string; subtotal: number; total: number; orderItems: { id: string; quantity: number; price: number; product: Product }[] }

const DISCOUNTS = [
  { id: "1", name: "Diskon Akhir Bulan", code: "ENDMONTH25", type: "percentage", value: 25, minPurchase: 100000, applicableTo: "all" },
  { id: "2", name: "Promo Minuman", code: "DRINK20", type: "percentage", value: 20, minPurchase: 50000, applicableTo: "category", categoryOrProductId: "Minuman" },
  { id: "3", name: "Diskon Tetap", code: "FLAT30K", type: "fixed", value: 30000, minPurchase: 150000, applicableTo: "all" },
]

export default function KasirPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [openOrders, setOpenOrders] = useState<OpenOrder[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("Semua")
  const [orderType, setOrderType] = useState<"takeaway" | "dinein">("dinein")
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [customerName, setCustomerName] = useState("")
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isManageOrderDialogOpen, setIsManageOrderDialogOpen] = useState(false)
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false)
  const [selectedOpenOrder, setSelectedOpenOrder] = useState<OpenOrder | null>(null)
  const [cashAmount, setCashAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("Tunai")
  const [discountCode, setDiscountCode] = useState("")
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null)
  const [discountError, setDiscountError] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [receiptData, setReceiptData] = useState<any>(null)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [isOptionsDialogOpen, setIsOptionsDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productOptions, setProductOptions] = useState<ProductOption[]>([])
  const [selectedChoices, setSelectedChoices] = useState<Record<string, ProductOptionChoice>>({})
  const [optionNote, setOptionNote] = useState("")
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    const [p, t, o, c] = await Promise.all([
      fetch("/api/products").then(r => r.json()),
      fetch("/api/tables").then(r => r.json()),
      fetch("/api/orders/open").then(r => r.json()),
      fetch("/api/categories").then(r => r.json()).catch(() => []),
    ])
    setProducts(Array.isArray(p) ? p : [])
    setTables(Array.isArray(t) ? t : [])
    setOpenOrders(Array.isArray(o) ? o : [])
    setCategories(Array.isArray(c) ? ["Semua", ...c.map((cat: any) => cat.name)] : ["Semua"])
  }

  const filteredProducts = products.filter(p => {
    const matchCat = activeCategory === "Semua" || p.category === activeCategory
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchCat && matchSearch
  })

  // categories dari database

  const handleProductClick = async (product: Product) => {
    const res = await fetch(`/api/products/${product.id}/options`)
    const options = await res.json()
    if (Array.isArray(options) && options.length > 0) {
      setSelectedProduct(product)
      setProductOptions(options)
      setSelectedChoices({})
      setOptionNote("")
      setIsOptionsDialogOpen(true)
    } else {
      addToCart(product)
    }
  }

  const confirmProductOptions = () => {
    if (!selectedProduct) return
    // Cek opsi wajib
    const missingRequired = productOptions.filter(opt => opt.required && !selectedChoices[opt.id])
    if (missingRequired.length > 0) {
      toast({ title: "Lengkapi pilihan", description: `Wajib pilih: ${missingRequired.map(o => o.name).join(", ")}`, variant: "destructive" })
      return
    }
    const extraPrice = Object.values(selectedChoices).reduce((sum, c) => sum + c.extraPrice, 0)
    const note = Object.values(selectedChoices).map(c => c.name).join(", ") + (optionNote ? ` - ${optionNote}` : "")
    addToCartWithOptions(selectedProduct, extraPrice, note)
    setIsOptionsDialogOpen(false)
  }

  const addToCartWithOptions = (product: Product, extraPrice: number, note: string) => {
    const finalPrice = product.price + extraPrice
    setCart(prev => {
      const key = `${product.id}-${note}`
      const ex = prev.find(i => i.id === key)
      if (ex) return prev.map(i => i.id === key ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { ...product, id: key, originalId: product.id, price: finalPrice, name: note ? `${product.name} (${note})` : product.name, quantity: 1 }]
    })
  }

  const addToCart = (product: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id)
      if (ex) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { ...product, originalId: product.id, quantity: 1 }]
    })
  }

  const decreaseQty = (id: string) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === id)
      if (ex && ex.quantity > 1) return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i)
      return prev.filter(i => i.id !== id)
    })
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const discountAmt = () => {
    if (!appliedDiscount) return 0
    if (subtotal < appliedDiscount.minPurchase) return 0
    if (appliedDiscount.type === "percentage") return (subtotal * appliedDiscount.value) / 100
    return appliedDiscount.value
  }
  const taxableSubtotal = cart.reduce((sum, item) => {
    const originalId = (item as any).originalId || item.id
    const product = products.find(p => p.id === originalId)
    return sum + (product?.taxEnabled !== false ? item.price * item.quantity : 0)
  }, 0)
  const tax = Math.round((taxableSubtotal - discountAmt()) * 0.1)
  const total = subtotal - discountAmt() + tax
  const change = () => { const c = parseFloat(cashAmount.replace(/[^\d]/g, "")); return isNaN(c) ? 0 : Math.max(c - total, 0) }

  const applyDiscount = () => {
    setDiscountError("")
    const d = DISCOUNTS.find(d => d.code.toLowerCase() === discountCode.toLowerCase())
    if (!d) { setDiscountError("Kode diskon tidak valid"); return }
    if (subtotal < d.minPurchase) { setDiscountError(`Minimal pembelian ${formatRupiah(d.minPurchase)}`); return }
    setAppliedDiscount(d)
    setIsDiscountDialogOpen(false)
  }

  const handleSendOrder = async () => {
    if (cart.length === 0) return
    if (orderType === "dinein" && !selectedTable) { setIsTableDialogOpen(true); return }
    setIsProcessing(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderType,
          items: cart.map(i => ({ id: i.id, originalId: i.originalId, quantity: i.quantity, price: i.price })),
          tableId: selectedTable?.id || null,
          customerName: customerName || null,
          discount: discountAmt(),
          discountCode: appliedDiscount?.code || null,
          ...(orderType === "takeaway" && {
            paymentMethod,
            cashAmount: parseFloat(cashAmount.replace(/[^\d]/g, "")) || 0,
            change: change(),
          }),
        }),
      })
      const resData = await res.json()
      if (orderType === "takeaway") {
        setReceiptData({
          orderId: resData.id || Date.now().toString(),
          orderType,
          tableNumber: undefined,
          customerName: customerName || undefined,
          items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
          subtotal,
          discount: discountAmt(),
          tax,
          total,
          paymentMethod,
          cashAmount: parseFloat(cashAmount.replace(/[^\d]/g, "")) || 0,
          change: change(),
          createdAt: new Date().toISOString(),
        })
        setIsReceiptOpen(true)
      } else {
        toast({ title: "Order dikirim! ✅", description: `Order meja ${selectedTable?.number} berhasil dicatat` })
      }
      setCart([])
      setCashAmount("")
      setAppliedDiscount(null)
      setDiscountCode("")
      setSelectedTable(null)
      setCustomerName("")
      setIsPaymentDialogOpen(false)
      fetchAll()
    } catch (e) {
      toast({ title: "Error", description: "Gagal memproses order", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePayOpenOrder = async (orderId: string) => {
    setPayingOrderId(orderId)
    setIsProcessing(true)
    try {
      const cash = parseFloat(cashAmount.replace(/[^\d]/g, "")) || 0
      const order = openOrders.find(o => o.id === orderId)!
      const res = await fetch(`/api/orders/${orderId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod, cashAmount: cash, discountCode: null, discount: 0 }),
      })
      const data = await res.json()
      toast({ title: "Pembayaran berhasil! ✅", description: `Total: ${formatRupiah(order.total)} • Kembalian: ${formatRupiah(data.change || 0)}` })
      setIsManageOrderDialogOpen(false)
      setCashAmount("")
      setPaymentMethod("Tunai")
      setPayingOrderId(null)
      fetchAll()
    } catch (e) {
      toast({ title: "Error", description: "Gagal bayar", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  const getTableOpenOrder = (tableId: string) => openOrders.find(o => o.tableId === tableId)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-4 md:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Kasir</h1>
      </header>
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Produk */}
        <div className="flex-1 p-4 md:p-6">
          <div className="relative w-full max-w-sm mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Cari produk..." className="w-full pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="mb-4 flex flex-wrap h-auto" style={{background: "#e8f5e9"}}>
              {categories.map(cat => <TabsTrigger key={cat} value={cat} className="mb-1">{cat}</TabsTrigger>)}
            </TabsList>
            <TabsContent value={activeCategory} className="mt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map(product => (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="aspect-square"><img src={product.image || "/placeholder.svg"} alt={product.name} className="object-cover w-full h-full" /></div>
                    <CardHeader className="p-3">
                      <p className="font-semibold text-sm">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{formatRupiah(product.price)}</p>
                      <p className="text-xs text-muted-foreground">Stok: {product.stock}</p>
                    </CardHeader>
                    <CardFooter className="p-3 pt-0">
                      <Button size="sm" className="w-full" onClick={() => handleProductClick(product)} disabled={product.stock === 0}>
                        <Plus className="h-4 w-4 mr-1" />{product.stock === 0 ? "Habis" : "Tambah"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Keranjang */}
        <div className="w-full md:w-[380px] border-t md:border-t-0 md:border-l flex flex-col">
          <Card className="flex-1 rounded-none border-0 flex flex-col">
            <CardHeader className="px-4 py-3 border-b">
              <CardTitle className="text-lg">Keranjang</CardTitle>
              <RadioGroup value={orderType} onValueChange={v => { setOrderType(v as any); setSelectedTable(null) }} className="flex gap-4 mt-1">
                <div className="flex items-center gap-2"><RadioGroupItem value="takeaway" id="ta" /><Label htmlFor="ta">Take Away</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="dinein" id="di" /><Label htmlFor="di">Dine In</Label></div>
              </RadioGroup>
              {orderType === "dinein" && selectedTable && (
                <Badge variant="outline" className="mt-1 w-fit"><Utensils className="h-3 w-3 mr-1" />Meja {selectedTable.number}</Badge>
              )}
              {orderType === "dinein" && !selectedTable && (
                <Button variant="outline" size="sm" className="mt-1 w-fit" onClick={() => setIsTableDialogOpen(true)}>
                  <Utensils className="h-3 w-3 mr-1" />Pilih Meja
                </Button>
              )}
            </CardHeader>

            <CardContent className="p-0 flex-1 overflow-hidden">
              {cart.length === 0 ? (
                <div className="flex items-center justify-center h-48"><p className="text-muted-foreground text-sm">Keranjang kosong</p></div>
              ) : (
                <ScrollArea className="h-[calc(100vh-420px)]">
                  <div className="px-4 py-2 space-y-3">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{formatRupiah(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => decreaseQty(item.id)}><Minus className="h-3 w-3" /></Button>
                          <span className="w-6 text-center text-sm">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => addToCart(item)}><Plus className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCart(c => c.filter(i => i.id !== item.id))}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>

            <CardFooter className="flex flex-col p-4 border-t gap-3">
              <div className="w-full space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatRupiah(subtotal)}</span></div>
                {appliedDiscount && <div className="flex justify-between text-green-600"><span>Diskon</span><span>-{formatRupiah(discountAmt())}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Pajak (10%)</span><span>{formatRupiah(tax)}</span></div>
                <Separator />
                <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatRupiah(total)}</span></div>
              </div>
              <div className="flex gap-2 w-full">
                <Button variant="outline" size="sm" onClick={() => setIsDiscountDialogOpen(true)}>
                  <Tag className="h-3 w-3 mr-1" />Diskon
                </Button>
                {orderType === "takeaway" ? (
                  <Button className="flex-1" disabled={cart.length === 0} onClick={() => setIsPaymentDialogOpen(true)}>Bayar</Button>
                ) : (
                  <Button className="flex-1" disabled={cart.length === 0 || !selectedTable} onClick={handleSendOrder} disabled={isProcessing}>
                    {isProcessing ? "Memproses..." : "Kirim Order"}
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>

          {/* Open Orders (Dine In aktif) */}
          {openOrders.length > 0 && (
            <div className="border-t p-4 space-y-2">
              <p className="text-sm font-semibold">Order Aktif ({openOrders.length})</p>
              {openOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between bg-orange-50 dark:bg-orange-950 rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium">Meja {order.table?.number} {order.customerName ? `• ${order.customerName}` : ""}</p>
                    <p className="text-xs text-muted-foreground">{order.orderItems.length} item • {formatRupiah(order.total)}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => { setSelectedOpenOrder(order); setIsManageOrderDialogOpen(true) }}>
                    Kelola
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialog Pilih Meja */}
      <Dialog open={isTableDialogOpen} onOpenChange={setIsTableDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Pilih Meja</DialogTitle><DialogDescription>Pilih meja untuk order Dine In</DialogDescription></DialogHeader>
          <div className="py-4">
            <div className="mb-4">
              <Label>Nama Pelanggan (opsional)</Label>
              <Input className="mt-1" placeholder="Nama pelanggan..." value={customerName} onChange={e => setCustomerName(e.target.value)} />
            </div>
            <Tabs defaultValue="indoor">
              <TabsList><TabsTrigger value="indoor">Indoor</TabsTrigger><TabsTrigger value="outdoor">Outdoor</TabsTrigger><TabsTrigger value="vip">VIP</TabsTrigger></TabsList>
              {["indoor", "outdoor", "vip"].map(area => (
                <TabsContent key={area} value={area} className="mt-4">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {tables.filter(t => t.area === area).map(table => {
                      const openOrder = getTableOpenOrder(table.id)
                      return (
                        <Card key={table.id} className={`cursor-pointer transition-all ${selectedTable?.id === table.id ? "border-2 border-primary" : ""} ${table.status === "available" ? "hover:border-primary" : ""}`}
                          onClick={() => { setSelectedTable(table); }}>
                          <CardHeader className="p-3">
                            <p className="font-semibold text-sm">Meja {table.number}</p>
                            <p className="text-xs text-muted-foreground">{table.capacity} orang</p>
                            {openOrder ? (
                              <Badge className="bg-orange-100 text-orange-800 text-xs w-fit">Ada Order</Badge>
                            ) : (
                              <Badge className={`text-xs w-fit ${table.status === "available" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                {table.status === "available" ? "Tersedia" : "Terisi"}
                              </Badge>
                            )}
                          </CardHeader>
                        </Card>
                      )
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTableDialogOpen(false)}>Batal</Button>
            <Button onClick={() => { setIsTableDialogOpen(false); if (cart.length > 0) handleSendOrder() }} disabled={!selectedTable}>
              Konfirmasi Meja
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Bayar Take Away */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Pembayaran Take Away</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-between font-bold text-lg"><span>Total:</span><span>{formatRupiah(total)}</span></div>
            <div>
              <Label>Metode Pembayaran</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="flex gap-4 mt-2">
                <div className="flex items-center gap-2"><RadioGroupItem value="Tunai" id="p-tunai" /><Label htmlFor="p-tunai">Tunai</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="QRIS" id="p-qris" /><Label htmlFor="p-qris">QRIS</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="Kartu Debit" id="p-debit" /><Label htmlFor="p-debit">Kartu Debit</Label></div>
              </RadioGroup>
            </div>
            {paymentMethod === "Tunai" && (
              <>
                <div>
                  <Label>Uang Tunai</Label>
                  <Input className="mt-1" placeholder="Rp 0" value={cashAmount} onChange={e => { const v = e.target.value.replace(/[^\d]/g, ""); setCashAmount(v ? formatRupiah(parseInt(v)) : "") }} />
                </div>
                {cashAmount && <div className="flex justify-between text-sm"><span>Kembalian:</span><span className="font-medium">{formatRupiah(change())}</span></div>}
              </>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleSendOrder} disabled={isProcessing || (paymentMethod === "Tunai" && (!cashAmount || parseFloat(cashAmount.replace(/[^\d]/g, "")) < total))}>
              {isProcessing ? "Memproses..." : "Selesaikan Transaksi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Kelola Order Meja */}
      <Dialog open={isManageOrderDialogOpen} onOpenChange={setIsManageOrderDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Kelola Order — Meja {selectedOpenOrder?.table?.number}</DialogTitle>
            <DialogDescription>{selectedOpenOrder?.customerName || "Tanpa nama"}</DialogDescription>
          </DialogHeader>
          {selectedOpenOrder && (
            <div className="space-y-4 py-2">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedOpenOrder.orderItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span>{item.product.name} x{item.quantity}</span>
                    <span className="font-medium">{formatRupiah(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between font-bold"><span>Total</span><span>{formatRupiah(selectedOpenOrder.total)}</span></div>
              <div>
                <Label>Metode Pembayaran</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="flex gap-4 mt-2">
                  <div className="flex items-center gap-2"><RadioGroupItem value="Tunai" id="m-tunai" /><Label htmlFor="m-tunai">Tunai</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="QRIS" id="m-qris" /><Label htmlFor="m-qris">QRIS</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="Kartu Debit" id="m-debit" /><Label htmlFor="m-debit">Kartu Debit</Label></div>
                </RadioGroup>
              </div>
              {paymentMethod === "Tunai" && (
                <>
                  <div>
                    <Label>Uang Tunai</Label>
                    <Input className="mt-1" placeholder="Rp 0" value={cashAmount} onChange={e => { const v = e.target.value.replace(/[^\d]/g, ""); setCashAmount(v ? formatRupiah(parseInt(v)) : "") }} />
                  </div>
                  {cashAmount && (
                    <div className="flex justify-between text-sm">
                      <span>Kembalian:</span>
                      <span>{formatRupiah(Math.max(parseFloat(cashAmount.replace(/[^\d]/g, "")) - selectedOpenOrder.total, 0))}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setIsManageOrderDialogOpen(false); if (selectedOpenOrder) { setSelectedTable(selectedOpenOrder.table); setOrderType("dinein"); setIsTableDialogOpen(false) } }}>
              + Tambah Item
            </Button>
            <Button onClick={() => selectedOpenOrder && handlePayOpenOrder(selectedOpenOrder.id)}
              disabled={isProcessing || (paymentMethod === "Tunai" && (!cashAmount || parseFloat(cashAmount.replace(/[^\d]/g, "")) < (selectedOpenOrder?.total || 0)))}>
              {isProcessing ? "Memproses..." : "Bayar Sekarang"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Pilih Opsi Produk */}
      <Dialog open={isOptionsDialogOpen} onOpenChange={setIsOptionsDialogOpen}>
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
                  {opt.choices.map(choice => (
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
            <Button variant="outline" onClick={() => setIsOptionsDialogOpen(false)}>Batal</Button>
            <Button onClick={confirmProductOptions}>Tambah ke Keranjang</Button>
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

      {/* Dialog Diskon */}}
      <Dialog open={isDiscountDialogOpen} onOpenChange={setIsDiscountDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Kode Diskon</DialogTitle></DialogHeader>
          <div className="space-y-3 py-4">
            <Label>Kode Diskon</Label>
            <Input placeholder="Masukkan kode..." value={discountCode} onChange={e => setDiscountCode(e.target.value)} />
            {discountError && <p className="text-sm text-red-500">{discountError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDiscountDialogOpen(false)}>Batal</Button>
            <Button onClick={applyDiscount}>Terapkan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
