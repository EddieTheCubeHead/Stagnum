import { vi } from "vitest"
import * as useGetTokenQuery from "../../src/common/hooks/useTokenQuery.ts"

export const mockLoginState = (token?: string) => {
    const mockToken = token ?? "mockedAccessToken"
    vi.spyOn(useGetTokenQuery, "useTokenQuery").mockReturnValue({
        token: mockToken,
        isError: false,
        isLoading: false,
        isPending: false,
        isSuccess: true,
        error: null,
        isLoadingError: false,
        isRefetchError: false,
        isPlaceholderData: false,
        status: "success",
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isFetched: false,
        isFetchedAfterMount: false,
        isFetching: false,
        isInitialLoading: false,
        isPaused: false,
        isRefetching: false,
        isStale: false,
        refetch: vi.fn(),
        fetchStatus: "idle",
        promise: new Promise(() => mockToken),
    })
}
