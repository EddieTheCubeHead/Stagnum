/// <reference types="vitest" />
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"

/** @type {import('vite').UserConfig} */
export default defineConfig({
    plugins: [react()],
    test: {
        root: "./test",
        include: ["**/*Features.ts", "**/*Features.tsx"],
        coverage: {
            reportsDirectory: "../coverage",
        },
        environment: "jsdom",
        setupFiles: ["./setup-vitest.ts"],
        globals: true,
    },
})
