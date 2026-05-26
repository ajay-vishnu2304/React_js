import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../../components/AuthForm/AuthForm";
import { getHomePathForRole, getUserRole, isValidToken } from "../../services/jwtUtils";

export default function Login() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && isValidToken(token)) {
      navigate(getHomePathForRole(getUserRole(token)), { replace: true });
    }
  }, [navigate]);

  return <AuthForm title="Login" buttonText="Login" />;
}
