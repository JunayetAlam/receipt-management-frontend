import type { MetadataRoute } from "next";

// Private business tool: block all crawlers
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
