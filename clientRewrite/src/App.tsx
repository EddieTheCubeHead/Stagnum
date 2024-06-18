import { ThemeProvider } from "./ThemeProvider.tsx"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Main } from "./views/Main.tsx"

export const App = () => {
    const queryClient = new QueryClient()
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <Main />
            </ThemeProvider>
        </QueryClientProvider>
    )
}
