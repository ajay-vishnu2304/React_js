import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import "@testing-library/jest-dom";

// Mock the AppRoutes component
jest.mock("../routes/AppRoutes", () => {
  return function MockAppRoutes() {
    return <div data-testid="mock-app-routes">App Routes</div>;
  };
});

describe("App Component", () => {
  test("renders App component without crashing", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId("mock-app-routes")).toBeInTheDocument();
  });

  test("renders AppRoutes component", () => {
    const { container } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(container.querySelector('[data-testid="mock-app-routes"]')).toBeInTheDocument();
  });

  test("App component structure is correct", () => {
    const { container } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    // Should only contain the mocked AppRoutes
    expect(container.firstChild).toBeTruthy();
  });
});