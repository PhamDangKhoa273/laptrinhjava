import { useState } from "react";
import { createOrder, getOrders } from "../api/orderApi";

export default function OrderPage() {
  const [orders, setOrders] = useState([]);

  const handleCreate = async () => {
    await createOrder({ productId: 1 });
    const res = await getOrders();
    setOrders(res.data);
  };

  return (
    <div>
      <h2>Order</h2>

      <button onClick={handleCreate}>Create Order</button>

      {orders.map((o) => (
        <div key={o.id}>Order #{o.id}</div>
      ))}
    </div>
  );
}