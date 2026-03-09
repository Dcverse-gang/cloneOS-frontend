import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Video, FileText, Sparkles, RefreshCw } from 'lucide-react';
import VideoNameStep from './components/VideoNameStep';
import ScriptStep from './components/ScriptStep';
import GenerationStep from './components/GenerationStep';
import { useStoryboardStore } from '../../store/storyboard.store';
import { useGetProjectById } from '../../services/project.service';

const STEPS = [
  { id: 'setup', label: 'Setup', icon: Video },
  { id: 'script', label: 'Script & Storyboard', icon: FileText },
  { id: 'generate', label: 'Generate Video', icon: Sparkles },
];

function deriveStepFromProject(project) {
  // Always show Script step (step 1) when there's a project with scenes
  // The Script step will internally show the correct phase (scenes/sketches/images)
  // User manually proceeds to Generate Video (step 2) by clicking "Proceed to Video"
  if (!project?.scenes?.length) return 1;
  return 1; // Always script step, never auto-advance to step 2
}

export default function CreateVideoPage() {
  const { projectId: urlProjectId } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [actorId, setActorId] = useState(null);
  const [videoName, setVideoName] = useState('');
  const [isRegenMode, setIsRegenMode] = useState(false);
  const { clearFrames } = useStoryboardStore();

  const location = useLocation();
  const navigate = useNavigate();

  const effectiveProjectId = urlProjectId || null;
  const { data: project, isLoading: isLoadingProject, isError: isProjectError } = useGetProjectById(effectiveProjectId);

  useEffect(() => {
    const s = location.state;
    if (s?.isRegenerate && s?.projectId) setIsRegenMode(true);
  }, [location.state]);

  useEffect(() => {
    if (!effectiveProjectId) {
      setCurrentStep(0);
      return;
    }
    if (isProjectError) {
      navigate('/create-video', { replace: true });
      return;
    }
    if (!project) return;
    setVideoName(project.projectName ?? '');
    setActorId(project.actorId ?? null);
    setCurrentStep(deriveStepFromProject(project));
  }, [effectiveProjectId, project, isProjectError, navigate]);

  const handleProjectCreated = (id, actor, name) => {
    navigate(`/create-video/${id}`, { state: location.state });
  };

  const handleStartNew = () => {
    if (isRegenMode) {
      navigate('/videos');
      return;
    }
    clearFrames();
    navigate('/create-video', { replace: true });
  };

  const handleScriptBack = () => {
    if (isRegenMode) {
      navigate('/videos');
    } else {
      navigate('/create-video');
    }
  };

  return (
    <div className="cv-page">
      {/* Top stepper */}
      <div className="cv-stepper">
        {STEPS.map((step, idx) => {
          // In regen mode step 0 is always shown as completed
          const isCompleted = isRegenMode ? idx <= 0 || idx < currentStep : idx < currentStep;
          const isCurrent = idx === currentStep;
          const Icon = step.icon;
          return (
            <React.Fragment key={step.id}>
              <div className={`cv-stepper-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                <div className="cv-stepper-circle">
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="cv-stepper-label">{step.label}</span>
              </div>
              {idx < STEPS.length - 1 && <div className={`cv-stepper-line ${isCompleted ? 'completed' : ''}`} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Regen context banner */}
      {isRegenMode && videoName && (
        <div className="cv-regen-banner">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Regenerating: <strong>{videoName}</strong> — edit the prompt below and re-generate.</span>
        </div>
      )}

      {/* Step content */}
      <div className="cv-page-content">
        {effectiveProjectId && isLoadingProject && currentStep === 0 && (
          <div className="cv-step-container flex items-center justify-center min-h-[200px]">
            <p className="text-zinc-500">Loading project...</p>
          </div>
        )}
        {currentStep === 0 && !(effectiveProjectId && isLoadingProject) && (
          <VideoNameStep onCreated={handleProjectCreated} />
        )}
        {currentStep === 1 && (
          <ScriptStep
            projectId={effectiveProjectId}
            onBack={handleScriptBack}
            onProceedToVideo={() => setCurrentStep(2)}
            regenParam={new URLSearchParams(location.search).get('regen')}
          />
        )}
        {currentStep === 2 && (
          <GenerationStep
            projectId={effectiveProjectId}
            onBack={() => setCurrentStep(1)}
            onStartNew={handleStartNew}
            startNewLabel={isRegenMode ? 'Back to Videos' : undefined}
          />
        )}
      </div>
    </div>
  );
}
