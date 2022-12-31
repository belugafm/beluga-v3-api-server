import * as vs from "../../../../domain/validation"

import {
    AuthenticityTokenCommandRepository,
    LoginCredentialCommandRepository,
    LoginCredentialQueryRepository,
    LoginSessionCommandRepository,
    TransactionRepository,
    UserCommandRepository,
    UserQueryRepository,
    InviteCommandRepository,
    InviteQueryRepository,
} from "../../../repositories"
import {
    ErrorCodes,
    RegisterPasswordBasedUserApplication,
} from "../../../../application/registration/RegisterPasswordBasedUser"
import { InternalErrorSpec, UnexpectedErrorSpec, raise } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"
import { UserEntity } from "../../../../domain/entity/User"

import { ApplicationError } from "../../../../application/ApplicationError"
import { AuthenticityTokenEntity } from "../../../../domain/entity/AuthenticityToken"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { LoginCredentialEntity } from "../../../../domain/entity/LoginCredential"
import { LoginSessionEntity } from "../../../../domain/entity/LoginSession"
import { MethodIdentifiers } from "../../identifier"
import { SignInWithPasswordApplication } from "../../../../application/signin/SignInWithPassword"
import config from "../../../../config/app"

export const argumentSpecs = defineArguments(
    ["name", "password", "confirmation_password", "ip_address", "invite_verifier"] as const,
    {
        name: {
            description: ["ユーザー名"],
            examples: ["user"],
            required: true,
            validator: vs.user.NameValidator(),
        },
        password: {
            description: ["パスワード"],
            examples: ["do_not_use_this_password_0123"],
            required: true,
            validator: vs.PasswordValidator(),
        },
        confirmation_password: {
            description: ["確認用のパスワード"],
            examples: ["do_not_use_this_password_0123"],
            required: true,
            validator: vs.PasswordValidator(),
        },
        ip_address: {
            description: ["登録時のIPアドレス"],
            examples: ["192.168.1.1"],
            required: true,
            validator: vs.IpAddressValidator(),
        },
        invite_verifier: {
            description: ["招待の識別子"],
            examples: ["xxxx-xxxx"],
            required: true,
            validator: vs.invite.VerifierValidator(),
        },
    }
)

export const expectedErrorSpecs = defineErrors(
    [
        "name_not_meet_policy",
        "name_taken",
        "password_not_meet_policy",
        "confirmation_password_not_match",
        "invalid_invite_verifier",
        "too_many_requests",
        "internal_error",
        "unexpected_error",
    ] as const,
    argumentSpecs,
    {
        name_not_meet_policy: {
            description: ["ユーザー名が基準を満たしていません"],
            hint: [`ユーザー名は半角英数字で設定してください`],
            argument: "name",
            code: "name_not_meet_policy",
        },
        name_taken: {
            description: ["このユーザー名は使用されています。他のユーザー名を指定してください。"],
            hint: [],
            code: "name_taken",
        },
        password_not_meet_policy: {
            description: ["パスワードが基準を満たしていません"],
            hint: [
                `パスワードは${config.user_login_credential.password.min_length}文字以上の半角英数字に設定してください`,
            ],
            argument: "password",
            code: "password_not_meet_policy",
        },
        confirmation_password_not_match: {
            description: ["確認用のパスワードが一致しません"],
            hint: ["パスワードと確認用パスワードは同じものを入力してください"],
            argument: "confirmation_password",
            code: "confirmation_password_not_match",
        },
        invalid_invite_verifier: {
            description: ["無効な招待です"],
            hint: ["招待リンクを再作成してください"],
            argument: "invite_verifier",
            code: "invalid_invite_verifier",
        },
        too_many_requests: {
            description: ["アカウントの連続作成はできません"],
            hint: ["しばらく時間をおいてから再度登録してください"],
            code: "too_many_requests",
        },
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.CreateAccount,
    httpMethod: HttpMethods.POST,
    rateLimiting: {},
    acceptedContentTypes: [ContentTypes.ApplicationJson],
    userAuthenticationRequired: false,
    private: false,
    acceptedAuthenticationMethods: [],
    acceptedScopes: {},
    description: ["新規アカウントを作成します"],
}

type ReturnType = Promise<[UserEntity, LoginCredentialEntity, LoginSessionEntity, AuthenticityTokenEntity]>

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (args, errors): ReturnType => {
    if (args.password !== args.confirmation_password) {
        raise(errors["confirmation_password_not_match"])
    }
    const invite = await new InviteQueryRepository().findByVerifier(args.invite_verifier)
    if (invite == null) {
        raise(errors["invalid_invite_verifier"])
    }
    if (invite.isValid() == false) {
        raise(errors["invalid_invite_verifier"])
    }
    const transaction = await TransactionRepository.new<ReturnType>()
    try {
        return await transaction.$transaction(async (transactionSession) => {
            await new RegisterPasswordBasedUserApplication(
                new UserQueryRepository(transactionSession),
                new UserCommandRepository(transactionSession),
                new LoginCredentialCommandRepository(transactionSession)
            ).register({
                name: args.name,
                password: args.password,
                ipAddress: args.ip_address,
            })
            const [user, loginCredential, loginSession, authenticityToken] = await new SignInWithPasswordApplication(
                new UserQueryRepository(transactionSession),
                new LoginCredentialQueryRepository(transactionSession),
                new LoginSessionCommandRepository(transactionSession),
                new AuthenticityTokenCommandRepository(transactionSession)
            ).signin({
                name: args.name,
                password: args.password,
                ipAddress: args.ip_address,
                lastLocation: null,
                device: null,
            })
            invite.targetUserId = user.id
            await new InviteCommandRepository().update(invite)
            return [user, loginCredential, loginSession, authenticityToken]
        })
    } catch (error) {
        if (error instanceof ApplicationError) {
            if (error.code === ErrorCodes.NameTaken) {
                raise(errors["name_taken"], error)
            } else if (error.code === ErrorCodes.UserNameNotMeetPolicy) {
                raise(errors["name_not_meet_policy"], error)
            } else if (error.code === ErrorCodes.TooManyRequests) {
                raise(errors["too_many_requests"], error)
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
