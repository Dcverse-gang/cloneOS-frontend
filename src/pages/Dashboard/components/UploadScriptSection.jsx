import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Upload, RefreshCw } from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';
import { useGenerateScript, useGenerateSketches } from '../../../services/project.service';
import { useStoryboardStore } from '../../../store/storyboard.store';

export default function UploadScriptSection({ sectionRef, onFramesReady, selectedProjectId }) {
  const { toast } = useToast();
  const [script, setScript] = useState('');
  const [phase, setPhase] = useState('script'); // script -> storyboard
  const { frames, setFrames } = useStoryboardStore();
  const { mutateAsync: generateScript, isPending: generatingScript } = useGenerateScript();
  const { mutateAsync: generateSketches, isPending: generatingSketches } = useGenerateSketches();

  const buttonLabel = useMemo(() => {
    if (generatingScript || generatingSketches) return 'Generating...';
    return phase === 'script' ? 'Generate Script' : 'Generate Storyboard';
  }, [phase, generatingScript, generatingSketches]);

  const handleGenerate = async () => {
    if (!selectedProjectId) {
      toast({ title: 'Select a project', description: 'Please choose a project before generating.', variant: 'destructive' });
      return;
    }

    if (phase === 'script') {
      const prompt = script.trim() || 'xbjscm';
      try {
        const res = await generateScript({ projectId: selectedProjectId, prompt });
        const scenes = res?.data ?? res?.scenes ?? res ?? [];
        const frames = (scenes || []).map((scene, idx) => ({
          id: scene.id || `scene-${idx}`,
          scene: scene.scene || `Scene ${scene.sequenceOrder ?? idx + 1}`,
          scriptText: scene.scriptText || scene.aiPrompt || 'No description',
          sketchUrl: scene.sketchUrl || null,
          status: scene.status || 'pending',
          sequenceOrder: scene.sequenceOrder ?? idx + 1,
          isLocked: false,
        }));
        setFrames(frames);
        onFramesReady?.(frames);
        toast({ title: 'Script generated', description: 'Click "Generate Storyboard" to fetch sketches.' });
        setPhase('storyboard');
      } catch (error) {
        toast({ title: 'Generation failed', description: error?.message || 'Could not generate script.', variant: 'destructive' });
      }
      return;
    }

    // phase === storyboard
    try {
      const res = await generateSketches(selectedProjectId);
      const scenes = res?.data ?? res?.scenes ?? res ?? [];
      const frames = (scenes || []).map((scene, idx) => ({
        id: scene.id || `scene-${idx}`,
        scene: scene.scene || `Scene ${scene.sequenceOrder ?? idx + 1}`,
        scriptText: scene.scriptText || scene.aiPrompt || 'No description',
        sketchUrl: scene.sketchUrl || null,
        status: scene.status || 'pending',
        sequenceOrder: scene.sequenceOrder ?? idx + 1,
        isLocked: false,
      }));
      setFrames(frames);
      onFramesReady?.(frames);
      toast({ title: 'Storyboard generated', description: 'Sketches updated.' });
    } catch (error) {
      toast({ title: 'Storyboard failed', description: error?.message || 'Could not generate storyboard.', variant: 'destructive' });
    }
  };
  return (
    <section ref={sectionRef} className="dashboard-section">
      <div className="section-header">
        <h2 className="section-title">UPLOAD YOUR SCRIPT</h2>
      </div>

      <Card className="script-card">
        <CardContent className="script-content">
          <div className="script-upload-area">
            <div className="upload-zone">
              <Upload className="w-8 h-8" />
              <p>Drag & Drop your script file here</p>
              <Button variant="outline" className="browse-files-btn">
                Browse Files
              </Button>
            </div>

            <div className="script-divider">
              <span>OR</span>
            </div>

            <div className="paste-script">
              <p>Paste your script directly:</p>
              <Textarea
                placeholder="Enter your script here..."
                value={script}
                onChange={(e) => setScript(e.target.value)}
                className="script-textarea"
                rows={10}
              />
            </div>
          </div>

          <div className="script-actions">
            <Button
              className="generate-storyboard-btn"
              onClick={handleGenerate}
              disabled={generatingScript || generatingSketches}
            >
              {(generatingScript || generatingSketches) ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {buttonLabel}
                </>
              ) : (
                buttonLabel
              )}
            </Button>
            {phase === 'storyboard' && !(generatingScript || generatingSketches) && (
              <p className="text-xs text-gray-400 mt-2">Click "Generate Storyboard" to fetch sketches for these scenes.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
