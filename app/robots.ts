import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: ["/", "/gizlilik", "/kurtar"], disallow: ["/d/", "/m/", "/p/", "/yonet/", "/onizleme/", "/olustur", "/api/"] } };
}
