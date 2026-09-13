import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { profile } from "@/content/profile";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = profile.links.site;
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/research`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/resume`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    ...projects.map((p) => ({
      url: `${base}/work/${p.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: p.featured ? 0.8 : 0.5,
    })),
  ];
}
