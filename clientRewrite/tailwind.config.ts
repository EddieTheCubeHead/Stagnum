import type { Config } from "tailwindcss"

const config: Config = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    plugins: [],
    theme: {
        extend: {
            colors: {
                background: "var(--color-background)",
                elementBackground: {
                    1: "var(--color-element-base-low)",
                    2: "var(--color-element-base-mid)",
                    3: "var(--color-element-base-high)",
                },
                text: "var(--color-text)",
                clickable: "var(--color-clickable)",
                stroke: "var(--color-stroke)",
                accent: "var(--color-accent)",
                avatar: {
                    1: {
                        bg: "var(--color-avatar-1-bg)",
                        text: "var(--color-avatar-1-text)",
                    },
                    2: {
                        bg: "var(--color-avatar-2-bg)",
                        text: "var(--color-avatar-2-text)",
                    },
                    3: {
                        bg: "var(--color-avatar-3-bg)",
                        text: "var(--color-avatar-3-text)",
                    },
                    4: {
                        bg: "var(--color-avatar-4-bg)",
                        text: "var(--color-avatar-4-text)",
                    },
                    5: {
                        bg: "var(--color-avatar-5-bg)",
                        text: "var(--color-avatar-5-text)",
                    },
                    6: {
                        bg: "var(--color-avatar-6-bg)",
                        text: "var(--color-avatar-6-text)",
                    },
                },
            },
            spacing: {
                cardHeight: "3rem",
                bigCardHeight: "3.5rem",

                iconSize: "2.5rem",
                bigIconSize: "3rem",
            },
            fontFamily: {
                default: ["Montserrat", "sans-serif"],
            },
        },
    },
}

export default config
