import { useCallback, useEffect, useState } from 'react';
import { listMessages, sendMessage, listApplications } from '../api/applications';
import { listMyJobs, getJobApplicants } from '../api/jobs';
import { useAuth } from '../context/AuthContextValue';
import { isEmployer } from '../utils/user';

export default function MessagesPage() {
  const { user } = useAuth();
  const employer = isEmployer(user);

  const [messages, setMessages] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    application: '',
    content: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: messagesData } = await listMessages();
      setMessages(messagesData.results ?? (Array.isArray(messagesData) ? messagesData : []));

      let appList = [];
      if (employer) {
        const { data: jobsData } = await listMyJobs();
        const jobs = jobsData.results ?? (Array.isArray(jobsData) ? jobsData : []);
        const appResponses = await Promise.all(
          jobs.map((job) => getJobApplicants(job.id).catch(() => ({ data: [] })))
        );
        appList = appResponses.flatMap((res) => res.data.results ?? (Array.isArray(res.data) ? res.data : []));
      } else {
        const { data: appsData } = await listApplications();
        const rawApps = appsData.results ?? (Array.isArray(appsData) ? appsData : []);
        // Employer can allow applicant messaging by moving status away from PENDING.
        appList = rawApps.filter((app) => app.status !== 'PENDING');
      }

      setApplications(appList);
      setForm((f) => (f.application || appList.length === 0 ? f : { ...f, application: String(appList[0].id) }));
    } catch {
      setError('Failed to load messages.');
    } finally {
      setLoading(false);
    }
  }, [employer]);

  useEffect(() => {
    queueMicrotask(loadData);
  }, [loadData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await sendMessage({
        application: Number(form.application),
        content: form.content,
      });
      setForm((f) => ({ ...f, content: '' }));
      await loadData();
    } catch (err) {
      const data = err.response?.data;
      setError(typeof data === 'object' ? Object.values(data).flat().join(' ') : 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-500">No messages yet.</p>
        ) : (
          <div className="space-y-3 max-h-[70vh] overflow-auto pr-1">
            {messages.map((m) => (
              <div key={m.id} className="border border-gray-100 rounded-xl p-3">
                <p className="text-xs text-gray-500">Application #{m.application}</p>
                <p className="text-sm text-gray-800 mt-1">{m.content}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(m.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Send Message</h2>
        {employer && (
          <p className="text-sm text-gray-500 mb-4">
            As an employer, you can message applicants from your vacancy applications.
          </p>
        )}
        {!employer && (
          <p className="text-sm text-gray-500 mb-4">
            You can message employers only for applications where messaging is allowed.
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Application</label>
            <select
              required
              value={form.application}
              onChange={(e) => setForm((f) => ({ ...f, application: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {applications.length === 0 && <option value="">No available applications for messaging</option>}
              {applications.map((a) => (
                <option key={a.id} value={a.id}>
                  #{a.id} · {a.vacancy_title || `Vacancy ${a.vacancy}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              required
              minLength={1}
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-24"
            />
          </div>

          <button
            type="submit"
            disabled={sending || !form.application}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-60"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
