import { useState } from "react";
import { getTracking } from "../api/trackingApi";

export default function TrackingPage() {
  const [id, setId] = useState("");
  const [data, setData] = useState(null);

  const handleTrack = async () => {
    const res = await getTracking(id);
    setData(res.data);
  };

  return (
    <div>
      <h2>Tracking</h2>

      <input onChange={(e) => setId(e.target.value)} />
      <button onClick={handleTrack}>Track</button>

      {data && <p>Status: {data.status}</p>}
    </div>
  );
}