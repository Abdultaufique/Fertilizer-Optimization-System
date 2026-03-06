"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

const SOIL_TYPES = ["Sandy", "Loamy", "Black", "Red", "Clayey"];
const CROP_TYPES = ["Paddy", "Wheat", "Maize", "Cotton", "Sugarcane", "Barley", "Millets", "Pulses", "Oil seeds", "Tobacco", "Ground Nuts"];

export default function InputPage() {
  const { getUser, logout } = useAuth();
  const user = getUser();
  const router = useRouter();

  const [form, setForm] = useState({
    soil_n: "", soil_p: "", soil_k: "",
    temperature: "", humidity: "", moisture: "",
    ph: "", rainfall: "", area: "",
    soil_type: "Loamy", crop_type: "Paddy",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    const required = ["soil_n", "soil_p", "soil_k", "temperature", "humidity", "moisture", "area"];
    for (const key of required) {
      if (!form[key as keyof typeof form]) {
        setError(`Please fill in all required fields.`);
        return;
      }
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("https://fertilizer-optimization-system.onrender.com/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soil_n: Number(form.soil_n),
          soil_p: Number(form.soil_p),
          soil_k: Number(form.soil_k),
          temperature: Number(form.temperature),
          humidity: Number(form.humidity),
          moisture: Number(form.moisture),
          ph: form.ph ? Number(form.ph) : 7.0,
          rainfall: form.rainfall ? Number(form.rainfall) : 100.0,
          area: Number(form.area),
          soil_type: form.soil_type,
          crop_type: form.crop_type,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || `Server error: ${res.status}`);
      }
      const data = await res.json();
      localStorage.setItem("fertilizer_data", JSON.stringify(data));
      router.push("/results");
    } catch (err: any) {
      setError(err.message || "Failed to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom, #064e3b, #0f172a)", color: "white" }}>
      {/* NAVBAR */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 60px", background: "#065f46" }}>
        <h2 style={{ margin: 0 }}>🌱 FarmAI</h2>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <button style={navBtn} onClick={() => router.push("/")}>Home</button>
          <button style={navBtn} onClick={() => router.push("/results")}>Dashboard</button>
          <button style={navBtn} onClick={() => router.push("/history")}>History</button>
          {user && <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>👤 {user.username}</span>}
          <button onClick={logout} style={{ ...navBtn, color: "#f87171", border: "1px solid rgba(248,113,113,0.3)", padding: "6px 14px", borderRadius: 6 }}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px" }}>
        <h1 style={{ textAlign: "center", marginBottom: 8 }}>🌱 Soil Analysis Form</h1>
        <p style={{ textAlign: "center", opacity: 0.6, marginBottom: 40 }}>AI-powered fertilizer recommendation using Machine Learning</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>

          {/* Card 1 - Soil Nutrients */}
          <div style={card}>
            <h3 style={cardTitle}>🧪 Soil Nutrients</h3>
            <Field label="Nitrogen (N) kg/ha *" value={form.soil_n} onChange={(v) => set("soil_n", v)} placeholder="e.g. 40" />
            <Field label="Phosphorus (P) kg/ha *" value={form.soil_p} onChange={(v) => set("soil_p", v)} placeholder="e.g. 20" />
            <Field label="Potassium (K) kg/ha *" value={form.soil_k} onChange={(v) => set("soil_k", v)} placeholder="e.g. 30" />
            <Field label="Soil pH (optional)" value={form.ph} onChange={(v) => set("ph", v)} placeholder="e.g. 6.5" />
          </div>

          {/* Card 2 - Weather */}
          <div style={card}>
            <h3 style={cardTitle}>🌤️ Weather Conditions</h3>
            <Field label="Temperature (°C) *" value={form.temperature} onChange={(v) => set("temperature", v)} placeholder="e.g. 28" />
            <Field label="Humidity (%) *" value={form.humidity} onChange={(v) => set("humidity", v)} placeholder="e.g. 60" />
            <Field label="Moisture (%) *" value={form.moisture} onChange={(v) => set("moisture", v)} placeholder="e.g. 40" />
            <Field label="Rainfall (mm, optional)" value={form.rainfall} onChange={(v) => set("rainfall", v)} placeholder="e.g. 100" />
          </div>

          {/* Card 3 - Crop & Soil */}
          <div style={card}>
            <h3 style={cardTitle}>🌾 Crop & Soil Details</h3>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Soil Type *</label>
              <select value={form.soil_type} onChange={(e) => set("soil_type", e.target.value)} style={selectStyle}>
                {SOIL_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Crop Type *</label>
              <select value={form.crop_type} onChange={(e) => set("crop_type", e.target.value)} style={selectStyle}>
                {CROP_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <Field label="Farm Area (hectares) *" value={form.area} onChange={(v) => set("area", v)} placeholder="e.g. 2" />
          </div>
        </div>

        {/* Error */}
        {error && <p style={{ color: "#f87171", textAlign: "center", marginTop: 20 }}>⚠️ {error}</p>}

        {/* Submit */}
        <div style={{ textAlign: "center", marginTop: 30 }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ padding: "14px 60px", background: "#22c55e", border: "none", borderRadius: 10, color: "white", fontWeight: "bold", fontSize: 16, cursor: "pointer", opacity: loading ? 0.7 : 1, transition: "0.2s" }}
          >
            {loading ? "🤖 Analyzing with AI..." : "🚀 Generate ML Recommendation"}
          </button>
        </div>

        {/* Info */}
        <p style={{ textAlign: "center", marginTop: 16, opacity: 0.4, fontSize: 13 }}>
          Powered by Random Forest ML • 95% Accuracy • Trained on real agricultural data
        </p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
        min={0}
      />
    </div>
  );
}

const card: React.CSSProperties = { background: "#1e293b", padding: 24, borderRadius: 14, border: "1px solid #334155" };
const cardTitle: React.CSSProperties = { marginBottom: 20, fontSize: 16, color: "#22c55e" };
const labelStyle: React.CSSProperties = { display: "block", marginBottom: 6, fontSize: 13, opacity: 0.75 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 7, border: "1px solid #334155", background: "#0f172a", color: "white", fontSize: 14, outline: "none", boxSizing: "border-box" };
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer" };
const navBtn: React.CSSProperties = { background: "transparent", border: "none", color: "white", cursor: "pointer", fontWeight: "bold" };
