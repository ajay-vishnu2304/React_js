const API_BASE_URL =
  (import.meta as unknown as { env: { VITE_API_URL?: string } }).env
    ?.VITE_API_URL ?? "";

export interface AuthResponse {
  token: string;
  message?: string;
  error?: string;
}

export const loginUser = async (
  credentials: Record<string, unknown>,
): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return handleResponse<AuthResponse>(response);
};

export const registerUser = async (
  userData: Record<string, unknown>,
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



export const getAdminDashboardData = async (token: string): Promise<unknown> => {
  const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<unknown>(response);
};

export const getOrders = async (token: string): Promise<unknown[]> => {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<unknown[]>(response);
};

export const updateOrderStatus = async (
  token: string,
  orderId: number,
  newStatus: string
): Promise<unknown> => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ order_status: newStatus }),
  });
  return handleResponse<unknown>(response);
};

export const getCategories = async (token: string): Promise<unknown[]> => {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  return handleResponse<unknown[]>(response);
};

export const getCarts = async (token: string): Promise<unknown[]> => {
  const response = await fetch(`${API_BASE_URL}/carts`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  return handleResponse<unknown[]>(response);
};

export const getCoupons = async (token: string): Promise<unknown[]> => {
  const response = await fetch(`${API_BASE_URL}/coupons`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  return handleResponse<unknown[]>(response);
};

export const getPayments = async (token: string): Promise<unknown[]> => {
  const response = await fetch(`${API_BASE_URL}/payments`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  return handleResponse<unknown[]>(response);
};

export const getProductCategories = async (token: string): Promise<unknown[]> => {
  const response = await fetch(`${API_BASE_URL}/product-categories`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  return handleResponse<unknown[]>(response);
};

export const getReviews = async (token: string): Promise<unknown[]> => {
  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  return handleResponse<unknown[]>(response);
};

export const getProductImages = async (token: string): Promise<unknown[]> => {
  const response = await fetch(`${API_BASE_URL}/product-images`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  return handleResponse<unknown[]>(response);
};

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  created_at?: string;
}

export const getProductImagesByProductId = async (
  token: string,
  productId: number
): Promise<ProductImage[]> => {
  const response = await fetch(`${API_BASE_URL}/product-images?product_id=${productId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  return handleResponse<ProductImage[]>(response);
};

export const addProductImage = async (
  token: string,
  productId: number,
  imageUrl: string
): Promise<unknown> => {
  const response = await fetch(`${API_BASE_URL}/product-images`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ product_id: productId, image_url: imageUrl }),
  });
  return handleResponse<unknown>(response);
};

export const deleteProductImage = async (token: string, imageId: number): Promise<unknown> => {
  const response = await fetch(`${API_BASE_URL}/product-images/${imageId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<unknown>(response);
};

export const deleteAllProductImages = async (token: string, productId: number): Promise<unknown> => {
  const response = await fetch(`${API_BASE_URL}/product-images/product/${productId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<unknown>(response);
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

export const getProducts = async (token?: string): Promise<Product[]> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/products`, {
    method: "GET",
    headers,
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

export const getUsers = async (token: string): Promise<BackendUser[]> => {
  const response = await fetch(`${API_BASE_URL}/user`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<BackendUser[]>(response);
};

export const updateUserRole = async (
  token: string,
  userId: number,
  role: string
): Promise<unknown> => {
  const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });
  return handleResponse<unknown>(response);
};

export const deleteUser = async (token: string, id: number): Promise<unknown> => {
  const response = await fetch(`${API_BASE_URL}/user/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<unknown>(response);
};

export const searchProducts = async (token: string, query: string): Promise<Product[]> => {
  const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<Product[]>(response);
};

export const getProductsByBrand = async (token: string, brand: string): Promise<Product[]> => {
  const response = await fetch(`${API_BASE_URL}/products/brand?brand=${encodeURIComponent(brand)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<Product[]>(response);
};

export const getProductsByPriceRange = async (token: string, min: number, max: number): Promise<Product[]> => {
  const response = await fetch(`${API_BASE_URL}/products/price-range?min=${min}&max=${max}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<Product[]>(response);
};

export const createProduct = async (
  token: string,
  product: Omit<Product, "id" | "created_at" | "updated_at">
): Promise<unknown> => {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
  });
  return handleResponse<unknown>(response);
};

export const updateProduct = async (
  token: string,
  id: number,
  updates: Partial<Product>
): Promise<unknown> => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  return handleResponse<unknown>(response);
};

export const updateProductStock = async (
  token: string,
  id: number,
  stock: number
): Promise<unknown> => {
  const response = await fetch(`${API_BASE_URL}/products/${id}/stock`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ stock_no: stock }),
  });
  return handleResponse<unknown>(response);
};

export const deleteProduct = async (token: string, id: number): Promise<unknown> => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<unknown>(response);
};


interface ApiResponse {
  error?: string;
  message?: string;
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  let data: (T & ApiResponse) | null = null;
  // eslint-disable-next-line no-useless-assignment
  let responseText = '';

  try {
    responseText = await response.text();
    
    if (responseText) {
      try {
        data = JSON.parse(responseText) as T & ApiResponse;
      } catch {
        if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
          console.error("Received HTML error response instead of JSON:", responseText.substring(0, 200));
          data = {
            error: `Server returned HTML error page (HTTP ${response.status})`,
            message: responseText.substring(0, 200) + (responseText.length > 200 ? '...' : '')
          } as T & ApiResponse;
        } else {
          data = { message: responseText } as T & ApiResponse;
        }
      }
    }
  } catch (error) {
    console.error("Response parse error:", error);
    data = { error: "Failed to parse response" } as T & ApiResponse;
  }

  if (!response.ok) {
    const errorMsg =
      data?.error ||
      data?.message ||
      `HTTP ${response.status || "undefined"}: ${response.statusText || "undefined"}`;
    throw new Error(errorMsg);
  }
  return data || ({} as T);
};
