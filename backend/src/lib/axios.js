import axios from "axios";

export const flaskEmbeddingService = axios.create({
  baseURL: "http://127.0.0.1:5001",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

export const flaskCameraService = axios.create({
  baseURL: "http://127.0.0.1:5002",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});