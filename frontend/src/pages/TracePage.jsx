import { useParams } from "react-router-dom";
import { getTracking } from "../api/trackingApi";
import { useEffect, useState } from "react";

export default function TrackingPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    getTracking(id).then(res => setData(res.data));
  }, [id]);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h2>Tracking Order #{id}</h2>

      <p>Status: {data.status}</p>

      {/* Blockchain */}
      <p>Hash: {data.hash}</p>

      {/* Timeline */}
      {data.history.map((h, i) => (
        <div key={i}>
          {h.status} - {h.time}
        </div>
      ))}
    </div>
  );
}