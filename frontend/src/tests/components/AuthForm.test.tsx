/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    (globalThis as any).fetch = jest.fn();
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
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AuthForm title="Signup" buttonText="Create Account" isSignup={true} />
      </MemoryRouter>
    );

    // Type values and blur to activate validation
    await user.type(screen.getByLabelText("Username"), "john_doe");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("First Name"), "John");
    await user.type(screen.getByLabelText("Date of Birth"), "1995-05-15");
    await user.type(screen.getByLabelText("Phone Number"), "1234567890");
    await user.type(screen.getByLabelText("Password"), "weak");

    await user.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() => {
      expect(screen.getByText("Password must be at least 8 characters long")).toBeInTheDocument();
    });
  });

  test("submits login and redirects on success", async () => {
    const user = userEvent.setup();
    const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsInVzZXJuYW1lIjoidGVzdCIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIn0.signature";
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => JSON.stringify({ token: mockToken, message: "Login successful!" }),
    });

    render(
      <MemoryRouter>
        <AuthForm title="Login" buttonText="Login" isSignup={false} />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Password"), "Password@123");

    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect((globalThis as any).fetch).toHaveBeenCalledWith(
        expect.stringContaining("/auth/login"),
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
      expect(mockNavigate).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  test("displays API error response on failure", async () => {
    const user = userEvent.setup();
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () => JSON.stringify({ error: "Invalid credentials" }),
    });

    render(
      <MemoryRouter>
        <AuthForm title="Login" buttonText="Login" isSignup={false} />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Password"), "Password@123");

    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });
});
