import { ChannelEntity, ErrorCodes } from "../../../domain/entity/Channel"

import { DomainError } from "../../../domain/DomainError"

const id = 1
const name = "hoge"
const uniqueName = "fuga"
const parentChannelGroupId = 1
const createdBy = 1
const createdAt = new Date()

describe("ChannelEntity", () => {
    test("Normal instantiation", async () => {
        const statusesCount = 0
        const channel = new ChannelEntity({
            id,
            name,
            uniqueName,
            parentChannelGroupId,
            createdBy,
            createdAt,
            statusesCount,
        })
        expect(channel).toBeInstanceOf(ChannelEntity)
    })
    test("Normal instantiation", async () => {
        const statusesCount = 111
        const channel = new ChannelEntity({
            id,
            name,
            uniqueName,
            parentChannelGroupId,
            createdBy,
            createdAt,
            statusesCount,
        })
        expect(channel).toBeInstanceOf(ChannelEntity)
        expect(channel.statusesCount).toEqual(statusesCount)
    })
    test("Missing 'id'", async () => {
        expect.assertions(2)
        try {
            const statusesCount = 0
            // @ts-ignore
            new ChannelEntity({
                name,
                uniqueName,
                parentChannelGroupId,
                createdBy,
                createdAt,
                statusesCount,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidId)
            }
        }
    })
    test("Missing 'name'", async () => {
        expect.assertions(2)
        try {
            const statusesCount = 0
            // @ts-ignore
            new ChannelEntity({
                id,
                uniqueName,
                parentChannelGroupId,
                createdBy,
                createdAt,
                statusesCount,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidName)
            }
        }
    })
    test("Missing 'uniqueName'", async () => {
        expect.assertions(2)
        try {
            const statusesCount = 0
            // @ts-ignore
            new ChannelEntity({
                id,
                name,
                parentChannelGroupId,
                createdBy,
                createdAt,
                statusesCount,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidUniqueName)
            }
        }
    })
    test("Missing 'parentChannelGroupId'", async () => {
        expect.assertions(2)
        try {
            const statusesCount = 0
            // @ts-ignore
            new ChannelEntity({
                id,
                name,
                uniqueName,
                createdBy,
                createdAt,
                statusesCount,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidParentChanelGroupId)
            }
        }
    })
    test("Missing 'createdBy'", async () => {
        expect.assertions(2)
        try {
            const statusesCount = 0
            // @ts-ignore
            new ChannelEntity({
                id,
                name,
                uniqueName,
                parentChannelGroupId,
                createdAt,
                statusesCount,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidCreatedBy)
            }
        }
    })
    test("Missing 'createdAt'", async () => {
        expect.assertions(2)
        try {
            const statusesCount = 0
            // @ts-ignore
            new ChannelEntity({
                id,
                name,
                uniqueName,
                parentChannelGroupId,
                createdBy,
                statusesCount,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidCreatedAt)
            }
        }
    })
    test("Missing 'statusesCount'", async () => {
        expect.assertions(0)
        new ChannelEntity({
            id,
            name,
            uniqueName,
            parentChannelGroupId,
            createdBy,
            createdAt,
        })
    })
    test("Invalid 'name'", async () => {
        expect.assertions(2)
        try {
            const name = 1
            new ChannelEntity({
                id,
                // @ts-ignore
                name,
                uniqueName,
                parentChannelGroupId,
                createdBy,
                createdAt,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidName)
            }
        }
    })
    test("Invalid 'name'", async () => {
        expect.assertions(2)
        try {
            const name = new Date()
            new ChannelEntity({
                id,
                // @ts-ignore
                name,
                uniqueName,
                parentChannelGroupId,
                createdBy,
                createdAt,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidName)
            }
        }
    })
    test("Invalid 'uniqueName'", async () => {
        expect.assertions(2)
        try {
            const uniqueName = 1
            new ChannelEntity({
                id,
                name,
                // @ts-ignore
                uniqueName,
                parentChannelGroupId,
                createdBy,
                createdAt,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidUniqueName)
            }
        }
    })
    test("Invalid 'uniqueName'", async () => {
        expect.assertions(2)
        try {
            const uniqueName = new Date()
            new ChannelEntity({
                id,
                name,
                // @ts-ignore
                uniqueName,
                parentChannelGroupId,
                createdBy,
                createdAt,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidUniqueName)
            }
        }
    })
    test("Invalid 'parentChannelGroupId'", async () => {
        expect.assertions(2)
        try {
            const parentChannelGroupId = "fuga"
            new ChannelEntity({
                id,
                name,
                uniqueName,
                // @ts-ignore
                parentChannelGroupId,
                createdBy,
                createdAt,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidParentChanelGroupId)
            }
        }
    })
    test("Invalid 'parentChannelGroupId'", async () => {
        expect.assertions(2)
        try {
            const parentChannelGroupId = new Date()
            new ChannelEntity({
                id,
                name,
                uniqueName,
                // @ts-ignore
                parentChannelGroupId,
                createdBy,
                createdAt,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidParentChanelGroupId)
            }
        }
    })
    test("Invalid 'createdBy'", async () => {
        expect.assertions(2)
        try {
            const createdBy = "fuga"
            new ChannelEntity({
                id,
                name,
                uniqueName,
                parentChannelGroupId,
                // @ts-ignore
                createdBy,
                createdAt,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidCreatedBy)
            }
        }
    })
    test("Invalid 'createdBy'", async () => {
        expect.assertions(2)
        try {
            const createdBy = new Date()
            new ChannelEntity({
                id,
                name,
                uniqueName,
                parentChannelGroupId,
                // @ts-ignore
                createdBy,
                createdAt,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidCreatedBy)
            }
        }
    })
    test("Invalid 'createdAt'", async () => {
        expect.assertions(2)
        try {
            const createdAt = "fuga"
            new ChannelEntity({
                id,
                name,
                uniqueName,
                parentChannelGroupId,
                createdBy,
                // @ts-ignore
                createdAt,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidCreatedAt)
            }
        }
    })
    test("Invalid 'createdAt'", async () => {
        expect.assertions(2)
        try {
            const createdAt = 1
            new ChannelEntity({
                id,
                name,
                uniqueName,
                parentChannelGroupId,
                createdBy,
                // @ts-ignore
                createdAt,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidCreatedAt)
            }
        }
    })
    test("Invalid 'statusesCount'", async () => {
        expect.assertions(2)
        try {
            const statusesCount = -1
            new ChannelEntity({
                id,
                name,
                uniqueName,
                parentChannelGroupId,
                createdBy,
                createdAt,
                statusesCount,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidStatusesCount)
            }
        }
    })
    test("Invalid 'statusesCount'", async () => {
        expect.assertions(2)
        try {
            const statusesCount = "fuga"
            new ChannelEntity({
                id,
                name,
                uniqueName,
                parentChannelGroupId,
                createdBy,
                createdAt,
                // @ts-ignore
                statusesCount,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidStatusesCount)
            }
        }
    })
})
