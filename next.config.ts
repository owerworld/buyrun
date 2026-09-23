import type { NextConfig } from "next";

const privatePaths = ["/d/:path*", "/g/:path*", "/m/:path*", "/p/:path*", "/yonet/:path*", "/onizleme/:path*", "/etkinlik/:path+"];

const nextConfig: NextConfig = {
  serverExternalPackages: ["@electric-sql/pglite"],
  // Link önizleme posterinin yazı tipleri sunucu paketine dahil edilsin
  outputFileTracingIncludes: { "/**": ["./assets/fonts/*.ttf"] },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      // Kişisel linkler arama motorlarında asla görünmez
      ...privatePaths.map((source) => ({
        source,
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      })),
    ];
  },
};

export default nextConfig;
