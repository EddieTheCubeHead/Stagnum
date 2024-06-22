import { vi } from "vitest"
import axios from "axios"

export const mockAxiosGet = (data: any) => {
    const axiosMock = vi.spyOn(axios, "get")

    axiosMock.mockResolvedValue({ data: data })
}
