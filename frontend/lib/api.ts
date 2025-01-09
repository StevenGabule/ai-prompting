import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8001", // Points to your Next.js API route
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;