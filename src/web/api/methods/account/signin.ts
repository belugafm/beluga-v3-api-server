import * as vs from "../../../../domain/validation"

import {
    AuthenticityTokenCommandRepository,
    LoginCredentialQueryRepository,
    LoginSessionCommandRepository,
    UserQueryRepository,
} from "../../../repositories"
import { ErrorCodes, SignInWithPasswordApplication } from "../../../../application/signin/SignInWithPassword"
import { InternalErrorSpec, UnexpectedErrorSpec, raise } from "../../error"
import { MethodFacts, defineArguments, defineErrors, defineMethod } from "../../define"

import { ApplicationError } from "../../../../application/ApplicationError"
import { AuthenticityTokenEntity } from "../../../../domain/entity/AuthenticityToken"
import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { LoginCredentialEntity } from "../../../../domain/entity/LoginCredential"
import { LoginSessionEntity } from "../../../../domain/entity/LoginSession"
import { MethodIdentifiers } from "../../identifier"
import { UserEntity } from "../../../../domain/entity/User"

export const argumentSpecs = defineArguments(["password", "name", "ip_address", "last_location", "device"] as const, {
    password: {
        description: ["パスワード"],
        examples: ["do_not_use_this_password_0123"],
        required: true,
        validator: vs.PasswordValidator(),
    },
    name: {
        description: ["ユーザー名"],
        examples: ["beluga"],
        required: true,
        validator: vs.user.NameValidator(),
    },
    ip_address: {
        description: ["IPアドレス"],
        examples: ["192.168.1.1"],
        required: true,
        validator: vs.IpAddressValidator(),
    },
    last_location: {
        description: ["ログインした場所"],
        examples: ["Tokyo, Japan"],
        required: false,
        validator: vs.StringValidator(),
    },
    device: {
        description: ["ログインに使用したデバイス"],
        examples: ["Chrome on Linux"],
        required: false,
        validator: vs.StringValidator(),
    },
})

export const expectedErrorSpecs = defineErrors(
    [
        "incorrect_name",
        "incorrect_password",
        "invalid_ip_address",
        "invalid_location",
        "invalid_device",
        "internal_error",
        "unexpected_error",
    ] as const,
    argumentSpecs,
    {
        incorrect_password: {
            description: ["パスワードが間違っています"],
            hint: [],
            argument: "password",
            code: "incorrect_password",
        },
        incorrect_name: {
            description: ["ユーザー名が間違っています"],
            hint: [],
            argument: "name",
            code: "incorrect_name",
        },
        invalid_ip_address: {
            description: ["IPアドレスが不正です"],
            hint: [],
            argument: "ip_address",
            code: "invalid_ip_address",
        },
        invalid_location: {
            description: ["`last_location`が不正です"],
            hint: [],
            argument: "last_location",
            code: "invalid_location",
        },
        invalid_device: {
            description: ["`device`が不正です"],
            hint: [],
            argument: "device",
            code: "invalid_device",
        },
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.SignInToAccount,
    httpMethod: HttpMethods.POST,
    rateLimiting: {},
    acceptedContentTypes: [ContentTypes.ApplicationJson],
    userAuthenticationRequired: false,
    private: false,
    acceptedAuthenticationMethods: [],
    acceptedScopes: {},
    description: ["ログインします"],
}

type ReturnType = Promise<[UserEntity, LoginCredentialEntity, LoginSessionEntity, AuthenticityTokenEntity]>

export default defineMethod(facts, argumentSpecs, expectedErrorSpecs, async (args, errors): ReturnType => {
    try {
        return await new SignInWithPasswordApplication(
            new UserQueryRepository(),
            new LoginCredentialQueryRepository(),
            new LoginSessionCommandRepository(),
            new AuthenticityTokenCommandRepository()
        ).signin({
            name: args.name,
            password: args.password,
            ipAddress: args.ip_address,
            lastLocation: args.last_location ? args.last_location : null,
            device: args.device ? args.device : null,
        })
    } catch (error) {
        if (error instanceof ApplicationError) {
            if (error.code === ErrorCodes.IncorrectPassword) {
                raise(errors["incorrect_password"], error)
            } else if (error.code === ErrorCodes.UserNotFound) {
                raise(errors["incorrect_name"], error)
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
