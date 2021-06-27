import { ErrorCodes, UserEntity } from "../../../domain/entity/User"

import { DomainError } from "../../../domain/DomainError"
import config from "../../../config/app"

const CHARSET_USERNAME = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890_"

function generateRandomStringWithLength(length: number, charset?: string) {
    if (charset == null) {
        charset =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん"
    }
    let ret = ""
    for (let k = 0; k < length; k++) {
        ret += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return ret
}

describe("UserEntity::constructor", () => {
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        expect(user).toBeInstanceOf(UserEntity)
    })
    test("Normal", async () => {
        const user = new UserEntity(1, "hoge")
        expect(user).toBeInstanceOf(UserEntity)
    })
    test("Errors", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            const user = new UserEntity(null, "hoge")
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidId)
            }
        }
    })
    test("Errors", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            const user = new UserEntity(true, "hoge")
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidId)
            }
        }
    })
    test("Errors", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            const user = new UserEntity("0000", true)
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidName)
            }
        }
    })
    test("Errors", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            const user = new UserEntity("0000", null)
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidName)
            }
        }
    })
    test("Errors", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            const user = new UserEntity(new Date(), "hoge")
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidId)
            }
        }
    })
    test("Errors", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            const user = new UserEntity("0000", new Date())
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidName)
            }
        }
    })
    test("Errors", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            const user = new UserEntity(new Date(), new Date())
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidId)
            }
        }
    })
    test("Errors", async () => {
        expect.assertions(2)
        try {
            // @ts-ignore
            const user = new UserEntity(true, true)
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidId)
            }
        }
    })
})
describe("UserEntity::id", () => {
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.id = "1111"
    })
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.id = 1
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.id = null
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidId)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.id = new Date()
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidId)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.id = true
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidId)
            }
        }
    })
})

describe("UserEntity::name", () => {
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.name = generateRandomStringWithLength(config.user.name.min_length, CHARSET_USERNAME)
    })
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.name = generateRandomStringWithLength(
            config.user.name.max_length - config.user.name.min_length,
            CHARSET_USERNAME
        )
    })
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.name = generateRandomStringWithLength(config.user.name.max_length, CHARSET_USERNAME)
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            user.name = "user-1234"
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidName)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            user.name = generateRandomStringWithLength(
                config.user.name.max_length + 1,
                CHARSET_USERNAME
            )
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidName)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            user.name = generateRandomStringWithLength(
                config.user.name.min_length - 1,
                CHARSET_USERNAME
            )
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidName)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            user.name = ""
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidName)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            user.name =
                "0123456789abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz"
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidName)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.name = null
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidName)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.name = 1
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidName)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.name = new Date()
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidName)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.name = true
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidName)
            }
        }
    })
})

describe("UserEntity::displayName", () => {
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.displayName = generateRandomStringWithLength(config.user.display_name.min_length)
    })
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.displayName = generateRandomStringWithLength(config.user.display_name.max_length)
    })
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.displayName = generateRandomStringWithLength(
            config.user.display_name.max_length - config.user.display_name.min_length
        )
    })
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.displayName = null
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            user.displayName = generateRandomStringWithLength(
                config.user.display_name.max_length + 1
            )
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidDisplayName)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            user.displayName = generateRandomStringWithLength(
                config.user.display_name.min_length - 1
            )
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidDisplayName)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.displayName = 1
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidDisplayName)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.displayName = new Date()
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidDisplayName)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.displayName = true
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidDisplayName)
            }
        }
    })
})

describe("UserEntity::twitterUserId", () => {
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.twitterUserId = "1111"
    })
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.twitterUserId = null
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.twitterUserId = 1
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidTwitterId)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.twitterUserId = new Date()
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidTwitterId)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.twitterUserId = true
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidTwitterId)
            }
        }
    })
})

describe("UserEntity::profileImageUrl", () => {
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.profileImageUrl = "http://example.com/example.png"
    })
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.profileImageUrl = null
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            user.profileImageUrl = "hoge"
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidProfileImageUrl)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.profileImageUrl = 1
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidProfileImageUrl)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.profileImageUrl = new Date()
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidProfileImageUrl)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.profileImageUrl = true
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidProfileImageUrl)
            }
        }
    })
})

