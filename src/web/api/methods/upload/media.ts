import * as vs from "../../../../domain/validation"

import {
    FileCommandRepository,
    MediaRepository,
    StorageCommandRepository,
    TransactionRepository,
    UserQueryRepository,
} from "../../../repositories"
import { InternalErrorSpec, InvalidAuth, UnexpectedErrorSpec, raise } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"

import { ApplicationError } from "../../../../application/ApplicationError"
import { AuthenticationMethods } from "../../facts/authentication_method"
import { ContentTypes } from "../../facts/content_type"
import { ErrorCodes } from "../../../../application/channel/CreateChannel"
import { FileEntity } from "../../../../domain/entity/File"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"
import { UploadMediaApplication } from "../../../../application/media/UploadMedia"
import { UploadMediaPermission } from "../../../../domain/permission/UploadMedia"

export const argumentSpecs = defineArguments(["file"] as const, {
    file: {
        description: ["ファイルのBuffer"],
        examples: ["general"],
        required: true,
        validator: vs.buffer(),
    },
})

export const expectedErrorSpecs = defineErrors(
    [ErrorCodes.DoNotHavePermission, "invalid_auth", "internal_error", "unexpected_error"] as const,
    argumentSpecs,
    {
        do_not_have_permission: {
            description: ["ファイルをアップロードする権限がありませんん"],
            hint: ["信用レベルを上げるとアップロードできるようになります"],
            code: "do_not_have_permission",
        },
        invalid_auth: new InvalidAuth(),
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.UploadFile,
    httpMethod: HttpMethods.POST,
    rateLimiting: {},
    acceptedContentTypes: [ContentTypes.MultipartFormData],
    userAuthenticationRequired: true,
    private: false,
    acceptedAuthenticationMethods: [AuthenticationMethods.OAuth, AuthenticationMethods.Cookie],
    acceptedScopes: {},
    description: ["ファイルをアップロードします"],
}

type ReturnType = Promise<FileEntity[]>

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (args, errors, authUser): ReturnType => {
    const transaction = await TransactionRepository.new<ReturnType>()
    if (authUser == null) {
        raise(errors["invalid_auth"])
    }
    try {
        return await transaction.$transaction(async (transactionSession) => {
            const files = await new UploadMediaApplication(
                new FileCommandRepository(transactionSession),
                new StorageCommandRepository(),
                new MediaRepository(),
                new UploadMediaPermission(new UserQueryRepository(transactionSession))
            ).upload({
                userId: authUser.id,
                buffer: args.file,
            })
            return files
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
