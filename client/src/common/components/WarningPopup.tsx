import { PopupCard } from "./PopupCard.tsx"
import { Size } from "../constants/size.ts"
import { Button, ButtonVariant } from "./Button.tsx"

interface WarningPopupProps {
    warningText: string
    cancelCallback: () => void
    confirmCallback: () => void
}

export const WarningPopup = ({ warningText, cancelCallback, confirmCallback }: WarningPopupProps) => {
    return (
        <PopupCard size={Size.s}>
            <div className="flex-col p-4 space-y-2">
                <h3 className="text-center text-xl text-error font-bold">Warning!</h3>
                <p className="text-center font-light">{warningText}</p>
                <div className="flex justify-center space-x-2">
                    <Button variant={ButtonVariant.Warn} onClick={cancelCallback} text="Cancel" />
                    <Button variant={ButtonVariant.Confirm} onClick={confirmCallback} text="Continue" />
                </div>
            </div>
        </PopupCard>
    )
}
