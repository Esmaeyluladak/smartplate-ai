import { useEffect, useState } from 'react';
import {
  getShoppingList,
  addShoppingItem,
  markShoppingItemBought,
  deleteShoppingItem,
} from '../services/supabase';
import { useAppStore } from '../store/useAppStore';

export default function Shopping() {
  const user = useAppStore((s) => s.user);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [urunAdi, setUrunAdi] = useState('');
  const [miktar, setMiktar] = useState(1);
  const [birim, setBirim] = useState('adet');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadItems();
  }, [user]);

  function loadItems() {
    setLoading(true);
    getShoppingList(user.id)
      .then(setItems)
      .catch((err) => console.error('Alışveriş listesi yüklenemedi:', err))
      .finally(() => setLoading(false));
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!urunAdi.trim()) return;
    setAdding(true);
    try {
      const created = await addShoppingItem(user.id, {
        urun_adi: urunAdi.trim(),
        miktar: Number(miktar),
        birim,
      });
      setItems((prev) => [...prev, created]);
      setUrunAdi('');
      setMiktar(1);
      setBirim('adet');
    } catch (err) {
      console.error('Ürün eklenemedi:', err);
    } finally {
      setAdding(false);
    }
  }

  async function handleToggleBought(item) {
    try {
      const updated = await markShoppingItemBought(item.id);
      setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
    } catch (err) {
      console.error('Ürün güncellenemedi:', err);
    }
  }

  async function handleDelete(item) {
    try {
      await deleteShoppingItem(item.id);
      setItems((prev) => prev.filter((it) => it.id !== item.id));
    } catch (err) {
      console.error('Ürün silinemedi:', err);
    }
  }

  const pending = items.filter((it) => !it.satin_alindi);
  const bought = items.filter((it) => it.satin_alindi);

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Alışveriş Listesi</h1>

      <form
        onSubmit={handleAdd}
        className="flex gap-2 mb-6 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"
      >
        <input
          type="text"
          placeholder="Ürün adı"
          value={urunAdi}
          onChange={(e) => setUrunAdi(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="number"
          min="0"
          step="0.1"
          value={miktar}
          onChange={(e) => setMiktar(e.target.value)}
          className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="text"
          value={birim}
          onChange={(e) => setBirim(e.target.value)}
          className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          disabled={adding}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
        >
          Ekle
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500">Yükleniyor...</p>
      ) : items.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-2xl flex items-center justify-center mx-auto mb-4">
            🛒
          </div>
          <p className="text-gray-900 font-medium mb-1">Alışveriş listen boş</p>
          <p className="text-gray-500 text-sm">Yukarıdaki formdan ürün ekleyebilirsin.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div className="space-y-2">
              {pending.map((item) => (
                <ShoppingRow
                  key={item.id}
                  item={item}
                  onToggle={() => handleToggleBought(item)}
                  onDelete={() => handleDelete(item)}
                />
              ))}
            </div>
          )}

          {bought.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Satın Alındı
              </h2>
              <div className="space-y-2">
                {bought.map((item) => (
                  <ShoppingRow
                    key={item.id}
                    item={item}
                    onToggle={() => handleToggleBought(item)}
                    onDelete={() => handleDelete(item)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ShoppingRow({ item, onToggle, onDelete }) {
  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3">
      <label className="flex items-center gap-3 flex-1 cursor-pointer">
        <input
          type="checkbox"
          checked={item.satin_alindi}
          onChange={onToggle}
          className="w-4 h-4 accent-purple-600"
        />
        <span className={item.satin_alindi ? 'line-through text-gray-400' : 'text-gray-900'}>
          {item.urun_adi} — {item.miktar} {item.birim}
        </span>
      </label>
      <button onClick={onDelete} className="text-xs text-gray-400 hover:text-red-600">
        Sil
      </button>
    </div>
  );
}