import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Radio, Search, Music2, CheckCircle2, PlugZap, Clock, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConnectAdPlatformDialog } from "@/components/dashboard/ConnectAdPlatformDialog";
import { useAdConnectionsStore, type AdPlatform } from "@/store/adConnectionsStore";
import { useAdPerformanceStore } from "@/store/adPerformanceStore";
import { supabase } from "@/lib/supabase";

const PLATFORMS: { platform: AdPlatform; icon: React.ElementType; color: string; desc: string; pending?: boolean; syncable?: boolean }[] = [
  { platform: "Meta Ads", icon: Radio, color: "#1877F2", desc: "Facebook & Instagram Ads Manager", syncable: true },
  { platform: "TikTok Ads", icon: Music2, color: "#000000", desc: "TikTok for Business" },
  { platform: "Google Ads", icon: Search, color: "#4285F4", desc: "Menunggu approval Basic Access", pending: true },
];

export default function AdIntegrations() {
  const navigate = useNavigate();
  const connections = useAdConnectionsStore((s) => s.items);
  const fetchAdPerformance = useAdPerformanceStore((s) => s.fetchItems);
  const [dialogPlatform, setDialogPlatform] = useState<AdPlatform | null>(null);
  const [syncing, setSyncing] = useState<AdPlatform | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const getConnection = (platform: AdPlatform) => connections.find((c) => c.platform === platform);

  const handleSync = async (platform: AdPlatform) => {
    setSyncing(platform);
    setSyncMessage(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setSyncMessage("Sesi login tidak ditemukan, coba refresh halaman.");
        return;
      }
      const functionName = platform === "Meta Ads" ? "meta-ads-sync" : "";
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) {
        setSyncMessage(json.error || "Sinkron gagal, coba lagi.");
        return;
      }
      setSyncMessage(`Berhasil sinkron ${json.synced ?? 0} baris data.`);
      await fetchAdPerformance();
    } catch (err) {
      setSyncMessage(`Terjadi kesalahan: ${(err as Error).message}`);
    } finally {
      setSyncing(null);
    }
  };

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={() => navigate("/performa-ads")} className="mb-4">
        <ArrowLeft size={15} /> Kembali ke Performa Ads
      </Button>

      <PageHeader
        title="Integrasi Ads"
        description="Hubungkan akun Meta Ads, Google Ads, dan TikTok Ads untuk tarik data performa otomatis."
      />

      {syncMessage && (
        <div className="mt-4 rounded-2xl border border-primary-100 bg-primary-50/60 px-4 py-3 text-xs text-primary-700 dark:border-primary-500/20 dark:bg-primary-500/5 dark:text-primary-300">
          {syncMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {PLATFORMS.map(({ platform, icon: Icon, color, desc, pending, syncable }) => {
          const conn = getConnection(platform);
          const isConnected = Boolean(conn);
          const isSyncing = syncing === platform;

          return (
            <Card key={platform}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-2xl text-white"
                    style={{ backgroundColor: color }}
                  >
                    <Icon size={20} />
                  </span>
                  {isConnected ? (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle2 size={11} /> Terhubung
                    </Badge>
                  ) : pending ? (
                    <Badge variant="warning" className="gap-1">
                      <Clock size={11} /> Nunggu Approval
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Belum Terhubung</Badge>
                  )}
                </div>

                <h3 className="mt-4 text-sm font-semibold text-secondary-900 dark:text-white">{platform}</h3>
                <p className="mt-0.5 text-xs text-secondary-400">{desc}</p>

                {isConnected && conn && (
                  <p className="mt-2 truncate text-[11px] text-secondary-400">
                    Akun: <span className="font-mono">{conn.accountId}</span>
                  </p>
                )}

                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant={isConnected ? "outline" : "default"}
                    className="flex-1"
                    onClick={() => setDialogPlatform(platform)}
                  >
                    <PlugZap size={14} /> {isConnected ? "Kelola" : "Hubungkan"}
                  </Button>
                  {isConnected && syncable && (
                    <Button size="sm" onClick={() => handleSync(platform)} disabled={isSyncing} className="flex-1">
                      <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
                      {isSyncing ? "Sinkron..." : "Sinkron"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {dialogPlatform && (
        <ConnectAdPlatformDialog
          open={Boolean(dialogPlatform)}
          onOpenChange={(v) => !v && setDialogPlatform(null)}
          platform={dialogPlatform}
          existing={getConnection(dialogPlatform)}
        />
      )}
    </div>
  );
}
