import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';
import { Toaster } from './components/ui/toaster';

// Pages
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import JobListing from './pages/JobListing';
import JobDetails from './pages/JobDetails';

// Job Seeker Pages
import AppliedJobs from './pages/seeker/AppliedJobs';
import SavedJobs from './pages/seeker/SavedJobs';
import SeekerWorkspace from './pages/seeker/SeekerWorkspace';

// Job Provider Pages
import Dashboard from './pages/provider/Dashboard';
import ProviderJobs from './pages/provider/ProviderJobs';
import Applicants from './pages/provider/Applicants';
import ProviderWorkspaces from './pages/provider/ProviderWorkspaces';
import CloudCredentialsGuide from './pages/CloudCredentialsGuide';

// Footer Pages
import About from './pages/About';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';
import Enterprise from './pages/Enterprise';
import CareerResources from './pages/CareerResources';
import SuccessStories from './pages/SuccessStories';
import FindTalent from './pages/FindTalent';
import Blog from './pages/Blog';
import Careers from './pages/Careers';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';
import GDPR from './pages/GDPR';

// Protected Route Component
const ProtectedRoute = ({ children, requiredUserType }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredUserType && user?.user_type !== requiredUserType) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/jobs" element={<JobListing />} />
          <Route path="/jobs/:id" element={<JobDetails />} />

          {/* Footer Pages */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/enterprise" element={<Enterprise />} />
          <Route path="/career-resources" element={<CareerResources />} />
          <Route path="/success-stories" element={<SuccessStories />} />
          <Route path="/find-talent" element={<FindTalent />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/gdpr" element={<GDPR />} />

          {/* Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Job Seeker Routes */}
          <Route
            path="/seeker/applied"
            element={
              <ProtectedRoute>
                <AppliedJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seeker/saved"
            element={
              <ProtectedRoute>
                <SavedJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seeker/workspace"
            element={
              <ProtectedRoute>
                <SeekerWorkspace />
              </ProtectedRoute>
            }
          />

          {/* Job Provider Routes */}
          <Route
            path="/provider/dashboard"
            element={
              <ProtectedRoute requiredUserType="org_provider">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/jobs"
            element={
              <ProtectedRoute requiredUserType="org_provider">
                <ProviderJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/applicants"
            element={
              <ProtectedRoute requiredUserType="org_provider">
                <Applicants />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/workspaces"
            element={
              <ProtectedRoute requiredUserType="org_provider">
                <ProviderWorkspaces />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cloud-credentials-guide"
            element={
              <ProtectedRoute requiredUserType="org_provider">
                <CloudCredentialsGuide />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;

