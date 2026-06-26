import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProductDetails from "../../pages/productDetails/ProductDetails";
import authReducer from "../../store/slices/authSlice";
import cartReducer from "../../store/slices/cartSlice";
import wishlistReducer from "../../store/slices/wishlistSlice";
import type { WishlistItem } from "../../store/slices/wishlistSlice";
import quantityReducer from "../../store/slices/quantitySlice";
import orderReducer from "../../store/slices/orderSlice";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const preloadedState: {
  auth: {
    user: { id: number; role: string };
    token: string;
    isAuthenticated: boolean;
    isAdmin: boolean;
  };
  cart: { items: never[]; cartId: null };
  wishlist: { items: WishlistItem[]; wishlistId: number | null };
} = {
  auth: {
    user: { id: 1, role: "user" },
    token: "token",
    isAuthenticated: true,
    isAdmin: false,
  },
  cart: { items: [], cartId: null },
  wishlist: { items: [], wishlistId: null },
};

const product = {
  id: 1,
  name: "Blue Shirt",
  description: "A nice shirt",
  price: 25,
  brand: "Brand A",
  images: ["img1.jpg", "img2.jpg"],
  color: "blue",
  size: "M",
  stock_no: 5,
};

const productNoImages = {
  ...product,
  images: [],
};

