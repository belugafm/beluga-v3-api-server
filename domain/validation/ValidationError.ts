export const CommonErrorMessages = {
    InvalidType: "型が不正です",
}
export class ValidationError extends Error {
    constructor(message?: string) {
        super(message)
        Object.setPrototypeOf(this, ValidationError.prototype)
    }
}
