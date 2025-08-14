import { useState } from "react";
import { Settings, X } from "lucide-react";
import { DEFAULT_STAGGER, DEFAULT_ANIM_DURATION } from "../constants";

export default function SettingsButton({
  stagger,
  setStagger,
  animDuration,
  setAnimDuration,
  animationsEnabled,
  setAnimationsEnabled,
  countdownEnabled,
  setCountdownEnabled,
}) {
  const [open, setOpen] = useState(false);

  const handleStaggerChange = (e) => {
    const val = parseFloat(e.target.value);
    setStagger(Number.isFinite(val) ? Math.max(0, val) : 0);
  };

  const handleAnimDurationChange = (e) => {
    const val = parseFloat(e.target.value);
    setAnimDuration(Number.isFinite(val) ? Math.max(0, val) : 0);
  };

  const resetDefaults = () => {
    setStagger(DEFAULT_STAGGER);
    setAnimDuration(DEFAULT_ANIM_DURATION);
    setAnimationsEnabled(true);
    setCountdownEnabled(true);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Einstellungen"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 6,
          borderRadius: 6,
        }}
      >
        <Settings size={22} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "2.25rem",
            right: 0,
            width: 260,
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            padding: "0.75rem",
            zIndex: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
            }}
          >
            <strong style={{ fontSize: 14 }}>Einstellungen</strong>
            <button
              onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
              title="Schließen"
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ display: "grid", gap: "0.5rem" }}>
            <label style={{ display: "grid", gap: 4, fontSize: 13 }}>
              Stagger (Sekunden)
              <input
                type="number"
                min="0"
                step="0.1"
                value={stagger}
                onChange={handleStaggerChange}
                style={{
                  width: "100%",
                  padding: "0.4rem 0.5rem",
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: 4, fontSize: 13 }}>
              Animationsdauer (Sekunden)
              <input
                type="number"
                min="0"
                step="0.1"
                value={animDuration}
                onChange={handleAnimDurationChange}
                style={{
                  width: "100%",
                  padding: "0.4rem 0.5rem",
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                }}
              />
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={!countdownEnabled}
                onChange={(e) => setCountdownEnabled(!e.target.checked)}
                disabled={!animationsEnabled}
              />
              Countdown deaktivieren
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={!animationsEnabled}
                onChange={(e) => setAnimationsEnabled(!e.target.checked)}
              />
              Animationen deaktivieren
            </label>

            <button
              onClick={resetDefaults}
              style={{
                marginTop: 4,
                padding: "0.4rem 0.6rem",
                fontSize: 13,
                background: "#f3f4f6",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Auf Standard zurücksetzen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}