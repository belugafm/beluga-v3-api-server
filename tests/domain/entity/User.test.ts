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

const id = 1
const name = "example"
const registrationIpAddress = "192.168.1.1"

describe("UserEntity::constructor", () => {
    test("Normal", async () => {
        const user = new UserEntity({ id, name, registrationIpAddress })
        expect(user).toBeInstanceOf(UserEntity)
    })
    it.each([1.5, "beluga", new Date(), {}, [], true, false, null, undefined])("InvalidId", (id) => {
        expect.assertions(2)
        try {
            // @ts-ignore
            const user = new UserEntity({ id, name, registrationIpAddress })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidId)
            }
        }
    })
    it.each([1.5, new Date(), {}, [], true, false, null, undefined])("InvalidName", (name) => {
        expect.assertions(2)
        try {
            // @ts-ignore
            const user = new UserEntity({ id, name, registrationIpAddress })
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidName)
            }
        }
    })
    it.each([1.5, "beluga", new Date(), {}, [], true, false, null, undefined])(
        "invalidRegistrationIpAddress",
        (registrationIpAddress) => {
            expect.assertions(2)
            try {
                // @ts-ignore
                const user = new UserEntity({ id, name, registrationIpAddress })
            } catch (error) {
                expect(error).toBeInstanceOf(DomainError)
                if (error instanceof DomainError) {
                    expect(error.code).toMatch(ErrorCodes.InvalidValue)
                }
            }
        }
    )
})
describe("UserEntity::id", () => {
    it.each([1, 10000000])("Normal", (newId) => {
        const user = new UserEntity({ id, name, registrationIpAddress })
        // @ts-ignore
        user.id = newId
    })
    it.each([1.5, "beluga", new Date(), {}, [], true, false, null, undefined])("InvalidId", (newId) => {
        expect.assertions(2)
        try {
            const user = new UserEntity({ id, name, registrationIpAddress })
            // @ts-ignore
            user.id = newId
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidId)
            }
        }
    })
})

describe("UserEntity::name", () => {
    it.each([
        generateRandomStringWithLength(config.user.name.min_length, CHARSET_USERNAME),
        generateRandomStringWithLength(config.user.name.max_length - config.user.name.min_length, CHARSET_USERNAME),
        generateRandomStringWithLength(config.user.name.max_length, CHARSET_USERNAME),
    ])("Normal", (newName) => {
        const user = new UserEntity({ id, name, registrationIpAddress })
        // @ts-ignore
        user.name = newName
    })
    it.each([
        "user-1234",
        generateRandomStringWithLength(config.user.name.max_length + 1, CHARSET_USERNAME),
        generateRandomStringWithLength(config.user.name.min_length - 1, CHARSET_USERNAME),
        "",
        1.5,
        new Date(),
        {},
        [],
        true,
        false,
        null,
        undefined,
    ])("InvalidName", (newName) => {
        expect.assertions(2)
        try {
            const user = new UserEntity({ id, name, registrationIpAddress })
            // @ts-ignore
            user.name = newName
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidName)
            }
        }
    })
})

describe("UserEntity::displayName", () => {
    it.each([
        generateRandomStringWithLength(config.user.display_name.min_length),
        generateRandomStringWithLength(config.user.display_name.max_length),
        generateRandomStringWithLength(config.user.display_name.max_length - config.user.display_name.min_length),
        null,
    ])("Normal", (newName) => {
        const user = new UserEntity({ id, name, registrationIpAddress })
        // @ts-ignore
        user.displayName = newName
    })
    it.each([
        generateRandomStringWithLength(config.user.display_name.max_length + 1),
        generateRandomStringWithLength(config.user.display_name.min_length - 1),
        1.5,
        new Date(),
        {},
        [],
        true,
        false,
    ])("InvalidDisplayName", (newName) => {
        expect.assertions(2)
        try {
            const user = new UserEntity({ id, name, registrationIpAddress })
            // @ts-ignore
            user.displayName = newName
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidDisplayName)
            }
        }
    })
})

describe("UserEntity::twitterUserId", () => {
    it.each(["1111", null])("Normal", (newId) => {
        const user = new UserEntity({ id, name, registrationIpAddress })
        // @ts-ignore
        user.twitterUserId = newId
    })
    it.each([1.5, new Date(), {}, [], true, false])("InvalidTwitterId", (newId) => {
        expect.assertions(2)
        const user = new UserEntity({ id, name, registrationIpAddress })
        try {
            // @ts-ignore
            user.twitterUserId = newId
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidTwitterId)
            }
        }
    })
})

describe("UserEntity::profileImageUrl", () => {
    it.each(["http://example.com/example.png", null])("Normal", (newProfileImageUrl) => {
        const user = new UserEntity({ id, name, registrationIpAddress })
        // @ts-ignore
        user.profileImageUrl = newProfileImageUrl
    })
    it.each([1.5, new Date(), {}, [], true, false])("InvalidProfileImageUrl", (newProfileImageUrl) => {
        expect.assertions(2)
        const user = new UserEntity({ id, name, registrationIpAddress })
        try {
            // @ts-ignore
            user.profileImageUrl = newProfileImageUrl
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidProfileImageUrl)
            }
        }
    })
})

describe("UserEntity::location", () => {
    it.each([
        generateRandomStringWithLength(config.user.location.min_length),
        generateRandomStringWithLength(config.user.location.max_length),
        generateRandomStringWithLength(config.user.location.max_length - config.user.location.min_length),
        null,
    ])("Normal", (newLocation) => {
        const user = new UserEntity({ id, name, registrationIpAddress })
        // @ts-ignore
        user.location = newLocation
    })
    it.each([1.5, new Date(), {}, [], true, false])("InvalidLocation", (newLocation) => {
        expect.assertions(2)
        const user = new UserEntity({ id, name, registrationIpAddress })
        try {
            // @ts-ignore
            user.location = newLocation
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidLocation)
            }
        }
    })
})

