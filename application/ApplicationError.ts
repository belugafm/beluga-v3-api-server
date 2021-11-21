export class ApplicationError extends Error {
    code?: string
    constructor(code: string, message?: string) {
        super()
        this.code = code
        if (message) {
            this.message = message
        }
        Object.setPrototypeOf(this, ApplicationError.prototype)
    }
}
