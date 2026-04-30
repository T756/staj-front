import { useState, useEffect } from 'react';
import { getMe, updateMe } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await getMe();
        if (mounted) setProfile(data.profile ?? {});
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...profile };
      await updateMe(payload);
      // refresh page data
      const { data } = await getMe();
      setProfile(data.profile ?? {});
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile</h1>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">First name</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={profile?.first_name || ''}
              onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Last name</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={profile?.last_name || ''}
              onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={profile?.phone || ''}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={profile?.city || ''}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
