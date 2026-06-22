import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { clearCart } from "../../store/slices/cartSlice";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";

interface SavedAddress {
  id: number;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  address_type: string;
  isDefault: boolean;
}

export default function Checkout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cartItems = useAppSelector((state) => state.cart.items);
  const { authFetch } = useAuthenticatedFetch();
  const user = useAppSelector((state) => state.auth.user);

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    address1: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    address_type: "Home",
  });
  const [ordered, setOrdered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  useEffect(() => {
    authFetch("/address")
      .then((res) => res.json())
      .then((addresses) => {
        setSavedAddresses(addresses);
        for (let i = 0; i < addresses.length; i++) {
          if (addresses.length > 0) {
            setSelectedAddressId(addresses[0].id);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load addresses:", err);
      });
  }, [authFetch]);

  if (!ordered && cartItems.length === 0) {
    navigate("/cart", { replace: true });
    return null;
  }

  if (ordered) {
    return (
      <div className="checkout-success">
        <h2>Order Placed Successfully!</h2>
        <p>Your order will be delivered soon.</p>
        <Link to="/dashboard" className="btn-shop">
          Back to Products
        </Link>
      </div>
    );
  }

  function handleAddress1(e: React.ChangeEvent<HTMLInputElement>) {
    setNewAddress({ ...newAddress, address1: e.target.value });
  }

  function handleCity(e: React.ChangeEvent<HTMLInputElement>) {
    setNewAddress({ ...newAddress, city: e.target.value });
  }

  function handleState(e: React.ChangeEvent<HTMLInputElement>) {
    setNewAddress({ ...newAddress, state: e.target.value });
  }

  function handleCountry(e: React.ChangeEvent<HTMLInputElement>) {
    setNewAddress({ ...newAddress, country: e.target.value });
  }

  function handlePostalCode(e: React.ChangeEvent<HTMLInputElement>) {
    setNewAddress({ ...newAddress, postal_code: e.target.value });
  }

  function handleAddressType(e: React.ChangeEvent<HTMLSelectElement>) {
    setNewAddress({ ...newAddress, address_type: e.target.value });
  }

  async function handlePlaceOrder() {
    setError("");
    setLoading(true);
    try {
      let addressId = selectedAddressId;

      if (showAddressForm || !addressId) {
        if (
          !newAddress.address1 ||
          !newAddress.city ||
          !newAddress.state ||
          !newAddress.country ||
          !newAddress.postal_code
        ) {
          throw new Error("Please fill all address fields");
        }
        if (!user) throw new Error("Please log in again");

        const res = await authFetch("/address", {
          method: "POST",
          body: JSON.stringify({ user_id: user.id, ...newAddress }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to save address");
        addressId = data.id;
      }

      if (!addressId) throw new Error("Please select or enter an address");

      const res = await authFetch("/orders/checkout", {
        method: "POST",
        body: JSON.stringify({ address_id: addressId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");

      dispatch(clearCart());
      setOrdered(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Network error. Please try again.",
      );
    }
    setLoading(false);
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      {error && <div className="checkout-error">{error}</div>}

      <div className="checkout-layout">
        <div className="checkout-form-section">
          <h2>Shipping Details</h2>

          {savedAddresses.length > 0 && !showAddressForm && (
            <div className="saved-addresses">
              <h3>Saved Addresses</h3>
              {savedAddresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`address-option ${selectedAddressId === addr.id ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                  />
                  <div>
                    <strong>{addr.address1}</strong>
                    {addr.address2 && `, ${addr.address2}`}
                    <br />
                    {addr.city}, {addr.state}, {addr.country} -{" "}
                    {addr.postal_code}
                    <br />
                    <small>Type: {addr.address_type}</small>
                    {addr.isDefault && (
                      <span className="default-badge">Default</span>
                    )}
                  </div>
                </label>
              ))}
              <button
                className="btn-link"
                type="button"
                onClick={() => setShowAddressForm(true)}
              >
                + Use a new address
              </button>
            </div>
          )}

          {(savedAddresses.length === 0 || showAddressForm) && (
            <div className="checkout-form">
              <label>Address Line 1</label>
              <input
                type="text"
                value={newAddress.address1}
                onChange={handleAddress1}
                placeholder="123 Main St"
              />
              <label>City</label>
              <input
                type="text"
                value={newAddress.city}
                onChange={handleCity}
                placeholder="New York"
              />
              <label>State</label>
              <input
                type="text"
                value={newAddress.state}
                onChange={handleState}
                placeholder="NY"
              />
              <label>Country</label>
              <input
                type="text"
                value={newAddress.country}
                onChange={handleCountry}
                placeholder="USA"
              />
              <label>Postal Code</label>
              <input
                type="text"
                value={newAddress.postal_code}
                onChange={handlePostalCode}
                placeholder="10001"
              />
              <label>Address Type</label>
              <select
                value={newAddress.address_type}
                onChange={handleAddressType}
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
              {savedAddresses.length > 0 && (
                <button
                  className="btn-link"
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                >
                  ← Use a saved address
                </button>
              )}
            </div>
          )}
        </div>

        <div className="checkout-summary">
          <h2>Order Summary</h2>
          {cartItems.map((item, i) => (
            <div className="checkout-item" key={i}>
              {item.images?.[0] ? (
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="checkout-item-img"
                />
              ) : (
                <div className="checkout-item-img-placeholder">No Image</div>
              )}
              <div className="checkout-item-info">
                <p className="checkout-item-name">{item.name}</p>
              </div>
              <span className="checkout-item-qty">x{item.quantity}</span>
              <span className="checkout-item-price">
                ${item.price * item.quantity}
              </span>
            </div>
          ))}
          <div className="checkout-total">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="checkout-total">
            <span>Tax (5%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="checkout-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
            className="btn-place-order"
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
