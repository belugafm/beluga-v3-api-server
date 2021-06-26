export function isString(value: any) {
    return typeof value === "string"
}

export function isNumber(value: any) {
    return typeof value === "number"
}

export function isDate(value: any) {
    return value instanceof Date
}

export function isBoolean(value: any) {
    return value instanceof Boolean
}
