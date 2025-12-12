import { useEffect, useState } from "react";
import API from "../../lib/api";

export default function OrdersListPage() {
  const [orders, setOrders] = useState([]);
  const [userId, setUserId] = useState(null);

  // Load user ID only once
  useEffect(() => {
    const uid = localStorage.getItem("user_id");
    setUserId(uid);
  }, []);

  // Fetch orders only when userId is available
  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      try {
        const res = await API.get(`api/orders/${userId}/`);
        setOrders(res.data);
      } catch (err) {
        console.log("Error fetching orders", err);
      }
    };

    fetchOrders();
  }, [userId]); // run again only when userId is set

  const deleteOrder = async (orderId) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    try {
      await API.delete(`api/orders/delete/${orderId}/`);
      alert("Order deleted");

      // refresh orders
      const res = await API.get(`api/orders/${userId}/`);
      setOrders(res.data);

    } catch (err) {
      alert("Delete failed");
    }
  };

  const handlePayment = async (orderId) => {
    try {
      const res = await API.get(`api/orders/razorpay/${orderId}/`);

      const options = {
        key: "rzp_test_mNB0dbHJxOzFjU",
        amount: res.data.amount * 100,
        currency: "INR",
        name: "Mini Order",
        description: "Order Payment",
        order_id: res.data.razorpay_order_id,

        handler: async function (response) {
          alert("Payment Successful!");

          await API.post("api/payments/webhook/", {
            order_id: orderId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id
          });

          // refresh orders
          const newOrders = await API.get(`api/orders/${userId}/`);
          setOrders(newOrders.data);
        },

        prefill: {
          email: res.data.customer_email,
        },

        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      alert("Error loading payment");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Your Orders</h1>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Order No</th>
              <th>Status</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.order_id}</td>

                <td>{order.status}</td>

                <td>
                  {order.items.map((item) => (
                    <div key={item.id}>
                      {item.product.name} × {item.quantity} = ₹{item.unit_price}
                    </div>
                  ))}
                </td>

                <td>₹{order.total_amount}</td>

                <td>
                  {order.status === "PENDING" && (
                    <button
                      style={{ background: "green", color: "white", marginRight: 10 }}
                      onClick={() => handlePayment(order.id)}
                    >
                      Pay Now
                    </button>
                  )}

                  {order.status !== "PAID" && (
                    <button
                      style={{ background: "red", color: "white" }}
                      onClick={() => deleteOrder(order.id)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
