import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { User, Menu, X } from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';
import { useAuthStore } from '../../../store/auth.store';
import { logout } from '../../../services/auth.service';

export default function DashboardHeader({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    logout();
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    navigate('/login');
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };
  return (
    <header className="dashboard-header">
      <div className="header-content">
        <div className="logo-section">
          <img
            src="https://customer-assets.emergentagent.com/job_5e208c76-5a6c-4a32-8918-b9a39e80d303/artifacts/mvzy74up_Logo%20%282%29.png"
            alt="DCVerse"
            className="logo"
          />
          <span className="logo-text">DCVERSE</span>
        </div>
        <div className="header-actions">
          {user ? (
            <>
              <div className="user-info flex items-center gap-2 text-white">
                <User className="w-4 h-4" />
                <span className="text-sm">{user.email}</span>
                <span className="text-xs bg-purple-600 px-2 py-1 rounded">
                  {user.creditsBalance} credits
                </span>
              </div>
              <Button
                variant="ghost"
                className="header-btn text-white hover:bg-white/10"
                onClick={handleLogout}
              >
                <User className="w-4 h-4 mr-1" />
                Account
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              className="header-btn text-white hover:bg-white/10"
              onClick={handleLoginRedirect}
            >
              <User className="w-4 h-4 mr-1" />
              Login
            </Button>
          )}
          <Button
            variant="ghost"
            className="header-btn text-white hover:bg-white/10"
          >
            1834 HELP
          </Button>
        </div>
        <Button
          variant="ghost"
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </Button>
      </div>
    </header>
  );
}
