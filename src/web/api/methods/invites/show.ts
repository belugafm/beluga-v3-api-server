import * as vs from "../../../../domain/validation"

import { InviteQueryRepository } from "../../../repositories"
import { InternalErrorSpec, UnexpectedErrorSpec, raise } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"

import { AuthenticationMethods } from "../../facts/authentication_method"
import { InviteJsonObjectT } from "../../../../domain/types"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"

export const argumentSpecs = defineArguments(["verifier"] as const, {
    verifier: {
        description: [],
        examples: ["123456"],
        required: true,
        validator: vs.invite.VerifierValidator(),
    },
})

export const expectedErrorSpecs = defineErrors(
    ["missing_argument", "not_found", "internal_error", "unexpected_error"] as const,
    argumentSpecs,
    {
        missing_argument: {
            description: ["`verifier`を指定してください"],
            hint: [],
            code: "missing_argument",
        },
        not_found: {
            description: ["指定された招待が見つかりませんでした"],
            hint: [],
            code: "not_found",
        },
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.ShowInvite,
    httpMethod: HttpMethods.GET,
    rateLimiting: {},
    acceptedContentTypes: [ContentTypes.ApplicationJson],
    userAuthenticationRequired: true,
    private: false,
    acceptedAuthenticationMethods: [AuthenticationMethods.OAuth, AuthenticationMethods.Cookie],
    acceptedScopes: {},
    description: ["招待を取得します"],
}

type ReturnType = Promise<InviteJsonObjectT | null>

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (args, errors, authUser): ReturnType => {
    if (args.verifier == null) {
        raise(errors["missing_argument"])
    }
    try {
        const invite = await new InviteQueryRepository().findByVerifier(args.verifier)
        if (invite == null) {
            return null
        }
        return invite.toJsonObject()
    } catch (error) {
        if (error instanceof Error) {
            raise(errors["unexpected_error"], error)
        } else {
            raise(errors["unexpected_error"], new Error("unexpected_error"))
        }
    }
})
