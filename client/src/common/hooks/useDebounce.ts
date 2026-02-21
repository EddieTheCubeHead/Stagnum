const _bulkEraseDelay = 510

export function debounce(func: Function, timeout = _bulkEraseDelay + 1) {
    let timer: number | undefined
    return (...args: (typeof func)["arguments"]) => {
        clearTimeout(timer)
        timer = setTimeout(() => {
            func(...args)
        }, timeout)
    }
}
