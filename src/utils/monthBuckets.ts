export interface MonthBucket {
  label: string;
  month: number;
  year: number;
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export function getLastNMonths(n: number, reference: Date = new Date()): MonthBucket[] {
  const buckets: MonthBucket[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(reference.getFullYear(), reference.getMonth() - i, 1);
    buckets.push({ label: MONTH_LABELS[d.getMonth()], month: d.getMonth(), year: d.getFullYear() });
  }
  return buckets;
}

export function isInBucket(dateStr: string, bucket: MonthBucket): boolean {
  const parts = dateStr.split("/");
  if (parts.length !== 3) return false;
  const month = Number(parts[1]) - 1;
  const year = Number(parts[2]);
  return month === bucket.month && year === bucket.year;
}
