import { Link } from 'react-router-dom';

const TYPE_COLORS = {
  FULL_TIME: 'bg-green-100 text-green-800',
  PART_TIME: 'bg-blue-100 text-blue-800',
  CONTRACT: 'bg-orange-100 text-orange-800',
  INTERNSHIP: 'bg-purple-100 text-purple-800',
  REMOTE: 'bg-teal-100 text-teal-800',
};

export default function JobCard({ job }) {
  const typeLabel = job.employment_type?.toLowerCase().replace(/_/g, ' ') || 'full time';
  const colorClass = TYPE_COLORS[job.employment_type] || 'bg-gray-100 text-gray-700';

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-indigo-300 transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-lg truncate">
            {job.title}
          </h3>
          <p className="text-gray-500 text-sm mt-0.5">{job.employer_name || job.company_name || job.company}</p>
          {job.location && (
            <p className="text-gray-400 text-sm mt-1">📍 {job.location}</p>
          )}
        </div>
        <span
          className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full capitalize ${colorClass}`}
        >
          {typeLabel}
        </span>
      </div>

      {job.salary_min && job.salary_max && (
        <p className="text-indigo-600 text-sm font-medium mt-3">
          ${Number(job.salary_min).toLocaleString()} – ${Number(job.salary_max).toLocaleString()}
        </p>
      )}

      <p className="text-gray-500 text-sm mt-3 line-clamp-2">
        {job.description}
      </p>

      <div className="mt-4 text-xs text-gray-400">
        Posted {new Date(job.created_at).toLocaleDateString()}
      </div>
    </Link>
  );
}
