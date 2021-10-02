import * as vs from "../../../../domain/validation"

import {
    ErrorCodes,
    RegisterPasswordBasedUserApplication,
} from "../../../../application/registration/RegisterPasswordBasedUser"
import { InternalErrorSpec, UnexpectedErrorSpec, raise } from "../../error"
import {
    LoginCredentialsQueryRepository,
    UsersCommandRepository,
    UsersQueryRepository,
} from "../../../repositories"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"

import { ApplicationError } from "../../../../application/ApplicationError"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"
import { TransactionRepository } from "../../../../infrastructure/mongodb/repository/Transaction"
import { UserEntity } from "../../../../domain/entity/User"
import config from "../../../../config/app"

export const argumentSpecs = defineArguments(
    ["name", "password", "confirmationPassword", "ipAddress"] as const,
    {
        name: {
            description: ["ユーザー名"],
            examples: ["beluga"],
            required: true,
            validator: vs.user.name(),
        },
        password: {
            description: ["パスワード"],
            examples: ["do_not_use_this_password_0123"],
            required: true,
            validator: vs.password(),
        },
        confirmationPassword: {
            description: ["確認用のパスワード"],
            examples: ["do_not_use_this_password_0123"],
            required: true,
            validator: vs.password(),
        },
        ipAddress: {
            description: ["登録時のIPアドレス"],
            examples: ["192.168.1.1"],
            required: true,
            validator: vs.ipAddress(),
        },
        lastLocation: {
            description: ["IP Geolocationの結果"],
            examples: ["Shinjuku-ku, Tokyo, Japan"],
            required: false,
            validator: vs.string(),
        },
        device: {
            description: ["User-Agentなど"],
            examples: ["Chrome on Linux"],
            required: false,
            validator: vs.string(),
        },
    }
)

export const expectedErrorSpecs = defineErrors(
    [
        "user_name_taken",
        "user_name_not_meet_policy",
        "password_not_meet_policy",
        "confirmation_password_not_match",
        "too_many_requests",
        "internal_error",
        "unexpected_error",
    ] as const,
    argumentSpecs,
    {
        user_name_not_meet_policy: {
            description: ["ユーザー名が基準を満たしていません"],
            hint: [
                `ユーザー名は${config.user.name.min_length}〜${config.user.name.max_length}文字の半角英数字に設定してください`,
            ],
            argument: "name",
            code: "user_name_not_meet_policy",
        },
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
            argument: "confirmationPassword",
            code: "confirmation_password_not_match",
        },
        user_name_taken: {
            description: ["このユーザー名はすでに取得されているため、新規作成できません"],
            hint: ["別のユーザー名でアカウントを作成してください"],
            code: "user_name_taken",
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
    acceptedAuthenticationMethods: [],
    acceptedScopes: {},
    description: ["新規アカウントを作成します"],
}

export default defineMethod(
    facts,
    argumentSpecs,
    expectedErrorSpecs,
    async (args, errors): Promise<UserEntity | null> => {
        if (args.password !== args.confirmationPassword) {
            raise(errors["confirmation_password_not_match"])
        }
        const transaction = await TransactionRepository.new()
        await transaction.begin()
        try {
            const app = new RegisterPasswordBasedUserApplication(
                new UsersQueryRepository(transaction),
                new UsersCommandRepository(transaction),
                new LoginCredentialsQueryRepository(transaction)
            )
            const [user, _] = await app.register({
                name: args.name,
                password: args.password,
                ipAddress: args.ipAddress,
                lastLocation: args.lastLocation ? args.lastLocation : null,
                device: args.device ? args.device : null,
            })
            await transaction.commit()
            await transaction.end()
            return user
        } catch (error) {
            await transaction.rollback()
            await transaction.end()
            if (error instanceof ApplicationError) {
                if (error.code === ErrorCodes.NameTaken) {
                    raise(errors["user_name_taken"], error)
                } else if (error.code === ErrorCodes.TooManyRequests) {
                    raise(errors["too_many_requests"], error)
                } else {
                    raise(errors["internal_error"], error)
                }
            } else {
                raise(errors["unexpected_error"], error)
            }
        }
        return null
    }
)
