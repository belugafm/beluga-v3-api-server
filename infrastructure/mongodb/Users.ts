import {
    IUsersRepository,
    SortBy,
    SortOrder,
} from "../../domain/repository/Users"
import { UserModel } from "../../domain/model/User"

export class UsersRepository implements IUsersRepository {
    add(user: UserModel): UserID {
        return 0
    }
    updateProfile(user: UserModel): boolean {
        return true
    }
    delete(user: UserModel): boolean {
        return true
    }
    findById(userId: UserID): UserModel | null {
        return null
    }
    findByName(name: string): UserModel | null {
        return null
    }
    findByIpAddress(
        ipAddress: string,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ): UserModel[] {
        return []
    }
}
