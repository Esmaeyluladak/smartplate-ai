-- SmartPlate AI — Mock Seed Data
-- Kişi A · Gün 1-2
-- NOT: TEST_USER_ID'yi Supabase'den oluşturduğunuz test kullanıcısının UUID'siyle değiştirin.

DO $$
DECLARE
    TEST_USER_ID UUID := '00000000-0000-0000-0000-000000000001'; -- DEĞİŞTİR
    TODAY DATE := CURRENT_DATE;
BEGIN

-- Test kullanıcı profili (auth.users'da bu UUID olmalı)
INSERT INTO public.users (id, isim, kalori_hedefi, gunluk_yakit_kalori, diyet_tercihi)
VALUES (TEST_USER_ID, 'Test Kullanıcı', 2000, 300, 'normal')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 25 MOCK ÜRÜN (fridge_items)
-- Bazıları yakında bozulacak → "3 güne kadar" filtresini test eder
-- ============================================================
INSERT INTO public.fridge_items (user_id, urun_adi, miktar, birim, kategori, son_kullanma_tarihi) VALUES

-- YAKINDA BOZULACAK (0-3 gün) — kırmızı/sarı bant testi
(TEST_USER_ID, 'Süt',              1,   'litre',  'Süt Ürünleri', TODAY + 1),
(TEST_USER_ID, 'Yoğurt',           500, 'gram',   'Süt Ürünleri', TODAY + 2),
(TEST_USER_ID, 'Taze Ispanak',     200, 'gram',   'Sebze',        TODAY + 1),
(TEST_USER_ID, 'Domates',          4,   'adet',   'Sebze',        TODAY + 3),
(TEST_USER_ID, 'Açık Peynir',      150, 'gram',   'Süt Ürünleri', TODAY + 2),

-- 4-7 GÜN (sarı bant)
(TEST_USER_ID, 'Tavuk Göğsü',      400, 'gram',   'Et & Balık',   TODAY + 5),
(TEST_USER_ID, 'Yumurta',          6,   'adet',   'Süt Ürünleri', TODAY + 7),
(TEST_USER_ID, 'Salatalık',        2,   'adet',   'Sebze',        TODAY + 4),
(TEST_USER_ID, 'Kaşar Peyniri',    200, 'gram',   'Süt Ürünleri', TODAY + 6),
(TEST_USER_ID, 'Limon',            3,   'adet',   'Meyve',        TODAY + 7),

-- UZUN RAF ÖMRÜ (yeşil bant)
(TEST_USER_ID, 'Tereyağı',         250, 'gram',   'Süt Ürünleri', TODAY + 20),
(TEST_USER_ID, 'Makarna',          500, 'gram',   'Kuru Gıda',    TODAY + 365),
(TEST_USER_ID, 'Pirinç',           1,   'kg',     'Kuru Gıda',    TODAY + 365),
(TEST_USER_ID, 'Un',               1,   'kg',     'Kuru Gıda',    TODAY + 180),
(TEST_USER_ID, 'Zeytinyağı',       750, 'ml',     'Yağ & Sos',    TODAY + 365),
(TEST_USER_ID, 'Soğan',            5,   'adet',   'Sebze',        TODAY + 30),
(TEST_USER_ID, 'Sarımsak',         1,   'baş',    'Sebze',        TODAY + 30),
(TEST_USER_ID, 'Domates Salçası',  200, 'gram',   'Konserve',     TODAY + 180),
(TEST_USER_ID, 'Nohut (konserve)', 400, 'gram',   'Konserve',     TODAY + 365),
(TEST_USER_ID, 'Tuna Balığı',      185, 'gram',   'Konserve',     TODAY + 365),
(TEST_USER_ID, 'Elma',             4,   'adet',   'Meyve',        TODAY + 14),
(TEST_USER_ID, 'Muz',              3,   'adet',   'Meyve',        TODAY + 5),
(TEST_USER_ID, 'Kıyma',            300, 'gram',   'Et & Balık',   TODAY + 3),
(TEST_USER_ID, 'Beyaz Peynir',     250, 'gram',   'Süt Ürünleri', TODAY + 10),
(TEST_USER_ID, 'Ayçiçek Yağı',    500, 'ml',     'Yağ & Sos',    TODAY + 365);

END $$;
