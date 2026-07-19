# Takım İsmi

Grup 80

# Ürün ile İlgili Bilgiler

## Takım Elemanları

- Damla Kundak – Product Owner
- Esma Eylül Adak – Scrum Master
- Ali Uzunkulaoğlu – Team Member / Developer
- Ömer Faruk Ayvaz – Team Member / Developer
- Zeynep Müderrisoğlu – Team Member / Developer

## Ürün İsmi

**SmartPlate AI**

## Ürün Açıklaması

SmartPlate AI, kullanıcıların buzdolabındaki ürünleri dijital ortamda takip etmelerini sağlayan yapay zekâ destekli akıllı bir mutfak asistanıdır.

Kullanıcılar uygulamaya buzdolabında bulunan ürünleri ve son kullanma tarihlerini ekleyebilir. Yapay zekâ, mevcut malzemeleri analiz ederek hazırlanabilecek yemek tariflerini önerir, son kullanma tarihi yaklaşan ürünler için bildirim gönderir ve eksik malzemeleri otomatik olarak alışveriş listesine ekler.

Bunun yanında uygulama, kullanıcıların günlük kalori hedeflerini dikkate alarak daha sağlıklı tarif önerileri sunmayı amaçlamaktadır. İlerleyen sürümlerde Health entegrasyonu sayesinde günlük aktivite bilgilerine göre kişiselleştirilmiş yemek önerileri sunulması hedeflenmektedir.

SmartPlate AI'ın temel amacı; gıda israfını azaltmak, kullanıcıların bütçesine katkı sağlamak ve sağlıklı beslenmeyi destekleyen akıllı bir yardımcı olmaktır.

## Ürün Özellikleri

- Kullanıcı kayıt ve giriş sistemi
- Buzdolabına ürün ekleme, düzenleme ve silme
- Son kullanma tarihi takibi
- Son kullanma tarihi yaklaşan ürünler için bildirim gönderme
- Yapay zekâ ile mevcut malzemelerden yemek önerileri oluşturma
- Bozulmaya yakın ürünleri öncelikli kullanan tarif önerileri sunma
- Eksik malzemeleri otomatik alışveriş listesine ekleme
- Tariflerin tahmini kalori bilgisini gösterme
- Günlük kalori hedefine uygun sağlıklı tarif önerileri sunma
- Diyet tercihlerine uygun öneriler sunma (vegan, vejetaryen, glutensiz vb.)
- Gıda israfı ve tasarruf analizleri oluşturma

## Hedef Kitle

- Evde yemek yapan bireyler
- Öğrenciler
- Çalışan bireyler
- Aileler
- Sağlıklı beslenmek isteyen kullanıcılar
- Diyet yapan ve sporla ilgilenen kişiler
- Gıda israfını azaltmak isteyen herkes
- Akıllı telefon kullanıcıları

## Product Backlog URL

https://github.com/users/Esmaeyluladak/projects/1/views/1

---

# Sprint 1

## Sprint Notları

İlk sprintte proje fikri netleştirilmiş, takım rolleri belirlenmiş ve GitHub proje yönetim ortamı oluşturulmuştur. SmartPlate AI için React tabanlı frontend ve Supabase tabanlı backend mimarisi planlanmıştır. Ürünün temel ekranları, kullanıcı yönetimi ve buzdolabı yönetimi özellikleri Sprint 1 kapsamında planlanmıştır.

## Daily Scrum

Daily Scrum toplantıları takım üyelerinin uygunluk durumuna göre WhatsApp üzerinden gerçekleştirilmiştir. Toplantı özetleri ve alınan kararlar grup içerisinde paylaşılmıştır.

