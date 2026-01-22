import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { mockStoryboardFrames } from "../../components/mock";
import DashboardHeader from "./components/DashboardHeader";
import DashboardSidebar from "./components/DashboardSidebar";
import ProjectSection from "./components/ProjectSection";
import AvatarSection from "./components/AvatarSection";
import UploadScriptSection from "./components/UploadScriptSection";
import StoryboardSection from "./components/StoryboardSection";
import VideoGenerationSection from "./components/VideoGenerationSection";

const Dashboard = () => {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedActors, setSelectedActors] = useState([]);
  const [currentSection, setCurrentSection] = useState("select-project");
  const [storyboardFrames, setStoryboardFrames] =
    useState(mockStoryboardFrames);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const sectionRefs = {
    "select-project": useRef(null),
    "select-avatar": useRef(null),
    "upload-script": useRef(null),
    storyboard: useRef(null),
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
          currentSection={currentSection}
          scrollToSection={scrollToSection}
        />

        {/* Main Content */}
        <main className="dashboard-main">
          {/* Section 0: Select Project */}
          <ProjectSection
            sectionRef={sectionRefs["select-project"]}
            selectedProjectId={selectedProjectId}
            onSelectProject={(projectId) => setSelectedProjectId(projectId)}
            onNext={() => scrollToSection("select-avatar")}
          />

          {/* Section 1: Select Your Actor */}
          <AvatarSection
            sectionRef={sectionRefs["select-avatar"]}
            onSelectionChange={(list) => setSelectedActors(list)}
            onNext={() => scrollToSection('upload-script')}
          />

          {/* Section 2: Upload Script */}
          <UploadScriptSection
            sectionRef={sectionRefs["upload-script"]}
            selectedProjectId={selectedProjectId}
            onFramesReady={(frames) => setStoryboardFrames(frames)}
          />

          {/* Section 3: Storyboard Generation */}
          <StoryboardSection
            sectionRef={sectionRefs["storyboard"]}
            onFramesChange={(frames) => setStoryboardFrames(frames)}
            onProceed={() => scrollToSection('video-generation')}
          />

          {/* Section 4: Video Generation */}
          <VideoGenerationSection
            sectionRef={sectionRefs['video-generation']}
            frames={storyboardFrames}
            actors={selectedActors}
          />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
