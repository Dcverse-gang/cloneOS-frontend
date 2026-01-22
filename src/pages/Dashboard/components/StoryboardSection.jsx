import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent } from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import { Textarea } from '../../../components/ui/textarea';
import { Film, Lock, Unlock, Loader, CheckCircle2, AlertCircle } from 'lucide-react';
import { useStoryboardStore, useStoryboardFrames } from '../../../store/storyboard.store';
import { useRegenerateScene } from '../../../services/project.service';

export default function StoryboardSection({ sectionRef, onFramesChange, onProceed }) {
  const frames = useStoryboardFrames();
  const { updateFrame } = useStoryboardStore();
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [regenerateFrame, setRegenerateFrame] = useState(null);
  const [regeneratePrompt, setRegeneratePrompt] = useState('');
  const regenerateMutation = useRegenerateScene();

  useEffect(() => {
    onFramesChange?.(frames);
  }, [frames, onFramesChange]);

  const toggleLock = (id) => {
    updateFrame(id, (f) => ({ ...f, isLocked: !f.isLocked }));
  };

  return (
    <section ref={sectionRef} className="dashboard-section">
      <div className="section-header">
        <h2 className="section-title">STORYBOARD GENERATION</h2>
      </div>
      <div className="storyboard-grid">
        {frames.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 py-8">
            No storyboard scenes yet. Generate from your script to see scenes here.
          </div>
        ) : (
          frames.map((frame) => (
            <Card key={frame.id} className="storyboard-card">
              <CardContent className="storyboard-content">
                <div className="frame-preview">
                  {frame.sketchUrl ? (
                    <img src={frame.sketchUrl} alt={frame.scene} />
                  ) : (
                    <div className="frame-placeholder">
                      <Film className="w-8 h-8" />
                      <p>Choose File to Add Image!</p>
                    </div>
                  )}
                </div>
                <div className="frame-info">
                  <h4>Scene {frame.sequenceOrder}</h4>
                  <p className="line-clamp-5">{frame.scriptText}</p>
                </div>
                <div className="frame-actions">
                  <Button size="sm" variant="ghost" className="frame-action-btn" onClick={() => setSelectedFrame(frame)}>
                    View Details
                  </Button>
                  <Button size="sm" variant="ghost" className="frame-action-btn" onClick={() => setRegenerateFrame(frame)}>Generate New</Button>
                  <Button size="sm" variant="ghost" className="frame-action-btn" onClick={() => toggleLock(frame.id)}>
                    {frame.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      <div className="storyboard-global-actions">
        <Button variant="outline" className="regenerate-all-btn">AI Generate Images</Button>
        <Button className="proceed-video-btn" onClick={onProceed}>Proceed to Video</Button>
      </div>

      {/* Frame Details Modal */}
      <Dialog open={!!selectedFrame} onOpenChange={() => setSelectedFrame(null)}>
        <DialogContent className="max-w-4xl bg-black border-gray-800 h-[400px] p-0">
          {/* Top Left Badges */}
          <div className="absolute top-4 left-4 flex gap-2 z-10">
            {/* Scene Number Badge */}
            <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-1 rounded-full font-semibold flex items-center gap-2 shadow-lg">
              <span className="text-xs">🎬</span>
              Scene {selectedFrame?.sequenceOrder}
            </Badge>

            {/* Status Badge with dynamic color */}
            <Badge
              className={`px-3 py-1 rounded-full font-semibold flex items-center gap-2 shadow-lg ${
                selectedFrame?.status === 'completed'
                  ? 'bg-green-600/80 text-white'
                  : selectedFrame?.status === 'processing'
                  ? 'bg-blue-600/80 text-white'
                  : selectedFrame?.status === 'pending'
                  ? 'bg-yellow-600/80 text-white'
                  : 'bg-gray-700/80 text-gray-200'
              }`}
            >
              {selectedFrame?.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
              {selectedFrame?.status === 'processing' && <Loader className="w-4 h-4 animate-spin" />}
              {selectedFrame?.status === 'pending' && <AlertCircle className="w-4 h-4" />}
              <span className="capitalize text-xs">{selectedFrame?.status}</span>
            </Badge>
          </div>

          <div className="flex gap-6 h-[inherit]">
            {/* Left Side - Image */}
            <div className="w-1/2 flex flex-col items-center justify-center bg-gray-900  overflow-hidden">
              {selectedFrame?.sketchUrl ? (
                <img src={selectedFrame.sketchUrl} alt={`Scene ${selectedFrame?.sequenceOrder}`} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <Film className="w-12 h-12 text-gray-600 mb-2" />
                  <p className="text-gray-400 text-sm">No image available</p>
                </div>
              )}
            </div>

            {/* Right Side - Scrollable Content */}
            <div className="w-1/2 overflow-y-auto pr-4 space-y-4 pt-12">
              <div className="space-y-4">
                {/* Script Text */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-white">Script Text</h3>
                  <p className="text-sm text-gray-300 bg-gray-900 p-3 rounded border border-gray-800">{selectedFrame?.scriptText}</p>
                </div>

                {/* AI Prompt */}
              {selectedFrame?.aiPrompt &&  <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-white">AI Prompt</h3>
                  <p className="text-sm text-gray-300 bg-gray-900 p-3 rounded border border-gray-800">{selectedFrame?.aiPrompt}</p>
                </div>}

              

                {/* Final Image */}
                {selectedFrame?.finalImageUrl && (
                  <div className="space-y-2 pt-2 border-t border-gray-800">
                    <h3 className="font-semibold text-sm text-white">Final Image</h3>
                    <img src={selectedFrame.finalImageUrl} alt="Final" className="w-full rounded-lg border border-gray-800" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Regenerate Scene Modal */}
      <Dialog open={!!regenerateFrame} onOpenChange={() => {
        setRegenerateFrame(null);
        setRegeneratePrompt('');
      }}>
        <DialogContent className="bg-black border-gray-800 max-w-md">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Regenerate Scene</h3>
              <p className="text-sm text-gray-400">Enter a prompt for Scene {regenerateFrame?.sequenceOrder}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Prompt</label>
              <Textarea
                value={regeneratePrompt}
                onChange={(e) => setRegeneratePrompt(e.target.value)}
                placeholder="Describe what you'd like for this scene..."
                className="bg-gray-900 border-gray-700 text-white resize-none"
                rows={4}
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setRegenerateFrame(null);
                  setRegeneratePrompt('');
                }}
                className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800"
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
                className="bg-blue-600 hover:bg-blue-700"
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
    </section>
  );
}
