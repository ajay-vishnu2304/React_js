import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "../../pages/Dashboard";
import "@testing-library/jest-dom";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Dashboard Page", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    globalThis.fetch = jest.fn();
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test("redirects to login if no token is present", () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("renders user data from API successfully", async () => {
    const fakeUser = {
      id: 1,
      username: "ajay_vishnu",
      email: "ajay@example.com",
      role: "admin"
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => fakeUser,
    });
    
    localStorage.setItem("token", "fake-token");

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    const welcomeMsg = await screen.findByText(/Welcome back,/i);
    expect(welcomeMsg).toBeInTheDocument();
    expect(screen.getAllByText("ajay_vishnu").length).toBeGreaterThan(0);
    expect(screen.getByText("ajay@example.com")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/auth/dashboard",
      expect.objectContaining({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer fake-token",
        },
      })
    );
  });

  test("clears token and redirects on logout click", async () => {
    const fakeUser = {
      id: 1,
      username: "ajay_vishnu",
      email: "ajay@example.com",
      role: "admin"
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => fakeUser,
    });
    
    localStorage.setItem("token", "fake-token");

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const logoutButton = await screen.findByRole("button", { name: "Logout" });
    fireEvent.click(logoutButton);

    expect(localStorage.getItem("token")).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("redirects to login if API returns error", async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    localStorage.setItem("token", "invalid-token");

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});
