import type { NextConfig } from "next";

const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const nextConfig: NextConfig = {
  // Proxy handlera logowania Firebase na domenę aplikacji. Dzięki temu authDomain
  // może wskazywać na naszą domenę i signInWithRedirect działa na telefonach
  // (przeglądarki blokują storage innej domeny, np. *.firebaseapp.com).
  async rewrites() {
    if (!firebaseProjectId) return [];
    return [
      {
        source: "/__/auth/:path*",
        destination: `https://${firebaseProjectId}.firebaseapp.com/__/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
