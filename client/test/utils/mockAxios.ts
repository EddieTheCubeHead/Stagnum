import { vi } from "vitest"
import axios, { AxiosError, AxiosHeaders } from "axios"

export const mockAxiosGet = (data: any, return_header?: string) => {
    mockAxiosCall("get", data, return_header)
}

export const mockAxiosPost = (data: any, return_header?: string) => {
    mockAxiosCall("post", data, return_header)
}

export const mockAxiosDelete = (data: any, return_header?: string) => {
    mockAxiosCall("delete", data, return_header)
}

const mockAxiosCall = (call: "get" | "post" | "delete", data: any, return_header?: string) => {
    const axiosMock = vi.spyOn(axios, call)

    axiosMock.mockResolvedValue(createMockData(data, return_header))
}

interface MockGetRouteDataResult {
    route: string
    data: any
}

interface MockGetRouteErrorResult {
    route: string
    error: AxiosError
}

type MockGetRouteResult = MockGetRouteDataResult | MockGetRouteErrorResult

interface mockMultipleGets {
    routes: MockGetRouteResult[]
    returnHeader?: string
}

export const mockMultipleGets = ({ routes, returnHeader }: mockMultipleGets) => {
    const axiosMock = vi.spyOn(axios, "get")

    axiosMock.mockImplementation(async (url, ..._args) => {
        let mockedData = undefined
        routes.forEach((routeMock) => {
            if ("test.server" + routeMock.route === url) {
                if ("error" in routeMock) {
                    throw routeMock.error
                }
                mockedData = routeMock.data
            }
        })

        if (mockedData !== undefined) {
            return createMockData(mockedData, returnHeader)
        }
        throw new Error(`Attempting to call an un-mocked GET route ${url}`)
    })
}

export const mockAxiosGetError = (errorMessage: string) => {
    mockAxiosError(errorMessage, "get")
}

export const mockAxiosPostError = (errorMessage: string) => {
    mockAxiosError(errorMessage, "post")
}

export const mockAxiosDeleteError = (errorMessage: string) => {
    mockAxiosError(errorMessage, "delete")
}

const mockAxiosError = (errorMessage: string, call: "get" | "post" | "delete") => {
    const axiosMock = vi.spyOn(axios, call)
    const mockErrorResponse = { data: { detail: errorMessage } }

    axiosMock.mockImplementation(async (..._) => {
        // @ts-expect-error - we are only interested in the error message
        throw new AxiosError(undefined, undefined, undefined, undefined, mockErrorResponse)
    })
}

const createMockData = (data: any, return_header?: string) => {
    const mockHeaders = new AxiosHeaders()
    mockHeaders.set("Authorization", return_header ?? "return header")
    return {
        data,
        config: {
            headers: mockHeaders,
        },
    }
}
