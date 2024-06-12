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
            },
        },
    },
}

export default config
