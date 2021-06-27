import * as vn from "../../../domain/validation"

import { ValidateBy, storage } from "../../../domain/validation/decorators"

import { Entity } from "../../../domain/entity/Entity"
import { sleep } from "../../env"

jest.setTimeout(30000)

class Example extends Entity {
    @ValidateBy(vn.string())
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
