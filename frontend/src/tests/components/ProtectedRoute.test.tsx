import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../../components/ProtectedRoute/ProtectedRoute";
import * as jwtUtils from "../../services/jwtUtils";
import "@testing-library/jest-dom";

jest.mock("../../services/jwtUtils");

const mockIsValidToken = jwtUtils.isValidToken as jest.Mock;
const mockHasAnyRole = jwtUtils.hasAnyRole as jest.Mock;

describe("ProtectedRoute Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const renderWithRouter = (initialPath = "/protected", allowedRoles?: string[]) => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route
            element={<ProtectedRoute allowedRoles={allowedRoles}><div>Protected Content</div></ProtectedRoute>}
          >
            <Route path="/protected" element={<div>Child</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/dashboard" element={<div>Dashboard Redirect</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  test("redirects to /login if no token or invalid token", () => {
    mockIsValidToken.mockReturnValue(false);
    localStorage.removeItem("token");

    renderWithRouter();

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(localStorage.getItem("token")).toBeNull();
  });

  test("redirects to /dashboard if token valid but role not allowed", () => {
    localStorage.setItem("token", "valid-token");
    mockIsValidToken.mockReturnValue(true);
    mockHasAnyRole.mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={["admin"]}><div>Admin Only</div></ProtectedRoute>}>
            <Route path="/admin" element={<div>Admin Content</div>} />
          </Route>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  test("renders children or Outlet when token valid and role allowed (or no roles required)", () => {
    localStorage.setItem("token", "valid-token");
    mockIsValidToken.mockReturnValue(true);
    mockHasAnyRole.mockReturnValue(true);

    renderWithRouter("/protected", ["user"]);

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  test("allows access when no allowedRoles specified", () => {
    localStorage.setItem("token", "valid-token");
    mockIsValidToken.mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={["/any"]}>
        <Routes>
          <Route element={<ProtectedRoute><div>Any Auth User</div></ProtectedRoute>}>
            <Route path="/any" element={<div>Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Any Auth User")).toBeInTheDocument();
  });
});
