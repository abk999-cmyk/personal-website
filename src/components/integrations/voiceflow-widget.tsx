"use client";

import { useEffect } from "react";

const SCRIPT_ID = "voiceflow-chat-widget";
const SRC = "https://cdn.voiceflow.com/widget-next/bundle.mjs";

declare global {
  interface Window {
    voiceflow?: { chat?: { load: (config: unknown) => void } };
  }
}

const config = {
  verify: { projectID: "68d87a2fd1409c6c304565e6" },
  url: "https://general-runtime.voiceflow.com",
  versionID: "production",
  voice: { url: "https://runtime-api.voiceflow.com" },
};

let started = false;

/** Voiceflow chat, loaded after the page is idle so it never competes with the hero. */
export function VoiceflowWidget() {
  useEffect(() => {
    // Module-level guard: StrictMode double-invokes effects before the idle callback fires,
    // and the DOM id check alone would let two scripts through.
    if (started) return;
    started = true;
    const load = () => window.voiceflow?.chat?.load(config);
    if (document.getElementById(SCRIPT_ID)) return load();
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.src = SRC;
    s.type = "text/javascript";
    s.async = true;
    s.onload = load;
    let done = false;
    const start = () => {
      if (done) return;
      done = true;
      cleanup();
      document.body.appendChild(s);
    };
    const events: (keyof WindowEventMap)[] = ["pointerdown", "keydown", "scroll", "touchstart"];
    const timer = window.setTimeout(start, 8000);
    const cleanup = () => {
      window.clearTimeout(timer);
      for (const ev of events) window.removeEventListener(ev, start);
    };
    for (const ev of events) window.addEventListener(ev, start, { once: true, passive: true });
  }, []);
  return null;
}
