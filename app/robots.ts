import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: ["/", "/gizlilik", "/kurtar", "/etkinlik"], disallow: ["/d/", "/m/", "/p/", "/yonet/", "/onizleme/", "/olustur", "/etkinlik/", "/api/"] } };
}
