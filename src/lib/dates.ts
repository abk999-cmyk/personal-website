const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-06" -> "Jun 2026"; "present" -> "Now". */
export function fmtMonth(ym: string) {
  if (ym === "present") return "Now";
  const [y, m] = ym.split("-").map(Number);
  return `${MONTHS[(m ?? 1) - 1]} ${y}`;
}

export function fmtRange(start: string, end: string) {
  return `${fmtMonth(start)} — ${fmtMonth(end)}`;
}
