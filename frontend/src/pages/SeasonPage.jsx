import React, { useEffect, useMemo, useState } from "react";
import { createSeason, getSeasons } from "../api/seasonApi";

export default function SeasonPage() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name: "", seasonStatus: "PLANNED" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = async () => {
    const res = await getSeasons();
    setList(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => {
    refresh().catch(() => setError("Không tải được danh sách mùa vụ"));
  }, []);

  const summary = useMemo(() => ({
    total: list.length,
    planned: list.filter((s) => (s.seasonStatus || "PLANNED") === "PLANNED").length,
  }), [list]);

  const handleCreate = async () => {
    if (!form.name.trim()) {
      setError("Tên mùa vụ không được để trống");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await createSeason(form);
      setForm({ name: "", seasonStatus: "PLANNED" });
      await refresh();
    } catch (e) {
      setError(e?.response?.data?.message || "Tạo mùa vụ thất bại");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Season management</h2>
      <p>Total: {summary.total}, Planned: {summary.planned}</p>

      <div style={{ display: "grid", gap: 12, maxWidth: 420 }}>
        <input
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Season name"
        />
        <select
          value={form.seasonStatus}
          onChange={(e) => setForm((prev) => ({ ...prev, seasonStatus: e.target.value }))}
        >
          <option value="PLANNED">PLANNED</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="HARVESTED">HARVESTED</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>
        <button onClick={handleCreate} disabled={busy}>{busy ? "Saving..." : "Create season"}</button>
        {error && <div>{error}</div>}
      </div>

      <ul>
        {list.map((s) => (
          <li key={s.id}>{s.name} ({s.seasonStatus || "PLANNED"})</li>
        ))}
      </ul>
    </div>
  );
}
