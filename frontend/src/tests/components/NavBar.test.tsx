import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NavBar from "../../components/NavBar/NavBar";
import "@testing-library/jest-dom";

describe("NavBar Component", () => {
  let mockOnMenuToggle: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnMenuToggle = jest.fn();
  });

  test("renders navbar with logo elements", () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

    expect(screen.getByText("ADMIN")).toBeInTheDocument();
    expect(document.querySelector(".navbar")).toBeInTheDocument();
  });

  test("renders mobile menu button", () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

    const menuButton = screen.getByLabelText("Toggle menu");
    expect(menuButton).toBeInTheDocument();
  });

  test("toggles mobile menu when button is clicked", () => {
    render(
      <MemoryRouter>
        <NavBar onMenuToggle={mockOnMenuToggle} />
      </MemoryRouter>
    );

    const menuButton = screen.getByLabelText("Toggle menu");
    fireEvent.click(menuButton);

    expect(mockOnMenuToggle).toHaveBeenCalledTimes(1);
  });

  test("toggles mobile menu state on multiple clicks", () => {
    render(
      <MemoryRouter>
        <NavBar onMenuToggle={mockOnMenuToggle} />
      </MemoryRouter>
    );

    const menuButton = screen.getByLabelText("Toggle menu");
    
    // Click multiple times
    fireEvent.click(menuButton);
    fireEvent.click(menuButton);
    fireEvent.click(menuButton);

    expect(mockOnMenuToggle).toHaveBeenCalledTimes(3);
  });

  test("renders notification icons", () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

    // Check for icon buttons
    const iconButtons = document.querySelectorAll(".icon-btn");
    expect(iconButtons.length).toBeGreaterThanOrEqual(2);
  });

  test("renders profile section", () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

    const profile = document.querySelector(".profile");
    expect(profile).toBeInTheDocument();
    
    const profileImage = screen.getByAltText("profile");
    expect(profileImage).toBeInTheDocument();
    expect(profileImage).toHaveAttribute("src", "https://i.pravatar.cc/40");
  });

  test("works without onMenuToggle prop", () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

    const menuButton = screen.getByLabelText("Toggle menu");
    
    // Should not throw error when clicked without onMenuToggle
    expect(() => fireEvent.click(menuButton)).not.toThrow();
  });

  test("renders all navbar elements", () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

    // Check navbar structure
    expect(document.querySelector(".navbar")).toBeInTheDocument();
    expect(document.querySelector(".mobile-menu-btn")).toBeInTheDocument();
    expect(document.querySelector(".navbar-right")).toBeInTheDocument();
  });

  test("navbar-right contains icons and profile", () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

    const navbarRight = document.querySelector(".navbar-right");
    expect(navbarRight).toBeInTheDocument();
    
    // Should contain icon buttons
    const iconButtons = navbarRight?.querySelectorAll(".icon-btn");
    expect(iconButtons?.length).toBeGreaterThanOrEqual(2);
    
    // Should contain profile
    expect(navbarRight?.querySelector(".profile")).toBeInTheDocument();
  });

  test("mobile menu button has correct aria label", () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

    const menuButton = screen.getByLabelText("Toggle menu");
    expect(menuButton).toHaveAttribute("aria-label", "Toggle menu");
  });

  test("icons are rendered within icon buttons", () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

    const iconButtons = document.querySelectorAll(".icon-btn");
    iconButtons.forEach((button) => {
      expect(button.querySelector(".icon")).toBeInTheDocument();
    });
  });

  test("profile contains image and text", () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

    const profile = document.querySelector(".profile");
    expect(profile?.querySelector("img")).toBeInTheDocument();
    expect(profile?.textContent).toContain("ADMIN");
  });
});