[daily scrum özet notları.docx](https://github.com/user-attachments/files/29678005/daily.scrum.ozet.notlari.docx)


## Sprint Board Update

Sprint Board GitHub Projects kullanılarak hazırlanmıştır.

<img width="1602" height="1002" alt="Ekran görüntüsü 2026-07-05 192709" src="https://github.com/user-attachments/assets/92c56644-d1a4-413b-9be0-7c87254556e6" />
<img width="1602" height="1014" alt="Ekran görüntüsü 2026-07-05 192723" src="https://github.com/user-attachments/assets/27019299-c634-4451-bfe3-2d87e53687cf" />


## Ürün Durumu

Sprint 1 sonunda;

- README dokümanı hazırlanmıştır.
- Product Backlog oluşturulmuştur.
- GitHub Project Board oluşturulmuştur.
- React proje yapısı oluşturulmuştur.
- Supabase proje yapısı oluşturulmaya başlanmıştır.
- Supabase projesi oluşturulmuş ve veritabanı tasarımı planlanmıştır.
- Kullanıcı kayıt ve giriş sistemi tasarımı planlanmıştır.
- Ürün ekleme ve listeleme ekranlarının geliştirilmesi planlanmıştır.


## Sprint Review

Sprint sonunda ürün fikri ve proje kapsamı ekip tarafından değerlendirilmiştir. İlk sprintte temel proje planlaması, backlog oluşturulması ve geliştirme ortamının hazırlanması başarıyla tamamlanmıştır. Bir sonraki sprintte kullanıcı yönetimi, ürün yönetimi ve yapay zekâ entegrasyonu geliştirmelerine başlanmasına karar verilmiştir.

## Sprint Retrospective

- Takım içi görev dağılımı netleştirilmiştir.
- GitHub proje yönetim süreci oluşturulmuştur.
- React ve Supabase teknolojilerinin kullanılmasına karar verilmiştir.
- İkinci sprintte kullanıcı işlemleri ve ürün yönetimi geliştirmelerine odaklanılması kararlaştırılmıştır.

---

# Sprint 2

## Sprint Notları

İkinci sprintte, Sprint 1 retrospektifinde kararlaştırıldığı üzere kullanıcı işlemleri, ürün yönetimi ve yapay zekâ entegrasyonu geliştirmelerine odaklanılmıştır. Görevler iki geliştiriciye "Backend + AI + Bildirim" ve "Tüm React Arayüzü" olmak üzere iki ana grupta dağıtılmıştır 

## Backlog Dağıtma Mantığı

👤 **Kişi 1 — Backend + AI + Bildirim**
- `services/ai.js` oluştur — AI çağrısı
- Temel prompt: malzeme listesi → 3 tarif (ad, malzeme, süre, kalori, adımlar) JSON formatında
- Bozulacak ürünleri öncelikli kullanan prompt varyasyonu
- Diyet tercihi parametresi (vegan/vejetaryen/glutensiz)
- Kalori hedefi + yakılan kalori bilgisini prompta ekleme
- AI yanıt parse fonksiyonu + temel hata yönetimi (timeout, boş yanıt, API limiti)
- E-posta bildirimi (Resend) — "ürün bozulmak üzere" maili
- Fonksiyon handoff notu + Sprint 1 review/retro belgesi

> Not: `users`/`fridge_items` tabloları, RLS, auth ve fridge CRUD fonksiyonları, 25 mock ürün seed'i Sprint 1'de tamamlanmış durumda — bu listede yok.

👤 **Kişi 2 — Tüm React Arayüzü**
- react-router-dom + zustand kurulumu, `pages/` / `components/` / `services/` klasör yapısı
- Layout bileşeni + korumalı route wrapper
- Zustand store: user, fridgeItems, loading
- Kayıt ol sayfası
- Giriş yap sayfası
- Profil sayfası
- Buzdolabı ürün listesi (kategori grubu + renk kodu: yeşil/sarı/kırmızı)
- Ürün ekle/düzenle modal
- Sil + onay dialogu
- Bozulacak ürünler uyarı banner'ı
- Uygulama içi toast bildirim bileşeni
- Çalışan ekranların ekran görüntüleri + sprint board screenshot

## Daily Scrum Notları

İkinci sprint boyunca ekip içi günlük iletişim WhatsApp grubu ("YZA Grup80") üzerinden yürütülmüştür. Supabase proje erişimi, geliştirme durumu ve görev ilerlemesi bu kanaldan koordine edilmiştir.

<img width="1734" height="1386" alt="Daily Scrum WhatsApp 1" src="https://github.com/user-attachments/assets/384abed3-7a9a-40b5-b9a2-24466365ff0e" />
<img width="1734" height="1292" alt="Daily Scrum WhatsApp 2" src="https://github.com/user-attachments/assets/39958d42-2b0e-4ea0-b5b6-707a9d34a6b6" />
<img width="1718" height="1406" alt="Daily Scrum WhatsApp 3" src="https://github.com/user-attachments/assets/6cd7bcbd-b543-4425-b326-5dbe43b4c1c2" />

## Sprint Board Update

https://github.com/users/Esmaeyluladak/projects/1

<img width="2560" height="1188" alt="Ekran görüntüsü 2026-07-19 195212" src="https://github.com/user-attachments/assets/7d0aeb4a-bfdf-4d76-ab53-e1dc2bb8cea0" />
<img width="2560" height="1188" alt="Ekran görüntüsü 2026-07-19 195200" src="https://github.com/user-attachments/assets/544be5ec-5f23-4db2-995f-d0a85e67e380" />
<img width="2560" height="1188" alt="Ekran görüntüsü 2026-07-19 195147" src="https://github.com/user-attachments/assets/99818cff-1219-41e1-bb24-136cbb774425" />
<img width="2560" height="1106" alt="Ekran görüntüsü 2026-07-19 195133" src="https://github.com/user-attachments/assets/0220a6b3-d1ae-40f1-9929-1af837fc073e" />
<img width="2462" height="1230" alt="Ekran görüntüsü 2026-07-19 195246" src="https://github.com/user-attachments/assets/5b9ce9bd-1ef4-426e-a4e2-936cd431f31d" />


## Ürün Durumu

**Kişi 1 — Backend + AI + Bildirim (tamamlandı):**

- `frontend/src/services/ai.js` oluşturuldu — Google Gemini API (`gemini-2.5-flash`) ile tarif önerisi servisi.
  - Malzeme listesinden 3 tarif üreten temel prompt (JSON formatında: ad, malzeme, süre, kalori, adımlar), Gemini'nin `responseSchema` özelliğiyle yapılandırılmış çıktı garantisi.
  - Bozulmaya yakın ürünleri önceliklendiren prompt varyasyonu.
  - Diyet tercihi parametresi (vegan / vejetaryen / glutensiz).
  - Kalori hedefi ve yakılan kaloriyi prompta ekleyen varyasyon.
  - AI yanıtını doğrulayan parse fonksiyonu ve kapsamlı hata yönetimi (timeout, boş yanıt, API limiti, parse hatası, ağ hatası) — her hata türü ayrı `AIServiceError` koduyla ayrıştırılmıştır.
- `supabase/functions/send-expiry-email` Edge Function'ı oluşturuldu — Resend ile "ürün bozulmak üzere" e-posta bildirimi (sunucu tarafında, API key sızıntısına karşı güvenli).
- Servis katmanı tek sorumluluk prensibiyle ayrıştırılmıştır: prompt oluşturma, AI çağrısı ve yanıt doğrulama ayrı fonksiyonlarda tutulmuştur.
- Her iki fonksiyon da bağımsız olarak (UI entegrasyonu olmadan) test edildi; detaylar ve kullanım örnekleri [`frontend/src/services/HANDOFF.md`](frontend/src/services/HANDOFF.md) içinde.

**Kişi 2 — Tüm React Arayüzü :**

- react-router-dom + zustand kurulumu, klasör yapısı, Layout + korumalı route wrapper tamamlandı.
- Kayıt ol / Giriş yap / Profil sayfaları tamamlandı.
- Buzdolabı ürün listesi (kategori grubu + yeşil/sarı/kırmızı renk kodu), ürün ekle/düzenle modalı, sil onay dialogu ve bozulacak ürün uyarı banner'ı tamamlandı.
- Uygulama içi toast bildirim bileşeni Sprint 3'e taşınmıştır.

> UI entegrasyonu (Recipes.jsx'in `ai.js`'i çağırması) bilinçli olarak bu sprintin kapsamı dışında bırakılmıştır, Sprint 3 için planlanmıştır.



<img width="2560" height="1344" alt="Ekran görüntüsü 2026-07-19 172330" src="https://github.com/user-attachments/assets/3927ea0e-7e37-40f5-85a8-dbc787934cf2" />

<img width="2560" height="1344" alt="Ekran görüntüsü 2026-07-19 172247" src="https://github.com/user-attachments/assets/b9785ec1-07f1-423e-a9c9-3ed79bcad062" />


<img width="2560" height="1344" alt="Ekran görüntüsü 2026-07-19 172231" src="https://github.com/user-attachments/assets/a5ff9d9e-5fd6-4199-b12e-a8e3c99dcd6a" />


<img width="2560" height="1340" alt="Ekran görüntüsü 2026-07-19 171937" src="https://github.com/user-attachments/assets/aba59b74-87b0-4da9-ac4a-78ee322af9b9" />

<img width="2560" height="1344" alt="Ekran görüntüsü 2026-07-19 172341" src="https://github.com/user-attachments/assets/0cb6a610-0190-413d-ba7f-ae8779145827" />


<img width="2901" height="1821" alt="SmartPlate_ER_Diagram" src="https://github.com/user-attachments/assets/de0eccb0-207c-4865-900d-5f95ab50413e" />


## Sprint Review

Sprint 1 retrospektifinde belirlenen yapay zekâ entegrasyonu hedefi doğrultusunda, buzdolabındaki malzemelerden Google Gemini API ile AI destekli tarif önerisi üreten servis ve son kullanma tarihi yaklaşan ürünler için Resend ile e-posta bildirimi altyapısı tamamlanmıştır. Servisler, ileride UI'a bağlanabilecek şekilde bağımsız fonksiyonlar olarak tasarlanmış ve handoff dokümanıyla teslim edilmiştir. Arayüz tarafında kimlik doğrulama ve buzdolabı yönetimi ekranları tamamlanmış ve toast bildirimi gibi cilalama işleri üçüncü sprinte ertelenmiştir.

## Sprint Retrospective

- AI ve bildirim servislerinin backend olmadan (Supabase Edge Functions + doğrudan frontend çağrısı) nasıl güvenli şekilde kurgulanacağı netleştirildi.
- Fonksiyonların UI'a bağlanmadan önce bağımsız test edilebilir olması, ilerleyen entegrasyon adımını kolaylaştıracak şekilde planlandı.
- Üçüncü sprintte, bu servislerin ilgili sayfalara (Recipes.jsx, Fridge.jsx) bağlanmasına ve toast bildirim bileşenine odaklanılması önerilmektedir.

---

# Sprint 3

