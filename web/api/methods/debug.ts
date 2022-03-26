import { InternalErrorSpec, UnexpectedErrorSpec } from "../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../define"

import { ContentTypes } from "../facts/content_type"
import { HttpMethods } from "../facts/http_method"
import { MethodIdentifiers } from "../identifier"

export const argumentSpecs = defineArguments([] as const, {})

export const expectedErrorSpecs = defineErrors(
    ["internal_error", "unexpected_error"] as const,
    argumentSpecs,
    {
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

export default defineMethod(
    facts,
    argumentSpecs,
    expectedErrorSpecs,
    async (args, errors): Promise<boolean> => {
        return true
    }
)
