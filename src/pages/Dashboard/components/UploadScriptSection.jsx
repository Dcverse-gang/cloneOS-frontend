import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent } from '../../../components/ui/dialog';
import { Skeleton } from '../../../components/ui/skeleton';
import {
  RefreshCw,
  Film,
  Lock,
  Unlock,
  Loader,
  CheckCircle2,
  AlertCircle,
  Pencil,
  ChevronRight,
  ImageIcon,
  Eye,
  RotateCw,
  ArrowRight,
} from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';
import {
  useGetProjectById,
  useGenerateScript,
  useGenerateSketches,
  useGenerateImages,
  useRegenerateScene,
} from '../../../services/project.service';
import { useStoryboardStore, useStoryboardFrames } from '../../../store/storyboard.store';

// Phase constants
const PHASE = {
  PROMPT: 'prompt',
  SCENES: 'scenes',
  SKETCHES: 'sketches',
  IMAGES: 'images',
};

const PHASE_STEPS = [
  { key: PHASE.PROMPT, label: 'Prompt', number: 1 },
  { key: PHASE.SCENES, label: 'Scenes', number: 2 },
  { key: PHASE.SKETCHES, label: 'Sketches', number: 3 },
  { key: PHASE.IMAGES, label: 'Images', number: 4 },
];

function phaseIndex(phase) {
  return PHASE_STEPS.findIndex((s) => s.key === phase);
}

