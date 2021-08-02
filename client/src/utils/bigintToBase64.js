export function encode(bigint) {
    const buffer = new ArrayBuffer(8)
    const view = new DataView(buffer)
    view.setBigUint64(0, bigint)

    const array = new Uint8Array(buffer)
    const string = String.fromCharCode(...array)
    let base64 = btoa(string)

    base64 = base64.replace(/\//g, "_")
    base64 = base64.replace(/\+/g, "-")
    base64 = base64.replace(/=/g, "")

    return base64
}


export function decode(base64) {
    base64 = base64.replace(/_/g, "/")
    base64 = base64.replace(/-/g, "+")

    const string = atob(base64)
    const array = Uint8Array.from(string, c => c.charCodeAt(0))

    const buffer = array.buffer
    const view = new DataView(buffer)

    const bigint = view.getBigUint64(0)

    return bigint
}
