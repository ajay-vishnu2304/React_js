import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AdminRoute from "../../components/AdminRoute/AdminRoute";
import "@testing-library/jest-dom";

jest.mock("../../components/ProtectedRoute/ProtectedRoute", () => {
  return ({ children }: { children: React.ReactNode }) => <div data-testid="protected-admin">{children}</div>;
});

describe("AdminRoute Component", () => {
  test("wraps content with ProtectedRoute for admin role", () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route path="/" element={<div>Admin Child</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId("protected-admin")).toBeInTheDocument();
    expect(screen.getByText("Admin Child")).toBeInTheDocument();
  });
});
