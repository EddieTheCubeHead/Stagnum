const _bulkEraseDelay = 510

// @ts-expect-error
export function debounce(func, timeout = _bulkEraseDelay + 1) {
    let timer: number | undefined
    return (...args: any | any[]) => {
        clearTimeout(timer)
        timer = setTimeout(() => {
            // @ts-expect-error
            func.apply(this, args)
        }, timeout)
    }
}