describe("UserEntity::url", () => {
    it.each(["https://example.com", null])("Normal", (newUrl) => {
        const user = new UserEntity({ id, name, registrationIpAddress })
        // @ts-ignore
        user.url = newUrl
    })
    it.each(["", "http://", "https://", "http://example", 1.5, new Date(), {}, [], true, false])(
        "InvalidUrl",
        (newUrl) => {
            expect.assertions(2)
            const user = new UserEntity({ id, name, registrationIpAddress })
            try {
                // @ts-ignore
                user.url = newUrl
            } catch (error) {
                expect(error).toBeInstanceOf(DomainError)
                if (error instanceof DomainError) {
                    expect(error.code).toMatch(ErrorCodes.InvalidUrl)
                }
            }
        }
    )
})

describe("UserEntity::description", () => {
    it.each([
        generateRandomStringWithLength(config.user.description.min_length),
        generateRandomStringWithLength(config.user.description.max_length),
        null,
    ])("Normal", (newDescription) => {
        const user = new UserEntity({ id, name, registrationIpAddress })
        // @ts-ignore
        user.description = newDescription
    })
    it.each([
        generateRandomStringWithLength(config.user.description.max_length + 1),
        generateRandomStringWithLength(config.user.description.min_length - 1),
        1.5,
        new Date(),
        {},
        [],
        true,
        false,
    ])("InvalidUrl", (newDescription) => {
        expect.assertions(2)
        const user = new UserEntity({ id, name, registrationIpAddress })
        try {
            // @ts-ignore
            user.description = newDescription
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidDescription)
            }
        }
    })
})

for (const key of ["messageCount", "favoritesCount", "favoritedCount", "trustLevel"]) {
    describe(`UserEntity::${key}`, () => {
        it.each([0, 1, 1000000])("Normal", (newValue) => {
            const user = new UserEntity({ id, name, registrationIpAddress })
            // @ts-ignore
            user[key] = newValue
        })
        it.each(["beluga", 1.5, new Date(), {}, [], true, false])("InvalidNumber", (newValue) => {
            expect.assertions(2)
            const user = new UserEntity({ id, name, registrationIpAddress })
            try {
                // @ts-ignore
                user[key] = newValue
            } catch (error) {
                expect(error).toBeInstanceOf(DomainError)
                if (error instanceof DomainError) {
                    expect(error.code).toMatch(ErrorCodes.InvalidNumber)
                }
            }
        })
    })
}

for (const key of ["bot", "active", "dormant", "suspended"]) {
    describe(`UserEntity::${key}`, () => {
        it.each([true, false])("Normal", (newValue) => {
            const user = new UserEntity({ id, name, registrationIpAddress })
            // @ts-ignore
            user[key] = newValue
        })
        it.each(["beluga", 1.5, new Date(), {}, [], null, undefined])("InvalidValue", (newValue) => {
            expect.assertions(2)
            const user = new UserEntity({ id, name, registrationIpAddress })
            try {
                // @ts-ignore
                user[key] = newValue
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
    it.each([new Date()])("Normal", (newValue) => {
        const user = new UserEntity({ id, name, registrationIpAddress })
        // @ts-ignore
        user.createdAt = newValue
    })
    it.each(["beluga", 1.5, {}, [], true, false, null, undefined])("Normal", (newValue) => {
        expect.assertions(2)
        const user = new UserEntity({ id, name, registrationIpAddress })
        try {
            // @ts-ignore
            user.createdAt = newValue
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidDate)
            }
        }
    })
})

describe("UserEntity::lastActivityDate", () => {
    it.each([new Date(), null])("Normal", (newValue) => {
        const user = new UserEntity({ id, name, registrationIpAddress })
        // @ts-ignore
        user.lastActivityDate = newValue
    })
    it.each(["beluga", 1.5, {}, [], true, false])("Normal", (newValue) => {
        expect.assertions(2)
        const user = new UserEntity({ id, name, registrationIpAddress })
        try {
            // @ts-ignore
            user.lastActivityDate = newValue
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidDate)
            }
        }
    })
})

describe("UserEntity::termsOfServiceAgreementDate", () => {
    it.each([new Date(), null])("Normal", (newValue) => {
        const user = new UserEntity({ id, name, registrationIpAddress })
        // @ts-ignore
        user.termsOfServiceAgreementDate = newValue
    })
    it.each(["beluga", 1.5, {}, [], true, false])("Normal", (newValue) => {
        expect.assertions(2)
        const user = new UserEntity({ id, name, registrationIpAddress })
        try {
            // @ts-ignore
            user.termsOfServiceAgreementDate = newValue
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidDate)
            }
        }
    })
})

describe("UserEntity::termsOfServiceAgreementVersion", () => {
    it.each(["beluga", null])("Normal", (newValue) => {
        const user = new UserEntity({ id, name, registrationIpAddress })
        // @ts-ignore
        user.termsOfServiceAgreementVersion = newValue
    })
    it.each([1.5, new Date(), {}, [], true, false])("Normal", (newValue) => {
        expect.assertions(2)
        const user = new UserEntity({ id, name, registrationIpAddress })
        try {
            // @ts-ignore
            user.termsOfServiceAgreementVersion = newValue
        } catch (error) {
            expect(error).toBeInstanceOf(DomainError)
            if (error instanceof DomainError) {
                expect(error.code).toMatch(ErrorCodes.InvalidValue)
            }
        }
    })
})
