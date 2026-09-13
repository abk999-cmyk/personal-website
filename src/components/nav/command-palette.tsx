"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Command } from "cmdk";

import { scrollToTarget } from "@/components/providers/smooth-scroll";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { navItems } from "./nav-items";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onToggle = () => setOpen((v) => !v);
    window.addEventListener("keydown", onKey);
    window.addEventListener("palette:toggle", onToggle);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("palette:toggle", onToggle);
    };
  }, []);

  const go = (href: string) => {
    setOpen(false);
    const [path, hash] = href.split("#");
    if (hash && (path === "/" || path === "") && pathname === "/") {
      scrollToTarget(`#${hash}`);
      return;
    }
    if (href.startsWith("http") || href.startsWith("mailto:")) {
      window.open(href, href.startsWith("mailto:") ? "_self" : "_blank", "noopener");
      return;
    }
    router.push(href);
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[14vh]"
      overlayClassName="fixed inset-0 z-[55] bg-ink/70 backdrop-blur-sm"
      contentClassName="w-full max-w-xl overflow-hidden rounded-2xl border border-line-2 bg-surface shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]"
    >
      <div className="flex items-center gap-3 border-b border-line px-4">
        <span className="font-mono text-xs text-accent">›</span>
        <Command.Input
          autoFocus
          placeholder="Jump to a section, project or link…"
          className="h-14 w-full bg-transparent text-base text-text placeholder:text-dim focus:outline-none"
        />
        <kbd className="hidden rounded border border-line-2 px-1.5 py-0.5 font-mono text-[10px] text-muted sm:block">
          esc
        </kbd>
      </div>
      <Command.List className="max-h-[50vh] overflow-y-auto p-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-dim">
        <Command.Empty className="px-3 py-8 text-center text-sm text-muted">Nothing matches.</Command.Empty>

        <Command.Group heading="Sections">
          <Item onSelect={() => go("/")} hint="/">
            Home
          </Item>
          {navItems.map((n) => (
            <Item key={n.href} onSelect={() => go(n.href)} hint={n.href.replace("/#", "#")}>
              {n.label}
            </Item>
          ))}
          <Item onSelect={() => go("/research")} hint="/research">
            Research
          </Item>
          <Item onSelect={() => go("/resume")} hint="/resume">
            Resume
          </Item>
        </Command.Group>

        <Command.Group heading="Work">
          {projects.map((p) => (
            <Item key={p.slug} onSelect={() => go(`/work/${p.slug}`)} hint={p.contextLabel}>
              {p.name}
            </Item>
          ))}
        </Command.Group>

        <Command.Group heading="Elsewhere">
          <Item onSelect={() => go(profile.links.github)} hint="github.com">
            GitHub
          </Item>
          <Item onSelect={() => go(profile.links.linkedin)} hint="linkedin.com">
            LinkedIn
          </Item>
          <Item
            onSelect={() => {
              navigator.clipboard?.writeText(profile.email);
              setOpen(false);
            }}
            hint="copy"
          >
            Copy email
          </Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}

function Item({ children, onSelect, hint }: { children: React.ReactNode; onSelect: () => void; hint?: string }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm text-text data-[selected=true]:bg-accent data-[selected=true]:text-accent-ink"
    >
      <span>{children}</span>
      {hint ? <span className="font-mono text-[11px] opacity-60">{hint}</span> : null}
    </Command.Item>
  );
}
