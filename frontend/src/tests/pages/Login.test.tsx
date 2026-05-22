import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../../pages/auth/Login";
import "@testing-library/jest-dom";

describe("Login Page", () => {
  test("renders Login page correctly", () => {
    const { getByRole } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(getByRole("button", { name: "Login" })).toBeInTheDocument();
    expect(getByRole("button", { name: "Login" })).toHaveAttribute("type", "submit");
  });
});
