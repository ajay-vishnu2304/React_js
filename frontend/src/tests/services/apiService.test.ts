import {
  loginUser,
  registerUser,
  getProducts,
  getDashboardData,
} from "../../services/apiService";

jest.mock("../../config/api", () => ({
  API_BASE_URL: "",
}));

describe("apiService", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = jest.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.clearAllMocks();
  });

  const jsonResponse = (data: unknown, ok = true, status = 200) => ({
    ok,
    status,
    statusText: ok ? "OK" : "Error",
    text: async () => JSON.stringify(data),
  });

  test("loginUser posts credentials and returns data on success", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce(jsonResponse({ token: "abc", message: "ok" }));

    const res = await loginUser({ email: "a@b.com", password: "p" });
    expect(res.token).toBe("abc");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/login"),
      expect.objectContaining({ method: "POST" })
    );
  });

  test("registerUser posts user data", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce(jsonResponse({ token: "new", message: "registered" }));

    await registerUser({ username: "u", email: "e", password: "p", first_name: "f", dob: "2000-01-01", phone: "1" });
    expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining("/auth/register"), expect.any(Object));
  });

  test("getProducts fetches with optional token", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce(jsonResponse([{ id: 1, name: "p", price: 10, stock_no: 5 }]));
    const products = await getProducts("tok");
    expect(products).toHaveLength(1);
  });

  test("handleResponse throws on !ok using error from body", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce(jsonResponse({ error: "Bad creds" }, false, 401));

    await expect(loginUser({ email: "x", password: "y" })).rejects.toThrow("Bad creds");
  });

  test("handleResponse handles non-JSON text response", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => "plain text success",
    });

    const res = await getDashboardData("tok");
    expect(res).toEqual({ message: "plain text success" });
  });

  test("handleResponse catches parse error and returns Failed to parse", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => { throw new Error("no text"); },
    });

    await expect(loginUser({})).rejects.toThrow("Failed to parse response");

    consoleErrorSpy.mockRestore();
  });

  test("getDashboardData includes Authorization header", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce(jsonResponse({ data: "ok" }));
    await getDashboardData("my-token-123");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/dashboard"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer my-token-123" }),
      })
    );
  });
});
