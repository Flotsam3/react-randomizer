import { useRef } from "react";
import { parseTextToLines } from "../utils/parse";

export default function FileImportButton({
  onImport,              // (lines: string[]) => void
  disabled = false,
  label = "Aus Datei importieren",
  maxSizeMB = 5,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`Die Datei ist größer als ${maxSizeMB}MB.`);
      e.target.value = "";
      return;
    }

    try {
      const text = await file.text();
      const lines = parseTextToLines(text);
      if (!lines.length) {
        alert("Keine Einträge in der Datei gefunden.");
        return;
      }
      onImport?.(lines);
    } catch (err) {
      console.error("Datei lesen fehlgeschlagen:", err);
      alert("Datei lesen fehlgeschlagen.");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.csv,text/plain,text/csv"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#6c757d",
          color: "white",
          fontSize: "1rem",
          border: "none",
          outline: "none",
          borderRadius: "5px",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {label}
      </button>
    </>
  );
}