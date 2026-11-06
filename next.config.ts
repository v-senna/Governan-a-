import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Cabeçalhos de Segurança ────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Previne clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Previne MIME-type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Força HTTPS (HSTS)
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Controle de referrer
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissões de API do browser
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // Content Security Policy
          // Permite: scripts do próprio site + eval para React dev mode
          // Em produção, remover 'unsafe-eval'
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval necessário para Next.js dev
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob:",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },

  // ─── Configurações de Performance ────────────────────────────────────────
  compress: true,
  poweredByHeader: false, // Remove "X-Powered-By: Next.js" header

  // ─── TypeScript Estrito ───────────────────────────────────────────────────
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
