import {CommonPropertyData} from "../../typing/common";
import {ConstValue} from '../../typing/utils'

/**
 * @value createTime-日志发生时间
 * @value monitorId-用于区分应用的唯一标识（一个项目对应一个）
 * @value monitorPage- 用于区分页面
 * @value simpleUrl-页面的url
 * @value completeUrl-页面完整的url
 * @value customerKey-用于区分用户，所对应唯一的标识，清理本地数据后失效，
 * @value versionCode-用于统计APP版本，
 */
export class CommonProperty extends CommonPropertyData {

    constructor() {
        super()

        // 日志发生时间
        this.createTime = new Date().getTime()

        // 用于区分应用的唯一标识（一个项目对应一个）
        this.monitorId = sessionStorage.getItem(ConstValue.WEB_MONITOR_PAGE_ID) || null

        //用于区分页面
        this.monitorPage = sessionStorage.getItem(ConstValue.CUSTOMER_WEB_MONITOR_PAGE_ID) || null

        // 页面的url
        this.simpleUrl = window.location.href.split('?')[0].replace('#', '')

        // 页面完整的url
        this.completeUrl = this.utils.b64EncodeUnicode(encodeURIComponent(window.location.href))

        // 用于区分用户，所对应唯一的标识，清理本地数据后失效，
        this.customerKey = this.utils.getCustomerKey()

        //用于统计APP版本
        this.versionCode = this.utils.getUrlParam("versioncode") || null

        // 版本号，用来区分监控应用的版本，更有利于排查问题
        this.projectVersion = ConstValue.projectVersion;
    }
}
