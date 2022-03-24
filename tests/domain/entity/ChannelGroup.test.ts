import { ChannelGroupEntity, ErrorCodes } from "../../../domain/entity/ChannelGroup"

import { DomainError } from "../../../domain/DomainError"

const id = 1
const name = "hoge"
const uniqueName = "fuga"
const level = 0
const parentId = 1
const createdBy = 1
const createdAt = new Date()

describe("ChannelGroupEntity", () => {
    test("Normal instantiation", async () => {
        const statusesCount = 0
        const channel = new ChannelGroupEntity({
            id,
            name,
            uniqueName,
            parentId,
            level,
            createdBy,
            createdAt,
            statusesCount,
        })
        expect(channel).toBeInstanceOf(ChannelGroupEntity)
    })
    test("Normal instantiation", async () => {
        const statusesCount = 111
        const channel = new ChannelGroupEntity({
            id,
            name,
            uniqueName,
            parentId,
            level,
            createdBy,
            createdAt,
            statusesCount,
        })
        expect(channel).toBeInstanceOf(ChannelGroupEntity)
        expect(channel.statusesCount).toEqual(statusesCount)
    })
    test("Missing 'id'", async () => {
        expect.assertions(2)
        try {
            const statusesCount = 0
            // @ts-ignore
            new ChannelGroupEntity({
                name,
                uniqueName,
                parentId,
                level,
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
            new ChannelGroupEntity({
                id,
                uniqueName,
                parentId,
                level,
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
            new ChannelGroupEntity({
                id,
                name,
                parentId,
                level,
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
    test("Missing 'parentId'", async () => {
        expect.assertions(2)
        try {
            const statusesCount = 0
            // @ts-ignore
            new ChannelGroupEntity({
                id,
                name,
                uniqueName,
                level,
                createdBy,
                createdAt,
                statusesCount,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidParentId)
            }
        }
    })
    test("Missing 'level'", async () => {
        expect.assertions(2)
        try {
            const statusesCount = 0
            // @ts-ignore
            new ChannelGroupEntity({
                id,
                name,
                uniqueName,
                parentId,
                createdBy,
                createdAt,
                statusesCount,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidLevel)
            }
        }
    })
    test("Missing 'createdBy'", async () => {
        expect.assertions(2)
        try {
            const statusesCount = 0
            // @ts-ignore
            new ChannelGroupEntity({
                id,
                name,
                uniqueName,
                parentId,
                level,
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
            new ChannelGroupEntity({
                id,
                name,
                uniqueName,
                parentId,
                level,
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
        new ChannelGroupEntity({
            id,
            name,
            uniqueName,
            parentId,
            level,
            createdBy,
            createdAt,
        })
    })
    test("Invalid 'name'", async () => {
        expect.assertions(2)
        try {
            const name = 1
            new ChannelGroupEntity({
                id,
                // @ts-ignore
                name,
                uniqueName,
                parentId,
                level,
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
            new ChannelGroupEntity({
                id,
                // @ts-ignore
                name,
                uniqueName,
                parentId,
                level,
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
            new ChannelGroupEntity({
                id,
                name,
                // @ts-ignore
                uniqueName,
                parentId,
                level,
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
            new ChannelGroupEntity({
                id,
                name,
                // @ts-ignore
                uniqueName,
                parentId,
                level,
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
    test("Invalid 'parentId'", async () => {
        expect.assertions(2)
        try {
            const parentId = "fuga"
            new ChannelGroupEntity({
                id,
                name,
                uniqueName,
                // @ts-ignore
                parentId,
                level,
                createdBy,
                createdAt,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidParentId)
            }
        }
    })
    test("Invalid 'parentId'", async () => {
        expect.assertions(2)
        try {
            const parentId = new Date()
            new ChannelGroupEntity({
                id,
                name,
                uniqueName,
                // @ts-ignore
                parentId,
                level,
                createdBy,
                createdAt,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidParentId)
            }
        }
    })
    test("Invalid 'level'", async () => {
        expect.assertions(2)
        try {
            const level = "fuga"
            new ChannelGroupEntity({
                id,
                name,
                uniqueName,
                // @ts-ignore
                level,
                parentId,
                createdBy,
                createdAt,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidLevel)
            }
        }
    })
    test("Invalid 'level'", async () => {
        expect.assertions(2)
        try {
            const level = new Date()
            new ChannelGroupEntity({
                id,
                name,
                uniqueName,
                // @ts-ignore
                level,
                parentId,
                createdBy,
                createdAt,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidLevel)
            }
        }
    })
    test("Invalid 'createdBy'", async () => {
        expect.assertions(2)
        try {
            const createdBy = "fuga"
            new ChannelGroupEntity({
                id,
                name,
                uniqueName,
                parentId,
                level,
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
            new ChannelGroupEntity({
                id,
                name,
                uniqueName,
                parentId,
                level,
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
            new ChannelGroupEntity({
                id,
                name,
                uniqueName,
                parentId,
                level,
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
            new ChannelGroupEntity({
                id,
                name,
                uniqueName,
                parentId,
                level,
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
            new ChannelGroupEntity({
                id,
                name,
                uniqueName,
                parentId,
                level,
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
            new ChannelGroupEntity({
                id,
                name,
                uniqueName,
                parentId,
                level,
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
