import type { Config } from "tailwindcss";
const { nextui } = require("@nextui-org/react");

const config: Config = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			boxShadow: {
				"LE": "0 0 10px 10px rgb(var(--accent-500) / 0.1), 0 0 10px 12px rgb(var(--accent-500) / 0.15)",
			},
			fontFamily: {
				flag: ["var(--flag)", "sans-serif"],
			},
			gridTemplateRows: {
				matches: "repeat(3, minmax(0, 64px))",
			},
			keyframes: {
				popup: {
					"0%": { scale: "0.5", opacity: "0" },
					"100%": { scale: "1", opacity: "1" },
				},
				overlay: {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" },
				},
				lefttoright: {
					"0%": { transform: "translateX(-100%)", opacity: "0" },
					"50%": { opacity: "0" },
					"100%": { transform: "translateX(0)", opacity: "1" },
				},
				righttoleft: {
					"0%": { transform: "translateX(0%)", opacity: "1" },
					"50%": { opacity: "0" },
					"100%": { transform: "translateX(-100%)", opacity: "0" },
				},
				slow_fadein: {
					"0%": { opacity: "0" },
					"75": { opacity: "0" },
					"100%": { opacity: "1" },
				},
			},
			animation: {
				popup: "popup 0.1s ease-in-out",
				overlay: "overlay 0.5s ease-in-out",
				overlayfast: "overlay 0.125s ease-in-out",
				lefttoright: "lefttoright 0.25s ease-in-out",
				righttoleft: "righttoleft 0.25s ease-in-out",
				slow_fadein: "slow_fadein 0.5s",
			},
			colors: {
				background: {
					DEFAULT: "rgb(var(--background-default) /  var(--tw-bg-opacity)) ",
					100: "rgb(var(--background-100) /  var(--tw-bg-opacity)) ",
					200: "rgb(var(--background-200) /  var(--tw-bg-opacity)) ",
					300: "rgb(var(--background-300) /  var(--tw-bg-opacity)) ",
					400: "rgb(var(--background-400) /  var(--tw-bg-opacity)) ",
					500: "rgb(var(--background-500) /  var(--tw-bg-opacity)) ",
					600: "rgb(var(--background-600) /  var(--tw-bg-opacity)) ",
					700: "rgb(var(--background-700) /  var(--tw-bg-opacity)) ",
					800: "rgb(var(--background-800) /  var(--tw-bg-opacity)) ",
					900: "rgb(var(--background-900) /  var(--tw-bg-opacity)) ",
				},
				card: {
					DEFAULT: "rgb(var(--card-default) /  var(--tw-bg-opacity)) ",
					100: "rgb(var(--card-100) /  var(--tw-bg-opacity)) ",
					200: "rgb(var(--card-200) /  var(--tw-bg-opacity)) ",
					250: "rgb(var(--card-250) /  var(--tw-bg-opacity)) ",
					275: "rgb(var(--card-275) /  var(--tw-bg-opacity)) ",
					300: "rgb(var(--card-300) /  var(--tw-bg-opacity)) ",
					400: "rgb(var(--card-400) /  var(--tw-bg-opacity)) ",
					500: "rgb(var(--card-500) /  var(--tw-bg-opacity)) ",
					600: "rgb(var(--card-600) /  var(--tw-bg-opacity)) ",
					700: "rgb(var(--card-700) /  var(--tw-bg-opacity)) ",
					800: "rgb(var(--card-800) /  var(--tw-bg-opacity)) ",
					900: "rgb(var(--card-900) /  var(--tw-bg-opacity)) ",
				},
				accent: {
					DEFAULT: "rgb(var(--accent-default) /  var(--tw-bg-opacity)) ",
					100: "rgb(var(--accent-100) /  var(--tw-bg-opacity)) ",
					200: "rgb(var(--accent-200) /  var(--tw-bg-opacity)) ",
					300: "rgb(var(--accent-300) /  var(--tw-bg-opacity)) ",
					400: "rgb(var(--accent-400) /  var(--tw-bg-opacity)) ",
					500: "rgb(var(--accent-500) /  var(--tw-bg-opacity)) ",
					600: "rgb(var(--accent-600) /  var(--tw-bg-opacity)) ",
					700: "rgb(var(--accent-700) /  var(--tw-bg-opacity)) ",
					800: "rgb(var(--accent-800) /  var(--tw-bg-opacity)) ",
					900: "rgb(var(--accent-900) /  var(--tw-bg-opacity)) ",
				},
				primary: {
					DEFAULT: "rgb(var(--primary-default) /  var(--tw-bg-opacity)) ",
					100: "rgb(var(--primary-100) /  var(--tw-bg-opacity)) ",
					200: "rgb(var(--primary-200) /  var(--tw-bg-opacity)) ",
					300: "rgb(var(--primary-300) /  var(--tw-bg-opacity)) ",
					400: "rgb(var(--primary-400) /  var(--tw-bg-opacity)) ",
					500: "rgb(var(--primary-500) /  var(--tw-bg-opacity)) ",
					600: "rgb(var(--primary-600) /  var(--tw-bg-opacity)) ",
					700: "rgb(var(--primary-700) /  var(--tw-bg-opacity)) ",
					800: "rgb(var(--primary-800) /  var(--tw-bg-opacity)) ",
					900: "rgb(var(--primary-900) /  var(--tw-bg-opacity)) ",
				},
				secondary: {
					DEFAULT: "rgb(var(--secondary-default) /  var(--tw-bg-opacity)) ",
					100: "rgb(var(--secondary-100) /  var(--tw-bg-opacity)) ",
					200: "rgb(var(--secondary-200) /  var(--tw-bg-opacity)) ",
					300: "rgb(var(--secondary-300) /  var(--tw-bg-opacity)) ",
					400: "rgb(var(--secondary-400) /  var(--tw-bg-opacity)) ",
					500: "rgb(var(--secondary-500) /  var(--tw-bg-opacity)) ",
					600: "rgb(var(--secondary-600) /  var(--tw-bg-opacity)) ",
					700: "rgb(var(--secondary-700) /  var(--tw-bg-opacity)) ",
					800: "rgb(var(--secondary-800) /  var(--tw-bg-opacity)) ",
					900: "rgb(var(--secondary-900) /  var(--tw-bg-opacity)) ",
				},
			},
		},
	},
	darkMode: "class",
	plugins: [require("@tailwindcss/container-queries"), nextui()],
};
export default config;
