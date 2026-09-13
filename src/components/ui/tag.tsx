import { cn } from "@/lib/cn";

export function Tag({ children, className, accent = false }: { children: React.ReactNode; className?: string; accent?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[11px] leading-none tracking-wide",
        accent ? "border-accent/40 bg-accent/10 text-accent" : "border-line-2 text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
