import { PrismaClient, Invite } from "@prisma/client"

import { prisma } from "../client"
import { IInviteQueryRepository, SortBy, SortOrder } from "../../../../domain/repository/query/Invite"
import { InviteEntity } from "../../../../domain/entity/Invite"
import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"

function toEntity(invite: Invite) {
    return new InviteEntity({
        id: invite.id,
        inviterId: invite.inviterId,
        createdAt: invite.createdAt,
        expireDate: invite.expireDate,
        verifier: invite.verifier,
        targetUserId: invite.targetUserId,
    })
}
export class InviteQueryRepository implements IInviteQueryRepository {
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async findById(inviteId: number): Promise<InviteEntity | null> {
        try {
            const invite = await this._prisma.invite.findUnique({
                where: {
                    id: inviteId,
                },
            })
            if (invite == null) {
                return null
            }
            return toEntity(invite)
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack, "UserQueryRepository::findById")
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async findByTargetUserId(targetUserId: number): Promise<InviteEntity | null> {
        try {
            const invite = await this._prisma.invite.findUnique({
                where: {
                    targetUserId,
                },
            })
            if (invite == null) {
                return null
            }
            return toEntity(invite)
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack, "UserQueryRepository::findByTargetUserId")
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async findByVerifier(verifier: string): Promise<InviteEntity | null> {
        try {
            const invite = await this._prisma.invite.findUnique({
                where: {
                    verifier,
                },
            })
            if (invite == null) {
                return null
            }
            return toEntity(invite)
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack, "UserQueryRepository::findByVerifier")
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async findByInviterId(
        inviterId: number,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ): Promise<InviteEntity[]> {
        try {
            const inviteList = await this._prisma.invite.findMany({
                where: {
                    inviterId,
                },
            })
            return inviteList.map((invite) => toEntity(invite))
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack, "InviteQueryRepository::findByInviterId")
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
}
