
const getApiUrl = (): string => {
  return import.meta.env?.VITE_API_URL ?? process.env?.VITE_API_URL ?? "";
};

export const API_BASE_URL = getApiUrl();
