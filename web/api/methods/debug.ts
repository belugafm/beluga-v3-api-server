import * as vs from "../../../domain/validation"

import { InternalErrorSpec, UnexpectedErrorSpec, raise } from "../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../define"

import { ApplicationError } from "../../../application/ApplicationError"
import { ContentTypes } from "../facts/content_type"
import { ErrorCodes } from "../../../application/registration/RegisterPasswordBasedUser"
import { HttpMethods } from "../facts/http_method"
import { MethodIdentifiers } from "../identifier"
import { TransactionRepository } from "../../../infrastructure/mongodb/repository/Transaction"
import { UserEntity } from "../../../domain/entity/User"
import config from "../../../config/app"

export const argumentSpecs = defineArguments(["name"] as const, {
    name: {
        description: ["ユーザー名"],
        examples: ["beluga"],
        required: true,
        validator: vs.user.name(),
    },
})

export const expectedErrorSpecs = defineErrors(
    ["user_name_taken", "user_name_not_meet_policy", "internal_error", "unexpected_error"] as const,
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
        user_name_taken: {
            description: ["このユーザー名はすでに取得されているため、新規作成できません"],
            hint: ["別のユーザー名でアカウントを作成してください"],
            code: "user_name_taken",
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
    acceptedAuthenticationMethods: [],
    acceptedScopes: {},
    description: ["テスト用endpoint"],
}

export default defineMethod(
    facts,
    argumentSpecs,
    expectedErrorSpecs,
    async (args, errors): Promise<UserEntity | null> => {
        const transaction = await TransactionRepository.new()
        await transaction.begin()
        try {
            await transaction.commit()
            await transaction.end()
            return null
        } catch (error) {
            await transaction.rollback()
            await transaction.end()
            if (error instanceof ApplicationError) {
                if (error.code === ErrorCodes.NameTaken) {
                    raise(errors["user_name_taken"], error)
                } else {
                    raise(errors["internal_error"], error)
                }
            } else if (error instanceof Error) {
                raise(errors["unexpected_error"], error)
            } else {
                raise(errors["unexpected_error"], new Error("unexpected_error"))
            }
        }
        return null
    }
)
