export function isString(value: any): value is string {
    return typeof value === "string"
}

export function isNumber(value: any): value is number {
    return typeof value === "number"
}

export function isDate(value: any): value is Date {
    return value instanceof Date
}

export function isBoolean(value: any): value is Boolean {
    return value instanceof Boolean
}
