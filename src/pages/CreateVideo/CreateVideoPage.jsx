import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Video, FileText, Sparkles, RefreshCw } from 'lucide-react';
import VideoNameStep from './components/VideoNameStep';
import ScriptStep from './components/ScriptStep';
import GenerationStep from './components/GenerationStep';
import { useStoryboardStore } from '../../store/storyboard.store';

const STEPS = [
  { id: 'setup', label: 'Setup', icon: Video },
  { id: 'script', label: 'Script & Storyboard', icon: FileText },
  { id: 'generate', label: 'Generate Video', icon: Sparkles },
];

export default function CreateVideoPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [projectId, setProjectId] = useState(null);
  const [actorId, setActorId] = useState(null);
  const [videoName, setVideoName] = useState('');
  const [isRegenMode, setIsRegenMode] = useState(false);
  const { clearFrames } = useStoryboardStore();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const s = location.state;
    if (s?.isRegenerate && s?.projectId) {
      setProjectId(s.projectId);
      setActorId(s.actorId ?? null);
      setVideoName(s.projectName ?? '');
      setIsRegenMode(true);
      setCurrentStep(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProjectCreated = (id, actor, name) => {
    setProjectId(id);
    setActorId(actor);
    setVideoName(name);
    setCurrentStep(1);
  };

  const handleStartNew = () => {
    if (isRegenMode) {
      navigate('/videos');
      return;
    }
    setProjectId(null);
    setActorId(null);
    setVideoName('');
    clearFrames();
    setCurrentStep(0);
  };

  const handleScriptBack = () => {
    if (isRegenMode) {
      navigate('/videos');
    } else {
      setCurrentStep(0);
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
        {currentStep === 0 && (
          <VideoNameStep onCreated={handleProjectCreated} />
        )}
        {currentStep === 1 && (
          <ScriptStep
            projectId={projectId}
            onBack={handleScriptBack}
            onProceedToVideo={() => setCurrentStep(2)}
          />
        )}
        {currentStep === 2 && (
          <GenerationStep
            projectId={projectId}
            onBack={() => setCurrentStep(1)}
            onStartNew={handleStartNew}
            startNewLabel={isRegenMode ? 'Back to Videos' : undefined}
          />
        )}
      </div>
    </div>
  );
}
