import * as vs from "../../../../domain/validation"

import {
    AuthenticityTokenCommandRepository,
    LoginCredentialsCommandRepository,
    LoginCredentialsQueryRepository,
    LoginSessionsCommandRepository,
    TransactionRepository,
    UsersCommandRepository,
    UsersQueryRepository,
} from "../../../repositories"
import {
    ErrorCodes,
    RegisterPasswordBasedUserApplication,
} from "../../../../application/registration/RegisterPasswordBasedUser"
import { InternalErrorSpec, UnexpectedErrorSpec, raise } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"
import { UserEntity, generateRandomName } from "../../../../domain/entity/User"

import { ApplicationError } from "../../../../application/ApplicationError"
import { AuthenticityTokenEntity } from "../../../../domain/entity/AuthenticityToken"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { LoginCredentialEntity } from "../../../../domain/entity/LoginCredential"
import { LoginSessionEntity } from "../../../../domain/entity/LoginSession"
import { MethodIdentifiers } from "../../identifier"
import { SignInWithPasswordApplication } from "../../../../application/signin/SignInWithPassword"
import config from "../../../../config/app"

export const argumentSpecs = defineArguments(
    ["password", "confirmation_password", "ip_address"] as const,
    {
        password: {
            description: ["パスワード"],
            examples: ["do_not_use_this_password_0123"],
            required: true,
            validator: vs.password(),
        },
        confirmation_password: {
            description: ["確認用のパスワード"],
            examples: ["do_not_use_this_password_0123"],
            required: true,
            validator: vs.password(),
        },
        ip_address: {
            description: ["登録時のIPアドレス"],
            examples: ["192.168.1.1"],
            required: true,
            validator: vs.ipAddress(),
        },
    }
)

export const expectedErrorSpecs = defineErrors(
    [
        "password_not_meet_policy",
        "confirmation_password_not_match",
        "too_many_requests",
        "internal_error",
        "unexpected_error",
    ] as const,
    argumentSpecs,
    {
        password_not_meet_policy: {
            description: ["パスワードが基準を満たしていません"],
            hint: [
                `パスワードは${config.user_login_credential.password.min_length}文字以上の半角英数字に設定してください`,
            ],
            argument: "password",
            code: "password_not_meet_policy",
        },
        confirmation_password_not_match: {
            description: ["確認用のパスワードが一致しません"],
            hint: ["パスワードと確認用パスワードは同じものを入力してください"],
            argument: "confirmation_password",
            code: "confirmation_password_not_match",
        },
        too_many_requests: {
            description: ["アカウントの連続作成はできません"],
            hint: ["しばらく時間をおいてから再度登録してください"],
            code: "too_many_requests",
        },
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.CreateAccount,
    httpMethod: HttpMethods.POST,
    rateLimiting: {},
    acceptedContentTypes: [ContentTypes.ApplicationJson],
    authenticationRequired: false,
    private: false,
    acceptedAuthenticationMethods: [],
    acceptedScopes: {},
    description: ["新規アカウントを作成します"],
}

type ReturnType = Promise<
    [UserEntity, LoginCredentialEntity, LoginSessionEntity, AuthenticityTokenEntity]
>

export default defineMethod(
    facts,
    argumentSpecs,
    expectedErrorSpecs,
    async (args, errors): ReturnType => {
        if (args.password !== args.confirmation_password) {
            raise(errors["confirmation_password_not_match"])
        }
        const transaction = await TransactionRepository.new<ReturnType>()
        try {
            return await transaction.$transaction(async (transactionSession) => {
                const name = generateRandomName(
                    (config.user.name.max_length - config.user.name.min_length) / 2
                )
                await new RegisterPasswordBasedUserApplication(
                    new UsersQueryRepository(transactionSession),
                    new UsersCommandRepository(transactionSession),
                    new LoginCredentialsCommandRepository(transactionSession)
                ).register({
                    name: name,
                    password: args.password,
                    ipAddress: args.ip_address,
                })
                const [user, loginCredential, loginSession, authenticityToken] =
                    await new SignInWithPasswordApplication(
                        new UsersQueryRepository(transactionSession),
                        new LoginCredentialsQueryRepository(transactionSession),
                        new LoginSessionsCommandRepository(transactionSession),
                        new AuthenticityTokenCommandRepository(transactionSession)
                    ).signin({
                        name: name,
                        password: args.password,
                        ipAddress: args.ip_address,
                        lastLocation: null,
                        device: null,
                    })
                throw new Error("Uwaaaaaaaaaaaaaaaaaaaa")
                return [user, loginCredential, loginSession, authenticityToken]
            })
        } catch (error) {
            if (error instanceof ApplicationError) {
                if (error.code === ErrorCodes.NameTaken) {
                    raise(errors["internal_error"], error)
                } else if (error.code === ErrorCodes.TooManyRequests) {
                    raise(errors["too_many_requests"], error)
                } else {
                    raise(errors["internal_error"], error)
                }
            } else if (error instanceof Error) {
                raise(errors["unexpected_error"], error)
            } else {
                raise(errors["unexpected_error"], new Error("unexpected_error"))
            }
        }
    }
)
