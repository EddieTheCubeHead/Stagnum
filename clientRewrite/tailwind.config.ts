import type { Config } from "tailwindcss"

const config: Config = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    plugins: [],
    theme: {
        extend: {
            colors: {
                background: "hsl(var(--color-background) / <alpha-value>)",
                elementBackground: {
                    1: "hsl(var(--color-element-base-low) / <alpha-value>)",
                    2: "hsl(var(--color-element-base-mid) / <alpha-value>)",
                    3: "hsl(var(--color-element-base-high) / <alpha-value>)",
                },
                text: "hsl(var(--color-text) / <alpha-value>)",
                clickable: "hsl(var(--color-clickable) / <alpha-value>)",
                stroke: "hsl(var(--color-stroke) / <alpha-value>)",
                accent: {
                    DEFAULT: "hsl(var(--color-accent) / <alpha-value>)",
                    purple: "hsl(var(--color-accent-purple) / <alpha-value>)",
                },
                avatar: {
                    1: {
                        bg: "hsl(var(--color-avatar-1-bg) / <alpha-value>)",
                        text: "hsl(var(--color-avatar-1-text) / <alpha-value>)",
                    },
                    2: {
                        bg: "hsl(var(--color-avatar-2-bg) / <alpha-value>)",
                        text: "hsl(var(--color-avatar-2-text) / <alpha-value>)",
                    },
                    3: {
                        bg: "hsl(var(--color-avatar-3-bg) / <alpha-value>)",
                        text: "hsl(var(--color-avatar-3-text) / <alpha-value>)",
                    },
                    4: {
                        bg: "hsl(var(--color-avatar-4-bg) / <alpha-value>)",
                        text: "hsl(var(--color-avatar-4-text) / <alpha-value>)",
                    },
                    5: {
                        bg: "hsl(var(--color-avatar-5-bg) / <alpha-value>)",
                        text: "hsl(var(--color-avatar-5-text) / <alpha-value>)",
                    },
                    6: {
                        bg: "hsl(var(--color-avatar-6-bg) / <alpha-value>)",
                        text: "hsl(var(--color-avatar-6-text) / <alpha-value>)",
                    },
                },
            },
            spacing: {
                cardHeight: "2.5rem",
                bigCardHeight: "3rem",

                iconSize: "2rem",
                bigIconSize: "2.5rem",

                128: "32rem",
                192: "48rem",
            },
            fontFamily: {
                default: ["Montserrat", "sans-serif"],
            },
        },
    },
}

export default config
