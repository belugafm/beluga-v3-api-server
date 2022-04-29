import { ErrorCodes, MessageEntity } from "../../../src/domain/entity/Message"

import { DomainError } from "../../../src/domain/DomainError"

const id = 1
const text = "beluga"
const channelId = 1
const userId = 1
const createdAt = new Date()

describe("MessageEntity", () => {
    test("Normal instantiation", async () => {
        const channel = new MessageEntity({
            id,
            text,
            channelId,
            userId,
            createdAt,
            favoriteCount: 0,
            likeCount: 0,
            replyCount: 0,
            threadId: null,
        })
        expect(channel).toBeInstanceOf(MessageEntity)
    })
    test("Normal instantiation", async () => {
        const channel = new MessageEntity({
            id,
            text,
            channelId,
            userId,
            createdAt,
            favoriteCount: 100,
            likeCount: 50,
            replyCount: 1,
            threadId: null,
        })
        expect(channel).toBeInstanceOf(MessageEntity)
    })
    test("Normal instantiation", async () => {
        const channel = new MessageEntity({
            id,
            text,
            channelId,
            userId,
            createdAt,
            favoriteCount: 100,
            likeCount: 50,
            replyCount: 1,
            threadId: 2,
        })
        expect(channel).toBeInstanceOf(MessageEntity)
    })
    test("Missing 'id'", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            new MessageEntity({
                text,
                channelId,
                userId,
                createdAt,
                favoriteCount: 100,
                likeCount: 50,
                replyCount: 1,
                threadId: 2,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidId)
            }
        }
    })
    test("Missing 'text'", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            new MessageEntity({
                id,
                channelId,
                userId,
                createdAt,
                favoriteCount: 100,
                likeCount: 50,
                replyCount: 1,
                threadId: 2,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidText)
            }
        }
    })
    test("Missing 'channelId'", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            new MessageEntity({
                id,
                text,
                userId,
                createdAt,
                favoriteCount: 100,
                likeCount: 50,
                replyCount: 1,
                threadId: 2,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidChannelId)
            }
        }
    })
    test("Missing 'userId'", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            new MessageEntity({
                id,
                text,
                channelId,
                createdAt,
                favoriteCount: 100,
                likeCount: 50,
                replyCount: 1,
                threadId: 2,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidUserId)
            }
        }
    })
    test("Missing 'createdAt'", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            new MessageEntity({
                id,
                text,
                channelId,
                userId,
                favoriteCount: 100,
                likeCount: 50,
                replyCount: 1,
                threadId: 2,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidCreatedAt)
            }
        }
    })
    test("Missing 'favoriteCount'", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            new MessageEntity({
                id,
                text,
                channelId,
                userId,
                createdAt,
                likeCount: 50,
                replyCount: 1,
                threadId: 2,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidFavoriteCount)
            }
        }
    })
    test("Missing 'likeCount'", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            new MessageEntity({
                id,
                text,
                channelId,
                userId,
                createdAt,
                favoriteCount: 100,
                replyCount: 1,
                threadId: 2,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidLikeCount)
            }
        }
    })
    test("Missing 'replyCount'", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            new MessageEntity({
                id,
                text,
                channelId,
                userId,
                createdAt,
                favoriteCount: 100,
                likeCount: 100,
                threadId: 2,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidReplyCount)
            }
        }
    })
    test("Missing 'threadId'", async () => {
        expect.assertions(0)
        new MessageEntity({
            id,
            text,
            channelId,
            userId,
            createdAt,
            favoriteCount: 100,
            likeCount: 50,
            replyCount: 1,
        })
    })
    it.each([1.5, "beluga", new Date(), {}, [], true, false, null, undefined])("Invalid 'id'", (id) => {
        expect.assertions(2)
        try {
            new MessageEntity({
                // @ts-ignore
                id,
                text,
                channelId,
                userId,
                createdAt,
                favoriteCount: 100,
                likeCount: 50,
                replyCount: 1,
                threadId: 2,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidId)
            }
        }
    })
    it.each([1.5, new Date(), {}, [], true, false, null, undefined])("Invalid 'text'", (text) => {
        expect.assertions(2)
        try {
            new MessageEntity({
                id,
                // @ts-ignore
                text,
                channelId,
                userId,
                createdAt,
                favoriteCount: 100,
                likeCount: 50,
                replyCount: 1,
                threadId: 2,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidText)
            }
        }
    })
    it.each([1.5, "beluga", new Date(), {}, [], true, false, null, undefined])("Invalid 'channelId'", (channelId) => {
        expect.assertions(2)
        try {
            new MessageEntity({
                id,
                text,
                // @ts-ignore
                channelId,
                userId,
                createdAt,
                favoriteCount: 100,
                likeCount: 50,
                replyCount: 1,
                threadId: 2,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidChannelId)
            }
        }
    })
    it.each([1.5, "beluga", new Date(), {}, [], true, false, null, undefined])("Invalid 'userId'", (userId) => {
        expect.assertions(2)
        try {
            new MessageEntity({
                id,
                text,
                channelId,
                // @ts-ignore
                userId,
                createdAt,
                favoriteCount: 100,
                likeCount: 50,
                replyCount: 1,
                threadId: 2,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidUserId)
            }
        }
    })
    it.each([1.5, "beluga", {}])("Invalid 'createdAt'", (createdAt) => {
        expect.assertions(2)
        try {
            new MessageEntity({
                id,
                text,
                channelId,
                userId,
                // @ts-ignore
                createdAt,
                favoriteCount: 100,
                likeCount: 50,
                replyCount: 1,
                threadId: 2,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidCreatedAt)
            }
        }
    })
    it.each([1.5, "beluga", new Date(), {}, [], true, false, null, undefined])(
        "Invalid 'favoriteCount'",
        (favoriteCount) => {
            expect.assertions(2)
            try {
                new MessageEntity({
                    id,
                    text,
                    channelId,
                    userId,
                    createdAt,
                    // @ts-ignore
                    favoriteCount,
                    likeCount: 50,
                    replyCount: 1,
                    threadId: 2,
                })
            } catch (error) {
                expect(error).toBeInstanceOf(DomainError)
                if (error instanceof DomainError) {
                    expect(error.code).toBe(ErrorCodes.InvalidFavoriteCount)
                }
            }
        }
    )
    it.each([1.5, "beluga", new Date(), {}, [], true, false, null, undefined])("Invalid 'likeCount'", (likeCount) => {
        expect.assertions(2)
        try {
            new MessageEntity({
                id,
                text,
                channelId,
                userId,
                createdAt,
                favoriteCount: 100,
                // @ts-ignore
                likeCount,
                replyCount: 1,
                threadId: 2,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidLikeCount)
            }
        }
    })
    it.each([1.5, "beluga", new Date(), {}, [], true, false, null, undefined])("Invalid 'replyCount'", (replyCount) => {
        expect.assertions(2)
        try {
            new MessageEntity({
                id,
                text,
                channelId,
                userId,
                createdAt,
                favoriteCount: 100,
                likeCount: 50,
                // @ts-ignore
                replyCount,
                threadId: 2,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidReplyCount)
            }
        }
    })
    it.each([1.5, "beluga", new Date(), {}, [], true, false])("Invalid 'threadId'", (threadId) => {
        expect.assertions(2)
        try {
            new MessageEntity({
                id,
                text,
                channelId,
                userId,
                createdAt,
                favoriteCount: 100,
                likeCount: 50,
                replyCount: 2,
                // @ts-ignore
                threadId,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidThreadId)
            }
        }
    })
    it.each([1.5, "beluga", new Date(), {}])("Invalid 'deleted'", (deleted) => {
        expect.assertions(2)
        try {
            new MessageEntity({
                id,
                text,
                channelId,
                userId,
                createdAt,
                favoriteCount: 100,
                likeCount: 50,
                replyCount: 2,
                // @ts-ignore
                deleted,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidDeleted)
            }
        }
    })
})
