import { ChannelGroupEntity, ErrorCodes } from "../../../domain/entity/ChannelGroup"

import { DomainError } from "../../../domain/DomainError"

const id = 1
const name = "beluga"
const uniqueName = "fuga"
const level = 0
const parentId = 1
const createdBy = 1
const createdAt = new Date()

describe("ChannelGroupEntity", () => {
    test("Normal instantiation", async () => {
        const messageCount = 0
        const channel = new ChannelGroupEntity({
            id,
            name,
            uniqueName,
            parentId,
            level,
            createdBy,
            createdAt,
            messageCount: messageCount,
        })
        expect(channel).toBeInstanceOf(ChannelGroupEntity)
    })
    test("Normal instantiation", async () => {
        const messageCount = 111
        const channel = new ChannelGroupEntity({
            id,
            name,
            uniqueName,
            parentId,
            level,
            createdBy,
            createdAt,
            messageCount: messageCount,
        })
        expect(channel).toBeInstanceOf(ChannelGroupEntity)
        expect(channel.messageCount).toEqual(messageCount)
    })
    test("Missing 'id'", async () => {
        expect.assertions(2)
        try {
            const messageCount = 0
            // @ts-ignore
            new ChannelGroupEntity({
                name,
                uniqueName,
                parentId,
                level,
                createdBy,
                createdAt,
                messageCount: messageCount,
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
            const messageCount = 0
            // @ts-ignore
            new ChannelGroupEntity({
                id,
                uniqueName,
                parentId,
                level,
                createdBy,
                createdAt,
                messageCount: messageCount,
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
            const messageCount = 0
            // @ts-ignore
            new ChannelGroupEntity({
                id,
                name,
                parentId,
                level,
                createdBy,
                createdAt,
                messageCount: messageCount,
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
            const messageCount = 0
            // @ts-ignore
            new ChannelGroupEntity({
                id,
                name,
                uniqueName,
                level,
                createdBy,
                createdAt,
                messageCount: messageCount,
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
            const messageCount = 0
            // @ts-ignore
            new ChannelGroupEntity({
                id,
                name,
                uniqueName,
                parentId,
                createdBy,
                createdAt,
                messageCount: messageCount,
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
            const messageCount = 0
            // @ts-ignore
            new ChannelGroupEntity({
                id,
                name,
                uniqueName,
                parentId,
                level,
                createdAt,
                messageCount: messageCount,
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
            const messageCount = 0
            // @ts-ignore
            new ChannelGroupEntity({
                id,
                name,
                uniqueName,
                parentId,
                level,
                createdBy,
                messageCount: messageCount,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidCreatedAt)
            }
        }
    })
    test("Missing 'messageCount'", async () => {
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
    it.each([1.5, new Date(), {}, [], true, false, null, undefined])("Invalid 'name'", (name) => {
        expect.assertions(2)
        try {
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
    it.each([1.5, new Date(), {}, [], true, false, null, undefined])("Invalid 'uniqueName'", (uniqueName) => {
        expect.assertions(2)
        try {
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
    it.each([1.5, "beluga", new Date(), {}, [], true, false, null, undefined])("Invalid 'parentId'", (parentId) => {
        expect.assertions(2)
        try {
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
    it.each([1.5, "beluga", new Date(), {}, [], true, false, null, undefined])("Invalid 'level'", (level) => {
        expect.assertions(2)
        try {
            new ChannelGroupEntity({
                id,
                name,
                uniqueName,
                parentId,
                // @ts-ignore
                level,
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
    it.each([1.5, "beluga", new Date(), {}, [], true, false, null, undefined])("Invalid 'createdBy'", (createdBy) => {
        expect.assertions(2)
        try {
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
    it.each([1.5, "beluga", {}, [], true, false, null, undefined])("Invalid 'createdAt'", (createdAt) => {
        expect.assertions(2)
        try {
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
    it.each([1.5, "beluga", new Date(), {}, []])("Invalid 'messageCount'", (messageCount) => {
        expect.assertions(2)
        try {
            new ChannelGroupEntity({
                id,
                name,
                uniqueName,
                parentId,
                level,
                createdBy,
                createdAt,
                // @ts-ignore
                messageCount,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidMessageCount)
            }
        }
    })
})
