import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import JobFormPage from './pages/JobFormPage';
import EmployerJobsPage from './pages/EmployerJobsPage';
import CompaniesPage from './pages/CompaniesPage';
import MessagesPage from './pages/MessagesPage';
import InterviewsPage from './pages/InterviewsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />

            {/* Protected: any logged-in user */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/companies"
              element={
                <ProtectedRoute>
                  <CompaniesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications/messages"
              element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications/interviews"
              element={
                <ProtectedRoute>
                  <InterviewsPage />
                </ProtectedRoute>
              }
            />

            {/* Protected: employers only */}
            <Route
              path="/employer/jobs"
              element={
                <ProtectedRoute requireEmployer>
                  <EmployerJobsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/jobs/new"
              element={
                <ProtectedRoute requireEmployer>
                  <JobFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/jobs/:id/edit"
              element={
                <ProtectedRoute requireEmployer>
                  <JobFormPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
