export function parseTextToLines(text) {
  const raw = text.replace(/\r\n?/g, "\n");
  let lines = raw.split("\n");

  // If there are no newlines but commas, treat as CSV
  if (lines.length === 1 && raw.includes(",")) {
    lines = raw.split(",");
  }

  return lines.map((s) => s.trim()).filter(Boolean);
}