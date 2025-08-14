import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

// Film-style circular countdown (3-2-1)
export default function Countdown({
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
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    for (let i = 0; i < from; i++) {
      timersRef.current.push(
        setTimeout(() => {
          setNum(from - i);
        }, i * stepDuration * 1000)
      );
    }
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
      <svg width={size} height={size} style={{ display: "block" }}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="#f8f8f8"
          stroke="#ddd"
          strokeWidth={strokeWidth}
        />
        <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#e5e5e5" strokeWidth="2" />
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#e5e5e5" strokeWidth="2" />
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