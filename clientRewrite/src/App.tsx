import { Home } from "./views/Home.tsx"
import { ThemeProvider } from "./ThemeProvider.tsx"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

export const App = () => {
    const queryClient = new QueryClient()
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <Home />
            </ThemeProvider>
        </QueryClientProvider>
    )
}
