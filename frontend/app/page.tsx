"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "./hooks/useAuth";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const { getUser, logout } = useAuth();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "white" }}>
      {/* NAVBAR */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 60px", background: "#065f46" }}>
        <h2 style={{ margin: 0 }}>🌱 FarmAI</h2>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <button style={navBtn} onClick={() => router.push("/")}>Home</button>
          <button style={navBtn} onClick={() => router.push("/input")}>Soil Analysis</button>
          <button style={navBtn} onClick={() => router.push("/results")}>Dashboard</button>
          <button style={navBtn} onClick={() => router.push("/history")}>History</button>
          {user && (
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
              👤 {user.username}
            </span>
          )}
          <button
            onClick={logout}
            style={{ ...navBtn, color: "#f87171", border: "1px solid rgba(248,113,113,0.3)", padding: "6px 14px", borderRadius: 6 }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ height: "85vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "linear-gradient(to bottom, #065f46, #0f172a)", textAlign: "center", padding: 20 }}>
        <h1 style={{ fontSize: "52px", marginBottom: 20 }}>Smart Farming Starts Here 🌾</h1>
        <p style={{ fontSize: "20px", maxWidth: 700, marginBottom: 40, opacity: 0.85 }}>
          Optimize fertilizer usage, monitor soil health, detect nutrient deficiencies and receive AI-powered recommendations for sustainable farming.
        </p>
        <button
          onClick={() => router.push("/input")}
          style={{ padding: "16px 45px", background: "#22c55e", border: "none", borderRadius: 12, fontSize: 18, fontWeight: "bold", cursor: "pointer", color: "white" }}
        >
          Start Soil Analysis
        </button>
      </section>

      {/* FEATURES SECTION */}
      <section style={{ padding: "80px 60px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 40 }}>
        <Feature title="🌾 Fertilizer Optimization" desc="Get precise fertilizer quantities tailored to your soil composition." />
        <Feature title="🧪 Soil Health Monitoring" desc="Analyze soil score and maintain long-term productivity." />
        <Feature title="🐛 Pest Advisory" desc="Assess pest risks and receive smart pesticide guidance." />
        <Feature title="📊 Interactive Dashboard" desc="Visual charts and downloadable PDF farming reports." />
      </section>

      {/* FOOTER */}
      <footer style={{ textAlign: "center", padding: 20, background: "#065f46", marginTop: 40 }}>
        © 2026 FarmAI — Smart Agriculture Solutions
      </footer>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ background: "#1e293b", padding: 30, borderRadius: 15 }}>
      <h3 style={{ marginBottom: 15 }}>{title}</h3>
      <p style={{ opacity: 0.8 }}>{desc}</p>
    </div>
  );
}

const navBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
};