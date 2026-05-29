import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import "./components/ErrorBoundary/ErrorBoundary.css";

function App() {
  return (
    <ErrorBoundary>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <AppRoutes />
    </ErrorBoundary>
  );
}

export default App;
