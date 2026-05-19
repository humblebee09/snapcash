"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Coffee,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Tag,
  User,
  Utensils,
  Warehouse,
  Menu,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"; // jika Sidebar berbasis Sheet
import { useState } from "react";

export function AppSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <>
      {/* Sidebar trigger for mobile */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0">
            <SheetTitle className="sr-only">menu</SheetTitle>
            <SidebarContentMenu
              isActive={isActive}
              onNavigate={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden md:block">
        <Sidebar >
          <style>{`[data-sidebar="sidebar"] { background: linear-gradient(180deg, #ff9700 0%, #67ca30 50%, #2e7965 100%) !important; }`}</style>
          <SidebarHeader className="border-b border-white/20 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xl shadow-lg" style={{background: "#2E5E54"}}>
                <span style={{color: "white"}}>$</span>
              </div>
              <div>
                <h1 className="text-lg font-black leading-none">
                  <span style={{color: "white"}}>Snap</span><span style={{color: "#fff9e6"}}>Cash</span>
                </h1>
                <p className="text-xs font-medium" style={{color: "rgba(255,255,255,0.7)"}}>POS System</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContentMenu isActive={isActive} />
          <SidebarFooter className="border-t border-white/20">
            <UserNav />
          </SidebarFooter>
        </Sidebar>
      </div>
    </>
  );
}

// Ekstrak menu ke komponen reusable
function SidebarContentMenu({
  isActive,
  onNavigate,
}: {
  isActive: (path: string) => boolean;
  onNavigate?: () => void;
}) {
  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Kasir", icon: ShoppingCart, path: "/kasir" },
    { label: "Manajemen Meja", icon: Utensils, path: "/meja" },
    { label: "Produk", icon: Package, path: "/produk" },
    { label: "Stok", icon: Warehouse, path: "/stok" },
    { label: "Pelanggan", icon: User, path: "/pelanggan" },
    { label: "Diskon", icon: Tag, path: "/diskon" },
    { label: "Laporan", icon: BarChart3, path: "/laporan" },
  ];
  return (
    <SidebarContent style={{background: "transparent", color: "white"}}>
      <SidebarMenu>
        {menuItems.map(({ label, icon: Icon, path }) => (
          <SidebarMenuItem key={path}>
            <SidebarMenuButton asChild isActive={isActive(path)} style={{background: isActive(path) ? "rgba(255,255,255,0.15)" : "transparent"}}>
              <Link href={path} onClick={onNavigate} style={{color: "white", fontWeight: "600"}}>
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarContent>
  );
}
