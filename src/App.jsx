import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff } from "lucide-react";

export default function App() {
  const [input, setInput] = useState("Apple\nBanana\nCherry\nDate\nElderberry");
  const [shuffled, setShuffled] = useState([]);
  const [runId, setRunId] = useState(0);
  const [highlighted, setHighlighted] = useState([]);
  const [showInput, setShowInput] = useState(true);

  const fileInputRef = useRef(null);

  const STAGGER = 1.5;
  const ANIM_DURATION = 1;
  const HIGHLIGHT_OVERLAP = 0.4; // seconds of overlap

  const parseTextToLines = (text) => {
    // Normalize CRLF/CR/LF to LF
    const raw = text.replace(/\r\n?/g, "\n");
    let lines = raw.split("\n");

    // If there are no line breaks but commas, treat as CSV
    if (lines.length === 1 && raw.includes(",")) {
      lines = raw.split(",");
    }

    return lines.map((s) => s.trim()).filter(Boolean);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: basic size guard (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Die Datei ist größer als 5MB.");
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
      setInput(lines.join("\n"));
      setShowInput(true); // Ensure textarea is visible after import
    } catch (err) {
      console.error("Datei lesen fehlgeschlagen:", err);
      alert("Datei lesen fehlgeschlagen.");
    } finally {
      // Allow selecting the same file again later if needed
      e.target.value = "";
    }
  };

  const shuffleArray = (arr) => {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const startRandomizer = () => {
    if (!input.trim()) return;
    const items = input
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    setRunId((id) => id + 1);
    setHighlighted([]);
    setShuffled([]);

    const shuffledItems = shuffleArray(items);
    setShuffled(shuffledItems);

    shuffledItems.forEach((_, i) => {
      setTimeout(() => {
        setHighlighted((prev) => [...prev, i]);
        // Remove this index after overlap time
        setTimeout(() => {
          setHighlighted((prev) => prev.filter((idx) => idx !== i));
        }, (STAGGER - HIGHLIGHT_OVERLAP) * 1000);
      }, i * STAGGER * 1000);
    });
  };

  const copyResult = async () => {
    if (!shuffled.length) return;
    const numbered = shuffled
      .map((item, i) => `${i + 1}. ${item}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(numbered);
      alert("Ergebnis wurde in die Zwischenablage kopiert!");
    } catch (err) {
      console.error("Kopieren fehlgeschlagen:", err);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif",
        padding: "1rem",
      }}
    >
      {/* Title + Eye Icon */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <h1 style={{ margin: "0.5rem 0 1rem" }}>List Randomizer</h1>
        <button
          onClick={() => setShowInput((prev) => !prev)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
          title={showInput ? "Eingabe ausblenden" : "Eingabe einblenden"}
        >
          {showInput ? <EyeOff size={24} /> : <Eye size={24} />}
        </button>
      </div>

      {/* Textarea */}
      {showInput && (
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
          style={{
            display: "block",
            width: "40%",
            margin: "1rem auto",
            padding: "0.5rem",
            fontSize: "1rem",
            borderRadius: "5px",
          }}
        />
      )}

      {/* Hidden file input for imports */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.csv,text/plain,text/csv"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* Buttons */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button
          onClick={startRandomizer}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#35db15",
            color: "white",
            fontSize: "1rem",
            border: "none",
            outline: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Liste Erzeugen
        </button>
        <button
          onClick={copyResult}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#007bff",
            color: "white",
            fontSize: "1rem",
            border: "none",
            outline: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Ergebnis kopieren
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#6c757d",
            color: "white",
            fontSize: "1rem",
            border: "none",
            outline: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Aus Datei importieren
        </button>
      </div>

      {/* Shuffled List */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {shuffled.map((item, i) => {
          const isHighlighted = highlighted.includes(i);
          return (
            <motion.li
              key={`${item}-${i}-${runId}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: isHighlighted ? [1, 1.05, 1] : 1,
              }}
              transition={{
                duration: ANIM_DURATION,
                delay: i * STAGGER,
              }}
              style={{
                marginBottom: "0.5rem",
                fontSize: "1.2rem",
                background: isHighlighted ? "#ff7f50" : "#f4f4f4",
                color: isHighlighted ? "white" : "black",
                padding: "0.5rem",
                borderRadius: "8px",
                transition: "background-color 0.5s ease, color 0.5s ease",
              }}
            >
              {i + 1}. {item}
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}