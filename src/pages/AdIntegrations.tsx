import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Radio, Search, Music2, CheckCircle2, PlugZap, Clock } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConnectAdPlatformDialog } from "@/components/dashboard/ConnectAdPlatformDialog";
import { useAdConnectionsStore, type AdPlatform } from "@/store/adConnectionsStore";

const PLATFORMS: { platform: AdPlatform; icon: React.ElementType; color: string; desc: string; pending?: boolean }[] = [
  { platform: "Meta Ads", icon: Radio, color: "#1877F2", desc: "Facebook & Instagram Ads Manager" },
  { platform: "TikTok Ads", icon: Music2, color: "#000000", desc: "TikTok for Business" },
  { platform: "Google Ads", icon: Search, color: "#4285F4", desc: "Menunggu approval Basic Access", pending: true },
];

export default function AdIntegrations() {
  const navigate = useNavigate();
  const connections = useAdConnectionsStore((s) => s.items);
  const [dialogPlatform, setDialogPlatform] = useState<AdPlatform | null>(null);

  const getConnection = (platform: AdPlatform) => connections.find((c) => c.platform === platform);

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={() => navigate("/performa-ads")} className="mb-4">
        <ArrowLeft size={15} /> Kembali ke Performa Ads
      </Button>

      <PageHeader
        title="Integrasi Ads"
        description="Hubungkan akun Meta Ads, Google Ads, dan TikTok Ads untuk tarik data performa otomatis."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {PLATFORMS.map(({ platform, icon: Icon, color, desc, pending }) => {
          const conn = getConnection(platform);
          const isConnected = Boolean(conn);

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

                <Button
                  size="sm"
                  variant={isConnected ? "outline" : "default"}
                  className="mt-4 w-full"
                  onClick={() => setDialogPlatform(platform)}
                >
                  <PlugZap size={14} /> {isConnected ? "Kelola Koneksi" : "Hubungkan"}
                </Button>
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
