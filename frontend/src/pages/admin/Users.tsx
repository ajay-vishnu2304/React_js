import { useEffect, useState } from "react";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const { authFetch } = useAuthenticatedFetch();

  const fetchUsers = () => {
    authFetch("/users")
      .then((r) => {
        if (!r.ok) {
          throw new Error(`HTTP ${r.status}`);
        }
        return r.json();
      })
      .then(setUsers)
      .catch((err) => {
        console.error("Failed to fetch users:", err);
        alert("Failed to load users. Please check if you're logged in as admin.");
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("user");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await authFetch("/users", {
      method: "POST",
      body: JSON.stringify({ email, first_name: name, password, role }),
    });
    setShowModal(false);
    resetForm();
    fetchUsers();
  };

  const handleRoleChange = async (id: number, newRole: string) => {
    try {
      const res = await authFetch(`/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Failed to update role");
        fetchUsers();
        return;
      }
      fetchUsers();
    } catch {
      alert("Network error. Please try again.");
      fetchUsers();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this user?")) return;
    try {
      const res = await authFetch(`/users/${id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Failed to delete user");
        return;
      }
      fetchUsers();
    } catch {
      alert("Network error. Please try again.");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Users</h1>
        <button
          className="btn-add"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          + Add User
        </button>
      </div>

      {showModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="modal">
            <h2>Add User</h2>
            <form onSubmit={handleSubmit}>
              <input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  padding: "0.6rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "0.95rem",
                }}
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
              <div className="modal-actions">
                <button type="submit">Add</button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(u.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default Users;
