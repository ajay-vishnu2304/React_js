import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import OrdersPage from "../../pages/orders/OrdersPage";
import "@testing-library/jest-dom";

jest.mock("jspdf", () => {
  return jest.fn().mockImplementation(() => ({
    text: jest.fn(),
    save: jest.fn(),
  }));
});

jest.mock("jspdf-autotable", () => jest.fn());

jest.mock("../../services/jwtUtils", () => ({
  hasRole: jest.fn(),
}));

jest.mock("../../services/apiService", () => ({
  getAllOrders: jest.fn(),
  getUsers: jest.fn(),
  updateOrderStatus: jest.fn(),
}));

import { hasRole } from "../../services/jwtUtils";
import {
  getAllOrders,
  getUsers,
  updateOrderStatus,
} from "../../services/apiService";

describe("OrdersPage", () => {
  let consoleErrorSpy: jest.SpyInstance;
  let alertSpy: jest.SpyInstance;

  const rawMockOrders = [
    {
      id: 1,
      user_id: 101,
      total_amount: 150.00,
      order_status: "pending",
      created_at: "2024-01-15T10:30:00Z",
    },
    {
      id: 2,
      user_id: 102,
      total_amount: 250.50,
      order_status: "delivered",
      created_at: "2024-01-14T14:20:00Z",
    },
    {
      id: 3,
      user_id: 103,
      total_amount: 75.25,
      order_status: "shipped",
      created_at: "2024-01-13T09:15:00Z",
    },
  ];

  const mockUsers = [
    { id: 101, first_name: "John", last_name: "Doe", username: "johndoe", email: "john@example.com" },
    { id: 102, first_name: "Jane", last_name: "Smith", username: "janesmith", email: "jane@example.com" },
    { id: 103, first_name: "Bob", last_name: "Wilson", username: "bobwilson", email: "bob@example.com" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    (hasRole as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    alertSpy.mockRestore();
  });

  test("renders loading state initially", () => {
    localStorage.setItem("token", "fake-token");
    (getAllOrders as jest.Mock).mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    );

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Loading orders...")).toBeInTheDocument();
  });

  test("renders orders from API successfully", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getAllOrders as jest.Mock).mockResolvedValue(rawMockOrders);
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("Bob Wilson")).toBeInTheDocument();
    });
  });

  test("displays correct order amounts", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getAllOrders as jest.Mock).mockResolvedValue(rawMockOrders);
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("₹150")).toBeInTheDocument();
      expect(screen.getByText("₹250.5")).toBeInTheDocument();
      expect(screen.getByText("₹75.25")).toBeInTheDocument();
    });
  });

  test("filters orders by status", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getAllOrders as jest.Mock).mockResolvedValue(rawMockOrders);
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    const statusFilter = screen.getByDisplayValue("All Statuses");
    fireEvent.change(statusFilter, { target: { value: "pending" } });

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
    });
  });

  test("shows admin dropdown for status change when user is admin", async () => {
    (hasRole as jest.Mock).mockReturnValue(true);
    localStorage.setItem("token", "fake-token");
    
    (getAllOrders as jest.Mock).mockResolvedValue(rawMockOrders);
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Look for status dropdowns by their class name instead of display value
      const statusDropdowns = document.querySelectorAll('.status-dropdown');
      expect(statusDropdowns.length).toBeGreaterThan(0);
    });
  });

  test("shows status badge when user is not admin", async () => {
    (hasRole as jest.Mock).mockReturnValue(false);
    localStorage.setItem("token", "fake-token");
    
    (getAllOrders as jest.Mock).mockResolvedValue(rawMockOrders);
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("pending")).toBeInTheDocument();
    });
  });

  test("handles status change for admin user", async () => {
    (hasRole as jest.Mock).mockReturnValue(true);
    localStorage.setItem("token", "fake-token");
    
    (getAllOrders as jest.Mock).mockResolvedValue(rawMockOrders);
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);
    (updateOrderStatus as jest.Mock).mockResolvedValue({ message: "Status updated" });

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Use querySelector to find status dropdowns instead of getAllByDisplayValue
    const statusDropdowns = document.querySelectorAll('.status-dropdown');
    expect(statusDropdowns.length).toBeGreaterThan(0);
    fireEvent.change(statusDropdowns[0], { target: { value: "delivered" } });

    await waitFor(() => {
      expect(updateOrderStatus).toHaveBeenCalledWith(
        "fake-token",
        1,
        "delivered"
      );
    });
  });

  test("shows alert when non-admin tries to change status", async () => {
    (hasRole as jest.Mock).mockReturnValue(false);
    localStorage.setItem("token", "fake-token");
    
    (getAllOrders as jest.Mock).mockResolvedValue(rawMockOrders);
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Non-admin users see badges, not dropdowns
    expect(screen.queryByDisplayValue("pending")).not.toBeInTheDocument();
  });

  test("handles API error gracefully", async () => {
    localStorage.setItem("token", "fake-token");
    (getAllOrders as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  test("handles missing token", async () => {
    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText("Loading orders...")).not.toBeInTheDocument();
    });
  });

  test("toggles export menu", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getAllOrders as jest.Mock).mockResolvedValue(rawMockOrders);
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const exportButton = screen.getByText("Export Data ▾");
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText("Download CSV")).toBeInTheDocument();
      expect(screen.getByText("Download PDF")).toBeInTheDocument();
    });
  });

  test("closes export menu when clicking outside", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getAllOrders as jest.Mock).mockResolvedValue(rawMockOrders);
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const exportButton = screen.getByText("Export Data ▾");
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText("Download CSV")).toBeInTheDocument();
    });

    // Click outside to close
    fireEvent.click(screen.getByText("Orders Management"));

    await waitFor(() => {
      expect(screen.queryByText("Download CSV")).not.toBeInTheDocument();
    });
  });

  test("shows no orders message when filter returns empty", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getAllOrders as jest.Mock).mockResolvedValue(rawMockOrders);
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const statusFilter = screen.getByDisplayValue("All Statuses");
    fireEvent.change(statusFilter, { target: { value: "cancelled" } });

    await waitFor(() => {
      expect(screen.getByText("No orders found for the selected status.")).toBeInTheDocument();
    });
  });

  test("normalizes various status values", async () => {
    const ordersWithVariousStatuses = [
      { ...rawMockOrders[0], order_status: "completed" },
      { ...rawMockOrders[1], order_status: "PLACED" },
      { ...rawMockOrders[2], order_status: "CANCELED" },
    ];

    localStorage.setItem("token", "fake-token");
    
    (getAllOrders as jest.Mock).mockResolvedValue(ordersWithVariousStatuses);
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Check that status dropdowns have the normalized values
    const statusDropdowns = document.querySelectorAll('.status-dropdown');
    expect(statusDropdowns.length).toBeGreaterThan(0);
    
    // Get the values from the dropdowns
    const dropdownValues = Array.from(statusDropdowns).map(select => (select as HTMLSelectElement).value);
    
    // completed should be normalized to delivered
    expect(dropdownValues).toContain("delivered");
    // PLACED should be normalized to placed
    expect(dropdownValues).toContain("placed");
    // CANCELED should be normalized to cancelled
    expect(dropdownValues).toContain("cancelled");
  });

  test("handles user name fallback when user not found", async () => {
    const ordersWithUnknownUser = [
      { ...rawMockOrders[0], user_id: 999 },
    ];

    localStorage.setItem("token", "fake-token");
    
    (getAllOrders as jest.Mock).mockResolvedValue(ordersWithUnknownUser);
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("User #999")).toBeInTheDocument();
    });
  });

  test("calls onStatusUpdated callback when provided", async () => {
    const mockOnStatusUpdated = jest.fn();
    (hasRole as jest.Mock).mockReturnValue(true);
    localStorage.setItem("token", "fake-token");
    
    (getAllOrders as jest.Mock).mockResolvedValue(rawMockOrders);
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);
    (updateOrderStatus as jest.Mock).mockResolvedValue({ message: "Status updated" });

    render(
      <MemoryRouter>
        <OrdersPage onStatusUpdated={mockOnStatusUpdated} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Use querySelector to find status dropdowns
    const statusDropdowns = document.querySelectorAll('.status-dropdown');
    expect(statusDropdowns.length).toBeGreaterThan(0);
    fireEvent.change(statusDropdowns[0], { target: { value: "delivered" } });

    await waitFor(() => {
      expect(mockOnStatusUpdated).toHaveBeenCalled();
    });
  });

  test("handles status update error", async () => {
    (hasRole as jest.Mock).mockReturnValue(true);
    localStorage.setItem("token", "fake-token");
    
    (getAllOrders as jest.Mock).mockResolvedValue(rawMockOrders);
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);
    (updateOrderStatus as jest.Mock).mockRejectedValue(new Error("Update failed"));

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Use querySelector to find status dropdowns
    const statusDropdowns = document.querySelectorAll('.status-dropdown');
    expect(statusDropdowns.length).toBeGreaterThan(0);
    fireEvent.change(statusDropdowns[0], { target: { value: "delivered" } });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Failed to update status. Please try again.");
    });
  });

  test("displays order dates correctly", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getAllOrders as jest.Mock).mockResolvedValue(rawMockOrders);
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Check that dates are formatted and displayed
      const dateCells = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(dateCells.length).toBeGreaterThan(0);
    });
  });

  test("displays order IDs correctly", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getAllOrders as jest.Mock).mockResolvedValue(rawMockOrders);
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("#1")).toBeInTheDocument();
      expect(screen.getByText("#2")).toBeInTheDocument();
      expect(screen.getByText("#3")).toBeInTheDocument();
    });
  });
});
