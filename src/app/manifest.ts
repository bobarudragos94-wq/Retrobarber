import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Retro Barbershop",
    short_name: "Retro",
    description:
      "Rezervă la Retro Barbershop în două clicuri. Frizerul, locația și ora ta preferată, memorate.",
    id: "/",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0b",
    theme_color: "#0a0a0b",
    lang: "ro",
    dir: "ltr",
    categories: ["lifestyle", "business"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Rezervare rapidă", short_name: "Rezervă", url: "/rezervare?quick=1" },
      { name: "Oferte de azi", short_name: "Last minute", url: "/last-minute" },
      { name: "Abonamente", short_name: "Abonament", url: "/abonamente" },
    ],
  };
}
