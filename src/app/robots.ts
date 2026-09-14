import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/business";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/field", "/api", "/quote/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
