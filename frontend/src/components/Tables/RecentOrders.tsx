import "./RecentOrders.css";

interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  order_status: string;
  created_at: string;
}

interface UserData {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
}

interface RecentOrdersProps {
  readonly orders: Order[];
  readonly users?: UserData[];
}

export default function RecentOrders({ orders, users }: Readonly<RecentOrdersProps>) {
  const recentOrders = orders ? orders.slice(0, 5) : [];

  function getCustomerName(userId: number): string {
    if (!users || users.length === 0) return `User #${userId}`;
    const user = users.find((u) => u.id === userId);
    if (!user) return `User #${userId}`;
    const firstName = String(user.first_name ?? "");
    const lastName = String(user.last_name ?? "");
    const fullName = `${firstName} ${lastName}`.trim();
    const username = user.username ?? "";
    return fullName || username || `User #${userId}`;
  }
  return (
    <div className="recent-orders-container">
      <div className="table-header">
        <h3>Recent Orders</h3>
        <button className="view-all-btn">View All</button>
      </div>
      <div className="table-wrapper">
        <table className="recent-orders-table">
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
            {recentOrders.map((order) => (
              <tr key={order.id}>
                <td className="order-id">#{order.id}</td>
                <td>{getCustomerName(order.user_id)}</td>
                <td>₹{order.total_amount}</td>
                <td>{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <span className={`status-badge ${order.order_status.toLowerCase()}`}>
                    {order.order_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
