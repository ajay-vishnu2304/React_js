import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProductManagerRoute from "../../components/ProductManagerRoute/ProductManagerRoute";
import "@testing-library/jest-dom";

jest.mock("../../components/ProtectedRoute/ProtectedRoute", () => {
  return ({ children }: { children: React.ReactNode }) => <div data-testid="protected-pm">{children}</div>;
});

describe("ProductManagerRoute Component", () => {
  test("wraps content with ProtectedRoute for admin and product_manager roles", () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route element={<ProductManagerRoute />}>
            <Route path="/" element={<div>PM Child</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId("protected-pm")).toBeInTheDocument();
    expect(screen.getByText("PM Child")).toBeInTheDocument();
  });
});
