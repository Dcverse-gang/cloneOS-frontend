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
import { Plus, User, FolderOpen, Check } from "lucide-react";
import {
  useGetAllProjects,
  useCreateProject,
} from "../../../services/project.service";
import { useGetAllActors } from "../../../services/actor.service";
import { useUser } from "../../../store/auth.store";
import { useToast } from "../../../hooks/use-toast";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Skeleton } from "../../../components/ui/skeleton";

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
      const result = await createProject({
        projectName: name,
        actorId: pendingActorId,
      });
      toast({
        title: "Project created",
        description: "Your project has been created.",
      });
      resetCreateFlow();
      // Auto-select the newly created project
      const newProjectId = result?.data?.id;
      if (newProjectId) {
        handleSelect(newProjectId);
      }
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
        <>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900 p-0 overflow-hidden">
              <Skeleton className="h-40 w-full rounded-none" />
              <div className="p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-3/5 rounded" />
                  <Skeleton className="h-3 w-12 rounded" />
                </div>
                <Skeleton className="h-3 w-1/3 mb-2.5 rounded" />
                <Skeleton className="h-3 w-full mb-1 rounded" />
                <Skeleton className="h-3 w-2/3 rounded" />
              </div>
            </div>
          ))}
        </>
      );
    }

    if (error) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
            <FolderOpen className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-zinc-400 text-sm">Unable to load projects. Please try again.</p>
        </div>
      );
    }

    if (!userProjects || userProjects.length === 0) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center py-16">
          <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
            <FolderOpen className="w-7 h-7 text-zinc-500" />
          </div>
          <p className="text-zinc-400 text-sm font-medium mb-1">No projects yet</p>
          <p className="text-zinc-600 text-sm mb-4">Create your first project to get started</p>
          <Button
            size="sm"
            className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            New Project
          </Button>
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
        <div className="flex items-center gap-3">
          <h2 className="section-title">Projects</h2>
          {userProjects.length > 0 && (
            <span className="text-xs font-medium text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-md">
              {userProjects.length}
            </span>
          )}
        </div>
        <Button
          size="sm"
          className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5 h-9"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {renderBody()}
      </div>

      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) => !open && resetCreateFlow()}
      >
        <DialogContent className="bg-zinc-950 border-zinc-800 max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-semibold">
              Create Project
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-sm">
              Name your project and choose an actor to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <div className="space-y-2">
              <Label htmlFor="project-name" className="text-zinc-400 text-sm font-medium">
                Project name
              </Label>
              <Input
                id="project-name"
                placeholder="e.g. My Short Film"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 h-10 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-sm font-medium">Choose actor</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-auto pr-1">
                {actors?.length ? (
                  actors.map((actor) => {
                    const imgUrl = actor.avatarUrl || actor.imageUrl || actor.avatar_url || "";
                    const isSelected = pendingActorId === actor.id;
                    return (
                      <button
                        key={actor.id}
                        onClick={() => setPendingActorId(actor.id)}
                        className={`rounded-lg border overflow-hidden flex flex-col items-center text-center p-0 transition-all bg-zinc-900 ${
                          isSelected
                            ? "border-violet-500 ring-2 ring-violet-500/30"
                            : "border-zinc-800 hover:border-zinc-700"
                        }`}
                        type="button"
                      >
                        <div className="w-full aspect-square bg-zinc-800 relative flex items-center justify-center">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={actor.name}
                              className="w-full h-full object-cover object-center"
                              onError={(e) => {
                                const el = e.currentTarget;
                                el.onerror = null;
                                el.style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-2xl text-zinc-600">
                              <User className="w-8 h-8" />
                            </span>
                          )}
                          {isSelected && (
                            <div className="absolute inset-0 bg-violet-500/20 flex items-center justify-center">
                              <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="p-2 w-full">
                          <p className="font-medium text-white text-xs truncate">
                            {actor.name}
                          </p>
                          {actor.triggerWord && (
                            <p className="text-[10px] text-zinc-600 truncate mt-0.5">
                              {actor.triggerWord}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-full text-sm text-zinc-500 py-6 text-center">
                    No actors available.
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-800">
              <Button
                variant="ghost"
                onClick={resetCreateFlow}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800 px-4 h-9"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={creating}
                className="bg-violet-600 hover:bg-violet-700 text-white px-5 h-9"
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
  const actorImgSrc = actor?.avatarUrl || actor?.imageUrl || actor?.avatar_url || "";

  const statusColor = {
    completed: "bg-emerald-500",
    done: "bg-emerald-500",
    draft: "bg-zinc-500",
    active: "bg-violet-500",
    processing: "bg-amber-500",
  };

  return (
    <Card
      className={`group cursor-pointer transition-all duration-200 bg-zinc-900 border-zinc-800 rounded-xl hover:border-zinc-700 hover:shadow-lg ${
        selected ? "ring-2 ring-violet-500 border-violet-500" : ""
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-0">
        <div className="h-40 bg-zinc-800 rounded-t-xl overflow-hidden relative flex items-center justify-center">
          {actorImgSrc ? (
            <img
              src={actorImgSrc}
              alt={actor?.name || "Actor"}
              className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                const el = e.currentTarget;
                el.onerror = null;
                el.style.display = 'none';
              }}
            />
          ) : (
            <span className="text-4xl text-zinc-600 select-none">?</span>
          )}
          {selected && (
            <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
          )}
        </div>

        <div className="p-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-sm font-semibold text-white leading-tight truncate pr-2">
              {project?.projectName || "Untitled Project"}
            </h3>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className={`w-1.5 h-1.5 rounded-full ${statusColor[project?.status] || "bg-zinc-600"}`} />
              <span className="text-[10px] text-zinc-500 capitalize">
                {project?.status || "unknown"}
              </span>
            </div>
          </div>
          <p className="text-xs text-zinc-500">
            {actor?.name || "No actor assigned"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
