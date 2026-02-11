import React from 'react';
import { FolderOpen, User, FileText, Film, Video, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export default function DashboardSidebar({ sidebarOpen, setSidebarOpen, currentSection, scrollToSection }) {
  const sections = [
    { id: 'select-project', title: '1. Select Project', icon: FolderOpen },
    { id: 'select-avatar', title: '2. Select Avatar', icon: User },
    { id: 'upload-script', title: '3. Upload Script', icon: FileText },
    { id: 'storyboard', title: '4. Generate Storyboard', icon: Film },
    { id: 'video-generation', title: '5. Create Video', icon: Video },
  ];
  return (
    <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-content">
        <div className="sidebar-header">
          <h2 className="sidebar-title">CREATION FLOW</h2>
          {setSidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="sidebar-close-btn"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
        <nav className="sidebar-nav">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`nav-item ${currentSection === section.id ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5" />
                <span>{section.title}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <h3 className="footer-title">Quick Start Guide</h3>
          <p className="footer-text">Create Yours Guide</p>
          <p className="footer-text">Tech Review Check</p>
        </div>
      </div>
    </aside>
  );
}
