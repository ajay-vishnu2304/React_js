import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "../../pages/dashboard/Dashboard";
import "@testing-library/jest-dom";

describe("Dashboard Page", () => {
  let consoleSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    globalThis.fetch = jest.fn();
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  test("shows loading state initially", () => {
    localStorage.setItem("token", "fake-token");
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => JSON.stringify([]),
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText("Loading products...")).toBeInTheDocument();
  });

  test("renders products from API successfully", async () => {
    const fakeProducts = [
      { id: 1, name: "Product 1", price: 100, stock_no: 10 },
      { id: 2, name: "Product 2", price: 200, stock_no: 5 },
    ];

    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => JSON.stringify(fakeProducts),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => JSON.stringify([]),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => JSON.stringify([]),
      });

    localStorage.setItem("token", "fake-token");

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
      expect(screen.getByText("Product 2")).toBeInTheDocument();
    });

    expect(screen.getByText("₹100")).toBeInTheDocument();
    expect(screen.getByText("₹200")).toBeInTheDocument();
  });

  test("shows empty state when no products", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => JSON.stringify([]),
    });

    localStorage.setItem("token", "fake-token");

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("No products available.")).toBeInTheDocument();
    });
  });

  test("handles API error gracefully", async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    localStorage.setItem("token", "fake-token");

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("No products available.")).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalled();
  });

  test("renders navbar and footer", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => JSON.stringify([]),
    });

    localStorage.setItem("token", "fake-token");

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText("AJVX.")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/All Rights Reserved/)).toBeInTheDocument();
    });
  });
});
