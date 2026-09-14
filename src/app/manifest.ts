import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Peepal Flow Fix Solutions",
    short_name: "Peepal Flow Fix",
    description:
      "Reliable plumbing, electrical and bathroom renovation services across Chennai. 25+ years of experience.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1d76eb",
    icons: [{ src: "/icon.png", sizes: "any", type: "image/png" }],
  };
}
