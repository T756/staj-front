import { useCallback, useEffect, useState } from 'react';
import { listInterviews, createInterview, listApplications } from '../api/applications';

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    application: '',
    scheduled_at: '',
    location: '',
    notes: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: interviewsData } = await listInterviews();
      setInterviews(interviewsData.results ?? (Array.isArray(interviewsData) ? interviewsData : []));

      try {
        const { data: appsData } = await listApplications();
        const appList = appsData.results ?? (Array.isArray(appsData) ? appsData : []);
        setApplications(appList);
        setForm((f) => (f.application || appList.length === 0 ? f : { ...f, application: String(appList[0].id) }));
      } catch {
        // Some roles may not have /applications/me/. Keep manual application ID input available.
      }
    } catch {
      setError('Failed to load interviews.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(loadData);
  }, [loadData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createInterview({
        application: Number(form.application),
        scheduled_at: new Date(form.scheduled_at).toISOString(),
        location: form.location,
        notes: form.notes,
      });
      setForm((f) => ({ ...f, scheduled_at: '', location: '', notes: '' }));
      await loadData();
    } catch (err) {
      const data = err.response?.data;
      setError(typeof data === 'object' ? Object.values(data).flat().join(' ') : 'Failed to schedule interview.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Interviews</h1>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : interviews.length === 0 ? (
          <p className="text-gray-500">No interviews scheduled yet.</p>
        ) : (
          <div className="space-y-3 max-h-[70vh] overflow-auto pr-1">
            {interviews.map((item) => (
              <div key={item.id} className="border border-gray-100 rounded-xl p-3">
                <p className="text-xs text-gray-500">Application #{item.application}</p>
                <p className="text-sm text-gray-800 mt-1">{new Date(item.scheduled_at).toLocaleString()}</p>
                {item.location && <p className="text-sm text-gray-600 mt-1">{item.location}</p>}
                {item.notes && <p className="text-sm text-gray-600 mt-1">{item.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule Interview</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Application</label>
            {applications.length > 0 ? (
              <select
                required
                value={form.application}
                onChange={(e) => setForm((f) => ({ ...f, application: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {applications.map((a) => (
                  <option key={a.id} value={a.id}>#{a.id} · {a.vacancy_title || `Vacancy ${a.vacancy}`}</option>
                ))}
              </select>
            ) : (
              <input
                required
                type="number"
                min="1"
                placeholder="Application ID"
                value={form.application}
                onChange={(e) => setForm((f) => ({ ...f, application: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date and time</label>
            <input
              required
              type="datetime-local"
              value={form.scheduled_at}
              onChange={(e) => setForm((f) => ({ ...f, scheduled_at: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location / Link</label>
            <input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="Zoom link or office address"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-20"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-60"
          >
            {saving ? 'Scheduling...' : 'Schedule'}
          </button>
        </form>
      </div>
    </div>
  );
}
