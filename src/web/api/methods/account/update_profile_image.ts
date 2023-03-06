import * as vs from "../../../../domain/validation"

import {
    MediaRepository,
    StorageCommandRepository,
    TransactionRepository,
    UserQueryRepository,
    UserCommandRepository,
} from "../../../repositories"
import { InternalErrorSpec, InvalidAuth, UnexpectedErrorSpec, raise } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"

import { ApplicationError } from "../../../../application/ApplicationError"
import { AuthenticationMethods } from "../../facts/authentication_method"
import { ContentTypes } from "../../facts/content_type"
import { ErrorCodes } from "../../../../application/channel/CreateChannel"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"
import { UpdateProfileImageApplication } from "../../../../application/account/UpdateProfileImage"
import { UpdateProfileImagePermission } from "../../../../domain/permission/UpdateProfileImage"
import { FileJsonObjectT } from "../../../../domain/types"

export const argumentSpecs = defineArguments(["file", "user_id"] as const, {
    file: {
        description: ["ファイルのBuffer"],
        examples: ["general"],
        required: true,
        validator: vs.BufferValidator(),
    },
    user_id: {
        description: ["プロフィール画像を変更したいユーザーのID", "指定しない場合は認証されたユーザーが対象になる"],
        examples: ["123"],
        required: false,
        validator: vs.EntityIdValidator(),
    },
})

export const expectedErrorSpecs = defineErrors(
    [ErrorCodes.DoNotHavePermission, "invalid_auth", "internal_error", "unexpected_error"] as const,
    argumentSpecs,
    {
        do_not_have_permission: {
            description: ["プロフィール画像の変更が許可されていません"],
            hint: ["信用レベルを上げると変更できるようになります"],
            code: "do_not_have_permission",
        },
        invalid_auth: new InvalidAuth(),
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.UpdateProfileImage,
    httpMethod: HttpMethods.POST,
    rateLimiting: {},
    acceptedContentTypes: [ContentTypes.MultipartFormData],
    userAuthenticationRequired: true,
    private: false,
    acceptedAuthenticationMethods: [AuthenticationMethods.OAuth, AuthenticationMethods.Cookie],
    acceptedScopes: {},
    description: ["プロフィール画像を変更します"],
}

type ReturnType = Promise<FileJsonObjectT>

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (args, errors, authUser): ReturnType => {
    const transaction = await TransactionRepository.new<ReturnType>()
    if (authUser == null) {
        raise(errors["invalid_auth"])
    }
    try {
        return await transaction.$transaction(async (transactionSession) => {
            const file = await new UpdateProfileImageApplication(
                new UserQueryRepository(transactionSession),
                new UserCommandRepository(transactionSession),
                new StorageCommandRepository(),
                new MediaRepository(),
                new UpdateProfileImagePermission(new UserQueryRepository(transactionSession))
            ).upload({
                userIdToChange: args.user_id ? args.user_id : authUser.id,
                authUserId: authUser.id,
                buffer: args.file,
            })
            return file.toJsonObject()
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
