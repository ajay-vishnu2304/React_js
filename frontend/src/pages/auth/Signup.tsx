import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

interface SignupErrors {
  name?: string;
  email?: string;
  password?: string;
  general?: string;
}

const Signup = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<SignupErrors>({});
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({});
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError({ general: data.message });
        return;
      }

      navigate("/login");
    } catch {
      setError({ general: "Server error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="authcard">
        <h2 className="auth-title">Signup</h2>

        {error.general && (
          <p className="general-error" style={{ color: "red" }}>
            {error.general}
          </p>
        )}

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                if (error.name) setError((prev) => ({ ...prev, name: "" }));
              }}
              required
            />
            {error.name && (
              <span className="error-text" style={{ color: "red", fontSize: "0.85rem" }}>
                {error.name}
              </span>
            )}
          </div>

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
              <span className="error-text" style={{ color: "red", fontSize: "0.85rem" }}>
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
                if (error.password) setError((prev) => ({ ...prev, password: "" }));
              }}
              required
            />
            {error.password && (
              <span className="error-text" style={{ color: "red", fontSize: "0.85rem" }}>
                {error.password}
              </span>
            )}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
