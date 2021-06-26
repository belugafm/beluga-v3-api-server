import { IUsersRepository, SortBy, SortOrder } from "../../../domain/repository/Users"
import { UserEntity } from "../../../domain/entity/User"
import * as mongo from "../mongoose"
import { UserModel, schemaVersion } from "../schema/user"

export class UsersRepository implements IUsersRepository {
    async add(user: UserEntity) {
        const result = await UserModel.create({
            name: user.name,
            twitterUserId: user.twitterUserId,
            displayName: user.displayName,
            profileImageUrl: user.profileImageUrl,
            location: user.location,
            url: user.url,
            description: user.description,
            themeColor: user.themeColor,
            backgroundImageUrl: user.backgroundImageUrl,
            defaultProfile: user.defaultProfile,
            statusCount: user.statusCount,
            favoritesCount: user.favoritesCount,
            favoritedCount: user.favoritedCount,
            likesCount: user.likesCount,
            likedCount: user.likedCount,
            channelsCount: user.channelsCount,
            followingChannelsCount: user.followingChannelsCount,
            createdAt: user.createdAt,
            active: user.active,
            dormant: user.dormant,
            suspended: user.suspended,
            trustLevel: user.trustLevel,
            lastActivityDate: user.lastActivityDate,
            termsOfServiceAgreementDate: user.termsOfServiceAgreementDate,
            termsOfServiceAgreementVersion: user.termsOfServiceAgreementVersion,
            schemaVersion,
        })
        return result._id.toHexString()
    }
    async updateProfile(user: UserEntity) {
        return true
    }
    async findById(userId: string) {
        const result = await UserModel.findOne({ _id: mongo.toObjectId(userId) })
            .collation({
                locale: "en_US",
                strength: 2,
            })
            .exec()
        if (result == null) {
            return null
        }
        return result.toModel()
    }
    async findByName(name: string) {
        const result = await mongo.findOne(
            UserModel,
            { name },
            {
                // case-insensitive
                additionalQueryFunc: (query) => {
                    return query.collation({
                        locale: "en_US",
                        strength: 2,
                    })
                },
            }
        )
        if (result == null) {
            return null
        }
        return result.toModel()
    }
    async findByIpAddress(
        ipAddress: string,
        sortBy: typeof SortBy[keyof typeof SortBy],
        sortOrder: typeof SortOrder[keyof typeof SortOrder]
    ) {
        return []
    }
}
