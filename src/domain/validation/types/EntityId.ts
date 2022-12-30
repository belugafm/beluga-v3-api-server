import {
    ApplicationId,
    ApplicationTokenId,
    ChannelGroupdId,
    ChannelId,
    ChannelReadStateId,
    EntityId,
    FileId,
    InviteId,
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

export function EntityIdValidator() {
    return new PropertyValidator<EntityId>({}, [checkIsEntityId])
}

export function ChannelIdValidator() {
    return new PropertyValidator<ChannelId>({}, [checkIsEntityId])
}

export function RreadStateIdValidator() {
    return new PropertyValidator<ChannelReadStateId>({}, [checkIsEntityId])
}

export function ChannelGroupIdValidator() {
    return new PropertyValidator<ChannelGroupdId>({}, [checkIsEntityId])
}

export function UserIdValidator() {
    return new PropertyValidator<UserId>({}, [checkIsEntityId])
}

export function MessageIdValidator() {
    return new PropertyValidator<MessageId>({}, [checkIsEntityId])
}

export function FileIdValidator() {
    return new PropertyValidator<FileId>({}, [checkIsEntityId])
}

export function ApplicationIdValidator() {
    return new PropertyValidator<ApplicationId>({}, [checkIsEntityId])
}

export function ApplicationTokenIdValidator() {
    return new PropertyValidator<ApplicationTokenId>({}, [checkIsEntityId])
}

export function InviteIdValidator() {
    return new PropertyValidator<InviteId>({}, [checkIsEntityId])
}
