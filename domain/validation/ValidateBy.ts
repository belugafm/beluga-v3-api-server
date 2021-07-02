import { DomainError } from "../DomainError"
import { Entity } from "../entity/Entity"
import { Validator } from "./Validator"

interface ValidateByOptions {
    nullable?: boolean
    errorCode?: string
}

export const storage: { [key: string]: { [key: string]: any } } = {}
const registry = new FinalizationRegistry((uuid: string) => {
    delete storage[uuid]
})

export function ValidateBy<T>(validator: Validator<T>, options?: ValidateByOptions) {
    return (target: object, propertyKey: string) => {
        const getter = function (this: Entity) {
            if (this.uuid in storage) {
                return storage[this.uuid][propertyKey]
            }
            return undefined
        }
        const setter = function (this: Entity, newVal: T) {
            if (this.uuid in storage == false) {
                storage[this.uuid] = {}
                registry.register(this, this.uuid)
            }
            if (options?.nullable && newVal === null) {
                storage[this.uuid][propertyKey] = null
                return
            }
            if (validator.ok(newVal)) {
                storage[this.uuid][propertyKey] = newVal
            } else {
                throw new DomainError(options?.errorCode ? options.errorCode : "")
            }
        }
        Object.defineProperty(target, propertyKey, {
            get: getter,
            set: setter,
            enumerable: true,
        })
    }
}
