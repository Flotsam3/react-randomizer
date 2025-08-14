import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff } from "lucide-react";

// Film-style countdown (3-2-1) using motion/react
function Countdown({
   from = 3,
   stepDuration = 1, // seconds per tick
   size = 160,
   strokeWidth = 8,
   onComplete,
}) {
   const [num, setNum] = useState(from);
   const timersRef = useRef([]);

   const r = (size - strokeWidth) / 2;
   const cx = size / 2;
   const cy = size / 2;
   const C = 2 * Math.PI * r;

   useEffect(() => {
      // Clear any previous timers
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];

      // Schedule ticks: from, from-1, ..., 1
      for (let i = 0; i < from; i++) {
         timersRef.current.push(
            setTimeout(() => {
               setNum(from - i);
            }, i * stepDuration * 1000)
         );
      }
      // Complete after the last step
      timersRef.current.push(
         setTimeout(() => {
            onComplete?.();
         }, from * stepDuration * 1000)
      );

      return () => {
         timersRef.current.forEach(clearTimeout);
      };
   }, [from, stepDuration, onComplete]);

   return (
      <div
         style={{
            width: size,
            height: size,
            margin: "0.5rem auto 1rem",
            position: "relative",
         }}
      >
         {/* Background circle */}
         <svg width={size} height={size} style={{ display: "block" }}>
            <circle cx={cx} cy={cy} r={r} fill="#f8f8f8" stroke="#ddd" strokeWidth={strokeWidth} />
            {/* Crosshair lines for film look */}
            <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#e5e5e5" strokeWidth="2" />
            <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#e5e5e5" strokeWidth="2" />
            {/* Animated progress ring - re-runs each step via key */}
            <motion.circle
               key={`ring-${num}`}
               cx={cx}
               cy={cy}
               r={r}
               fill="none"
               stroke="#ff7f50"
               strokeWidth={strokeWidth}
               strokeDasharray={C}
               strokeDashoffset={C}
               initial={{ strokeDashoffset: C }}
               animate={{ strokeDashoffset: 0 }}
               transition={{ duration: stepDuration * 0.92, ease: "easeInOut" }}
               style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.06))" }}
            />
         </svg>

         {/* Big number */}
         <motion.div
            key={`num-${num}`}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{
               position: "absolute",
               inset: 0,
               display: "grid",
               placeItems: "center",
               fontSize: size * 0.45,
               fontWeight: 700,
               color: "#333",
               userSelect: "none",
            }}
         >
            {num}
         </motion.div>
      </div>
   );
}

export default function App() {
   const [input, setInput] = useState("Apple\nBanana\nCherry\nDate\nElderberry");
   const [shuffled, setShuffled] = useState([]);
   const [runId, setRunId] = useState(0);
   const [highlighted, setHighlighted] = useState([]);
   const [showInput, setShowInput] = useState(true);
   const [isCounting, setIsCounting] = useState(false);

   const nextShuffledRef = useRef([]);
   const timeoutsRef = useRef([]);
   const fileInputRef = useRef(null);

   const STAGGER = 1.5;
   const ANIM_DURATION = 1;
   const HIGHLIGHT_OVERLAP = 0.4; // seconds of overlap

   const parseTextToLines = (text) => {
      const raw = text.replace(/\r\n?/g, "\n");
      let lines = raw.split("\n");
      if (lines.length === 1 && raw.includes(",")) lines = raw.split(",");
      return lines.map((s) => s.trim()).filter(Boolean);
   };

   const handleFileChange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
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
         setShowInput(true);
      } catch (err) {
         console.error("Datei lesen fehlgeschlagen:", err);
         alert("Datei lesen fehlgeschlagen.");
      } finally {
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

   const clearAllTimers = () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
   };

   const startRandomizer = () => {
      if (!input.trim()) return;

      const items = input
         .split("\n")
         .map((item) => item.trim())
         .filter(Boolean);

      // Prep next run
      clearAllTimers();
      setHighlighted([]);
      setShuffled([]); // hide list until countdown completes

      // Store shuffled items to reveal after countdown
      nextShuffledRef.current = shuffleArray(items);

      // Kick off film-style countdown
      setIsCounting(true);
   };

   const onCountdownComplete = () => {
      setIsCounting(false);
      const shuffledItems = nextShuffledRef.current || [];
      setRunId((id) => id + 1);
      setShuffled(shuffledItems);

      // Schedule highlight animations
      shuffledItems.forEach((_, i) => {
         const tShow = setTimeout(() => {
            setHighlighted((prev) => [...prev, i]);
            const tHide = setTimeout(() => {
               setHighlighted((prev) => prev.filter((idx) => idx !== i));
            }, (STAGGER - HIGHLIGHT_OVERLAP) * 1000);
            timeoutsRef.current.push(tHide);
         }, i * STAGGER * 1000);
         timeoutsRef.current.push(tShow);
      });
   };

   useEffect(() => {
      return () => clearAllTimers(); // cleanup on unmount
   }, []);

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

            {/* Import file */}
            <input
               ref={fileInputRef}
               type="file"
               accept=".txt,.csv,text/plain,text/csv"
               onChange={handleFileChange}
               style={{ display: "none" }}
            />
            <button
               onClick={() => fileInputRef.current?.click()}
               disabled={isCounting}
               style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#6c757d",
                  color: "white",
                  fontSize: "1rem",
                  border: "none",
                  outline: "none",
                  borderRadius: "5px",
                  cursor: isCounting ? "not-allowed" : "pointer",
                  opacity: isCounting ? 0.6 : 1,
               }}
            >
               Aus Datei importieren
            </button>
         </div>

         {/* Countdown appears beneath the textarea and directly above the list */}
         {isCounting && <Countdown from={3} stepDuration={1} onComplete={onCountdownComplete} />}

         {/* Shuffled List */}
         {!isCounting && (
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
         )}
      </div>
   );
}
