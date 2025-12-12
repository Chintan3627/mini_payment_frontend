import axios from "axios";

// Backend URL
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Optional: Add Auth Token if needed
API.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Global Error Handler
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("API ERROR:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default API;

// Helper Methods ==========================
export const getData = (url) => API.get(url).then((res) => res.data);

export const postData = (url, body) =>
  API.post(url, body).then((res) => res.data);

export const putData = (url, body) =>
  API.put(url, body).then((res) => res.data);

export const deleteData = (url) =>
  API.delete(url).then((res) => res.data);

