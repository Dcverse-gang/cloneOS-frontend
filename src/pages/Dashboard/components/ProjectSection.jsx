import React, { useMemo, useState } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Textarea } from "../../../components/ui/textarea";
import { RefreshCw, FolderOpen, FileText, Users, User } from "lucide-react";
import {
  useGetAllProjects,
  useCreateProject,
} from "../../../services/project.service";
import { useGetAllActors } from "../../../services/actor.service";
import { useUser } from "../../../store/auth.store";
import { useToast } from "../../../hooks/use-toast";

export default function ProjectSection({
  sectionRef,
  selectedProjectId,
  onSelectProject,
  onNext,
}) {
  const user = useUser();
  const { toast } = useToast();
  const [createStep, setCreateStep] = useState(null);
  const [scriptText, setScriptText] = useState("");
  const [pendingActorId, setPendingActorId] = useState(null);
  const { data: projects = [], isLoading, error } = useGetAllProjects();
  const { data: actors = [] } = useGetAllActors();
  const { mutateAsync: createProject, isPending: creating } =
    useCreateProject();

  const actorById = useMemo(() => {
    const map = {};
    (actors || []).forEach((actor) => {
      if (actor?.id) {
        map[actor.id] = actor;
      }
    });
    return map;
  }, [actors]);

  const userProjects = useMemo(() => {
    const list = Array.isArray(projects) ? projects : [];
    const userId = user?.id ?? user?._id ?? user?.userId;
    if (userId) {
      return list.filter((project) => project?.userId === userId);
    }
    return list;
  }, [projects, user]);

  const handleSelect = (projectId) => {
    onSelectProject?.(projectId);
    onNext?.();
  };

  const resetCreateFlow = () => {
    setCreateStep(null);
    setScriptText("");
    setPendingActorId(null);
  };

  const handleCreate = async () => {
    const userId = user?.id ?? user?._id;
    if (!userId) {
      toast({
        title: "Missing user",
        description: "Please log in to create a project.",
        variant: "destructive",
      });
      return;
    }
    if (!pendingActorId) {
      toast({
        title: "Select an actor",
        description: "Pick one actor to continue.",
        variant: "destructive",
      });
      return;
    }
    try {
      await createProject({
        userId,
        actorId: pendingActorId,
        scriptText: scriptText || null,
      });
      toast({
        title: "Project created",
        description: "Your project has been created.",
      });
      resetCreateFlow();
    } catch (err) {
      toast({
        title: "Creation failed",
        description: err?.message || "Unable to create project",
        variant: "destructive",
      });
    }
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center col-span-full py-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <p>Loading your projects...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="col-span-full text-center text-red-500 py-8">
          <p>Unable to load projects. Please try again.</p>
        </div>
      );
    }

    if (!userProjects || userProjects.length === 0) {
      return (
        <div className="col-span-full text-center text-gray-400 py-8">
          <p>No projects found for your account.</p>
        </div>
      );
    }

    return userProjects.map((project) => (
      <ProjectCard
        key={project.id}
        project={project}
        actor={actorById[project.actorId]}
        selected={selectedProjectId === project.id}
        onSelect={() => handleSelect(project.id)}
      />
    ));
  };

  return (
    <section ref={sectionRef} className="dashboard-section">
      <div className="section-header">
        <h2 className="section-title">SELECT PROJECT</h2>
        <Button
          variant="default"
          className="section-badge"
          onClick={() => setCreateStep(1)}
        >
          Create Project
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">{renderBody()}</div>

      <Dialog
        open={createStep === 1}
        onOpenChange={(open) => (open ? setCreateStep(1) : resetCreateFlow())}
      >
        <DialogContent className="bg-black border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Step 1 of 2: Script</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter your script text. You will pick an actor next.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Paste or write your script here..."
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              rows={8}
              className="bg-gray-900 border-gray-800 text-white placeholder-gray-600"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetCreateFlow} className="border-gray-800 hover:bg-gray-900">
                Cancel
              </Button>
              <Button onClick={() => setCreateStep(2)}>Next</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={createStep === 2}
        onOpenChange={(open) => (open ? setCreateStep(2) : resetCreateFlow())}
      >
        <DialogContent className="bg-black border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Step 2 of 2: Choose Actor</DialogTitle>
            <DialogDescription className="text-gray-400">
              Select one actor for this project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-auto">{actors?.length ? (
                actors.map((actor) => (
                  <button
                    key={actor.id}
                    onClick={() => setPendingActorId(actor.id)}
                    className={`text-left p-3 border rounded-md flex items-center gap-3 hover:border-purple-500 transition bg-gray-900 ${pendingActorId === actor.id ? "border-purple-500 ring-1 ring-purple-500" : "border-gray-800"}`}
                    type="button"
                  >
                    <Users className="w-4 h-4" />
                    <div>
                      <p className="font-medium text-white">{actor.name}</p>
                      <p className="text-xs text-gray-500">
                        {actor.triggerWord || "Actor"}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-sm text-gray-400">
                  No actors available.
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetCreateFlow} className="border-gray-800 hover:bg-gray-900">
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function ProjectCard({ project, selected, onSelect, actor }) {
  const statusVariant = (status) => {
    if (status === "completed" || status === "done") return "default";
    if (status === "draft") return "secondary";
    return "outline";
  };

  const scriptPreview = project?.scriptText?.trim()
    ? project.scriptText.length > 80
      ? `${project.scriptText.slice(0, 80)}...`
      : project.scriptText
    : "No script added yet.";

  return (
    <Card className={`actor-card ${selected ? "ring-2 ring-primary" : ""}`}>
      <CardContent className="actor-card-content">
        <div className="actor-image">
          <img
            src={
              "https://i.pinimg.com/736x/3d/70/41/3d704151eebcdb14b129c0fead905fbb.jpg" ??
              actor.avatarUrl
            }
            alt={actor?.name || "Actor"}
          />
        </div>

        <div className="actor-info">
          <div className="flex items-center justify-between mb-2">
            <h3 className="actor-name">{actor?.name || "Unknown actor"}</h3>
            <Badge variant="outline" className="text-[8px] rounded-sm px-2 py-0.5 border-orange-500 text-orange-500">
              {project?.status || "unknown"}
            </Badge>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
            {scriptPreview}
          </p>
        </div>

        <Button
          className="select-actor-btn"
          variant={selected ? "default" : "outline"}
          onClick={onSelect}
          disabled={selected}
        >
          {selected ? "Selected" : "Select Project"}
        </Button>
      </CardContent>
    </Card>
  );
}
