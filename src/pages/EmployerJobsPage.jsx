import { useCallback, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listMyJobs, deleteJob, getJobApplicants } from '../api/jobs';
import { updateApplicationStatus, createInterview } from '../api/applications';
import { useAuth } from '../context/AuthContextValue';
import { getDisplayName } from '../utils/user';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  VIEWED: 'bg-blue-100 text-blue-800',
  INTERVIEW: 'bg-purple-100 text-purple-800',
  OFFER: 'bg-teal-100 text-teal-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  WITHDRAWN: 'bg-gray-100 text-gray-500',
};

export default function EmployerJobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // For selected job's applications
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState(null);

  const fetchJobs = useCallback(() => {
    setLoading(true);
    listMyJobs()
      .then(({ data }) => {
        const list = data.results ?? (Array.isArray(data) ? data : []);
        setJobs(list);
      })
      .catch(() => setError('Failed to load job listings.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    queueMicrotask(fetchJobs);
  }, [fetchJobs]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this job listing? This cannot be undone.')) return;
    try {
      await deleteJob(id);
      fetchJobs();
      if (selectedJob?.id === id) {
        setSelectedJob(null);
        setApplications([]);
      }
    } catch {
      alert('Failed to delete job.');
    }
  };

  const viewApplications = (job) => {
    setSelectedJob(job);
    setAppsLoading(true);
    getJobApplicants(job.id)
      .then(({ data }) => {
        setApplications(data.results ?? (Array.isArray(data) ? data : []));
      })
      .catch(() => setApplications([]))
      .finally(() => setAppsLoading(false));
  };

  const refreshSelectedApplications = () => {
    if (!selectedJob) return;
    viewApplications(selectedJob);
  };

  const handleStatusUpdate = async (applicationId, status) => {
    setStatusLoadingId(applicationId);
    try {
      await updateApplicationStatus(applicationId, status);
      refreshSelectedApplications();
    } catch {
      alert('Failed to update application status.');
    } finally {
      setStatusLoadingId(null);
    }
  };

  const handleScheduleInterview = async (applicationId) => {
    const when = prompt('Interview datetime (ISO), e.g. 2026-05-05T10:00:00Z');
    if (!when) return;
    const location = prompt('Location or video link') || '';

    setStatusLoadingId(applicationId);
    try {
      await createInterview({
        application: applicationId,
        scheduled_at: when,
        location,
      });
      await updateApplicationStatus(applicationId, 'INTERVIEW');
      refreshSelectedApplications();
    } catch {
      alert('Failed to schedule interview. Check datetime format.');
    } finally {
      setStatusLoadingId(null);
    }
  };

  const canApplicantMessage = (application) => application.status !== 'PENDING';

  const handleMessagingPermission = async (application, allow) => {
    const nextStatus = allow ? 'VIEWED' : 'PENDING';
    await handleStatusUpdate(application.id, nextStatus);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Job Listings</h1>
          <p className="text-gray-500 mt-1">{getDisplayName(user)}</p>
        </div>
        <Link
          to="/employer/jobs/new"
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          + Post New Job
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Jobs list */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Listings</h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <p className="text-red-600 py-8 text-center">{error}</p>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No listings yet</p>
              <Link to="/employer/jobs/new" className="text-indigo-600 hover:underline text-sm">
                Post your first job →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className={`p-4 border rounded-xl cursor-pointer transition-colors ${
                    selectedJob?.id === job.id
                      ? 'border-indigo-400 bg-indigo-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                  onClick={() => viewApplications(job)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{job.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {job.location || 'No location'} · {job.employment_type?.toLowerCase().replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link
                        to={`/employer/jobs/${job.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(job.id); }}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Applications panel */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedJob ? `Applications for "${selectedJob.title}"` : 'Select a job to see applications'}
          </h2>

          {!selectedJob ? (
            <div className="text-center py-12 text-gray-400">
              Click a job listing to view its applications
            </div>
          ) : appsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : applications.length === 0 ? (
            <p className="text-center py-12 text-gray-400">No applications yet</p>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="p-4 border border-gray-100 rounded-xl">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {app.applicant_name || app.applicant?.email || `Applicant #${app.id}`}
                      </p>
                      {(app.applicant?.profile?.first_name || app.applicant?.profile?.last_name) && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {(app.applicant.profile.first_name || '').trim()} {(app.applicant.profile.last_name || '').trim()}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        Applied {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {app.status || 'Pending'}
                    </span>
                  </div>
                  {app.cover_letter && (
                    <p className="mt-2 text-xs text-gray-500 line-clamp-2">{app.cover_letter}</p>
                  )}
                  {app.resume_url && (
                    <a
                      href={app.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-xs text-indigo-600 hover:underline"
                    >
                      View Resume →
                    </a>
                  )}
                  {!app.resume_url && app.resume && (
                    <p className="mt-2 text-xs text-gray-400">Resume ID: {app.resume}</p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={statusLoadingId === app.id}
                      onClick={() => handleMessagingPermission(app, !canApplicantMessage(app))}
                      className="text-xs px-2.5 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {canApplicantMessage(app) ? 'Block Applicant Message' : 'Allow Applicant Message'}
                    </button>
                    <button
                      type="button"
                      disabled={statusLoadingId === app.id}
                      onClick={() => handleStatusUpdate(app.id, 'VIEWED')}
                      className="text-xs px-2.5 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Mark Viewed
                    </button>
                    <button
                      type="button"
                      disabled={statusLoadingId === app.id}
                      onClick={() => handleScheduleInterview(app.id)}
                      className="text-xs px-2.5 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Schedule Interview
                    </button>
                    <button
                      type="button"
                      disabled={statusLoadingId === app.id}
                      onClick={() => handleStatusUpdate(app.id, 'ACCEPTED')}
                      className="text-xs px-2.5 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      disabled={statusLoadingId === app.id}
                      onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                      className="text-xs px-2.5 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
