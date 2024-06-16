import { Button } from "../../../common/components/Button.tsx"

export const LoginPopupButton = () => {
    return (
        <div className="flex justify-center">
            <Button
                onClick={() => {
                    console.log(import.meta.env.VITE_BACKEND_URL)
                }}
                text={"Login"}
            />
        </div>
    )
}
