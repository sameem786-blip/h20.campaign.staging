import axios from "axios";

// You can use NEXT_PUBLIC_ env vars for client-safe URLs
const axiosInstance = axios.create({
  baseURL: "https://social-scraping-api.sofisun.software/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
