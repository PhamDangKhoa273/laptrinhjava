import React, { useState } from "react";
import { createBatch } from "../api/batchApi";
import QRCodeView from "../components/QRCodeView";

export default function BatchPage() {
  const [id, setId] = useState("");

  const handleCreate = async () => {
    const res = await createBatch({});
    setId(res.data.id);
  };

  return (
    <div>
      <h2>Batch</h2>

      <button onClick={handleCreate}>Create Batch</button>

      {id && (
        <QRCodeView value={`http://localhost:3000/trace/${id}`} />
      )}
    </div>
  );
}