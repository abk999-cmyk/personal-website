import type { ComponentType } from "react";

/** Long-form case studies (MDX). Projects without an entry render their blurb only. */
export const studies: Record<string, () => Promise<{ default: ComponentType }>> = {
  battleship: () => import("./battleship.mdx"),
  dyndega: () => import("./dyndega.mdx"),
  "mainehealth-scheduler": () => import("./mainehealth-scheduler.mdx"),
  "7d-connect": () => import("./7d-connect.mdx"),
};
