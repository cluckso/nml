import type { MetadataRoute } from "next"
import { getPublicSitemap } from "@/lib/public-sitemap"

export default function sitemap(): MetadataRoute.Sitemap {
  return getPublicSitemap()
}
