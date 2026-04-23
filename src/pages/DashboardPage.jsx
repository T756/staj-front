import { useState, useEffect } from 'react';
import { listApplications, updateApplicationStatus, withdrawApplication } from '../api/applications';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewing: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-100 text-gray-500',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchApplications = () => {
    setLoading(true);
    listApplications()
      .then(({ data }) => {
        const list = data.results ?? (Array.isArray(data) ? data : []);
        setApplications(list);
      })
      .catch(() => setError('Failed to load applications.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (id) => {
    if (!confirm('Withdraw this application?')) return;
    try {
      await withdrawApplication(id);
      fetchApplications();
    } catch {
      alert('Failed to withdraw application.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {user?.first_name || user?.email}
          </p>
        </div>
        <Link
          to="/jobs"
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Browse Jobs
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">My Applications</h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-red-600 text-center py-12">{error}</p>
        ) : applications.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-4">No applications yet</p>
            <Link
              to="/jobs"
              className="text-indigo-600 hover:underline text-sm font-medium"
            >
              Find your first job →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors"
              >
                <div className="flex-1">
                  <Link
                    to={`/jobs/${app.job || app.job_id}`}
                    className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
                  >
                    {app.job_title || app.job?.title || 'Job Application'}
                  </Link>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {app.company_name || app.job?.company_name || ''}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Applied {new Date(app.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${
                      STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {app.status || 'Pending'}
                  </span>
                  {app.status !== 'withdrawn' && app.status !== 'accepted' && (
                    <button
                      onClick={() => handleWithdraw(app.id)}
                      className="text-xs text-red-500 hover:text-red-700 hover:underline"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
