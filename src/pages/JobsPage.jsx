import { useState, useEffect, useCallback } from 'react';
import { listVacancies, searchVacancies } from '../api/jobs';
import JobCard from '../components/JobCard';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [count, setCount] = useState(0);

  const fetchJobs = useCallback(async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      let data;
      if (search) {
        ({ data } = await searchVacancies({
          q: search,
          salary_min: salaryMin || undefined,
          salary_max: salaryMax || undefined,
          ...params,
        }));
        // Search returns a plain array
        const list = Array.isArray(data) ? data : (data.results ?? []);
        setJobs(list);
        setCount(list.length);
        setNextUrl(null);
        setPrevUrl(null);
      } else {
        ({ data } = await listVacancies({
          salary_min: salaryMin || undefined,
          salary_max: salaryMax || undefined,
          ...params,
        }));
        if (data.results !== undefined) {
          setJobs(data.results);
          setNextUrl(data.next);
          setPrevUrl(data.previous);
          setCount(data.count);
        } else {
          setJobs(Array.isArray(data) ? data : []);
          setCount(Array.isArray(data) ? data.length : 0);
        }
      }
    } catch {
      setError('Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  }, [search, salaryMin, salaryMax]);

  useEffect(() => {
    const timer = setTimeout(() => fetchJobs(), 300);
    return () => clearTimeout(timer);
  }, [fetchJobs]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Browse Jobs</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, keyword…"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="number"
          min="0"
          value={salaryMin}
          onChange={(e) => setSalaryMin(e.target.value)}
          placeholder="Min salary"
          className="w-full sm:w-36 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="number"
          min="0"
          value={salaryMax}
          onChange={(e) => setSalaryMax(e.target.value)}
          placeholder="Max salary"
          className="w-full sm:w-36 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-600">{error}</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-xl mb-2">No jobs found</p>
          <p className="text-sm">Try adjusting your search filters.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{count} job{count !== 1 ? 's' : ''} found</p>
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {/* Pagination */}
          {(prevUrl || nextUrl) && (
            <div className="flex justify-center gap-4 mt-10">
              <button
                onClick={() => prevUrl && fetchJobs({ page: new URL(prevUrl).searchParams.get('page') })}
                disabled={!prevUrl}
                className="px-5 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <button
                onClick={() => nextUrl && fetchJobs({ page: new URL(nextUrl).searchParams.get('page') })}
                disabled={!nextUrl}
                className="px-5 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
