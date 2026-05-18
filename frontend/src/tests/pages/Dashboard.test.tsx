import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "../../pages/Dashboard";
import "@testing-library/jest-dom";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Dashboard Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("redirects to login if no token is present", () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("renders user data from token successfully", () => {
    const fakePayload = {
      id: 1,
      username: "ajay_vishnu",
      email: "ajay@example.com",
      role: "admin",
      exp: Math.floor(Date.now() / 1000) + 3600
    };
    
    const base64Payload = window.btoa(
      Array.from(new TextEncoder().encode(JSON.stringify(fakePayload)), (byte) => String.fromCharCode(byte)).join("")
    );
    const fakeToken = `header.${base64Payload}.signature`;
    
    localStorage.setItem("token", fakeToken);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Welcome back,/i)).toBeInTheDocument();
    expect(screen.getAllByText("ajay_vishnu").length).toBeGreaterThan(0);
    expect(screen.getByText("ajay@example.com")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();
  });

  test("clears token and redirects on logout click", () => {
    const fakePayload = {
      id: 1,
      username: "ajay_vishnu",
      email: "ajay@example.com",
      role: "admin",
      exp: Math.floor(Date.now() / 1000) + 3600
    };
    
    const base64Payload = window.btoa(
      Array.from(new TextEncoder().encode(JSON.stringify(fakePayload)), (byte) => String.fromCharCode(byte)).join("")
    );
    const fakeToken = `header.${base64Payload}.signature`;
    
    localStorage.setItem("token", fakeToken);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const logoutButton = screen.getByRole("button", { name: "Logout" });
    fireEvent.click(logoutButton);

    expect(localStorage.getItem("token")).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
