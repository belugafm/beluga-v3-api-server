import { DomainError } from "../DomainError"
import { Validator } from "./Validator"

interface ValidateByOptions {
    nullable?: boolean
    errorCode?: string
}

export function ValidateBy<T>(validator: Validator<T>, options?: ValidateByOptions) {
    return (target: any, propertyKey: string) => {
        let value: T | null
        const getter = function () {
            return value
        }
        const setter = function (newVal: T) {
            if (options?.nullable && newVal === null) {
                value = null
                return
            }
            if (validator.ok(newVal)) {
                value = newVal
            } else {
                throw new DomainError(options?.errorCode ? options.errorCode : "")
            }
        }
        Object.defineProperty(target, propertyKey, {
            get: getter,
            set: setter,
        })
    }
}
