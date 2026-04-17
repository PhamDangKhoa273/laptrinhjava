import { useParams, useNavigate } from "react-router-dom";

export default function CartPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <h2>Cart</h2>
      <p>Product ID: {id}</p>

      <button onClick={() => navigate("/checkout")}>
        Thanh toán
      </button>
    </div>
  );
}