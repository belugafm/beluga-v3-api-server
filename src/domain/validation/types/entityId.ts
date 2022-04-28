import { ChannelGroupdId, ChannelId, EntityId, MessageId, UserId } from "../../types"
import { CommonErrorMessages, ValidationError } from "../error"

import { Validator } from "../Validator"
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
    return new Validator<EntityId>({}, [checkIsEntityId])
}

export function channelId() {
    return new Validator<ChannelId>({}, [checkIsEntityId])
}

export function channelGroupId() {
    return new Validator<ChannelGroupdId>({}, [checkIsEntityId])
}

export function userId() {
    return new Validator<UserId>({}, [checkIsEntityId])
}

export function messageId() {
    return new Validator<MessageId>({}, [checkIsEntityId])
}
