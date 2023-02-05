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
import { MessageJsonObjectT } from "../../../../domain/types"

export const argumentSpecs = defineArguments(["message_id"] as const, {
    message_id: {
        description: ["「ふぁぼ」するメッセージのID"],
        examples: ["99999"],
        required: true,
        validator: vs.MessageIdValidator(),
    },
})

export const expectedErrorSpecs = defineErrors(
    [
        ErrorCodes.DoNotHavePermission,
        ErrorCodes.AlreadyFavorited,
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
        already_favorited: {
            description: ["すでに「ふぁぼ」しています"],
            hint: [],
            code: "already_favorited",
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
    userAuthenticationRequired: true,
    private: false,
    acceptedAuthenticationMethods: [AuthenticationMethods.OAuth, AuthenticationMethods.Cookie],
    acceptedScopes: {},
    description: ["メッセージを「ふぁぼ」します"],
}

type ReturnType = Promise<MessageJsonObjectT>

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (args, errors, authUser): ReturnType => {
    const transaction = await TransactionRepository.new<Promise<boolean>>()
    if (authUser == null) {
        raise(errors["invalid_auth"])
    }
    try {
        await transaction.$transaction(async (transactionSession) => {
            return await new CreateFavoriteApplication(
                new UserQueryRepository(transactionSession),
                new MessageQueryRepository(transactionSession),
                new MessageCommandRepository(transactionSession),
                new FavoriteQueryRepository(transactionSession),
                new FavoriteCommandRepository(transactionSession)
            ).create({
                messageId: args.message_id,
                requestUserId: authUser.id,
            })
        })
        return (await new MessageQueryRepository().findById(args.message_id))!.toJsonObject()
    } catch (error) {
        if (error instanceof ApplicationError) {
            if (error.code === ErrorCodes.DoNotHavePermission) {
                raise(errors["do_not_have_permission"], error)
            } else if (error.code === ErrorCodes.AlreadyFavorited) {
                raise(errors["already_favorited"], error)
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
