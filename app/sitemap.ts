import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: site.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/portfolio`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/reviews`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${site.url}/team`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];
}
