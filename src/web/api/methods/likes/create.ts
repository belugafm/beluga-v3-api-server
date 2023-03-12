import * as vs from "../../../../domain/validation"

import {
    LikeCommandRepository,
    LikeQueryRepository,
    MessageCommandRepository,
    MessageQueryRepository,
    TransactionRepository,
    UserQueryRepository,
} from "../../../repositories"
import { CreateLikeApplication, ErrorCodes } from "../../../../application/like/CreateLike"
import { InternalErrorSpec, InvalidAuth, UnexpectedErrorSpec, raise } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"

import { ApplicationError } from "../../../../application/ApplicationError"
import { AuthenticationMethods } from "../../facts/authentication_method"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"
import { MessageJsonObjectT } from "../../../../domain/types"
import { includeMessageRelations } from "../../relations/message"

export const argumentSpecs = defineArguments(["message_id"] as const, {
    message_id: {
        description: ["「いいね」するメッセージのID"],
        examples: ["99999"],
        required: true,
        validator: vs.MessageIdValidator(),
    },
})

export const expectedErrorSpecs = defineErrors(
    [
        ErrorCodes.DoNotHavePermission,
        ErrorCodes.CanNotLikeYourOwnMessage,
        ErrorCodes.ReachedMaxCount,
        "invalid_auth",
        "internal_error",
        "unexpected_error",
    ] as const,
    argumentSpecs,
    {
        do_not_have_permission: {
            description: ["このメッセージに「いいね」する権限がありません"],
            hint: ["信用レベルを上げると「いいね」できるようになります"],
            code: "do_not_have_permission",
        },
        can_not_like_your_own_message: {
            description: ["自分のメッセージに「いいね」することはできません"],
            hint: [],
            code: "can_not_like_your_own_message",
        },
        reached_max_count: {
            description: ["これ以上「いいね」することはできません"],
            hint: [],
            code: "reached_max_count",
        },
        invalid_auth: new InvalidAuth(),
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.CreateLike,
    httpMethod: HttpMethods.POST,
    rateLimiting: {},
    acceptedContentTypes: [ContentTypes.ApplicationJson],
    userAuthenticationRequired: true,
    private: false,
    acceptedAuthenticationMethods: [AuthenticationMethods.OAuth, AuthenticationMethods.Cookie],
    acceptedScopes: {},
    description: ["メッセージに「いいね」を1回します"],
}

type ReturnType = Promise<MessageJsonObjectT>

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (args, errors, authUser): ReturnType => {
    const transaction = await TransactionRepository.new<Promise<boolean>>()
    if (authUser == null) {
        raise(errors["invalid_auth"])
    }
    try {
        await transaction.$transaction(async (transactionSession) => {
            return await new CreateLikeApplication(
                new UserQueryRepository(transactionSession),
                new MessageQueryRepository(transactionSession),
                new MessageCommandRepository(transactionSession),
                new LikeQueryRepository(transactionSession),
                new LikeCommandRepository(transactionSession)
            ).create({
                messageId: args.message_id,
                requestUserId: authUser.id,
            })
        })
        const message = await new MessageQueryRepository().findById(args.message_id)
        if (message == null) {
            raise(errors["unexpected_error"])
        }
        return includeMessageRelations(message.toJsonObject(), authUser)
    } catch (error) {
        if (error instanceof ApplicationError) {
            if (error.code === ErrorCodes.DoNotHavePermission) {
                raise(errors["do_not_have_permission"], error)
            } else if (error.code === ErrorCodes.CanNotLikeYourOwnMessage) {
                raise(errors["can_not_like_your_own_message"], error)
            } else if (error.code === ErrorCodes.ReachedMaxCount) {
                raise(errors["reached_max_count"], error)
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
