import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Sidebar from "../../components/SideBar/SideBar";
import "@testing-library/jest-dom";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Sidebar Component", () => {
  let mockOnClose: jest.Mock;
  let mockOnTabChange: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockOnClose = jest.fn();
    mockOnTabChange = jest.fn();
    
    // Mock window.innerWidth
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  test("renders sidebar with logo", () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText("AJVX")).toBeInTheDocument();
  });

  test("renders navigation links", () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
  });

  test("navigates to Dashboard when clicked", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    const dashboardLink = screen.getByText("Dashboard");
    await user.click(dashboardLink);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("navigates to Orders when clicked", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    const ordersLink = screen.getByText("Orders");
    await user.click(ordersLink);

    expect(mockNavigate).toHaveBeenCalledWith("/orders");
  });

  test("navigates to Users when clicked", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    const usersLink = screen.getByText("Users");
    await user.click(usersLink);

    expect(mockNavigate).toHaveBeenCalledWith("/users");
  });

  test("navigates to Products when clicked", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    const productsLink = screen.getByText("Products");
    await user.click(productsLink);

    expect(mockNavigate).toHaveBeenCalledWith("/products");
  });

  test("calls onTabChange when provided instead of navigate", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Sidebar onTabChange={mockOnTabChange} />
      </MemoryRouter>
    );

    const dashboardLink = screen.getByText("Dashboard");
    await user.click(dashboardLink);

    expect(mockOnTabChange).toHaveBeenCalledWith("Dashboard");
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("highlights active tab", () => {
    render(
      <MemoryRouter>
        <Sidebar activeTab="Orders" />
      </MemoryRouter>
    );

    const ordersLink = screen.getByText("Orders").closest("li");
    expect(ordersLink).toHaveClass("active");
  });

  test("handles logout", async () => {
    const user = userEvent.setup();
    localStorage.setItem("token", "fake-token");
    
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    const logoutButton = screen.getByText("Logout");
    await user.click(logoutButton);

    expect(localStorage.getItem("token")).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
  });

  test("renders in mobile mode when window is narrow", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 800,
    });

    render(
      <MemoryRouter>
        <Sidebar isOpen={true} />
      </MemoryRouter>
    );

    // Trigger resize event
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    const sidebar = screen.getByText("AJVX").closest("aside");
    expect(sidebar).toHaveClass("mobile");
  });

  test("does not render when mobile and closed", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 800,
    });

    const { container } = render(
      <MemoryRouter>
        <Sidebar isOpen={false} />
      </MemoryRouter>
    );

    // Trigger resize event
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    // Should not render the sidebar content
    expect(container.querySelector("aside")).toBeNull();
  });

  test("renders overlay in mobile mode when open", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 800,
    });

    render(
      <MemoryRouter>
        <Sidebar isOpen={true} onClose={mockOnClose} />
      </MemoryRouter>
    );

    // Trigger resize event
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    const overlay = document.querySelector(".sidebar-overlay");
    expect(overlay).toBeInTheDocument();
  });

  test("calls onClose when overlay is clicked", async () => {
    const user = userEvent.setup();
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 800,
    });

    render(
      <MemoryRouter>
        <Sidebar isOpen={true} onClose={mockOnClose} />
      </MemoryRouter>
    );

    // Trigger resize event
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    const overlay = document.querySelector(".sidebar-overlay");
    if (overlay) {
      await user.click(overlay);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  test("renders close button in mobile mode", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 800,
    });

    render(
      <MemoryRouter>
        <Sidebar isOpen={true} onClose={mockOnClose} />
      </MemoryRouter>
    );

    // Trigger resize event
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    // There are two elements with the original label; the close button is the second one
    const closeButton = screen.getByLabelText("Close sidebar");
    expect(closeButton).toBeInTheDocument();
  });

  test("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 800,
    });

    render(
      <MemoryRouter>
        <Sidebar isOpen={true} onClose={mockOnClose} />
      </MemoryRouter>
    );

    // Trigger resize event
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    const closeButton = screen.getByLabelText("Close sidebar");
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test("cleans up resize listener on unmount", () => {
    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");
    
    const { unmount } = render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));
    
    removeEventListenerSpy.mockRestore();
  });

  test("updates isMobile state on window resize", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    // Change window width to mobile
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 800,
    });

    // Trigger resize event
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    // Component should now be in mobile mode
    const sidebar = screen.getByText("AJVX").closest("aside");
    expect(sidebar).toHaveClass("mobile");
  });

  test("default props work correctly", () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    // Should render with default isOpen=true
    expect(screen.getByText("AJVX")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  test("all navigation items are clickable", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    const navItems = ["Dashboard", "Orders", "Users", "Products"];
    
    for (const item of navItems) {
      const link = screen.getByText(item);
      expect(link).toBeInTheDocument();
      await user.click(link);
    }

    expect(mockNavigate).toHaveBeenCalledTimes(4);
  });
});
