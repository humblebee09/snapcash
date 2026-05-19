"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function UserNav() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => { if (!d.error) setUser(d); });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const roleLabel = (role: string) => {
    switch (role) {
      case "owner": return "👑 Owner";
      case "admin": return "🛠️ Admin";
      default: return "👤 Karyawan";
    }
  };

  return (
    <div className="flex items-center gap-2 p-3">
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
        style={{ background: "linear-gradient(135deg, #ff9700, #67ca30)" }}>
        {user?.name?.charAt(0).toUpperCase() || "U"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate text-white">{user?.name || "..."}</p>
        <p className="text-xs truncate text-white/70">{user ? roleLabel(user.role) : ""}</p>
      </div>
      <button
        onClick={handleLogout}
        title="Logout"
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
        style={{ background: "#2e7965" }}>
        <LogOut className="h-4 w-4 text-white" />
      </button>
    </div>
  );
}
