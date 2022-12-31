import { IsDate, IsInviteId, IsInviteVerifier, IsUserDisplayName } from "../validation/decorators"
import { InviteJsonObjectT, UserId } from "../types"

import { Entity } from "./Entity"
import { v4 } from "uuid"

export const ErrorCodes = {
    InvalidId: "invalid_id",
    InvalidInviterId: "invalid_inviter_id",
    InvalidcreatedAt: "invalid_created_at",
    InvalidExpireDate: "invalid_expire_date",
    InvalidVerifiere: "invalid_verifier",
    InvalidTargetUserId: "invalid_target_user_id",
} as const

export class InviteEntity extends Entity {
    // 一意なid DBの実装に依存する
    // 変更不可
    @IsInviteId({ errorCode: ErrorCodes.InvalidId })
    id: UserId

    // この招待リンクを発行したユーザー
    @IsUserDisplayName({ errorCode: ErrorCodes.InvalidInviterId })
    inviterId: UserId

    @IsDate({ errorCode: ErrorCodes.InvalidcreatedAt })
    createdAt: Date

    @IsDate({ errorCode: ErrorCodes.InvalidExpireDate })
    expireDate: Date

    // 招待リンクのURLに使う
    @IsInviteVerifier({ errorCode: ErrorCodes.InvalidVerifiere })
    verifier: string

    // 招待リンク経由で登録したユーザー
    @IsUserDisplayName({ nullable: true, errorCode: ErrorCodes.InvalidTargetUserId })
    targetUserId: UserId | null

    constructor(
        params: {
            id: InviteEntity["id"]
            inviterId: InviteEntity["inviterId"]
            createdAt: InviteEntity["createdAt"]
            expireDate: InviteEntity["expireDate"]
        } & Partial<InviteEntity>
    ) {
        super()
        this.id = params.id
        this.inviterId = params.inviterId
        this.createdAt = params.createdAt
        this.expireDate = params.expireDate
        this.verifier = params.verifier != null ? params.verifier : v4()
        this.targetUserId = params.targetUserId != null ? params.targetUserId : null
    }
    toJsonObject(): InviteJsonObjectT {
        return {
            id: this.id,
            inviter_id: this.inviterId,
            created_at: this.createdAt,
            expire_date: this.expireDate,
            verifier: this.verifier,
            target_user_id: this.targetUserId,
            is_valid: this.isValid(),
        }
    }
    isValid(): boolean {
        if (this.expireDate.getTime() < Date.now()) {
            return false
        }
        return this.targetUserId === null
    }
}
