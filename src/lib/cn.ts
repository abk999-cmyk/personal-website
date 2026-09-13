/** Tiny className joiner. Avoids pulling in clsx for a handful of call sites. */
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
