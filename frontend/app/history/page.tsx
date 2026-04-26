"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

export default function HistoryPage() {
  const { getUser, logout } = useAuth();
  const user = getUser();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("https://fertilizer-optimization-system.onrender.com/history", {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch history");
        return res.json();
      })
      .then((data) => {
        setHistory(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40, color: "white", background: "#0f172a", minHeight: "100vh" }}>
        Loading History...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, color: "#f87171", background: "#0f172a", minHeight: "100vh" }}>
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "white", padding: 40 }}>
      {/* NAVBAR */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <h2 style={{ margin: 0 }}>🌱 FarmAI</h2>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <button style={navBtn} onClick={() => router.push("/")}>Home</button>
          <button style={navBtn} onClick={() => router.push("/input")}>Soil Analysis</button>
          <button style={navBtn} onClick={() => router.push("/results")}>Dashboard</button>
          {user && <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>👤 {user.username}</span>}
          <button onClick={logout} style={{ ...navBtn, color: "#f87171", border: "1px solid rgba(248,113,113,0.3)", padding: "6px 14px", borderRadius: 6 }}>Logout</button>
        </div>
      </nav>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <h1>📋 Farmer History</h1>
        <button
          onClick={() => router.push("/input")}
          style={{ padding: "10px 24px", background: "#22c55e", border: "none", borderRadius: 8, color: "white", fontWeight: "bold", cursor: "pointer" }}
        >
          + New Analysis
        </button>
      </div>

      {history.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: 100, opacity: 0.6 }}>
          <p style={{ fontSize: 20 }}>No history found.</p>
          <p>Run your first soil analysis to see results here.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#1e293b", textAlign: "left" }}>
                <Th>#</Th>
                <Th>Date</Th>
                <Th>Crop</Th>
                <Th>Area (ha)</Th>
                <Th>N / P / K</Th>
                <Th>Urea (kg)</Th>
                <Th>DAP (kg)</Th>
                <Th>MOP (kg)</Th>
                <Th>Soil Score</Th>
                <Th>Cost (₹)</Th>
              </tr>
            </thead>
            <tbody>
              {history.map((row, index) => (
                <tr
                  key={row.id}
                  style={{ background: index % 2 === 0 ? "#0f172a" : "#1e293b", borderBottom: "1px solid #334155" }}
                >
                  <Td>{row.id}</Td>
                  <Td>{row.created_at}</Td>
                  <Td style={{ textTransform: "capitalize" }}>{row.crop}</Td>
                  <Td>{row.area}</Td>
                  <Td>{row.soil_n} / {row.soil_p} / {row.soil_k}</Td>
                  <Td>{row.urea_kg}</Td>
                  <Td>{row.dap_kg}</Td>
                  <Td>{row.mop_kg}</Td>
                  <Td>
                    <span style={{
                      padding: "3px 10px",
                      borderRadius: 20,
                      background: row.soil_health_score >= 70 ? "#166534" : row.soil_health_score >= 40 ? "#854d0e" : "#7f1d1d",
                      color: "white",
                    }}>
                      {row.soil_health_score}
                    </span>
                  </Td>
                  <Td>₹ {row.estimated_cost_inr}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 600, whiteSpace: "nowrap" }}>
      {children}
    </th>
  );
}

function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <td style={{ padding: "12px 16px", color: "#e2e8f0", whiteSpace: "nowrap", ...style }}>
      {children}
    </td>
  );
}

const navBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
};