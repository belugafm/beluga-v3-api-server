import { PrismaClient } from "@prisma/client"

import { prisma } from "../client"
import { IInviteCommandRepository } from "../../../../domain/repository/command/Invite"
import { InviteEntity } from "../../../../domain/entity/Invite"
import { RepositoryError, UnknownRepositoryError } from "../../../../domain/repository/RepositoryError"

export class InviteCommandRepository implements IInviteCommandRepository {
    private _prisma: PrismaClient
    constructor(transaction?: PrismaClient) {
        if (transaction) {
            this._prisma = transaction
        } else {
            this._prisma = prisma
        }
    }
    async add(invite: InviteEntity): Promise<number> {
        if (invite instanceof InviteEntity !== true) {
            throw new RepositoryError("`like` must be an instance of InviteEntity")
        }
        try {
            const result = await this._prisma.invite.create({
                data: {
                    inviterId: invite.inviterId,
                    createdAt: invite.createdAt,
                    verifier: invite.verifier,
                    expireDate: invite.expireDate,
                    targetUserId: invite.targetUserId,
                },
            })
            return result.id
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async delete(invite: InviteEntity): Promise<boolean> {
        if (invite instanceof InviteEntity !== true) {
            throw new RepositoryError("`invite` must be an instance of InviteEntity")
        }
        try {
            await this._prisma.invite.delete({
                where: {
                    id: invite.id,
                },
            })
            return true
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack)
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
    async update(invite: InviteEntity): Promise<boolean> {
        if (invite instanceof InviteEntity !== true) {
            throw new RepositoryError("`invite` must be an instance of InviteEntity")
        }
        try {
            await this._prisma.invite.update({
                where: {
                    id: invite.id,
                },
                data: {
                    inviterId: invite.inviterId,
                    createdAt: invite.createdAt,
                    expireDate: invite.expireDate,
                    verifier: invite.verifier,
                    targetUserId: invite.targetUserId,
                },
            })
            return false
        } catch (error) {
            if (error instanceof Error) {
                throw new RepositoryError(error.message, error.stack, "InviteCommandRepository::update")
            } else {
                throw new UnknownRepositoryError()
            }
        }
    }
}
