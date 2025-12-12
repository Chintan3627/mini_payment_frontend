import { useEffect, useState } from "react";
import API from "../lib/api";
import Link from "next/link";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [userId, setUserId] = useState(null);

  // Popup state
  const [showPopup, setShowPopup] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const uid = localStorage.getItem("user_id");
    setUserId(uid);

    API.get("/api/products/")
      .then((res) => setProducts(res.data))
      .catch((err) => console.log("API ERROR:", err));
  }, []);

  const toggleSelect = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  // Show popup with selected items
  const openPopup = () => {
    if (!userId) {
      alert("Please login first");
      window.location.href = "/login";
      return;
    }
    if (selectedProducts.length === 0) return;

    // Build popup list (default qty = 1)
    const items = products
      .filter((p) => selectedProducts.includes(p.id))
      .map((p) => ({
        ...p,
        qty: 1,
      }));

    setCartItems(items);
    setShowPopup(true);
  };

  // Increase quantity
  const increaseQty = (id) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  // Decrease quantity (min 1)
  const decreaseQty = (id) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id && item.qty > 1
          ? { ...item, qty: item.qty - 1 }
          : item
      )
    );
  };

  // Remove item from popup
  const removeItem = (id) => {
    const newList = cartItems.filter((item) => item.id !== id);
    setCartItems(newList);
    setSelectedProducts(newList.map((i) => i.id));
  };

  // Confirm order
  const confirmOrder = () => {
    const payload = {
      user: userId,
      items: cartItems.map((item) => ({
        product: item.id,
        quantity: item.qty,
      })),
    };

    API.post("/api/orders/create/", payload)
      .then((res) => {
        window.location.href = `/order/${userId}`;
      })
      .catch((err) => {
        console.log("ORDER API ERROR", err);
        alert("Failed to create order");
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user_id");

    alert("Logged out successfully");
    window.location.href = "/login";
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Products</h1>

      {/* Navigation */}
      <div style={{ marginBottom: 20 }}>
        {!userId && (
          <>
            <Link href="/login">
              <button style={{ marginRight: 10 }}>Login</button>
            </Link>
            <Link href="/register">
              <button>Register</button>
            </Link>
          </>
        )}

        {userId && (
          <>
            <Link href="/order/[id]" as={`/order/${userId}`}>
              <button style={{ marginRight: 10 }}>My Orders</button>
            </Link>

            <button
              onClick={openPopup}
              disabled={selectedProducts.length === 0}
              style={{
                backgroundColor:
                  selectedProducts.length > 0 ? "blue" : "gray",
                color: "white",
                padding: "8px 15px",
                borderRadius: 5,
                marginRight: 10,
              }}
            >
              Create Order
            </button>

            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "red",
                color: "white",
                padding: "8px 15px",
                borderRadius: 5,
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>

      {/* Product Table */}
      <table border="1" width="100%" cellPadding="10">
        <thead>
          <tr>
            <th>Select</th>
            <th>Product Name</th>
            <th>Price (₹)</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => (
            <tr
              key={p.id}
              onClick={() => toggleSelect(p.id)}
              style={{
                cursor: "pointer",
                backgroundColor: selectedProducts.includes(p.id)
                  ? "#d3e3ff"
                  : "transparent",
              }}
            >
              <td>
                {userId && (
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(p.id)}
                    onChange={() => toggleSelect(p.id)}
                  />
                )}
              </td>
              <td>{p.name}</td>
              <td>₹{p.price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* POPUP MODAL */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "450px",
              background: "white",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <h2>Confirm Order</h2>

            {cartItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <strong>{item.name}</strong>

                <div>
                  <button onClick={() => decreaseQty(item.id)}>-</button>
                  <span style={{ padding: "0 10px" }}>{item.qty}</span>
                  <button onClick={() => increaseQty(item.id)}>+</button>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  style={{ color: "red", border: "none", background: "none" }}
                >
                  X
                </button>
              </div>
            ))}

            <hr />

            <div style={{ textAlign: "right" }}>
              <button
                onClick={() => setShowPopup(false)}
                style={{ marginRight: 10 }}
              >
                Cancel
              </button>

              <button
                onClick={confirmOrder}
                style={{
                  background: "blue",
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: 5,
                }}
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
