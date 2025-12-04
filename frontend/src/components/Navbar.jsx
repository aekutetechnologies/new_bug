import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { User, LogOut, Briefcase, FileText, Bookmark, Server, LayoutDashboard, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">Bugbear</span>
          </Link>

          <div className="hidden md:flex space-x-6">
            <Link to="/jobs" className="text-gray-700 hover:text-primary">
              Jobs
            </Link>
            {isAuthenticated && (
              <>
                {user?.user_type === 'org_provider' ? (
                  <>
                    <Link to="/provider/dashboard" className="text-gray-700 hover:text-primary">
                      Dashboard
                    </Link>
                    <Link to="/provider/jobs" className="text-gray-700 hover:text-primary">
                      My Jobs
                    </Link>
                    <Link to="/provider/applicants" className="text-gray-700 hover:text-primary">
                      Applicants
                    </Link>
                    <Link to="/provider/workspaces" className="text-gray-700 hover:text-primary">
                      My VDIs
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/seeker/applied" className="text-gray-700 hover:text-primary">
                      Applied Jobs
                    </Link>
                    <Link to="/seeker/saved" className="text-gray-700 hover:text-primary">
                      Saved Jobs
                    </Link>
                    <Link to="/seeker/workspace" className="text-gray-700 hover:text-primary">
                      My Workspaces
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>{user?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  {user?.user_type === 'org_provider' ? (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/provider/dashboard')}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/provider/jobs')}>
                        <Briefcase className="mr-2 h-4 w-4" />
                        My Jobs
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/provider/workspaces')}>
                        <Server className="mr-2 h-4 w-4" />
                        My VDIs
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/seeker/applied')}>
                        <FileText className="mr-2 h-4 w-4" />
                        Applied Jobs
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/seeker/saved')}>
                        <Bookmark className="mr-2 h-4 w-4" />
                        Saved Jobs
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

