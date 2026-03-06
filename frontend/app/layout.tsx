import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "FarmAI",
  description: "Smart Fertilizer Optimization System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0f172a", color: "white" }}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}