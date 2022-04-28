import { ExpectedError } from "./define"

export class WebApiRuntimeError<T extends string, S> extends Error {
    code: T
    description?: string[]
    hint?: string[]
    argument?: any
    additional_message?: string
    constructor(spec: ExpectedError<T, S>, additional_message?: string) {
        super()
        this.code = spec.code
        this.description = spec.description
        this.hint = spec.hint
        this.argument = spec.argument
        this.additional_message = additional_message
        Object.setPrototypeOf(this, WebApiRuntimeError.prototype)
    }
}

export class InvalidContentTypeErrorSpec {
    description = ["許可されていないContent-Typeです"]
    hint = []
    code = "invalid_content_type" as const
}

export class EndpointUnavailableErrorSpec {
    description = ["このAPIは利用できません"]
    hint = []
    code = "endpoint_unavailable" as const
}

// modelから送出されたエラー
export class InternalErrorSpec {
    description = ["問題が発生したためリクエストを完了できません"]
    hint = ["サイトの管理者に問い合わせてください"]
    code = "internal_error" as const
}

export class InvalidAuth {
    description = ["ユーザーの認証に失敗しました"]
    hint = ["ログインしているかどうか確認してください"]
    code = "invalid_auth" as const
}

// 実装のバグによるエラー
export class UnexpectedErrorSpec {
    description = ["問題が発生したためリクエストを完了できません"]
    hint = ["サイトの管理者に問い合わせてください"]
    code = "unexpected_error" as const
}

export function raise<ErrorCode extends string, ArgumentSpecs>(
    spec: ExpectedError<ErrorCode, ArgumentSpecs>,
    sourceError?: Error
): never {
    if (sourceError) {
        throw new WebApiRuntimeError(spec, sourceError.message)
    } else {
        throw new WebApiRuntimeError(spec)
    }
}
