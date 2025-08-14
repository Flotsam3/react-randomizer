import { useCallback, useRef, useState } from "react";

// Schedules highlight add/remove across the list with a given stagger/overlap.
export default function useHighlightSequence({
  stagger = 1.5,
  overlap = 0.4,
} = {}) {
  const [highlighted, setHighlighted] = useState([]);
  const timeoutsRef = useRef([]);

  const cancelHighlights = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setHighlighted([]);
  }, []);

  const runHighlights = useCallback(
    (count) => {
      cancelHighlights();
      for (let i = 0; i < count; i++) {
        const tShow = setTimeout(() => {
          setHighlighted((prev) => [...prev, i]);
          const tHide = setTimeout(() => {
            setHighlighted((prev) => prev.filter((idx) => idx !== i));
          }, Math.max(0, (stagger - overlap) * 1000));
          timeoutsRef.current.push(tHide);
        }, i * stagger * 1000);
        timeoutsRef.current.push(tShow);
      }
    },
    [cancelHighlights, stagger, overlap]
  );

  return { highlighted, runHighlights, cancelHighlights };
}