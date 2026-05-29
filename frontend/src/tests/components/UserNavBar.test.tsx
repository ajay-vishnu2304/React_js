import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import UserNavBar from "../../components/UserNavBar/UserNavBar";
import "@testing-library/jest-dom";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("UserNavBar Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("renders logo, nav items, icons and cart badge", () => {
    render(
      <MemoryRouter>
        <UserNavBar />
      </MemoryRouter>
    );

    expect(screen.getByText("AJVX.")).toBeInTheDocument();
    expect(screen.getByText("HOME")).toBeInTheDocument();
    expect(screen.getByLabelText("Profile")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // cart badge
  });

  test("toggles profile dropdown and calls logout on click", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <UserNavBar />
      </MemoryRouter>
    );

    const profile = screen.getByLabelText("Profile");
    await user.click(profile);

    const logoutBtn = screen.getByText("Logout");
    expect(logoutBtn).toBeInTheDocument();

    await user.click(logoutBtn);
    expect(localStorage.getItem("token")).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
  });
});
