import { ApplicationQueryRepository } from "../../../repositories"
import { ListAppsApplication } from "../../../../application/app/ListApps"
import { InternalErrorSpec, InvalidAuth, UnexpectedErrorSpec, raise } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"

import { ApplicationError } from "../../../../application/ApplicationError"
import { AuthenticationMethods } from "../../facts/authentication_method"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"
import { ApplicationEntity } from "../../../../domain/entity/Application"

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
    url: MethodIdentifiers.ListApps,
    httpMethod: HttpMethods.GET,
    rateLimiting: {},
    acceptedContentTypes: [ContentTypes.ApplicationJson],
    userAuthenticationRequired: true,
    private: false,
    acceptedAuthenticationMethods: [AuthenticationMethods.Cookie],
    acceptedScopes: {},
    description: ["自分が作成したアプリケーション一覧を取得します"],
}

type ReturnType = Promise<ApplicationEntity[]>

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (args, errors, authUser): ReturnType => {
    if (authUser == null) {
        raise(errors["invalid_auth"])
    }
    try {
        return await new ListAppsApplication(new ApplicationQueryRepository()).list({
            userId: authUser.id,
        })
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
