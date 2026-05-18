import AuthForm from "../components/AuthForm/AuthForm";



export default function Login() {
  return (
    <AuthForm
      title="Login"
      buttonText="Login"
      isSignup={false}
    />
  );
}
