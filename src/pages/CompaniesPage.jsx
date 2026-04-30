import { useEffect, useMemo, useState } from 'react';
import {
  listCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  listCompanyFollowers,
  followCompany,
  unfollowCompany,
  listCompanyReviews,
  reviewCompany,
} from '../api/companies';
import { useAuth } from '../context/AuthContext';
import { isEmployer } from '../utils/user';

const EMPTY_COMPANY_FORM = {
  name: '',
  description: '',
  website: '',
  industry: '',
  city: '',
  employee_count: '',
  founded_year: '',
};

export default function CompaniesPage() {
  const { user } = useAuth();
  const employer = isEmployer(user);

  const [companies, setCompanies] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [companyForm, setCompanyForm] = useState(EMPTY_COMPANY_FORM);
  const [companySaving, setCompanySaving] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState(null);

  const [reviewForm, setReviewForm] = useState({ company: '', rating: 5, comment: '' });
  const [reviewSaving, setReviewSaving] = useState(false);

  const followedByCompanyId = useMemo(() => {
    const map = new Map();
    followers.forEach((f) => {
      map.set(f.company, f.id);
    });
    return map;
  }, [followers]);

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [{ data: companiesData }, { data: followersData }, { data: reviewsData }] = await Promise.all([
        listCompanies(),
        listCompanyFollowers(),
        listCompanyReviews(),
      ]);
      setCompanies(companiesData.results ?? (Array.isArray(companiesData) ? companiesData : []));
      setFollowers(followersData.results ?? (Array.isArray(followersData) ? followersData : []));
      setReviews(reviewsData.results ?? (Array.isArray(reviewsData) ? reviewsData : []));
    } catch {
      setError('Failed to load companies data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setCompanySaving(true);
    setError('');

    const payload = {
      ...companyForm,
      founded_year: companyForm.founded_year === '' ? null : Number(companyForm.founded_year),
    };

    try {
      if (editingCompanyId) {
        await updateCompany(editingCompanyId, payload);
      } else {
        await createCompany(payload);
      }
      setCompanyForm(EMPTY_COMPANY_FORM);
      setEditingCompanyId(null);
      await loadAll();
    } catch (err) {
      const data = err.response?.data;
      setError(typeof data === 'object' ? Object.values(data).flat().join(' ') : 'Failed to save company.');
    } finally {
      setCompanySaving(false);
    }
  };

  const handleDeleteCompany = async (id) => {
    if (!confirm('Delete this company?')) return;
    try {
      await deleteCompany(id);
      await loadAll();
    } catch {
      setError('Failed to delete company.');
    }
  };

  const handleToggleFollow = async (companyId) => {
    const followerId = followedByCompanyId.get(companyId);
    try {
      if (followerId) {
        await unfollowCompany(followerId);
      } else {
        await followCompany(companyId);
      }
      await loadAll();
    } catch {
      setError('Failed to update follow status.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSaving(true);
    setError('');
    try {
      await reviewCompany({
        company: Number(reviewForm.company),
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });
      setReviewForm({ company: '', rating: 5, comment: '' });
      await loadAll();
    } catch (err) {
      const data = err.response?.data;
      setError(typeof data === 'object' ? Object.values(data).flat().join(' ') : 'Failed to submit review.');
    } finally {
      setReviewSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
        <p className="text-gray-500 mt-1">Browse companies, follow them, and leave reviews.</p>
      </div>

      {error && <div className="p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">{error}</div>}

      {employer && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingCompanyId ? 'Edit Company Profile' : 'Create Company Profile'}
          </h2>
          <form onSubmit={handleCompanySubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                required
                placeholder="Company name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={companyForm.name}
                onChange={(e) => setCompanyForm((f) => ({ ...f, name: e.target.value }))}
              />
              <input
                placeholder="Website"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={companyForm.website}
                onChange={(e) => setCompanyForm((f) => ({ ...f, website: e.target.value }))}
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <input
                placeholder="Industry"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={companyForm.industry}
                onChange={(e) => setCompanyForm((f) => ({ ...f, industry: e.target.value }))}
              />
              <input
                placeholder="City"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={companyForm.city}
                onChange={(e) => setCompanyForm((f) => ({ ...f, city: e.target.value }))}
              />
              <input
                placeholder="Employees"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={companyForm.employee_count}
                onChange={(e) => setCompanyForm((f) => ({ ...f, employee_count: e.target.value }))}
              />
            </div>

            <textarea
              placeholder="Description"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-24"
              value={companyForm.description}
              onChange={(e) => setCompanyForm((f) => ({ ...f, description: e.target.value }))}
            />

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={companySaving}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-60"
              >
                {companySaving ? 'Saving...' : editingCompanyId ? 'Update Company' : 'Create Company'}
              </button>
              {editingCompanyId && (
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-gray-300"
                  onClick={() => {
                    setEditingCompanyId(null);
                    setCompanyForm(EMPTY_COMPANY_FORM);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">All Companies</h2>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : companies.length === 0 ? (
            <p className="text-gray-500">No companies found.</p>
          ) : (
            <div className="space-y-3">
              {companies.map((c) => (
                <div key={c.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{c.name}</h3>
                      <p className="text-sm text-gray-500">{c.industry || 'General'} · {c.city || 'Unknown city'}</p>
                      {c.description && <p className="text-sm text-gray-600 mt-2">{c.description}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleFollow(c.id)}
                      className="text-xs px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50"
                    >
                      {followedByCompanyId.has(c.id) ? 'Unfollow' : 'Follow'}
                    </button>
                  </div>

                  {employer && (
                    <div className="mt-3 flex gap-3">
                      <button
                        type="button"
                        className="text-xs text-indigo-600 hover:underline"
                        onClick={() => {
                          setEditingCompanyId(c.id);
                          setCompanyForm({
                            name: c.name || '',
                            description: c.description || '',
                            website: c.website || '',
                            industry: c.industry || '',
                            city: c.city || '',
                            employee_count: c.employee_count || '',
                            founded_year: c.founded_year ?? '',
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-xs text-red-600 hover:underline"
                        onClick={() => handleDeleteCompany(c.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Write Review</h2>
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <select
                required
                value={reviewForm.company}
                onChange={(e) => setReviewForm((f) => ({ ...f, company: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Select company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm((f) => ({ ...f, rating: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="5">5</option>
                <option value="4">4</option>
                <option value="3">3</option>
                <option value="2">2</option>
                <option value="1">1</option>
              </select>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-20"
                placeholder="Share your experience"
              />
              <button
                type="submit"
                disabled={reviewSaving}
                className="px-4 py-2 rounded-lg bg-gray-900 text-white disabled:opacity-60"
              >
                {reviewSaving ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-gray-500">No reviews yet.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-auto pr-1">
                {reviews.map((r) => (
                  <div key={r.id} className="border border-gray-100 rounded-xl p-3">
                    <p className="text-sm font-medium text-gray-900">Company #{r.company}</p>
                    <p className="text-sm text-amber-600">Rating: {r.rating}/5</p>
                    {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
