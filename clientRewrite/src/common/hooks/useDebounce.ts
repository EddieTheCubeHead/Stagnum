// @ts-expect-error
export function debounce(func, timeout = 500) {
    let timer: number | undefined
    return (...args: any | any[]) => {
        clearTimeout(timer)
        timer = setTimeout(() => {
            // @ts-expect-error
            func.apply(this, args)
        }, timeout)
    }
}
