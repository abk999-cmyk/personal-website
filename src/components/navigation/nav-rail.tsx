"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { usePageTransition } from "@/components/layout/page-transition-provider";

export type NavKey = "home" | "experience" | "projects" | "github";

interface NavItem {
  key: NavKey;
  label: string;
  href: string;
  icon: JSX.Element;
}

const navItems: NavItem[] = [
  {
    key: "home",
    label: "Home",
    href: "/",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden>
        <path d="M12 4.5 4.5 10.4v8.1A1.5 1.5 0 0 0 6 20h4.1v-4.6h3.8V20H18a1.5 1.5 0 0 0 1.5-1.5v-8.1z" />
      </svg>
    ),
  },
  {
    key: "experience",
    label: "Experience",
    href: "/experience",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden>
        <path d="M20 6.5h-3v-1a2.5 2.5 0 0 0-2.5-2.5h-5A2.5 2.5 0 0 0 7 5.5v1H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-11a2 2 0 0 0-2-2Zm-11.5-1a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v1h-7v-1ZM20 19.5H4v-11h16v11Z" />
        <path d="M12 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
      </svg>
    ),
  },
  {
    key: "projects",
    label: "Projects",
    href: "/projects",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden>
        <path d="M6.2 5.5h11.6a1.7 1.7 0 0 1 1.7 1.7v9.6a1.7 1.7 0 0 1-1.7 1.7H6.2a1.7 1.7 0 0 1-1.7-1.7V7.2a1.7 1.7 0 0 1 1.7-1.7Zm.3 2V17h11V7.5Z" />
        <path d="M9.2 9.5h5.6a.8.8 0 0 1 0 1.6H9.2a.8.8 0 0 1 0-1.6Zm0 3h5.6a.8.8 0 0 1 0 1.6H9.2a.8.8 0 0 1 0-1.6Z" />
      </svg>
    ),
  },
  {
    key: "github",
    label: "GitHub",
    href: "/github",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden>
        <path d="M12 2.1a9.9 9.9 0 0 0-3.1 19.3c.5.1.7-.2.7-.5v-1.6c-2.6.6-3.1-1.2-3.1-1.2-.4-1.1-.9-1.4-.9-1.4-.8-.6.1-.6.1-.6.9.1 1.3 1 1.3 1 .8 1.3 2.1.9 2.6.7.1-.5.3-.9.5-1.1-2.1-.2-4.3-1-4.3-4.6 0-1 .4-1.9 1-2.6-.1-.3-.4-1.3.1-2.6 0 0 .8-.2 2.7 1a9.3 9.3 0 0 1 4.9 0c1.9-1.2 2.7-1 2.7-1 .5 1.3.2 2.3.1 2.6.7.7 1 1.6 1 2.6 0 3.6-2.2 4.4-4.3 4.6.3.3.6.8.6 1.6v2.4c0 .3.2.6.7.5A9.9 9.9 0 0 0 12 2.1Z" />
      </svg>
    ),
  },
];

export function NavRail({ active }: { active: NavKey }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const { begin } = usePageTransition();

  useEffect(() => {
    setHoverIndex(null);
  }, [active]);

  return (
    <aside className="nav-rail glass-surface">
      <nav>
        <ul className="nav-rail__list">
          {navItems.map((item, index) => (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={active === item.key ? "page" : undefined}
                className={`nav-rail__item ${active === item.key ? "is-active" : ""} ${hoverIndex === index ? "is-hover" : ""}`}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
                onFocus={() => setHoverIndex(index)}
                onBlur={() => setHoverIndex(null)}
                onClick={(event) => {
                  const delayed = begin(item.href);
                  if (delayed) {
                    event.preventDefault();
                  }
                }}
              >
                <span className="nav-rail__icon">{item.icon}</span>
                <span className="nav-rail__label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
