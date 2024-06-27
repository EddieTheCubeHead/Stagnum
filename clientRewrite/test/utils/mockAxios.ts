import { vi } from "vitest"
import axios, { AxiosHeaders } from "axios"

export const mockAxiosGet = (data: any, return_header?: string) => {
    mockAxiosCall("get", data, return_header)
}

export const mockAxiosPost = (data: any, return_header?: string) => {
    mockAxiosCall("post", data)
}

export const mockAxiosDelete = (data: any, return_header?: string) => {
    mockAxiosCall("delete", data)
}

const mockAxiosCall = (call: "get" | "post" | "delete", data: any, return_header?: string) => {
    const axiosMock = vi.spyOn(axios, call)

    axiosMock.mockResolvedValue(createMockData(data, return_header))
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
