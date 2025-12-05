import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>✅ Smartronica M&M - Juego activo</h1>

      <p style={styles.subtitle}>
        El juego está cargando correctamente en Vercel.
      </p>

      <button style={styles.button} onClick={() => alert("Juego iniciado ✅")}>
        Iniciar juego
      </button>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "radial-gradient(circle, #020024 0%, #090979 35%, #000 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    textAlign: "center",
    padding: "20px",
  },
  title: {
    fontSize: "32px",
    marginBottom: "20px",
  },
  subtitle: {
    fontSize: "18px",
    marginBottom: "30px",
    opacity: 0.8,
  },
  button: {
    fontSize: "20px",
    padding: "15px 30px",
    borderRadius: "12px",
    border: "none",
    background: "#00ff88",
    color: "#000",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
