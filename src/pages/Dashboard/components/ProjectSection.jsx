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
import { RefreshCw, User } from "lucide-react";
import {
  useGetAllProjects,
  useCreateProject,
} from "../../../services/project.service";
import { useGetAllActors } from "../../../services/actor.service";
import { useUser } from "../../../store/auth.store";
import { useToast } from "../../../hooks/use-toast";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

export default function ProjectSection({
  sectionRef,
  selectedProjectId,
  onSelectProject,
  onNext,
}) {
  const user = useUser();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
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
    setCreateDialogOpen(false);
    setProjectName("");
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
    const name = (projectName || "").trim();
    if (!name) {
      toast({
        title: "Project name required",
        description: "Please enter a name for your project.",
        variant: "destructive",
      });
      return;
    }
    try {
      await createProject({
        projectName: name,
        actorId: pendingActorId,
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
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Project
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {renderBody()}
      </div>

      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) => !open && resetCreateFlow()}
      >
        <DialogContent className="bg-black border-gray-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">
              Create Project
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Name your project and choose an actor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name" className="text-gray-300">
                Project name
              </Label>
              <Input
                id="project-name"
                placeholder="e.g. My Short Film"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="bg-gray-900 border-gray-800 text-white placeholder-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Choose actor</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-auto pr-1">
                {actors?.length ? (
                  actors.map((actor) => {
                    const imgUrl = actor.avatarUrl || actor.imageUrl || actor.avatar_url || "";
                    return (
                      <button
                        key={actor.id}
                        onClick={() => setPendingActorId(actor.id)}
                        className={`rounded-lg border overflow-hidden flex flex-col items-center text-center p-0 hover:border-purple-500 transition bg-gray-900 ${pendingActorId === actor.id ? "border-purple-500 ring-2 ring-purple-500" : "border-gray-800"}`}
                        type="button"
                      >
                        <div className="w-full aspect-square bg-gray-800 relative">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={actor.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const el = e.currentTarget;
                                el.onerror = null;
                                el.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23374151' width='100' height='100'/%3E%3Ctext x='50' y='55' fill='%239ca3af' text-anchor='middle' font-size='40'%3E%3F%3C/text%3E%3C/svg%3E";
                              }}
                            />
                          ) : (
                            <span className="absolute inset-0 flex items-center justify-center text-2xl text-gray-500">
                              <User className="w-10 h-10" />
                            </span>
                          )}
                        </div>
                        <div className="p-2 w-full">
                          <p className="font-medium text-white text-sm truncate">
                            {actor.name}
                          </p>
                          {actor.triggerWord && (
                            <p className="text-xs text-gray-500 truncate">
                              {actor.triggerWord}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-full text-sm text-gray-400 py-4">
                    No actors available.
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
              <Button
                variant="ghost"
                onClick={resetCreateFlow}
                className="text-gray-400 hover:text-white hover:bg-gray-800 px-5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={creating}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6"
              >
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

  const actorImgSrc = actor?.avatarUrl || actor?.imageUrl || actor?.avatar_url || "";

  return (
    <Card className={`actor-card ${selected ? "ring-2 ring-primary" : ""}`}>
      <CardContent className="actor-card-content">
        <div className="actor-image">
          <img
            src={actorImgSrc}
            alt={actor?.name || "Actor"}
            onError={(e) => {
              const el = e.currentTarget;
              el.onerror = null;
              el.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23374151' width='100' height='100'/%3E%3Ctext x='50' y='55' fill='%239ca3af' text-anchor='middle' font-size='40'%3E%3F%3C/text%3E%3C/svg%3E";
            }}
          />
        </div>

        <div className="actor-info">
          <div className="flex items-center justify-between mb-2">
            <h3 className="actor-name">{actor?.name || "Unknown actor"}</h3>
            <Badge
              variant="outline"
              className="text-[8px] rounded-sm px-2 py-0.5 border-orange-500 text-orange-500"
            >
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
