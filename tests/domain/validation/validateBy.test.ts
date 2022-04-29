import * as vn from "../../../src/domain/validation"

import { Validate, storage } from "../../../src/domain/validation/decorators"

import { Entity } from "../../../src/domain/entity/Entity"
import { sleep } from "../functions"

jest.setTimeout(30000)

class Example extends Entity {
    @Validate(vn.string())
    // @ts-ignore
    property: string
}

describe("ValidateBy", () => {
    test("Normal", async () => {
        const instance1 = new Example()
        const instance2 = new Example()
        instance1.property = "a"
        instance2.property = "b"
        expect(instance1.property).toBe("a")
        expect(instance2.property).toBe("b")
    })
    test("FinalizationRegistry", async () => {
        let instance
        for (let k = 0; k < 100; k++) {
            instance = new Example()
            instance.property = `${k}`
        }
        instance = null
        eval("%CollectGarbage(true)")
        await sleep(5)
        expect(Object.keys(storage).length).toBe(0)
    })
})
