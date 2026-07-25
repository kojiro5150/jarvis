import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // v22 Sprint 5 — the v16 spec's own responsive breakpoints
      // (Section I), added to `extend` so Tailwind's default sm/md/lg/xl/
      // 2xl screens (still used elsewhere in the app) stay intact. Named
      // literally after what they gate so every call site reads as
      // intent, not a magic number.
      //
      // v24 Sprint 6 — the `panels`/`tabs-range` threshold moved from
      // 1366px to 1550px after testing against the actual target device
      // (MacBook Air M4, 1470px logical width): 1366 was too conservative
      // given how dense the centre content is, so 1470 was still landing
      // in the "full 360px column" bucket instead of the collapsed one it
      // actually needs.
      //   - `centre-row`: >=1600px — lower centre modules (Projects/
      //     Calendar/Communications) go three-across; below this they
      //     stack, which is the mobile-first default with no variant
      //     needed.
      //   - `panels`: >=1550px — RH column shows all four cards stacked
      //     in the fixed 360px column (today's layout).
      //   - `tabs-range`: 1200–1549px — RH column collapses to a narrow
      //     ~56px icon strip with a per-tab flyout, instead of always
      //     reserving the full 360px.
      //   - `drawer-range`: <=1199px — RH column hides entirely; a
      //     floating toggle opens the same tabbed content as a slide-in
      //     overlay drawer instead.
      screens: {
        "centre-row": { min: "1600px" },
        panels: { min: "1550px" },
        "tabs-range": { min: "1200px", max: "1549px" },
        "drawer-range": { max: "1199px" },
      },
      colors: {
        void: {
          950: "#050810",
          900: "#070b14",
          800: "#0a0f1c",
          700: "#0e1522",
          600: "#141d2e",
        },
        cyan: {
          glow: "#3fd8ff",
        },
        // Phase 2.7 (v17 spec) exact command-centre tokens — referenced
        // via bg-bg-900, border-stroke-700, etc. where a literal spec hex
        // is wanted alongside the accent system in lib/agents/accent.ts.
        bg: {
          950: "#050A10",
          900: "#080E14",
          850: "#0B1119",
        },
        surface: {
          900: "rgba(10, 18, 28, 0.92)",
          800: "rgba(15, 24, 36, 0.86)",
          700: "rgba(20, 32, 48, 0.72)",
        },
        stroke: {
          900: "rgba(20, 35, 50, 0.9)",
          700: "rgba(30, 52, 74, 0.75)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        hud: "0.18em",
      },
      boxShadow: {
        glow: "0 0 20px rgba(63, 216, 255, 0.35)",
        "glow-lg": "0 0 40px rgba(63, 216, 255, 0.25)",
      },
      keyframes: {
        pulseSlow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.04)" },
        },
        spinSlow: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        spinReverseSlow: {
          from: { transform: "rotate(360deg)" },
          to: { transform: "rotate(0deg)" },
        },
        drift: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        "pulse-slow": "pulseSlow 3.5s ease-in-out infinite",
        "spin-slow": "spinSlow 18s linear infinite",
        "spin-reverse-slow": "spinReverseSlow 24s linear infinite",
        drift: "drift 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
