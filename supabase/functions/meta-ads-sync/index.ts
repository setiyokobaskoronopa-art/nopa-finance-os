// Supabase Edge Function: meta-ads-sync
// ============================================================================
// Dipanggil dari tombol "Sinkron Sekarang" di halaman Performa Ads.
// Ambil Access Token & Ad Account ID milik user yang login (dari tabel
// ad_connections), lalu tarik data campaign insights 30 hari terakhir dari
// Meta Marketing API, dan simpan/perbarui ke tabel ad_performance.
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

interface MetaInsightRow {
  campaign_name?: string;
  spend?: string;
  impressions?: string;
  clicks?: string;
  date_start?: string;
  actions?: { action_type: string; value: string }[];
  action_values?: { action_type: string; value: string }[];
}

// Tipe action Meta yang dihitung sebagai "conversion" - disesuaikan lagi nanti
// setelah lihat data asli, karena tiap advertiser bisa beda setup pixel-nya.
const CONVERSION_ACTION_TYPES = [
  "purchase",
  "offsite_conversion.fb_pixel_purchase",
  "onsite_web_purchase",
  "omni_purchase",
];

function sumActions(actions: MetaInsightRow["actions"]): number {
  if (!actions) return 0;
  return actions
    .filter((a) => CONVERSION_ACTION_TYPES.includes(a.action_type))
    .reduce((sum, a) => sum + (Number(a.value) || 0), 0);
}

function isoToDateSlash(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: CORS_HEADERS });
  }

  try {
    // 1. Identifikasi user yang login dari token Authorization
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

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 2. Ambil kredensial Meta Ads milik user ini
    const { data: connection, error: connError } = await admin
      .from("ad_connections")
      .select("*")
      .eq("user_id", user.id)
      .eq("platform", "Meta Ads")
      .maybeSingle();

    if (connError || !connection) {
      return new Response(
        JSON.stringify({ error: "Meta Ads belum terhubung. Hubungkan dulu di halaman Integrasi Ads." }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const accountId = connection.account_id.startsWith("act_")
      ? connection.account_id
      : `act_${connection.account_id}`;

    // 3. Panggil Meta Marketing API - insight per campaign, per hari, 30 hari terakhir,
    //    cuma campaign yang statusnya ACTIVE (bukan paused/selesai/dihapus)
    const fields = "campaign_name,spend,impressions,clicks,actions,action_values,date_start";
    const filtering = encodeURIComponent(JSON.stringify([{ field: "campaign.effective_status", operator: "IN", value: ["ACTIVE"] }]));
    const metaUrl =
      `https://graph.facebook.com/${META_GRAPH_VERSION}/${accountId}/insights` +
      `?level=campaign&time_increment=1&date_preset=last_30d&fields=${fields}&filtering=${filtering}` +
      `&access_token=${encodeURIComponent(connection.access_token)}&limit=500`;

    const metaRes = await fetch(metaUrl);
    const metaJson = await metaRes.json();

    if (!metaRes.ok) {
      const message = metaJson?.error?.message ?? "Gagal mengambil data dari Meta";
      return new Response(JSON.stringify({ error: `Meta API error: ${message}` }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    const insights: MetaInsightRow[] = metaJson.data ?? [];

    if (insights.length === 0) {
      return new Response(JSON.stringify({ synced: 0, message: "Tidak ada data campaign dalam 30 hari terakhir." }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // 4. Petakan ke format ad_performance, lalu upsert (biar tidak dobel kalau disinkron berkali-kali)
    const rows = insights.map((row) => ({
      user_id: user.id,
      platform: "Meta Ads",
      nama_campaign: row.campaign_name || "Tanpa Nama Campaign",
      tanggal: row.date_start ? isoToDateSlash(row.date_start) : "",
      spend: Number(row.spend) || 0,
      impressions: Number(row.impressions) || 0,
      clicks: Number(row.clicks) || 0,
      conversions: sumActions(row.actions),
      revenue: sumActions(row.action_values),
      sumber: "API",
    }));

    const { error: upsertError } = await admin
      .from("ad_performance")
      .upsert(rows, { onConflict: "user_id,platform,nama_campaign,tanggal" });

    if (upsertError) {
      return new Response(JSON.stringify({ error: `Gagal simpan ke database: ${upsertError.message}` }), {
        status: 500,
        headers: CORS_HEADERS,
      });
    }

    return new Response(JSON.stringify({ synced: rows.length }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: `Unexpected error: ${(err as Error).message}` }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
});
