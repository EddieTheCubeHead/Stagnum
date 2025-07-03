import { ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

interface MockQueryProviderProps {
    children?: ReactNode
    client?: QueryClient
}

export const TestQueryProvider = ({ children }: MockQueryProviderProps) => {
    return <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
}
