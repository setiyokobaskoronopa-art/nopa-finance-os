import type { ComponentType, ReactNode } from "react";
import { Moon, Sun, Bell, Shield, Globe, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { useTheme } from "@/hooks/useTheme";

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

  return (
    <div>
      <PageHeader title="Setting" description="Kelola profil, preferensi, dan tampilan aplikasi." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center pt-8 text-center">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-xl">NS</AvatarFallback>
            </Avatar>
            <p className="mt-4 text-base font-semibold text-secondary-900 dark:text-white">
              Nopa Setiyoko Baskoro
            </p>
            <p className="text-xs text-secondary-400">Owner — DVN Collagen & Ais Beauty</p>
            <Button variant="outline" size="sm" className="mt-4">
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
                <Input defaultValue="Nopa Setiyoko Baskoro" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-secondary-500">Email</label>
                <Input defaultValue="nopa@dvncollagen.com" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-secondary-500">No. Telepon</label>
                <Input defaultValue="+62 812-xxxx-xxxx" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-secondary-500">Lokasi</label>
                <Input defaultValue="Depok, Sleman, Yogyakarta" />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button size="sm">Simpan Perubahan</Button>
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
