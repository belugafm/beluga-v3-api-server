import { ErrorCodes, SignInWithPasswordApplication } from "../../../../application/signin/SignInWithPassword"

import { ApplicationError } from "../../../../application/ApplicationError"
import { AuthenticityTokenEntity } from "../../../../domain/entity/AuthenticityToken"
import { IAuthenticityTokenCommandRepository } from "../../../../domain/repository/command/AuthenticityToken"
import { ILoginCredentialCommandRepository } from "../../../../domain/repository/command/LoginCredential"
import { ILoginCredentialQueryRepository } from "../../../../domain/repository/query/LoginCredential"
import { ILoginSessionCommandRepository } from "../../../../domain/repository/command/LoginSession"
import { IUserCommandRepository } from "../../../../domain/repository/command/User"
import { IUserQueryRepository } from "../../../../domain/repository/query/User"
import { LoginCredentialEntity } from "../../../../domain/entity/LoginCredential"
import { LoginSessionEntity } from "../../../../domain/entity/LoginSession"
import { PrismaClient } from "@prisma/client"
import { RegisterPasswordBasedUserApplication } from "../../../../application/registration/RegisterPasswordBasedUser"
import { TransactionRepository } from "../../../../infrastructure/prisma/repository/Transaction"
import { UserEntity } from "../../../../domain/entity/User"
import config from "../../../../config/app"
import { generateRandomName } from "../../functions"

interface NewableRepository<T> {
    new (transaction?: PrismaClient): T
}

type _ReturnType = ReturnType<SignInWithPasswordApplication["signin"]>

type NewableTransaction = {
    new: () => Promise<TransactionRepository<_ReturnType>>
}

