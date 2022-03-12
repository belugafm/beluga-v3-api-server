import { IIPGeolocationQueryRepository } from "../../domain/repository/query/IPGeolocation"
import { IPGeolocationEntity } from "../../domain/entity/IPGeolocation"
// import config from "./config"
// import got from "got"

export class IPGeolocationQueryRepository implements IIPGeolocationQueryRepository {
    async lookup(ipAddress: string): Promise<IPGeolocationEntity | null> {
        // if (config.enabled == false) {
        //     return null
        // }

        // const url = `https://www.ipqualityscore.com/api/json/ip/${config.api_secret}/${ipAddress}?strictness=1&allow_public_access_points=true&fast=true&lighter_penalties=true`
        // try {
        //     const result = await got.get(url)
        //     console.log(result)
        // } catch (error) {}
        return null
    }
}
