import {MonitorBaseInfoData} from '../../typing/base'
import {MonitorUtils} from "utils";
import {ConstValue} from "../../typing/utils";

export class MonitorBaseInfo extends MonitorBaseInfoData {

    constructor() {
        super();

        this.utils = new MonitorUtils()
    }

    handleLogInfo(type, logInfo) {
        var tempString = localStorage[type] ? localStorage[type] : ''
        switch (type) {
            case ConstValue.BEHAVIO_INFO:
                localStorage[ConstValue.BEHAVIO_INFO] = tempString + JSON.stringify(logInfo) + '$$$'
                break
            case ConstValue.JSERROR_INFO:
                localStorage[ConstValue.JSERROR_INFO] = tempString + JSON.stringify(logInfo) + '$$$'
                break
            case ConstValue.HTTPLOG_INFO:
                localStorage[ConstValue.HTTPLOG_INFO] = tempString + JSON.stringify(logInfo) + '$$$'
                break
            case ConstValue.CUSTOMER_INFO:
                localStorage[ConstValue.CUSTOMER_INFO] = tempString + JSON.stringify(logInfo) + '$$$'
                break
            case ConstValue.LOADPAGE_INFO:
                localStorage[ConstValue.LOADPAGE_INFO] = tempString + JSON.stringify(logInfo) + '$$$'
                break
            case ConstValue.RESOURCELOAD_Info:
                localStorage[ConstValue.RESOURCELOAD_Info] = tempString + JSON.stringify(logInfo) + '$$$'
                break
            case ConstValue.CUSTOMIZE_BEHAVIOR:
                localStorage[ConstValue.CUSTOMIZE_BEHAVIOR] = tempString + JSON.stringify(logInfo) + '$$$'
                break
            // case VIDEOS_EVENT:
            //     localStorage[VIDEOS_EVENT] =
            //         tempString + JSON.stringify(logInfo) + '$$$'
            //     break

            // case SCREEN_SHOT:
            //     localStorage[SCREEN_SHOT] = tempString + JSON.stringify(logInfo) + '$$$'
            //     break
            default:
                break
        }
    }
}
