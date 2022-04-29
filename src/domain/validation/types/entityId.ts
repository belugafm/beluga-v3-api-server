import { ChannelGroupdId, ChannelId, EntityId, MessageId, UserId } from "../../types"
import { CommonErrorMessages, ValidationError } from "../error"

import { PropertyValidator } from "../PropertyValidator"
import { isInteger } from "../functions"

export function checkIsEntityId(value: EntityId, options: {}): void {
    // if (isString(value)) {
    //     return
    // }
    if (isInteger(value)) {
        return
    }
    throw new ValidationError(CommonErrorMessages.InvalidType)
}

export function entityId() {
    return new PropertyValidator<EntityId>({}, [checkIsEntityId])
}

export function channelId() {
    return new PropertyValidator<ChannelId>({}, [checkIsEntityId])
}

export function channelGroupId() {
    return new PropertyValidator<ChannelGroupdId>({}, [checkIsEntityId])
}

export function userId() {
    return new PropertyValidator<UserId>({}, [checkIsEntityId])
}

export function messageId() {
    return new PropertyValidator<MessageId>({}, [checkIsEntityId])
}
