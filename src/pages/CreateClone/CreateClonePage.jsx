import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Progress } from "../../components/ui/progress";
import { useToast } from "../../hooks/use-toast";
import {
  startTraining,
  getTrainingStatus,
  isTrainingServiceConfigured,
} from "../../services/training.service";
import { Loader2, Upload, X, CheckCircle, AlertCircle } from "lucide-react";

const EMOTIONS = [
  { value: "happy", label: "Happy" },
  { value: "sad", label: "Sad" },
  { value: "neutral", label: "Neutral" },
  { value: "angry", label: "Angry" },
];

const TASK_ID_REGEX = /^[a-zA-Z0-9_-]+$/;
const MIN_IMAGES = 1;
const MAX_IMAGES = 20;
const POLL_INTERVAL_MS = 4.5 * 60 * 1000; // 4.5 minutes

export default function CreateClonePage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [taskId, setTaskId] = useState("");
  const [taskIdError, setTaskIdError] = useState("");
  const [emotion, setEmotion] = useState("");
  const [files, setFiles] = useState([]);
  const [filesError, setFilesError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState(null);
  const [pollingId, setPollingId] = useState(null);

  const configured = isTrainingServiceConfigured();

  const pollStatus = useCallback((taskIdToPoll) => {
    const id = setInterval(async () => {
      try {
        const data = await getTrainingStatus(taskIdToPoll);
        setTrainingStatus(data?.status ?? "Unknown");
        if (data?.status === "Completed" || data?.status === "Failed") {
          clearInterval(id);
          setPollingId(null);
        }
      } catch (err) {
        clearInterval(id);
        setPollingId(null);
        toast({
          title: "Status check failed",
          description: err?.message || "Could not fetch training status.",
          variant: "destructive",
        });
      }
    }, POLL_INTERVAL_MS);
    setPollingId(id);
    return () => clearInterval(id);
  }, [toast]);

  useEffect(() => {
    return () => {
      if (pollingId) clearInterval(pollingId);
    };
  }, [pollingId]);

  const validateTaskId = () => {
    const trimmed = (taskId || "").trim();
    if (!trimmed) {
      setTaskIdError("Enter a task or clone name.");
      return false;
    }
    if (!TASK_ID_REGEX.test(trimmed)) {
      setTaskIdError("Use only letters, numbers, hyphens, and underscores.");
      return false;
    }
    setTaskIdError("");
    return true;
  };

  const validateFiles = () => {
    if (!files || files.length < MIN_IMAGES) {
      setFilesError(`Add at least ${MIN_IMAGES} image.`);
      return false;
    }
    if (files.length > MAX_IMAGES) {
      setFilesError(`Maximum ${MAX_IMAGES} images.`);
      return false;
    }
    setFilesError("");
    return true;
  };

  const handleNextFromStep1 = () => {
    if (!validateTaskId()) return;
    setStep(2);
  };

  const handleNextFromStep2 = () => {
    if (!emotion) {
      toast({
        title: "Select emotion",
        description: "Choose an emotion for your clone.",
        variant: "destructive",
      });
      return;
    }
    setStep(3);
  };

  const handleNextFromStep3 = () => {
    if (!validateFiles()) return;
    setStep(4);
  };

  const handleStartTraining = async () => {
    if (!configured) {
      toast({
        title: "Service not configured",
        description: "REACT_APP_TRAINING_API_URL is not set.",
        variant: "destructive",
      });
      return;
    }
    const trimmedTaskId = taskId.trim();
    if (!trimmedTaskId || !emotion || !files.length) return;
    setIsSubmitting(true);
    try {
      await startTraining(trimmedTaskId, emotion, files);
      setStep(5);
      setTrainingStatus("Queued");
      toast({ title: "Training started", description: "Your clone is being trained." });
      pollStatus(trimmedTaskId);
    } catch (err) {
      toast({
        title: "Failed to start training",
        description: err?.response?.data?.detail || err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    const valid = selected.filter((f) => f.type.startsWith("image/"));
    if (valid.length !== selected.length) {
      toast({
        title: "Invalid files",
        description: "Only image files are accepted.",
        variant: "destructive",
      });
    }
    setFiles((prev) => {
      const next = [...prev, ...valid].slice(0, MAX_IMAGES);
      return next;
    });
    setFilesError("");
    e.target.value = "";
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFilesError("");
  };

  if (!configured) {
    return (
      <div className="clone-page">
        <div className="clone-page-header">
          <h1 className="clone-page-title">Make Clone</h1>
          <p className="clone-page-subtitle">Train a custom AI model on your images.</p>
        </div>
        <Card className="border-zinc-800 bg-zinc-900/50 max-w-lg">
          <CardHeader>
            <CardTitle className="text-zinc-200">Training service not configured</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400 text-sm">
              Set <code className="bg-zinc-800 px-1 rounded">REACT_APP_TRAINING_API_URL</code> in your environment to use this feature.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stepLabels = [
    "Name your clone",
    "Select emotion",
    "Upload images",
    "Review & start",
    "Training status",
  ];

  return (
    <div className="clone-page">
      <div className="clone-page-header">
        <h1 className="clone-page-title">Make Clone</h1>
        <p className="clone-page-subtitle">Train a custom AI model on your images in a few simple steps.</p>
      </div>
      <div className="create-clone-two-col">
        {/* Left: Form */}
        <div className="create-clone-form-col">
          <div className="space-y-6">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    s <= step ? "bg-violet-500" : "bg-zinc-700"
                  }`}
                />
              ))}
            </div>

            {step === 1 && (
              <Card className="border-zinc-800 bg-zinc-900/50">
                <CardHeader>
                  <CardTitle className="text-zinc-200">Name your clone</CardTitle>
                  <p className="text-zinc-400 text-sm">
                    Choose a unique ID (e.g. my-clone-1). Use letters, numbers, hyphens, and underscores only.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="task_id" className="text-zinc-300">Task / clone ID</Label>
                    <Input
                      id="task_id"
                      value={taskId}
                      onChange={(e) => {
                        setTaskId(e.target.value);
                        setTaskIdError("");
                      }}
                      placeholder="my-clone-1"
                      className="mt-1.5 bg-zinc-800 border-zinc-700 text-zinc-100 hover:border-zinc-600 focus:ring-violet-500/30 transition-colors"
                    />
                    {taskIdError && <p className="text-red-400 text-sm mt-1">{taskIdError}</p>}
                  </div>
                  <Button onClick={handleNextFromStep1} className="hover:bg-violet-600 transition-colors">Next</Button>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card className="border-zinc-800 bg-zinc-900/50">
                <CardHeader>
                  <CardTitle className="text-zinc-200">Select emotion</CardTitle>
                  <p className="text-zinc-400 text-sm">Pick the primary emotion for this clone.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-zinc-300">Emotion</Label>
                    <Select value={emotion} onValueChange={setEmotion}>
                      <SelectTrigger className="mt-1.5 bg-zinc-800 border-zinc-700 text-zinc-100 hover:border-violet-500/50 hover:bg-zinc-700/80 focus:ring-violet-500/30 transition-all duration-200 cursor-pointer">
                        <SelectValue placeholder="Choose emotion" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-700">
                        {EMOTIONS.map((e) => (
                          <SelectItem
                            key={e.value}
                            value={e.value}
                            className="text-zinc-200 focus:bg-violet-500/20 focus:text-zinc-100 cursor-pointer rounded-md py-2.5 hover:bg-violet-500/15 hover:text-zinc-100 transition-colors outline-none"
                          >
                            {e.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(1)} className="hover:bg-zinc-800 transition-colors">Back</Button>
                    <Button onClick={handleNextFromStep2} className="hover:bg-violet-600 transition-colors">Next</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card className="border-zinc-800 bg-zinc-900/50">
                <CardHeader>
                  <CardTitle className="text-zinc-200">Upload images</CardTitle>
                  <p className="text-zinc-400 text-sm">
                    Add between {MIN_IMAGES} and {MAX_IMAGES} images. Only image files are accepted.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-zinc-300">Images</Label>
                    <div className="mt-1.5 flex flex-col gap-2">
                      <label className="flex items-center justify-center gap-2 h-24 rounded-lg border border-dashed border-zinc-600 bg-zinc-800/50 cursor-pointer hover:border-violet-500/40 hover:bg-zinc-800 transition-colors">
                        <Upload className="w-5 h-5 text-zinc-400" />
                        <span className="text-zinc-400 text-sm">Click to add images</span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                      </label>
                      {files.length > 0 && (
                        <ul className="space-y-1.5">
                          {files.map((file, i) => (
                            <li key={`${file.name}-${i}`} className="flex items-center justify-between text-sm text-zinc-300 bg-zinc-800 rounded px-3 py-2 hover:bg-zinc-700/80 transition-colors">
                              <span className="truncate">{file.name}</span>
                              <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0 hover:bg-red-500/20 hover:text-red-400" onClick={() => removeFile(i)} aria-label="Remove">
                                <X className="w-4 h-4" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {filesError && <p className="text-red-400 text-sm mt-1">{filesError}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(2)} className="hover:bg-zinc-800 transition-colors">Back</Button>
                    <Button onClick={handleNextFromStep3} className="hover:bg-violet-600 transition-colors">Next</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 4 && (
              <Card className="border-zinc-800 bg-zinc-900/50">
                <CardHeader>
                  <CardTitle className="text-zinc-200">Review and start</CardTitle>
                  <p className="text-zinc-400 text-sm">Confirm details and start training.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <dl className="grid grid-cols-1 gap-2 text-sm">
                    <div><dt className="text-zinc-500">Clone ID</dt><dd className="text-zinc-200 font-medium">{taskId.trim()}</dd></div>
                    <div><dt className="text-zinc-500">Emotion</dt><dd className="text-zinc-200 font-medium capitalize">{emotion}</dd></div>
                    <div><dt className="text-zinc-500">Images</dt><dd className="text-zinc-200 font-medium">{files.length} file(s)</dd></div>
                  </dl>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(3)} className="hover:bg-zinc-800 transition-colors">Back</Button>
                    <Button onClick={handleStartTraining} disabled={isSubmitting} className="hover:bg-violet-600 transition-colors">
                      {isSubmitting ? (<><Loader2 className="w-4 h-4 animate-spin" /> Starting…</>) : "Start training"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 5 && (
              <Card className="border-zinc-800 bg-zinc-900/50">
                <CardHeader>
                  <CardTitle className="text-zinc-200">Training status</CardTitle>
                  <p className="text-zinc-400 text-sm">Task ID: <strong className="text-zinc-300">{taskId.trim()}</strong>. Status is checked every 4–5 minutes.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {trainingStatus === "Queued" || trainingStatus === "Running" ? (
                    <>
                      <div className="flex items-center gap-2 text-zinc-300">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{trainingStatus}</span>
                      </div>
                      <Progress value={trainingStatus === "Running" ? 60 : 20} className="h-2" />
                    </>
                  ) : trainingStatus === "Completed" ? (
                    <div className="flex flex-col items-center gap-3 py-4">
                      <CheckCircle className="w-12 h-12 text-green-500" />
                      <p className="text-zinc-200 font-medium">Training completed</p>
                      <p className="text-zinc-400 text-sm">Your clone is ready.</p>
                      <div className="flex gap-2 mt-2">
                        <Button onClick={() => { setStep(1); setTaskId(""); setEmotion(""); setFiles([]); setTrainingStatus(null); }} className="hover:bg-violet-600 transition-colors">Train another</Button>
                        <Button asChild variant="outline"><Link to="/create-video">Create a Video</Link></Button>
                    </div>
                    </div>
                  ) : trainingStatus === "Failed" ? (
                    <div className="flex flex-col items-center gap-3 py-4">
                      <AlertCircle className="w-12 h-12 text-red-400" />
                      <p className="text-zinc-200 font-medium">Training failed</p>
                      <p className="text-zinc-400 text-sm">Something went wrong. Please try again.</p>
                      <div className="flex gap-2 mt-2">
                        <Button onClick={() => setStep(4)} className="hover:bg-violet-600 transition-colors">Try again</Button>
                        <Button asChild variant="outline"><Link to="/create-video">Create a Video</Link></Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Checking status (every 4–5 min)…</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right: Pleasing UI */}
        <div className="create-clone-right-col">
          <div className="create-clone-right-inner">
            <div className="create-clone-step-list">
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-3">Steps</p>
              {stepLabels.map((label, i) => (
                <div
                  key={i}
                  className={`create-clone-step-item ${step === i + 1 ? "active" : ""} ${step > i + 1 ? "done" : ""}`}
                >
                  <span className="create-clone-step-num">{step > i + 1 ? "✓" : i + 1}</span>
                  <span className="create-clone-step-label">{label}</span>
                </div>
              ))}
            </div>
            <div className="create-clone-tip">
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">Tip</p>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {step === 1 && "Use a short, memorable ID so you can find this clone later."}
                {step === 2 && "The emotion you choose will guide how the model expresses in generated content."}
                {step === 3 && "Upload clear, front-facing photos for best results. Avoid heavy filters."}
                {step === 4 && "Training runs in the background. You can leave and come back; we’ll check status every 4–5 minutes."}
                {step === 5 && "When training completes, your clone will be ready to use in the dashboard."}
              </p>
            </div>
            <div className="create-clone-visual">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 flex items-center justify-center">
                <span className="text-4xl text-violet-400/80">{(step >= 1 && step <= 4) ? step : "✓"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
