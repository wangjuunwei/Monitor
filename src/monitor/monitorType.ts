import {
    CustromonfoData,
    LoadpageData,
    JsErrorInfoData,
    HttpLogInfoData,
    ResourceLoadInfoData,
    ExtendBehaviorInfoData
} from "../../typing/monitorType";

/**
 * @description 用户访问行为日志(PV)
 * @value uploadType-上传日志类型（CUSTOMER_INFO）
 * @value projectVersion-版本号，用来区分监控应用的版本，更有利于排查问题
 * @value pageKey-用于区分页面，所对应唯一的标识，每个新页面对应一个值
 */
export class Custrominfo extends CustromonfoData {


    constructor(uploadType: string, loadType: string, number: number, newStatus: string) {

        super();

        const device = this.utils.getDevice()

        //上传日志类型（CUSTOMER_INFO）
        this.uploadType = uploadType;
        // 用于区分页面，所对应唯一的标识，每个新页面对应一个值
        this.pageKey = this.utils.getPageKey();
        // 设备名称
        this.deviceName = device.deviceName;
        // 操作系统
        this.os = device.os + (device.osVersion ? " " + device.osVersion : "");

        this.browserName = device.browserName;

        this.browserVersion = device.browserVersion;
        // TODO 位置信息, 待处理
        // this.monitorIp = "";  // 用户的IP地址
        // this.country = "china";  // 用户所在国家
        // this.province = "";  // 用户所在省份
        // this.city = "";  // 用户所在城市
        // 用以区分首次加载
        this.loadType = loadType;
        // 加载时间
        // this.loadTime = loadTime;
        this.newStatus = newStatus; // 是否为新用户
    }
}


/**
 * @description 用户加载页面的信息日志
 * @value uploadType 上传日志类型（LOADPAGE_INFO）
 * @value loadType 页面加载类型， 区分第一次load还是reload
 * @value loadPage 页面加载完成的时间
 * @value domReady 解析 DOM 树结构的时间
 * @value redirect 重定向的时间
 * @value lookupDomain DNS 查询时间
 * @value ttfb 读取页面第一个字节的时间
 * @value request 内容加载完成的时间
 * @value loadEvent 执行 onload 回调函数的时间
 * @value appcache DNS 缓存时间
 * @value unloadEvent 卸载页面的时间
 * @value connect TCP 建立连接完成握手的时间
 */
export class Loadpage extends LoadpageData {
    constructor(uploadType: string, loadType?: string, loadPage?: number, domReady?: number, redirect?: number, lookupDomain?: number, ttfb?: number, request?: number, loadEvent?: number, appcache?: number, unloadEvent?: number, connect?: number) {
        super();
        this.uploadType = uploadType;
        this.loadType = loadType;
        this.loadPage = loadPage;
        this.domReady = domReady;
        this.redirect = redirect;
        this.lookupDomain = lookupDomain;
        this.ttfb = ttfb;
        this.request = request;
        this.loadEvent = loadEvent;
        this.appcache = appcache;
        this.unloadEvent = unloadEvent;
        this.connect = connect;
    }
}


/**
 * @description JS错误日志，继承于日志基类MonitorBaseInfo
 * @value uploadType 上传日志类型（JSERROR_INFO）
 * @value infoType 错误类型 console.error和on_error(console.error用于统计console的错误，on_error用与统计js的错)
 * @value pageKey 用于区分页面，所对应唯一的标识，每个新页面对应一个值
 * @vlaue deviceName 设备名称
 * @value os 操作系统
 * @value browserName 浏览器名称
 * @value browserVersion 浏览器版本
 * @value errorMessage 错误信息
 * @value errorStack 错误行数
 */
export class JavaScriptErrorInfo extends JsErrorInfoData {
    constructor(uploadType, infoType, errorMsg, errorStack) {
        super();
        const device = this.utils.getDevice()
        this.uploadType = uploadType;
        this.infoType = infoType;
        this.pageKey = this.utils.getPageKey();  // 用于区分页面，所对应唯一的标识，每个新页面对应一个值
        this.deviceName = device.deviceName;
        this.os = device.os + (device.osVersion ? " " + device.osVersion : "");
        this.browserName = device.browserName;
        this.browserVersion = device.browserVersion;
        // TODO 位置信息, 待处理
        // this.monitorIp = "";  // 用户的IP地址
        // this.country = "china";  // 用户所在国家
        // this.province = "";  // 用户所在省份
        // this.city = "";  // 用户所在城市
        this.errorMessage = this.utils.b64EncodeUnicode(errorMsg)
        this.errorStack = this.utils.b64EncodeUnicode(errorStack);
        // this.browserInfo = "";
    }

}

/**
 * @description 接口请求日志，继承于日志基类MonitorBaseInfo
 * @value uploadType 上传日志类型（HTTPLOG_INFO）
 * @value simpleUrl 访问地址
 * @value httpUrl 请求地址
 * @value status 接口状态
 * @value statusText 状态描述
 * @value statusResult 区分发起和返回状态
 * @value requestText 请求参数的JSON字符串
 * @value responseText 返回的结果JSON字符串
 * @value createTime 客户端发送时间
 * @vlaue loadTime 接口请求耗时
 */
export class HttpLogInfo extends HttpLogInfoData {
    constructor(uploadType, simpleUrl, url, status, statusText, statusResult, responseText, currentTime, loadTime) {
        super()
        this.uploadType = uploadType;
        this.simpleUrl = simpleUrl;
        this.httpUrl = this.utils.b64EncodeUnicode(encodeURIComponent(url));
        this.status = status;
        this.statusText = statusText;
        this.statusResult = statusResult;
        this.requestText = "";
        this.responseText = this.utils.b64EncodeUnicode(responseText);
        this.createTime = currentTime;
        this.loadTime = loadTime;
    }

}


/**
 * @summary 页面静态资源加载错误统计，继承于日志基类MonitorBaseInfo
 * @value uploadType 上传日志类型（RESLOAD_INFO）
 * @value elementType 资源类型
 * @value sourceUrl 请求地址
 * @value status  资源加载状态： 0/失败、1/成功
 */

export class ResourceLoadInfo extends ResourceLoadInfoData {
    constructor(uploadType, url, elementType, status) {
        super()
        this.uploadType = uploadType;
        this.elementType = elementType;
        this.sourceUrl = this.utils.b64EncodeUnicode(encodeURIComponent(url));
        this.status = status;
    }
}

/**
 * @summary 外部扩展日志，继承于日志基类MonitorBaseInfo
 * @value uploadType 上传日志类型（RESOURCELOAD_Info）
 * @value extendInfo 上传内容
 * @value createTime 日志发生时间
 */
export class ExtendBehaviorInfo extends ExtendBehaviorInfoData {
    constructor(uploadType, data) {
        super();
        this.uploadType = uploadType;
        this.extendInfo = data ? data : null
        this.createTime = new Date().getTime(); // 日志发生时间
    }

}
