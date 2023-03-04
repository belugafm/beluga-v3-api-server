import * as vs from "../../../../domain/validation"

import {
    AccessTokenCommandRepository,
    ApplicationQueryRepository,
    TransactionRepository,
    UserCommandRepository,
    UserQueryRepository,
} from "../../../repositories"
import { CreateBotApplication, ErrorCodes } from "../../../../application/bot/CreateBot"
import { InternalErrorSpec, InvalidAuth, UnexpectedErrorSpec, raise } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"

import { ApplicationError } from "../../../../application/ApplicationError"
import { AuthenticationMethods } from "../../facts/authentication_method"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"
import { UserJsonObjectT } from "domain/types"
import { AccessTokenEntity } from "domain/entity/AccessToken"

export const argumentSpecs = defineArguments(["name", "display_name", "description"] as const, {
    name: {
        description: ["name"],
        examples: ["@your_bot_name"],
        required: true,
        validator: vs.user.NameValidator(),
    },
    display_name: {
        description: ["display_name"],
        examples: ["botの名前"],
        required: false,
        validator: vs.user.DisplayNameValidator(),
    },
    description: {
        description: ["botの説明"],
        examples: ["iPhone用クライアント"],
        required: false,
        validator: vs.user.DescriptionValidator(),
    },
    application_id: {
        description: ["アプリケーションID"],
        examples: ["123"],
        required: true,
        validator: vs.EntityIdValidator(),
    },
})

export const expectedErrorSpecs = defineErrors(
    [
        ErrorCodes.ApplicationNotFound,
        ErrorCodes.DescriptionNotMeetPolicy,
        ErrorCodes.DisplayNameNotMeetPolicy,
        ErrorCodes.NameNotMeetPolicy,
        ErrorCodes.NameTaken,
        ErrorCodes.DoNotHavePermission,
        "invalid_auth",
        "internal_error",
        "unexpected_error",
    ] as const,
    argumentSpecs,
    {
        app_not_found: {
            description: ["アプリケーションが見つかりません"],
            hint: [],
            code: "app_not_found",
            argument: "application_id",
        },
        description_not_meet_policy: {
            description: ["descriptionが不正です"],
            hint: [],
            code: "description_not_meet_policy",
            argument: "description",
        },
        display_name_not_meet_policy: {
            description: ["display_nameが不正です"],
            hint: [],
            code: "display_name_not_meet_policy",
            argument: "display_name",
        },
        name_not_meet_policy: {
            description: ["nameが不正です"],
            hint: [],
            code: "name_not_meet_policy",
            argument: "name",
        },
        name_taken: {
            description: ["その名前は既に使用されています"],
            hint: [],
            code: "name_taken",
            argument: "name",
        },
        do_not_have_permission: {
            description: ["botを作成する権限がありませんん"],
            hint: ["信用レベルを上げると作れるようになります"],
            code: "do_not_have_permission",
        },
        invalid_auth: new InvalidAuth(),
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.CreateBot,
    httpMethod: HttpMethods.POST,
    rateLimiting: {},
    acceptedContentTypes: [ContentTypes.ApplicationJson],
    userAuthenticationRequired: true,
    private: false,
    acceptedAuthenticationMethods: [AuthenticationMethods.Cookie],
    acceptedScopes: {},
    description: ["新規botを作成します"],
}

type ReturnType = Promise<[UserJsonObjectT, AccessTokenEntity]>

export default defineMethod(
    facts,
    argumentSpecs,
    expectedErrorSpecs,
    async (args, errors, authUser, _, remoteIpAddress): ReturnType => {
        const transaction = await TransactionRepository.new<ReturnType>()
        if (authUser == null) {
            raise(errors["invalid_auth"])
        }
        try {
            return await transaction.$transaction(async (transactionSession) => {
                const [user, accessToken] = await new CreateBotApplication(
                    new UserQueryRepository(transactionSession),
                    new UserCommandRepository(transactionSession),
                    new AccessTokenCommandRepository(transactionSession),
                    new ApplicationQueryRepository(transactionSession)
                ).create({
                    name: args.name,
                    displayName: args.display_name,
                    description: args.description,
                    appId: args.application_id,
                    ipAddress: remoteIpAddress,
                    createdBy: authUser.id,
                })
                return [user.toJsonObject(), accessToken]
            })
        } catch (error) {
            console.error(error)
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
    }
)
