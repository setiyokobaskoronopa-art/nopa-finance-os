/** Bikin link wa.me dari nomor Indonesia (0812... atau 62812... atau ada spasi/strip). */
export function buildWhatsAppLink(noWa: string, message?: string): string | null {
  const digits = noWa.replace(/[^0-9]/g, "");
  if (!digits) return null;
  const normalized = digits.startsWith("0") ? `62${digits.slice(1)}` : digits.startsWith("62") ? digits : `62${digits}`;
  const base = `https://wa.me/${normalized}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
