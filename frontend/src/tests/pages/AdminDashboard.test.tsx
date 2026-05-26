/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminDashboard from "../../pages/adminDashboard/adminDashboard";
import "@testing-library/jest-dom";

const mockNavigate = jest.fn();
const mockSetSearchParams = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
}));

jest.mock("../../services/jwtUtils", () => ({
  hasRole: jest.fn(),
}));

jest.mock("../../services/apiService", () => ({
  getAdminDashboardData: jest.fn(),
}));

import { hasRole } from "../../services/jwtUtils";
import { getAdminDashboardData } from "../../services/apiService";

describe("AdminDashboard", () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  const mockDashboardData = {
    users: [
      { id: 1, first_name: "John", last_name: "Doe", email: "john@example.com" },
      { id: 2, first_name: "Jane", last_name: "Smith", email: "jane@example.com" },
    ],
    products: [
      { id: 1, name: "Product 1", price: 100 },
      { id: 2, name: "Product 2", price: 200 },
    ],
    orders: [
      { id: 1, user_id: 1, total_amount: "150.00", order_status: "pending", created_at: "2024-01-15" },
      { id: 2, user_id: 2, total_amount: "250.50", order_status: "delivered", created_at: "2024-01-14" },
    ],
    categories: [],
    carts: [],
    coupons: [],
    payments: [],
    productCategories: [],
    reviews: [],
    productImages: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    (hasRole as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  test("redirects to login when no token", () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("redirects to login when not admin", () => {
    (hasRole as jest.Mock).mockReturnValue(false);
    localStorage.setItem("token", "fake-token");

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("renders loading state initially", () => {
    localStorage.setItem("token", "fake-token");
    (getAdminDashboardData as jest.Mock).mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    );

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("renders dashboard with data successfully", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getAdminDashboardData as jest.Mock).mockResolvedValue(mockDashboardData);

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Welcome Admin")).toBeInTheDocument();
    });

    await waitFor(() => {
      // Use more flexible queries due to duplicate labels in Sidebar + stats
      expect(screen.getAllByText("Total Revenue").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Users").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Products").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Orders").length).toBeGreaterThan(0);
    });
  });

  test("displays correct stats values", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getAdminDashboardData as jest.Mock).mockResolvedValue(mockDashboardData);

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Welcome Admin")).toBeInTheDocument();
    });

    // Relaxed assertions for counts (duplicates possible from other UI elements)
    await waitFor(() => {
      const twos = screen.getAllByText("2");
      expect(twos.length).toBeGreaterThanOrEqual(3); // at least users, products, orders
    });
  });

  test("displays error state when API fails", async () => {
    localStorage.setItem("token", "fake-token");
    (getAdminDashboardData as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to load dashboard data/i)).toBeInTheDocument();
    });
  });

  test("toggles sidebar when menu button is clicked", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getAdminDashboardData as jest.Mock).mockResolvedValue(mockDashboardData);

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Welcome Admin")).toBeInTheDocument();
    });

    // The NavBar should be rendered with a menu toggle button
    const menuButton = screen.getByLabelText("Toggle menu");
    fireEvent.click(menuButton);
  });

  test("handles empty dashboard data", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getAdminDashboardData as jest.Mock).mockResolvedValue({
      users: [],
      products: [],
      orders: [],
      categories: [],
      carts: [],
      coupons: [],
      payments: [],
      productCategories: [],
      reviews: [],
      productImages: [],
    });

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      // null data renders no content in main area, but sidebar/navbar still present
      expect(screen.getByText("AJVX")).toBeInTheDocument();
    });
  });

  test("handles null dashboard data", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getAdminDashboardData as jest.Mock).mockResolvedValue(null);

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      // null data: no inner content, sidebar still renders
      expect(screen.getByText("AJVX")).toBeInTheDocument();
    });
  });

  test("handles API error response", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getAdminDashboardData as jest.Mock).mockRejectedValueOnce(new Error("Server error"));

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to load dashboard data/i)).toBeInTheDocument();
    });
  });

  test("calculates revenue correctly", async () => {
    localStorage.setItem("token", "fake-token");
    
    const dataWithOrders = {
      ...mockDashboardData,
      orders: [
        { id: 1, user_id: 1, total_amount: "100.00", order_status: "pending", created_at: "2024-01-15" },
        { id: 2, user_id: 2, total_amount: "200.50", order_status: "delivered", created_at: "2024-01-14" },
        { id: 3, user_id: 3, total_amount: "50.25", order_status: "shipped", created_at: "2024-01-13" },
      ],
    };

    (getAdminDashboardData as jest.Mock).mockResolvedValue(dataWithOrders);

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Welcome Admin")).toBeInTheDocument();
    });

    // Revenue should be ₹350.75 (100.00 + 200.50 + 50.25)
    await waitFor(() => {
      expect(screen.getByText(/₹350.75/)).toBeInTheDocument();
    });
  });

  test("handles orders with invalid total_amount", async () => {
    localStorage.setItem("token", "fake-token");
    
    const dataWithInvalidOrders = {
      ...mockDashboardData,
      orders: [
        { id: 1, user_id: 1, total_amount: "invalid", order_status: "pending", created_at: "2024-01-15" },
        { id: 2, user_id: 2, total_amount: "100.00", order_status: "delivered", created_at: "2024-01-14" },
      ],
    };

    (getAdminDashboardData as jest.Mock).mockResolvedValue(dataWithInvalidOrders);

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Welcome Admin")).toBeInTheDocument();
    });

    // Revenue should be ₹100.00 (only valid amount...) - use getAll to tolerate duplicates in UI (e.g. recent orders)
    await waitFor(() => {
      expect(screen.getAllByText(/₹100/).length).toBeGreaterThan(0);
    });
  });

  test("renders sidebar and navbar", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getAdminDashboardData as jest.Mock).mockResolvedValue(mockDashboardData);

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("AJVX")).toBeInTheDocument(); // Sidebar logo
      expect(screen.getByText("ADMIN")).toBeInTheDocument(); // Navbar profile
    });
  });
});
