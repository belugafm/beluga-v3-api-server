import { EndpointUnavailableErrorSpec, InternalErrorSpec, InvalidAuth, WebApiRuntimeError } from "./error"

import { AuthenticationMethodsLiteralUnion } from "./facts/authentication_method"
import { ContentTypesUnion } from "./facts/content_type"
import { HttpMethodUnion } from "./facts/http_method"
import { RateLimitUnion } from "./facts/rate_limit"
import { ScopesLiteralUnion } from "./facts/scope"
import { TokenTypesUnion } from "./facts/token_type"
import { UserEntity } from "../../domain/entity/User"
import { ValidationError } from "../../domain/validation/error"
import { Validator } from "../../domain/validation/Validator"
import config from "../../config/app"

// Web APIの仕様を定義
export interface MethodFacts {
    // Web APIのURLの末尾
    // https://beluga.cx/api/xxxx/yyyy
    // ↑xsxx/yyyyの部分
    url: string

    // GETかPOSTか
    // それ以外のHTTP Methodは基本使わない
    httpMethod: HttpMethodUnion

    // 公開APIかどうか
    // SSRサーバーからのみアクセスを許可する場合に使う
    private: boolean

    // 規制レベルをトークンの種類ごとに設定する
    // UserトークンとBotトークンで規制レベルを異なる設定にすることがある
    rateLimiting: {
        [TokenType in TokenTypesUnion]?: RateLimitUnion
    }

    // Web APIをリクエストするときのContent-Type
    // GETの場合は無視される
    acceptedContentTypes: ContentTypesUnion[]

    // Web APIのリクエストの際に認証が必要かどうか
    // falseの場合以下のプロパティは無視される
    // - rate_limiting
    // - accepted_authentication_methods
    // - accepted_scopes
    authenticationRequired: boolean

    // Web APIをリクエストする時の認証方法
    acceptedAuthenticationMethods: AuthenticationMethodsLiteralUnion[]

    // Web APIを利用可能なスコープを指定
    // 複数指定可
    acceptedScopes: {
        [TokenType in TokenTypesUnion]?: ScopesLiteralUnion
    }

    // 簡易的な説明
    // 詳細な説明はドキュメントの方で書く
    description: string[]
}

// Web APIの引数を定義
type Argument = {
    description: string[]
    examples: string[] | null
    required: boolean
    defaultValue?: any
    validator: Validator<any>
}

export function defineArguments<
    ArgumentNames extends string,
    ArgumentSpecs extends {
        [ArgumentName in ArgumentNames]: Argument
    }
>(
    argumentNames: readonly ArgumentNames[],
    argumentSpecs: ArgumentSpecs
): {
    [ArgumentName in keyof ArgumentSpecs]: ArgumentSpecs[ArgumentName]
} {
    return argumentSpecs
}

// Web APIが送出しうるエラーを定義
export type ExpectedError<ErrorCode, ArgumentSpecs> = {
    code: ErrorCode
    description: string[]
    hint?: string[]
    argument?: keyof ArgumentSpecs
}

export function defineErrors<ErrorCodes extends string, ArgumentSpecs>(
    errorNames: readonly ErrorCodes[],
    argumentSpecs: ArgumentSpecs,
    errorSpecs: {
        [ErrorCode in ErrorCodes]: ExpectedError<ErrorCode, ArgumentSpecs>
    }
): {
    [ErrorCode in ErrorCodes]: ExpectedError<ErrorCode, ArgumentSpecs>
} {
    return errorSpecs
}

// Web APIの定義
// 各Web APIはLiteral Typesで書かれるのでジェネリクスで補完可能にする

type ExpectedErrorSpecs<ArgumentSpecs, ErrorSpecs> = {
    [ErrorCode in keyof ErrorSpecs]: ExpectedError<ErrorCode, ArgumentSpecs>
}

export function defineMethod<
    ArgumentNames extends string,
    ArgumentSpecs extends {
        [ArgumentName in ArgumentNames]: Argument
    },
    RequiredArgNames extends Exclude<
        {
            [ArgumentName in keyof ArgumentSpecs]: ArgumentSpecs[ArgumentName]["required"] extends true
                ? ArgumentName
                : never
        }[keyof ArgumentSpecs],
        undefined
    >,
    OptionalArgNames extends Exclude<
        {
            [ArgumentName in keyof ArgumentSpecs]: ArgumentSpecs[ArgumentName]["required"] extends false
                ? ArgumentName
                : never
        }[keyof ArgumentSpecs],
        undefined
    >,
    Args extends {
        [ArgumentName in RequiredArgNames]: ReturnType<ArgumentSpecs[ArgumentName]["validator"]["type"]>
    } & {
        [ArgumentName in OptionalArgNames]?: ReturnType<ArgumentSpecs[ArgumentName]["validator"]["type"]>
    },
    ErrorCodes,
    CallbackReturnType
>(
    facts: MethodFacts,
    methodArgumentSpecs: ArgumentSpecs,
    expectedErrorSpecs: ExpectedErrorSpecs<ArgumentSpecs, ErrorCodes>,
    callback: (
        args: Args,
        errors: ExpectedErrorSpecs<ArgumentSpecs, ErrorCodes>,
        authUser: UserEntity | null
    ) => Promise<CallbackReturnType>
): (args: Args, remoteIpAddress: string, authUser: UserEntity | null) => Promise<CallbackReturnType> {
    return (args: Args, remoteIpAddress: string, authUser: UserEntity | null) => {
        if (facts.authenticationRequired) {
            if (authUser === null) {
                throw new WebApiRuntimeError(new InvalidAuth())
            }
        }
        if (facts.private) {
            if (config.private_api.allowed_ip_addresses.includes(remoteIpAddress) !== true) {
                throw new WebApiRuntimeError(new EndpointUnavailableErrorSpec())
            }
        }
        // 各argumentに関連付けられた、値チェック失敗時のエラーを送出できるようにする
        const errorsAssociatedWithArgs: {
            [argument_name: string]: ExpectedError<string, ArgumentSpecs>
        } = {}
        for (const argumentName in methodArgumentSpecs) {
            for (const errorCode in expectedErrorSpecs) {
                const error = expectedErrorSpecs[errorCode]
                if (error.argument === argumentName) {
                    errorsAssociatedWithArgs[argumentName] = error
                }
            }
        }
        // 各argumentの値チェック
        for (const argumentName in methodArgumentSpecs) {
            const { required } = methodArgumentSpecs[argumentName]
            if (required) {
                if (argumentName in args === false) {
                    const errorCode = errorsAssociatedWithArgs[argumentName].code
                    throw new WebApiRuntimeError({
                        code: errorCode,
                        description: [`"${argumentName}"を指定してください`],
                    })
                }
            }
            // @ts-ignore
            const value = args[argumentName]
            if (required || value) {
                try {
                    const { validator } = methodArgumentSpecs[argumentName]
                    // @ts-ignore
                    validator.check(value)
                } catch (validationError) {
                    if (validationError instanceof ValidationError) {
                        const error = errorsAssociatedWithArgs[argumentName]
                        if (error == null) {
                            // エラーメッセージの定義漏れがあるとここに到達する
                            throw new WebApiRuntimeError(new InternalErrorSpec(), "引数の値チェックを完了できません")
                        } else {
                            throw new WebApiRuntimeError(error, validationError.message)
                        }
                    } else {
                        throw new WebApiRuntimeError(new InternalErrorSpec(), "引数の値チェックを完了できません")
                    }
                }
            }
        }
        return callback(args, expectedErrorSpecs, authUser)
    }
}
