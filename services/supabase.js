import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── AUTH ──────────────────────────────────────────────────────────────────────

export async function signUp(email, password, isim) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    await supabase.from('users').insert({
        id: data.user.id,
        isim,
    });

    return data;
}

export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
}

// ── KULLANICI PROFİLİ ─────────────────────────────────────────────────────────

export async function getProfile(userId) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
    if (error) throw error;
    return data;
}

export async function updateProfile(userId, updates) {
    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ── BUZDOLABI ─────────────────────────────────────────────────────────────────

export async function getFridgeItems(userId) {
    const { data, error } = await supabase
        .from('fridge_items')
        .select('*')
        .eq('user_id', userId)
        .order('son_kullanma_tarihi', { ascending: true });
    if (error) throw error;
    return data;
}

/** 3 güne kadar bozulacak ürünler */
export async function getExpiringItems(userId) {
    const soon = new Date();
    soon.setDate(soon.getDate() + 3);
    const soonStr = soon.toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('fridge_items')
        .select('*')
        .eq('user_id', userId)
        .gte('son_kullanma_tarihi', todayStr)
        .lte('son_kullanma_tarihi', soonStr)
        .order('son_kullanma_tarihi', { ascending: true });
    if (error) throw error;
    return data;
}

export async function addFridgeItem(userId, item) {
    const { data, error } = await supabase
        .from('fridge_items')
        .insert({ user_id: userId, ...item })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateFridgeItem(itemId, updates) {
    const { data, error } = await supabase
        .from('fridge_items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteFridgeItem(itemId) {
    const { error } = await supabase
        .from('fridge_items')
        .delete()
        .eq('id', itemId);
    if (error) throw error;
}

// ── ALIŞVERİŞ LİSTESİ ────────────────────────────────────────────────────────

export async function getShoppingList(userId) {
    const { data, error } = await supabase
        .from('shopping_list')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
}

export async function addShoppingItem(userId, item) {
    const { data, error } = await supabase
        .from('shopping_list')
        .insert({ user_id: userId, ...item })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function markShoppingItemBought(itemId) {
    const { data, error } = await supabase
        .from('shopping_list')
        .update({ satin_alindi: true })
        .eq('id', itemId)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteShoppingItem(itemId) {
    const { error } = await supabase
        .from('shopping_list')
        .delete()
        .eq('id', itemId);
    if (error) throw error;
}
