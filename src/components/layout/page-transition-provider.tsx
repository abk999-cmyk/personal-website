"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const TRANSITION_DURATION = 520;

type TransitionState = "idle" | "leaving" | "entering";

type TransitionContextValue = {
  begin: (href: string) => boolean;
  state: TransitionState;
};

const PageTransitionContext = createContext<TransitionContextValue>({
  begin: () => false,
  state: "idle",
});

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<TransitionState>("entering");
  const pendingHref = useRef<string | null>(null);

  useEffect(() => {
    if (state !== "leaving" || !pendingHref.current) {
      return;
    }

    const timeout = window.setTimeout(() => {
      const nextHref = pendingHref.current;
      pendingHref.current = null;
      if (nextHref) {
        router.push(nextHref);
      }
    }, Math.round(TRANSITION_DURATION * 0.6));

    return () => window.clearTimeout(timeout);
  }, [router, state]);

  useEffect(() => {
    setState("entering");
    const timeout = window.setTimeout(() => {
      setState("idle");
    }, TRANSITION_DURATION);

    return () => window.clearTimeout(timeout);
  }, [pathname]);

  const begin = (href: string) => {
    if (href === pathname || state === "leaving") {
      return false;
    }

    pendingHref.current = href;
    setState("leaving");
    return true;
  };

  return (
    <PageTransitionContext.Provider value={{ begin, state }}>
      <div className={`page-shell page-shell--${state}`}>{children}</div>
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  return useContext(PageTransitionContext);
}
