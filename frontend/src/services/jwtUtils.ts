import { jwtDecode } from "jwt-decode";

export interface JWTPayload {
  id: string;
  username: string;
  email: string;
  role: string;
  exp?: number;
}

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwtDecode<JWTPayload>(token);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

export const getUserRole = (token: string): string | null => {
  const decoded = decodeToken(token);
  return decoded?.role || null;
};

export const getUserId = (token: string): string | null => {
  const decoded = decodeToken(token);
  return decoded?.id || null;
};

export const hasRole = (token: string, requiredRole: string): boolean => {
  const userRole = getUserRole(token);
  return userRole === requiredRole;
};

export const hasAnyRole = (token: string, requiredRoles: string[]): boolean => {
  const userRole = getUserRole(token);
  return userRole ? requiredRoles.includes(userRole) : false;
};

export const isValidToken = (token: string): boolean => {
  if (!token) return false;
  const decoded = decodeToken(token);
  if (!decoded) return false;
  return !isTokenExpired(token);
};

export const getHomePathForRole = (role: string | null): string => {
  switch (role) {
    case "admin":
      return "/admin";
    case "product_manager":
      return "/product-manager";
    default:
      return "/dashboard";
  }
};

export const logout = (
  navigate?: (path: string, options?: { replace?: boolean }) => void,
): void => {
  localStorage.removeItem("token");
  if (navigate) {
    navigate("/login", { replace: true });
  }
};
