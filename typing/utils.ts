export enum ConstValue {

    // 应用的主域名, 用于主域名下共享customerKey
    MAIN_DOMAIN = '&&&.com&&&',
    // 用户访问日志类
    CUSTOMER_INFO = 'CUSTOMER_INFO',
    // 用户加载页面信息类型
    LOADPAGE_INFO = 'LOADPAGE_INFO',
    // 接口日志类型
    HTTPLOG_INFO = 'HTTPLOG_INFO',
    // 接口错误日志类型
    HTTP_ERROR = 'HTTP_ERROR',
    // js报错日志类型
    JSERROR_INFO = 'JSERROR_INFO',
    // 用户的行为类型
    BEHAVIO_INFO = 'BEHAVIO_INFO',
    // 静态资源类型
    RESOURCELOAD_Info = 'RESLOAD_INFO',
    // 用户自定义行为类型
    CUSTOMIZE_BEHAVIOR = 'CUSTOMIZE_BEHAVIOR',
    //扩展日志
    EXTEND_INFO = 'EXTEND_INFO',
    //监控版本
    projectVersion = 'v1.2.0',
    // 所属项目ID标识
    WEB_MONITOR_PAGE_ID = "CUSTOMER_WEB_MONITOR_ID",
    //所属页面标示
    CUSTOMER_WEB_MONITOR_PAGE_ID = "CUSTOMER_WEB_MONITOR_PAGE_ID",

    HTTP_UPLOAD_LOG_API = 'monitor/log',

    WEB_MONITOR_IP = "http://test.com"
}


export abstract class MonitorUtilsData {

    /**
     * @description 生成唯一的UUID
     */
    public abstract getUuid(): string

    /**
     * @description 获取cookie
     */
    public abstract getCookie(name: string): string

    /**
     * @description 获取页面的唯一标识
     */
    public abstract getPageKey(): string

    /**
     * @description 设置页面的唯一标识
     */
    public abstract setPageKey(): void

    /**
     * @description 重写页面的onload事件
     */

    // public abstract addLoadEvent(func: Function): void

    /**
     * @description  封装简易的ajax请求, 只用于上传日志
     * @param method  请求类型(大写)  GET/POST
     * @param url     请求URL
     * @param param   请求参数
     * @param successCallback  成功回调方法
     * @param failCallback   失败回调方法
     */
    public abstract ajax(method: string, url: string, param: { [key: string]: unknown }, successCallback: Function, failCallback: Function): void

    /**
     * @description 深拷贝方法. 注意: 如果对象里边包含function, 则对function的拷贝依然是浅拷贝
     * @param obj
     */
    public abstract encryptObj(obj: any): any


    /**
     * @description 加载js
     * @param url
     * @param callback
     */
    public abstract loadJs(url: string, callback: any): any

    /**
     * @description 编码
     * @param str
     */
    public abstract b64EncodeUnicode(str: string): string

    /**
     * @description 获取用户的key
     */
    public abstract getCustomerKey(): string

    /**
     * 判断是否是Android
     */
    public abstract isAndroid(): Boolean

    /**
     * @description 判断是否是IOS
     */
    public abstract isIOS(): Boolean

    /**
     * @description 判断是不是微信
     */
    public abstract isWX(): Boolean

    /**
     * @description 获取页面Url
     */
    public abstract getPageUrl(): String

    /**
     * @description 获取url params
     * @param key
     */

    public abstract getUrlParam(key: string): string

    /**
     * @description 获取设备信息
     */
    public abstract getDevice(): { [key: string]: unknown }

    /**
     * @description 错误筛选
     * @param checkList
     * @param pa
     */

    public abstract errorFilter(checkList: RegExp[], pa: string): unknown

    /**
     * @description 上报
     * @param conf
     */
    public abstract reportAjax(conf: { [key: string]: any })

    /**
     * @description 错误过滤数组
     * @param initList
     * @param addList
     */
    public abstract editIgErList(initList: RegExp[], addList: RegExp[]): RegExp[]

    /**
     * @description 获取初始数据
     * @param monitObj
     */
    public abstract getInitObj(monitObj: { [key: string]: any })
}
