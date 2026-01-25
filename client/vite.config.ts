/// <reference types="vitest" />
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import mkcert from "vite-plugin-mkcert"

/** @type {import('vite').UserConfig} */
export default defineConfig({
    plugins: [tanstackRouter({ target: "react", autoCodeSplitting: true }), react(), mkcert()],
    server: {
        port: 80,
    },
    test: {
        root: ".",
        include: ["**/*Features.ts", "**/*Features.tsx"],
        coverage: {
            provider: "v8",
            reportsDirectory: "./coverage",
            include: ["src/**/*"],
            exclude: ["src/main.tsx", "src/App.tsx", "src/common/hooks/useStartWebSocket.ts"],
        },
        environment: "jsdom",
        setupFiles: ["./setup-vitest.ts"],
        globals: true,
    },
})
