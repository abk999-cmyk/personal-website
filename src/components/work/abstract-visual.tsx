/**
 * "Contract intelligence" abstract for the State Street tile: redacted document
 * lines with a scanning highlight. Pure CSS, no client JS.
 */
export function ContractVisual() {
  const rows = [82, 64, 91, 58, 77, 40, 88, 70, 52, 84, 61, 45];
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="grid-bg absolute inset-0 opacity-20" />
      <div className="absolute inset-x-8 top-7 flex flex-col gap-[9px]">
        {rows.map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-[6px] w-4 rounded-sm bg-line-2/70" />
            <span
              className={`h-[6px] rounded-sm ${i === 5 ? "bg-accent/90 shadow-[0_0_14px_rgba(212,255,58,0.35)]" : "bg-line-2"}`}
              style={{ width: `${w}%` }}
            />
          </div>
        ))}
      </div>
      <div className="contract-scan pointer-events-none absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-accent/10 to-transparent" />
      <div className="absolute bottom-4 left-5 font-mono text-[10px] uppercase tracking-widest text-dim">
        clause 14.2 · <span className="text-accent">extracted</span> · confidence 0.97
      </div>
    </div>
  );
}
