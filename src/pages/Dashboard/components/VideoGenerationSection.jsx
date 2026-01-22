import React, { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Play, RefreshCw } from 'lucide-react';
import { mockVideoModels, mockFunctions } from '../../../components/mock';

export default function VideoGenerationSection({ sectionRef, frames, actors }) {
  const [selectedVideoModel, setSelectedVideoModel] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState(null);

  const handleGenerateVideo = async () => {
    setIsGenerating(true);
    try {
      const result = await mockFunctions.generateVideo({ model: selectedVideoModel, storyboard: frames, actors });
      setUploadedVideo(result.videoUrl);
    } catch (e) {
      // handle error UI here if needed
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section ref={sectionRef} className="dashboard-section">
      <div className="section-header">
        <h2 className="section-title">SELECT VIDEO MODEL</h2>
      </div>
      <div className="video-models-grid">
        {mockVideoModels.map((model) => (
          <Card key={model.id} className={`video-model-card ${selectedVideoModel?.id === model.id ? 'selected' : ''}`} onClick={() => setSelectedVideoModel(model)}>
            <CardContent className="video-model-content">
              <div className="model-header">
                <h3>{model.name}</h3>
                <div className="model-badges">
                  <Badge className="credits-badge">{model.credits}</Badge>
                  {model.recommended && <Badge className="recommended-badge">Recommended</Badge>}
                </div>
              </div>
              <p className="model-description">{model.description}</p>
              <div className="model-features">
                {model.features.map((feature, index) => (
                  <Badge key={index} variant="outline" className="feature-badge">{feature}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="video-generation-section">
        <Button className="generate-video-btn" disabled={!selectedVideoModel} onClick={handleGenerateVideo}>
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating Video...
            </>
          ) : (
            'Generate Video'
          )}
        </Button>
      </div>
      <div className="video-preview-section">
        <h3>Video Preview</h3>
        <div className="video-player-container">
          {uploadedVideo ? (
            <video controls className="video-player" autoPlay>
              <source src={uploadedVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="video-placeholder">
              <Play className="w-12 h-12" />
              <p>Video will appear here after generation</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
