import type { MetadataRoute } from "next";
import { getLocations } from "@/lib/queries";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://retrobarbershop.ro";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locations = await getLocations().catch(() => []);
  const now = new Date();

  const routes = ["", "/rezervare", "/servicii", "/abonamente", "/echipa", "/locatii", "/despre", "/contact"];

  return [
    ...routes.map((r) => ({
      url: `${base}${r}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: r === "" ? 1 : r === "/rezervare" ? 0.9 : 0.7,
    })),
    ...locations.map((l) => ({
      url: `${base}/locatii/${l.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
