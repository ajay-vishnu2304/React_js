import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import "./UsersPage.css";
import { getUsers, updateUserRole, deleteUser, createUser } from "../../services/apiService";
import { hasRole } from "../../services/jwtUtils";

type UserRole = "user" | "admin" | "product_manager";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  joinDate: string;
}



export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const token = localStorage.getItem("token");
  const isAdmin = token ? hasRole(token, "admin") : false;

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    if (token) {
      getUsers(token, controller.signal)
        .then((data) => {
          if (!isMounted) return;
          const mapped = data.map((u) => ({
            id: `#${String(u.id).padStart(3, "0")}`,
            name: `${u.first_name} ${u.last_name ?? ""}`.trim(),
            email: u.email,
            role: (u.role as UserRole) ?? "user",
            joinDate: u.dob,
          }));
          setUsers(mapped);
        })
        .catch((err) => {
          if (!controller.signal.aborted) {
            console.error("Failed to fetch users", err);
          }
        });
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [token]);
  const [selectedRole, setSelectedRole] = useState<string>("all");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user" as UserRole,
    dob: "",
    phone: "",
  });

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!token || !isAdmin) {
      toast.error("Admin access required");
      return;
    }

    const numericId = Number.parseInt(userId.replace("#", ""), 10);

    const previousUsers = [...users];
    setUsers(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );

    try {
      await updateUserRole(token, numericId, newRole);
      toast.success(`Role updated to ${getRoleDisplayName(newRole)}`);
    } catch (err) {
      console.error("Failed to update user role", err);
      setUsers(previousUsers);
      toast.error("Failed to update role. Please try again.");
    }
  };

  const openDeleteModal = (userId: string, userName: string) => {
    if (!token || !isAdmin) {
      toast.error("Admin access required");
      return;
    }
    setUserToDelete({ id: userId, name: userName });
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteUser = async () => {
    if (!token || !isAdmin || !userToDelete) {
      return;
    }

    const numericId = Number.parseInt(userToDelete.id.replace("#", ""), 10);

    const previousUsers = [...users];
    setUsers(prev => prev.filter(user => user.id !== userToDelete.id));
    setIsDeleteModalOpen(false);

    try {
      await deleteUser(token, numericId);
      toast.success(`User "${userToDelete.name}" deleted successfully`);
      setUserToDelete(null);
    } catch (err) {
      console.error("Failed to delete user", err);
      setUsers(previousUsers);
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? (err as { message: string }).message
          : "Failed to delete user. Please try again.";
      toast.error(message);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      name: "",
      email: "",
      role: "user",
      dob: "",
      phone: "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "phone") {
      setFormData((prev) => ({ ...prev, [name]: value.replace(/\D/g, "") }));
      return;
    }
    if (name === "role") {
      setFormData((prev) => ({ ...prev, [name]: value as UserRole }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (!formData.dob || !formData.phone.trim()) {
      toast.error("Date of birth and phone number are required.");
      return;
    }

    if (!/\d{4}-\d{2}-\d{2}$/.test(formData.dob)) {
      toast.error("Date of birth must be in YYYY-MM-DD format.");
      return;
    }

    if (!/^\d{10,15}$/.test(formData.phone)) {
      toast.error("Phone number must be 10-15 digits.");
      return;
    }

    if (!token) {
      toast.error("Authentication required.");
      return;
    }

    const nameParts = formData.name.trim().split(/\s+/);
    const first_name = nameParts[0] || "";
    const last_name = nameParts.slice(1).join(" ") || undefined;

    try {
      const created = await createUser(token, {
        email: formData.email,
        first_name,
        last_name,
        role: formData.role,
        dob: formData.dob,
        phone: formData.phone,
        password: "User@123",
      });

      const newUser: User = {
        id: `#${String(created.id).padStart(3, "0")}`,
        name: `${created.first_name} ${created.last_name ?? ""}`.trim(),
        email: created.email,
        role: created.role as UserRole,
        joinDate: created.dob || new Date().toISOString().split("T")[0],
      };

      setUsers([newUser, ...users]);
      setIsModalOpen(false);
      toast.success("User added successfully!");
    } catch (err) {
      console.error("Failed to add user", err);
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? (err as { message: string }).message
          : "Failed to add user. Please try again.";
      toast.error(message);
    }
  };

  const filteredUsers = useMemo(
    () =>
      selectedRole === "all"
        ? users
        : users.filter((user) => user.role === selectedRole),
    [users, selectedRole],
  );

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "admin":
        return "role-admin";
      case "product_manager":
        return "role-product-manager";
      default:
        return "role-user";
    }
  };

  const getRoleDisplayName = (role: string): string => {
    if (role === "product_manager") return "Product Manager";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>Users Management</h1>
        <div className="header-actions">
          <select 
            className="role-filter"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admin</option>
            <option value="product_manager">Product Manager</option>
          </select>
          {isAdmin && <button className="add-user-btn" onClick={handleOpenModal}>Add User</button>}
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Join Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="user-id">{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                      <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                  </td>
                  <td>{user.joinDate}</td>
                  <td className="actions-cell">
                    {isAdmin ? (
                      <>
                        <select 
                          className="role-dropdown"
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as "user" | "admin" | "product_manager")}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="product_manager">Product Manager</option>
                        </select>
                        <button
                          className="delete-user-btn"
                          onClick={() => openDeleteModal(user.id, user.name)}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="no-users-fallback">
                  No users found for the selected role.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isDeleteModalOpen && userToDelete && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeDeleteModal();
            }
          }}
          onKeyDown={(e) => e.key === "Escape" && closeDeleteModal()}
          tabIndex={0}
          role="button"
          aria-label="Close modal"
        >
          <dialog className="modal-content delete-modal" open>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="modal-close-btn" onClick={closeDeleteModal}>&times;</button>
            </div>
            <div className="delete-modal-body">
              <p>Are you sure you want to delete user <strong>"{userToDelete.name}"</strong>?</p>
              <p className="delete-warning">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={closeDeleteModal}>Cancel</button>
              <button type="button" className="btn-delete" onClick={handleDeleteUser}>Delete</button>
            </div>
          </dialog>
        </div>
      )}

      {isModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
          onKeyDown={(e) => e.key === "Escape" && handleCloseModal()}
          tabIndex={0}
          role="button"
          aria-label="Close modal"
        >
          <dialog
            className="modal-content"
            open
          >
            <div className="modal-header">
              <h2>Add New User</h2>
              <button className="modal-close-btn" onClick={handleCloseModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Enter name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="Enter email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select 
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="product_manager">Product Manager</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="dob">Date of Birth</label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleFormChange}
                  placeholder="YYYY-MM-DD"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  placeholder="10-15 digits"
                  maxLength={15}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn-submit">Add User</button>
              </div>
            </form>
          </dialog>
        </div>
      )}
    </div>
  );
}