
import type { Config } from "tailwindcss";

const config: Config = {
 content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
 theme: {
 extend: {
 colors: {
 brand: {
 50: "hashtag#eefdf6",
 100: "hashtag#d6f9e8",
 200: "hashtag#aff1d2",
 300: "hashtag#7ce4b6",
 400: "hashtag#46d195",
 500: "hashtag#1eb877",
 600: "#129561",
 700: "hashtag#0f7651",
 800: "hashtag#0e5d42",
 900: "hashtag#0c4d38",
 },
 },
 fontFamily: {
 sans: ["Inter", "system-ui", "sans-serif"],
 },
 },
 },
 plugins: [],
};
export default config;

