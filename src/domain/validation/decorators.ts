import * as channel from "./types/channel"
import * as channelGroup from "./types/channel_group"
import * as media from "./types/file"
import * as message from "./types/message"
import * as user from "./types/user"
import * as invite from "./types/invite"
import * as application from "./types/application"

import { Options as IntegerOptions, IntegerValidator } from "./types/Number"
import { Options as StringOptions, StringValidator } from "./types/String"
import {
    ApplicationIdValidator,
    ApplicationTokenIdValidator,
    ChannelGroupIdValidator,
    ChannelIdValidator,
    EntityIdValidator,
    FileIdValidator,
    InviteIdValidator,
    MessageIdValidator,
    RreadStateIdValidator,
    UserIdValidator,
} from "./types/EntityId"

import { DomainError } from "../DomainError"
import { Entity } from "../entity/Entity"
import { PropertyValidator } from "./PropertyValidator"
import { BooleanValidator } from "./types/Boolean"
import { DateValidator } from "./types/Date"
import { IpAddressValidator } from "./types/IpAddress"
import { SessionIdValidator } from "./types/SessionId"
import { UrlValidator } from "./types/Url"
import { TrustRankValidator } from "./types/TrustRank"

interface ValidationOptions {
    nullable?: boolean
    errorCode?: string
}

export const storage: { [key: string]: { [key: string]: any } } = {}
const registry = new FinalizationRegistry((uuid: string) => {
    delete storage[uuid]
})

export function Validator<T>(validator: PropertyValidator<T>, options?: ValidationOptions): any {
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

// Comon
export function IsEntityId(options?: ValidationOptions) {
    return Validator(EntityIdValidator(), options)
}

// Message
export function IsMessageId(options?: ValidationOptions) {
    return Validator(MessageIdValidator(), options)
}
export function IsMessageText(options?: ValidationOptions) {
    return Validator(message.TextValidator(), options)
}
export function IsMessageTextStyle(options?: ValidationOptions) {
    return Validator(message.TextStyleValidator(), options)
}

// Channel
export function IsChannelId(options?: ValidationOptions) {
    return Validator(ChannelIdValidator(), options)
}
export function IsChannelName(options?: ValidationOptions) {
    return Validator(channel.NameValidator(), options)
}
export function IsChannelUniqueName(options?: ValidationOptions) {
    return Validator(channel.UniqueNameValidator(), options)
}
export function IsChannelDescription(options?: ValidationOptions) {
    return Validator(channel.DescriptionValidator(), options)
}

// ChannelGroup
export function IsChannelGroupId(options?: ValidationOptions) {
    return Validator(ChannelGroupIdValidator(), options)
}
export function IsChannelGroupName(options?: ValidationOptions) {
    return Validator(channelGroup.NameValidator(), options)
}
export function IsChannelGroupUniqueName(options?: ValidationOptions) {
    return Validator(channelGroup.UniqueNameValidator(), options)
}
export function IsChannelGroupDescription(options?: ValidationOptions) {
    return Validator(channelGroup.DescriptionValidator(), options)
}

// User
export function IsUserId(options?: ValidationOptions) {
    return Validator(UserIdValidator(), options)
}
export function IsUserName(options?: ValidationOptions) {
    return Validator(user.NameValidator(), options)
}
export function IsUserDisplayName(options?: ValidationOptions) {
    return Validator(user.DisplayNameValidator(), options)
}
export function IsUserDescription(options?: ValidationOptions) {
    return Validator(user.DescriptionValidator(), options)
}
export function IsUserLocation(options?: ValidationOptions) {
    return Validator(user.LocationValidator(), options)
}
export function IsUserUrl(options?: ValidationOptions) {
    return Validator(user.UrlValidator(), options)
}

export function IsReadStateId(options?: ValidationOptions) {
    return Validator(RreadStateIdValidator(), options)
}

export function IsFileId(options?: ValidationOptions) {
    return Validator(FileIdValidator(), options)
}
export function IsFileType(options?: ValidationOptions) {
    return Validator(media.TypeValidator(), options)
}

export function IsApplicationId(options?: ValidationOptions) {
    return Validator(ApplicationIdValidator(), options)
}
export function IsApplicationName(options?: ValidationOptions) {
    return Validator(application.NameValidator(), options)
}
export function IsApplicationDescription(options?: ValidationOptions) {
    return Validator(application.DescriptionValidator(), options)
}

export function IsApplicationTokenId(options?: ValidationOptions) {
    return Validator(ApplicationTokenIdValidator(), options)
}

export function IsInviteId(options?: ValidationOptions) {
    return Validator(InviteIdValidator(), options)
}
export function IsInviteVerifier(options?: ValidationOptions) {
    return Validator(invite.VerifierValidator(), options)
}

// Primitive
export function IsSessionId(options?: ValidationOptions) {
    return Validator(SessionIdValidator(), options)
}
export function IsToken(options?: ValidationOptions) {
    return Validator(SessionIdValidator(), options)
}
export function IsIpAddress(options?: ValidationOptions) {
    return Validator(IpAddressValidator(), options)
}
export function IsDate(options?: ValidationOptions) {
    return Validator(DateValidator(), options)
}
export function IsAnyInteger(options?: ValidationOptions) {
    return Validator(IntegerValidator(), options)
}
export function IsInteger(integerOptions: IntegerOptions, validationOption?: ValidationOptions) {
    return Validator(IntegerValidator(integerOptions), validationOption)
}
export function IsString(stringOption: StringOptions, validationOption?: ValidationOptions) {
    return Validator(StringValidator(stringOption), validationOption)
}
export function IsAnyString(options?: ValidationOptions) {
    return Validator(StringValidator(), options)
}
export function IsBoolean(options?: ValidationOptions) {
    return Validator(BooleanValidator(), options)
}
export function IsUrl(options?: ValidationOptions) {
    return Validator(UrlValidator(), options)
}
export function IsTrustRank(options?: ValidationOptions) {
    return Validator(TrustRankValidator(), options)
}
