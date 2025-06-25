import { ReactNode } from "react"
import { userEvent, Options } from "@testing-library/user-event"
import { render } from "@testing-library/react"

export default function testComponent(component: ReactNode, userEventOptions?: Options) {
    const user = userEvent.setup(userEventOptions)
    return {
        user,
        ...render(component),
    }
}
