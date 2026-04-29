import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  distDir: ".next",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/api/health",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // ============================================
      // Phase 6: Legacy Route Redirects to Subdomains
      // ============================================

      // Broker → Tenant Website (subdomain)
      // /broker/* → tenant.localhost:3002/*
      {
        source: "/broker",
        destination: "/",
        permanent: true,
      },
      {
        source: "/broker/:path*",
        destination: "/:path*",
        permanent: true,
      },

      // Old redirects (keep for compatibility)
      { source: "/admin", destination: "/backoffice", permanent: true },
      { source: "/admin/:path*", destination: "/backoffice/:path*", permanent: true },
      { source: "/api/admin/:path*", destination: "/api/backoffice/:path*", permanent: true },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        // ============================================
        // Phase 3: Portal Subdomain Rewrites
        // portal.dupoin.localhost:3002/* → /portal/*
        // ============================================
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "portal.(?<tenant>[^.]+).localhost:3002",
            },
          ],
          destination: "/portal/:path*",
        },

        // ============================================
        // Phase 4: CRM Subdomain Rewrites
        // crm.dupoin.localhost:3002/* → /crm/*
        // ============================================
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "crm.(?<tenant>[^.]+).localhost:3002",
            },
          ],
          destination: "/crm/:path*",
        },

        // ============================================
        // Phase 5: Platform Subdomain Rewrites
        // ============================================
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "console.localhost:3002",
            },
          ],
          destination: "/console/:path*",
        },
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "backoffice.localhost:3002",
            },
          ],
          destination: "/backoffice/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
