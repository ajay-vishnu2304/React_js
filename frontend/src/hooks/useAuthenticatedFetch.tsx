const API_URL = import.meta.env.VITE_API_URL;

export function useAuthenticatedFetch() {
  const token = localStorage.getItem("token");

  const authFetch = (endpoint: string, options: RequestInit = {}) => {
    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options?.headers,
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  };

  return { authFetch };
}
