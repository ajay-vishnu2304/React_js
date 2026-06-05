import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        navigate(payload.role === "admin" ? "/admin/dashboard" : "/dashboard", { replace: true });
      } catch {
        localStorage.removeItem("token");
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({});
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.field === "email") {
          setError({ email: data.message });
        } else if (data.field === "password") {
          setError({ password: data.message });
        } else {
          setError({ general: data.message });
        }
        return;
      }

      localStorage.setItem("token", data.token);
      const payload = JSON.parse(atob(data.token.split(".")[1]));
      navigate(payload.role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch {
      setError({ general: "Server error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="authcard">
        <h2 className="auth-title">Login</h2>

        {error.general && (
          <p className="general-error" style={{ color: "red" }}>
            {error.general}
          </p>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error.email) setError((prev) => ({ ...prev, email: "" }));
              }}
              required
            />
            {error.email && (
              <span
                className="error-text"
                style={{ color: "red", fontSize: "0.85rem" }}
              >
                {error.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error.password)
                  setError((prev) => ({ ...prev, password: "" }));
              }}
              required
            />
            {error.password && (
              <span
                className="error-text"
                style={{ color: "red", fontSize: "0.85rem" }}
              >
                {error.password}
              </span>
            )}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Signup</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
