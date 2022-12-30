import { InviteEntity } from "../../entity/Invite"
import { InviteId, UserId } from "../../types"

export const SortBy = {
    CreatedAt: "CreatedAt",
} as const

export const SortOrder = {
    Ascending: "Ascending",
    Descending: "Descending",
} as const

export interface IInviteQueryRepository {
    findById(inviteId: InviteId): Promise<InviteEntity | null>
    findByInviterId(
        inviterId: UserId,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ): Promise<InviteEntity[]>
    findByVerifier(verifier: string): Promise<InviteEntity | null>
    findByTargetUserId(targetUserId: UserId): Promise<InviteEntity | null>
}
