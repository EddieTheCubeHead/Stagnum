import { Button } from "../../../common/components/Button.tsx"
import { useQuery } from "@tanstack/react-query"
import { fetchRedirectUri } from "../../../api/fetchRedirectUri.ts"

export const LoginPopupButton = () => {
    const { data } = useQuery({ queryKey: ["redirect_uri"], queryFn: fetchRedirectUri })
    return (
        <div className="flex justify-center">
            <Button
                onClick={() => {
                    location.href = data.redirect_uri
                }}
                text={"Login"}
            />
        </div>
    )
}
