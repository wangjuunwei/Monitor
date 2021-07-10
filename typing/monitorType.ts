import {CommonProperty} from "monitor/common";


export abstract class CustromonfoData extends CommonProperty {
    uploadType: string;
    pageKey: string;
    deviceName: unknown;
    os: string;
    browserName: unknown;
    browserVersion: unknown;
    loadType: string;
    newStatus: string;

    constructor() {
        super();
    }
}

export abstract class LoadpageData extends CommonProperty {
    uploadType: string;
    loadType: string;
    loadPage: number;
    domReady: number;
    redirect: number;
    lookupDomain: number;
    ttfb: number;
    request: number;
    loadEvent: number;
    appcache: number;
    unloadEvent: number;
    connect: number;
    domRender:number

    constructor() {
        super();
    }
}

export abstract class JsErrorInfoData extends CommonProperty {
    uploadType: string;
    infoType: string;
    pageKey: string    // 用于区分页面，所对应唯一的标识，每个新页面对应一个值
    deviceName: unknown
    os: string
    browserName: unknown
    browserVersion: unknown
    errorMessage: string
    errorStack: string
}

export abstract class HttpLogInfoData extends CommonProperty {
    uploadType: string;
    simpleUrl: string;
    httpUrl: string;
    status: string;
    statusText: string;
    statusResult: string;
    requestText: string;
    responseText: string;
    createTime: number;
    loadTime: string;
}

export abstract class ResourceLoadInfoData extends CommonProperty {
    uploadType: string;
    elementType: string;
    sourceUrl: string;
    status: string;
}

export abstract class ExtendBehaviorInfoData extends CommonProperty {
    uploadType: string;
    extendInfo: any
    createTime: number  // 日志发生时间
}