function renderDetails(route = "/products/1", state = preloadedState) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
      wishlist: wishlistReducer,
      quantities: quantityReducer,
      orders: orderReducer,
    },
    preloadedState: state,
  });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/products/:id" element={<ProductDetails />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe("ProductDetails page", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("shows loading state", () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(product),
    } as Response);
    renderDetails();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders product details and adds to cart", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(product),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cartId: 1 }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cartId: 1, items: [] }),
      } as Response);

    renderDetails();
    await waitFor(() => screen.getByText("Blue Shirt"));
    expect(screen.getByText("Brand A")).toBeInTheDocument();
    expect(screen.getByText("$25")).toBeInTheDocument();
    expect(screen.getByText("5 units")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Add to Cart"));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/cart-items",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("shows error toast when fetch fails", async () => {
    const { toast } = await import("react-toastify");
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    } as Response);
    renderDetails();
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to fetch product");
    });
  });

  it("shows Product not found when product is null after failed fetch", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    } as Response);
    renderDetails();
    await waitFor(() => {
      expect(screen.getByText("Product not found")).toBeInTheDocument();
    });
  });

  it("renders No Image placeholder when product has no images", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(productNoImages),
    } as Response);
    renderDetails();
    await waitFor(() => screen.getByText("Blue Shirt"));
    expect(screen.getByText("No Image")).toBeInTheDocument();
  });

  it("toggles wishlist (add)", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(product),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ wishlistId: 1 }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ wishlistId: 1, items: [{ id: 1, productId: 1 }] }),
      } as Response);

    renderDetails();
    await waitFor(() => screen.getByText("Blue Shirt"));
    const wishlistButton = screen.getByTitle("Toggle wishlist");
    await userEvent.click(wishlistButton);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/wishlist-items",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("toggles wishlist (remove when already in wishlist)", async () => {
    const stateWithWishlist = {
      ...preloadedState,
      wishlist: { items: [{ id: 5, productId: 1 }], wishlistId: 1 },
    };
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(product),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ wishlistId: 1, items: [] }),
      } as Response);

    renderDetails("/products/1", stateWithWishlist);
    await waitFor(() => screen.getByText("Blue Shirt"));
    const wishlistButton = screen.getByTitle("Toggle wishlist");
    await userEvent.click(wishlistButton);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/wishlist-items/5",
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  it("shows error toast when add to cart fails", async () => {
    const { toast } = await import("react-toastify");
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(product),
      } as Response)
      .mockRejectedValueOnce(new Error("Network error"));

    renderDetails();
    await waitFor(() => screen.getByText("Blue Shirt"));
    await userEvent.click(screen.getByText("Add to Cart"));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to add to cart");
    });
  });

  it("shows error toast when wishlist toggle fails", async () => {
    const { toast } = await import("react-toastify");
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(product),
      } as Response)
      .mockRejectedValueOnce(new Error("Network error"));

    renderDetails();
    await waitFor(() => screen.getByText("Blue Shirt"));
    await userEvent.click(screen.getByTitle("Toggle wishlist"));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to update wishlist");
    });
  });

  it("increments and decrements quantity", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(product),
    } as Response);
    renderDetails();
    await waitFor(() => screen.getByText("Blue Shirt"));

    const incButton = screen.getByText("+");
    await userEvent.click(incButton);
    expect(screen.getByText("2")).toBeInTheDocument();

    const decButton = screen.getByText("−");
    await userEvent.click(decButton);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("disables add to cart when out of stock", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ...product, stock_no: 0 }),
    } as Response);
    renderDetails();
    await waitFor(() => screen.getByText("Blue Shirt"));
    expect(screen.getByText("Out of Stock")).toBeDisabled();
  });

  it("navigates back when back button clicked", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(product),
    } as Response);

    const store = configureStore({
      reducer: {
        auth: authReducer,
        cart: cartReducer,
        wishlist: wishlistReducer,
        quantities: quantityReducer,
        orders: orderReducer,
      },
      preloadedState,
    });
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/", "/products/1"]}>
          <Routes>
            <Route path="/" element={<div>Home Page</div>} />
            <Route path="/products/:id" element={<ProductDetails />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    await waitFor(() => screen.getByText("Blue Shirt"));
    await userEvent.click(screen.getByText("← Back"));
    await waitFor(() => {
      expect(screen.getByText("Home Page")).toBeInTheDocument();
    });
  });

  it("selects a thumbnail to change main image", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(product),
    } as Response);
    renderDetails();
    await waitFor(() => screen.getByText("Blue Shirt"));
    const thumbs = document.querySelectorAll(".product-thumb");
    await userEvent.click(thumbs[1]);
    const mainImage = document.querySelector(".main-image") as HTMLImageElement;
    expect(mainImage.getAttribute("src")).toBe("img2.jpg");
  });

  it("opens and closes zoom overlay", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(product),
    } as Response);
    renderDetails();
    await waitFor(() => screen.getByText("Blue Shirt"));

    const mainImage = screen.getByAltText("Blue Shirt");
    await userEvent.click(mainImage);
    expect(screen.getByText("×")).toBeInTheDocument();

    await userEvent.click(screen.getByText("×"));
    expect(screen.queryByText("×")).not.toBeInTheDocument();
  });

  it("closes zoom when clicking overlay", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(product),
    } as Response);
    renderDetails();
    await waitFor(() => screen.getByText("Blue Shirt"));

    const mainImage = screen.getByAltText("Blue Shirt");
    await userEvent.click(mainImage);
    const overlay = document.querySelector(".zoom-overlay") as HTMLElement;
    await userEvent.click(overlay);
    expect(screen.queryByText("×")).not.toBeInTheDocument();
  });

  it("navigates to next and previous image in zoom", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(product),
    } as Response);
    renderDetails();
    await waitFor(() => screen.getByText("Blue Shirt"));

    const mainImage = screen.getByAltText("Blue Shirt");
    await userEvent.click(mainImage);

    const zoomImg = document.querySelector(".zoom-img") as HTMLImageElement;
    expect(zoomImg.getAttribute("src")).toBe("img1.jpg");

    const nextButton = screen.getByText("›");
    await userEvent.click(nextButton);
    expect(zoomImg.getAttribute("src")).toBe("img2.jpg");

    const prevButton = screen.getByText("‹");
    await userEvent.click(prevButton);
    expect(zoomImg.getAttribute("src")).toBe("img1.jpg");
  });

  it("wraps around when navigating next on last image", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(product),
    } as Response);
    renderDetails();
    await waitFor(() => screen.getByText("Blue Shirt"));

    const mainImage = screen.getByAltText("Blue Shirt");
    await userEvent.click(mainImage);

    const zoomImg = document.querySelector(".zoom-img") as HTMLImageElement;
    const nextButton = screen.getByText("›");
    await userEvent.click(nextButton);
    expect(zoomImg.getAttribute("src")).toBe("img2.jpg");
    await userEvent.click(nextButton);
    expect(zoomImg.getAttribute("src")).toBe("img1.jpg");
  });
});
