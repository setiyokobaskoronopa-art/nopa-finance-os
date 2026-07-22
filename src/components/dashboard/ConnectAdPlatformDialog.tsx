import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAdConnectionsStore, type AdPlatform, type AdConnection } from "@/store/adConnectionsStore";

interface ConnectAdPlatformDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: AdPlatform;
  existing?: AdConnection | null;
}

const PLATFORM_CONFIG: Record<
  AdPlatform,
  {
    accountLabel: string;
    accountPlaceholder: string;
    tokenLabel: string;
    tokenPlaceholder: string;
    hasSecondary: boolean;
    secondaryLabel?: string;
    secondaryPlaceholder?: string;
    disabled?: boolean;
    disabledNote?: string;
  }
> = {
  "Meta Ads": {
    accountLabel: "Ad Account ID",
    accountPlaceholder: "Contoh: act_1234567890",
    tokenLabel: "Access Token",
    tokenPlaceholder: "System User Access Token dari Business Settings",
    hasSecondary: false,
  },
  "TikTok Ads": {
    accountLabel: "Advertiser ID",
    accountPlaceholder: "Contoh: 7123456789012345",
    tokenLabel: "Access Token",
    tokenPlaceholder: "Access Token dari TikTok for Business",
    hasSecondary: false,
  },
  "Google Ads": {
    accountLabel: "Customer ID",
    accountPlaceholder: "Contoh: 123-456-7890",
    tokenLabel: "Refresh Token",
    tokenPlaceholder: "OAuth Refresh Token",
    hasSecondary: true,
    secondaryLabel: "Developer Token",
    secondaryPlaceholder: "Dari Google Ads Manager > API Center",
    disabled: true,
    disabledNote: "Belum bisa aktif — masih menunggu approval Basic Access dari Google. Boleh diisi duluan biar siap begitu approved.",
  },
};

export function ConnectAdPlatformDialog({ open, onOpenChange, platform, existing }: ConnectAdPlatformDialogProps) {
  const saveConnection = useAdConnectionsStore((s) => s.saveConnection);
  const disconnect = useAdConnectionsStore((s) => s.disconnect);
  const config = PLATFORM_CONFIG[platform];

  const [accountId, setAccountId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [secondaryToken, setSecondaryToken] = useState("");

  useEffect(() => {
    if (!open) return;
    setAccountId(existing?.accountId ?? "");
    setAccessToken(existing?.accessToken ?? "");
    setSecondaryToken(existing?.secondaryToken ?? "");
  }, [open, existing]);

  const handleSave = () => {
    if (!accountId.trim() || !accessToken.trim()) return;
    saveConnection(platform, accountId.trim(), accessToken.trim(), config.hasSecondary ? secondaryToken.trim() : null);
    onOpenChange(false);
  };

  const handleDisconnect = () => {
    disconnect(platform);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hubungkan {platform}</DialogTitle>
          <DialogDescription>
            Kredensial disimpan aman di database kamu sendiri (dilindungi RLS, cuma akun kamu yang bisa akses).
          </DialogDescription>
        </DialogHeader>

        {config.disabled && (
          <div className="rounded-xl bg-warning-50 px-3.5 py-2.5 text-xs text-warning-700 dark:bg-warning-500/10 dark:text-warning-400">
            {config.disabledNote}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary-500">{config.accountLabel}</label>
            <Input value={accountId} onChange={(e) => setAccountId(e.target.value)} placeholder={config.accountPlaceholder} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary-500">{config.tokenLabel}</label>
            <Input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder={config.tokenPlaceholder}
            />
          </div>
          {config.hasSecondary && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary-500">{config.secondaryLabel}</label>
              <Input
                type="password"
                value={secondaryToken}
                onChange={(e) => setSecondaryToken(e.target.value)}
                placeholder={config.secondaryPlaceholder}
              />
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          {existing && (
            <Button variant="ghost" size="sm" onClick={handleDisconnect} className="text-danger-600">
              Putuskan Koneksi
            </Button>
          )}
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button onClick={handleSave}>Simpan</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
