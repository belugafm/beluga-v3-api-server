import * as channel from "./types/channel"
import * as channelGroup from "./types/channelGroup"
import * as message from "./types/message"
import * as user from "./types/user"

import { Options as IntegerOptions, integer } from "./types/number"
import { Options as StringOptions, string } from "./types/string"
import { channelGroupId, channelId, messageId, readStateId, userId } from "./types/entityId"

import { DomainError } from "../DomainError"
import { Entity } from "../entity/Entity"
import { PropertyValidator } from "./PropertyValidator"
import { boolean } from "./types/boolean"
import { date } from "./types/date"
import { ipAddress } from "./types/ipAddress"
import { sessionId } from "./types/sessionId"
import { url } from "./types/url"

interface ValidationOptions {
    nullable?: boolean
    errorCode?: string
}

export const storage: { [key: string]: { [key: string]: any } } = {}
const registry = new FinalizationRegistry((uuid: string) => {
    delete storage[uuid]
})

export function Validate<T>(validator: PropertyValidator<T>, options?: ValidationOptions): any {
    return (target: object, propertyKey: string, desc: any) => {
        const getter = function (this: Entity) {
            if (this.uuid in storage) {
                return storage[this.uuid][propertyKey]
            }
            return undefined
        }
        const setter = function (this: Entity, newValue: T) {
            if (this.uuid in storage == false) {
                storage[this.uuid] = {}
                registry.register(this, this.uuid)
            }
            if (options?.nullable && newValue === null) {
                storage[this.uuid][propertyKey] = null
                return
            }
            if (validator.ok(newValue)) {
                storage[this.uuid][propertyKey] = newValue
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

// Message
export function IsMessageId(options?: ValidationOptions) {
    return Validate(messageId(), options)
}
export function IsMessageText(options?: ValidationOptions) {
    return Validate(message.text(), options)
}
export function IsMessageTextStyle(options?: ValidationOptions) {
    return Validate(message.textStyle(), options)
}

// Channel
export function IsChannelId(options?: ValidationOptions) {
    return Validate(channelId(), options)
}
export function IsChannelName(options?: ValidationOptions) {
    return Validate(channel.name(), options)
}
export function IsChannelUniqueName(options?: ValidationOptions) {
    return Validate(channel.uniqueName(), options)
}
export function IsChannelDescription(options?: ValidationOptions) {
    return Validate(channel.description(), options)
}

// ChannelGroup
export function IsChannelGroupId(options?: ValidationOptions) {
    return Validate(channelGroupId(), options)
}
export function IsChannelGroupName(options?: ValidationOptions) {
    return Validate(channelGroup.name(), options)
}
export function IsChannelGroupUniqueName(options?: ValidationOptions) {
    return Validate(channelGroup.uniqueName(), options)
}
export function IsChannelGroupDescription(options?: ValidationOptions) {
    return Validate(channelGroup.description(), options)
}

// User
export function IsUserId(options?: ValidationOptions) {
    return Validate(userId(), options)
}
export function IsUserName(options?: ValidationOptions) {
    return Validate(user.name(), options)
}
export function IsUserDisplayName(options?: ValidationOptions) {
    return Validate(user.displayName(), options)
}
export function IsUserDescription(options?: ValidationOptions) {
    return Validate(user.description(), options)
}
export function IsUserLocation(options?: ValidationOptions) {
    return Validate(user.location(), options)
}
export function IsUserUrl(options?: ValidationOptions) {
    return Validate(user.url(), options)
}

export function IsReadStateId(options?: ValidationOptions) {
    return Validate(readStateId(), options)
}

// Primitive
export function IsSessionId(options?: ValidationOptions) {
    return Validate(sessionId(), options)
}
export function IsIpAddress(options?: ValidationOptions) {
    return Validate(ipAddress(), options)
}
export function IsDate(options?: ValidationOptions) {
    return Validate(date(), options)
}
export function IsAnyInteger(options?: ValidationOptions) {
    return Validate(integer(), options)
}
export function IsInteger(integerOptions: IntegerOptions, validationOption?: ValidationOptions) {
    return Validate(integer(integerOptions), validationOption)
}
export function IsString(stringOption: StringOptions, validationOption?: ValidationOptions) {
    return Validate(string(stringOption), validationOption)
}
export function IsAnyString(options?: ValidationOptions) {
    return Validate(string(), options)
}
export function IsBoolean(options?: ValidationOptions) {
    return Validate(boolean(), options)
}
export function IsUrl(options?: ValidationOptions) {
    return Validate(url(), options)
}
