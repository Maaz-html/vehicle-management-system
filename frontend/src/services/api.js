import axios from "axios";

const api = axios.create({
  baseURL: "https://vehicle-backend-4lgp.onrender.com/api",
});

export default api;
