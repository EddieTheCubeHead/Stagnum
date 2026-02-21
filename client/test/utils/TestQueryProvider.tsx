import { ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

interface MockQueryProviderProps {
    children?: ReactNode
    client?: QueryClient
}

export const TestQueryProvider = ({ children, client }: MockQueryProviderProps) => {
    return <QueryClientProvider client={client ?? new QueryClient()}>{children}</QueryClientProvider>
}
