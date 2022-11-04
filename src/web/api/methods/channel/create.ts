import * as vs from "../../../../domain/validation"

import {
    ChannelCommandRepository,
    ChannelGroupQueryRepository,
    TransactionRepository,
    UserQueryRepository,
} from "../../../repositories"
import { CreateChannelApplication, ErrorCodes } from "../../../../application/channel/CreateChannel"
import { InternalErrorSpec, InvalidAuth, UnexpectedErrorSpec, raise } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"

import { ApplicationError } from "../../../../application/ApplicationError"
import { AuthenticationMethods } from "../../facts/authentication_method"
import { ChannelEntity } from "../../../../domain/entity/Channel"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"

export const argumentSpecs = defineArguments(["name", "parent_channel_group_id"] as const, {
    name: {
        description: ["チャンネル名"],
        examples: ["general"],
        required: true,
        validator: vs.channelGroup.name(),
    },
    parent_channel_group_id: {
        description: ["親のチャンネルグループID"],
        examples: ["123456"],
        required: true,
        validator: vs.channelGroupId(),
    },
})

export const expectedErrorSpecs = defineErrors(
    [
        ErrorCodes.DoNotHavePermission,
        ErrorCodes.NameNotMeetPolicy,
        "invalid_auth",
        "internal_error",
        "unexpected_error",
    ] as const,
    argumentSpecs,
    {
        do_not_have_permission: {
            description: ["チャンネルを作成する権限がありませんん"],
            hint: ["信用レベルを上げると作れるようになります"],
            code: "do_not_have_permission",
        },
        name_not_meet_policy: {
            description: ["チャンネル名に使用できない文字が含まれています"],
            hint: ["空白は入力できません"],
            argument: "name",
            code: "name_not_meet_policy",
        },
        invalid_auth: new InvalidAuth(),
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.CreateChannel,
    httpMethod: HttpMethods.POST,
    rateLimiting: {},
    acceptedContentTypes: [ContentTypes.ApplicationJson],
    userAuthenticationRequired: true,
    private: false,
    acceptedAuthenticationMethods: [AuthenticationMethods.OAuth, AuthenticationMethods.Cookie],
    acceptedScopes: {},
    description: ["新規チャンネルを作成します"],
}

type ReturnType = Promise<ChannelEntity>

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (args, errors, authUser): ReturnType => {
    if (authUser == null) {
        raise(errors["invalid_auth"])
    }
    const transaction = await TransactionRepository.new<ReturnType>()
    try {
        return await transaction.$transaction(async (transactionSession) => {
            const channel = await new CreateChannelApplication(
                new UserQueryRepository(transactionSession),
                new ChannelGroupQueryRepository(transactionSession),
                new ChannelCommandRepository(transactionSession)
            ).create({
                name: args.name,
                parentChannelGroupId: args.parent_channel_group_id,
                createdBy: authUser.id,
            })
            return channel
        })
    } catch (error) {
        if (error instanceof ApplicationError) {
            if (error.code === ErrorCodes.DoNotHavePermission) {
                raise(errors["do_not_have_permission"], error)
            } else if (error.code === ErrorCodes.NameNotMeetPolicy) {
                raise(errors["name_not_meet_policy"], error)
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
