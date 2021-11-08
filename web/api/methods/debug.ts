import * as vs from "../../../domain/validation"

import {
    AuthenticityTokenCommandRepository,
    LoginCredentialsCommandRepository,
    LoginSessionsCommandRepository,
    UsersCommandRepository,
    UsersQueryRepository,
} from "../../repositories"
import { InternalErrorSpec, UnexpectedErrorSpec, raise } from "../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../define"

import { ApplicationError } from "../../../application/ApplicationError"
import { ContentTypes } from "../facts/content_type"
import { HttpMethods } from "../facts/http_method"
import { LoginCredentialsQueryRepository } from "../../../infrastructure/mongodb/repository"
import { LoginSessionEntity } from "../../../domain/entity/LoginSession"
import { MethodIdentifiers } from "../identifier"
import { RegisterPasswordBasedUserApplication } from "../../../application/registration/RegisterPasswordBasedUser"
import { SignInWithPasswordApplication } from "../../../application/signin/SignInWithPassword"
import { TransactionRepository } from "../../../infrastructure/mongodb/repository/Transaction"
import { UserEntity } from "../../../domain/entity/User"
import config from "../../../config/app"
import crypto from "crypto"

export const argumentSpecs = defineArguments(["password"] as const, {
    password: {
        description: ["パスワード"],
        examples: ["do_not_use_this_password_0123"],
        required: true,
        validator: vs.password(),
    },
})

export const expectedErrorSpecs = defineErrors(
    [
        "password_not_meet_policy",
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
    url: MethodIdentifiers.Debug,
    httpMethod: HttpMethods.GET,
    rateLimiting: {},
    acceptedContentTypes: [ContentTypes.ApplicationJson],
    authenticationRequired: false,
    private: false,
    acceptedAuthenticationMethods: [],
    acceptedScopes: {},
    description: ["テスト用endpoint"],
}

export const generateRandomName = (length: number): string => {
    const S = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    const N = 16
    return Array.from(crypto.randomFillSync(new Uint8Array(N)))
        .map((n) => S[n % S.length])
        .join("")
}

export default defineMethod(
    facts,
    argumentSpecs,
    expectedErrorSpecs,
    async (args, errors): Promise<[UserEntity | null, LoginSessionEntity | null]> => {
        const transaction = await TransactionRepository.new()
        await transaction.begin()
        try {
            const name = generateRandomName(
                (config.user.name.max_length - config.user.name.min_length) / 2
            )
            await new RegisterPasswordBasedUserApplication(
                new UsersQueryRepository(transaction),
                new UsersCommandRepository(transaction),
                new LoginCredentialsCommandRepository(transaction)
            ).register({
                name: name,
                password: args.password,
                ipAddress: "127.0.0.1",
            })
            const [user, _, loginSession] = await new SignInWithPasswordApplication(
                new UsersQueryRepository(transaction),
                new LoginCredentialsQueryRepository(transaction),
                new LoginSessionsCommandRepository(transaction),
                new AuthenticityTokenCommandRepository(transaction)
            ).signin({
                name: name,
                password: args.password,
                ipAddress: "127.0.0.1",
                lastLocation: null,
                device: null,
            })
            await transaction.commit()
            await transaction.end()
            return [user, loginSession]
        } catch (error) {
            await transaction.rollback()
            await transaction.end()
            if (error instanceof ApplicationError) {
                raise(errors["internal_error"], error)
            } else if (error instanceof Error) {
                raise(errors["unexpected_error"], error)
            } else {
                raise(errors["unexpected_error"], new Error("unexpected_error"))
            }
        }
        return [null, null]
    }
)
