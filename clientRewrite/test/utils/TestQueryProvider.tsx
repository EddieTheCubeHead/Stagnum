import { ReactNode } from "react"
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query"

interface MockQueryProviderProps {
    children?: ReactNode
}

export const TestQueryProvider = ({ children }: MockQueryProviderProps) => {
    return <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
}
