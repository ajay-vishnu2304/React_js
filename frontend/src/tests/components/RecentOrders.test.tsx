import { render, screen } from "@testing-library/react";
import RecentOrders from "../../components/Tables/RecentOrders";
import "@testing-library/jest-dom";

const mockOrders = [
  { id: 1, user_id: 10, total_amount: 99.5, order_status: "shipped", created_at: "2026-01-01" },
  { id: 2, user_id: 11, total_amount: 45, order_status: "pending", created_at: "2026-01-02" },
];

const mockUsers = [
  { id: 10, first_name: "John", last_name: "Doe", username: "johnd" },
  { id: 11, username: "jane" },
];

describe("RecentOrders Component", () => {
  test("renders header and limits to 5 recent orders", () => {
    render(<RecentOrders orders={mockOrders} users={mockUsers} />);

    expect(screen.getByText("Recent Orders")).toBeInTheDocument();
    expect(screen.getByText("View All")).toBeInTheDocument();
    // shows customer names via users lookup
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("jane")).toBeInTheDocument();
  });

  test("handles empty orders and missing users gracefully", () => {
    render(<RecentOrders orders={[]} />);
    expect(screen.getByText("Recent Orders")).toBeInTheDocument();
    // no rows with data expected, just header
  });

  test("falls back to User #id when no users or no match", () => {
    render(<RecentOrders orders={[{ id: 99, user_id: 999, total_amount: 10, order_status: "new", created_at: "" }]} />);
    expect(screen.getByText("User #999")).toBeInTheDocument();
  });
});
