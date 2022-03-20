import { ChannelGroupdId, ChannelId, EntityId, UserId } from "../../types"
import { CommonErrorMessages, ValidationError } from "../ValidationError"

import { Validator } from "../Validator"
import { isNumber } from "../functions"

export function checkIsEntityId(value: EntityId, options: {}): void {
    // if (isString(value)) {
    //     return
    // }
    if (isNumber(value)) {
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
