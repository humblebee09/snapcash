"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #2e7965 0%, #1a4d40 50%, #0f3028 100%)" }}>

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10" style={{ background: "#67ca30" }} />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full opacity-10" style={{ background: "#ff9700" }} />
        <div className="absolute top-1/2 left-1/4 w-40 h-40 rounded-full opacity-5" style={{ background: "#67ca30" }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              {/* Logo Icon */}
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl"
                style={{ background: "linear-gradient(135deg, #67ca30, #2e7965)" }}>
                <svg viewBox="0 0 40 40" className="w-12 h-12" fill="none">
                  <text x="2" y="30" fontSize="28" fontWeight="bold" fill="white">$</text>
                </svg>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            <span style={{ color: "#67ca30" }}>Snap</span>
            <span style={{ color: "#ff9700" }}>Cash</span>
          </h1>
          <p className="text-white/60 mt-1 text-sm font-medium tracking-widest uppercase">Quick · Easy · Snap</p>
        </div>

        <Card className="border-0 shadow-2xl" style={{ background: "rgba(255,255,255,0.97)" }}>
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center font-bold" style={{ color: "#2e7965" }}>Selamat Datang</CardTitle>
            <CardDescription className="text-center">Masuk untuk melanjutkan ke sistem kasir</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="font-medium">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input id="username" placeholder="Masukkan username" className="pl-10 h-11 border-2 focus:border-[#2e7965]" value={username} onChange={e => setUsername(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="Masukkan password" className="pl-10 pr-10 h-11 border-2 focus:border-[#2e7965]" value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 flex items-center gap-2">
                  <span>⚠️</span>{error}
                </div>
              )}
              <Button type="submit" className="w-full h-11 text-base font-semibold rounded-xl text-white border-0"
                style={{ background: loading ? "#ccc" : "linear-gradient(135deg, #2e7965, #67ca30)" }}
                disabled={loading}>
                {loading ? "Memproses..." : "Masuk →"}
              </Button>
            </form>

            <div className="mt-6 p-4 rounded-xl" style={{ background: "#f0faf5" }}>
              <p className="text-xs font-semibold mb-2" style={{ color: "#2e7965" }}>Akun Default:</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>👑 Owner: <span className="font-mono bg-white px-1.5 py-0.5 rounded">owner / owner123</span></p>
                <p>🛠️ Admin: <span className="font-mono bg-white px-1.5 py-0.5 rounded">admin / admin123</span></p>
                <p>👤 Karyawan: <span className="font-mono bg-white px-1.5 py-0.5 rounded">karyawan / karyawan123</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
