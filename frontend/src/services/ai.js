import { getFridgeItems, getExpiringItems, getProfile } from './supabase';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const DEFAULT_TIMEOUT_MS = 15000;

const RECIPE_COUNT = 3;

// ── HATA TİPİ ────────────────────────────────────────────────────────────────

export class AIServiceError extends Error {
    constructor(message, code, details) {
        super(message);
        this.name = 'AIServiceError';
        this.code = code;
        this.details = details;
    }
}

// ── PROMPT PARÇALARI ─────────────────────────────────────────────────────────

const DIET_CLAUSES = {
    vegan: 'Tarifler tamamen vegan olmalı: et, tavuk, balık, süt ürünü, yumurta veya bal içeren hiçbir malzeme kullanma.',
    vejetaryen: 'Tarifler vejetaryen olmalı: et, tavuk veya balık içeren hiçbir malzeme kullanma.',
    glutensiz: 'Tarifler glutensiz olmalı: buğday, arpa, çavdar veya gluten içeren un/makarna/ekmek gibi malzemeler kullanma.',
};

/** Diyet tercihine göre prompta eklenecek kısıtlama cümlesi. 'normal' veya bilinmeyen değerler için boş string döner. */
export function buildDietClause(diyetTercihi) {
    return DIET_CLAUSES[diyetTercihi] ?? '';
}

/** Bozulmaya yakın ürünleri önceliklendiren prompt varyasyonu. */
export function buildExpiringPriorityClause(expiringItems) {
    if (!expiringItems || expiringItems.length === 0) return '';
    const isimler = expiringItems.map((item) => item.urun_adi).join(', ');
    return `Şu ürünler son kullanma tarihine yakın, gıda israfını önlemek için tariflerde bu ürünleri öncelikli ve mümkün olduğunca fazla kullan: ${isimler}.`;
}

/** Kalori hedefi ve bugün yakılan kaloriye göre tarif kalorisini sınırlayan prompt cümlesi. */
export function buildCalorieClause(kaloriHedefi, gunlukYakitKalori) {
    if (!kaloriHedefi) return '';
    const yakilan = gunlukYakitKalori ?? 0;
    const kalanBudce = kaloriHedefi + yakilan;
    return `Kullanıcının günlük kalori hedefi ${kaloriHedefi} kcal, bugün egzersizle yaktığı kalori ${yakilan} kcal (kullanılabilir toplam bütçe yaklaşık ${kalanBudce} kcal). Önerilen tariflerin porsiyon başı kalorisi bu bütçeyle makul, sağlıklı bir öğüne uygun olsun.`;
}

function buildIngredientsList(fridgeItems) {
    return fridgeItems
        .map((item) => `${item.urun_adi} (${item.miktar ?? ''} ${item.birim ?? ''})`.trim())
        .join(', ');
}

/**
 * Tam prompt metnini oluşturur: temel talimat + diyet/bozulma/kalori varyasyonları + JSON format talimatı.
 */
export function buildPrompt(fridgeItems, options = {}) {
    const { expiringItems, diyetTercihi, kaloriHedefi, gunlukYakitKalori } = options;

    const malzemeler = buildIngredientsList(fridgeItems);
    const clauses = [
        buildExpiringPriorityClause(expiringItems),
        buildDietClause(diyetTercihi),
        buildCalorieClause(kaloriHedefi, gunlukYakitKalori),
    ].filter(Boolean);

    return [
        `Aşağıdaki buzdolabı malzemelerinden tam olarak ${RECIPE_COUNT} farklı yemek tarifi öner: ${malzemeler}.`,
        ...clauses,
        'Sadece buzdolabındaki malzemeleri veya yaygın temel mutfak malzemelerini (tuz, su, yağ gibi) kullan.',
        'Yanıtı SADECE JSON dizisi olarak ver, başka hiçbir açıklama ekleme. Her tarif şu alanlara sahip olmalı: ' +
            '"ad" (string, tarif adı), "malzeme" (string dizisi), "süre" (number, dakika cinsinden hazırlama süresi), ' +
            '"kalori" (number, porsiyon başı tahmini kalori), "adımlar" (string dizisi, yapılış adımları).',
    ].join('\n');
}

// ── GEMINI İSTEK ŞEMASI ───────────────────────────────────────────────────────

const RECIPE_RESPONSE_SCHEMA = {
    type: 'ARRAY',
    minItems: RECIPE_COUNT,
    maxItems: RECIPE_COUNT,
    items: {
        type: 'OBJECT',
        properties: {
            ad: { type: 'STRING' },
            malzeme: { type: 'ARRAY', items: { type: 'STRING' } },
            süre: { type: 'NUMBER' },
            kalori: { type: 'NUMBER' },
            adımlar: { type: 'ARRAY', items: { type: 'STRING' } },
        },
        required: ['ad', 'malzeme', 'süre', 'kalori', 'adımlar'],
    },
};

