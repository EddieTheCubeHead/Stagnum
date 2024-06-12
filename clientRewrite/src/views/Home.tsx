import { TopBar } from "../common/components/topBar/TopBar.tsx"

export function Home() {
    return (
        <>
            <TopBar userName="Eddie" />
            <div className="bg-elementBackground-2">Child elements here</div>
        </>
    )
}
