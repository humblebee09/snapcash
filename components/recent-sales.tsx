import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatRupiah } from "@/lib/utils"

export function RecentSales() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
          <AvatarFallback>BH</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Budi Hartono</p>
          <p className="text-sm text-muted-foreground">budi@example.com</p>
        </div>
        <div className="ml-auto font-medium">{formatRupiah(45000)}</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
          <AvatarFallback>SW</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Siti Wijaya</p>
          <p className="text-sm text-muted-foreground">siti@example.com</p>
        </div>
        <div className="ml-auto font-medium">{formatRupiah(78000)}</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
          <AvatarFallback>DP</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Deni Pratama</p>
          <p className="text-sm text-muted-foreground">deni@example.com</p>
        </div>
        <div className="ml-auto font-medium">{formatRupiah(32000)}</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
          <AvatarFallback>AR</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Ani Rahayu</p>
          <p className="text-sm text-muted-foreground">ani@example.com</p>
        </div>
        <div className="ml-auto font-medium">{formatRupiah(56000)}</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
          <AvatarFallback>RS</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Rudi Santoso</p>
          <p className="text-sm text-muted-foreground">rudi@example.com</p>
        </div>
        <div className="ml-auto font-medium">{formatRupiah(65000)}</div>
      </div>
    </div>
  )
}
