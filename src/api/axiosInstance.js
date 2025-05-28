  //axiosinstance.js
  import axios from "axios";
  import { auth } from "../firebase";

  const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor to add auth token and share code
  axiosInstance.interceptors.request.use(
    async (config) => {
      try {
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Get share code from URL if available
        const urlParams = new URLSearchParams(window.location.search);
        const shareCode = urlParams.get('shareCode');
        
        // If no share code in URL, try to get it from localStorage for this event
        if (!shareCode && config.url) {
          const eventId = config.url.split('/').pop();
          const storedShareCode = localStorage.getItem(`event_${eventId}_shareCode`);
          if (storedShareCode) {
            config.headers['X-Share-Code'] = storedShareCode;
          }
        } else if (shareCode) {
          config.headers['X-Share-Code'] = shareCode;
        }

        return config;
      } catch (error) {
        console.error("Error getting auth token:", error);
        return Promise.reject(error);
      }
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle common errors
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response) {
        // Handle 401 Unauthorized
        if (error.response.status === 401) {
          // You can add logic here to handle token expiration
          console.error("Authentication error:", error.response.data);
        }
        // Handle 403 Forbidden
        else if (error.response.status === 403) {
          console.error("Access forbidden:", error.response.data);
        }
      }
      return Promise.reject(error);
    }
  );

  export default axiosInstance;