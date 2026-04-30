import { useState, useEffect } from 'react';
import { getMe, updateMe } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import {
  listResumes,
  createResume,
  updateResume,
  deleteResume,
} from '../api/resumes';

const emptyResume = {
  title: '',
  summary: '',
  desired_salary: '',
  visibility: 'PUBLIC',
};

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resumeSaving, setResumeSaving] = useState(false);
  const [error, setError] = useState('');
  const [resumeError, setResumeError] = useState('');
  const [resumeForm, setResumeForm] = useState(emptyResume);
  const [editingResumeId, setEditingResumeId] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [{ data: meData }, { data: resumesData }] = await Promise.all([
          getMe(),
          listResumes(),
        ]);
        if (!mounted) return;
        setProfile(meData.profile ?? {});
        setResumes(resumesData.results ?? (Array.isArray(resumesData) ? resumesData : []));
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...profile };
      await updateMe(payload);
      // refresh page data
      const { data } = await getMe();
      setProfile(data.profile ?? {});
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const refreshResumes = async () => {
    const { data } = await listResumes();
    setResumes(data.results ?? (Array.isArray(data) ? data : []));
  };

  const handleResumeSave = async (e) => {
    e.preventDefault();
    setResumeError('');
    setResumeSaving(true);

    const payload = {
      ...resumeForm,
      desired_salary: resumeForm.desired_salary === '' ? null : Number(resumeForm.desired_salary),
    };

    try {
      if (editingResumeId) {
        await updateResume(editingResumeId, payload);
      } else {
        await createResume(payload);
      }
      await refreshResumes();
      setResumeForm(emptyResume);
      setEditingResumeId(null);
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === 'object') {
        setResumeError(Object.values(data).flat().join(' '));
      } else {
        setResumeError('Failed to save resume.');
      }
    } finally {
      setResumeSaving(false);
    }
  };

  const startEditResume = (resume) => {
    setEditingResumeId(resume.id);
    setResumeForm({
      title: resume.title || '',
      summary: resume.summary || '',
      desired_salary: resume.desired_salary ?? '',
      visibility: resume.visibility || 'PUBLIC',
    });
  };

  const handleDeleteResume = async (resumeId) => {
    if (!confirm('Delete this resume?')) return;
    try {
      await deleteResume(resumeId);
      await refreshResumes();
      if (editingResumeId === resumeId) {
        setEditingResumeId(null);
        setResumeForm(emptyResume);
      }
    } catch {
      setResumeError('Failed to delete resume.');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 mt-1">Update your personal info and manage your resumes.</p>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-gray-900">Personal information</h2>
            <p className="text-sm text-gray-500 mt-1">This appears in your account profile.</p>
          </div>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First name</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                  value={profile?.first_name || ''}
                  onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Last name</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                  value={profile?.last_name || ''}
                  onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                  value={profile?.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                  value={profile?.city || ''}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save profile'}
              </button>
              <span className="text-sm text-gray-500">
                Signed in as {user?.email} · {user?.role || 'JOB_SEEKER'}
              </span>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Create resume</h2>
                <p className="text-sm text-gray-500 mt-1">This is what job seekers select when applying.</p>
              </div>
              {editingResumeId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingResumeId(null);
                    setResumeForm(emptyResume);
                  }}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Cancel edit
                </button>
              )}
            </div>

            {resumeError && <p className="text-red-600 mb-4">{resumeError}</p>}

            <form onSubmit={handleResumeSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                  value={resumeForm.title}
                  onChange={(e) => setResumeForm({ ...resumeForm, title: e.target.value })}
                  placeholder="Frontend Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Summary</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 min-h-28 resize-y"
                  value={resumeForm.summary}
                  onChange={(e) => setResumeForm({ ...resumeForm, summary: e.target.value })}
                  placeholder="Brief summary of your skills and experience"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Desired salary</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                    value={resumeForm.desired_salary}
                    onChange={(e) => setResumeForm({ ...resumeForm, desired_salary: e.target.value })}
                    placeholder="120000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Visibility</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                    value={resumeForm.visibility}
                    onChange={(e) => setResumeForm({ ...resumeForm, visibility: e.target.value })}
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="ONLY_BY_LINK">Only by link</option>
                    <option value="HIDDEN">Hidden</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={resumeSaving}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg disabled:opacity-60"
              >
                {resumeSaving ? 'Saving…' : editingResumeId ? 'Update resume' : 'Create resume'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your resumes</h2>
            {resumes.length === 0 ? (
              <p className="text-sm text-gray-500">You have no resumes yet. Create one to apply faster.</p>
            ) : (
              <div className="space-y-3">
                {resumes.map((resume) => (
                  <div key={resume.id} className="p-4 rounded-xl border border-gray-100">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{resume.title || `Resume #${resume.id}`}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{resume.summary || 'No summary provided.'}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {resume.visibility || 'PUBLIC'}
                          {resume.desired_salary ? ` · Desired salary ${resume.desired_salary}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditResume(resume)}
                          className="text-sm text-indigo-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteResume(resume.id)}
                          className="text-sm text-red-600 hover:underline"
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
        </div>
      </div>
    </div>
  );
}