describe("UserEntity::location", () => {
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.location = generateRandomStringWithLength(config.user.location.min_length)
    })
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.location = generateRandomStringWithLength(config.user.location.max_length)
    })
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.location = generateRandomStringWithLength(
            config.user.location.max_length - config.user.location.min_length
        )
    })
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.location = null
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            user.location = generateRandomStringWithLength(config.user.location.max_length + 1)
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidLocation)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            user.location = generateRandomStringWithLength(config.user.location.min_length - 1)
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidLocation)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.location = 1
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidLocation)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.location = new Date()
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidLocation)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.location = true
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidLocation)
            }
        }
    })
})

describe("UserEntity::url", () => {
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.url = "http://example.com"
    })
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.url = "https://example.com"
    })
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.url = null
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            user.url = ""
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidUrl)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            user.url = "http://"
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidUrl)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            user.url = "https://"
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidUrl)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            user.url = "http://example"
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidUrl)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            user.url = "https://example"
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidUrl)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.url = 1
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidUrl)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.url = new Date()
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidUrl)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.url = true
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidUrl)
            }
        }
    })
})

describe("UserEntity::description", () => {
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.description = generateRandomStringWithLength(config.user.description.min_length)
    })
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.description = generateRandomStringWithLength(config.user.description.max_length)
    })
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.description = null
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            user.description = generateRandomStringWithLength(
                config.user.description.max_length + 1
            )
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidDescription)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            user.description = generateRandomStringWithLength(
                config.user.description.min_length - 1
            )
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidDescription)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.description = 1
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidDescription)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.description = new Date()
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidDescription)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.description = true
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidDescription)
            }
        }
    })
})

describe("UserEntity::themeColor", () => {
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.themeColor = "#aa00ff"
    })
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.themeColor = null
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            user.themeColor = ""
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidThemeColor)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            user.themeColor = "example"
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidThemeColor)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            user.themeColor = "#zzzzzz"
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidThemeColor)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.themeColor = 1
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidThemeColor)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.themeColor = new Date()
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidThemeColor)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.themeColor = true
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidThemeColor)
            }
        }
    })
})

describe("UserEntity::backgroundImageUrl", () => {
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.backgroundImageUrl = "http://example.com"
    })
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.backgroundImageUrl = "https://example.com"
    })
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.backgroundImageUrl = null
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            user.backgroundImageUrl = ""
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidBackgroundImageUrl)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            user.backgroundImageUrl = "http://"
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidBackgroundImageUrl)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            user.backgroundImageUrl = "https://"
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidBackgroundImageUrl)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            user.backgroundImageUrl = "http://example"
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidBackgroundImageUrl)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            user.backgroundImageUrl = "https://example"
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidBackgroundImageUrl)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.backgroundImageUrl = 1
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidBackgroundImageUrl)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.backgroundImageUrl = new Date()
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidBackgroundImageUrl)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.backgroundImageUrl = true
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidBackgroundImageUrl)
            }
        }
    })
})

for (const key of [
    "statusCount",
    "favoritesCount",
    "favoritedCount",
    "likesCount",
    "likedCount",
    "channelsCount",
    "followingChannelsCount",
    "trustLevel",
]) {
    describe(`UserEntity::${key}`, () => {
        test("Normal", async () => {
            const user = new UserEntity("0000", "hoge")
            // @ts-ignore
            user[key] = 0
        })
        test("Normal", async () => {
            const user = new UserEntity("0000", "hoge")
            // @ts-ignore
            user[key] = 1000
        })
        test("Errors", async () => {
            const user = new UserEntity("0000", "hoge")
            expect.assertions(2)
            try {
                // @ts-ignore
                user[key] = -1
            } catch (error) {
                expect(error).toBeInstanceOf(DomainError)
                if (error instanceof DomainError) {
                    expect(error.code).toMatch(ErrorCodes.InvalidNumber)
                }
            }
        })
        test("Errors", async () => {
            const user = new UserEntity("0000", "hoge")
            expect.assertions(2)
            try {
                // @ts-ignore
                user[key] = "example"
            } catch (error) {
                expect(error).toBeInstanceOf(DomainError)
                if (error instanceof DomainError) {
                    expect(error.code).toMatch(ErrorCodes.InvalidNumber)
                }
            }
        })
        test("Errors", async () => {
            const user = new UserEntity("0000", "hoge")
            expect.assertions(2)
            try {
                // @ts-ignore
                user[key] = new Date()
            } catch (error) {
                expect(error).toBeInstanceOf(DomainError)
                if (error instanceof DomainError) {
                    expect(error.code).toMatch(ErrorCodes.InvalidNumber)
                }
            }
        })
        test("Errors", async () => {
            const user = new UserEntity("0000", "hoge")
            expect.assertions(2)
            try {
                // @ts-ignore
                user[key] = true
            } catch (error) {
                expect(error).toBeInstanceOf(DomainError)
                if (error instanceof DomainError) {
                    expect(error.code).toMatch(ErrorCodes.InvalidNumber)
                }
            }
        })
    })
}

