"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import SoilHealthGauge from "../components/SoilHealthGauge";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ResultsPage() {
  const { getUser, logout } = useAuth();
  const user = getUser();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("fertilizer_data");
      if (!stored) { router.push("/input"); return; }
      setData(JSON.parse(stored));
    } catch {
      setError("Failed to load results. Please try again.");
    }
  }, []);

  const downloadPDF = async () => {
    const element = document.getElementById("report");
    if (!element) return;
    const canvas = await html2canvas(element, { backgroundColor: "#0f172a" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const imgWidth = 180;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save("FarmAI_Report.pdf");
  };

  if (error) return (
    <div style={{ padding: 40, color: "#f87171", background: "#0f172a", minHeight: "100vh" }}>
      <p>⚠️ {error}</p>
      <button onClick={() => router.push("/input")} style={{ marginTop: 20, padding: "10px 20px", background: "#22c55e", border: "none", borderRadius: 8, color: "white", cursor: "pointer" }}>Go Back</button>
    </div>
  );

  if (!data) return (
    <div style={{ padding: 40, color: "white", background: "#0f172a", minHeight: "100vh" }}>
      Loading Dashboard...
    </div>
  );

  const ml = data.ml_prediction || {};
  const nutrientDeficit = data.nutrient_deficit || {};
  const fertilizerRequired = data.fertilizer_required || {};
  const fertilizerSchedule: any[] = data.fertilizer_schedule || [];
  const practices: string[] = data.sustainable_practices || [];
  const inputs = data.inputs_summary || {};

  const pieData = [
    { name: "Nitrogen", value: nutrientDeficit.N ?? 0 },
    { name: "Phosphorus", value: nutrientDeficit.P ?? 0 },
    { name: "Potassium", value: nutrientDeficit.K ?? 0 },
  ].filter((d) => d.value > 0);

  const COLORS = ["#22c55e", "#facc15", "#ef4444"];

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "white" }}>
      {/* NAVBAR */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 40px", background: "#065f46" }}>
        <h2 style={{ margin: 0 }}>🌱 FarmAI</h2>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <button style={navBtn} onClick={() => router.push("/")}>Home</button>
          <button style={navBtn} onClick={() => router.push("/input")}>Soil Analysis</button>
          <button style={navBtn} onClick={() => router.push("/history")}>History</button>
          {user && <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>👤 {user.username}</span>}
          <button onClick={logout} style={{ ...navBtn, color: "#f87171", border: "1px solid rgba(248,113,113,0.3)", padding: "6px 14px", borderRadius: 6 }}>Logout</button>
        </div>
      </nav>

      <div style={{ padding: 40 }} id="report">
        <h1 style={{ marginBottom: 6 }}>🌾 Fertilizer Recommendation Dashboard</h1>
        <p style={{ opacity: 0.5, marginBottom: 30, fontSize: 14 }}>AI-powered analysis • Random Forest ML Model</p>

        {/* ML Prediction Banner */}
        {ml.recommended_fertilizer && (
          <div style={{ background: "linear-gradient(135deg, #064e3b, #065f46)", border: "1px solid #22c55e", borderRadius: 14, padding: 24, marginBottom: 30, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
            <div>
              <p style={{ opacity: 0.7, fontSize: 13, marginBottom: 4 }}>🤖 ML Recommended Fertilizer</p>
              <h2 style={{ fontSize: 32, color: "#22c55e", margin: 0 }}>{ml.recommended_fertilizer}</h2>
              <p style={{ opacity: 0.6, marginTop: 4, fontSize: 13 }}>Confidence: <strong style={{ color: "#4ade80" }}>{ml.confidence_percent}%</strong></p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ opacity: 0.7, fontSize: 13, marginBottom: 4 }}>🌱 Best Crop for Your Soil</p>
              <h3 style={{ fontSize: 22, color: "#facc15", margin: 0, textTransform: "capitalize" }}>{ml.recommended_crop}</h3>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ opacity: 0.7, fontSize: 13, marginBottom: 4 }}>📦 Total Fertilizer Needed</p>
              <h3 style={{ fontSize: 22, color: "#60a5fa", margin: 0 }}>{ml.fertilizer_qty_kg} kg</h3>
            </div>
          </div>
        )}

        {/* Fertilizer Cards */}
        <div style={{ display: "flex", gap: 20, marginBottom: 30, flexWrap: "wrap" }}>
          <Card title="Urea (kg)" value={fertilizerRequired.urea_kg ?? 0} color="#22c55e" />
          <Card title="DAP (kg)" value={fertilizerRequired.dap_kg ?? 0} color="#facc15" />
          <Card title="MOP (kg)" value={fertilizerRequired.mop_kg ?? 0} color="#ef4444" />
          <Card title="Cost (₹)" value={data.estimated_cost_inr ?? 0} color="#60a5fa" />
        </div>

        {/* Two column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, marginBottom: 30 }}>
          {/* Soil Health */}
          <div style={sectionCard}>
            <h2 style={{ marginBottom: 10 }}>🧪 Soil Health Score</h2>
            <SoilHealthGauge value={data.soil_health_score ?? 0} />
            <h3 style={{ textAlign: "center", marginTop: 10 }}>{data.soil_health_score ?? "N/A"} / 100</h3>
            {/* Input Summary */}
            <div style={{ marginTop: 16, fontSize: 13, opacity: 0.7 }}>
              <p>🌡️ Temp: {inputs.temperature}°C &nbsp;|&nbsp; 💧 Humidity: {inputs.humidity}%</p>
              <p>🌱 Soil: {inputs.soil_type} &nbsp;|&nbsp; 🌾 Crop: {inputs.crop_type}</p>
              <p>📏 Area: {inputs.area} ha &nbsp;|&nbsp; 🌧️ Rainfall: {inputs.rainfall}mm</p>
            </div>
          </div>

          {/* Nutrient Deficit Pie */}
          <div style={sectionCard}>
            <h2 style={{ marginBottom: 10 }}>📊 Nutrient Deficit</h2>
            {pieData.length > 0 ? (
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label>
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p style={{ opacity: 0.5, textAlign: "center", marginTop: 60 }}>✅ No nutrient deficit detected!</p>
            )}
          </div>
        </div>

        {/* Sustainable Practices */}
        {practices.length > 0 && (
          <div style={{ ...sectionCard, marginBottom: 30 }}>
            <h2 style={{ marginBottom: 16 }}>♻️ Sustainable Farming Practices</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {practices.map((p, i) => (
                <div key={i} style={{ background: "#0f172a", padding: "12px 16px", borderRadius: 8, borderLeft: "3px solid #22c55e", fontSize: 14 }}>
                  🌿 {p}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fertilizer Schedule */}
        {fertilizerSchedule.length > 0 && (
          <div style={{ ...sectionCard, marginBottom: 30 }}>
            <h2 style={{ marginBottom: 16 }}>📅 Fertilizer Application Schedule</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {fertilizerSchedule.map((item: any, index: number) => (
                <div key={index} style={{ background: "#0f172a", padding: 16, borderRadius: 10, borderLeft: "3px solid #3b82f6" }}>
                  <strong style={{ color: "#60a5fa" }}>{item.stage}</strong>
                  <p style={{ fontSize: 12, opacity: 0.6, margin: "4px 0" }}>⏰ {item.time}</p>
                  <p style={{ fontSize: 13, margin: 0 }}>{item.action}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 15, padding: "0 40px 40px" }}>
        <button onClick={downloadPDF} style={{ padding: "12px 30px", background: "#22c55e", border: "none", borderRadius: 8, color: "white", fontWeight: "bold", cursor: "pointer" }}>
          📄 Download PDF Report
        </button>
        <button onClick={() => router.push("/input")} style={{ padding: "12px 30px", background: "#334155", border: "none", borderRadius: 8, color: "white", fontWeight: "bold", cursor: "pointer" }}>
          ← New Analysis
        </button>
      </div>
    </div>
  );
}

function Card({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div style={{ flex: 1, minWidth: 140, background: "#1e293b", padding: 20, borderRadius: 12, textAlign: "center", borderTop: `3px solid ${color}` }}>
      <h3 style={{ marginBottom: 8, fontSize: 14, opacity: 0.7 }}>{title}</h3>
      <p style={{ fontSize: 22, fontWeight: "bold", margin: 0, color }}>{value}</p>
    </div>
  );
}

const sectionCard: React.CSSProperties = { background: "#1e293b", padding: 24, borderRadius: 14, border: "1px solid #334155" };
const navBtn: React.CSSProperties = { background: "transparent", border: "none", color: "white", cursor: "pointer", fontWeight: "bold" };
