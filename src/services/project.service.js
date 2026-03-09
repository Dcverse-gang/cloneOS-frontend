import { authAxios } from './url.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const prefix = '/projects';

// Low-level API
export const projectApi = () => {
  // Create a new project
  const createProject = async (payload) => 
    authAxios.post(`${prefix}`, payload);

  // Get all projects for the current user
  const getAllProjects = async () => 
    authAxios.get(`${prefix}`);

  // Get a specific project by ID
  const getProjectById = async (id) => 
    authAxios.get(`${prefix}/${id}`);

  // Generate script and storyboard scenes
  const generateScript = async (projectId, prompt) => 
    authAxios.post(`${prefix}/${projectId}/script`, { prompt });

  // Generate sketches for scenes
  const generateSketches = async (projectId) => 
    authAxios.post(`${prefix}/${projectId}/sketches`);

  // Generate final photorealistic images
  const generateImages = async (projectId) => 
    authAxios.post(`${prefix}/${projectId}/images`);

  // Regenerate a specific scene
  const regenerateScene = async (sceneId, prompt) => 
    authAxios.post(`${prefix}/scenes/${sceneId}/regenerate`, { prompt });

  // Render final video
  const renderVideo = async (projectId, actorId) => 
    authAxios.post(`${prefix}/${projectId}/render`, { actorId });

  return {
    createProject,
    getAllProjects,
    getProjectById,
    generateScript,
    generateSketches,
    generateImages,
    regenerateScene,
    renderVideo,
  };
};

// React Query Hooks

/**
 * Get all projects for the current user
 */
export function useGetAllProjects(options = {}) {
  const { getAllProjects } = projectApi();
  return useQuery({
    queryKey: ['projects', 'list'],
    queryFn: () => getAllProjects().then(res => res.data?.data ?? res.data),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

/**
 * Get a specific project by ID
 */
export function useGetProjectById(projectId, options = {}) {
  const { getProjectById } = projectApi();
  return useQuery({
    queryKey: ['projects', projectId],
    enabled: !!projectId,
    queryFn: () => getProjectById(projectId).then(res => res.data?.data ?? res.data),
    staleTime: 0, // Always fetch fresh data on mount/refresh
    ...options,
  });
}

/**
 * Create a new project
 */
export function useCreateProject(options = {}) {
  const { createProject } = projectApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => createProject(payload).then(res => res.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'list'] });
      if (data?.data?.id) {
        queryClient.setQueryData(['projects', data.data.id], data.data);
      }
    },
    ...options,
  });
}

/**
 * Generate script and storyboard scenes for a project
 */
export function useGenerateScript(options = {}) {
  const { generateScript } = projectApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, prompt }) => 
      generateScript(projectId, prompt).then(res => res.data),
    onSuccess: (data, variables) => {
      // Invalidate the project to get updated scenes
      queryClient.invalidateQueries({ 
        queryKey: ['projects', variables.projectId] 
      });
    },
    ...options,
  });
}

/**
 * Generate sketches for all scenes in a project
 */
export function useGenerateSketches(options = {}) {
  const { generateSketches } = projectApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId) => 
      generateSketches(projectId).then(res => res.data),
    onSuccess: (data, projectId) => {
      // Invalidate the project to get updated scenes with sketches
      queryClient.invalidateQueries({ 
        queryKey: ['projects', projectId] 
      });
    },
    ...options,
  });
}

/**
 * Generate final photorealistic images for all scenes
 */
export function useGenerateImages(options = {}) {
  const { generateImages } = projectApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId) => 
      generateImages(projectId).then(res => res.data),
    onSuccess: (data, projectId) => {
      // Invalidate the project to get updated scenes with final images
      queryClient.invalidateQueries({ 
        queryKey: ['projects', projectId] 
      });
    },
    ...options,
  });
}

/**
 * Regenerate image for a specific scene
 */
export function useRegenerateScene(options = {}) {
  const { regenerateScene } = projectApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sceneId, prompt }) => 
      regenerateScene(sceneId, prompt).then(res => res.data),
    onSuccess: (data) => {
      // Invalidate all projects to refresh the scene data
      queryClient.invalidateQueries({ 
        queryKey: ['projects'] 
      });
    },
    ...options,
  });
}

/**
 * Render final video for a project
 */
export function useRenderVideo(options = {}) {
  const { renderVideo } = projectApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, actorId }) => 
      renderVideo(projectId, actorId).then(res => res.data),
    onSuccess: (data, variables) => {
      // Invalidate the project to get updated status
      queryClient.invalidateQueries({ 
        queryKey: ['projects', variables.projectId] 
      });
    },
    ...options,
  });
}
