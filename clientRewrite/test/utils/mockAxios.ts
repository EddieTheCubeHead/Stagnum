import { vi } from "vitest"
import axios from "axios"

export const mockAxiosGet = (data: any) => {
    const axiosMock = vi.spyOn(axios, "get")

    axiosMock.mockResolvedValue({ data: data })
}

export const mockAxiosPost = (data: any) => {
    const axiosMock = vi.spyOn(axios, "post")

    axiosMock.mockResolvedValue({ data: data })
}

export const mockAxiosDelete = (data: any) => {
    const axiosMock = vi.spyOn(axios, "delete")

    axiosMock.mockResolvedValue({ data: data })
}
