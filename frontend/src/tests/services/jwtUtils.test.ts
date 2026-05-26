/* eslint-disable @typescript-eslint/no-explicit-any */
import { decodeToken, isTokenExpired, getUserRole, getUserId, hasRole, hasAnyRole, isValidToken, getHomePathForRole } from "../../services/jwtUtils";
import { jwtDecode } from "jwt-decode";

jest.mock("jwt-decode");

const mockJwtDecode = jwtDecode as jest.MockedFunction<typeof jwtDecode>;

function makeToken(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

describe("jwtUtils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("decodeToken returns decoded payload for valid token", () => {
    const payload = { id: "1", username: "test", email: "t@t.com", role: "admin" };
    const token = makeToken(payload);
    mockJwtDecode.mockReturnValueOnce(payload as any);

    const result = decodeToken(token);
    expect(result).toEqual(payload);
  });

  test("decodeToken returns null and logs on invalid token", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockJwtDecode.mockImplementationOnce(() => { throw new Error("bad token"); });

    const result = decodeToken("bad.token");
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test("isTokenExpired returns true if no exp or expired", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockJwtDecode.mockReturnValueOnce({ id: "1", username: "u", email: "e", role: "user" } as any); // no exp
    expect(isTokenExpired(makeToken({}))).toBe(true);

    const past = Math.floor(Date.now() / 1000) - 100;
    mockJwtDecode.mockReturnValueOnce({ id: "1", username: "u", email: "e", role: "user", exp: past } as any);
    expect(isTokenExpired(makeToken({ exp: past }))).toBe(true);
    consoleSpy.mockRestore();
  });

  test("isTokenExpired returns false for future exp", () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    mockJwtDecode.mockReturnValueOnce({ id: "1", username: "u", email: "e", role: "user", exp: future } as any);
    expect(isTokenExpired(makeToken({ exp: future }))).toBe(false);
  });

  test("getUserRole returns role or null", () => {
    mockJwtDecode.mockReturnValueOnce({ id: "1", username: "u", email: "e", role: "product_manager" } as any);
    expect(getUserRole(makeToken({ role: "product_manager" }))).toBe("product_manager");

    mockJwtDecode.mockReturnValueOnce({ id: "1", username: "u", email: "e" } as any);
    expect(getUserRole(makeToken({}))).toBeNull();
  });

  test("getUserId returns id or null", () => {
    mockJwtDecode.mockReturnValueOnce({ id: "42", username: "u", email: "e", role: "user" } as any);
    expect(getUserId(makeToken({ id: "42" }))).toBe("42");
  });

  test("hasRole and hasAnyRole work correctly", () => {
    const adminPayload = { id: "1", username: "u", email: "e", role: "admin" };
    mockJwtDecode.mockReturnValue(adminPayload as any);
    const token = makeToken({ role: "admin" });
    expect(hasRole(token, "admin")).toBe(true);
    expect(hasRole(token, "user")).toBe(false);
    expect(hasAnyRole(token, ["admin", "product_manager"])).toBe(true);
    expect(hasAnyRole(token, ["user"])).toBe(false);
  });

  test("isValidToken returns false for missing/expired/invalid", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(isValidToken("")).toBe(false);

    mockJwtDecode.mockReturnValueOnce({ id: "1", username: "u", email: "e", role: "user" } as any); // no exp -> expired
    expect(isValidToken(makeToken({}))).toBe(false);

    mockJwtDecode.mockImplementationOnce(() => { throw new Error("bad"); });
    expect(isValidToken("bad")).toBe(false);
    consoleSpy.mockRestore();
  });

  test("getHomePathForRole maps roles correctly", () => {
    expect(getHomePathForRole("admin")).toBe("/admin");
    expect(getHomePathForRole("product_manager")).toBe("/product-manager");
    expect(getHomePathForRole("user")).toBe("/dashboard");
    expect(getHomePathForRole(null)).toBe("/dashboard");
    expect(getHomePathForRole(undefined as any)).toBe("/dashboard");
  });
});
