-- SmartPlate AI — Supabase Schema

-- ============================================================
-- TABLO 1: users (auth.users'ı extend eder)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    isim        TEXT NOT NULL,
    kalori_hedefi        INTEGER DEFAULT 2000,
    gunluk_yakit_kalori  INTEGER DEFAULT 0,
    diyet_tercihi        TEXT CHECK (diyet_tercihi IN ('normal', 'vegan', 'vejetaryen', 'glutensiz')) DEFAULT 'normal',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLO 2: fridge_items (buzdolabı ürünleri)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.fridge_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    urun_adi            TEXT NOT NULL,
    miktar              NUMERIC NOT NULL DEFAULT 1,
    birim               TEXT NOT NULL DEFAULT 'adet',
    kategori            TEXT NOT NULL DEFAULT 'Diğer',
    son_kullanma_tarihi DATE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLO 3: shopping_list (alışveriş listesi)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.shopping_list (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    urun_adi    TEXT NOT NULL,
    miktar      NUMERIC NOT NULL DEFAULT 1,
    birim       TEXT NOT NULL DEFAULT 'adet',
    satin_alindi BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEX'LER (sık kullanılan sorgular için)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_fridge_items_user_id   ON public.fridge_items(user_id);
CREATE INDEX IF NOT EXISTS idx_fridge_items_skт        ON public.fridge_items(son_kullanma_tarihi);
CREATE INDEX IF NOT EXISTS idx_shopping_list_user_id  ON public.shopping_list(user_id);

-- ============================================================
-- ROW LEVEL SECURITY — HER KULLANICI YALNIZCA KENDİ VERİSİNİ GÖRÜR
-- ============================================================

-- users tablosu RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_delete_own" ON public.users
    FOR DELETE USING (auth.uid() = id);

-- fridge_items tablosu RLS
ALTER TABLE public.fridge_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fridge_select_own" ON public.fridge_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "fridge_insert_own" ON public.fridge_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "fridge_update_own" ON public.fridge_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "fridge_delete_own" ON public.fridge_items
    FOR DELETE USING (auth.uid() = user_id);

-- shopping_list tablosu RLS
ALTER TABLE public.shopping_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shopping_select_own" ON public.shopping_list
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "shopping_insert_own" ON public.shopping_list
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "shopping_update_own" ON public.shopping_list
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "shopping_delete_own" ON public.shopping_list
    FOR DELETE USING (auth.uid() = user_id);
