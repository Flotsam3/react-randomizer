import { useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff } from "lucide-react";

export default function App() {
  const [input, setInput] = useState("Apple\nBanana\nCherry\nDate\nElderberry");
  const [shuffled, setShuffled] = useState([]);
  const [runId, setRunId] = useState(0);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [showInput, setShowInput] = useState(true);

  const STAGGER = 1.5;
  const ANIM_DURATION = 1;
  const HIGHLIGHT_FADE_DELAY = 1;

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
    setHighlightIndex(-1);
    setShuffled([]);

    const shuffledItems = shuffleArray(items);
    setShuffled(shuffledItems);

    shuffledItems.forEach((_, i) => {
      setTimeout(() => {
        setHighlightIndex(i);
      }, i * STAGGER * 1000);
    });

    const lastIndex = shuffledItems.length - 1;
    setTimeout(() => {
      setHighlightIndex(-1);
    }, (lastIndex * STAGGER + HIGHLIGHT_FADE_DELAY) * 1000);
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
      </div>

      {/* Shuffled List */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {shuffled.map((item, i) => {
          const isHighlighted = highlightIndex === i;
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
                // boxShadow: isHighlighted
                //   ? "0 0 10px rgba(255,127,80,0.8)"
                //   : "none",
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
