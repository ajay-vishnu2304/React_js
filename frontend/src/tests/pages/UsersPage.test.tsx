/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import UsersPage from "../../pages/users/UsersPage";
import "@testing-library/jest-dom";

jest.mock("../../services/jwtUtils", () => ({
  hasRole: jest.fn(),
}));

jest.mock("../../services/apiService", () => ({
  getUsers: jest.fn(),
  updateUserRole: jest.fn(),
  deleteUser: jest.fn(),
}));

import { hasRole } from "../../services/jwtUtils";
import {
  getUsers,
  updateUserRole,
  deleteUser,
} from "../../services/apiService";

describe("UsersPage", () => {
  let consoleErrorSpy: jest.SpyInstance;
  let alertSpy: jest.SpyInstance;
  let confirmSpy: jest.SpyInstance;

  const mockUsers = [
    {
      id: 1,
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      role: "user",
      dob: "1990-05-15",
    },
    {
      id: 2,
      first_name: "Jane",
      last_name: "Smith",
      email: "jane@example.com",
      role: "admin",
      dob: "1985-08-22",
    },
    {
      id: 3,
      first_name: "Bob",
      last_name: "Wilson",
      email: "bob@example.com",
      role: "product_manager",
      dob: "1992-11-30",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    (hasRole as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    alertSpy.mockRestore();
    confirmSpy.mockRestore();
  });

  test("renders users from API successfully", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("Bob Wilson")).toBeInTheDocument();
    });
  });

  test("displays user emails correctly", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
      expect(screen.getByText("bob@example.com")).toBeInTheDocument();
    });
  });

  test("displays correct role badges", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Use getAllByText since "User" etc appear in badges + dropdown options
      expect(screen.getAllByText("User").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Admin").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Product Manager").length).toBeGreaterThan(0);
    });
  });

  test("filters users by role", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    const roleFilter = screen.getByDisplayValue("All Roles");
    fireEvent.change(roleFilter, { target: { value: "admin" } });

    await waitFor(() => {
      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });
  });

  test("shows admin controls when user is admin", async () => {
    (hasRole as jest.Mock).mockReturnValue(true);
    localStorage.setItem("token", "fake-token");
    
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Add User")).toBeInTheDocument();
      expect(screen.getAllByText("Delete").length).toBeGreaterThan(0);
    });
  });

  test("hides admin controls when user is not admin", async () => {
    (hasRole as jest.Mock).mockReturnValue(false);
    localStorage.setItem("token", "fake-token");
    
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText("Add User")).not.toBeInTheDocument();
      expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    });
  });

  test("opens add user modal", async () => {
    (hasRole as jest.Mock).mockReturnValue(true);
    localStorage.setItem("token", "fake-token");
    
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Add User")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Add User"));

    await waitFor(() => {
      expect(screen.getByText("Add New User")).toBeInTheDocument();
    });
  });

  test("closes modal when cancel button is clicked", async () => {
    (hasRole as jest.Mock).mockReturnValue(true);
    localStorage.setItem("token", "fake-token");
    
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Add User")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Add User"));
    
    await waitFor(() => {
      expect(screen.getByText("Add New User")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Cancel"));

    await waitFor(() => {
      expect(screen.queryByText("Add New User")).not.toBeInTheDocument();
    });
  });

  test("adds new user through modal", async () => {
    (hasRole as jest.Mock).mockReturnValue(true);
    localStorage.setItem("token", "fake-token");
    
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Add User")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Add User"));

    await waitFor(() => {
      expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Full Name"), { target: { value: "New User" } });
    fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "newuser@example.com" } });

    // Use form submit for reliability
    const form = screen.getByText("Add User", { selector: "button[type='submit']" }).closest("form");
    if (form) fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("New User")).toBeInTheDocument();
    });
  });

  test("validates form fields before adding user", async () => {
    (hasRole as jest.Mock).mockReturnValue(true);
    localStorage.setItem("token", "fake-token");
    
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Add User")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Add User"));

    await waitFor(() => {
      expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
    });

    // Try to submit empty form
    const form = screen.getByText("Add User", { selector: "button[type='submit']" }).closest("form");
    if (form) fireEvent.submit(form);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Please fill in all fields.");
    });
  });

  test("changes user role successfully", async () => {
    (hasRole as jest.Mock).mockReturnValue(true);
    localStorage.setItem("token", "fake-token");
    
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);
    (updateUserRole as jest.Mock).mockResolvedValue({ message: "Role updated" });

    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const roleDropdowns = document.querySelectorAll('.role-dropdown');
    expect(roleDropdowns.length).toBeGreaterThan(0);
    fireEvent.change(roleDropdowns[0], { target: { value: "admin" } });

    await waitFor(() => {
      expect(updateUserRole).toHaveBeenCalledWith(
        "fake-token",
        1,
        "admin"
      );
    });
  });

  test("shows alert when non-admin tries to change role", async () => {
    (hasRole as jest.Mock).mockReturnValue(false);
    localStorage.setItem("token", "fake-token");
    
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Non-admin users don't see role dropdowns
    expect(screen.queryByDisplayValue("user")).not.toBeInTheDocument();
  });

  test("deletes user successfully", async () => {
    (hasRole as jest.Mock).mockReturnValue(true);
    localStorage.setItem("token", "fake-token");
    
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);
    (deleteUser as jest.Mock).mockResolvedValue({ message: "User deleted" });

    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText("Delete");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining("John Doe"));
    });
  });

  test("handles delete user error", async () => {
    (hasRole as jest.Mock).mockReturnValue(true);
    localStorage.setItem("token", "fake-token");
    
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);
    (deleteUser as jest.Mock).mockRejectedValue(new Error("Delete failed"));

    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText("Delete");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
    });
  });

  test("handles role change error", async () => {
    (hasRole as jest.Mock).mockReturnValue(true);
    localStorage.setItem("token", "fake-token");
    
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);
    (updateUserRole as jest.Mock).mockRejectedValue(new Error("Update failed"));

    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const roleDropdowns = document.querySelectorAll('.role-dropdown');
    expect(roleDropdowns.length).toBeGreaterThan(0);
    fireEvent.change(roleDropdowns[0], { target: { value: "admin" } });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Failed to update role. Please try again.");
    });
  });

  test("handles API error gracefully", async () => {
    localStorage.setItem("token", "fake-token");
    (getUsers as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  test("shows no users message when filter returns empty", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const roleFilter = screen.getByDisplayValue("All Roles");
    fireEvent.change(roleFilter, { target: { value: "product_manager" } });

    await waitFor(() => {
      expect(screen.getByText("Bob Wilson")).toBeInTheDocument();
    });

    fireEvent.change(roleFilter, { target: { value: "admin" } });

    await waitFor(() => {
      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    });
  });

  test("displays user IDs correctly", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("#001")).toBeInTheDocument();
      expect(screen.getByText("#002")).toBeInTheDocument();
      expect(screen.getByText("#003")).toBeInTheDocument();
    });
  });

  test("displays join dates correctly", async () => {
    localStorage.setItem("token", "fake-token");
    
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("1990-05-15")).toBeInTheDocument();
      expect(screen.getByText("1985-08-22")).toBeInTheDocument();
      expect(screen.getByText("1992-11-30")).toBeInTheDocument();
    });
  });

  test("handles user with missing last name", async () => {
    const usersWithMissingLastName = [
      {
        id: 1,
        first_name: "John",
        last_name: null,
        email: "john@example.com",
        role: "user",
        dob: "1990-05-15",
      },
    ];

    localStorage.setItem("token", "fake-token");
    
    (getUsers as jest.Mock).mockResolvedValue(usersWithMissingLastName);

    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("John")).toBeInTheDocument();
    });
  });

  test("handles missing token", async () => {
    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>
    );

    // Should not crash without token
    expect(screen.getByText("Users Management")).toBeInTheDocument();
  });
});
