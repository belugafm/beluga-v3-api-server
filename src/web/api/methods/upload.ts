import * as vs from "../../../domain/validation"

import { InternalErrorSpec, InvalidAuth, UnexpectedErrorSpec, raise } from "../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../define"

import { ApplicationError } from "../../../application/ApplicationError"
import { AuthenticationMethods } from "../facts/authentication_method"
import { ContentTypes } from "../facts/content_type"
import { ErrorCodes } from "../../../application/channel/CreateChannel"
import { HttpMethods } from "../facts/http_method"
import { MethodIdentifiers } from "../identifier"
import { StorageCommandRepository } from "../../repositories"
import { fromBuffer } from "file-type"
import { generateRandomName } from "../../../domain/entity/User"

export const argumentSpecs = defineArguments(["file"] as const, {
    file: {
        description: ["ファイルのBufferのリスト"],
        examples: ["general"],
        required: true,
        validator: vs.files(),
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
    authenticationRequired: true,
    private: false,
    acceptedAuthenticationMethods: [
        AuthenticationMethods.OAuth,
        AuthenticationMethods.AccessToken,
        AuthenticationMethods.Cookie,
    ],
    acceptedScopes: {},
    description: ["ファイルをアップロードします"],
}

type ReturnType = Promise<void>

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (args, errors, authUser): ReturnType => {
    // const transaction = await TransactionRepository.new<ReturnType>()
    if (authUser == null) {
        raise(errors["invalid_auth"])
    }
    try {
        const buffer = args.file[0]
        const basename = generateRandomName(24)
        const fileType = await fromBuffer(buffer)
        if (fileType == null) {
            raise(errors["unexpected_error"])
        }
        const { ext } = fileType
        new StorageCommandRepository().put(buffer, basename + "." + ext)
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
