"use client";

import type React from "react";

import { useState } from "react";
import {
  CalendarIcon,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
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
  DialogTrigger,
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
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { format } from "date-fns";
import { cn, formatRupiah } from "@/lib/utils";

// Tipe data untuk diskon
interface Discount {
  id: string;
  name: string;
  code: string;
  type: "percentage" | "fixed" | "buyXgetY";
  value: number;
  minPurchase: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  applicableTo: "all" | "category" | "product";
  categoryOrProductId?: string;
  usageLimit: number;
  usageCount: number;
}

export default function DiscountPage() {
  // Data diskon dummy
  const initialDiscounts: Discount[] = [
    {
      id: "1",
      name: "Diskon Akhir Bulan",
      code: "ENDMONTH25",
      type: "percentage",
      value: 25,
      minPurchase: 100000,
      startDate: new Date(2024, 4, 25),
      endDate: new Date(2024, 4, 31),
      isActive: true,
      applicableTo: "all",
      usageLimit: 100,
      usageCount: 45,
    },
    {
      id: "2",
      name: "Promo Minuman",
      code: "DRINK20",
      type: "percentage",
      value: 20,
      minPurchase: 50000,
      startDate: new Date(2024, 4, 1),
      endDate: new Date(2024, 5, 30),
      isActive: true,
      applicableTo: "category",
      categoryOrProductId: "Minuman",
      usageLimit: 200,
      usageCount: 78,
    },
    {
      id: "3",
      name: "Diskon Tetap",
      code: "FLAT30K",
      type: "fixed",
      value: 30000,
      minPurchase: 150000,
      startDate: new Date(2024, 4, 10),
      endDate: new Date(2024, 5, 10),
      isActive: true,
      applicableTo: "all",
      usageLimit: 50,
      usageCount: 22,
    },
    {
      id: "4",
      name: "Beli 2 Gratis 1",
      code: "BUY2GET1",
      type: "buyXgetY",
      value: 1, // Gratis 1
      minPurchase: 0,
      startDate: new Date(2024, 4, 15),
      endDate: new Date(2024, 5, 15),
      isActive: true,
      applicableTo: "product",
      categoryOrProductId: "1", // ID produk Kopi Hitam
      usageLimit: 30,
      usageCount: 12,
    },
    {
      id: "5",
      name: "Diskon Tidak Aktif",
      code: "INACTIVE50",
      type: "percentage",
      value: 50,
      minPurchase: 200000,
      startDate: new Date(2024, 3, 1),
      endDate: new Date(2024, 3, 30),
      isActive: false,
      applicableTo: "all",
      usageLimit: 20,
      usageCount: 20,
    },
  ];

  const [discounts, setDiscounts] = useState<Discount[]>(initialDiscounts);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentDiscount, setCurrentDiscount] = useState<Discount | null>(null);
  const [newDiscount, setNewDiscount] = useState<
    Omit<Discount, "id" | "usageCount">
  >({
    name: "",
    code: "",
    type: "percentage",
    value: 0,
    minPurchase: 0,
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    isActive: true,
    applicableTo: "all",
    usageLimit: 100,
  });

  // Tambahkan state untuk format minimal pembelian
  const [formattedMinPurchase, setFormattedMinPurchase] = useState<string>("");

  // Tambahkan state untuk format minimal pembelian saat edit
  const [formattedEditMinPurchase, setFormattedEditMinPurchase] =
    useState<string>("");

  // Tambahkan state untuk format nominal fixed diskon
  const [formattedFixedDiscount, setFormattedFixedDiscount] =
    useState<string>("");

  // Tambahkan state untuk format nominal fixed diskon saat edit
  const [formattedEditFixedDiscount, setFormattedEditFixedDiscount] =
    useState<string>("");

  // Filter diskon berdasarkan pencarian
  const filteredDiscounts = discounts.filter(
    (discount) =>
      discount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discount.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tambahkan fungsi untuk memformat input minimal pembelian
  const handleMinPurchaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    setFormattedMinPurchase(value ? formatRupiah(Number.parseInt(value)) : "");
    setNewDiscount({
      ...newDiscount,
      minPurchase: Number.parseInt(value) || 0,
    });
  };

  // Tambahkan fungsi untuk memformat input minimal pembelian saat edit
  const handleEditMinPurchaseChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    setFormattedEditMinPurchase(
      value ? formatRupiah(Number.parseInt(value)) : ""
    );
    setCurrentDiscount({
      ...currentDiscount!,
      minPurchase: Number.parseInt(value) || 0,
    });
  };

  const handleFixedDiscountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    setFormattedFixedDiscount(
      value ? formatRupiah(Number.parseInt(value)) : ""
    );
    setNewDiscount({ ...newDiscount, value: Number.parseInt(value) || 0 });
  };

  // Tambahkan fungsi untuk memformat input minimal pembelian saat edit
  const handleEditFixedDiscountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    setFormattedEditFixedDiscount(
      value ? formatRupiah(Number.parseInt(value)) : ""
    );
    setCurrentDiscount({
      ...currentDiscount!,
      value: Number.parseInt(value) || 0,
    });
  };

  // Menambahkan diskon baru
  const addDiscount = () => {
    const id = (discounts.length + 1).toString();
    const newDiscountData: Discount = {
      id,
      ...newDiscount,
      usageCount: 0,
    };
    setDiscounts([...discounts, newDiscountData]);
    setNewDiscount({
      name: "",
      code: "",
      type: "percentage",
      value: 0,
      minPurchase: 0,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      isActive: true,
      applicableTo: "all",
      usageLimit: 100,
    });
    setFormattedMinPurchase("");
    setFormattedFixedDiscount("");
    setIsAddDialogOpen(false);
  };

  // Mengedit diskon
  const editDiscount = () => {
    if (currentDiscount) {
      setDiscounts(
        discounts.map((discount) =>
          discount.id === currentDiscount.id ? currentDiscount : discount
        )
      );
      setIsEditDialogOpen(false);
    }
  };

  // Menghapus diskon
  const deleteDiscount = () => {
    if (currentDiscount) {
      setDiscounts(
        discounts.filter((discount) => discount.id !== currentDiscount.id)
      );
      setIsDeleteDialogOpen(false);
    }
  };

  // Mengatur diskon yang akan diedit
  const handleEditClick = (discount: Discount) => {
    setCurrentDiscount(discount);
    setFormattedEditMinPurchase(formatRupiah(discount.minPurchase));
    setFormattedEditFixedDiscount(formatRupiah(discount.value));
    setIsEditDialogOpen(true);
  };

  // Mengatur diskon yang akan dihapus
  const handleDeleteClick = (discount: Discount) => {
    setCurrentDiscount(discount);
    setIsDeleteDialogOpen(true);
  };

  // Mengubah status aktif diskon
  const toggleDiscountStatus = (id: string) => {
    setDiscounts(
      discounts.map((discount) =>
        discount.id === id
          ? { ...discount, isActive: !discount.isActive }
          : discount
      )
    );
  };

  // Format tanggal
  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy");
  };

  // Mendapatkan label tipe diskon
  const getDiscountTypeLabel = (type: string, value: number) => {
    switch (type) {
      case "percentage":
        return `${value}%`;
      case "fixed":
        return `Rp ${value.toLocaleString("id-ID")}`;
      case "buyXgetY":
        return `Beli ${Math.floor(value)} Gratis ${
          value % 1 === 0 ? value : 1
        }`;
      default:
        return "";
    }
  };

  // Mendapatkan label cakupan diskon
  const getApplicableToLabel = (
    applicableTo: string,
    categoryOrProductId?: string
  ) => {
    switch (applicableTo) {
      case "all":
        return "Semua Produk";
      case "category":
        return `Kategori: ${categoryOrProductId || "Tidak Ditentukan"}`;
      case "product":
        return `Produk ID: ${categoryOrProductId || "Tidak Ditentukan"}`;
      default:
        return "";
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Manajemen Diskon & Promo
          </h1>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight"></h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Diskon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah Diskon Baru</DialogTitle>
                <DialogDescription>
                  Masukkan detail diskon yang ingin ditambahkan
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nama Diskon</Label>
                  <Input
                    id="name"
                    value={newDiscount.name}
                    onChange={(e) =>
                      setNewDiscount({ ...newDiscount, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="code">Kode Diskon</Label>
                  <Input
                    id="code"
                    value={newDiscount.code}
                    onChange={(e) =>
                      setNewDiscount({
                        ...newDiscount,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Tipe Diskon</Label>
                  <Select
                    value={newDiscount.type}
                    onValueChange={(
                      value: "percentage" | "fixed" | "buyXgetY"
                    ) => setNewDiscount({ ...newDiscount, type: value })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Pilih tipe diskon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Persentase (%)</SelectItem>
                      <SelectItem value="fixed">Nominal Tetap (Rp)</SelectItem>
                      <SelectItem value="buyXgetY">Beli X Gratis Y</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="value">
                    {newDiscount.type === "percentage"
                      ? "Persentase Diskon (%)"
                      : newDiscount.type === "fixed"
                      ? "Nominal Diskon (Rp)"
                      : "Jumlah Gratis"}
                  </Label>
                  <Input
                    id="value"
                    value={
                      newDiscount.type === "fixed"
                        ? formattedFixedDiscount
                        : newDiscount.value
                    }
                    onChange={(e) =>
                      newDiscount.type === "fixed"
                        ? handleFixedDiscountChange(e)
                        : setNewDiscount({
                            ...newDiscount,
                            value: Number.parseInt(e.target.value) || 0,
                          })
                    }
                    placeholder={newDiscount.type === "fixed" ? "Rp 0" : ""}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="minPurchase">Minimal Pembelian (Rp)</Label>
                  <Input
                    id="minPurchase"
                    value={formattedMinPurchase}
                    onChange={handleMinPurchaseChange}
                    placeholder="Rp 0"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Tanggal Mulai</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newDiscount.startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newDiscount.startDate
                            ? format(newDiscount.startDate, "PPP")
                            : "Pilih tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newDiscount.startDate}
                          onSelect={(date) =>
                            date &&
                            setNewDiscount({ ...newDiscount, startDate: date })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid gap-2">
                    <Label>Tanggal Berakhir</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newDiscount.endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newDiscount.endDate
                            ? format(newDiscount.endDate, "PPP")
                            : "Pilih tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newDiscount.endDate}
                          onSelect={(date) =>
                            date &&
                            setNewDiscount({ ...newDiscount, endDate: date })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="applicableTo">Berlaku Untuk</Label>
                  <Select
                    value={newDiscount.applicableTo}
                    onValueChange={(value: "all" | "category" | "product") =>
                      setNewDiscount({ ...newDiscount, applicableTo: value })
                    }
                  >
                    <SelectTrigger id="applicableTo">
                      <SelectValue placeholder="Pilih cakupan diskon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Produk</SelectItem>
                      <SelectItem value="category">
                        Kategori Tertentu
                      </SelectItem>
                      <SelectItem value="product">Produk Tertentu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newDiscount.applicableTo !== "all" && (
                  <div className="grid gap-2">
                    <Label htmlFor="categoryOrProductId">
                      {newDiscount.applicableTo === "category"
                        ? "Kategori"
                        : "ID Produk"}
                    </Label>
                    <Input
                      id="categoryOrProductId"
                      value={newDiscount.categoryOrProductId || ""}
                      onChange={(e) =>
                        setNewDiscount({
                          ...newDiscount,
                          categoryOrProductId: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="usageLimit">Batas Penggunaan</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={newDiscount.usageLimit || ""}
                    onChange={(e) =>
                      setNewDiscount({
                        ...newDiscount,
                        usageLimit: Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={newDiscount.isActive}
                    onCheckedChange={(checked) =>
                      setNewDiscount({ ...newDiscount, isActive: checked })
                    }
                  />
                  <Label htmlFor="isActive">Aktif</Label>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={addDiscount}>Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari diskon..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Diskon & Promo</CardTitle>
            <CardDescription>
              Kelola semua diskon dan promo yang tersedia di toko Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nilai</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Berlaku Untuk</TableHead>
                  <TableHead>Penggunaan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDiscounts.map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell className="font-medium">
                      {discount.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {discount.code}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getDiscountTypeLabel(discount.type, discount.value)}
                    </TableCell>
                    <TableCell>
                      {formatDate(discount.startDate)} -{" "}
                      {formatDate(discount.endDate)}
                    </TableCell>
                    <TableCell>
                      {getApplicableToLabel(
                        discount.applicableTo,
                        discount.categoryOrProductId
                      )}
                    </TableCell>
                    <TableCell>
                      {discount.usageCount}/{discount.usageLimit}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`active-${discount.id}`}
                          checked={discount.isActive}
                          onCheckedChange={() =>
                            toggleDiscountStatus(discount.id)
                          }
                        />
                        <Label
                          htmlFor={`active-${discount.id}`}
                          className="sr-only"
                        >
                          Aktif
                        </Label>
                        <span
                          className={
                            discount.isActive
                              ? "text-green-600"
                              : "text-gray-400"
                          }
                        >
                          {discount.isActive ? "Aktif" : "Tidak Aktif"}
                        </span>
                      </div>
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
                            onClick={() => handleEditClick(discount)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(discount)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
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

      {/* Dialog Edit Diskon */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Diskon</DialogTitle>
            <DialogDescription>
              Ubah detail diskon yang dipilih
            </DialogDescription>
          </DialogHeader>
          {currentDiscount && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nama Diskon</Label>
                <Input
                  id="edit-name"
                  value={currentDiscount.name}
                  onChange={(e) =>
                    setCurrentDiscount({
                      ...currentDiscount,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-code">Kode Diskon</Label>
                <Input
                  id="edit-code"
                  value={currentDiscount.code}
                  onChange={(e) =>
                    setCurrentDiscount({
                      ...currentDiscount,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-type">Tipe Diskon</Label>
                <Select
                  value={currentDiscount.type}
                  onValueChange={(value: "percentage" | "fixed" | "buyXgetY") =>
                    setCurrentDiscount({ ...currentDiscount, type: value })
                  }
                >
                  <SelectTrigger id="edit-type">
                    <SelectValue placeholder="Pilih tipe diskon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Persentase (%)</SelectItem>
                    <SelectItem value="fixed">Nominal Tetap (Rp)</SelectItem>
                    <SelectItem value="buyXgetY">Beli X Gratis Y</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-value">
                  {currentDiscount.type === "percentage"
                    ? "Persentase Diskon (%)"
                    : currentDiscount.type === "fixed"
                    ? "Nominal Diskon (Rp)"
                    : "Jumlah Gratis"}
                </Label>
                <Input
                  id="edit-value"
                  value={
                    currentDiscount.type === "fixed"
                      ? formattedEditFixedDiscount
                      : currentDiscount.value
                  }
                  onChange={(e) =>
                    currentDiscount.type === "fixed"
                      ? handleEditFixedDiscountChange(e)
                      : setCurrentDiscount({
                          ...currentDiscount,
                          value: Number.parseInt(e.target.value) || 0,
                        })
                  }
                  placeholder={currentDiscount.type === "fixed" ? "Rp 0" : ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-minPurchase">Minimal Pembelian (Rp)</Label>
                <Input
                  id="edit-minPurchase"
                  value={formattedEditMinPurchase}
                  onChange={handleEditMinPurchaseChange}
                  placeholder="Rp 0"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tanggal Mulai</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !currentDiscount.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {currentDiscount.startDate
                          ? format(currentDiscount.startDate, "PPP")
                          : "Pilih tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={currentDiscount.startDate}
                        onSelect={(date) =>
                          date &&
                          setCurrentDiscount({
                            ...currentDiscount,
                            startDate: date,
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label>Tanggal Berakhir</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !currentDiscount.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {currentDiscount.endDate
                          ? format(currentDiscount.endDate, "PPP")
                          : "Pilih tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={currentDiscount.endDate}
                        onSelect={(date) =>
                          date &&
                          setCurrentDiscount({
                            ...currentDiscount,
                            endDate: date,
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-applicableTo">Berlaku Untuk</Label>
                <Select
                  value={currentDiscount.applicableTo}
                  onValueChange={(value: "all" | "category" | "product") =>
                    setCurrentDiscount({
                      ...currentDiscount,
                      applicableTo: value,
                    })
                  }
                >
                  <SelectTrigger id="edit-applicableTo">
                    <SelectValue placeholder="Pilih cakupan diskon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Produk</SelectItem>
                    <SelectItem value="category">Kategori Tertentu</SelectItem>
                    <SelectItem value="product">Produk Tertentu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {currentDiscount.applicableTo !== "all" && (
                <div className="grid gap-2">
                  <Label htmlFor="edit-categoryOrProductId">
                    {currentDiscount.applicableTo === "category"
                      ? "Kategori"
                      : "ID Produk"}
                  </Label>
                  <Input
                    id="edit-categoryOrProductId"
                    value={currentDiscount.categoryOrProductId || ""}
                    onChange={(e) =>
                      setCurrentDiscount({
                        ...currentDiscount,
                        categoryOrProductId: e.target.value,
                      })
                    }
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="edit-usageLimit">Batas Penggunaan</Label>
                <Input
                  id="edit-usageLimit"
                  type="number"
                  value={currentDiscount.usageLimit}
                  onChange={(e) =>
                    setCurrentDiscount({
                      ...currentDiscount,
                      usageLimit: Number.parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={currentDiscount.isActive}
                  onCheckedChange={(checked) =>
                    setCurrentDiscount({
                      ...currentDiscount,
                      isActive: checked,
                    })
                  }
                />
                <Label htmlFor="edit-isActive">Aktif</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={editDiscount}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Hapus Diskon */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Diskon</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus diskon "{currentDiscount?.name}
              "?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Batal
            </Button>
            <Button variant="destructive" onClick={deleteDiscount}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
