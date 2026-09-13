"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full border border-line-2 px-5 py-3 font-mono text-[13px] tracking-wide text-text transition-colors hover:border-text print:hidden"
    >
      Print
    </button>
  );
}
