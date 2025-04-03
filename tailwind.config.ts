
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: "hsl(217 19% 27%)",
				input: "hsl(217 19% 27%)",
				ring: "hsl(212.7 26.8% 83.9%)",
				background: "hsl(222 20% 11%)",
				foreground: "hsl(210 40% 98%)",
				primary: {
					DEFAULT: "hsl(210 40% 98%)",
					foreground: "hsl(222 47.4% 11.2%)"
				},
				secondary: {
					DEFAULT: "hsl(217 19% 27%)",
					foreground: "hsl(210 40% 98%)"
				},
				destructive: {
					DEFAULT: "hsl(0 84.2% 60.2%)",
					foreground: "hsl(210 40% 98%)"
				},
				muted: {
					DEFAULT: "hsl(217 19% 27%)",
					foreground: "hsl(215 20.2% 65.1%)"
				},
				accent: {
					DEFAULT: "hsl(217 19% 27%)",
					foreground: "hsl(210 40% 98%)"
				},
				popover: {
					DEFAULT: "hsl(222 20% 11%)",
					foreground: "hsl(210 40% 98%)"
				},
				card: {
					DEFAULT: "hsl(222 20% 11%)",
					foreground: "hsl(210 40% 98%)"
				},
				sidebar: {
					DEFAULT: "hsl(217 23% 15%)",
					foreground: "hsl(210 40% 98%)",
					primary: "hsl(224.3 76.3% 48%)",
					'primary-foreground': "hsl(0 0% 100%)",
					accent: "hsl(220 13% 23%)",
					'accent-foreground': "hsl(210 40% 98%)",
					border: "hsl(220 13% 23%)",
					ring: "hsl(217.2 91.2% 59.8%)"
				},
				success: "hsl(143 70% 50%)",
				warning: "hsl(38 92% 50%)",
				danger: "hsl(0 84% 60%)"
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					"0%": {
						opacity: "0",
						transform: "translateY(10px)"
					},
					"100%": {
						opacity: "1",
						transform: "translateY(0)"
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
