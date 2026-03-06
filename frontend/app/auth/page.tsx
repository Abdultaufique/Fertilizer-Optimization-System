"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async () => {
    if (!loginUsername || !loginPassword) { setError("Please fill in all fields."); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");
      localStorage.setItem("farm_user", JSON.stringify(data.user));
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!regUsername || !regEmail || !regPassword) { setError("Please fill in all fields."); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: regUsername, email: regEmail, password: regPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Registration failed");
      setSuccess("Account created! Please login.");
      setRegUsername(""); setRegEmail(""); setRegPassword("");
      setTimeout(() => { setSuccess(""); setIsLogin(true); }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const toggle = () => { setError(""); setSuccess(""); setIsLogin(!isLogin); };

  return (
    <div style={styles.page}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.card}>
        {/* WELCOME PANEL */}
        <div style={{
          ...styles.welcome,
          order: isLogin ? 2 : 1,
          borderRadius: isLogin ? "0 16px 16px 0" : "16px 0 0 16px",
          transition: "all 0.6s cubic-bezier(0.77,0,0.175,1)",
        }}>
          <div style={styles.diagonal} />
          <div style={styles.welcomeContent}>
            <div style={styles.leaf}>🌾</div>
            <h2 style={styles.welcomeTitle}>
              {isLogin ? "WELCOME\nBACK!" : "WELCOME,\nFARMER!"}
            </h2>
            <p style={styles.welcomeSubtitle}>
              {isLogin ? "Your fields are waiting.\nSign in to continue." : "Join thousands of smart\nfarmers using FarmAI."}
            </p>
          </div>
        </div>

        {/* FORM PANEL */}
        <div style={{
          ...styles.formPanel,
          order: isLogin ? 1 : 2,
          transition: "all 0.6s cubic-bezier(0.77,0,0.175,1)",
        }}>
          <h2 style={styles.formTitle}>{isLogin ? "Login" : "Register"}</h2>

          {/* Username */}
          <div style={styles.inputGroup}>
            <input
              type="text"
              placeholder="Username"
              value={isLogin ? loginUsername : regUsername}
              onChange={(e) => isLogin ? setLoginUsername(e.target.value) : setRegUsername(e.target.value)}
              style={styles.input}
              onFocus={(e) => (e.target.style.borderBottomColor = "#2dd4bf")}
              onBlur={(e) => (e.target.style.borderBottomColor = "rgba(255,255,255,0.2)")}
            />
            <span style={styles.inputIcon}>👤</span>
          </div>

          {/* Email — register only */}
          <div style={{
            ...styles.inputGroup,
            maxHeight: isLogin ? "0" : "70px",
            overflow: "hidden",
            opacity: isLogin ? 0 : 1,
            transition: "all 0.4s ease",
            marginBottom: isLogin ? 0 : 20,
          }}>
            <input
              type="email"
              placeholder="Email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              style={styles.input}
              onFocus={(e) => (e.target.style.borderBottomColor = "#2dd4bf")}
              onBlur={(e) => (e.target.style.borderBottomColor = "rgba(255,255,255,0.2)")}
            />
            <span style={styles.inputIcon}>✉️</span>
          </div>

          {/* Password */}
          <div style={styles.inputGroup}>
            <input
              type="password"
              placeholder="Password"
              value={isLogin ? loginPassword : regPassword}
              onChange={(e) => isLogin ? setLoginPassword(e.target.value) : setRegPassword(e.target.value)}
              style={styles.input}
              onFocus={(e) => (e.target.style.borderBottomColor = "#2dd4bf")}
              onBlur={(e) => (e.target.style.borderBottomColor = "rgba(255,255,255,0.2)")}
              onKeyDown={(e) => e.key === "Enter" && (isLogin ? handleLogin() : handleRegister())}
            />
            <span style={styles.inputIcon}>🔒</span>
          </div>

          {error && <p style={styles.error}>⚠️ {error}</p>}
          {success && <p style={styles.successMsg}>✅ {success}</p>}

          <button
            onClick={isLogin ? handleLogin : handleRegister}
            disabled={loading}
            style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
            onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = "#0d9488"; (e.target as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = "#14b8a6"; (e.target as HTMLButtonElement).style.transform = "translateY(0)"; }}
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
          </button>

          <p style={styles.toggleText}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span onClick={toggle} style={styles.toggleLink}>
              {isLogin ? "Sign Up" : "Sign In"}
            </span>
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::placeholder { color: rgba(255,255,255,0.35); }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px #0f2027 inset !important;
          -webkit-text-fill-color: white !important;
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  blob1: {
    position: "absolute", width: 400, height: 400, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(20,184,166,0.15), transparent 70%)",
    top: -100, left: -100, pointerEvents: "none",
  },
  blob2: {
    position: "absolute", width: 350, height: 350, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(20,184,166,0.1), transparent 70%)",
    bottom: -80, right: -80, pointerEvents: "none",
  },
  card: {
    display: "flex", width: 780, minHeight: 480, borderRadius: 16, overflow: "hidden",
    boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(45,212,191,0.15)",
    position: "relative", zIndex: 1,
  },
  welcome: {
    flex: "0 0 320px",
    background: "linear-gradient(145deg, #134e4a, #0f766e, #14b8a6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative", overflow: "hidden",
  },
  diagonal: {
    position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
    background: "rgba(0,0,0,0.15)",
    clipPath: "polygon(0 0, 60% 0, 40% 100%, 0 100%)",
  },
  welcomeContent: { position: "relative", zIndex: 1, textAlign: "center", padding: 30 },
  leaf: { fontSize: 40, marginBottom: 16, display: "block" },
  welcomeTitle: {
    fontFamily: "'Rajdhani', sans-serif", fontSize: 36, fontWeight: 700,
    color: "white", lineHeight: 1.1, whiteSpace: "pre-line", letterSpacing: 2,
    textShadow: "0 2px 20px rgba(0,0,0,0.3)", marginBottom: 16,
  },
  welcomeSubtitle: { color: "rgba(255,255,255,0.75)", fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-line" },
  formPanel: {
    flex: 1, background: "#0d1f2d", padding: "50px 44px",
    display: "flex", flexDirection: "column", justifyContent: "center",
  },
  formTitle: {
    fontFamily: "'Rajdhani', sans-serif", fontSize: 32, fontWeight: 700,
    color: "white", marginBottom: 32, letterSpacing: 1,
  },
  inputGroup: { position: "relative", marginBottom: 20 },
  input: {
    width: "100%", background: "transparent", border: "none",
    borderBottom: "1.5px solid rgba(255,255,255,0.2)",
    padding: "10px 36px 10px 0", color: "white", fontSize: 15, outline: "none",
    transition: "border-color 0.3s", fontFamily: "'DM Sans', sans-serif",
  },
  inputIcon: { position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", fontSize: 16, opacity: 0.6 },
  error: { color: "#f87171", fontSize: 13, marginBottom: 12 },
  successMsg: { color: "#4ade80", fontSize: 13, marginBottom: 12 },
  btn: {
    marginTop: 8, padding: "13px 0", width: "100%", background: "#14b8a6",
    border: "none", borderRadius: 8, color: "white", fontWeight: 700, fontSize: 15,
    cursor: "pointer", letterSpacing: 1, transition: "background 0.3s, transform 0.2s",
    fontFamily: "'Rajdhani', sans-serif",
  },
  toggleText: { marginTop: 20, textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 13 },
  toggleLink: { color: "#2dd4bf", cursor: "pointer", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 },
};