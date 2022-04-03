import { ErrorCodes, MessageEntity } from "../../../domain/entity/Message"

import { DomainError } from "../../../domain/DomainError"

const id = 1
const text = "hoge"
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
                expect(error.code).toBe(ErrorCodes.InvalidLikeCount)
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
    test("Invalid 'id'", async () => {
        expect.assertions(2)
        try {
            const id = 1.5
            new MessageEntity({
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
    test("Invalid 'id'", async () => {
        expect.assertions(2)
        try {
            const id = "hoge"
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
    test("Invalid 'id'", async () => {
        expect.assertions(2)
        try {
            const id = new Date()
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
    test("Invalid 'text'", async () => {
        expect.assertions(2)
        try {
            const text = 1
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
    test("Invalid 'text'", async () => {
        expect.assertions(2)
        try {
            const text = new Date()
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
    test("Invalid 'channelId'", async () => {
        expect.assertions(2)
        try {
            const channelId = 2.2
            new MessageEntity({
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
                expect(error.code).toBe(ErrorCodes.InvalidChannelId)
            }
        }
    })
    test("Invalid 'channelId'", async () => {
        expect.assertions(2)
        try {
            const channelId = "hoge"
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
    test("Invalid 'channelId'", async () => {
        expect.assertions(2)
        try {
            const channelId = new Date()
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
    test("Invalid 'userId'", async () => {
        expect.assertions(2)
        try {
            const userId = 3.3
            new MessageEntity({
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
                expect(error.code).toBe(ErrorCodes.InvalidUserId)
            }
        }
    })
    test("Invalid 'userId'", async () => {
        expect.assertions(2)
        try {
            const userId = "hoge"
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
    test("Invalid 'userId'", async () => {
        expect.assertions(2)
        try {
            const userId = new Date()
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
    test("Invalid 'createdAt'", async () => {
        expect.assertions(2)
        try {
            const createdAt = "fuga"
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
    test("Invalid 'createdAt'", async () => {
        expect.assertions(2)
        try {
            const createdAt = 1
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
    test("Invalid 'favoriteCount'", async () => {
        expect.assertions(2)
        try {
            const favoriteCount = 5.9
            new MessageEntity({
                id,
                text,
                channelId,
                userId,
                createdAt,
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
    })
    test("Invalid 'favoriteCount'", async () => {
        expect.assertions(2)
        try {
            const favoriteCount = "hoge"
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
    })
    test("Invalid 'favoriteCount'", async () => {
        expect.assertions(2)
        try {
            const favoriteCount = new Date()
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
    })
    test("Invalid 'likeCount'", async () => {
        expect.assertions(2)
        try {
            const likeCount = 23.4
            new MessageEntity({
                id,
                text,
                channelId,
                userId,
                createdAt,
                favoriteCount: 100,
                likeCount,
                replyCount: 4,
                threadId: 2,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidLikeCount)
            }
        }
    })
    test("Invalid 'likeCount'", async () => {
        expect.assertions(2)
        try {
            const likeCount = "fuga"
            new MessageEntity({
                id,
                text,
                channelId,
                userId,
                createdAt,
                favoriteCount: 100,
                // @ts-ignore
                likeCount,
                replyCount: 4,
                threadId: 2,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidLikeCount)
            }
        }
    })
    test("Invalid 'likeCount'", async () => {
        expect.assertions(2)
        try {
            const likeCount = new Date()
            new MessageEntity({
                id,
                text,
                channelId,
                userId,
                createdAt,
                favoriteCount: 100,
                // @ts-ignore
                likeCount,
                replyCount: 4,
                threadId: 2,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidLikeCount)
            }
        }
    })
    test("Invalid 'replyCount'", async () => {
        expect.assertions(2)
        try {
            const replyCount = 23.4
            new MessageEntity({
                id,
                text,
                channelId,
                userId,
                createdAt,
                favoriteCount: 100,
                likeCount: 50,
                replyCount,
                threadId: 2,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidLikeCount)
            }
        }
    })
    test("Invalid 'replyCount'", async () => {
        expect.assertions(2)
        try {
            const replyCount = "hoge"
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
                expect(error.code).toBe(ErrorCodes.InvalidLikeCount)
            }
        }
    })
    test("Invalid 'replyCount'", async () => {
        expect.assertions(2)
        try {
            const replyCount = new Date()
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
                expect(error.code).toBe(ErrorCodes.InvalidLikeCount)
            }
        }
    })
    test("Invalid 'threadId'", async () => {
        expect.assertions(2)
        try {
            const threadId = 55.9
            new MessageEntity({
                id,
                text,
                channelId,
                userId,
                createdAt,
                favoriteCount: 100,
                likeCount: 50,
                replyCount: 1,
                threadId,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toBe(ErrorCodes.InvalidThreadId)
            }
        }
    })
    test("Invalid 'threadId'", async () => {
        expect.assertions(2)
        try {
            const threadId = "hoge"
            new MessageEntity({
                id,
                text,
                channelId,
                userId,
                createdAt,
                favoriteCount: 100,
                likeCount: 50,
                replyCount: 1,
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
    test("Invalid 'threadId'", async () => {
        expect.assertions(2)
        try {
            const threadId = new Date()
            new MessageEntity({
                id,
                text,
                channelId,
                userId,
                createdAt,
                favoriteCount: 100,
                likeCount: 50,
                replyCount: 1,
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
})
