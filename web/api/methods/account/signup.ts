import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"
import { MethodFacts, defineMethod, defineArguments, defineErrors } from "../../define"
import * as vs from "../../../../domain/validation"
import { InternalErrorSpec, UnexpectedErrorSpec, raise } from "../../error"
import { DomainError } from "../../../../domain/error"
import config from "../../../../config/app"
import { RegisterUserApplication, ErrorCodes } from "../../../../application/RegisterUser"
import { UsersRepository, UserRegistrationRepository } from "../../../repository"
import { UserEntity } from "../../../../domain/entity/User"

export const argumentSpecs = defineArguments(
    ["name", "password", "confirmationPassword", "ipAddress"] as const,
    {
        name: {
            description: ["ユーザー名"],
            examples: ["beluga"],
            required: true,
            schema: vs.user.name(),
        },
        password: {
            description: ["パスワード"],
            examples: ["do_not_use_this_password_0123"],
            required: true,
            schema: vs.password(),
        },
        confirmationPassword: {
            description: ["確認用のパスワード"],
            examples: ["do_not_use_this_password_0123"],
            required: true,
            schema: vs.password(),
        },
        ipAddress: {
            description: ["登録時のIPアドレス"],
            examples: ["192.168.1.1"],
            required: true,
            schema: vs.ip_address(),
        },
    }
)

export const expected_error_specs = defineErrors(
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
    expected_error_specs,
    async (args, errors): Promise<UserEntity | null> => {
        if (args.password !== args.confirmationPassword) {
            raise(errors["confirmation_password_not_match"])
        }
        try {
            const usersRepository = new UsersRepository()
            const userRegistrationRepository = new UserRegistrationRepository()
            const app = new RegisterUserApplication(usersRepository, userRegistrationRepository)
            return await app.register({
                name: args.name,
                password: args.password,
                ipAddress: args.ipAddress,
            })
        } catch (error) {
            if (error instanceof DomainError) {
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
