/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{ts,tsx,js,jsx}", "./components/**/*.{ts,tsx,js,jsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        base: "#FBF7F0",
        "base-dark": "#0F1110",
        card: "#FFFFFF",
        "card-dark": "#1F2321",
        line: "#E4F1EC",
        "line-dark": "#2B2F2C",
        ink: "#1E1B16",
        "ink-dark": "#F5F1EA",
        muted: "#6B6257",
        "muted-dark": "#A79B8B",
        primary: "#0E6B5B",
        "primary-dark": "#2C8C7A",
        accent: "#E4F1EC",
        "accent-dark": "#1F2E2A",
        "accent-ink": "#1F6C55",
        "accent-ink-dark": "#8DDAC6",
      },
    },
  },
  plugins: [],
};
