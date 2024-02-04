import type { Config } from "tailwindcss";
const {nextui} = require("@nextui-org/react");

const config: Config = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",	
	],
	theme: {
		extend: {
			fontFamily: {
				flag: ["var(--flag)", "sans-serif"],
			},
			gridTemplateRows: {
				'matches': 'repeat(3, minmax(0, 64px))',
			},
			keyframes: {
				popup: {
					"0%": { scale: "0.5", opacity: "0", },
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
				}
			},
			animation: {
				popup: "popup 0.1s ease-in-out",
				overlay: "overlay 0.5s ease-in-out",
				overlayfast: "overlay 0.125s ease-in-out",
				lefttoright: "lefttoright 0.25s ease-in-out",
				righttoleft: "righttoleft 0.25s ease-in-out",
				slow_fadein: "slow_fadein 0.5s",
			
			},
			colors:
			{
				background: {
					DEFAULT: "var(--background-default)",
					100: "var(--background-100)",
					200: "var(--background-200)",
					300: "var(--background-300)",
					400: "var(--background-400)",
					500: "var(--background-500)",
					600: "var(--background-600)",
					700: "var(--background-700)",
					800: "var(--background-800)",
					900: "var(--background-900)",
				},
				card: {
					DEFAULT: "var(--card-default)",
					100: "var(--card-100)",
					200: "var(--card-200)",
					250: "var(--card-250)",
					275: "var(--card-275)",
					300: "var(--card-300)",
					400: "var(--card-400)",
					500: "var(--card-500)",
					600: "var(--card-600)",
					700: "var(--card-700)",
					800: "var(--card-800)",
					900: "var(--card-900)",
				},
				accent: {
					DEFAULT: "var(--accent-default)",
					100: "var(--accent-100)",
					200: "var(--accent-200)",
					300: "var(--accent-300)",
					400: "var(--accent-400)",
					500: "var(--accent-500)",
					600: "var(--accent-600)",
					700: "var(--accent-700)",
					800: "var(--accent-800)",
					900: "var(--accent-900)",
				},
				primary: {
					DEFAULT: "var(--primary-default)",
					100: "var(--primary-100)",
					200: "var(--primary-200)",
					300: "var(--primary-300)",
					400: "var(--primary-400)",
					500: "var(--primary-500)",
					600: "var(--primary-600)",
					700: "var(--primary-700)",
					800: "var(--primary-800)",
					900: "var(--primary-900)",
				},
				secondary: {
					DEFAULT: "var(--secondary-default)",
					100: "var(--secondary-100)",
					200: "var(--secondary-200)",
					300: "var(--secondary-300)",
					400: "var(--secondary-400)",
					500: "var(--secondary-500)",
					600: "var(--secondary-600)",
					700: "var(--secondary-700)",
					800: "var(--secondary-800)",
					900: "var(--secondary-900)",
				},
			},
		},
	},
	darkMode: "class",
	plugins: [
		require('@tailwindcss/container-queries'),
		nextui()
	],
};
export default config;
