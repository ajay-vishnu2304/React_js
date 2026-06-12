import { useCallback } from "react";
import { useAppSelector } from "../store/hooks";

export function useAuthenticatedFetch() {
  const token = useAppSelector((state) => state.auth.token);

  const authFetch = useCallback(
    (endpoint: string, options: RequestInit = {}) => {
      return fetch(endpoint, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      });
    },
    [token]
  );

  return { authFetch };
}
