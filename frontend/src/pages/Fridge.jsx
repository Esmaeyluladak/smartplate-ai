import { useEffect, useMemo, useState } from 'react';
import {
  getFridgeItems,
  addFridgeItem,
  updateFridgeItem,
  deleteFridgeItem,
} from '../services/supabase';
import { useAppStore } from '../store/useAppStore';

const KATEGORILER = [
  'Süt Ürünleri',
  'Sebze',
  'Meyve',
  'Et & Balık',
  'Kuru Gıda',
  'Yağ & Sos',
  'Konserve',
  'Diğer',
];

const BIRIMLER = ['adet', 'gram', 'kg', 'litre', 'ml', 'baş'];

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

function bandClasses(days) {
  if (days === null) return 'border-gray-200 bg-white';
  if (days <= 3) return 'border-red-300 bg-red-50';
  if (days <= 7) return 'border-yellow-300 bg-yellow-50';
  return 'border-green-300 bg-green-50';
}

function dotClasses(days) {
  if (days === null) return 'bg-gray-300';
  if (days <= 3) return 'bg-red-500';
  if (days <= 7) return 'bg-yellow-500';
  return 'bg-green-500';
}

const emptyForm = {
  urun_adi: '',
  miktar: 1,
  birim: 'adet',
  kategori: KATEGORILER[0],
  son_kullanma_tarihi: '',
};

export default function Fridge() {
  const user = useAppStore((s) => s.user);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalItem, setModalItem] = useState(null); // { ...emptyForm } for add, or existing item for edit
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadItems();
  }, [user]);

  function loadItems() {
    setLoading(true);
    getFridgeItems(user.id)
      .then(setItems)
      .catch((err) => console.error('Buzdolabı verisi yüklenemedi:', err))
      .finally(() => setLoading(false));
  }

  const expiringCount = useMemo(
    () => items.filter((it) => {
      const d = daysUntil(it.son_kullanma_tarihi);
      return d !== null && d <= 3;
    }).length,
    [items]
  );

  const grouped = useMemo(() => {
    const map = {};
    for (const item of items) {
      const key = item.kategori || 'Diğer';
      if (!map[key]) map[key] = [];
      map[key].push(item);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b, 'tr'));
  }, [items]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        urun_adi: modalItem.urun_adi,
        miktar: Number(modalItem.miktar),
        birim: modalItem.birim,
        kategori: modalItem.kategori,
        son_kullanma_tarihi: modalItem.son_kullanma_tarihi || null,
      };

      if (modalItem.id) {
        const updated = await updateFridgeItem(modalItem.id, payload);
        setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
      } else {
        const created = await addFridgeItem(user.id, payload);
        setItems((prev) => [...prev, created]);
      }
      setModalItem(null);
    } catch (err) {
      console.error('Ürün kaydedilemedi:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await deleteFridgeItem(deleteTarget.id);
      setItems((prev) => prev.filter((it) => it.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Ürün silinemedi:', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Buzdolabı</h1>
        <button
          onClick={() => setModalItem({ ...emptyForm })}
          className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
        >
          + Ürün Ekle
        </button>
      </div>

      {expiringCount > 0 && (
        <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {expiringCount} ürünün süresi yaklaşıyor
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Yükleniyor...</p>
      ) : items.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-2xl flex items-center justify-center mx-auto mb-4">
            🧊
          </div>
          <p className="text-gray-900 font-medium mb-1">Buzdolabınız boş</p>
          <p className="text-gray-500 text-sm">Ürün eklemek için sağ üstteki butonu kullanın.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([kategori, groupItems]) => (
            <section key={kategori}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {kategori}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupItems.map((item) => {
                  const days = daysUntil(item.son_kullanma_tarihi);
                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl border p-4 flex items-start justify-between gap-2 ${bandClasses(days)}`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${dotClasses(days)}`} />
                          <p className="font-medium text-gray-900">{item.urun_adi}</p>
                        </div>
                        <p className="text-sm text-gray-600">
                          {item.miktar} {item.birim}
                        </p>
                        {item.son_kullanma_tarihi && (
                          <p className="text-xs text-gray-500 mt-1">
                            {days < 0
                              ? 'Süresi geçti'
                              : days === 0
                              ? 'Bugün son gün'
                              : `${days} gün kaldı`}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 text-xs">
                        <button
                          onClick={() => setModalItem(item)}
                          className="text-gray-500 hover:text-purple-600"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {modalItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-10">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {modalItem.id ? 'Ürünü Düzenle' : 'Ürün Ekle'}
            </h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Adı</label>
                <input
                  type="text"
                  required
                  value={modalItem.urun_adi}
                  onChange={(e) => setModalItem((f) => ({ ...f, urun_adi: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Miktar</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    required
                    value={modalItem.miktar}
                    onChange={(e) => setModalItem((f) => ({ ...f, miktar: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Birim</label>
                  <select
                    value={modalItem.birim}
                    onChange={(e) => setModalItem((f) => ({ ...f, birim: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {BIRIMLER.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  value={modalItem.kategori}
                  onChange={(e) => setModalItem((f) => ({ ...f, kategori: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {KATEGORILER.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Son Kullanma Tarihi</label>
                <input
                  type="date"
                  value={modalItem.son_kullanma_tarihi ?? ''}
                  onChange={(e) =>
                    setModalItem((f) => ({ ...f, son_kullanma_tarihi: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalItem(null)}
                  className="flex-1 text-sm font-medium rounded-lg py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg py-2.5 transition-colors"
                >
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-10">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Ürünü sil</h2>
            <p className="text-sm text-gray-600 mb-6">
              "{deleteTarget.urun_adi}" ürününü silmek istediğine emin misin?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 text-sm font-medium rounded-lg py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Vazgeç
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg py-2.5 transition-colors"
              >
                {saving ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}