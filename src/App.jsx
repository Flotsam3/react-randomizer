import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Countdown from "./components/Countdown";
import ShuffledList from "./components/ShuffledList";
import FileImportButton from "./components/FileImportButton";
import useHighlightSequence from "./hooks/useHighlightSequence";
import { shuffleArray } from "./utils/shuffle";
import { parseTextToLines } from "./utils/parse";
import { STAGGER, ANIM_DURATION, HIGHLIGHT_OVERLAP } from "./constants";

export default function App() {
  const [input, setInput] = useState("Apple\nBanana\nCherry\nDate\nElderberry");
  const [shuffled, setShuffled] = useState([]);
  const [runId, setRunId] = useState(0);
  const [showInput, setShowInput] = useState(true);
  const [isCounting, setIsCounting] = useState(false);

  const nextShuffledRef = useRef([]);

  const { highlighted, runHighlights, cancelHighlights } = useHighlightSequence({
    stagger: STAGGER,
    overlap: HIGHLIGHT_OVERLAP,
  });

  const startRandomizer = () => {
    const items = parseTextToLines(input);
    if (!items.length) return;

    cancelHighlights();
    setShuffled([]);           // hide list during countdown
    nextShuffledRef.current = shuffleArray(items);
    setIsCounting(true);       // show countdown
  };

  const onCountdownComplete = () => {
    setIsCounting(false);
    const items = nextShuffledRef.current || [];
    setRunId((id) => id + 1);
    setShuffled(items);
    runHighlights(items.length);
  };

  useEffect(() => () => cancelHighlights(), [cancelHighlights]); // cleanup

  const copyResult = async () => {
    if (!shuffled.length || isCounting) return;
    const numbered = shuffled.map((item, i) => `${i + 1}. ${item}`).join("\n");
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
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <button
          onClick={startRandomizer}
          disabled={isCounting}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#35db15",
            color: "white",
            fontSize: "1rem",
            border: "none",
            outline: "none",
            borderRadius: "5px",
            cursor: isCounting ? "not-allowed" : "pointer",
            opacity: isCounting ? 0.6 : 1,
          }}
        >
          Liste Erzeugen
        </button>
        <button
          onClick={copyResult}
          disabled={isCounting || !shuffled.length}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#007bff",
            color: "white",
            fontSize: "1rem",
            border: "none",
            outline: "none",
            borderRadius: "5px",
            cursor: isCounting || !shuffled.length ? "not-allowed" : "pointer",
            opacity: isCounting || !shuffled.length ? 0.6 : 1,
          }}
        >
          Ergebnis kopieren
        </button>

        <FileImportButton
          disabled={isCounting}
          onImport={(lines) => {
            setInput(lines.join("\n"));
            setShowInput(true);
          }}
        />
      </div>

      {/* Countdown under textarea and above list */}
      {isCounting && (
        <Countdown from={3} stepDuration={1} onComplete={onCountdownComplete} />
      )}

      {/* Shuffled List */}
      {!isCounting && (
        <ShuffledList
          items={shuffled}
          highlighted={highlighted}
          runId={runId}
          stagger={STAGGER}
          animDuration={ANIM_DURATION}
        />
      )}
    </div>
  );
}