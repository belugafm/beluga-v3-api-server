import * as vs from "../../../../domain/validation"

import {
    FavoriteCommandRepository,
    FavoriteQueryRepository,
    MessageCommandRepository,
    MessageQueryRepository,
    TransactionRepository,
    UserQueryRepository,
} from "../../../repositories"
import { CreateFavoriteApplication, ErrorCodes } from "../../../../application/favorite/CreateFavorite"
import { InternalErrorSpec, InvalidAuth, UnexpectedErrorSpec, raise } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"

import { ApplicationError } from "../../../../application/ApplicationError"
import { AuthenticationMethods } from "../../facts/authentication_method"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"

export const argumentSpecs = defineArguments(["message_id"] as const, {
    message_id: {
        description: ["「ふぁぼ」するメッセージのID"],
        examples: ["99999"],
        required: true,
        validator: vs.messageId(),
    },
})

export const expectedErrorSpecs = defineErrors(
    [
        ErrorCodes.DoNotHavePermission,
        ErrorCodes.CanNotFavoriteYourOwnMessage,
        "invalid_auth",
        "internal_error",
        "unexpected_error",
    ] as const,
    argumentSpecs,
    {
        do_not_have_permission: {
            description: ["このメッセージに「ふぁぼ」する権限がありません"],
            hint: ["信用レベルを上げると「ふぁぼ」できるようになります"],
            code: "do_not_have_permission",
        },
        can_not_favorite_your_own_message: {
            description: ["自分のメッセージに「ふぁぼ」することはできません"],
            hint: [],
            code: "can_not_favorite_your_own_message",
        },
        invalid_auth: new InvalidAuth(),
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.CreateFavorite,
    httpMethod: HttpMethods.POST,
    rateLimiting: {},
    acceptedContentTypes: [ContentTypes.ApplicationJson],
    authenticationRequired: true,
    private: false,
    acceptedAuthenticationMethods: [
        AuthenticationMethods.OAuth,
        AuthenticationMethods.AccessToken,
        AuthenticationMethods.Cookie,
    ],
    acceptedScopes: {},
    description: ["メッセージを「ふぁぼ」します"],
}

type ReturnType = Promise<boolean>

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (args, errors, authUser): ReturnType => {
    const transaction = await TransactionRepository.new<ReturnType>()
    if (authUser == null) {
        raise(errors["invalid_auth"])
    }
    try {
        return await transaction.$transaction(async (transactionSession) => {
            return await new CreateFavoriteApplication(
                new UserQueryRepository(transactionSession),
                new MessageQueryRepository(transactionSession),
                new MessageCommandRepository(transactionSession),
                new FavoriteQueryRepository(transactionSession),
                new FavoriteCommandRepository(transactionSession)
            ).delete({
                messageId: args.message_id,
                requestUserId: authUser.id,
            })
        })
    } catch (error) {
        if (error instanceof ApplicationError) {
            if (error.code === ErrorCodes.DoNotHavePermission) {
                raise(errors["do_not_have_permission"], error)
            } else if (error.code === ErrorCodes.CanNotFavoriteYourOwnMessage) {
                raise(errors["can_not_favorite_your_own_message"], error)
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
