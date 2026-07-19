# Handoff Notu — AI Tarif Önerisi & E-posta Bildirimi

Bu not, `services/ai.js` ve `send-expiry-email` Edge Function'ını UI'a bağlayacak kişi için hazırlanmıştır. Sprint 2 kapsamında bu fonksiyonlar yazıldı ve bağımsız olarak test edildi; **Recipes.jsx'e veya başka bir sayfaya bağlama işi bu sprintte yapılmadı.**

## 1. `frontend/src/services/ai.js`

### Kurulum
`frontend/.env` dosyasına bir Gemini API key ekle (Google AI Studio'dan alınır):
```
VITE_GEMINI_API_KEY=...
```

### Ana fonksiyon — `generateRecipesForUser(userId, options?)`

En kolay kullanım şekli budur; buzdolabı, bozulacak ürünler ve profil bilgisini kendisi çeker.

```js
import { generateRecipesForUser, AIServiceError } from '../services/ai';

try {
  const tarifler = await generateRecipesForUser(user.id);
  // tarifler: [{ ad, malzeme: string[], süre, kalori, adımlar: string[] }, ...]
} catch (e) {
  if (e instanceof AIServiceError) {
    // e.code ile kullanıcıya özel mesaj göster (aşağıdaki tablo)
  }
}
```

### Alt seviye fonksiyon — `generateRecipes(fridgeItems, options?)`

Veriyi kendin sağlamak istersen (ör. test için, ya da farklı bir ürün listesiyle):

```js
await generateRecipes(fridgeItems, {
  expiringItems,       // opsiyonel — bozulacak ürünleri önceliklendirir
  diyetTercihi,         // 'normal' | 'vegan' | 'vejetaryen' | 'glutensiz'
  kaloriHedefi,          // number
  gunlukYakitKalori,     // number
  timeoutMs,             // opsiyonel, varsayılan 15000
});
```

### Dönüş şekli
```ts
{ ad: string, malzeme: string[], süre: number, kalori: number, adımlar: string[] }[]
```

### Hata kodları (`AIServiceError.code`)

| code | Anlamı | Önerilen kullanıcı mesajı |
|---|---|---|
| `TIMEOUT` | İstek zaman aşımına uğradı | "AI yanıt vermedi, tekrar deneyin" |
| `EMPTY_RESPONSE` | AI boş/güvenlik filtresine takılan yanıt döndürdü | "Şu an tarif önerisi oluşturulamadı, tekrar deneyin" |
| `RATE_LIMIT` | API kullanım limiti (429) aşıldı | "Çok fazla istek, birkaç dakika sonra tekrar deneyin" |
| `PARSE_ERROR` | AI yanıtı beklenen JSON formatında değil | "Tarif önerisi oluşturulamadı, tekrar deneyin" |
| `API_ERROR` | Gemini API hata döndürdü (key eksik/geçersiz vb.) | "AI servisiyle bağlantı kurulamadı" |
| `NETWORK_ERROR` | fetch başarısız oldu (offline vb.) | "İnternet bağlantınızı kontrol edin" |

### Bağımsız test edilen yardımcı fonksiyonlar
`buildDietClause`, `buildExpiringPriorityClause`, `buildCalorieClause`, `buildPrompt`, `parseRecipeResponse` de export edilmiştir — birim test yazmak istersen doğrudan bunları çağırabilirsin.

---

## 2. `send-expiry-email` Edge Function

### Kurulum
1. Bir Resend API key al (resend.com, sandbox gönderen `onboarding@resend.dev` ile domain doğrulamaya gerek yok).
2. `supabase secrets set RESEND_API_KEY=...` (linked proje üzerinde) veya yerel test için `supabase/functions/.env` dosyasına ekle (bkz. `.env.example`).
3. Deploy: `supabase functions deploy send-expiry-email`.

### Frontend'den çağırma
```js
import { supabase } from '../services/supabase';

const { data, error } = await supabase.functions.invoke('send-expiry-email', {
  body: {
    to: user.email,
    isim: profile.isim,
    items: expiringItems, // getExpiringItems(userId) sonucu — urun_adi, son_kullanma_tarihi alanları yeterli
  },
});
```

Doğal tetikleme noktası: `getExpiringItems(userId)` zaten çağrılan bir yer (ör. Fridge.jsx veya bir dashboard) — kullanıcı bozulacak ürünleri gördüğünde ya da uygulama açılışında bir kere çağrılabilir. Otomatik/zamanlı gönderim (cron, pg_cron) bu sprintin kapsamında değil, Sprint 3 adayı olarak bırakıldı.

### Manuel test (curl)
```bash
supabase functions serve send-expiry-email --env-file supabase/functions/.env

curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-expiry-email' \
  --header 'apiKey: <VITE_SUPABASE_ANON_KEY>' \
  --header 'Content-Type: application/json' \
  --data '{"to":"ornek@eposta.com","isim":"Esma","items":[{"urun_adi":"Süt","son_kullanma_tarihi":"2026-07-21"}]}'
```

### Yanıt şekli
- `200 { success: true, id }`
- `400 { success: false, error }` — eksik `to`/`items`
- `502 { success: false, error }` — Resend API hatası
- `500 { success: false, error }` — beklenmeyen hata / eksik secret

---

## 3. Ne bitti, ne kaldı

**Bitti:**
- `services/ai.js` — Gemini entegrasyonu, temel prompt, diyet/bozulma-önceliği/kalori varyasyonları, yanıt parse + hata yönetimi
- `send-expiry-email` Edge Function — Resend entegrasyonu, doğrulama, hata yönetimi
- İkisi de bağımsız olarak (UI'sız) test edildi

**Kalanlar (UI entegrasyonu — bu sprintte kapsam dışı):**
- `Recipes.jsx`'teki TODO'yu `generateRecipesForUser(user.id)` çağrısıyla değiştirmek, loading/error state'lerini yukarıdaki hata kodu tablosuna göre göstermek
- Bozulacak ürün tespit edildiğinde `send-expiry-email`'i çağıracak UI akışını kurmak (örn. Fridge.jsx'te bir buton, ya da uygulama açılışında otomatik kontrol)
