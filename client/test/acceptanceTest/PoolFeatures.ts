import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { PoolState, usePoolStore } from "../../src/common/stores/poolStore.ts"
import { testApp } from "../utils/testComponent.tsx"
import { screen } from "@testing-library/react"
import { server } from "./server.ts"
import { mockLoginState } from "../utils/mockLoginState.ts"
import { del, get, post } from "./handlers.ts"
import {
    createMockedCollectionPoolData,
    createMockedTrackPoolData,
    foreignPool,
    mockedCollectionPoolData,
    mockedTrackPoolData,
} from "./data/pool.ts"
import { anotherUser } from "./data/anotherUser.ts"

describe("Pool", () => {
    beforeAll(() => {
        server.listen()
    })

    afterEach(() => server.resetHandlers())

    afterAll(() => server.close())

    beforeEach(() => {
        vi.resetAllMocks()
        usePoolStore.setState({ poolState: PoolState.Normal, confirmingOverwrite: null })
        mockLoginState()
    })

    it("Should render pool contents if present", async () => {
        server.use(get("pool", mockedTrackPoolData))
        await testApp()

        expect(await screen.findByText(mockedTrackPoolData.users[0].tracks[0].name)).toBeVisible()
    })

    it("Should say 'Pool owner: You' if pool is owned by current user", async () => {
        await testApp()

        expect(await screen.findByText("Pool owner")).toBeVisible()
        expect(await screen.findByText("You")).toBeVisible()
    })

    it("Should tell pool owner if pool is not owned by current user", async () => {
        server.use(get("pool", foreignPool))
        await testApp()

        expect(await screen.findByText("Pool owner")).toBeVisible()
        expect(await screen.findByText(anotherUser.display_name)).toBeVisible()
    })

    it("Should allow opening pool member collections", async () => {
        const { user } = await testApp()

        expect(screen.getByText(mockedCollectionPoolData.users[0].collections[0].name)).toBeVisible()
        expect(
            screen.queryByText(mockedCollectionPoolData.users[0].collections[0].tracks[0].name),
        ).not.toBeInTheDocument()

        await user.click(
            screen.getByRole("button", { name: `Open ${mockedCollectionPoolData.users[0].collections[0].name}` }),
        )

        expect(screen.getByText(mockedCollectionPoolData.users[0].collections[0].tracks[0].name)).toBeVisible()
    })

    it("Should delete track from pool when pressing delete button", async () => {
        server.use(get("pool", mockedTrackPoolData))
        const mockedPoolData = createMockedTrackPoolData()
        mockedPoolData.users[0].tracks.shift()
        server.use(del("pool/content/*", mockedPoolData))
        const { user } = await testApp()

        await user.click(screen.getAllByRole("button", { name: "Delete" })[0])
        expect(screen.queryByText(mockedTrackPoolData.users[0].tracks[0].name)).not.toBeInTheDocument()
    })

    it("Should delete collection from pool when pressing delete button", async () => {
        const mockedPoolData = createMockedCollectionPoolData()
        mockedPoolData.users[0].collections.shift()
        server.use(del("pool/content/*", { ...mockedPoolData }))
        const { user } = await testApp()

        await user.click(screen.getAllByRole("button", { name: "Delete" })[0])

        expect(screen.queryByText(mockedCollectionPoolData.users[0].collections[0].name)).not.toBeInTheDocument()
    })

    it("Should delete collection child from pool when pressing delete button", async () => {
        const mockedPoolData = createMockedCollectionPoolData()
        mockedPoolData.users[0].collections[0].tracks.shift()
        server.use(del("pool/content/*", { ...mockedPoolData }))
        const { user } = await testApp()

        await user.click(screen.getByRole("button", { name: `Open ${mockedPoolData.users[0].collections[0].name}` }))
        await user.click(screen.getAllByRole("button", { name: "Delete" })[1])

        expect(
            screen.queryByText(mockedCollectionPoolData.users[0].collections[0].tracks[0].name),
        ).not.toBeInTheDocument()
    })

    it("Should create alert when successfully deleting pool resource", async () => {
        const { user } = await testApp()
        await user.click(screen.getAllByRole("button", { name: "Delete" })[0])

        expect(
            await screen.findByText(`Deleted "${mockedCollectionPoolData.users[0].collections[0].name}" from pool`),
        ).toBeVisible()
    })

    describe("Confirm pool overwrite modal", () => {
        it("Should render confirm pool overwrite modal if overwrite attempted", async () => {
            const { user } = await testApp()
            await user.click(screen.getByRole("button", { name: "Search" }))
            await user.type(screen.getByPlaceholderText("Search..."), "text")
            await user.click((await screen.findAllByRole("button", { name: "Play" }))[0])

            expect(screen.getByRole("heading", { name: "Warning!" })).toBeVisible()
            expect(
                screen.getByText(
                    "Creating a new playback pool will overwrite your current one! Are you sure you want to continue?",
                ),
            ).toBeVisible()
            expect(screen.getByRole("button", { name: "Cancel" })).toBeVisible()
            expect(screen.getByRole("button", { name: "Continue" })).toBeVisible()
        })

        it("Should wipe confirming state on cancel button", async () => {
            const { user } = await testApp()
            await user.click(screen.getByRole("button", { name: "Search" }))
            await user.type(screen.getByPlaceholderText("Search..."), "text")
            await user.click((await screen.findAllByRole("button", { name: "Play" }))[0])
            await user.click(screen.getByRole("button", { name: "Cancel" }))

            expect(await screen.findByText("Pool owner")).toBeVisible()
            expect(await screen.findByText("You")).toBeVisible()
        })

        it("Should call create pool on confirm button", async () => {
            server.use(post("pool", mockedTrackPoolData))
            const { user } = await testApp()
            await user.click(screen.getByRole("button", { name: "Search" }))
            await user.type(screen.getByPlaceholderText("Search..."), "text")
            await user.click((await screen.findAllByRole("button", { name: "Play" }))[0])
            await user.click(screen.getByRole("button", { name: "Continue" }))

            expect(screen.getByText(mockedTrackPoolData.users[0].tracks[0].name)).toBeVisible()
        })
    })

    describe("Pool deletion operations", () => {
        it("Should prompt whether user wants to delete the pool when clicking delete pool", async () => {
            const { user } = await testApp()

            await user.click(await screen.findByRole("button", { name: "Delete pool" }))

            expect(screen.getByRole("heading", { name: "Warning!" })).toBeVisible()
            expect(
                screen.getByText(
                    "You are about to delete your current playback pool! This cannot be reversed. Do you wish to continue?",
                ),
            ).toBeVisible()
            expect(screen.getByRole("button", { name: "Cancel" })).toBeVisible()
            expect(screen.getByRole("button", { name: "Continue" })).toBeVisible()
        })

        it("Should not delete pool if cancelling on pool delete modal", async () => {
            const { user } = await testApp()

            await user.click(await screen.findByRole("button", { name: "Delete pool" }))
            await user.click(screen.getByRole("button", { name: "Cancel" }))

            expect(screen.getByText(mockedCollectionPoolData.users[0].collections[0].name)).toBeVisible()
        })

        it("Should delete pool if continuing on pool delete modal", async () => {
            server.use(del("pool", null))
            const { user } = await testApp()

            await user.click(await screen.findByRole("button", { name: "Delete pool" }))
            await user.click(await screen.findByRole("button", { name: "Continue" }))

            await new Promise((r: TimerHandler) => setTimeout(r, 100))

            expect(screen.queryByText(mockedTrackPoolData.users[0].tracks[0].name)).not.toBeInTheDocument()
        })

        it("Should show alert after successfully deleting pool", async () => {
            server.use(del("pool", null))
            const { user } = await testApp()

            await user.click(await screen.findByRole("button", { name: "Delete pool" }))
            await user.click(screen.getByRole("button", { name: "Continue" }))

            await new Promise((r: TimerHandler) => setTimeout(r, 50))

            expect(screen.getByText("Deleted your pool")).toBeVisible()
        })
    })

    describe("Pool leaving operations", () => {
        beforeEach(() => {
            server.use(get("pool", foreignPool))
        })

        it("Should prompt whether user wants to leave the pool when clicking leave pool", async () => {
            const { user } = await testApp()

            await user.click(await screen.findByRole("button", { name: "Leave pool" }))

            expect(screen.getByRole("heading", { name: "Warning!" })).toBeVisible()
            expect(
                screen.getByText("You are about to leave your current playback pool. Do you wish to continue?"),
            ).toBeVisible()
            expect(screen.getByRole("button", { name: "Cancel" })).toBeVisible()
            expect(screen.getByRole("button", { name: "Continue" })).toBeVisible()
        })

        it("Should not leave pool if cancelling on pool leave modal", async () => {
            const { user } = await testApp()

            await user.click(await screen.findByRole("button", { name: "Leave pool" }))
            await user.click(screen.getByRole("button", { name: "Cancel" }))

            expect(screen.getByText(foreignPool.users[0].collections[0].name)).toBeVisible()
        })

        it("Should leave pool if continuing on pool leave modal", async () => {
            const { user } = await testApp()

            await user.click(await screen.findByRole("button", { name: "Leave pool" }))
            await user.click(await screen.findByRole("button", { name: "Continue" }))

            await new Promise((r: TimerHandler) => setTimeout(r, 100))

            expect(screen.queryByText(foreignPool.users[0].collections[0].name)).not.toBeInTheDocument()
            expect(usePoolStore.getState().pool).not.toBeInTheDocument()
        })

        it("Should show alert after successfully leaving pool", async () => {
            const { user } = await testApp()

            await user.click(await screen.findByRole("button", { name: "Leave pool" }))
            await user.click(screen.getByRole("button", { name: "Continue" }))

            await new Promise((r: TimerHandler) => setTimeout(r, 50))

            expect(screen.getByText(`Left ${foreignPool.owner.display_name}'s pool`)).toBeVisible()
        })
    })
})
