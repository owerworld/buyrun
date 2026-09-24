import type { NextConfig } from "next";

const privatePaths = ["/uygulama", "/uygulama/:path*", "/d/:path*", "/g/:path*", "/m/:path*", "/p/:path*", "/yonet/:path*", "/onizleme/:path*", "/etkinlik/:path+"];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", ...(process.env.NEXT_PUBLIC_SITE_URL ? [new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname] : [])],
  serverExternalPackages: ["@electric-sql/pglite"],
  // Link önizleme posterinin yazı tipleri sunucu paketine dahil edilsin
  outputFileTracingIncludes: { "/**": ["./assets/fonts/*.ttf"] },
  poweredByHeader: false,
  // Mobil uygulamanın web önizlemesi (public/uygulama, expo export çıktısı).
  // Dosya olmayan her adres uygulamanın kendisine gider; yönlendirmeyi uygulama yapar.
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        { source: "/uygulama", destination: "/uygulama/index.html" },
        { source: "/uygulama/:path*", destination: "/uygulama/index.html" },
      ],
    };
  },
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
      // Kapak fotoğrafları değişmez; dosya adı değişirse yeni fotoğraf demektir
      { source: "/foto/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, s-maxage=31536000" }] },
      // Kişisel linkler arama motorlarında asla görünmez
      ...privatePaths.map((source) => ({
        source,
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      })),
    ];
  },
};

export default nextConfig;
