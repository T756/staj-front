import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-600 tracking-tight">
          JobPortal
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/jobs" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
            Browse Jobs
          </Link>

          {user ? (
            <>
              {user.is_employer && (
                <Link
                  to="/employer/jobs"
                  className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  My Listings
                </Link>
              )}
              <Link
                to="/dashboard"
                className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Dashboard
              </Link>
              <span className="text-sm text-gray-500 hidden sm:block">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
