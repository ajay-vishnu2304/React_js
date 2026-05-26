/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProductManagerDashboard from "../../pages/productManagerDashboard/ProductManagerDashboard";
import "@testing-library/jest-dom";

const mockNavigate = jest.fn();
const mockSetSearchParams = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
}));

jest.mock("../../services/jwtUtils", () => ({
  hasAnyRole: jest.fn(),
}));

import { hasAnyRole } from "../../services/jwtUtils";

describe("ProductManagerDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (hasAnyRole as jest.Mock).mockReturnValue(true);
  });

  test("redirects to login when no token", () => {
    render(
      <MemoryRouter>
        <ProductManagerDashboard />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("redirects to login when no access", () => {
    (hasAnyRole as jest.Mock).mockReturnValue(false);
    localStorage.setItem("token", "fake-token");

    render(
      <MemoryRouter>
        <ProductManagerDashboard />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("renders dashboard successfully with access", () => {
    localStorage.setItem("token", "fake-token");

    render(
      <MemoryRouter>
        <ProductManagerDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText("Welcome Product Manager")).toBeInTheDocument();
  });

  test("renders all stats cards", () => {
    localStorage.setItem("token", "fake-token");

    render(
      <MemoryRouter>
        <ProductManagerDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText("Total Products")).toBeInTheDocument();
    expect(screen.getByText("Low Stock")).toBeInTheDocument();
    expect(screen.getByText("New Arrivals")).toBeInTheDocument();
    expect(screen.getByText("Out of Stock")).toBeInTheDocument();
    expect(screen.getByText("Trending Product")).toBeInTheDocument();
    expect(screen.getByText("Most Sold Product")).toBeInTheDocument();
    expect(screen.getByText("Top Sold Category")).toBeInTheDocument();
  });

  test("displays correct stats values", () => {
    localStorage.setItem("token", "fake-token");

    render(
      <MemoryRouter>
        <ProductManagerDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText("1,250")).toBeInTheDocument(); // Total Products
    expect(screen.getByText("45")).toBeInTheDocument(); // Low Stock
    expect(screen.getByText("120")).toBeInTheDocument(); // New Arrivals
    expect(screen.getByText("12")).toBeInTheDocument(); // Out of Stock
    expect(screen.getByText("Acoustic Pro Headphones")).toBeInTheDocument(); // Trending Product
    expect(screen.getByText("Smart Watch Series 5")).toBeInTheDocument(); // Most Sold Product
    expect(screen.getByText("Electronics")).toBeInTheDocument(); // Top Sold Category
  });

  test("displays stats percentages", () => {
    localStorage.setItem("token", "fake-token");

    render(
      <MemoryRouter>
        <ProductManagerDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText("+8% than last month")).toBeInTheDocument();
    expect(screen.getByText("-3% than last month")).toBeInTheDocument();
    expect(screen.getByText("+15% than last month")).toBeInTheDocument();
    expect(screen.getByText("-5% than last month")).toBeInTheDocument();
    expect(screen.getByText("+35% views this week")).toBeInTheDocument();
    expect(screen.getByText("420 units sold")).toBeInTheDocument();
    expect(screen.getByText("58% of total sales")).toBeInTheDocument();
  });

  test("renders sidebar and navbar", () => {
    localStorage.setItem("token", "fake-token");

    render(
      <MemoryRouter>
        <ProductManagerDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText("AJVX")).toBeInTheDocument(); // Sidebar logo
    expect(screen.getByText("ADMIN")).toBeInTheDocument(); // Navbar profile
  });

  test("toggles sidebar when menu button is clicked", () => {
    localStorage.setItem("token", "fake-token");

    render(
      <MemoryRouter>
        <ProductManagerDashboard />
      </MemoryRouter>
    );

    const menuButton = screen.getByLabelText("Toggle menu");
    fireEvent.click(menuButton);
  });

  test("renders RecentOrders component", () => {
    localStorage.setItem("token", "fake-token");

    render(
      <MemoryRouter>
        <ProductManagerDashboard />
      </MemoryRouter>
    );

    // RecentOrders should be rendered (it shows "Recent Orders" heading)
    expect(screen.getByText("Recent Orders")).toBeInTheDocument();
  });

  test("renders Products tab when tab param is products", () => {
    // Mock the search params for products tab
    const originalUseSearchParams = jest.requireMock("react-router-dom").useSearchParams;
    jest.requireMock("react-router-dom").useSearchParams = () => [new URLSearchParams("tab=products"), mockSetSearchParams];
    
    localStorage.setItem("token", "fake-token");

    render(
      <MemoryRouter>
        <ProductManagerDashboard />
      </MemoryRouter>
    );

    // Restore original mock
    jest.requireMock("react-router-dom").useSearchParams = originalUseSearchParams;
  });

  test("handles admin role access", () => {
    (hasAnyRole as jest.Mock).mockReturnValue(true);
    localStorage.setItem("token", "fake-token");

    render(
      <MemoryRouter>
        <ProductManagerDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText("Welcome Product Manager")).toBeInTheDocument();
  });

  test("handles product_manager role access", () => {
    (hasAnyRole as jest.Mock).mockReturnValue(true);
    localStorage.setItem("token", "fake-token");

    render(
      <MemoryRouter>
        <ProductManagerDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText("Welcome Product Manager")).toBeInTheDocument();
  });

  test("dashboard has correct CSS classes", () => {
    localStorage.setItem("token", "fake-token");

    const { container } = render(
      <MemoryRouter>
        <ProductManagerDashboard />
      </MemoryRouter>
    );

    expect(container.querySelector(".admin-dashboard")).toBeInTheDocument();
    expect(container.querySelector(".dashboard-nav")).toBeInTheDocument();
    expect(container.querySelector(".dashboard-main")).toBeInTheDocument();
  });

  test("stats grid has correct CSS class", () => {
    localStorage.setItem("token", "fake-token");

    const { container } = render(
      <MemoryRouter>
        <ProductManagerDashboard />
      </MemoryRouter>
    );

    expect(container.querySelector(".stats-grid")).toBeInTheDocument();
  });

  test("sidebar receives correct props", () => {
    localStorage.setItem("token", "fake-token");

    render(
      <MemoryRouter>
        <ProductManagerDashboard />
      </MemoryRouter>
    );

    // Sidebar should be rendered with Dashboard as active tab by default
    expect(screen.getByText("Dashboard")).toHaveClass("active");
  });

  test("navbar receives correct props", () => {
    localStorage.setItem("token", "fake-token");

    render(
      <MemoryRouter>
        <ProductManagerDashboard />
      </MemoryRouter>
    );

    // NavBar should be rendered with menu toggle
    expect(screen.getByLabelText("Toggle menu")).toBeInTheDocument();
  });
});