import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-24 pb-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Find Your Next{' '}
          <span className="text-indigo-600">Dream Job</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Thousands of opportunities from top companies. Start your search today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/jobs"
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-lg"
          >
            Browse Jobs
          </Link>
          {!user && (
            <Link
              to="/register"
              className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold rounded-xl transition-colors text-lg"
            >
              Create Account
            </Link>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: '🔍',
              title: 'Smart Search',
              desc: 'Filter by location, type, and salary to find exactly what you want.',
            },
            {
              icon: '⚡',
              title: 'Quick Apply',
              desc: 'Apply to jobs in seconds with your saved profile and cover letter.',
            },
            {
              icon: '📊',
              title: 'Track Applications',
              desc: 'See the status of every application in your personal dashboard.',
            },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-200 p-8 text-center hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
