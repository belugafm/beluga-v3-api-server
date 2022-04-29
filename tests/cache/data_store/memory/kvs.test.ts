import { InMemoryCache } from "../../../../src/cache/data_store/memory"
import { UserEntity } from "../../../../src/domain/entity/User"
import { sleep } from "../../../mongoose/functions"

jest.setTimeout(30000)

describe("UsersRepository", () => {
    test("Normal", async () => {
        const user1 = new UserEntity({ id: 1, name: "hoge", registrationIpAddress: "192.168.1.1" })
        const user2 = new UserEntity({ id: 2, name: "fuga", registrationIpAddress: "192.168.1.1" })
        const user3 = new UserEntity({ id: 3, name: "piyo", registrationIpAddress: "192.168.1.1" })

        const cacheLimit = 2
        const expireSec = 5
        const kvs = new InMemoryCache({ cacheLimit, defaultExpireSeconds: expireSec })
        {
            const key = `user_${user1.id}`
            kvs.set(key, user1)
            const cachedUser = kvs.get(key)
            expect(cachedUser).not.toBeNull()
        }
        {
            const cachedUser = kvs.get("hoge")
            expect(cachedUser).toBeNull()
        }
        await sleep(expireSec + 1)
        {
            const key = `user_${user1.id}`
            const cachedUser = kvs.get(key)
            expect(cachedUser).toBeNull()
        }
        {
            kvs.set(`user_${user1.id}`, user1)
            kvs.set(`user_${user2.id}`, user2)
        }
        {
            const cachedUser = kvs.get(`user_${user1.id}`) as UserEntity
            expect(cachedUser).not.toBeNull()
            expect(cachedUser.id).toBe(user1.id)
        }
        {
            const cachedUser = kvs.get(`user_${user2.id}`) as UserEntity
            expect(cachedUser).not.toBeNull()
            expect(cachedUser.id).toBe(user2.id)
        }
        {
            kvs.set(`user_${user3.id}`, user3)
            expect(kvs.size()).toBe(1)
        }
    })
})
