import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AuthForm.css";

type AuthFormProps = {
  title: string;
  buttonText: string;
  isSignup?: boolean;
};

function AuthForm({ title, buttonText, isSignup = false }: AuthFormProps) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    dob: "",
    phone: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const validateForm = () => {
    if (isSignup) {
      if (!formData.username.trim()) return "Username is required";
      if (!formData.email.trim()) return "Email is required";
      if (!formData.first_name.trim()) return "First name is required";
      if (!formData.dob) return "Date of birth is required";
      if (!formData.phone.trim()) return "Phone number is required";
      if (!formData.password) return "Password is required";
      if (formData.password.length < 6) return "Password must be at least 6 characters";
    } else {
      if (!formData.email.trim()) return "Email is required";
      if (!formData.password) return "Password is required";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const url = isSignup
        ? "http://localhost:3000/auth/register"
        : "http://localhost:3000/auth/login";

      const payload = isSignup
        ? {
            username: formData.username.trim(),
            email: formData.email.trim(),
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim() || undefined,
            dob: formData.dob,
            phone: formData.phone.trim(),
            password: formData.password,
          }
        : {
            email: formData.email.trim(),
            password: formData.password,
          };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "An error occurred");
      }

      if (isSignup) {
        setSuccess("Registration successful! Redirecting...");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        setSuccess("Login successful!");
        localStorage.setItem("token", data.token);
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h2>{title}</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {isSignup && (
          <>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="first_name">First Name</label>
              <input
                id="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Enter first name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Last Name</label>
              <input
                id="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Enter last name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dob">Date of Birth</label>
              <input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="text"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </div>
          </>
        )}

        {!isSignup && (
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
          />
        </div>

        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? "Please wait..." : buttonText}
        </button>

        <p className="auth-footer">
          {isSignup ? (
            <>
              Already have an account? <Link to="/">Login</Link>
            </>
          ) : (
            <>
              Don't have an account? <Link to="/signup">Signup</Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}

export default AuthForm;
