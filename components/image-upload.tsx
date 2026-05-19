"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi
    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) onChange(data.url);
    } catch (e) {
      alert("Upload gagal");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Tab toggle */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={`px-3 py-1 text-sm rounded-md transition-all ${tab === "upload" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}>
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setTab("url")}
          className={`px-3 py-1 text-sm rounded-md transition-all ${tab === "url" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}>
          URL Gambar
        </button>
      </div>

      {tab === "upload" ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          {uploading ? (
            <div className="space-y-2">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-sm text-muted-foreground">Mengupload...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium">Klik untuk upload gambar</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, WEBP • Maks 5MB</p>
            </div>
          )}
        </div>
      ) : (
        <Input
          placeholder="https://example.com/gambar.jpg"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      )}

      {/* Preview */}
      {value && (
        <div className="relative rounded-lg overflow-hidden border bg-muted">
          <img src={value} alt="Preview" className="w-full h-40 object-cover" onError={e => (e.currentTarget.style.display = "none")} />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
