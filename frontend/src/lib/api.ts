import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL: BASE_URL });

// Attach Clerk token to every request
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Auth
export const syncUser = () => api.post("/auth/sync");
export const getMe = () => api.get("/auth/me");

// Conversations
export const listConversations = () => api.get("/conversations/");
export const getConversation = (id: string) => api.get(`/conversations/${id}`);
export const sendMessage = (content: string, conversation_id?: string) =>
  api.post("/conversations/message", { content, conversation_id });
export const deleteConversation = (id: string) => api.delete(`/conversations/${id}`);

// Schemes
export const listSchemes = (category?: string) =>
  api.get("/schemes/", { params: category ? { category } : {} });

// Admin
export const getAdminStats = () => api.get("/admin/stats");
export const listUsers = () => api.get("/admin/users");
export const listAllConversations = (skip = 0, limit = 50) =>
  api.get("/admin/conversations", { params: { skip, limit } });

export default api;