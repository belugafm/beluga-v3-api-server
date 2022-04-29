import {
    ErrorCodes,
    RegisterPasswordBasedUserApplication,
} from "../../../../src/application/registration/RegisterPasswordBasedUser"
import { generateRandomIpAddress, generateRandomName, sleep } from "../../functions"

import { ApplicationError } from "../../../../src/application/ApplicationError"
import { ILoginCredentialCommandRepository } from "../../../../src/domain/repository/command/LoginCredential"
import { IUserCommandRepository } from "../../../../src/domain/repository/command/User"
import { IUserQueryRepository } from "../../../../src/domain/repository/query/User"
import { LoginCredentialEntity } from "../../../../src/domain/entity/LoginCredential"
import { PrismaClient } from "@prisma/client"
import { TransactionRepository } from "../../../../src/infrastructure/prisma/repository/Transaction"
import { UserEntity } from "../../../../src/domain/entity/User"
import config from "../../../../src/config/app"

interface NewableRepository<T> {
    new (transaction?: PrismaClient): T
}

type _ReturnType = ReturnType<RegisterPasswordBasedUserApplication["register"]>

type NewableTransaction = {
    new: () => Promise<TransactionRepository<_ReturnType>>
}

export class RegisterPasswordBasedUserApplicationTests {
    constructor() {}
    async testNormal<
        S extends IUserQueryRepository,
        T extends IUserCommandRepository,
        U extends ILoginCredentialCommandRepository
    >(
        UserQueryRepository: NewableRepository<S>,
        UserCommandRepository: NewableRepository<T>,
        LoginCredentialCommandRepository: NewableRepository<U>,
        TransactionRepository: NewableTransaction
    ) {
        const repeat = 10
        const userNames: string[] = []
        expect.assertions(3 * repeat)
        for (let k = 0; k < repeat; k++) {
            const transaction = await TransactionRepository.new()
            const name = generateRandomName(config.user.name.max_length)
            const [user, loginCredential] = await transaction.$transaction(async (transactionSession) => {
                return await new RegisterPasswordBasedUserApplication(
                    new UserQueryRepository(transactionSession),
                    new UserCommandRepository(transactionSession),
                    new LoginCredentialCommandRepository(transactionSession)
                ).register({
                    name: name,
                    password: "password",
                    ipAddress: generateRandomIpAddress(),
                })
            })
            expect(user).toBeInstanceOf(UserEntity)
            expect(loginCredential).toBeInstanceOf(LoginCredentialEntity)
            userNames.push(name)
        }
        for (const name of userNames) {
            const userQueryRepository = new UserQueryRepository()
            const userCommandRepository = new UserCommandRepository()
            const _user = await userQueryRepository.findByName(name)
            expect(_user).not.toBeNull()
            if (_user) {
                await userCommandRepository.delete(_user)
            }
        }
    }
    async testNameTaken<
        S extends IUserQueryRepository,
        T extends IUserCommandRepository,
        U extends ILoginCredentialCommandRepository
    >(
        UserQueryRepository: NewableRepository<S>,
        UserCommandRepository: NewableRepository<T>,
        LoginCredentialCommandRepository: NewableRepository<U>,
        TransactionRepository: NewableTransaction
    ) {
        expect.assertions(3)
        const transaction = await TransactionRepository.new()
        const name = generateRandomName(config.user.name.max_length)
        await transaction.$transaction(async (transactionSession) => {
            return await new RegisterPasswordBasedUserApplication(
                new UserQueryRepository(transactionSession),
                new UserCommandRepository(transactionSession),
                new LoginCredentialCommandRepository(transactionSession)
            ).register({
                name: name,
                password: "password",
                ipAddress: generateRandomIpAddress(),
            })
        })
        try {
            await transaction.$transaction(async (transactionSession) => {
                return await new RegisterPasswordBasedUserApplication(
                    new UserQueryRepository(transactionSession),
                    new UserCommandRepository(transactionSession),
                    new LoginCredentialCommandRepository(transactionSession)
                ).register({
                    name: name,
                    password: "password",
                    ipAddress: generateRandomIpAddress(),
                })
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ApplicationError)
            if (error instanceof ApplicationError) {
                expect(error.code).toBe(ErrorCodes.NameTaken)
            }
        }
        const user = await new UserQueryRepository().findByName(name)
        expect(user).toBeInstanceOf(UserEntity)
        if (user) {
            await new UserCommandRepository().delete(user)
        }
    }
    async testTooManyRequests<
        S extends IUserQueryRepository,
        T extends IUserCommandRepository,
        U extends ILoginCredentialCommandRepository
    >(
        UserQueryRepository: NewableRepository<S>,
        UserCommandRepository: NewableRepository<T>,
        LoginCredentialCommandRepository: NewableRepository<U>,
        TransactionRepository: NewableTransaction
    ) {
        expect.assertions(4)
        const transaction = await TransactionRepository.new()
        const origValue = config.user_registration.limit
        config.user_registration.limit = 5
        const name = generateRandomName(config.user.name.max_length)
        const ipAddress = generateRandomIpAddress()
        await transaction.$transaction(async (transactionSession) => {
            return await new RegisterPasswordBasedUserApplication(
                new UserQueryRepository(transactionSession),
                new UserCommandRepository(transactionSession),
                new LoginCredentialCommandRepository(transactionSession)
            ).register({
                name: name,
                password: "password",
                ipAddress: ipAddress,
            })
        })
        const name2 = generateRandomName(config.user.name.max_length)
        try {
            await transaction.$transaction(async (transactionSession) => {
                return await new RegisterPasswordBasedUserApplication(
                    new UserQueryRepository(transactionSession),
                    new UserCommandRepository(transactionSession),
                    new LoginCredentialCommandRepository(transactionSession)
                ).register({
                    name: name2,
                    password: "password",
                    ipAddress: ipAddress,
                })
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ApplicationError)
            if (error instanceof ApplicationError) {
                expect(error.code).toBe(ErrorCodes.TooManyRequests)
            }
        }
        await sleep(config.user_registration.limit + 1)
        await transaction.$transaction(async (transactionSession) => {
            return await new RegisterPasswordBasedUserApplication(
                new UserQueryRepository(transactionSession),
                new UserCommandRepository(transactionSession),
                new LoginCredentialCommandRepository(transactionSession)
            ).register({
                name: name2,
                password: "password",
                ipAddress: generateRandomIpAddress(),
            })
        })
        config.user_registration.limit = origValue
        {
            const user = await new UserQueryRepository().findByName(name)
            expect(user).toBeInstanceOf(UserEntity)
            if (user) {
                await new UserCommandRepository().delete(user)
            }
        }
        {
            const user = await new UserQueryRepository().findByName(name2)
            expect(user).toBeInstanceOf(UserEntity)
            if (user) {
                await new UserCommandRepository().delete(user)
            }
        }
    }
    async testUserNameNotMeetPolicy<
        S extends IUserQueryRepository,
        T extends IUserCommandRepository,
        U extends ILoginCredentialCommandRepository
    >(
        UserQueryRepository: NewableRepository<S>,
        UserCommandRepository: NewableRepository<T>,
        LoginCredentialCommandRepository: NewableRepository<U>,
        TransactionRepository: NewableTransaction
    ) {
        const nameCandidates = [
            "-",
            "&",
            "%",
            "@",
            "[",
            "]",
            " ",
            "",
            "!",
            '"',
            "#",
            "'",
            "(",
            ")",
            "~",
            "=",
            "|",
            "}",
            "{",
            "`",
            "*",
            ">",
            "<",
            "あ",
            generateRandomName(config.user.name.max_length + 1),
        ]
        expect.assertions(nameCandidates.length * 2)
        const transaction = await TransactionRepository.new()
        for (const name of nameCandidates) {
            try {
                await transaction.$transaction(async (transactionSession) => {
                    return await new RegisterPasswordBasedUserApplication(
                        new UserQueryRepository(transactionSession),
                        new UserCommandRepository(transactionSession),
                        new LoginCredentialCommandRepository(transactionSession)
                    ).register({
                        name: name,
                        password: "password",
                        ipAddress: generateRandomIpAddress(),
                    })
                })
            } catch (error) {
                expect(error).toBeInstanceOf(ApplicationError)
                if (error instanceof ApplicationError) {
                    expect(error.code).toBe(ErrorCodes.UserNameNotMeetPolicy)
                }
            }
        }
    }
    async testPasswordNotMeetPolicy<
        S extends IUserQueryRepository,
        T extends IUserCommandRepository,
        U extends ILoginCredentialCommandRepository
    >(
        UserQueryRepository: NewableRepository<S>,
        UserCommandRepository: NewableRepository<T>,
        LoginCredentialCommandRepository: NewableRepository<U>,
        TransactionRepository: NewableTransaction
    ) {
        expect.assertions(2)
        const transaction = await TransactionRepository.new()
        const name = generateRandomName(config.user.name.max_length)
        try {
            await transaction.$transaction(async (transactionSession) => {
                return await new RegisterPasswordBasedUserApplication(
                    new UserQueryRepository(transactionSession),
                    new UserCommandRepository(transactionSession),
                    new LoginCredentialCommandRepository(transactionSession)
                ).register({
                    name: name,
                    password: "",
                    ipAddress: generateRandomIpAddress(),
                })
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ApplicationError)
            if (error instanceof ApplicationError) {
                expect(error.code).toBe(ErrorCodes.PasswordNotMeetPolicy)
            }
        }
    }
    async testTransaction<
        S extends IUserQueryRepository,
        T extends IUserCommandRepository,
        U extends ILoginCredentialCommandRepository
    >(
        UserQueryRepository: NewableRepository<S>,
        UserCommandRepository: NewableRepository<T>,
        LoginCredentialCommandRepository: NewableRepository<U>,
        TransactionRepository: NewableTransaction
    ) {
        expect.assertions(2)
        const transaction = await TransactionRepository.new()
        const name = generateRandomName(config.user.name.max_length)
        const ipAddress = generateRandomIpAddress()
        try {
            await transaction.$transaction(async (transactionSession) => {
                const ret = await new RegisterPasswordBasedUserApplication(
                    new UserQueryRepository(transactionSession),
                    new UserCommandRepository(transactionSession),
                    new LoginCredentialCommandRepository(transactionSession)
                ).register({
                    name: name,
                    password: "password",
                    ipAddress: ipAddress,
                })
                // will throw an error
                await new RegisterPasswordBasedUserApplication(
                    new UserQueryRepository(transactionSession),
                    new UserCommandRepository(transactionSession),
                    new LoginCredentialCommandRepository(transactionSession)
                ).register({
                    name: name,
                    password: "password",
                    ipAddress: ipAddress,
                })
                return ret
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ApplicationError)
        }
        {
            const usersRepository = new UserQueryRepository()
            const user = await usersRepository.findByName(name)
            expect(user).toBeNull()
        }
    }
}
