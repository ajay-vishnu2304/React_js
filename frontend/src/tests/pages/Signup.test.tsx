import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Signup from "../../pages/Signup";
import "@testing-library/jest-dom";

describe("Signup Page", () => {
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
});
