import { IPGeolocationEntity } from "../domain/entity/IPGeolocation"

export interface IIPGeolocationApplication {
    lookup(ipAddress: string): Promise<IPGeolocationEntity | null>
}
