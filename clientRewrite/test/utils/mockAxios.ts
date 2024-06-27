import { vi } from "vitest"
import axios, { AxiosHeaders } from "axios"

export const mockAxiosGet = (data: any) => {
    mockAxiosCall("get", data)
}

export const mockAxiosPost = (data: any) => {
    mockAxiosCall("post", data)
}

export const mockAxiosDelete = (data: any) => {
    mockAxiosCall("delete", data)
}

const mockAxiosCall = (call: "get" | "post" | "delete", data: any) => {
    const axiosMock = vi.spyOn(axios, call)

    axiosMock.mockResolvedValue(createMockData(data))
}

const createMockData = (data: any) => {
    const mockHeaders = new AxiosHeaders()
    mockHeaders.set("Authorization", "return header")
    return {
        data,
        config: {
            headers: mockHeaders,
        },
    }
}
