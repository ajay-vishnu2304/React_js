import { useState, useEffect } from "react";
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
  onStatusUpdated?: () => void;
}

export default function OrdersPage({ onStatusUpdated }: OrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [, setUsers] = useState<unknown[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const isAdmin = token ? hasRole(token, "admin") : false;

  useEffect(() => {
    const fetchData = async () => {
      const currentToken = localStorage.getItem("token");
      if (!currentToken) {
        setLoading(false);
        return;
      }
      try {
        const [ordersData, usersData] = await Promise.all([
          getAllOrders(currentToken),
          getUsers(currentToken)
        ]);
        setUsers(usersData);

        const normalizeStatus = (status: string) => {
          if (!status) return 'pending';
          const s = status.toLowerCase();
          if (s === 'pending') return 'pending';
          if (s === 'completed') return 'delivered';
          if (s === 'shipped') return 'shipped';
          if (s === 'cancelled' || s === 'canceled') return 'cancelled';
          if (s === 'placed') return 'placed';
          return s;
        };

        const enrichedOrders: Order[] = ordersData.map((order) => {
          const user = usersData.find((u) => u.id === order.user_id);
          const customerName = user 
            ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || `User #${order.user_id}`
            : `User #${order.user_id}`;

          return {
            id: order.id,
            user_id: order.user_id,
            customer: customerName,
            total_amount: order.total_amount,
            order_status: normalizeStatus(order.order_status),
            created_at: order.created_at,
          };
        });

        setOrders(enrichedOrders);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredOrders = statusFilter === "All" 
    ? orders 
    : orders.filter(order => order.order_status.toLowerCase() === statusFilter.toLowerCase());

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    if (!token || !isAdmin) {
      alert("Admin access required");
      return;
    }

    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, order_status: newStatus } : order
      )
    );

    try {
      await updateOrderStatus(token, orderId, newStatus);
      if (onStatusUpdated) {
        onStatusUpdated();
      }
    } catch (err) {
      console.error("Failed to update order status", err);
      alert("Failed to update status. Please try again.");
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
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Orders Report", 14, 15);
    
    const tableColumn = ["Order ID", "Customer", "Amount", "Date", "Status"];
    const tableRows = filteredOrders.map(order => [
      `#${order.id}`,
      order.customer,
      `₹${order.total_amount}`,
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
    <div className="orders-page" onClick={() => setShowExportMenu(false)}>
      <div className="page-header">
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
            <option value="shipped">Shipped</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <div className="export-container" onClick={(e) => e.stopPropagation()}>
            <button 
              className="export-btn" 
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              Export Data ▾
            </button>
            {showExportMenu && (
              <div className="export-menu">
                <button onClick={exportCSV}>Download CSV</button>
                <button onClick={exportPDF}>Download PDF</button>
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
                        { value: 'shipped', label: 'Shipped' },
                        { value: 'cancelled', label: 'Cancelled' },
                      ].map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                      {!['pending', 'delivered', 'shipped', 'cancelled', 'placed'].includes(order.order_status) && (
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
    </div>
  );
}