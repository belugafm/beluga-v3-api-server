import { ChannelEntity, ErrorCodes } from "../../../src/domain/entity/Channel"

import { DomainError } from "../../../src/domain/DomainError"

const id = 1
const name = "beluga"
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
            messageCount: statusesCount,
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
            messageCount: statusesCount,
        })
        expect(channel).toBeInstanceOf(ChannelEntity)
        expect(channel.messageCount).toEqual(statusesCount)
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
                messageCount: statusesCount,
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
                messageCount: statusesCount,
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
                messageCount: statusesCount,
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
                messageCount: statusesCount,
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
                messageCount: statusesCount,
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
                messageCount: statusesCount,
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
    it.each([1.5, "beluga", new Date(), {}, [], true, false, null, undefined])("Invalid 'id'", (id) => {
        expect.assertions(2)
        try {
            new ChannelEntity({
                // @ts-ignore
                id,
                name,
                uniqueName,
                parentChannelGroupId,
                createdBy,
                createdAt,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidId)
            }
        }
    })
    it.each([1.5, new Date(), {}, [], true, false, null, undefined])("Invalid 'name'", (name) => {
        expect.assertions(2)
        try {
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
    it.each([1.5, new Date(), {}, [], true, false, null, undefined])("Invalid 'uniqueName'", (uniqueName) => {
        expect.assertions(2)
        try {
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
    it.each([1.5, "beluga", new Date(), {}, [], true, false, null, undefined])(
        "Invalid 'parentChannelGroupId'",
        (parentChannelGroupId) => {
            expect.assertions(2)
            try {
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
        }
    )
    it.each([1.5, "beluga", new Date(), {}, [], true, false, null, undefined])("Invalid 'createdBy'", (createdBy) => {
        expect.assertions(2)
        try {
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
    it.each([1.5, "beluga", {}, true, false, null, undefined])("Invalid 'createdAt'", (createdAt) => {
        expect.assertions(2)
        try {
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
    it.each([1.5, "beluga", new Date(), {}, []])("Invalid 'messageCount'", (messageCount) => {
        expect.assertions(2)
        try {
            new ChannelEntity({
                id,
                name,
                uniqueName,
                parentChannelGroupId,
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
