import * as vs from "../../../../domain/validation"

import { ApplicationCommandRepository, TransactionRepository, UserQueryRepository } from "../../../repositories"
import { CreateAppApplication, ErrorCodes } from "../../../../application/app/CreateApp"
import { InternalErrorSpec, InvalidAuth, UnexpectedErrorSpec, raise } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"

import { ApplicationError } from "../../../../application/ApplicationError"
import { AuthenticationMethods } from "../../facts/authentication_method"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"
import { ApplicationEntity, ErrorCodes as DomainErrorCodes } from "../../../../domain/entity/Application"

export const argumentSpecs = defineArguments(["name", "description", "callback_url", "read", "write"] as const, {
    name: {
        description: ["アプリケーション名"],
        examples: ["shooting star"],
        required: true,
        validator: vs.application.NameValidator(),
    },
    description: {
        description: ["アプリケーションの説明"],
        examples: ["iPhone用クライアント"],
        required: true,
        validator: vs.application.DescriptionValidator(),
    },
    callback_url: {
        description: ["コールバックURL"],
        examples: ["app://beluga"],
        required: true,
        validator: vs.StringValidator({ minLength: 1, maxLength: 300 }),
    },
    read: {
        description: ["読み取り権限を付与"],
        examples: ["true"],
        required: true,
        validator: vs.BooleanValidator(),
    },
    write: {
        description: ["書き込み権限を付与"],
        examples: ["true"],
        required: true,
        validator: vs.BooleanValidator(),
    },
})

export const expectedErrorSpecs = defineErrors(
    [
        ErrorCodes.DoNotHavePermission,
        DomainErrorCodes.InvalidName,
        DomainErrorCodes.InvalidDescription,
        DomainErrorCodes.InvalidCallbackUrl,
        DomainErrorCodes.InvalidReadPermission,
        DomainErrorCodes.InvalidWritePermission,
        "invalid_auth",
        "internal_error",
        "unexpected_error",
    ] as const,
    argumentSpecs,
    {
        do_not_have_permission: {
            description: ["アプリケーションを作成する権限がありませんん"],
            hint: ["信用レベルを上げると作れるようになります"],
            code: "do_not_have_permission",
        },
        invalid_name: {
            description: [""],
            hint: [],
            code: "invalid_name",
            argument: "name",
        },
        invalid_description: {
            description: [""],
            hint: [],
            code: "invalid_description",
            argument: "description",
        },
        invalid_callback_url: {
            description: [""],
            hint: [],
            code: "invalid_callback_url",
            argument: "callback_url",
        },
        invalid_read_permission: {
            description: [""],
            hint: [],
            code: "invalid_read_permission",
            argument: "read",
        },
        invalid_write_permission: {
            description: [""],
            hint: [],
            code: "invalid_write_permission",
            argument: "write",
        },
        invalid_auth: new InvalidAuth(),
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.CreateApp,
    httpMethod: HttpMethods.POST,
    rateLimiting: {},
    acceptedContentTypes: [ContentTypes.ApplicationJson],
    userAuthenticationRequired: true,
    private: false,
    acceptedAuthenticationMethods: [AuthenticationMethods.Cookie],
    acceptedScopes: {},
    description: ["新規アプリケーションを作成します"],
}

type ReturnType = Promise<ApplicationEntity>

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (args, errors, authUser): ReturnType => {
    const transaction = await TransactionRepository.new<ReturnType>()
    if (authUser == null) {
        raise(errors["invalid_auth"])
    }
    try {
        return await transaction.$transaction(async (transactionSession) => {
            const channel = await new CreateAppApplication(
                new UserQueryRepository(transactionSession),
                new ApplicationCommandRepository(transactionSession)
            ).create({
                name: args.name,
                userId: authUser.id,
                description: args.description,
                callbackUrl: args.callback_url,
                read: args.read,
                write: args.write,
            })
            return channel
        })
    } catch (error) {
        if (error instanceof ApplicationError) {
            if (error.code === ErrorCodes.DoNotHavePermission) {
                raise(errors["do_not_have_permission"], error)
            } else if (error.code === ErrorCodes.DoNotHavePermission) {
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
