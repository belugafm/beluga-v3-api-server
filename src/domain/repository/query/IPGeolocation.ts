import { IPGeolocationEntity } from "../../entity/IPGeolocation"

export interface IIPGeolocationQueryRepository {
    lookup(ipAddress: string): Promise<IPGeolocationEntity | null>
}
