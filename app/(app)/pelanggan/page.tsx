"use client";

import { useState, useEffect } from "react";
import { Edit, MoreHorizontal, Plus, Search, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  totalSpent: number;
  membershipLevel: string;
  lastVisit: string;
}

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", email: "", address: "" });

  useEffect(() => { fetchCustomers() }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    const res = await fetch("/api/customers");
    const data = await res.json();
    setCustomers(data);
    setLoading(false);
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addCustomer = async () => {
    await fetch("/api/customers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newCustomer) });
    setNewCustomer({ name: "", phone: "", email: "", address: "" });
    setIsAddDialogOpen(false);
    fetchCustomers();
  };

  const editCustomer = async () => {
    if (!currentCustomer) return;
    await fetch(`/api/customers/${currentCustomer.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(currentCustomer) });
    setIsEditDialogOpen(false);
    fetchCustomers();
  };

  const deleteCustomer = async () => {
    if (!currentCustomer) return;
    await fetch(`/api/customers/${currentCustomer.id}`, { method: "DELETE" });
    setIsDeleteDialogOpen(false);
    fetchCustomers();
  };

  const getMembershipColor = (level: string) => {
    switch (level) {
      case "platinum": return "bg-purple-100 text-purple-800";
      case "gold": return "bg-yellow-100 text-yellow-800";
      case "silver": return "bg-gray-100 text-gray-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const formatDate = (date: string) => new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(date));

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Manajemen Pelanggan</h1>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Cari pelanggan..." className="w-full pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Tambah Pelanggan</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Tambah Pelanggan Baru</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2"><Label>Nama</Label><Input value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} /></div>
                <div className="grid gap-2"><Label>Telepon</Label><Input value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} /></div>
                <div className="grid gap-2"><Label>Email</Label><Input value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} /></div>
                <div className="grid gap-2"><Label>Alamat</Label><Input value={newCustomer.address} onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={addCustomer}>Simpan</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center p-8"><p className="text-muted-foreground">Memuat data...</p></div>
        ) : (
          <Card>
            <CardHeader><CardTitle>Daftar Pelanggan</CardTitle><CardDescription>Kelola semua pelanggan terdaftar</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead><TableHead>Telepon</TableHead><TableHead>Email</TableHead>
                    <TableHead>Level</TableHead><TableHead>Total Belanja</TableHead><TableHead>Kunjungan Terakhir</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell><Badge className={getMembershipColor(customer.membershipLevel)}>{customer.membershipLevel.charAt(0).toUpperCase() + customer.membershipLevel.slice(1)}</Badge></TableCell>
                      <TableCell>{formatRupiah(customer.totalSpent)}</TableCell>
                      <TableCell>{formatDate(customer.lastVisit)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => { setCurrentCustomer(customer); setIsEditDialogOpen(true); }}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setCurrentCustomer(customer); setIsDeleteDialogOpen(true); }}><Trash2 className="mr-2 h-4 w-4" />Hapus</DropdownMenuItem>
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
      </main>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Pelanggan</DialogTitle></DialogHeader>
          {currentCustomer && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label>Nama</Label><Input value={currentCustomer.name} onChange={(e) => setCurrentCustomer({ ...currentCustomer, name: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Telepon</Label><Input value={currentCustomer.phone} onChange={(e) => setCurrentCustomer({ ...currentCustomer, phone: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Email</Label><Input value={currentCustomer.email} onChange={(e) => setCurrentCustomer({ ...currentCustomer, email: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Alamat</Label><Input value={currentCustomer.address} onChange={(e) => setCurrentCustomer({ ...currentCustomer, address: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter><Button onClick={editCustomer}>Simpan Perubahan</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Hapus Pelanggan</DialogTitle><DialogDescription>Yakin ingin menghapus "{currentCustomer?.name}"?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={deleteCustomer}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
