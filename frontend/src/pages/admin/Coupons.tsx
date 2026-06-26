import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";

interface Coupon {
  id: number;
  name: string;
  discount_percentage: number;
  valid_until: string;
  is_active: boolean;
  created_at?: string;
}

const Coupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [discount, setDiscount] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [isActive, setIsActive] = useState(true);
  const { authFetch } = useAuthenticatedFetch();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return dateStr.split(" ")[0].split("T")[0];
  };

  const fetchCoupons = () => {
    authFetch("/coupons")
      .then((r) => r.json())
      .then(setCoupons)
      .catch((err) => {
        console.error("Failed to fetch coupons:", err);
        alert("Failed to load coupons");
      });
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const resetForm = () => {
    setName("");
    setDiscount("");
    setValidUntil("");
    setIsActive(true);
    setEditId(null);
  };

  const openAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (c: Coupon) => {
    setName(c.name);
    setDiscount(String(c.discount_percentage));
    setValidUntil(formatDate(c.valid_until));
    setIsActive(Boolean(c.is_active));
    setEditId(c.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const body = {
      name,
      discount_percentage: parseFloat(discount),
      valid_until: validUntil,
      is_active: isActive,
    };

    try {
      const url = editId ? `/coupons/${editId}` : `/coupons`;
      const method = editId ? "PATCH" : "POST";

      const res = await authFetch(url, {
        method,
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.details
          ? data.details.map((d: { field: string; message: string }) => `${d.field}: ${d.message}`).join(", ")
          : data.error || "Failed to save coupon";
        toast.error(msg);
        return;
      }

      toast.success(editId ? "Coupon updated" : "Coupon created");
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      toast.error("Network error. Please try again.");
      console.log(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      const res = await authFetch(`/coupons/${id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Failed to delete coupon");
        return;
      }
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch (err) {
      toast.error("Network error. Please try again.");
      console.log(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Coupons</h1>
        <button className="btn-add" onClick={openAdd}>
          + Add Coupon
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
            <h2>{editId ? "Edit Coupon" : "Add Coupon"}</h2>
            <form onSubmit={handleSubmit}>
              <input
                placeholder="Coupon name (e.g. SUMMER10)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                placeholder="Discount % (e.g. 10)"
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                required
              />
              <label style={{ fontSize: "0.9rem", color: "#374151" }}>
                Valid until
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                required
              />
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.9rem",
                  color: "#374151",
                }}
              >
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Active
              </label>
              <div className="modal-actions">
                <button type="submit">
                  {editId ? "Update" : "Add"}
                </button>
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
            <th>Discount %</th>
            <th>Valid Until</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.discount_percentage}%</td>
              <td>
                {formatDate(c.valid_until) || "-"}
              </td>
              <td>
                <select
                  value={c.is_active ? "true" : "false"}
                  onChange={(e) => {
                    const newVal = e.target.value === "true";
                    authFetch(`/coupons/${c.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({
                        name: c.name,
                        discount_percentage: c.discount_percentage,
                        valid_until: formatDate(c.valid_until),
                        is_active: newVal,
                      }),
                    })
                      .then((res) => {
                        if (!res.ok) throw new Error("Failed");
                        toast.success("Status updated");
                        fetchCoupons();
                      })
                      .catch(() => toast.error("Failed to update status"));
                  }}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </td>
              <td>
                <button className="btn-edit" onClick={() => openEdit(c)}>
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(c.id)}
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

export default Coupons;
