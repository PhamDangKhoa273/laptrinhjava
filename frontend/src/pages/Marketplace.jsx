import { useEffect, useState } from "react";
import { getSản phẩm } from "../api/listingApi";
import { useNavigate } from "react-router-dom";

export default function Marketplace() {
  const [list, setList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getSản phẩm().then(res => setList(res.data));
  }, []);

  return (
    <div>
      <h2>Chợ nông sản</h2>

      {list.map(p => (
        <div key={p.id} onClick={() => navigate(`/product/${p.id}`)}>
          <h3>{p.name}</h3>
          <p>{p.price}</p>
        </div>
      ))}
    </div>
  );
}