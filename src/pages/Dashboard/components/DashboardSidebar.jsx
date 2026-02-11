import React from 'react';
import { FolderOpen, FileText, Video, X, BookOpen, Zap, CheckSquare } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export default function DashboardSidebar({ sidebarOpen, setSidebarOpen, currentSection, scrollToSection }) {
  const sections = [
    { id: 'select-project', title: 'Select Project', icon: FolderOpen },
    { id: 'script-storyboard', title: 'Script & Storyboard', icon: FileText },
    { id: 'video-generation', title: 'Create Video', icon: Video },
  ];

  return (
    <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-content">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Workflow</h2>
          {setSidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="sidebar-close-btn"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <nav className="sidebar-nav">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const isActive = currentSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-[18px] h-[18px]" />
                <span>{section.title}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <h3 className="footer-title">Resources</h3>
          <div className="flex flex-col gap-0.5">
            <p className="footer-text flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5" />
              Quick Start Guide
            </p>
            <p className="footer-text flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" />
              Create Yours Guide
            </p>
            <p className="footer-text flex items-center gap-2">
              <CheckSquare className="w-3.5 h-3.5" />
              Tech Review Check
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
