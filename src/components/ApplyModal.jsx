import { useState } from 'react';
import { applyToJob } from '../api/applications';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ApplyModal({ job, onClose, onSuccess }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold mb-3">Sign in to Apply</h2>
          <p className="text-gray-500 mb-6">You need to be logged in to apply for jobs.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await applyToJob({ job: job.id, cover_letter: coverLetter, resume_url: resumeUrl });
      onSuccess?.();
    } catch (err) {
      const msg = err.response?.data;
      if (typeof msg === 'object') {
        setError(Object.values(msg).flat().join(' '));
      } else {
        setError('Failed to submit application. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Apply for {job.title}</h2>
        <p className="text-gray-500 text-sm mb-6">{job.company_name || job.company}</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resume URL <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="url"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              placeholder="https://your-resume.com/resume.pdf"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover Letter <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={5}
              placeholder="Tell the employer why you're a great fit…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
            >
              {loading ? 'Submitting…' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
