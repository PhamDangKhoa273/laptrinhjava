import React, { useState } from "react";
import { createStep } from "../api/processApi";

export default function ProcessPage() {
  const [name, setName] = useState("");

  const handleAdd = async () => {
    await createStep({ name });
  };

  return (
    <div>
      <h2>Process</h2>

      <input onChange={(e) => setName(e.target.value)} />
      <button onClick={handleAdd}>Add Step</button>
    </div>
  );
}