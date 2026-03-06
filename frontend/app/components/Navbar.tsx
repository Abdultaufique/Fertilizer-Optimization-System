"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav
      style={{
        background: "#064e3b",
        padding: "16px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "white",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <h2 style={{ fontWeight: "bold" }}>🌾 FarmAI</h2>

      <div style={{ display: "flex", gap: 30 }}>
        <Link href="/" style={{ color: "white", textDecoration: "none" }}>
          Home
        </Link>
        <Link href="/input" style={{ color: "white", textDecoration: "none" }}>
          Soil Analysis
        </Link>
        <Link href="/results" style={{ color: "white", textDecoration: "none" }}>
          Dashboard
        </Link>
      </div>
    </nav>
  );
}