
const getApiUrl = (): string => {
  
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_URL ?? "";
  }
 
  if (typeof process !== 'undefined' && process.env) {
    return process.env.VITE_API_URL ?? "";
  }
  return "";
};

export const API_BASE_URL = getApiUrl();
