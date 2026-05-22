import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../../components/AuthForm/AuthForm";

export default function Signup() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <AuthForm 
      title="Signup"
      buttonText="Create a Account"
      isSignup={true}
    />
  );
}
