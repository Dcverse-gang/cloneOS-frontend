import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Video,
  Film,
  UserPlus,
  Menu,
  X,
  LogOut,
  CreditCard,
  HelpCircle,
  BookOpen,
  Zap,
  CheckSquare,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useAuthStore } from "../store/auth.store";
import { useToast } from "../hooks/use-toast";
import { logout } from "../services/auth.service";

const navItems = [
  { to: "/create-video", label: "Create Video", icon: Video },
  { to: "/videos", label: "View Videos", icon: Film },
  { to: "/create-clone", label: "Make Clone", icon: UserPlus },
];

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };

  const userInitials = user?.email ? user.email.charAt(0).toUpperCase() : "U";

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-header-left">
            <Button
              variant="ghost"
              size="sm"
              className="app-mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
            <div className="app-logo">
              <img
                src="https://customer-assets.emergentagent.com/job_5e208c76-5a6c-4a32-8918-b9a39e80d303/artifacts/mvzy74up_Logo%20%282%29.png"
                alt="DCVerse"
                className="app-logo-img"
              />
              <span className="app-logo-text">DCVerse</span>
            </div>
          </div>

          <div className="app-header-actions">
            {user && (
              <>
                <div className="app-credits-badge">
                  <CreditCard className="w-3.5 h-3.5 text-violet-400" />
                  <span>{user.creditsBalance ?? 0} credits</span>
                </div>
                <div className="app-user-badge">
                  <div className="app-user-avatar">{userInitials}</div>
                  <span className="app-user-email">{user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="app-logout-btn"
                  onClick={handleLogout}
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="app-help-btn"
                  title="Help"
                >
                  <HelpCircle className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="app-body">
        {/* Sidebar backdrop (mobile) */}
        {sidebarOpen && (
          <div
            className="app-sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`app-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="app-sidebar-inner">
            {/* Close button on mobile */}
            <div className="app-sidebar-mobile-header">
              <span className="app-sidebar-section-label">Navigation</span>
              <Button
                variant="ghost"
                size="icon"
                className="app-sidebar-close"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Nav */}
            <nav className="app-sidebar-nav">
              <p className="app-sidebar-section-label">Pages</p>
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `app-nav-item${isActive ? " active" : ""}`
                  }
                >
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Footer */}
            <div className="app-sidebar-footer">
              <p className="app-sidebar-section-label">Resources</p>
              <div className="app-sidebar-footer-links">
                <button className="app-sidebar-footer-link">
                  <BookOpen className="w-3.5 h-3.5" />
                  Quick Start Guide
                </button>
                <button className="app-sidebar-footer-link">
                  <Zap className="w-3.5 h-3.5" />
                  Create Yours Guide
                </button>
                <button className="app-sidebar-footer-link">
                  <CheckSquare className="w-3.5 h-3.5" />
                  Tech Review Check
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
