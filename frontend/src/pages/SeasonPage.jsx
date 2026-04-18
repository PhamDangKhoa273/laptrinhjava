import React, { useEffect, useState } from "react";
import { getSeasons, createSeason } from "../api/seasonApi";

export default function SeasonPage() {
  const [list, setList] = useState([]);
  const [name, setName] = useState("");

  const load = async () => {
    const res = await getSeasons();
    setList(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    await createSeason({ name });
    load();
  };

  return (
    <div>
      <h2>Season</h2>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Season name"
      />
      <button onClick={handleCreate}>Create</button>

      <ul>
        {list.map((s) => (
          <li key={s.id}>{s.name}</li>
        ))}
      </ul>
    </div>
  );
}