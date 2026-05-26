import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProductsPage from "../../pages/products/ProductsPage";
import "@testing-library/jest-dom";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../services/jwtUtils", () => ({
  hasAnyRole: jest.fn(),
}));

jest.mock("../../services/apiService", () => ({
  getProducts: jest.fn(),
  createProduct: jest.fn(),
  deleteProduct: jest.fn(),
  getProductImagesByProductId: jest.fn(),
}));

import { hasAnyRole } from "../../services/jwtUtils";
import {
  getProducts,
  createProduct,
  deleteProduct,
  getProductImagesByProductId,
} from "../../services/apiService";

describe("ProductsPage", () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;
  let alertSpy: jest.SpyInstance;
  let confirmSpy: jest.SpyInstance;

  const mockProducts = [
    {
      id: 1,
      name: "Test Product 1",
      description: "Description 1",
      price: "100.00",
      stock_no: 15,
      brand: "Brand A",
      color: "Red",
      size: "M",
    },
    {
      id: 2,
      name: "Test Product 2",
      description: "Description 2",
      price: "200.00",
      stock_no: 5,
      brand: "Brand B",
      color: "Blue",
      size: "L",
    },
    {
      id: 3,
      name: "Test Product 3",
      description: "Description 3",
      price: "300.00",
      stock_no: 0,
      brand: "Brand A",
      color: "Green",
      size: "S",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    (hasAnyRole as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    alertSpy.mockRestore();
    confirmSpy.mockRestore();
  });

  test("renders loading state initially", () => {
    localStorage.setItem("token", "fake-token");
    (getProducts as jest.Mock).mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    );

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Loading products...")).toBeInTheDocument();
  });

  test("renders products from API successfully", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getProducts as jest.Mock).mockResolvedValue(mockProducts);
    (getProductImagesByProductId as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      expect(screen.getByText("Test Product 2")).toBeInTheDocument();
      expect(screen.getByText("Test Product 3")).toBeInTheDocument();
    });
  });

  test("displays error state when API fails", async () => {
    localStorage.setItem("token", "fake-token");
    (getProducts as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    await act(async () => {
      render(
        <MemoryRouter>
          <ProductsPage />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  test("filters products by search query", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getProducts as jest.Mock).mockResolvedValue(mockProducts);
    (getProductImagesByProductId as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search products...");
    fireEvent.change(searchInput, { target: { value: "Product 1" } });

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      expect(screen.queryByText("Test Product 2")).not.toBeInTheDocument();
    });
  });

  test("filters products by brand", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getProducts as jest.Mock).mockResolvedValue(mockProducts);
    (getProductImagesByProductId as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    });

    const brandSelect = screen.getByDisplayValue("All Brands");
    fireEvent.change(brandSelect, { target: { value: "Brand A" } });

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      expect(screen.queryByText("Test Product 2")).not.toBeInTheDocument();
    });
  });

  test("filters products by stock status", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getProducts as jest.Mock).mockResolvedValue(mockProducts);
    (getProductImagesByProductId as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    });

    const stockSelect = screen.getByDisplayValue("All Stock");
    fireEvent.change(stockSelect, { target: { value: "outOfStock" } });

    await waitFor(() => {
      expect(screen.queryByText("Test Product 1")).not.toBeInTheDocument();
      expect(screen.queryByText("Test Product 2")).not.toBeInTheDocument();
      expect(screen.getByText("Test Product 3")).toBeInTheDocument();
    });
  });

  test("clears all filters when clear button is clicked", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getProducts as jest.Mock).mockResolvedValue(mockProducts);
    (getProductImagesByProductId as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search products...");
    fireEvent.change(searchInput, { target: { value: "Product 1" } });

    await waitFor(() => {
      expect(screen.queryByText("Test Product 2")).not.toBeInTheDocument();
    });

    const clearButton = screen.getByText("Clear");
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      expect(screen.getByText("Test Product 2")).toBeInTheDocument();
    });
  });

  test("opens add product modal", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getProducts as jest.Mock).mockResolvedValue(mockProducts);
    (getProductImagesByProductId as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    });

    const addButton = screen.getByText("+ Add Product");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("Add New Product")).toBeInTheDocument();
    });
  });

  test("closes modal when cancel button is clicked", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getProducts as jest.Mock).mockResolvedValue(mockProducts);
    (getProductImagesByProductId as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("+ Add Product"));
    
    await waitFor(() => {
      expect(screen.getByText("Add New Product")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Cancel"));

    await waitFor(() => {
      expect(screen.queryByText("Add New Product")).not.toBeInTheDocument();
    });
  });

  test("shows no products message when filters return empty", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getProducts as jest.Mock).mockResolvedValue(mockProducts);
    (getProductImagesByProductId as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search products...");
    fireEvent.change(searchInput, { target: { value: "NonExistentProduct" } });

    await waitFor(() => {
      expect(screen.getByText("No products match the selected filters.")).toBeInTheDocument();
    });
  });

  test("displays correct stock status badges", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getProducts as jest.Mock).mockResolvedValue(mockProducts);
    (getProductImagesByProductId as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    });

    // Check for stock status badges in the document
    const stockBadges = document.querySelectorAll('.status-badge');
    expect(stockBadges.length).toBeGreaterThan(0);
  });

  test("hides add product button when user lacks permissions", async () => {
    (hasAnyRole as jest.Mock).mockReturnValue(false);
    localStorage.setItem("token", "fake-token");
    
    (getProducts as jest.Mock).mockResolvedValue(mockProducts);
    (getProductImagesByProductId as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText("+ Add Product")).not.toBeInTheDocument();
    });
  });

  test("hides edit and delete buttons when user lacks permissions", async () => {
    (hasAnyRole as jest.Mock).mockReturnValue(false);
    localStorage.setItem("token", "fake-token");
    
    (getProducts as jest.Mock).mockResolvedValue(mockProducts);
    (getProductImagesByProductId as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      expect(screen.queryByText("Edit")).not.toBeInTheDocument();
      expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    });
  });

  test("starts and cancels stock edit", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getProducts as jest.Mock).mockResolvedValue(mockProducts);
    (getProductImagesByProductId as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTitle("Quick update stock");
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByDisplayValue("15")).toBeInTheDocument();
    });

    const cancelButton = screen.getByText("✕");
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByDisplayValue("15")).not.toBeInTheDocument();
    });
  });

  test("deletes product successfully", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getProducts as jest.Mock).mockResolvedValue([mockProducts[2]]); // Only out of stock product
    (getProductImagesByProductId as jest.Mock).mockResolvedValue([]);
    (deleteProduct as jest.Mock).mockResolvedValue({ message: "Deleted" });

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product 3")).toBeInTheDocument();
    });

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Product deleted successfully!");
    });
  });

  test("prevents deletion of product with stock > 0", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getProducts as jest.Mock).mockResolvedValue([mockProducts[0]]);
    (getProductImagesByProductId as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    });

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Cannot delete product with stock > 0");
    });
  });

  test("submits add product form with validation", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getProducts as jest.Mock).mockResolvedValue([]);
    (getProductImagesByProductId as jest.Mock).mockResolvedValue([]);
    (createProduct as jest.Mock).mockResolvedValue({ ...mockProducts[0], id: 4 });

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("+ Add Product")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("+ Add Product"));

    await waitFor(() => {
      expect(screen.getByText("Add New Product")).toBeInTheDocument();
    });

    // Fill in the form
    fireEvent.change(screen.getByLabelText("Product Name *"), { target: { value: "New Product" } });
    fireEvent.change(screen.getByLabelText("Price (₹) *"), { target: { value: "100" } });
    fireEvent.change(screen.getByLabelText("Stock Quantity *"), { target: { value: "50" } });

    fireEvent.click(screen.getByText("Create Product"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Product added successfully!");
    });
  });

  test("validates price and stock inputs", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getProducts as jest.Mock).mockResolvedValue([]);
    (getProductImagesByProductId as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("+ Add Product")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("+ Add Product"));

    await waitFor(() => {
      expect(screen.getByText("Add New Product")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Product Name *"), { target: { value: "New Product" } });
    fireEvent.change(screen.getByLabelText("Price (₹) *"), { target: { value: "-10" } });
    fireEvent.change(screen.getByLabelText("Stock Quantity *"), { target: { value: "50" } });

    fireEvent.click(screen.getByText("Create Product"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Please enter a valid positive price.");
    });
  });

  test("opens edit modal for existing product", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getProducts as jest.Mock).mockResolvedValue([mockProducts[0]]);
    (getProductImagesByProductId as jest.Mock).mockResolvedValue([{ image_url: "http://example.com/image.jpg" }]);

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    });

    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText("Edit Product")).toBeInTheDocument();
    });
  });
});
