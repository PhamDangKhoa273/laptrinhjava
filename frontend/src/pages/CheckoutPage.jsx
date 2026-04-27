import { createOrder } from "../api/orderApi";
import { useNavigate } from "react-router-dom";

export default function CheckoutPage() {
  const navigate = useNavigate();

  const handleOrder = async () => {
    const res = await createOrder({ productId: 1 });
    navigate(`/tracking/${res.data.id}`);
  };

  return (
    <div>
      <h2>Checkout</h2>
      <button onClick={handleOrder}>Đặt hàng</button>
    </div>
  );
}