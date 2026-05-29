import { API_BASE_URL } from "../config/api";

export interface AuthResponse {
  token: string;
  message?: string;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterUserData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name?: string;
  dob?: string;
  phone?: string;
}

export const loginUser = async (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return handleResponse<AuthResponse>(response);
};

export const registerUser = async (
  userData: RegisterUserData,
): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return handleResponse<AuthResponse>(response);
};

export const getDashboardData = async <T>(token: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}/auth/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<T>(response);
};

export interface AdminDashboardData {
  users: BackendUser[];
  products: Product[];
  orders: Order[];
  categories: Category[];
  carts: Cart[];
  coupons: Coupon[];
  payments: Payment[];
  productCategories: ProductCategory[];
  reviews: Review[];
  productImages: ProductImage[];
}

export const getAdminDashboardData = async (
  token: string,
  signal?: AbortSignal,
): Promise<AdminDashboardData> => {
  const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    signal,
  });
  return handleResponse<AdminDashboardData>(response);
};

export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  order_status: string;
  created_at: string;
  updated_at?: string;
}

export const getOrders = async (token: string): Promise<Order[]> => {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<Order[]>(response);
};

export interface OrderStatusResponse {
  message?: string;
  error?: string;
  order?: Order;
}

export const updateOrderStatus = async (
  token: string,
  orderId: number,
  newStatus: string,
): Promise<OrderStatusResponse> => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ order_status: newStatus }),
  });
  return handleResponse<OrderStatusResponse>(response);
};

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export const getCategories = async (token: string): Promise<Category[]> => {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<Category[]>(response);
};

export interface Cart {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  created_at?: string;
  updated_at?: string;
}

export const getCarts = async (token: string): Promise<Cart[]> => {
  const response = await fetch(`${API_BASE_URL}/carts`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<Cart[]>(response);
};

export interface Coupon {
  id: number;
  code: string;
  discount_amount?: number;
  discount_percentage?: number;
  expiry_date?: string;
  created_at?: string;
  updated_at?: string;
}

export const getCoupons = async (token: string): Promise<Coupon[]> => {
  const response = await fetch(`${API_BASE_URL}/coupons`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<Coupon[]>(response);
};

export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  payment_method: string;
  payment_status: string;
  created_at?: string;
  updated_at?: string;
}

export const getPayments = async (token: string): Promise<Payment[]> => {
  const response = await fetch(`${API_BASE_URL}/payments`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<Payment[]>(response);
};

export interface ProductCategory {
  id: number;
  product_id: number;
  category_id: number;
  created_at?: string;
  updated_at?: string;
}

export const getProductCategories = async (
  token: string,
): Promise<ProductCategory[]> => {
  const response = await fetch(`${API_BASE_URL}/product-categories`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<ProductCategory[]>(response);
};

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  created_at?: string;
  updated_at?: string;
}

export const getReviews = async (token: string): Promise<Review[]> => {
  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<Review[]>(response);
};

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  created_at?: string;
}

export const getProductImages = async (
  token: string,
  signal?: AbortSignal,
): Promise<ProductImage[]> => {
  const response = await fetch(`${API_BASE_URL}/product-images/all`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    signal,
  });
  return handleResponse<ProductImage[]>(response);
};

