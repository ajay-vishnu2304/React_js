import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Signup from "../../pages/auth/Signup";
import * as jwtUtils from "../../services/jwtUtils";
import "@testing-library/jest-dom";

jest.mock("../../services/jwtUtils");

const mockGetHome = jwtUtils.getHomePathForRole as jest.Mock;
const mockGetRole = jwtUtils.getUserRole as jest.Mock;
const mockIsValid = jwtUtils.isValidToken as jest.Mock;

describe("Signup Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("renders Signup page correctly", () => {
    const { getByText, getByLabelText } = render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
    expect(getByText("Signup")).toBeInTheDocument();
    expect(getByLabelText("Username")).toBeInTheDocument();
    expect(getByText("Create a Account")).toBeInTheDocument();
  });

  test("auto-redirects if already logged in with valid token", () => {
    localStorage.setItem("token", "tok");
    mockIsValid.mockReturnValue(true);
    mockGetRole.mockReturnValue("user");
    mockGetHome.mockReturnValue("/dashboard");

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    expect(mockIsValid).toHaveBeenCalled();
  });
});
