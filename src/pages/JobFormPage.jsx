import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createVacancy, updateVacancy, getVacancy } from '../api/jobs';

const JOB_TYPES = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' },
];

const EMPTY_FORM = {
  title: '',
  description: '',
  requirements: '',
  location: '',
  job_type: 'full_time',
  salary_min: '',
  salary_max: '',
};

export default function JobFormPage() {
  const { id } = useParams(); // present when editing
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getVacancy(id)
      .then(({ data }) => {
        setForm({
          title: data.title || '',
          description: data.description || '',
          requirements: data.requirements || '',
          location: data.location || '',
          job_type: data.job_type || 'full_time',
          salary_min: data.salary_min ?? '',
          salary_max: data.salary_max ?? '',
        });
      })
      .catch(() => setError('Failed to load job.'))
      .finally(() => setFetching(false));
  }, [id]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload = {
      ...form,
      salary_min: form.salary_min === '' ? null : Number(form.salary_min),
      salary_max: form.salary_max === '' ? null : Number(form.salary_max),
    };
    try {
      if (id) {
        await updateVacancy(id, payload);
      } else {
        await createVacancy(payload);
      }
      navigate('/employer/jobs');
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === 'object') {
        setError(Object.values(data).flat().join(' '));
      } else {
        setError('Failed to save job. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button
        onClick={() => navigate('/employer/jobs')}
        className="text-sm text-indigo-600 hover:underline mb-6 flex items-center gap-1"
      >
        ← Back to My Listings
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          {id ? 'Edit Job Listing' : 'Post a New Job'}
        </h1>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={set('title')}
              placeholder="e.g. Senior Frontend Engineer"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
              <select
                value={form.job_type}
                onChange={set('job_type')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {JOB_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={set('location')}
                placeholder="e.g. Istanbul / Remote"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary ($)</label>
              <input
                type="number"
                min="0"
                value={form.salary_min}
                onChange={set('salary_min')}
                placeholder="e.g. 60000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary ($)</label>
              <input
                type="number"
                min="0"
                value={form.salary_max}
                onChange={set('salary_max')}
                placeholder="e.g. 90000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={6}
              value={form.description}
              onChange={set('description')}
              placeholder="Describe the role, responsibilities, and team…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
            <textarea
              rows={4}
              value={form.requirements}
              onChange={set('requirements')}
              placeholder="List required skills, experience, education…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/employer/jobs')}
              className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
            >
              {loading ? 'Saving…' : id ? 'Update Job' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