export const getProductImagesByProductId = async (
  token: string,
  productId: number,
  signal?: AbortSignal,
): Promise<ProductImage[]> => {
  const response = await fetch(
    `${API_BASE_URL}/product-images?product_id=${productId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal,
    },
  );
  return handleResponse<ProductImage[]>(response);
};

export interface ProductImageResponse {
  message?: string;
  error?: string;
  id?: number;
  product_image?: ProductImage;
}

export const addProductImage = async (
  token: string,
  productId: number,
  imageUrl: string,
): Promise<ProductImageResponse> => {
  const response = await fetch(`${API_BASE_URL}/product-images`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ product_id: productId, image_url: imageUrl }),
  });
  return handleResponse<ProductImageResponse>(response);
};

export interface DeleteResponse {
  message?: string;
  error?: string;
}

export const deleteProductImage = async (
  token: string,
  imageId: number,
): Promise<DeleteResponse> => {
  const response = await fetch(`${API_BASE_URL}/product-images/${imageId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<DeleteResponse>(response);
};

export const deleteAllProductImages = async (
  token: string,
  productId: number,
): Promise<DeleteResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/product-images/product/${productId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return handleResponse<DeleteResponse>(response);
};

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock_no: number;
  brand?: string;
  color?: string;
  size?: string;
  created_at?: string;
  updated_at?: string;
}

export const getProducts = async (
  token?: string,
  signal?: AbortSignal,
): Promise<Product[]> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/products`, {
    method: "GET",
    headers,
    signal,
  });
  return handleResponse<Product[]>(response);
};

export interface BackendUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name?: string;
  dob: string;
  phone: string;
  role?: string;
}

export const getAllOrders = async (
  token: string,
  signal?: AbortSignal,
): Promise<Order[]> => {
  const response = await fetch(`${API_BASE_URL}/orders/all`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    signal,
  });
  return handleResponse<Order[]>(response);
};

export const getUsers = async (
  token: string,
  signal?: AbortSignal,
): Promise<BackendUser[]> => {
  const response = await fetch(`${API_BASE_URL}/user`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    signal,
  });
  return handleResponse<BackendUser[]>(response);
};

export const updateUserRole = async (
  token: string,
  userId: number,
  role: string,
): Promise<DeleteResponse> => {
  const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });
  return handleResponse<DeleteResponse>(response);
};

export const createUser = async (
  token: string,
  userData: {
    email: string;
    first_name: string;
    last_name?: string;
    role: string;
    dob: string;
    phone: string;
    password?: string;
  },
): Promise<BackendUser> => {
  const response = await fetch(`${API_BASE_URL}/user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  return handleResponse<BackendUser>(response);
};

export const deleteUser = async (
  token: string,
  id: number,
): Promise<DeleteResponse> => {
  const response = await fetch(`${API_BASE_URL}/user/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<DeleteResponse>(response);
};

export const searchProducts = async (
  token: string,
  query: string,
): Promise<Product[]> => {
  const response = await fetch(
    `${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return handleResponse<Product[]>(response);
};

export const getProductsByBrand = async (
  token: string,
  brand: string,
): Promise<Product[]> => {
  const response = await fetch(
    `${API_BASE_URL}/products/brand?brand=${encodeURIComponent(brand)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return handleResponse<Product[]>(response);
};

export const getProductsByPriceRange = async (
  token: string,
  min: number,
  max: number,
): Promise<Product[]> => {
  const response = await fetch(
    `${API_BASE_URL}/products/price-range?min=${min}&max=${max}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return handleResponse<Product[]>(response);
};

export interface CreateProductResponse {
  message?: string;
  error?: string;
  id?: number;
  product?: Product;
}

export const createProduct = async (
  token: string,
  product: Omit<Product, "id" | "created_at" | "updated_at">,
): Promise<CreateProductResponse> => {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
  });
  return handleResponse<CreateProductResponse>(response);
};

export const updateProduct = async (
  token: string,
  id: number,
  updates: Partial<Product>,
): Promise<CreateProductResponse> => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  return handleResponse<CreateProductResponse>(response);
};

export const updateProductStock = async (
  token: string,
  id: number,
  stock: number,
): Promise<CreateProductResponse> => {
  const response = await fetch(`${API_BASE_URL}/products/${id}/stock`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ stock_no: stock }),
  });
  return handleResponse<CreateProductResponse>(response);
};

export const deleteProduct = async (
  token: string,
  id: number,
): Promise<DeleteResponse> => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<DeleteResponse>(response);
};

interface ApiResponse {
  error?: string;
  message?: string;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly data: ApiResponse;

  constructor(status: number, data: ApiResponse) {
    const message = data?.error || data?.message || `HTTP ${status}`;
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  let data: (T & ApiResponse) | null = null;

  let responseText = "";
  try {
    responseText = await response.text();
  } catch {
    data = { error: "Failed to parse response" } as T & ApiResponse;
  }

  if (responseText) {
    try {
      data = JSON.parse(responseText) as T & ApiResponse;
    } catch {
      if (
        responseText.includes("<!DOCTYPE") ||
        responseText.includes("<html")
      ) {
        console.error(
          "Received HTML error response instead of JSON:",
          responseText.substring(0, 200),
        );
        data = {
          error: `Server returned HTML error page (HTTP ${response.status})`,
          message:
            responseText.substring(0, 200) +
            (responseText.length > 200 ? "..." : ""),
        } as T & ApiResponse;
      } else {
        data = { message: responseText } as T & ApiResponse;
      }
    }
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data || {
        error: `HTTP ${response.status || "undefined"}: ${response.statusText || "undefined"}`,
      },
    );
  }
  return data || ({} as T);
};
