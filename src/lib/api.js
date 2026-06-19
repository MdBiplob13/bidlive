"use client";
import axios from "axios";

/**
 * Browser axios instance. Cookies are sent automatically (httpOnly JWT),
 * so we only need withCredentials. Base URL is same-origin /api.
 */
export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error?.response?.data?.message || error?.message || "Something went wrong";
    return Promise.reject(Object.assign(error, { message }));
  }
);

export default api;
