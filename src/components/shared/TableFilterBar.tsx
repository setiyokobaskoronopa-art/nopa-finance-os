import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { DateInput } from "@/components/ui/DateInput";
import { Button } from "@/components/ui/Button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";

export interface FilterSelectConfig {
  key: string;
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}

interface TableFilterBarProps {
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  selects?: FilterSelectConfig[];
  onReset: () => void;
  active: boolean;
}

const ALL = "Semua";

export function TableFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Cari...",
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  selects = [],
  onReset,
  active,
}: TableFilterBarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-2.5 rounded-2xl border border-secondary-100 bg-white p-3.5 dark:border-secondary-800 dark:bg-secondary-900">
      {onSearchChange && (
        <div className="relative min-w-[180px] flex-1">
          <label className="mb-1.5 block text-[11px] font-medium text-secondary-400">Cari</label>
          <Search className="pointer-events-none absolute left-3 top-[34px] h-3.5 w-3.5 text-secondary-400" />
          <Input
            value={searchValue ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-8"
          />
        </div>
      )}

      <div className="min-w-[130px]">
        <label className="mb-1.5 block text-[11px] font-medium text-secondary-400">Dari Tanggal</label>
        <DateInput value={dateFrom} onChange={onDateFromChange} />
      </div>
      <div className="min-w-[130px]">
        <label className="mb-1.5 block text-[11px] font-medium text-secondary-400">Sampai Tanggal</label>
        <DateInput value={dateTo} onChange={onDateToChange} />
      </div>

      {selects.map((s) => (
        <div key={s.key} className="min-w-[130px]">
          <label className="mb-1.5 block text-[11px] font-medium text-secondary-400">{s.label}</label>
          <Select value={s.value} onValueChange={s.onChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{ALL}</SelectItem>
              {s.options.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}

      {active && (
        <Button variant="ghost" size="sm" onClick={onReset} className="mb-0.5">
          <X size={14} /> Reset
        </Button>
      )}
      {!active && (
        <span className="mb-2.5 flex items-center gap-1 text-[11px] text-secondary-300">
          <SlidersHorizontal size={12} /> Belum ada filter
        </span>
      )}
    </div>
  );
}

export { ALL as FILTER_ALL };