export class SignInWithPasswordAplicationTests {
    constructor() {}
    async testNormal<
        S extends IUserQueryRepository,
        T extends IUserCommandRepository,
        U extends ILoginCredentialQueryRepository,
        V extends ILoginCredentialCommandRepository,
        W extends ILoginSessionCommandRepository,
        X extends IAuthenticityTokenCommandRepository
    >(
        UserQueryRepository: NewableRepository<S>,
        UserCommandRepository: NewableRepository<T>,
        LoginCredentialQueryRepository: NewableRepository<U>,
        LoginCredentialCommandRepository: NewableRepository<V>,
        LoginSessionCommandRepository: NewableRepository<W>,
        AuthenticityTokenCommandRepository: NewableRepository<X>
    ) {
        const name = generateRandomName(config.user.name.max_length)
        const password = generateRandomName(config.user_login_credential.password.max_length)
        const ipAddress = "192.168.1.1"
        const lastLocation = "Tokyo"
        const device = "Desktop Chrome"

        const [registeredUser, registeredLoginCredential] = await new RegisterPasswordBasedUserApplication(
            new UserQueryRepository(),
            new UserCommandRepository(),
            new LoginCredentialCommandRepository()
        ).register({
            name: name,
            password: password,
            ipAddress: "192.168.1.1",
        })
        expect(registeredUser).toBeInstanceOf(UserEntity)
        expect(registeredLoginCredential).toBeInstanceOf(LoginCredentialEntity)
        const [user, loginCredential, loginSessionEntity, authenticityTokenEntity] =
            await new SignInWithPasswordApplication(
                new UserQueryRepository(),
                new LoginCredentialQueryRepository(),
                new LoginSessionCommandRepository(),
                new AuthenticityTokenCommandRepository()
            ).signin({
                name,
                password,
                ipAddress,
                lastLocation,
                device,
            })
        expect(user).toBeInstanceOf(UserEntity)
        expect(loginCredential).toBeInstanceOf(LoginCredentialEntity)
        expect(loginSessionEntity).toBeInstanceOf(LoginSessionEntity)
        expect(authenticityTokenEntity).toBeInstanceOf(AuthenticityTokenEntity)

        expect(user.id).toEqual(registeredUser.id)
        expect(registeredLoginCredential.userId).toEqual(loginCredential.userId)
        expect(registeredLoginCredential.userId).toEqual(user.id)

        const userQueryRepository = new UserQueryRepository()
        const userCommandRepository = new UserCommandRepository()
        const foundUser = await userQueryRepository.findByName(name)
        expect(foundUser).not.toBeNull()
        if (foundUser) {
            await userCommandRepository.delete(foundUser)
        }
    }
    async testIncorrectPassword<
        S extends IUserQueryRepository,
        T extends IUserCommandRepository,
        U extends ILoginCredentialQueryRepository,
        V extends ILoginCredentialCommandRepository,
        W extends ILoginSessionCommandRepository,
        X extends IAuthenticityTokenCommandRepository
    >(
        UserQueryRepository: NewableRepository<S>,
        UserCommandRepository: NewableRepository<T>,
        LoginCredentialQueryRepository: NewableRepository<U>,
        LoginCredentialCommandRepository: NewableRepository<V>,
        LoginSessionCommandRepository: NewableRepository<W>,
        AuthenticityTokenCommandRepository: NewableRepository<X>
    ) {
        expect.assertions(5)
        const name = generateRandomName(config.user.name.max_length)
        const ipAddress = "192.168.1.1"
        const lastLocation = "Tokyo"
        const device = "Desktop Chrome"

        const [registeredUser, registeredLoginCredential] = await new RegisterPasswordBasedUserApplication(
            new UserQueryRepository(),
            new UserCommandRepository(),
            new LoginCredentialCommandRepository()
        ).register({
            name: name,
            password: generateRandomName(config.user_login_credential.password.max_length),
            ipAddress: "192.168.1.1",
        })
        expect(registeredUser).toBeInstanceOf(UserEntity)
        expect(registeredLoginCredential).toBeInstanceOf(LoginCredentialEntity)
        try {
            await new SignInWithPasswordApplication(
                new UserQueryRepository(),
                new LoginCredentialQueryRepository(),
                new LoginSessionCommandRepository(),
                new AuthenticityTokenCommandRepository()
            ).signin({
                name,
                password: generateRandomName(config.user_login_credential.password.max_length),
                ipAddress,
                lastLocation,
                device,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ApplicationError)
            if (error instanceof ApplicationError) {
                expect(error.code).toBe(ErrorCodes.IncorrectPassword)
            }
        }
        const userQueryRepository = new UserQueryRepository()
        const userCommandRepository = new UserCommandRepository()
        const foundUser = await userQueryRepository.findByName(name)
        expect(foundUser).not.toBeNull()
        if (foundUser) {
            await userCommandRepository.delete(foundUser)
        }
    }
    async testTransaction<
        S extends IUserQueryRepository,
        T extends IUserCommandRepository,
        U extends ILoginCredentialQueryRepository,
        V extends ILoginCredentialCommandRepository,
        W extends ILoginSessionCommandRepository,
        X extends IAuthenticityTokenCommandRepository
    >(
        UserQueryRepository: NewableRepository<S>,
        UserCommandRepository: NewableRepository<T>,
        LoginCredentialQueryRepository: NewableRepository<U>,
        LoginCredentialCommandRepository: NewableRepository<V>,
        LoginSessionCommandRepository: NewableRepository<W>,
        AuthenticityTokenCommandRepository: NewableRepository<X>,
        TransactionRepository: NewableTransaction
    ) {
        const transaction = await TransactionRepository.new()
        const name = generateRandomName(config.user.name.max_length)
        const password = generateRandomName(config.user_login_credential.password.max_length)
        const ipAddress = "192.168.1.1"
        const lastLocation = "Tokyo"
        const device = "Desktop Chrome"

        try {
            await transaction.$transaction(async (transactionSession) => {
                await new RegisterPasswordBasedUserApplication(
                    new UserQueryRepository(transactionSession),
                    new UserCommandRepository(transactionSession),
                    new LoginCredentialCommandRepository(transactionSession)
                ).register({
                    name: name,
                    password: password,
                    ipAddress: "192.168.1.1",
                })
                const [user, loginCredential, loginSessionEntity, authenticityTokenEntity] =
                    await new SignInWithPasswordApplication(
                        new UserQueryRepository(transactionSession),
                        new LoginCredentialQueryRepository(transactionSession),
                        new LoginSessionCommandRepository(transactionSession),
                        new AuthenticityTokenCommandRepository(transactionSession)
                    ).signin({
                        name,
                        password,
                        ipAddress,
                        lastLocation,
                        device,
                    })
                throw new Error()
                return [user, loginCredential, loginSessionEntity, authenticityTokenEntity]
            })
        } catch (error) {}

        const userQueryRepository = new UserQueryRepository()
        const foundUser = await userQueryRepository.findByName(name)
        expect(foundUser).toBeNull()
    }
}
