import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthForm from "../../components/AuthForm/AuthForm";
import "@testing-library/jest-dom";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("AuthForm Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    global.fetch = jest.fn();
  });

  test("renders Login fields correctly", () => {
    render(
      <MemoryRouter>
        <AuthForm title="Login" buttonText="Login" isSignup={false} />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.queryByLabelText("Username")).not.toBeInTheDocument();
  });

  test("renders Signup fields correctly", () => {
    render(
      <MemoryRouter>
        <AuthForm title="Signup" buttonText="Create Account" isSignup={true} />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Signup" })).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Date of Birth")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone Number")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  test("validation: shows error for invalid password strength during registration", async () => {
    render(
      <MemoryRouter>
        <AuthForm title="Signup" buttonText="Create Account" isSignup={true} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "john_doe" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByLabelText("First Name"), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText("Date of Birth"), { target: { value: "1995-05-15" } });
    fireEvent.change(screen.getByLabelText("Phone Number"), { target: { value: "1234567890" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "weak" } });

    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() => {
      expect(screen.getByText("Password must be at least 6 characters")).toBeInTheDocument();
    });
  });

  test("submits login and redirects on success", async () => {
    const mockToken = "fake-jwt-token";
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: mockToken, message: "Login successful!" }),
    });

    render(
      <MemoryRouter>
        <AuthForm title="Login" buttonText="Login" isSignup={false} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Password@123" } });

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/auth/login",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "john@example.com", password: "Password@123" }),
        })
      );
    });

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe(mockToken);
      expect(screen.getByText("Login successful!")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    }, { timeout: 2000 });
  });

  test("displays API error response on failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid credentials" }),
    });

    render(
      <MemoryRouter>
        <AuthForm title="Login" buttonText="Login" isSignup={false} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Password@123" } });

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });
});
