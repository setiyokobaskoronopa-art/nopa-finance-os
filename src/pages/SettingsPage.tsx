import { useRef, useState, useEffect } from "react";
import type { ComponentType, ReactNode } from "react";
import { Moon, Sun, Bell, Shield, Globe, CreditCard, Camera } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/authStore";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function SettingRow({
  icon: Icon,
  title,
  description,
  control,
}: {
  icon: ComponentType<{ size?: number }>;
  title: string;
  description: string;
  control: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-secondary-50 py-4 last:border-0 dark:border-secondary-800">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-100 text-secondary-600 dark:bg-secondary-800 dark:text-secondary-300">
          <Icon size={17} />
        </span>
        <div>
          <p className="text-sm font-medium text-secondary-900 dark:text-white">{title}</p>
          <p className="text-xs text-secondary-400">{description}</p>
        </div>
      </div>
      {control}
    </div>
  );
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const profile = useAuthStore((s) => s.profile);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const uploadAvatar = useAuthStore((s) => s.uploadAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [location, setLocation] = useState(profile.location);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(profile.name);
    setEmail(profile.email);
    setPhone(profile.phone);
    setLocation(profile.location);
  }, [profile]);

  const handleSave = () => {
    updateProfile({ name, email, phone, location });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadAvatar(file);
  };

  return (
    <div>
      <PageHeader title="Setting" description="Kelola profil, preferensi, dan tampilan aplikasi." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center pt-8 text-center">
            <div className="relative">
              <Avatar className="h-20 w-20">
                {profile.photo && <AvatarImage src={profile.photo} alt={profile.name} />}
                <AvatarFallback className="text-xl">{getInitials(profile.name || "U")}</AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-white shadow-soft transition-transform hover:scale-105"
                aria-label="Ganti foto profil"
              >
                <Camera size={13} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
            <p className="mt-4 text-base font-semibold text-secondary-900 dark:text-white">
              {profile.name || "Pengguna"}
            </p>
            <p className="text-xs text-secondary-400">{profile.role} — DVN Collagen & Ais Beauty</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => fileInputRef.current?.click()}>
              Ganti Foto Profil
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Profil</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-secondary-500">Nama Lengkap</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-secondary-500">Email</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-secondary-500">No. Telepon</label>
                <Input
                  placeholder="+62 812-xxxx-xxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-secondary-500">Lokasi</label>
                <Input
                  placeholder="Kota, Provinsi"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2 flex items-center justify-end gap-3">
                {saved && <span className="text-xs font-medium text-success-600">Tersimpan ✓</span>}
                <Button size="sm" onClick={handleSave}>
                  Simpan Perubahan
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferensi</CardTitle>
            </CardHeader>
            <CardContent className="divide-y-0">
              <SettingRow
                icon={theme === "dark" ? Moon : Sun}
                title="Mode Tampilan"
                description={theme === "dark" ? "Dark mode aktif" : "Light mode aktif"}
                control={<Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />}
              />
              <SettingRow
                icon={Bell}
                title="Notifikasi"
                description="Terima notifikasi transaksi & budget"
                control={<Switch defaultChecked />}
              />
              <SettingRow
                icon={Shield}
                title="Autentikasi Dua Faktor"
                description="Tingkatkan keamanan akun Anda"
                control={<Switch />}
              />
              <SettingRow
                icon={Globe}
                title="Bahasa"
                description="Bahasa Indonesia"
                control={
                  <Button variant="outline" size="sm">
                    Ubah
                  </Button>
                }
              />
              <SettingRow
                icon={CreditCard}
                title="Metode Pembayaran"
                description="Kelola kartu & rekening tersimpan"
                control={
                  <Button variant="outline" size="sm">
                    Kelola
                  </Button>
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
