import { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../services/supabase';
import { useAppStore } from '../store/useAppStore';

const DIYET_SECENEKLERI = [
  { value: 'normal', label: 'Normal' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'vejetaryen', label: 'Vejetaryen' },
  { value: 'glutensiz', label: 'Glutensiz' },
];

export default function Profile() {
  const user = useAppStore((s) => s.user);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    getProfile(user.id)
      .then((profile) => setForm(profile))
      .catch((err) => console.error('Profil yüklenemedi:', err))
      .finally(() => setLoading(false));
  }, [user]);

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfile(user.id, {
        isim: form.isim,
        kalori_hedefi: Number(form.kalori_hedefi),
        gunluk_yakit_kalori: Number(form.gunluk_yakit_kalori),
        diyet_tercihi: form.diyet_tercihi,
      });
      setForm(updated);
      setSaved(true);
    } catch (err) {
      console.error('Profil kaydedilemedi:', err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-gray-500">Yükleniyor...</p>;
  if (!form) return <p className="text-gray-500">Profil bulunamadı.</p>;

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Profil</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">İsim</label>
          <input
            type="text"
            required
            value={form.isim ?? ''}
            onChange={(e) => handleChange('isim', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Günlük Kalori Hedefi</label>
          <input
            type="number"
            min="0"
            required
            value={form.kalori_hedefi ?? ''}
            onChange={(e) => handleChange('kalori_hedefi', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bugün Yakılan Kalori</label>
          <input
            type="number"
            min="0"
            value={form.gunluk_yakit_kalori ?? ''}
            onChange={(e) => handleChange('gunluk_yakit_kalori', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Diyet Tercihi</label>
          <select
            value={form.diyet_tercihi ?? 'normal'}
            onChange={(e) => handleChange('diyet_tercihi', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {DIYET_SECENEKLERI.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {saved && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
            Profil güncellendi.
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg py-2.5 transition-colors"
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </form>
    </div>
  );
}