import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "./components/DashboardHeader";
import DashboardSidebar from "./components/DashboardSidebar";
import ProjectSection from "./components/ProjectSection";
import UploadScriptSection from "./components/UploadScriptSection";
import VideoGenerationSection from "./components/VideoGenerationSection";
import { useStoryboardFrames } from "../../store/storyboard.store";

const Dashboard = () => {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [currentSection, setCurrentSection] = useState("select-project");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Read frames from Zustand (single source of truth)
  const frames = useStoryboardFrames();

  const sectionRefs = {
    "select-project": useRef(null),
    "script-storyboard": useRef(null),
    "video-generation": useRef(null),
  };

  const scrollToSection = (sectionId) => {
    setCurrentSection(sectionId);
    sectionRefs[sectionId]?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="dcverse-dashboard">
      {/* Header */}
      <DashboardHeader
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="dashboard-layout">
        {/* Sidebar */}
        <DashboardSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          currentSection={currentSection}
          scrollToSection={scrollToSection}
        />

        {/* Backdrop - click outside to close sidebar */}
        {sidebarOpen && (
          <div
            className="sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main Content */}
        <main className="dashboard-main">
          {/* Section 0: Select Project */}
          <ProjectSection
            sectionRef={sectionRefs["select-project"]}
            selectedProjectId={selectedProjectId}
            onSelectProject={(projectId) => setSelectedProjectId(projectId)}
            onNext={() => scrollToSection("script-storyboard")}
          />

          {/* Section 1: Script & Storyboard (unified) */}
          <UploadScriptSection
            sectionRef={sectionRefs["script-storyboard"]}
            selectedProjectId={selectedProjectId}
            onProceedToVideo={() => scrollToSection("video-generation")}
          />

          {/* Section 2: Video Generation */}
          <VideoGenerationSection
            sectionRef={sectionRefs["video-generation"]}
            selectedProjectId={selectedProjectId}
            frames={frames}
            actors={[]}
          />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
