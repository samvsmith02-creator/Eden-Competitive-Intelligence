import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!origin) return [];
  return ["", "/about", "/services", "/industries", "/insights", "/contact", "/privacy"].map(path => ({ url: `${origin}${path}` }));
}
