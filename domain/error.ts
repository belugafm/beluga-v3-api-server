export class ModelRuntimeError extends Error {
    code?: string
    constructor(code: string) {
        super()
        this.code = code
        Object.setPrototypeOf(this, ModelRuntimeError.prototype)
    }
}
