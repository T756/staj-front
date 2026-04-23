import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVacancy } from '../api/jobs';
import { useAuth } from '../context/AuthContext';
import ApplyModal from '../components/ApplyModal';

export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApply, setShowApply] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    getVacancy(id)
      .then(({ data }) => setJob(data))
      .catch(() => setError('Job not found or has been removed.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <p className="text-gray-400 text-lg mb-6">{error || 'Job not found.'}</p>
        <button
          onClick={() => navigate('/jobs')}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  const isOwner = user && (user.id === job.created_by || user.is_staff);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <button
        onClick={() => navigate('/jobs')}
        className="text-sm text-indigo-600 hover:underline mb-6 flex items-center gap-1"
      >
        ← Back to Jobs
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-gray-500 mt-1 text-lg">{job.company_name || job.company}</p>
          </div>
          {!isOwner && (
            applied ? (
              <span className="shrink-0 px-5 py-2.5 bg-green-100 text-green-700 font-medium rounded-xl text-sm">
                ✓ Applied
              </span>
            ) : (
              <button
                onClick={() => setShowApply(true)}
                className="shrink-0 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                Apply Now
              </button>
            )
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-4 text-sm mb-8">
          {job.location && (
            <span className="flex items-center gap-1.5 text-gray-500">
              <span>📍</span> {job.location}
            </span>
          )}
          {job.job_type && (
            <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full capitalize">
              {job.job_type.replace('_', ' ')}
            </span>
          )}
          {job.salary_min && job.salary_max && (
            <span className="flex items-center gap-1.5 text-gray-500">
              💰 ${Number(job.salary_min).toLocaleString()} – ${Number(job.salary_max).toLocaleString()}
            </span>
          )}
          <span className="text-gray-400">
            Posted {new Date(job.created_at).toLocaleDateString()}
          </span>
        </div>

        <hr className="border-gray-100 mb-8" />

        {/* Description */}
        <div className="prose prose-gray max-w-none">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
          <div className="text-gray-600 whitespace-pre-wrap leading-relaxed">
            {job.description}
          </div>
        </div>

        {job.requirements && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
            <div className="text-gray-600 whitespace-pre-wrap leading-relaxed">
              {job.requirements}
            </div>
          </div>
        )}

        {/* Apply CTA */}
        {!isOwner && !applied && (
          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <button
              onClick={() => setShowApply(true)}
              className="px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
            >
              Apply for this Position
            </button>
          </div>
        )}
      </div>

      {showApply && (
        <ApplyModal
          job={job}
          onClose={() => setShowApply(false)}
          onSuccess={() => {
            setShowApply(false);
            setApplied(true);
          }}
        />
      )}
    </div>
  );
}
