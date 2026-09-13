import Link from "next/link";
import { cn } from "@/lib/cn";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "ghost";
  className?: string;
  external?: boolean;
};

export function Button({ href, children, variant = "solid", className, external }: Props) {
  const base =
    "group inline-flex items-center gap-2 rounded-full px-5 py-3 font-mono text-[13px] tracking-wide transition-[transform,background-color,color,border-color] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.98]";
  const styles =
    variant === "solid"
      ? "bg-accent text-accent-ink hover:bg-[#e2ff70]"
      : "border border-line-2 text-text hover:border-text";
  const cls = cn(base, styles, className);
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function Arrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn("h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
