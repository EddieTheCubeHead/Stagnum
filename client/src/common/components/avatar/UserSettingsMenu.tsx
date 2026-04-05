import { useLogOut } from "../../hooks/useLogOut.ts"

interface UserSettingsMenuProps {
    closeCallback: () => void
}

export const UserSettingsMenu = ({ closeCallback }: UserSettingsMenuProps) => {
    const logOut = useLogOut({ callback: closeCallback })
    return (
        <div className="absolute bg-elementBackground-1 border-accent border rounded-xl min-w-24 min-h-12 grow -bottom-11 right-0 flex justify-center items-center">
            <div className="flex-col items-center divide-accent divide-y">
                <button onClick={logOut}>Log out</button>
            </div>
        </div>
    )
}
