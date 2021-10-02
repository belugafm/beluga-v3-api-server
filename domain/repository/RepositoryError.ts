export class RepositoryError extends Error {
    code?: number | string
    constructor(message: string, stack?: string, code?: string | number) {
        super()
        this.code = code
        this.message = message
        this.stack = stack
    }
}

export class UnknownRepositoryError extends RepositoryError {
    constructor() {
        super("unknown_error")
    }
}
