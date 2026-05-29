import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NotFound from "../../pages/NotFound/NotFound";
import "@testing-library/jest-dom";

describe("NotFound Page", () => {
  test("renders 404 page with link to home", () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Page Not Found")).toBeInTheDocument();
    expect(screen.getByText("The page you are looking for does not exist.")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Go back to Home" });
    expect(link).toHaveAttribute("href", "/");
  });
});
