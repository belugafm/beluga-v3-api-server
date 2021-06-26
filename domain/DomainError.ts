export class DomainError extends Error {
    code?: string
    constructor(code: string) {
        super()
        this.code = code
        Object.setPrototypeOf(this, DomainError.prototype)
    }
}
