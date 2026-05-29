import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../../services/apiService";
import { getHomePathForRole, getUserRole } from "../../services/jwtUtils";
import { loginSchema, signupSchema, type CombinedFormData } from "../../validators/userSchema";
import "./AuthForm.css";

type AuthFormProps = Readonly<{
  title: string;
  buttonText: string;
  isSignup?: boolean;
}>;

function AuthForm({ title, buttonText, isSignup = false }: AuthFormProps) {
  const navigate = useNavigate();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CombinedFormData>({
    resolver: zodResolver(isSignup ? signupSchema : loginSchema),
    defaultValues: isSignup
      ? { username: "", email: "", first_name: "", last_name: "", dob: "", phone: "", password: "" }
      : { email: "", password: "" },
  });

  const onSubmit = async (data: CombinedFormData) => {
    setGlobalError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isSignup) {
        if (!data.username || !data.first_name || !data.dob || !data.phone) {
          setGlobalError("Please fill in all required fields");
          setLoading(false);
          return;
        }
        await registerUser({
          username: data.username!.trim(),
          email: data.email?.trim() || "",
          first_name: data.first_name!.trim(),
          last_name: data.last_name?.trim() || undefined,
          dob: data.dob!,
          phone: data.phone!.trim(),
          password: data.password || "",
        });
        setSuccess("Registration successful! Redirecting...");
        navigate("/", { replace: true });
      } else {
        const result = await loginUser({
          email: data.email?.trim() || "",
          password: data.password || "",
        });
        setSuccess("Login successful!");
        localStorage.setItem("token", result.token);
        navigate(getHomePathForRole(getUserRole(result.token)), { replace: true });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setGlobalError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <h2>{title}</h2>

        {globalError && <div className="error-message">{globalError}</div>}
        {success && <div className="success-message">{success}</div>}

        {isSignup && (
          <>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                {...register("username")}
                placeholder="Enter username"
              />
              {errors.username && <span className="field-error">{String(errors.username.message)}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Enter email"
              />
              {errors.email && <span className="field-error">{String(errors.email.message)}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="first_name">First Name</label>
              <input
                id="first_name"
                type="text"
                {...register("first_name")}
                placeholder="Enter first name"
              />
              {errors.first_name && <span className="field-error">{String(errors.first_name.message)}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Last Name</label>
              <input
                id="last_name"
                type="text"
                {...register("last_name")}
                placeholder="Enter last name (optional)"
              />
              {errors.last_name && <span className="field-error">{String(errors.last_name.message)}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="dob">Date of Birth</label>
              <input
                id="dob"
                type="date"
                {...register("dob")}
              />
              {errors.dob && <span className="field-error">{String(errors.dob.message)}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="text"
                {...register("phone")}
                placeholder="Enter phone number"
              />
              {errors.phone && <span className="field-error">{String(errors.phone.message)}</span>}
            </div>
          </>
        )}

        {!isSignup && (
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Enter email"
            />
            {errors.email && <span className="field-error">{String(errors.email.message)}</span>}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            {...register("password")}
            placeholder="Enter password"
          />
          {errors.password && <span className="field-error">{String(errors.password.message)}</span>}
        </div>

        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? "Please wait..." : buttonText}
        </button>

        <p className="auth-footer">
          {isSignup ? (
            <>
              Already have an account? <Link to="/login">Login</Link>
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