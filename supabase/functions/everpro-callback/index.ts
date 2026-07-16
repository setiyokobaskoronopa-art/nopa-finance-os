// Supabase Edge Function: everpro-callback
// ============================================================================
// Ini "pintu masuk" buat Everpro kirim update status pengiriman ke Nopa Finance OS.
// Daftarkan URL function ini di dashboard Everpro: Pengaturan > Konfigurasi
// Format URL: https://<project-ref>.supabase.co/functions/v1/everpro-callback?uid=<user_id kamu>
//
// Cara deploy: lihat instruksi di README bagian "Integrasi Everpro"
// ============================================================================

import { createClient } from "jsr:@supabase/supabase-js@2";

const EVERPRO_WEBHOOK_SECRET = Deno.env.get("EVERPRO_WEBHOOK_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Mapping tracking_code Everpro -> status Nopa Finance OS.
// Sumber: dokumentasi resmi Everpro Open API (Callback Tracking).
//
//   WAITING            -> order dibuat, nunggu pickup/drop off        -> On Proses
//   FAILED PICKUP      -> kurir gagal ambil paket                     -> Problem
//   PICKEDUP           -> sudah diambil kurir, dalam proses kirim     -> On Proses
//   IN PROCESS RETURN  -> sedang dalam proses balik ke pengirim       -> Return
//   DELIVERED          -> selesai, paket diterima                    -> Delivered
//   REJECTED           -> ditolak penerima (misal alamat salah)       -> Problem
//   IN TROUBLE         -> ada masalah teknis (misal Criss Cross)      -> Problem
//   CANCELED           -> order dibatalkan                           -> Problem
//   RETURN             -> selesai, paket balik ke pengirim            -> Return
//   LOST/BROKEN        -> selesai, paket hilang/rusak                 -> Problem
//   FORCE MAJEURE      -> tidak terkirim/balik karena force majeure   -> Problem
//
// Key di-normalisasi (huruf besar semua, tanpa spasi/underscore/garis miring)
// supaya tetap cocok apapun format persis yang Everpro kirim
// ("FAILED PICKUP" / "FAILED_PICKUP" / "FAILEDPICKUP" semua akan match).
const TRACKING_CODE_MAP: Record<string, string> = {
  WAITING: "On Proses",
  FAILEDPICKUP: "Problem",
  PICKEDUP: "On Proses",
  INPROCESSRETURN: "Return",
  DELIVERED: "Delivered",
  REJECTED: "Problem",
  INTROUBLE: "Problem",
  CANCELED: "Problem",
  CANCELLED: "Problem",
  RETURN: "Return",
  LOSTBROKEN: "Problem",
  FORCEMAJEURE: "Problem",
};

function normalizeTrackingCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z]/g, "");
}

interface EverproTrackingPayload {
  awb_number?: string;
  cancel_reason?: string;
  client_order_no?: string;
  order_reference_id?: string;
  tracking_code?: string;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  // 1. Validasi header rahasia dari Everpro
  const incomingKey = req.headers.get("x-everpro-key");
  if (!EVERPRO_WEBHOOK_SECRET || incomingKey !== EVERPRO_WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // 2. Ambil user_id target dari query string (?uid=...)
  const url = new URL(req.url);
  const userId = url.searchParams.get("uid");
  if (!userId) {
    return new Response(JSON.stringify({ error: "Missing uid parameter" }), { status: 400 });
  }

  let payload: EverproTrackingPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // 3. Coba cocokkan ke order yang sudah ada, berdasarkan awb_number
  let matchedOrderId: string | null = null;
  let matched = false;

  if (payload.awb_number) {
    const { data: existingOrder } = await supabase
      .from("sales_orders")
      .select("id, status")
      .eq("user_id", userId)
      .eq("awb_number", payload.awb_number)
      .maybeSingle();

    if (existingOrder) {
      matchedOrderId = existingOrder.id;
      const mappedStatus = payload.tracking_code ? TRACKING_CODE_MAP[normalizeTrackingCode(payload.tracking_code)] : undefined;

      if (mappedStatus) {
        await supabase.from("sales_orders").update({ status: mappedStatus }).eq("id", existingOrder.id);
        matched = true;
      }
    }
  }

  // 4. Selalu simpan log mentahnya, apapun hasilnya (buat audit + fallback manual)
  await supabase.from("everpro_callbacks").insert({
    user_id: userId,
    callback_type: "tracking",
    awb_number: payload.awb_number ?? null,
    client_order_no: payload.client_order_no ?? null,
    order_reference_id: payload.order_reference_id ?? null,
    tracking_code: payload.tracking_code ?? null,
    cancel_reason: payload.cancel_reason ?? null,
    raw_payload: payload,
    matched_order_id: matchedOrderId,
    matched,
  });

  // 5. Everpro wajib dapat HTTP 200 supaya tidak retry terus-menerus
  return new Response(JSON.stringify({ received: true, matched }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