// ── YANIT PARSE ───────────────────────────────────────────────────────────────

function isValidRecipe(recipe) {
    return (
        recipe &&
        typeof recipe.ad === 'string' &&
        Array.isArray(recipe.malzeme) &&
        typeof recipe.süre === 'number' &&
        typeof recipe.kalori === 'number' &&
        Array.isArray(recipe.adımlar)
    );
}

/** Gemini API'sinin ham JSON yanıtını doğrulanmış tarif dizisine çevirir. */
export function parseRecipeResponse(geminiJson) {
    if (geminiJson?.promptFeedback?.blockReason) {
        throw new AIServiceError('İçerik güvenlik filtresine takıldı', 'EMPTY_RESPONSE', geminiJson.promptFeedback);
    }

    const candidate = geminiJson?.candidates?.[0];
    if (!candidate) {
        throw new AIServiceError('AI boş yanıt döndürdü', 'EMPTY_RESPONSE');
    }
    if (candidate.finishReason === 'SAFETY' || candidate.finishReason === 'RECITATION') {
        throw new AIServiceError('AI yanıtı güvenlik nedeniyle engellendi', 'EMPTY_RESPONSE', candidate.finishReason);
    }

    const text = candidate.content?.parts?.[0]?.text;
    if (!text) {
        throw new AIServiceError('AI boş yanıt döndürdü', 'EMPTY_RESPONSE');
    }

    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch {
        throw new AIServiceError('AI yanıtı ayrıştırılamadı', 'PARSE_ERROR', text);
    }

    if (!Array.isArray(parsed)) {
        throw new AIServiceError('AI yanıtı beklenen formatta değil', 'PARSE_ERROR', parsed);
    }

    const recipes = parsed.filter(isValidRecipe);
    if (recipes.length === 0) {
        throw new AIServiceError('AI yanıtında geçerli tarif bulunamadı', 'PARSE_ERROR', parsed);
    }

    return recipes;
}

// ── ANA FONKSİYON ─────────────────────────────────────────────────────────────

/**
 * Verilen buzdolabı malzemelerinden Gemini kullanarak tarif önerileri üretir.
 * @param {Array} fridgeItems - { urun_adi, miktar, birim } şeklinde ürün listesi.
 * @param {Object} options - { expiringItems, diyetTercihi, kaloriHedefi, gunlukYakitKalori, timeoutMs }
 * @returns {Promise<Array>} { ad, malzeme, süre, kalori, adımlar } şeklinde tarif dizisi.
 */
export async function generateRecipes(fridgeItems, options = {}) {
    if (!GEMINI_API_KEY) {
        throw new AIServiceError('VITE_GEMINI_API_KEY tanımlı değil', 'API_ERROR');
    }
    if (!fridgeItems || fridgeItems.length === 0) {
        throw new AIServiceError('Tarif önerisi için buzdolabında ürün bulunmalı', 'EMPTY_RESPONSE');
    }

    const prompt = buildPrompt(fridgeItems, options);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

    let res;
    try {
        res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: 'application/json',
                    responseSchema: RECIPE_RESPONSE_SCHEMA,
                },
            }),
        });
    } catch (e) {
        if (e.name === 'AbortError') {
            throw new AIServiceError('İstek zaman aşımına uğradı', 'TIMEOUT');
        }
        throw new AIServiceError('Ağ hatası, AI servisine ulaşılamadı', 'NETWORK_ERROR', e.message);
    } finally {
        clearTimeout(timeoutId);
    }

    if (!res.ok) {
        if (res.status === 429) {
            throw new AIServiceError('API kullanım limiti aşıldı, lütfen daha sonra tekrar deneyin', 'RATE_LIMIT');
        }
        const body = await res.text().catch(() => '');
        throw new AIServiceError('AI servisi hata döndürdü', 'API_ERROR', { status: res.status, body: body.slice(0, 500) });
    }

    const json = await res.json();
    return parseRecipeResponse(json);
}

/**
 * Verilen kullanıcının buzdolabı, bozulacak ürün ve profil bilgilerini kendisi çekip
 * generateRecipes'i çağıran kolaylık fonksiyonu. UI entegrasyonu için tek çağrı yeterli.
 */
export async function generateRecipesForUser(userId, options = {}) {
    const [fridgeItems, expiringItems, profile] = await Promise.all([
        getFridgeItems(userId),
        getExpiringItems(userId),
        getProfile(userId),
    ]);

    return generateRecipes(fridgeItems, {
        expiringItems,
        diyetTercihi: profile.diyet_tercihi,
        kaloriHedefi: profile.kalori_hedefi,
        gunlukYakitKalori: profile.gunluk_yakit_kalori,
        ...options,
    });
}
