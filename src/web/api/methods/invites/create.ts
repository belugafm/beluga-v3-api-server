import { InternalErrorSpec, UnexpectedErrorSpec, raise, InvalidAuth } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"
import { TransactionRepository, UserQueryRepository, InviteCommandRepository } from "../../../repositories"
import { AuthenticationMethods } from "../../facts/authentication_method"
import { InviteJsonObjectT } from "../../../../domain/types"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"
import { CreateInviteApplication, ErrorCodes } from "../../../../application/invite/CreateInvite"
import { ApplicationError } from "../../../../application/ApplicationError"

export const argumentSpecs = defineArguments([] as const, {})

export const expectedErrorSpecs = defineErrors(
    [ErrorCodes.DoNotHavePermission, "invalid_auth", "internal_error", "unexpected_error"] as const,
    argumentSpecs,
    {
        do_not_have_permission: {
            description: ["招待を作成する権限がありません"],
            hint: [],
            code: "do_not_have_permission",
        },
        invalid_auth: new InvalidAuth(),
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

type ReturnType = Promise<InviteJsonObjectT>

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (args, errors, authUser): ReturnType => {
    const transaction = await TransactionRepository.new<ReturnType>()
    if (authUser == null) {
        raise(errors["invalid_auth"])
    }
    try {
        return await transaction.$transaction(async (transactionSession) => {
            const invite = await new CreateInviteApplication(
                new UserQueryRepository(transactionSession),
                new InviteCommandRepository(transactionSession)
            ).create(authUser.id)
            return invite.toJsonObject()
        })
    } catch (error) {
        if (error instanceof ApplicationError) {
            if (error.code === ErrorCodes.DoNotHavePermission) {
                raise(errors["do_not_have_permission"], error)
            } else {
                raise(errors["internal_error"], error)
            }
        } else if (error instanceof Error) {
            raise(errors["unexpected_error"], error)
        } else {
            raise(errors["unexpected_error"], new Error("unexpected_error"))
        }
    }
})
