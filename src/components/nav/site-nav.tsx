"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/cn";
import { scrollToTarget } from "@/components/providers/smooth-scroll";
import { navItems } from "./nav-items";

export function SiteNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  // The menu is "open for a given path"; a route change closes it without an effect.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const setOpen = (v: boolean) => setOpenAt(v ? pathname : null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    const id = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const onAnchor = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const hash = href.split("#")[1];
    if (pathname === "/" && hash) {
      e.preventDefault();
      scrollToTarget(`#${hash}`);
      setOpen(false);
    }
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
          scrolled || open ? "border-b border-line bg-ink/75 backdrop-blur-md" : "border-b border-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 md:px-10 lg:px-16">
          <Link href="/" className="font-mono text-sm tracking-wider text-text" aria-label="Home">
            <span className="text-accent">▮</span> ABHINAV.APP
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => onAnchor(e, item.href)}
                className="link-underline font-mono text-[13px] tracking-wide text-muted transition-colors hover:text-text"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/resume"
              className="rounded-full border border-line-2 px-4 py-1.5 font-mono text-[13px] tracking-wide text-text transition-colors hover:border-text"
            >
              Resume
            </Link>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("palette:toggle"))}
              className="rounded-full border border-line-2 px-3 py-1.5 font-mono text-[12px] text-muted transition-colors hover:border-text hover:text-text"
              aria-label="Open command palette"
            >
              ⌘K
            </button>
          </nav>

          <button
            type="button"
            className="md:hidden rounded-full border border-line-2 px-4 py-1.5 font-mono text-[13px]"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col justify-end bg-ink/95 px-6 pb-12 pt-24 backdrop-blur-md md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <nav className="flex flex-col gap-2" aria-label="Mobile">
              {[...navItems, { label: "Resume", href: "/resume" }].map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={item.href}
                    onClick={(e) => onAnchor(e, item.href)}
                    className="display block py-2 text-5xl text-text"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
