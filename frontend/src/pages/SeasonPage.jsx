import { useEffect, useMemo, useState } from "react";
import { createSeason, getPhase3FarmContext, getSeasons, updateSeason } from "../services/phase3Service";
import { getErrorMessage } from "../utils/helpers";

const initialForm = {
  farmId: "",
  productId: "",
  seasonCode: "",
  startDate: "",
  expectedHarvestDate: "",
  farmingMethod: "",
};

const seasonStatuses = ["PLANNED", "IN_PROGRESS", "HARVESTED", "COMPLETED"];

function buildSeasonCode(farmCode) {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `${farmCode || "SEASON"}-${stamp}`;
}

export default function SeasonPage() {
  const [list, setList] = useState([]);
  const [farmContext, setFarmContext] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function init() {
      try {
        const context = await getPhase3FarmContext();
        setFarmContext(context);
        setForm((prev) => ({
          ...prev,
          farmId: context.farm?.farmId ? String(context.farm.farmId) : prev.farmId,
          seasonCode: prev.seasonCode || buildSeasonCode(context.farm?.farmCode),
          productId: context.products[0]?.productId ? String(context.products[0].productId) : prev.productId,
        }));
      } catch { }
    }
    init();
  }, []);

  const refresh = async () => {
    try {
      const data = await getSeasons();
      setList(Array.isArray(data) ? data : []);
    } catch {
      setError("Không t?i được danh sách mùa v?");
    }
  };

  useEffect(() => { refresh() }, []);

  const summary = useMemo(() => ({
    total: list.length,
    planned: list.filter((s) => (s.seasonStatus || "PLANNED") === "PLANNED").length,
  }), [list]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setForm({
      ...initialForm,
      farmId: farmContext?.farm?.farmId ? String(farmContext.farm.farmId) : "",
      productId: farmContext?.products[0]?.productId ? String(farmContext.products[0].productId) : "",
      seasonCode: buildSeasonCode(farmContext?.farm?.farmCode),
    });
    setEditingId(null);
  }

  function startEdit(season) {
    setEditingId(season.id);
    setForm({
      farmId: String(season.farmId || form.farmId),
      productId: String(season.productId || form.productId),
      seasonCode: season.seasonCode || "",
      startDate: season.startDate ? season.startDate.slice(0, 10) : "",
      expectedHarvestDate: season.expectedHarvestDate ? season.expectedHarvestDate.slice(0, 10) : "",
      farmingMethod: season.farmingMethod || "",
    });
  }

  const handleSubmit = async () => {
    if (!form.seasonCode.trim()) {
      setError("M? mùa v? không được để tr?ng");
      return;
    }
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        farmId: Number(form.farmId),
        productId: Number(form.productId),
        seasonCode: form.seasonCode.trim(),
        startDate: form.startDate,
        expectedHarvestDate: form.expectedHarvestDate,
        farmingMethod: form.farmingMethod.trim(),
      };
      if (editingId) {
        await updateSeason(editingId, payload);
        setSuccess("C?p nh?t mùa v? thành công");
      } else {
        await createSeason(payload);
        setSuccess("T?o mùa v? thành công");
      }
      resetForm();
      await refresh();
    } catch (e) {
      setError(getErrorMessage(e, editingId ? "C?p nh?t th?t b?i" : "T?o mùa v? th?t b?i"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
      <h2>Season management</h2>
      <p>T?ng: {summary.total}, Đã lên k? ho?ch: {summary.planned}</p>

      {error && <div style={{ color: "#ef4444", marginBottom: 12 }}>{error}</div>}
      {success && <div style={{ color: "#22c55e", marginBottom: 12 }}>{success}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
        <section style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
          <h3>{editingId ? "C?p nh?t mùa v?" : "T?o mùa v? m?i"}</h3>
          <div style={{ display: "grid", gap: 10 }}>
            <select name="farmId" value={form.farmId} onChange={handleChange}
              style={{ padding: 8, borderRadius: 6, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "#e2e8f0" }}>
              <option value="">-- Ch?n nông tr?i --</option>
              {farmContext?.farm && (
                <option value={farmContext.farm.farmId}>{farmContext.farm.farmName || farmContext.farm.name}</option>
              )}
            </select>

            <select name="productId" value={form.productId} onChange={handleChange}
              style={{ padding: 8, borderRadius: 6, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "#e2e8f0" }}>
              <option value="">-- Ch?n s?n ph?m --</option>
              {(farmContext?.products || []).map((p) => (
                <option key={p.productId} value={p.productId}>{p.productName || p.name}</option>
              ))}
            </select>

            <input name="seasonCode" value={form.seasonCode} onChange={handleChange} placeholder="M? mùa v? *"
              style={{ padding: 8, borderRadius: 6, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "#e2e8f0" }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                Ngày b?t đầu *
                <input type="date" name="startDate" value={form.startDate} onChange={handleChange}
                  style={{ padding: 8, borderRadius: 6, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "#e2e8f0" }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                Ngày thu ho?ch d? ki?n *
                <input type="date" name="expectedHarvestDate" value={form.expectedHarvestDate} onChange={handleChange}
                  style={{ padding: 8, borderRadius: 6, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "#e2e8f0" }} />
              </label>
            </div>

            <input name="farmingMethod" value={form.farmingMethod} onChange={handleChange} placeholder="Phương pháp canh tác"
              style={{ padding: 8, borderRadius: 6, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "#e2e8f0" }} />

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleSubmit} disabled={busy}
                style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: "none", background: "#22c55e", color: "#fff", fontWeight: 600, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1 }}>
                {busy ? "Đang x? l?..." : editingId ? "C?p nh?t" : "T?o mùa v?"}
              </button>
              {editingId && (
                <button onClick={resetForm}
                  style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#94a3b8", cursor: "pointer" }}>
                  H?y
                </button>
              )}
            </div>
          </div>
        </section>
      </div>

      <section>
        <h3>Danh sách mùa v?</h3>
        {list.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>Chưa có mùa v? nào.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontSize: 13, textAlign: "left" }}>
                <th style={{ padding: "8px 4px" }}>M? mùa v?</th>
                <th style={{ padding: "8px 4px" }}>Phương pháp</th>
                <th style={{ padding: "8px 4px" }}>B?t đầu</th>
                <th style={{ padding: "8px 4px" }}>Thu ho?ch d? ki?n</th>
                <th style={{ padding: "8px 4px" }}>Tr?ng thái</th>
                <th style={{ padding: "8px 4px" }}></th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 14 }}>
                  <td style={{ padding: "10px 4px" }}>{s.seasonCode}</td>
                  <td style={{ padding: "10px 4px" }}>{s.farmingMethod || "-"}</td>
                  <td style={{ padding: "10px 4px" }}>{s.startDate ? new Date(s.startDate).toLocaleDateString("vi-VN") : "-"}</td>
                  <td style={{ padding: "10px 4px" }}>{s.expectedHarvestDate ? new Date(s.expectedHarvestDate).toLocaleDateString("vi-VN") : "-"}</td>
                  <td style={{ padding: "10px 4px" }}>{s.seasonStatus || "PLANNED"}</td>
                  <td style={{ padding: "10px 4px" }}>
                    <button onClick={() => startEdit(s)}
                      style={{ background: "none", border: "1px solid #3b82f6", color: "#3b82f6", borderRadius: 4, padding: "4px 8px", cursor: "pointer", fontSize: 12 }}>
                      S?a
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