export default function UploadScriptSection({ sectionRef, selectedProjectId, onProceedToVideo }) {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [phase, setPhase] = useState(PHASE.PROMPT);
  const [promptCollapsed, setPromptCollapsed] = useState(false);
  const lastLoadedProjectId = useRef(null);

  // Zustand store
  const frames = useStoryboardFrames();
  const { setFrames, updateFrame, clearFrames } = useStoryboardStore();

  // Fetch selected project details (includes scenes)
  const { data: selectedProject, isLoading: isLoadingProject } = useGetProjectById(selectedProjectId);

  // Mutations
  const { mutateAsync: generateScript, isPending: generatingScript } = useGenerateScript();
  const { mutateAsync: generateSketches, isPending: generatingSketches } = useGenerateSketches();
  const { mutateAsync: generateImages, isPending: generatingImages } = useGenerateImages();
  const regenerateMutation = useRegenerateScene();

  // Modal state
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [regenerateFrame, setRegenerateFrame] = useState(null);
  const [regeneratePrompt, setRegeneratePrompt] = useState('');

  const isBusy = generatingScript || generatingSketches || generatingImages;

  const parseScenes = (res) => {
    const scenes = res?.data ?? res?.scenes ?? res ?? [];
    return (scenes || []).map((scene, idx) => ({
      id: scene.id || `scene-${idx}`,
      scene: scene.scene || `Scene ${scene.sequenceOrder ?? idx + 1}`,
      scriptText: scene.scriptText || scene.aiPrompt || 'No description',
      aiPrompt: scene.aiPrompt || null,
      sketchUrl: scene.sketchUrl || null,
      finalImageUrl: scene.finalImageUrl || null,
      status: scene.status || 'pending',
      sequenceOrder: scene.sequenceOrder ?? idx + 1,
      isLocked: false,
    }));
  };

  // ---------- Hydrate section from existing project data ----------
  useEffect(() => {
    // Only run when selectedProjectId changes and data arrives
    if (!selectedProjectId) {
      // No project selected — reset everything
      clearFrames();
      setPrompt('');
      setPhase(PHASE.PROMPT);
      setPromptCollapsed(false);
      lastLoadedProjectId.current = null;
      return;
    }

    // Avoid re-loading the same project repeatedly
    if (!selectedProject || lastLoadedProjectId.current === selectedProjectId) return;
    lastLoadedProjectId.current = selectedProjectId;

    const scenes = selectedProject.scenes || [];

    if (scenes.length > 0) {
      // Convert backend scenes into our frame format
      const loadedFrames = scenes
        .sort((a, b) => (a.sequenceOrder ?? 0) - (b.sequenceOrder ?? 0))
        .map((scene, idx) => ({
          id: scene.id || `scene-${idx}`,
          scene: scene.scene || `Scene ${scene.sequenceOrder ?? idx + 1}`,
          scriptText: scene.scriptText || scene.aiPrompt || 'No description',
          aiPrompt: scene.aiPrompt || null,
          sketchUrl: scene.sketchUrl || null,
          finalImageUrl: scene.finalImageUrl || null,
          status: scene.status || 'pending',
          sequenceOrder: scene.sequenceOrder ?? idx + 1,
          isLocked: false,
        }));

      setFrames(loadedFrames);

      // Determine the correct phase based on scene data
      const hasFinalImages = loadedFrames.some((f) => f.finalImageUrl);
      const hasSketches = loadedFrames.some((f) => f.sketchUrl);

      if (hasFinalImages) {
        setPhase(PHASE.IMAGES);
      } else if (hasSketches) {
        setPhase(PHASE.SKETCHES);
      } else {
        setPhase(PHASE.SCENES);
      }

      // Set the prompt from the project's scriptText and collapse it
      if (selectedProject.scriptText) {
        setPrompt(selectedProject.scriptText);
      } else {
        // Fallback: build a summary from the scene scriptTexts if no top-level prompt was saved
        const combined = loadedFrames.map(f => f.scriptText).filter(Boolean).join(' | ');
        setPrompt(combined || 'Prompt not saved for this project');
      }
      setPromptCollapsed(true);
    } else {
      // Project has no scenes yet — start fresh
      clearFrames();
      setPhase(PHASE.PROMPT);
      setPromptCollapsed(false);
      // Pre-fill prompt if the project had a script text saved
      if (selectedProject.scriptText) {
        setPrompt(selectedProject.scriptText);
      } else {
        setPrompt('');
      }
    }
  }, [selectedProjectId, selectedProject]);

  const handleGenerateScript = async () => {
    if (!selectedProjectId) {
      toast({ title: 'Select a project', description: 'Please choose a project before generating.', variant: 'destructive' });
      return;
    }
    const userPrompt = prompt.trim();
    if (!userPrompt) {
      toast({ title: 'Enter a prompt', description: 'Please describe your script idea.', variant: 'destructive' });
      return;
    }
    try {
      const res = await generateScript({ projectId: selectedProjectId, prompt: userPrompt });
      const newFrames = parseScenes(res);
      setFrames(newFrames);
      setPromptCollapsed(true);
      setPhase(PHASE.SCENES);
      toast({ title: 'Script generated', description: `${newFrames.length} scenes created.` });
    } catch (error) {
      toast({ title: 'Generation failed', description: error?.message || 'Could not generate script.', variant: 'destructive' });
    }
  };

  const handleGenerateSketches = async () => {
    if (!selectedProjectId) return;
    try {
      const res = await generateSketches(selectedProjectId);
      const newFrames = parseScenes(res);
      setFrames(newFrames);
      setPhase(PHASE.SKETCHES);
      toast({ title: 'Sketches generated', description: 'Storyboard sketches are ready.' });
    } catch (error) {
      toast({ title: 'Sketch generation failed', description: error?.message || 'Could not generate sketches.', variant: 'destructive' });
    }
  };

  const handleGenerateImages = async () => {
    if (!selectedProjectId) return;
    try {
      const res = await generateImages(selectedProjectId);
      const newFrames = parseScenes(res);
      setFrames(newFrames);
      setPhase(PHASE.IMAGES);
      toast({ title: 'Final images generated', description: 'Photorealistic images are ready.' });
    } catch (error) {
      toast({ title: 'Image generation failed', description: error?.message || 'Could not generate final images.', variant: 'destructive' });
    }
  };

  const handleEditPrompt = () => {
    setPromptCollapsed(false);
  };

  const handleRestart = () => {
    setPhase(PHASE.PROMPT);
    setPromptCollapsed(false);
  };

  const toggleLock = (id) => {
    updateFrame(id, (f) => ({ ...f, isLocked: !f.isLocked }));
  };

  const primaryAction = useMemo(() => {
    if (phase === PHASE.PROMPT) return { label: 'Generate Script', handler: handleGenerateScript, loading: generatingScript };
    if (phase === PHASE.SCENES) return { label: 'Generate Sketches', handler: handleGenerateSketches, loading: generatingSketches };
    if (phase === PHASE.SKETCHES) return { label: 'Generate Final Images', handler: handleGenerateImages, loading: generatingImages };
    return null;
  }, [phase, generatingScript, generatingSketches, generatingImages, selectedProjectId, prompt]);

  const currentPhaseIdx = phaseIndex(phase);

  // Show loading skeleton while project data is being fetched
  const showLoadingSkeleton = selectedProjectId && isLoadingProject && lastLoadedProjectId.current !== selectedProjectId;

  return (
    <section ref={sectionRef} className="dashboard-section">
      <div className="section-header">
        <h2 className="section-title">Script & Storyboard</h2>
      </div>

      {showLoadingSkeleton ? (
        <div className="space-y-5">
          {/* Stepper skeleton */}
          <div className="flex items-center justify-center gap-2 py-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="h-3 w-14 rounded" />
                {i < 4 && <Skeleton className="h-3 w-3 rounded" />}
              </div>
            ))}
          </div>
          {/* Prompt card skeleton */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 max-w-[800px] mx-auto">
            <Skeleton className="h-3 w-48 mb-4 rounded" />
            <Skeleton className="h-28 w-full mb-4 rounded-lg" />
            <div className="flex justify-center">
              <Skeleton className="h-10 w-44 rounded-lg" />
            </div>
          </div>
          {/* Scenes skeleton */}
          <div className="mt-6">
            <div className="flex items-center gap-2.5 mb-4">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-5 w-8 rounded-md" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                  <Skeleton className="h-[180px] w-full rounded-lg mb-3" />
                  <Skeleton className="h-4 w-24 mb-2 rounded" />
                  <Skeleton className="h-3 w-full mb-1 rounded" />
                  <Skeleton className="h-3 w-3/4 mb-3 rounded" />
                  <div className="flex gap-2">
                    <Skeleton className="h-7 w-16 rounded" />
                    <Skeleton className="h-7 w-14 rounded" />
                    <Skeleton className="h-7 w-8 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
      <>

      {/* Phase Stepper */}
      <div className="phase-stepper">
        {PHASE_STEPS.map((step, idx) => {
          const isCompleted = idx < currentPhaseIdx;
          const isCurrent = idx === currentPhaseIdx;
          return (
            <div key={step.key} className={`phase-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
              <div className="phase-step-circle">
                {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.number}
              </div>
              <span className="phase-step-label">{step.label}</span>
              {idx < PHASE_STEPS.length - 1 && <ChevronRight className="phase-step-separator w-3.5 h-3.5" />}
            </div>
          );
        })}
      </div>

      {/* Prompt Area */}
      <Card className="script-card">
        <CardContent className="script-content">
          {promptCollapsed ? (
            <div className="prompt-collapsed">
              <div className="prompt-collapsed-text">
                <span className="prompt-collapsed-label">Your prompt</span>
                <p className="prompt-collapsed-value">{prompt}</p>
              </div>
              <Button variant="outline" size="sm" className="prompt-edit-btn" onClick={handleEditPrompt}>
                <Pencil className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </Button>
            </div>
          ) : (
            <div className="script-upload-area">
              <div className="paste-script">
                <p>Describe your script idea or enter a prompt</p>
                <Textarea
                  placeholder="e.g. A 30-second commercial about a futuristic coffee shop with a robot barista..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="script-textarea"
                  rows={5}
                />
                {prompt.length > 0 && (
                  <div className="text-right mt-1">
                    <span className="text-xs text-zinc-600">{prompt.length} characters</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {primaryAction && (
            <div className="script-actions">
              <Button
                className="generate-storyboard-btn"
                onClick={primaryAction.handler}
                disabled={isBusy}
              >
                {primaryAction.loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    {primaryAction.label}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scene Grid */}
      {frames.length > 0 && currentPhaseIdx >= phaseIndex(PHASE.SCENES) && (
        <div className="storyboard-area">
          <div className="storyboard-area-header">
            <div className="flex items-center gap-2.5">
              <h3 className="subsection-title">Scenes</h3>
              <span className="text-xs font-medium text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-md">
                {frames.length}
              </span>
            </div>
            {phase !== PHASE.PROMPT && (
              <Button variant="ghost" size="sm" className="restart-btn" onClick={handleRestart}>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Start Over
              </Button>
            )}
          </div>

          <div className="storyboard-grid">
            {frames.map((frame) => (
              <Card key={frame.id} className="storyboard-card group">
                <CardContent className="storyboard-content">
                  <div className="frame-preview">
                    {frame.finalImageUrl ? (
                      <img src={frame.finalImageUrl} alt={frame.scene} />
                    ) : frame.sketchUrl ? (
                      <img src={frame.sketchUrl} alt={frame.scene} />
                    ) : (
                      <div className="frame-placeholder">
                        <Film className="w-6 h-6" />
                        <p className="text-xs">Pending</p>
                      </div>
                    )}
                    {frame.finalImageUrl && frame.sketchUrl && (
                      <div className="frame-final-badge">
                        <ImageIcon className="w-3 h-3" />
                        Final
                      </div>
                    )}
                  </div>
                  <div className="frame-info">
                    <h4>Scene {frame.sequenceOrder}</h4>
                    <p className="line-clamp-2">{frame.scriptText}</p>
                  </div>
                  <div className="frame-actions">
                    <Button size="sm" variant="ghost" className="frame-action-btn" onClick={() => setSelectedFrame(frame)}>
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="ghost" className="frame-action-btn" onClick={() => setRegenerateFrame(frame)}>
                      <RotateCw className="w-3.5 h-3.5 mr-1" />
                      Redo
                    </Button>
                    <Button size="sm" variant="ghost" className="frame-action-btn" onClick={() => toggleLock(frame.id)}>
                      {frame.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="storyboard-global-actions">
            {phase === PHASE.IMAGES && (
              <Button className="proceed-video-btn" onClick={onProceedToVideo}>
                Proceed to Video
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Frame Details Modal */}
      <Dialog open={!!selectedFrame} onOpenChange={() => setSelectedFrame(null)}>
        <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-800 p-0 rounded-xl overflow-hidden max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-zinc-800 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-semibold text-white">Scene {selectedFrame?.sequenceOrder}</h3>
              <Badge
                className={`px-2 py-0.5 rounded-md font-medium flex items-center gap-1.5 text-[11px] ${
                  selectedFrame?.status === 'completed' || selectedFrame?.status === 'LORA_PROCESSED'
                    ? 'bg-emerald-600/80 text-white'
                    : selectedFrame?.status === 'processing' || selectedFrame?.status === 'SKETCHED'
                    ? 'bg-blue-600/80 text-white'
                    : selectedFrame?.status === 'pending' || selectedFrame?.status === 'PENDING'
                    ? 'bg-amber-600/80 text-white'
                    : 'bg-zinc-700/80 text-zinc-300'
                }`}
              >
                {(selectedFrame?.status === 'completed' || selectedFrame?.status === 'LORA_PROCESSED') && <CheckCircle2 className="w-3 h-3" />}
                {(selectedFrame?.status === 'processing' || selectedFrame?.status === 'SKETCHED') && <Loader className="w-3 h-3 animate-spin" />}
                {(selectedFrame?.status === 'pending' || selectedFrame?.status === 'PENDING') && <AlertCircle className="w-3 h-3" />}
                <span className="capitalize">{selectedFrame?.status}</span>
              </Badge>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
            {/* Primary Image */}
            {(selectedFrame?.finalImageUrl || selectedFrame?.sketchUrl) ? (
              <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
                <img
                  src={selectedFrame?.finalImageUrl || selectedFrame?.sketchUrl}
                  alt={`Scene ${selectedFrame?.sequenceOrder}`}
                  className="w-full object-contain max-h-[400px]"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 flex flex-col items-center justify-center py-12">
                <Film className="w-10 h-10 text-zinc-700 mb-2" />
                <p className="text-zinc-500 text-sm">No image available</p>
              </div>
            )}

            {/* Script Text */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Script Text</h4>
              <p className="text-sm text-zinc-300 bg-zinc-900 p-3.5 rounded-lg border border-zinc-800 leading-relaxed">
                {selectedFrame?.scriptText}
              </p>
            </div>

            {/* AI Prompt */}
            {selectedFrame?.aiPrompt && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wide">AI Prompt</h4>
                <p className="text-sm text-zinc-400 bg-zinc-900 p-3.5 rounded-lg border border-zinc-800 leading-relaxed">
                  {selectedFrame?.aiPrompt}
                </p>
              </div>
            )}

            {/* Sketch (shown separately when final image also exists) */}
            {selectedFrame?.sketchUrl && selectedFrame?.finalImageUrl && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Sketch</h4>
                <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
                  <img src={selectedFrame.sketchUrl} alt="Sketch" className="w-full object-contain max-h-[300px]" />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Regenerate Scene Modal */}
      <Dialog open={!!regenerateFrame} onOpenChange={() => { setRegenerateFrame(null); setRegeneratePrompt(''); }}>
        <DialogContent className="bg-zinc-950 border-zinc-800 max-w-md rounded-xl">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-white mb-1">Regenerate Scene</h3>
              <p className="text-sm text-zinc-500">Enter a new prompt for Scene {regenerateFrame?.sequenceOrder}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Prompt</label>
              <Textarea
                value={regeneratePrompt}
                onChange={(e) => setRegeneratePrompt(e.target.value)}
                placeholder="Describe what you'd like for this scene..."
                className="bg-zinc-900 border-zinc-800 text-white resize-none rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 placeholder:text-zinc-600"
                rows={4}
              />
            </div>

            <div className="flex gap-2.5 justify-end pt-3">
              <Button
                variant="ghost"
                onClick={() => { setRegenerateFrame(null); setRegeneratePrompt(''); }}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-9"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (regeneratePrompt.trim() && regenerateFrame?.id) {
                    regenerateMutation.mutate(
                      { sceneId: regenerateFrame.id, prompt: regeneratePrompt },
                      {
                        onSuccess: () => {
                          setRegenerateFrame(null);
                          setRegeneratePrompt('');
                        },
                      }
                    );
                  }
                }}
                disabled={!regeneratePrompt.trim() || regenerateMutation.isPending}
                className="bg-violet-600 hover:bg-violet-700 text-white h-9"
              >
                {regenerateMutation.isPending ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  'Regenerate'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </>
      )}
    </section>
  );
}
