import { useCallback } from "react";
import { useAppSelector } from "../store/hooks";

export function useAuthenticatedFetch() {
  const token = useAppSelector((state) => state.auth.token);

  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    },
    [token]
  );

  return { authFetch };
}
