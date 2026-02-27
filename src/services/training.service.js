import axios from "axios";

const trainingBaseURL =
  process.env.REACT_APP_TRAINING_API_URL || "http://localhost:8000";

export const isTrainingServiceConfigured = () =>
  Boolean(process.env.REACT_APP_TRAINING_API_URL);

const trainingClient = axios.create({
  baseURL: trainingBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Start LoRA training. Sends task_id, emotion, and image files as multipart/form-data.
 * @param {string} taskId - Unique task/clone identifier (e.g. "my-clone-1")
 * @param {string} emotion - Emotion label (e.g. "happy", "sad", "neutral", "angry")
 * @param {File[]} imageFiles - Array of image File objects
 * @returns {Promise<{ status: string, task_id: string }>}
 */
export const startTraining = async (taskId, emotion, imageFiles) => {
  const formData = new FormData();
  formData.append("task_id", taskId);
  formData.append("emotion", emotion);
  for (const file of imageFiles) {
    formData.append("images", file);
  }

  const { data } = await trainingClient.post("/train-lora", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

/**
 * Get training status for a task.
 * @param {string} taskId - Task ID returned from startTraining
 * @returns {Promise<{ task_id: string, status: string }>}
 */
export const getTrainingStatus = async (taskId) => {
  const { data } = await trainingClient.get(`/status/${taskId}`);
  return data;
};
