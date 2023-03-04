import { UserQueryRepository } from "../../../repositories"
import { InternalErrorSpec, InvalidAuth, UnexpectedErrorSpec, raise } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"

import { ApplicationError } from "../../../../application/ApplicationError"
import { AuthenticationMethods } from "../../facts/authentication_method"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"
import { ListBotsApplication } from "../../../../application/bot/ListBots"
import { UserJsonObjectT } from "../../../../domain/types"

export const argumentSpecs = defineArguments([] as const, {})

export const expectedErrorSpecs = defineErrors(
    ["invalid_auth", "internal_error", "unexpected_error"] as const,
    argumentSpecs,
    {
        invalid_auth: new InvalidAuth(),
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.ListBots,
    httpMethod: HttpMethods.GET,
    rateLimiting: {},
    acceptedContentTypes: [ContentTypes.ApplicationJson],
    userAuthenticationRequired: true,
    private: false,
    acceptedAuthenticationMethods: [AuthenticationMethods.Cookie],
    acceptedScopes: {},
    description: ["自分が作成したbot一覧を取得します"],
}

type ReturnType = Promise<UserJsonObjectT[]>

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (_, errors, authUser): ReturnType => {
    if (authUser == null) {
        raise(errors["invalid_auth"])
    }
    try {
        const bots = await new ListBotsApplication(new UserQueryRepository()).list({
            userId: authUser.id,
        })
        return bots.map((bot) => bot.toJsonObject())
    } catch (error) {
        if (error instanceof ApplicationError) {
            raise(errors["internal_error"], error)
        } else if (error instanceof Error) {
            raise(errors["unexpected_error"], error)
        } else {
            raise(errors["unexpected_error"], new Error("unexpected_error"))
        }
    }
})
