import { useState } from "react";
import { Menu, Search, Bell, Sun, Moon, ChevronDown, LogOut, Settings, UserCircle } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Input } from "@/components/ui/Input";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";
import { NotificationPanel } from "@/components/layout/NotificationPanel";
import { formatDateLong } from "@/utils/format";

export function Topbar({ onOpenMobileSidebar }: { onOpenMobileSidebar: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center gap-3 border-b border-secondary-100/80 bg-white/80 px-4 backdrop-blur-xl dark:border-secondary-800 dark:bg-secondary-900/80 sm:px-6">
      <button
        onClick={onOpenMobileSidebar}
        className="rounded-lg p-2 text-secondary-500 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-800 lg:hidden"
      >
        <Menu size={20} />
      </button>

      <div className="hidden flex-col sm:flex">
        <p className="text-xs font-medium text-secondary-400">{formatDateLong()}</p>
      </div>

      <div className="relative ml-auto flex max-w-md flex-1 items-center sm:ml-6">
        <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-secondary-400" />
        <Input
          placeholder="Cari transaksi, produk, customer..."
          className="pl-10"
        />
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={toggleTheme}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-secondary-500 transition-colors hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-800"
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-secondary-500 transition-colors hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-800"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger-500 ring-2 ring-white dark:ring-secondary-900" />
          </button>
          <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 transition-colors hover:bg-secondary-100 dark:hover:bg-secondary-800">
              <Avatar className="h-8 w-8">
                <AvatarFallback>NS</AvatarFallback>
              </Avatar>
              <div className="hidden text-left leading-tight md:block">
                <p className="text-sm font-semibold text-secondary-900 dark:text-white">Nopa Setiyoko</p>
                <p className="text-[11px] text-secondary-400">Owner</p>
              </div>
              <ChevronDown size={14} className="hidden text-secondary-400 md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
            <DropdownMenuItem>
              <UserCircle size={16} /> Profil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings size={16} /> Pengaturan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-danger-600 focus:bg-danger-50 dark:focus:bg-danger-500/10">
              <LogOut size={16} /> Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
