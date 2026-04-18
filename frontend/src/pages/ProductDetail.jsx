import { useParams, useNavigate } from "react-router-dom";
import { getProduct } from "../api/listingApi";
import { useEffect, useState } from "react";

export default function ProductDetail() {
  const { id } = useParams();
  const [data, setData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    getProduct(id).then(res => setData(res.data));
  }, [id]);

  return (
    <div>
      <h2>{data.name}</h2>
      <p>{data.description}</p>

      {/* 👉 NÚT QUAN TRỌNG */}
      <button onClick={() => navigate(`/trace/${data.batchId}`)}>
        Xem nguồn gốc lô hàng
      </button>

      <button onClick={() => navigate(`/cart/${data.id}`)}>
        Mua ngay
      </button>
    </div>
  );
}