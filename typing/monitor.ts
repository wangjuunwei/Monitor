import {MonitorBaseInfo} from "monitor/base";

export abstract class MonitorData extends MonitorBaseInfo {

    //polyFile 如果不支持 window.CustomEvent
    public abstract checkWindowPoly(): void

    /**
     * @description 用户访问记录监控
     */
    public abstract checkUrlChange(): void

    /**
     * @description 用户访问记录监控
     */
    public abstract recordCI(): void

    /**
     * @description 用户加载页面信息监控
     */
    public abstract recordLoadPage(): void

    /**
     * @description 页面JS错误监控
     */
    public abstract recordJavaScriptError(): void

    /**
     * @description 页面接口请求监控
     */
    public abstract recordHttpLog(): void

    /**
     * @description 监控页面静态资源加载报错
     */
    public abstract recordResourceError(): void

}
