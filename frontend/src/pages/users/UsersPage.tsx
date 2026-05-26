import { useState, useEffect } from "react";
import "./UsersPage.css";
import { getUsers, updateUserRole, deleteUser } from "../../services/apiService";
import { hasRole } from "../../services/jwtUtils";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "product_manager";
  joinDate: string;
}



export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const token = localStorage.getItem("token");
  const isAdmin = token ? hasRole(token, "admin") : false;

  useEffect(() => {
    if (token) {
      getUsers(token)
        .then((data) => {
          const mapped = data.map((u) => ({
            id: `#${String(u.id).padStart(3, "0")}`,
            name: `${u.first_name} ${u.last_name ?? ""}`.trim(),
            email: u.email,
            role: (u.role as "user" | "admin" | "product_manager") ?? "user",
            joinDate: u.dob,
          }));
          setUsers(mapped);
        })
        .catch((err) => console.error("Failed to fetch users", err));
    }
  }, [token]);
  const [selectedRole, setSelectedRole] = useState<string>("all");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user" as "user" | "admin" | "product_manager",
  });

  const handleRoleChange = async (userId: string, newRole: "user" | "admin" | "product_manager") => {
    if (!token || !isAdmin) {
      alert("Admin access required");
      return;
    }

    const numericId = parseInt(userId.replace("#", ""), 10);

    const previousUsers = [...users];
    setUsers(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );

    try {
      await updateUserRole(token, numericId, newRole);
    } catch (err) {
      console.error("Failed to update user role", err);
      setUsers(previousUsers);
      alert("Failed to update role. Please try again.");
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!token || !isAdmin) {
      alert("Admin access required");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      return;
    }

    const numericId = parseInt(userId.replace("#", ""), 10);

    const previousUsers = [...users];
    setUsers(prev => prev.filter(user => user.id !== userId));

    try {
      await deleteUser(token, numericId);
    } catch (err) {
      console.error("Failed to delete user", err);
      setUsers(previousUsers);
      const message = err instanceof Error ? err.message : "Failed to delete user. Please try again.";
      alert(message);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      name: "",
      email: "",
      role: "user",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    const numericIds = users.map(u => parseInt(u.id.replace("#", ""), 10));
    const nextNumericId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
    const newId = `#${String(nextNumericId).padStart(3, "0")}`;

    const newUser: User = {
      id: newId,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      joinDate: new Date().toISOString().split("T")[0],
    };

    setUsers([newUser, ...users]);
    setIsModalOpen(false);
  };

  const filteredUsers = selectedRole === "all" 
    ? users 
    : users.filter(user => user.role === selectedRole);

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
                          onClick={() => handleDeleteUser(user.id, user.name)}
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

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select 
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as "user" | "admin" | "product_manager" })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="product_manager">Product Manager</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn-submit">Add User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}