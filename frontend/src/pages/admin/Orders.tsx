import { useEffect } from "react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";
import {
  removeOrder,
  setOrders,
  updateOrderStatus,
  type Order,
} from "../../store/slices/orderSlice";

const Orders = () => {
  const dispatch = useAppDispatch();
  const orders = useAppSelector((state) => state.orders.orders);
  const { authFetch } = useAuthenticatedFetch();

  const fetchOrders = async () => {
    try {
      const res = await authFetch("/orders/all");
      const data = await res.json();
      dispatch(setOrders(data));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id: number, orderStatus: string) => {
    try {
      await authFetch(`/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: orderStatus }),
      });
      dispatch(updateOrderStatus({ id, status: orderStatus }));
      toast.success("Order status updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this order?")) return;
    try {
      const res = await authFetch(`/orders/${id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message || "Failed to delete order");
        return;
      }
      dispatch(removeOrder(id));
      toast.success("Order deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete order");
    }
  };

  const handleDownloadInvoice = async (id: number) => {
    try {
      const res = await authFetch(`/orders/${id}/invoice`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error("Failed to download invoice, try again");
    }
  };

  return (
    <div>
      <h1>Orders</h1>

      <div className="table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Address</th>
            <th>Total</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Invoice</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order: Order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>
                {order.user_name}
                <br />
                <small>{order.user_email}</small>
              </td>
              <td>{order.address || "—"}</td>
              <td>${Number(order.total_amount).toFixed(2)}</td>
              <td>
                <select
                  value={order.order_status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                >
                  <option value="pending">pending</option>
                  <option value="placed">placed</option>
                  <option value="delivered">delivered</option>
                  <option value="cancelled">cancelled</option>
                  <option value="placed_no_invoice">placed_no_invoice</option>
                </select>
              </td>
              <td>{order.created_at ? new Date(order.created_at).toLocaleString() : "—"}</td>
              <td>
                {order.invoice_path ? (
                  <button
                    className="btn-edit"
                    onClick={() => handleDownloadInvoice(order.id)}
                  >
                    Download
                  </button>
                ) : (
                  <span>—</span>
                )}
              </td>
              <td>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(order.id)}
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

export default Orders;
