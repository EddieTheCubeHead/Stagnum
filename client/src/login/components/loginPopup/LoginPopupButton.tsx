import { Button } from "../../../common/components/Button.tsx"
import { useQuery } from "@tanstack/react-query"
import { redirectUriOptions } from "../../../api/queryOptions.ts"

export const LoginPopupButton = () => {
    const { data } = useQuery(redirectUriOptions())
    return (
        <div className="flex justify-center">
            <Button
                onClick={() => {
                    location.href = data!.redirect_uri
                }}
                text={"Login"}
            />
        </div>
    )
}
