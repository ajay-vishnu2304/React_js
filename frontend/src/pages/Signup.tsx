import AuthForm from "../components/AuthForm/AuthForm";

export default function Signup() {
  return (
    <AuthForm title="Signup"
      buttonText="Create a Account"
      isSignup={true}  />
  )
}
