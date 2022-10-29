import {
    ApplicationId,
    ApplicationTokenId,
    ChannelGroupdId,
    ChannelId,
    ChannelReadStateId,
    EntityId,
    FileId,
    MessageId,
    UserId,
} from "../../types"
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

export function readStateId() {
    return new PropertyValidator<ChannelReadStateId>({}, [checkIsEntityId])
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

export function fileId() {
    return new PropertyValidator<FileId>({}, [checkIsEntityId])
}

export function applicationId() {
    return new PropertyValidator<ApplicationId>({}, [checkIsEntityId])
}

export function applicationTokenId() {
    return new PropertyValidator<ApplicationTokenId>({}, [checkIsEntityId])
}
