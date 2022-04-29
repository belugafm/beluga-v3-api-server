import { ChannelReadStateEntity, ErrorCodes } from "../../../src/domain/entity/ChannelReadState"

import { DomainError } from "../../../src/domain/DomainError"

const id = 1
const userId = 2
const channelId = 3
const lastMessageId = 4
const lastMessageCreatedAt = new Date()

describe("ChannelReadStateEntity", () => {
    test("Normal instantiation", async () => {
        const state = new ChannelReadStateEntity({
            id,
            userId,
            channelId,
            lastMessageId,
            lastMessageCreatedAt,
        })
        expect(state).toBeInstanceOf(ChannelReadStateEntity)
    })
    test("Missing 'id'", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            new ChannelReadStateEntity({
                userId,
                channelId,
                lastMessageId,
                lastMessageCreatedAt,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidId)
            }
        }
    })
    test("Missing 'userId'", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            new ChannelReadStateEntity({
                id,
                channelId,
                lastMessageId,
                lastMessageCreatedAt,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidUserId)
            }
        }
    })
    test("Missing 'channelId'", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            new ChannelReadStateEntity({
                id,
                userId,
                lastMessageId,
                lastMessageCreatedAt,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidChannelId)
            }
        }
    })
    test("Missing 'lastMessageId'", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            new ChannelReadStateEntity({
                id,
                userId,
                channelId,
                lastMessageCreatedAt,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidLastMessageId)
            }
        }
    })
    it.each([1.5, "beluga", new Date(), {}, [], true, false, null, undefined])("Invalid 'id'", (id) => {
        expect.assertions(2)
        try {
            new ChannelReadStateEntity({
                // @ts-ignore
                id,
                userId,
                channelId,
                lastMessageId,
                lastMessageCreatedAt,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidId)
            }
        }
    })
    it.each([1.5, "beluga", new Date(), {}, [], true, false, null, undefined])("Invalid 'userId'", (userId) => {
        expect.assertions(2)
        try {
            new ChannelReadStateEntity({
                id,
                // @ts-ignore
                userId,
                channelId,
                lastMessageId,
                lastMessageCreatedAt,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidUserId)
            }
        }
    })
    it.each([1.5, "beluga", new Date(), {}, [], true, false, null, undefined])("Invalid 'channelId'", (channelId) => {
        expect.assertions(2)
        try {
            new ChannelReadStateEntity({
                id,
                userId,
                // @ts-ignore
                channelId,
                lastMessageId,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidChannelId)
            }
        }
    })
    it.each([1.5, "beluga", new Date(), {}, [], true, false, null, undefined])(
        "Invalid 'lastMessageId'",
        (lastMessageId) => {
            expect.assertions(2)
            try {
                new ChannelReadStateEntity({
                    id,
                    userId,
                    channelId,
                    // @ts-ignore
                    lastMessageId,
                    lastMessageCreatedAt,
                })
            } catch (error) {
                expect(error).toBeInstanceOf(DomainError)
                if (error instanceof DomainError) {
                    expect(error.code).toBe(ErrorCodes.InvalidLastMessageId)
                }
            }
        }
    )
})
