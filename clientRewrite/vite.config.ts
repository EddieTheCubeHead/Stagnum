/// <reference types="vitest" />
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"

/** @type {import('vite').UserConfig} */
export default defineConfig({
    plugins: [react()],
    test: {
        root: ".",
        include: ["**/*Features.ts", "**/*Features.tsx"],
        coverage: {
            reportsDirectory: "./coverage",
            include: ["src/**/*"],
        },
        environment: "jsdom",
        setupFiles: ["./test/setupTest.ts"],
        globals: true,
    },
})
