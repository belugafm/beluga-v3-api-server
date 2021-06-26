import { SortBy, SortOrder, IUsersRepository } from "../repository/Users"
import config from "../../config/app"
import { DomainError } from "../DomainError"

export const ErrorCodes = {
    TooManyRequests: "too_many_requests",
} as const

export class CheckRegistrationRateLimitService {
    private usersRepository: IUsersRepository
    constructor(usersRepository: IUsersRepository) {
        this.usersRepository = usersRepository
    }
    isRateLimited(ipAddress: string): boolean {
        const existingUsers = this.usersRepository.findByIpAddress(
            ipAddress,
            SortBy.CreatedAt,
            SortOrder.Descending
        )
        if (existingUsers.length == 0) {
            return false
        }
        const user = existingUsers[0]
        const current = new Date()
        const seconds = (current.getTime() - user.createdAt.getTime()) / 1000
        if (seconds < config.user_registration.limit) {
            return true
        }
        return false
    }
    tryCheckIfRateIsLimited(ipAddress: string): void {
        if (this.isRateLimited(ipAddress)) {
            throw new DomainError(ErrorCodes.TooManyRequests)
        }
    }
}
