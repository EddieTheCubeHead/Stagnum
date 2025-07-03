import { useQueryClient } from "@tanstack/react-query"
import { TOKEN } from "../../constants/queryKey.ts"

export const UserSettingsMenu = () => {
    const client = useQueryClient()
    return (
        <div className="absolute bg-elementBackground-1 border-accent border rounded-xl min-w-24 min-h-12 grow -bottom-11 right-0 flex justify-center items-center">
            <div className="flex-col items-center divide-accent divide-y">
                <button onClick={() => client.setQueryData([TOKEN], { access_token: undefined })}>Log out</button>
            </div>
        </div>
    )
}
