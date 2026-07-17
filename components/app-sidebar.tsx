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
      <div className="md:hidden fixed top-3 left-3 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="icon" style={{background: "#2E5E54", border: "none", color: "white"}}>
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent data-mobile-nav side="left" className="p-0 border-0" style={{background: "#2E5E54", width: "260px"}}>
            <SheetTitle className="sr-only">menu</SheetTitle>
            {/* Mobile Header */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-white/20">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xl shadow-lg" style={{background: "rgba(255,255,255,0.2)"}}>
                <span style={{color: "white"}}>$</span>
              </div>
              <div>
                <h1 className="text-lg font-black leading-none">
                  <span style={{color: "white"}}>Snap</span><span style={{color: "#fff9e6"}}>Cash</span>
                </h1>
                <p className="text-xs font-medium" style={{color: "rgba(255,255,255,0.7)"}}>POS System</p>
              </div>
            </div>
            <SidebarContentMenu
              isActive={isActive}
              onNavigate={() => setOpen(false)}
            />
            {/* Mobile UserNav */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-white/20">
              <UserNav />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden md:block">
        <Sidebar style={{background: "#2E5E54"}}>
          <style>{`[data-sidebar="sidebar"] { background: #2E5E54 !important; }`}</style>
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
