// "Ürün bozulmak üzere" e-posta bildirimi — Resend üzerinden gönderir.
//
// Bu fonksiyon veritabanına kendi sorgusunu atmaz: frontend zaten
// getExpiringItems(userId) ile bozulacak ürünleri çekip bu fonksiyona
// gönderir. Böylece service-role/admin erişimine ihtiyaç duyulmaz.
//
// İstek gövdesi: { to: string, isim?: string, items: [{ urun_adi, son_kullanma_tarihi, miktar?, birim? }] }
// Yanıt: 200 { success: true, id } | 400/502/500 { success: false, error }

import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM = "SmartPlate AI <onboarding@resend.dev>";

interface ExpiringItem {
  urun_adi: string;
  son_kullanma_tarihi: string;
  miktar?: string | number;
  birim?: string;
}

interface RequestBody {
  to?: string;
  isim?: string;
  items?: ExpiringItem[];
}

function formatTarih(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function buildEmailHtml(isim: string | undefined, items: ExpiringItem[]): string {
  const siraliUrunler = [...items].sort((a, b) => a.son_kullanma_tarihi.localeCompare(b.son_kullanma_tarihi));

  const urunSatirlari = siraliUrunler
    .map((item) => {
      const miktarBirim = item.miktar && item.birim ? ` (${item.miktar} ${item.birim})` : "";
      return `<li>${item.urun_adi}${miktarBirim} — son kullanma tarihi: <strong>${formatTarih(item.son_kullanma_tarihi)}</strong></li>`;
    })
    .join("");

  const selamlama = isim ? `Merhaba ${isim},` : "Merhaba,";

  return `
    <div style="font-family: sans-serif; line-height: 1.5;">
      <p>${selamlama}</p>
      <p>Buzdolabındaki aşağıdaki ürünlerin son kullanma tarihi yaklaşıyor:</p>
      <ul>${urunSatirlari}</ul>
      <p>İsraf olmasın diye bu ürünleri kullanan tarif önerilerine SmartPlate AI'dan göz atabilirsin.</p>
      <p style="color: #888; font-size: 12px;">Bu e-posta SmartPlate AI tarafından otomatik gönderilmiştir.</p>
    </div>
  `;
}

export default {
  fetch: withSupabase({ auth: "publishable" }, async (req, _ctx) => {
    if (req.method !== "POST") {
      return Response.json({ success: false, error: "Sadece POST desteklenir" }, { status: 405 });
    }

    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return Response.json({ success: false, error: "Geçersiz JSON gövdesi" }, { status: 400 });
    }

    const { to, isim, items } = body;
    if (!to || !items || items.length === 0) {
      return Response.json({ success: false, error: "to ve items alanları zorunludur" }, { status: 400 });
    }

    if (!RESEND_API_KEY) {
      return Response.json({ success: false, error: "RESEND_API_KEY yapılandırılmamış" }, { status: 500 });
    }

    try {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: RESEND_FROM,
          to: [to],
          subject: "SmartPlate AI – Ürünleriniz bozulmaya yakın!",
          html: buildEmailHtml(isim, items),
        }),
      });

      const resendJson = await resendRes.json();

      if (!resendRes.ok) {
        return Response.json(
          { success: false, error: resendJson?.message ?? "Resend API hatası" },
          { status: 502 },
        );
      }

      return Response.json({ success: true, id: resendJson.id });
    } catch (err) {
      return Response.json(
        { success: false, error: err instanceof Error ? err.message : "Beklenmeyen hata" },
        { status: 500 },
      );
    }
  }),
};

/* Yerel test için:

  1. supabase/functions/.env dosyasına RESEND_API_KEY=... ekle (bkz. .env.example)
  2. supabase start
  3. supabase functions serve send-expiry-email --env-file supabase/functions/.env
  4. curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-expiry-email' \
       --header 'apiKey: <VITE_SUPABASE_ANON_KEY>' \
       --header 'Content-Type: application/json' \
       --data '{"to":"ornek@eposta.com","isim":"Esma","items":[{"urun_adi":"Süt","son_kullanma_tarihi":"2026-07-21"}]}'

*/
