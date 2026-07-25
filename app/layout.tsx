import type { Metadata } from "next";
import "./globals.css";

/**
 * Phase 2.5 typography pass: Inter for all UI text, IBM Plex Mono for HUD
 * labels/timestamps/system status — replacing the previous (unset) Geist
 * font variables that silently fell back to the browser's default serif
 * in a few unstyled spots.
 *
 * Loaded via a standard Google Fonts stylesheet link rather than
 * `next/font/google` — this sandbox's build environment has no outbound
 * network access, and `next/font/google` fetches + self-hosts the font
 * files at BUILD time, which fails hard here with no fallback. A
 * `<link>` tag fetches at the BROWSER's runtime instead, which works
 * identically for the deployed app (Vercel's build environment has full
 * internet access, so `next/font/google` would also work fine there) —
 * this is the safer choice for verifying the build in this environment
 * without losing the actual typography. Swapping to `next/font/google`
 * later is a one-file change if self-hosting the fonts is preferred.
 */
export const metadata: Metadata = {
  title: "JARVIS",
  description: "Personal AI dashboard — Phase 1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- intentional: this IS the root layout (App Router's equivalent of _document.js), see comment above */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
