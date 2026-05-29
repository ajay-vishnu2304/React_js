import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ProductsPage from "../../pages/Products/ProductsPage";
import "@testing-library/jest-dom";

const mockNavigate = jest.fn();

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

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
  getProductImages: jest.fn(),
  getProductImagesByProductId: jest.fn(),
}));

import toast from "react-hot-toast";
import { hasAnyRole } from "../../services/jwtUtils";
import {
  getProducts,
  createProduct,
  deleteProduct,
  getProductImages,
  getProductImagesByProductId,
} from "../../services/apiService";

describe("ProductsPage", () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;
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
    (toast.success as jest.Mock).mockClear();
    (toast.error as jest.Mock).mockClear();
    localStorage.clear();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    (hasAnyRole as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
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
    (getProductImages as jest.Mock).mockResolvedValue([]);

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
    const user = userEvent.setup();
    localStorage.setItem("token", "fake-token");
    
    (getProducts as jest.Mock).mockResolvedValue(mockProducts);
    (getProductImages as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search products...");
    await user.type(searchInput, "Product 1");

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      expect(screen.queryByText("Test Product 2")).not.toBeInTheDocument();
    });
  });

  test("filters products by brand", async () => {
    const user = userEvent.setup();
    localStorage.setItem("token", "fake-token");
    
    (getProducts as jest.Mock).mockResolvedValue(mockProducts);
    (getProductImages as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    });

    const brandSelect = screen.getByDisplayValue("All Brands");
    await user.selectOptions(brandSelect, "Brand A");

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      expect(screen.queryByText("Test Product 2")).not.toBeInTheDocument();
    });
  });

  test("filters products by stock status", async () => {
    const user = userEvent.setup();
    localStorage.setItem("token", "fake-token");
    
    (getProducts as jest.Mock).mockResolvedValue(mockProducts);
    (getProductImages as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    });

    const stockSelect = screen.getByDisplayValue("All Stock");
    await user.selectOptions(stockSelect, "outOfStock");

    await waitFor(() => {
      expect(screen.queryByText("Test Product 1")).not.toBeInTheDocument();
      expect(screen.queryByText("Test Product 2")).not.toBeInTheDocument();
      expect(screen.getByText("Test Product 3")).toBeInTheDocument();
    });
  });

  test("clears all filters when clear button is clicked", async () => {
    const user = userEvent.setup();
    localStorage.setItem("token", "fake-token");
    
    (getProducts as jest.Mock).mockResolvedValue(mockProducts);
    (getProductImages as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search products...");
    await user.type(searchInput, "Product 1");

    await waitFor(() => {
      expect(screen.queryByText("Test Product 2")).not.toBeInTheDocument();
    });

    const clearButton = screen.getByText("Clear");
    await user.click(clearButton);

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      expect(screen.getByText("Test Product 2")).toBeInTheDocument();
    });
  });

  test("opens add product modal", async () => {
    const user = userEvent.setup();
    localStorage.setItem("token", "fake-token");
    
    (getProducts as jest.Mock).mockResolvedValue(mockProducts);
    (getProductImages as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    });

    const addButton = screen.getByText("+ Add Product");
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("Add New Product")).toBeInTheDocument();
    });
  });

  test("closes modal when cancel button is clicked", async () => {
    const user = userEvent.setup();
    localStorage.setItem("token", "fake-token");
    
    (getProducts as jest.Mock).mockResolvedValue(mockProducts);
    (getProductImages as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    });

    await user.click(screen.getByText("+ Add Product"));
    
    await waitFor(() => {
      expect(screen.getByText("Add New Product")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Cancel"));

    await waitFor(() => {
      expect(screen.queryByText("Add New Product")).not.toBeInTheDocument();
    });
  });

  test("shows no products message when filters return empty", async () => {
    const user = userEvent.setup();
    localStorage.setItem("token", "fake-token");
    
    (getProducts as jest.Mock).mockResolvedValue(mockProducts);
    (getProductImages as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search products...");
    await user.type(searchInput, "NonExistentProduct");

    await waitFor(() => {
      expect(screen.getByText("No products match the selected filters.")).toBeInTheDocument();
    });
  });

  test("displays correct stock status badges", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getProducts as jest.Mock).mockResolvedValue(mockProducts);
    (getProductImages as jest.Mock).mockResolvedValue([]);

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
    (getProductImages as jest.Mock).mockResolvedValue([]);

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
    (getProductImages as jest.Mock).mockResolvedValue([]);

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
    const user = userEvent.setup();
    localStorage.setItem("token", "fake-token");
    
    (getProducts as jest.Mock).mockResolvedValue(mockProducts);
    (getProductImages as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTitle("Quick update stock");
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByDisplayValue("15")).toBeInTheDocument();
    });

    const cancelButton = screen.getByText("✕");
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByDisplayValue("15")).not.toBeInTheDocument();
    });
  });

  test("deletes product successfully", async () => {
    const user = userEvent.setup();
    localStorage.setItem("token", "fake-token");
    
    (getProducts as jest.Mock).mockResolvedValue([mockProducts[2]]); // Only out of stock product
    (getProductImages as jest.Mock).mockResolvedValue([]);
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
    await user.click(deleteButton);

    // Modal opens with confirmation - click the Delete button in the modal to confirm
    const confirmDeleteButton = document.querySelector(
      '.modal-content .btn-submit'
    ) as HTMLButtonElement;
    await user.click(confirmDeleteButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Product deleted successfully!");
    });
  });

  test("prevents deletion of product with stock > 0", async () => {
    const user = userEvent.setup();
    localStorage.setItem("token", "fake-token");
    
    (getProducts as jest.Mock).mockResolvedValue([mockProducts[0]]);
    (getProductImages as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    });

    const deleteButton = screen.getByText("Delete");
    await user.click(deleteButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Cannot delete product with stock > 0");
    });
  });

  test("submits add product form with validation", async () => {
    const user = userEvent.setup();
    localStorage.setItem("token", "fake-token");
    
    (hasAnyRole as jest.Mock).mockReturnValue(true);
    (getProducts as jest.Mock).mockResolvedValue([]);
    (getProductImages as jest.Mock).mockResolvedValue([]);
    (createProduct as jest.Mock).mockResolvedValue({ ...mockProducts[0], id: 4 });

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("+ Add Product")).toBeInTheDocument();
    });

    await user.click(screen.getByText("+ Add Product"));

    await waitFor(() => {
      expect(screen.getByText("Add New Product")).toBeInTheDocument();
    });

    // Fill in the form - use getByLabelText with exact label from component
    const nameInput = screen.getByLabelText("Product Name *");
    const priceInput = screen.getByLabelText("Price (₹) *");
    const stockInput = screen.getByLabelText("Stock Quantity *");
    
    await user.type(nameInput, "New Product");
    await user.type(priceInput, "100");
    await user.type(stockInput, "50");

    await user.click(screen.getByText('Create Product'));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Product added successfully!");
    });
  });

  test("validates price and stock inputs", async () => {
    const user = userEvent.setup();
    localStorage.setItem("token", "fake-token");
    
    (hasAnyRole as jest.Mock).mockReturnValue(true);
    (getProducts as jest.Mock).mockResolvedValue([]);
    (getProductImages as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("+ Add Product")).toBeInTheDocument();
    });

    await user.click(screen.getByText("+ Add Product"));

    await waitFor(() => {
      expect(screen.getByText("Add New Product")).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText("Product Name *");
    const priceInput = screen.getByLabelText("Price (₹) *");
    const stockInput = screen.getByLabelText("Stock Quantity *");
    
    await user.type(nameInput, "New Product");
    await user.type(priceInput, "-10");
    await user.type(stockInput, "50");

    await user.click(screen.getByText("Create Product"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Please enter a valid positive price.");
    });
  });

  test("opens edit modal for existing product", async () => {
    const user = userEvent.setup();
    localStorage.setItem("token", "fake-token");
    
    (getProducts as jest.Mock).mockResolvedValue([mockProducts[0]]);
    (getProductImages as jest.Mock).mockResolvedValue([]);
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
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByText("Edit Product")).toBeInTheDocument();
    });
  });
});
