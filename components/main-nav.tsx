import Link from "next/link"
import { BarChart3, Home, Package, ShoppingCart, Tag, User, Warehouse } from "lucide-react"

export function MainNav() {
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link href="/dashboard" className="flex items-center text-sm font-medium transition-colors hover:text-primary">
        <Home className="mr-2 h-4 w-4" />
        Dashboard
      </Link>
      <Link
        href="/kasir"
        className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        Kasir
      </Link>
      <Link
        href="/produk"
        className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <Package className="mr-2 h-4 w-4" />
        Produk
      </Link>
      <Link
        href="/stok"
        className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <Warehouse className="mr-2 h-4 w-4" />
        Stok
      </Link>
      <Link
        href="/pelanggan"
        className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <User className="mr-2 h-4 w-4" />
        Pelanggan
      </Link>
      <Link
        href="/diskon"
        className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <Tag className="mr-2 h-4 w-4" />
        Diskon
      </Link>
      <Link
        href="/laporan"
        className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <BarChart3 className="mr-2 h-4 w-4" />
        Laporan
      </Link>
    </nav>
  )
}
