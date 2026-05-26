import "./RecentOrders.css";

interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  order_status: string;
  created_at: string;
}

interface RecentOrdersProps {
  orders: Order[];
  users?: Array<Record<string, unknown>>;
}

export default function RecentOrders({ orders, users }: RecentOrdersProps) {
  const recentOrders = orders ? orders.slice(0, 5) : [];

  const getCustomerName = (userId: number): string => {
    if (!users || users.length === 0) return `User #${userId}`;
    const user = users.find((u) => (u as Record<string, unknown>).id === userId);
    if (!user) return `User #${userId}`;
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    return fullName || (user.username as string) || `User #${userId}`;
  };
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
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
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
