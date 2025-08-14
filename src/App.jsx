import { useState } from "react";
import { motion } from "motion/react";

export default function App() {
  const [input, setInput] = useState("Apple\nBanana\nCherry\nDate\nElderberry");
  const [shuffled, setShuffled] = useState([]);
  const [runId, setRunId] = useState(0);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const STAGGER = 1.5; // seconds between items
  const ANIM_DURATION = 1; // seconds per animation
  const HIGHLIGHT_FADE_DELAY = 1; // seconds after highlight before clearing

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
      <h1>List Randomizer</h1>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={6}
        style={{
          display: "block",
          width: "40%",
          margin: "0 auto 1rem",
          padding: "0.5rem",
          fontSize: "1rem",
          borderRadius: "5px",
        }}
      />
      <br />
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
          Liste Mischen
        </button>
        <button
          onClick={copyResult}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#ff7f50",
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
