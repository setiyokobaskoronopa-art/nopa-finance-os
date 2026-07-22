// Supabase Edge Function: meta-conversions-send
// ============================================================================
// Dipanggil otomatis dari form "Buat Order" begitu order baru berhasil disimpan.
// Kirim event "Purchase" ke Meta Conversions API, supaya data pembelian asli
// bisa dipakai Meta buat optimasi campaign (lookalike audience, dst).
//
// PENTING SOAL PRIVASI: No. WA customer di-hash (SHA-256) di sini sebelum
// dikirim - tidak pernah dikirim dalam bentuk mentah/asli ke Meta.
// ============================================================================

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const META_GRAPH_VERSION = "v21.0";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface RequestBody {
  namaCustomer: string;
  noWa: string;
  amount: number;
  orderId: string;
}

// Normalisasi nomor WA ke format internasional (62xxx) sebelum di-hash,
// sesuai spesifikasi Meta buat matching yang akurat.
function normalizePhone(noWa: string): string {
  const digits = noWa.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return digits.startsWith("0") ? `62${digits.slice(1)}` : digits.startsWith("62") ? digits : `62${digits}`;
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: CORS_HEADERS });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: CORS_HEADERS });
    }

    const body: RequestBody = await req.json();

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: connection } = await admin
      .from("ad_connections")
      .select("pixel_id, pixel_access_token")
      .eq("user_id", user.id)
      .eq("platform", "Meta Ads")
      .maybeSingle();

    // Kalau Conversions API belum di-setup (Pixel ID/Token kosong), diamkan saja
    // (bukan error) - jangan sampai gagal kirim event ini bikin order gagal dibuat.
    if (!connection?.pixel_id || !connection?.pixel_access_token) {
      return new Response(JSON.stringify({ sent: false, reason: "Conversions API belum dikonfigurasi" }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const normalizedPhone = normalizePhone(body.noWa);
    const hashedPhone = normalizedPhone ? await sha256(normalizedPhone) : null;

    const eventPayload = {
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          action_source: "other",
          user_data: hashedPhone ? { ph: [hashedPhone] } : {},
          custom_data: {
            value: body.amount,
            currency: "IDR",
            order_id: body.orderId,
          },
        },
      ],
    };

    const metaUrl = `https://graph.facebook.com/${META_GRAPH_VERSION}/${connection.pixel_id}/events?access_token=${encodeURIComponent(connection.pixel_access_token)}`;

    const metaRes = await fetch(metaUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventPayload),
    });
    const metaJson = await metaRes.json();

    if (!metaRes.ok) {
      const message = metaJson?.error?.message ?? "Gagal kirim event ke Meta";
      return new Response(JSON.stringify({ sent: false, error: message }), {
        status: 200, // tetap 200 biar tidak ganggu alur buat order, error-nya dilaporkan di body
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ sent: true, result: metaJson }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ sent: false, error: (err as Error).message }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  }
});
