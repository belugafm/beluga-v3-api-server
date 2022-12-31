import { InviteQueryRepository } from "../../../repositories"
import { InternalErrorSpec, UnexpectedErrorSpec, raise, InvalidAuth } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"

import { AuthenticationMethods } from "../../facts/authentication_method"
import { InviteJsonObjectT } from "../../../../domain/types"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"
import { SortBy, SortOrder } from "../../../../domain/repository/query/Invite"

export const argumentSpecs = defineArguments([] as const, {})

export const expectedErrorSpecs = defineErrors(
    ["internal_error", "unexpected_error", "invalid_auth"] as const,
    argumentSpecs,
    {
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
        invalid_auth: new InvalidAuth(),
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
    description: ["自分が作成した招待の一覧を取得します"],
}

type ReturnType = Promise<InviteJsonObjectT[]>

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (args, errors, authUser): ReturnType => {
    if (authUser == null) {
        raise(errors["invalid_auth"])
    }
    try {
        const invites = await new InviteQueryRepository().findByInviterId(
            authUser.id,
            SortBy["CreatedAt"],
            SortOrder["Descending"]
        )
        return invites.map((invite) => {
            return invite.toJsonObject()
        })
    } catch (error) {
        if (error instanceof Error) {
            raise(errors["unexpected_error"], error)
        } else {
            raise(errors["unexpected_error"], new Error("unexpected_error"))
        }
    }
})
