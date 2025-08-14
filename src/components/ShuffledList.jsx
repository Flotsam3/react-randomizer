import { motion } from "motion/react";

export default function ShuffledList({
  items = [],
  highlighted = [],
  runId,
  stagger = 1.5,
  animDuration = 1,
  animate = true,
}) {
  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {items.map((item, i) => {
        const isHighlighted = highlighted.includes(i);
        const baseStyle = {
          marginBottom: "0.5rem",
          fontSize: "1.2rem",
          background: isHighlighted ? "#ff7f50" : "#f4f4f4",
          color: isHighlighted ? "white" : "black",
          padding: "0.5rem",
          borderRadius: "8px",
          transition: "background-color 0.5s ease, color 0.5s ease",
        };

        if (!animate) {
          return (
            <li key={`${item}-${i}-${runId}`} style={baseStyle}>
              {i + 1}. {item}
            </li>
          );
        }

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
              duration: animDuration,
              delay: i * stagger,
            }}
            style={baseStyle}
          >
            {i + 1}. {item}
          </motion.li>
        );
      })}
    </ul>
  );
}