/** Kunci unik customer: dari No. WA kalau ada, kalau tidak dari Nama. Dipakai konsisten
 * di halaman daftar Customer dan halaman detail, biar order yang sama selalu terkelompok
 * ke customer yang sama. */
export function getCustomerKey(noWa: string, namaCustomer: string): string {
  return (noWa.trim() || namaCustomer.trim()).toLowerCase();
}
