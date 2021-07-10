import {MonitorUtilsData} from '../typing/utils'



export abstract class MonitorBaseInfoData {

    utils: MonitorUtilsData

    public abstract handleLogInfo(type, logInfo): void
}
