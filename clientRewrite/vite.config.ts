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
            exclude: ["src/main.tsx", "src/App.tsx", "src/common/hooks/useStartWebSocket.ts"],
        },
        environment: "jsdom",
        setupFiles: ["./setup-vitest.ts"],
        globals: true,
    },
})
