import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./OrdersPage.css";
import { getAllOrders, getUsers, updateOrderStatus } from "../../services/apiService";
import { hasRole } from "../../services/jwtUtils";

interface Order {
  id: number;
  user_id: number;
  customer: string;
  total_amount: number;
  order_status: string;
  created_at: string;
}

interface OrdersPageProps {
  readonly onStatusUpdated?: () => void;
}

const normalizeStatus = (status: string): string => {
  if (!status) return "pending";
  const s = status.toLowerCase();
  if (s === "pending") return "pending";
  if (s === "delivered" || s === "completed") return "delivered";
  if (s === "placed") return "placed";
  if (s === "cancelled" || s === "canceled") return "cancelled";
  if (s === "placed_no_invoice") return "placed_no_invoice";
  return s;
};

const getCustomerName = (userId: number, usersData: Array<{ id: number; first_name?: string; last_name?: string; username: string }>): string => {
  const user = usersData.find((u) => u.id === userId);
  if (!user) return `User #${userId}`;
  const firstName = user.first_name ?? "";
  const lastName = user.last_name ?? "";
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || user.username || `User #${userId}`;
};

export default function OrdersPage({ onStatusUpdated }: Readonly<OrdersPageProps>) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const isAdmin = token ? hasRole(token, "admin") : false;

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const fetchData = async () => {
      const currentToken = localStorage.getItem("token");
      if (!currentToken) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const [ordersData, usersData] = await Promise.all([
          getAllOrders(currentToken, controller.signal),
          getUsers(currentToken, controller.signal),
        ]);

        const enrichedOrders: Order[] = ordersData.map((order) => ({
          id: order.id,
          user_id: order.user_id,
          customer: getCustomerName(order.user_id, usersData),
          total_amount: order.total_amount,
          order_status: normalizeStatus(order.order_status),
          created_at: order.created_at,
        }));

        if (isMounted) setOrders(enrichedOrders);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Failed to fetch orders", err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const filteredOrders = useMemo(
    () =>
      statusFilter === "All"
        ? orders
        : orders.filter(
            (order) =>
              order.order_status.toLowerCase() === statusFilter.toLowerCase(),
          ),
    [orders, statusFilter],
  );

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    if (!token || !isAdmin) {
      toast.error("Admin access required");
      return;
    }

    const originalOrder = orders.find(o => o.id === orderId);
    const originalStatus = originalOrder?.order_status;

    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, order_status: newStatus } : order
      )
    );

    try {
      await updateOrderStatus(token, orderId, newStatus);
      toast.success(`Order #${orderId} status updated to ${newStatus}`);
      if (onStatusUpdated) {
        onStatusUpdated();
      }
    } catch (err) {
      console.error("Failed to update order status", err);
      toast.error("Failed to update status. Please try again.");
      // Revert optimistic update on error
      if (originalStatus) {
        setOrders(prev =>
          prev.map(order =>
            order.id === orderId ? { ...order, order_status: originalStatus } : order
          )
        );
      }
    }
  };

  const exportCSV = () => {
    const headers = ["Order ID", "Customer", "Amount", "Date", "Status"];
    const rows = filteredOrders.map(order => [
      `#${order.id}`,
      order.customer,
      order.total_amount,
      new Date(order.created_at).toLocaleDateString(),
      order.order_status
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setShowExportMenu(false);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Orders Report", 14, 15);
    
    const tableColumn = ["Order ID", "Customer", "Amount", "Date", "Status"];
    const tableRows = filteredOrders.map(order => [
      `#${order.id}`,
      order.customer,
      `₹${String(order.total_amount)}`,
      new Date(order.created_at).toLocaleDateString(),
      order.order_status
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save(`orders_report_${new Date().toISOString().split('T')[0]}.pdf`);
    setShowExportMenu(false);
  };

  return (
    <main className="orders-page">
      <div
        role="banner"
        className="page-header"
        onClick={() => setShowExportMenu(false)}
        onKeyDown={(e) => e.key === "Escape" && setShowExportMenu(false)}
        tabIndex={0}
        aria-label="Close export menu"
      >
        <h1>Orders Management</h1>
        <div className="header-actions">
          <select 
            className="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="placed">Placed</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="placed_no_invoice">Placed (No Invoice)</option>
          </select>
          
          <div className="export-container">
            <button
              className="export-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowExportMenu(!showExportMenu);
              }}
              type="button"
            >
              Export Data ▾
            </button>
            {showExportMenu && (
              <div className="export-menu">
                 <button type="button" onClick={exportCSV} data-testid="download-csv">Download CSV</button>
                <button type="button" onClick={exportPDF}>Download PDF</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="orders-table-container">
        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="order-id">#{order.id}</td>
                  <td>{order.customer}</td>
                  <td>₹{order.total_amount}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    {isAdmin ? (
                    <select
                      className="status-dropdown"
                      value={order.order_status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      {[
                        { value: 'pending', label: 'Pending' },
                        { value: 'placed', label: 'Placed' },
                        { value: 'delivered', label: 'Delivered' },
                        { value: 'cancelled', label: 'Cancelled' },
                        { value: 'placed_no_invoice', label: 'Placed (No Invoice)' },
                      ].map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                      {!['pending', 'placed', 'delivered', 'cancelled', 'placed_no_invoice'].includes(order.order_status) && (
                        <option value={order.order_status}>{order.order_status}</option>
                      )}
                    </select>
                    ) : (
                      <span className="status-badge">{order.order_status}</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="no-orders-fallback">
                  No orders found for the selected status.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        )}
      </div>
    </main>
  );
}
