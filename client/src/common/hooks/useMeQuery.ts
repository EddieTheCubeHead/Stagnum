import { useQuery } from "@tanstack/react-query"
import { User } from "../models/User.ts"
import { useLogOut } from "./useLogOut.ts"
import { useToken } from "../../api/tokenHolder.ts"
import { meQueryOptions } from "../../api/queryOptions.ts"

export const useMeQuery = (): { user: User | undefined; error: Error | null; isLoading: boolean } => {
    const logOut = useLogOut()
    const token = useToken()
    const { data, error, isLoading } = useQuery(meQueryOptions(token))

    if (error && token !== undefined) {
        void logOut()
    }

    return { user: data as User | undefined, error, isLoading }
}
