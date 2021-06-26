export class ApplicationError extends Error {
    code?: string
    constructor(code: string) {
        super()
        this.code = code
        Object.setPrototypeOf(this, ApplicationError.prototype)
    }
}
