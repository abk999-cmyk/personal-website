"use client";

import { useEffect } from "react";

const SCRIPT_ID = "voiceflow-chat-widget";
const VOICEFLOW_WIDGET_SRC = "https://cdn.voiceflow.com/widget-next/bundle.mjs";

declare global {
  interface Window {
    voiceflow?: {
      chat?: {
        load: (config: unknown) => void;
      };
    };
  }
}

const config = {
  verify: { projectID: "68d87a2fd1409c6c304565e6" },
  url: "https://general-runtime.voiceflow.com",
  versionID: "production",
  voice: {
    url: "https://runtime-api.voiceflow.com",
  },
};

export function VoiceflowWidget() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const loadWidget = () => {
      if (window.voiceflow?.chat?.load) {
        window.voiceflow.chat.load(config);
      }
    };

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      loadWidget();
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.type = "text/javascript";
    script.src = VOICEFLOW_WIDGET_SRC;
    script.async = true;
    script.onload = loadWidget;

    const target = document.getElementsByTagName("script")[0];
    if (target?.parentNode) {
      target.parentNode.insertBefore(script, target);
      return;
    }

    document.body.appendChild(script);
  }, []);

  return null;
}

