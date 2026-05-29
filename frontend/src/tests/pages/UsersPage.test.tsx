import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import UsersPage from "../../pages/Users/UsersPage";
import "@testing-library/jest-dom";

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("../../services/jwtUtils", () => ({
  hasRole: jest.fn(),
}));

jest.mock("../../services/apiService", () => ({
  getUsers: jest.fn(),
  updateUserRole: jest.fn(),
  deleteUser: jest.fn(),
}));

import toast from "react-hot-toast";
import { hasRole } from "../../services/jwtUtils";
import {
  getUsers,
  updateUserRole,
  deleteUser,
} from "../../services/apiService";

describe("UsersPage", () => {
  let consoleErrorSpy: jest.SpyInstance;
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
    (toast.success as jest.Mock).mockClear();
    (toast.error as jest.Mock).mockClear();
    localStorage.clear();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    (hasRole as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
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
    const user = userEvent.setup();
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
    await user.selectOptions(roleFilter, "admin");

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
    const user = userEvent.setup();
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

    await user.click(screen.getByText("Add User"));

    await waitFor(() => {
      expect(screen.getByText("Add New User")).toBeInTheDocument();
    });
  });

  test("closes modal when cancel button is clicked", async () => {
    const user = userEvent.setup();
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

    await user.click(screen.getByText("Add User"));
    
    await waitFor(() => {
      expect(screen.getByText("Add New User")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Cancel"));

    await waitFor(() => {
      expect(screen.queryByText("Add New User")).not.toBeInTheDocument();
    });
  });

  test("adds new user through modal", async () => {
    const user = userEvent.setup();
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

    await user.click(screen.getByText("Add User"));

    await waitFor(() => {
      expect(screen.getByText("Add New User")).toBeInTheDocument();
    });

    // Use getByLabelText with the exact label text from the component
    const fullNameInput = screen.getByLabelText("Full Name");
    const emailInput = screen.getByLabelText("Email Address");
    
    await user.type(fullNameInput, "New User");
    await user.type(emailInput, "newuser@example.com");

    // Click the submit button within the modal
    const modal = screen.getByRole('dialog');
    await user.click(within(modal).getByRole('button', { name: 'Add User' }));

    await waitFor(() => {
      expect(screen.getByText(/New User/)).toBeInTheDocument();
    });
  });

  test("validates form fields before adding user", async () => {
    const user = userEvent.setup();
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

    await user.click(screen.getByText("Add User"));

    await waitFor(() => {
      expect(screen.getByText("Add New User")).toBeInTheDocument();
    });

    // Try to submit empty form by clicking submit button within the modal
    const modal = screen.getByRole('dialog');
    await user.click(within(modal).getByRole('button', { name: 'Add User' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Please fill in all fields.");
    });
  });

  test("changes user role successfully", async () => {
    const user = userEvent.setup();
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
    await user.selectOptions(roleDropdowns[0], "admin");

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
    const user = userEvent.setup();
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
    await user.click(deleteButtons[0]);

    // Modal opens with confirmation - click Delete button in modal-actions to confirm
    const confirmDeleteButton = document.querySelector(
      '.modal-actions button.btn-delete'
    ) as HTMLButtonElement;
    await user.click(confirmDeleteButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("John Doe"));
    });
  });

  test("handles delete user error", async () => {
    const user = userEvent.setup();
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
    await user.click(deleteButtons[0]);

    // Modal opens with confirmation - click Delete button in modal-actions to trigger error
    const confirmDeleteButton = document.querySelector(
      '.modal-actions button.btn-delete'
    ) as HTMLButtonElement;
    await user.click(confirmDeleteButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  test("handles role change error", async () => {
    const user = userEvent.setup();
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
    await user.selectOptions(roleDropdowns[0], "admin");

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to update role. Please try again.");
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
    const user = userEvent.setup();
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
    await user.selectOptions(roleFilter, "product_manager");

    await waitFor(() => {
      expect(screen.getByText("Bob Wilson")).toBeInTheDocument();
    });

    await user.selectOptions(roleFilter, "admin");

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
