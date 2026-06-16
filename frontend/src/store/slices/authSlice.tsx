import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthUser {
  id: number;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

function decodeToken(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.id || !payload.role) return null;
    return { id: payload.id, role: payload.role };
  } catch {
    return null;
  }
}

const savedToken = localStorage.getItem("token");
const savedUser = savedToken ? decodeToken(savedToken) : null;

const initialState: AuthState = {
  user: savedUser,
  token: savedUser ? savedToken : null,
  isAuthenticated: !!savedUser,
  isAdmin: savedUser?.role === "admin",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<string>) => {
      const token = action.payload;
      const user = decodeToken(token);
      if (!user) return;

      localStorage.setItem("token", token);
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.isAdmin = user.role === "admin";
    },
    logout: (state) => {
      localStorage.removeItem("token");
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