for (const key of ["defaultProfile", "active", "dormant", "suspended"]) {
    describe(`UserEntity::${key}`, () => {
        test("Normal", async () => {
            const user = new UserEntity("0000", "hoge")
            // @ts-ignore
            user[key] = true
        })
        test("Normal", async () => {
            const user = new UserEntity("0000", "hoge")
            // @ts-ignore
            user[key] = false
        })
        test("Errors", async () => {
            const user = new UserEntity("0000", "hoge")
            expect.assertions(2)
            try {
                // @ts-ignore
                user[key] = 1
            } catch (error) {
                expect(error).toBeInstanceOf(DomainError)
                if (error instanceof DomainError) {
                    expect(error.code).toMatch(ErrorCodes.InvalidValue)
                }
            }
        })
        test("Errors", async () => {
            const user = new UserEntity("0000", "hoge")
            expect.assertions(2)
            try {
                // @ts-ignore
                user[key] = "example"
            } catch (error) {
                expect(error).toBeInstanceOf(DomainError)
                if (error instanceof DomainError) {
                    expect(error.code).toMatch(ErrorCodes.InvalidValue)
                }
            }
        })
        test("Errors", async () => {
            const user = new UserEntity("0000", "hoge")
            expect.assertions(2)
            try {
                // @ts-ignore
                user[key] = new Date()
            } catch (error) {
                expect(error).toBeInstanceOf(DomainError)
                if (error instanceof DomainError) {
                    expect(error.code).toMatch(ErrorCodes.InvalidValue)
                }
            }
        })
    })
}

describe("UserEntity::createdAt", () => {
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.createdAt = new Date()
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.createdAt = 1
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidDate)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.createdAt = "example"
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidDate)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.createdAt = true
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidDate)
            }
        }
    })
})

describe("UserEntity::lastActivityDate", () => {
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.lastActivityDate = new Date()
    })
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.lastActivityDate = null
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.lastActivityDate = 1
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidDate)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.lastActivityDate = "example"
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidDate)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.lastActivityDate = true
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidDate)
            }
        }
    })
})

describe("UserEntity::termsOfServiceAgreementDate", () => {
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.termsOfServiceAgreementDate = new Date()
    })
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.termsOfServiceAgreementDate = null
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.termsOfServiceAgreementDate = 1
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidDate)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.termsOfServiceAgreementDate = "example"
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidDate)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.termsOfServiceAgreementDate = true
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidDate)
            }
        }
    })
})

describe("UserEntity::termsOfServiceAgreementVersion", () => {
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.termsOfServiceAgreementVersion = "example"
    })
    test("Normal", async () => {
        const user = new UserEntity("0000", "hoge")
        user.termsOfServiceAgreementVersion = null
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.termsOfServiceAgreementVersion = 1
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidValue)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.termsOfServiceAgreementVersion = new Date()
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidValue)
            }
        }
    })
    test("Errors", async () => {
        const user = new UserEntity("0000", "hoge")
        expect.assertions(2)
        try {
            // @ts-ignore
            user.termsOfServiceAgreementVersion = true
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidValue)
            }
        }
    })
})
