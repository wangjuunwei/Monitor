import {MonitorData} from "../typing/monitor";
import {Custrominfo, HttpLogInfo, JavaScriptErrorInfo, Loadpage, ResourceLoadInfo} from "monitor/monitorType";
import {ConstValue} from '../typing/utils'

let defaultLocation = window.location.href.split('?')[0].replace('#', '')
const timingObj = performance && performance.timing
const WEB_LOCATION = window.location.href
//初始化错误数组
const initErrorList = [/Script error\.?$/, /getWebViewInfo/, /getNetworkType/, /webviewInView/, /WebViewJavascriptBridge/, /TypeError: undefined is not a function/, /WebViewJavascriptBridge is not defined/, /UncaughtInPromiseError: Network Error?$/, /scrollTopSettedCallBack?$/]


let PV_MSG = '', JSERROR_MSG = '', HTTP_MSG = '', RESOURCE_MSG = '', BEHAVIOR_MSG = '', PAGELOAD_MSG = ''
    // INITUSER_MSG = ''
// let jsMonitorStarted = false


const resourcesObj: { [key: string]: any } = (function () {
    if (performance && typeof performance.getEntries === 'function') {
        return performance.getEntries()
    }
    return null
})()

class Monitor extends MonitorData {
    private igErrorList: RegExp[];

    constructor(monitorObj) {
        super();
        this.igErrorList = this.utils.editIgErList(initErrorList, this.utils.getInitObj(monitorObj).igErrorList)
        this.checkWindowPoly()
        this.bindWindowAttr()
        this.init()
    }

    init() {
        let _this = this
        try {
            //启动监控
            this.recordCI();
            PV_MSG = "启动...";
            this.recordLoadPage();
            PAGELOAD_MSG = "启动...";
            this.recordJavaScriptError();
            JSERROR_MSG = "启动...";
            // this.recordBehavior();
            // BEHAVIOR_MSG = "启动...";
            this.recordHttpLog();
            HTTP_MSG = "启动...";
            this.recordResourceError();
            RESOURCE_MSG = "启动...";
            /**
             * 添加一个定时器，进行数据的上传
             * 200毫秒钟进行一次URL是否变化的检测
             * 8秒钟进行一次数据的检查并上传; PS: 这个时间有可能跟后台服务的并发量有着直接，谨慎设置
             */
            var timeCount = 0;
            // var waitTimes = 0;
            // var typeList = [BEHAVIO_INFO, JSERROR_INFO, HTTPLOG_INFO, SCREEN_SHOT, CUSTOMER_INFO, LOADPAGE_INFO, RESOURCELOAD_Info, CUSTOMIZE_BEHAVIOR, VIDEOS_EVENT]
            var typeList = [ConstValue.BEHAVIO_INFO, ConstValue.JSERROR_INFO, ConstValue.HTTPLOG_INFO, ConstValue.CUSTOMER_INFO, ConstValue.LOADPAGE_INFO, ConstValue.RESOURCELOAD_Info, ConstValue.CUSTOMIZE_BEHAVIOR]
            setInterval(function () {
                _this.checkUrlChange();
                // 进行一次上传
                if (timeCount >= 40) {
                    // 如果是本地的localhost, 就忽略，不进行上传
                    // if (window.location.href.indexOf("localhost") != -1) return;
                    var logInfo = "";
                    for (var i = 0; i < typeList.length; i++) {
                        logInfo += (localStorage[typeList[i]] || "");
                    }
                    // 收集到日志的数量如果小于10，则不进行上传，减少后台服务短时间内的并发量。
                    // 如果，经过3次判断还没有收集到10个日志，则进行上传
                    // 风险：有可能会丢失掉用户最后一段时间的操作信息，如果，最后几步操作信息很重要，可以选择删除这段逻辑
                    // var logInfoCount = logInfo.split("$$$").length;
                    // if (logInfoCount < 10 && waitTimes < 2) {
                    //     waitTimes++;
                    //     timeCount = 0;
                    //     return;
                    // }
                    // waitTimes = 0;
                    logInfo.length > 0 && _this.utils.ajax("POST", ConstValue.WEB_MONITOR_IP + ConstValue.HTTP_UPLOAD_LOG_API, {logInfo: logInfo}, function () {
                        for (var i = 0; i < typeList.length; i++) {
                            console.log("'成功了'===", '成功了');
                            localStorage[typeList[i]] = "";
                        }
                    }, function () { // 如果失败了， 也需要清理掉本地缓存， 否则会积累太多
                        for (var i = 0; i < typeList.length; i++) {
                            console.log("'失败了'===", '失败了');
                            localStorage[typeList[i]] = "";
                        }
                    })
                    timeCount = 0;
                }
                timeCount++;
            }, 200);
        } catch (e) {
            console.error("监控代码异常，捕获", e);
        }
    }

    /**
     * @todo 绑定自定义触发事件
     */
    bindWindowAttr() {
        window['Monitor'] = {
            /**
             * 检查配置信息
             */
            wm_check: function () {
                var errorStatus = "未启动！"
                console.info("================================配置检查===============================");
                console.info("=【项目标示】：" + sessionStorage.getItem(ConstValue.WEB_MONITOR_PAGE_ID) || null,);
                console.info("=【页面标示】：" + sessionStorage.getItem(ConstValue.WEB_MONITOR_PAGE_ID) || null);
                console.info("=【上报接口】：" + ConstValue.WEB_MONITOR_IP + ConstValue.HTTP_UPLOAD_LOG_API);
                console.info("......................................................................");
                console.info("= PVUV监控状态：" + (PV_MSG || errorStatus));
                console.info("= 用户页面性能状态：" + (PAGELOAD_MSG || errorStatus));
                console.info("= JS错误监控状态：" + (JSERROR_MSG || errorStatus));
                console.info("= 接口请求监控状态：" + (HTTP_MSG || errorStatus));
                console.info("= 静态资源监控状态：" + (RESOURCE_MSG || errorStatus));
                console.info("= 用户行为监控状态：" + (BEHAVIOR_MSG || errorStatus));
                // console.info("= 用户信息初始化状态：" + (INITUSER_MSG || "未初始化！部分功能将无法使用，请查看文档(API方法调用)，执行webfunny.wmInitUser方法进行初始化！"));
                console.info("======================================================================");
                return "结束";
            },
            /**
             * 初始化调试工具
             * 【注意：】请勿在生产环境使用！！！
             */
            initDebugTool: function () {
                console.log("= 调试工具即将初始化...");
                // 加载js压缩工具
                let _this = this
                this.utils.loadJs("//cdn.bootcss.com/lz-string/1.4.4/lz-string.js", function () {
                    console.log("= 字符串压缩工具加载成功...");
                    // 加载录屏机制
                    _this.utils.loadJs("//cdn.jsdelivr.net/npm/rrweb@latest/dist/rrweb.min.js", function () {
                        console.log("= 录屏工具加载成功...");
                        console.log("= 调试工具初始化完成。");
                        // 在页面上生成一个连接按钮
                        // var connect = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAS1BMVEUAAAAAjwAAkgEAkgEAkQEAkQIAkQIAkAAAkgAAkwAAjwAAkAIAkgIAkQIAkQAAkgAAkgAAkgIAkQIAkQAAkQAAkQEAkAAAkAAAkQGUpamIAAAAGHRSTlMAgKrA56KNVEYWQKaelHtnHJiISyvfdWoca+CuAAAAvElEQVQ4y4WT6Q6EIAwGWwEFPHfd43v/J93ErHI0lfllMhObFKBb2PK9B9DyTJLg+TtE1XuHA6v4HifCv8xOYdQ9vYGPQY4tgwmCmP3fzjSKYEiBATpyqFjLnchiobqY1BHB4CgeyNlS0AGycMX+zmJOgU/7ByCLni4c8qI/Py42QBYmpGBAVTyrk1rQKFaIggFTjpAFpyBCMFGBLaRhcVc492MgNqz7Xnkf/ynOq+8nDuuyb6R6nZYnbvgfM0koRi82zDIAAAAASUVORK5CYII=";
                        // var disconnect = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAV1BMVEUAAADYHgbYHQbZHgXZHgXaHQbXHQjYHgbYHgbYHwbZHQXYHgXXHwTZGwXVHAXYGgDQLwDYHgbYHgbXHgXZHwbYHgbYHgbYHwfZHwfZHwfXHATbJADYHgbzmcBTAAAAHHRSTlMAqoFdMSgfx/i3imQ5LjcNBe7tknhVuZZrSUAOeayD+AAAAM1JREFUOMuFk1kSgyAQBUEFXIhrzPruf85oSelMGLQ/9KPbpRhQp2TIlETf2uABQeeuBEr3NKu/R9pXILyous3LpRmI5s9bQKsaDM9egKUARyuKRkx3VdigjEkUt80XgJaLzxbM4EX8DzpRuOCTRX5MDVJR7eMBpGLwwbcjxKJRgQqQipp/gBdsDg7nRV8iUTT7OosFGYRcGHvspLigdLgqHv8WgKHBm/tMaR7wnTyuA2wK6ifqq/YQZNK116stXa5iAEzL7WuLok+e8DN+81YzagDKqQwAAAAASUVORK5CYII="
                        // var img = document.createElement('img');
                        // img.id = "debug_connect";
                        // img.src = disconnect;
                        // img.style = "position: fixed; z-index: 9999; bottom: 20px; right: 20px; width: 60px;";
                        // document.body.appendChild(img);
                        // img.onclick = function() {
                        //   webfunny.startDebugMode(function() {
                        //     // 连接后代表开启debug模式，存放在cookie里边。这样共享域名的项目可以共用
                        //     var extraTime = 60 * 30 * 24 * 3600 * 1000 // cookie 30天后过期时间
                        //     var exp = new Date()
                        //     exp.setTime(exp.getTime() + extraTime)
                        //     if (MAIN_DOMAIN) {
                        //       document.cookie = "debugMode=open;Path=/;domain=" + MAIN_DOMAIN + ";expires=" + exp.toGMTString()
                        //     } else {
                        //       document.cookie = "debugMode=open;Path=/;expires=" + exp.toGMTString()
                        //     }
                        //     img.src = connect;
                        //     setTimeout(function() {
                        //       img.remove();
                        //     }, 20 * 1000);
                        //   })
                        // }
                    });
                });
            },
            /**
             * 开启debug模式
             */
            startDebugMode: function (callback) {
                console.log("= 开启debug模式...");
                callback();
                // var stopFn = rrweb.record({
                //   emit: function(event) {
                //     var newEventStr = JSON.stringify(event);
                //     console.log(event, newEventStr.length);
                //     var videosInfo = new VideosInfo(VIDEOS_EVENT, newEventStr);
                //     videosInfo.uploadType = VIDEOS_EVENT;
                //     var logInfo = JSON.stringify(videosInfo);
                //     utils.ajax("POST", "//localhost:8011/server/upLog", {logInfo: logInfo}, function () {});
                //   },
                // });
            },
            /**
             * 埋点上传数据
             * @param url 当前页面的url
             * @param type 埋点类型
             * @param index 埋点顺序
             * @param description 其他信息描述
             */
            wm_upload: function (url, type, index, description) {
                // var createTime = new Date().toString();
                var logParams = {
                    // createTime: encodeURIComponent(createTime),
                    createTime: new Date().getTime(),
                    uploadType: 'WM_UPLOAD',
                    simpleUrl: encodeURIComponent(encodeURIComponent(url)),
                    webMonitorId:sessionStorage.getItem(ConstValue.WEB_MONITOR_PAGE_ID),
                    recordType: type,
                    recordIndex: index,
                    description: description
                };
                var http_api = ConstValue.WEB_MONITOR_IP + ConstValue.HTTP_UPLOAD_LOG_API;
                var recordDataXmlHttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP')
                recordDataXmlHttp.open('POST', http_api, true);
                recordDataXmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                recordDataXmlHttp.send('data=' + JSON.stringify([logParams]));
            },
            /**
             * 使用者传入的自定义信息
             *
             * @param userId
             * @param userName
             * @param userTpye
             */
            wm_init_user: function (userId, userTag, secondUserParam) {
                if (!userId) console.warn('userId 初始化值为0(不推荐) 或者 未初始化');
                if (!secondUserParam) console.warn('secondParam 初始化值为0(不推荐) 或者 未初始化');
                // 如果用户传入了userTag值，重新定义WEB_MONITOR_ID
                // if (userTag) {
                //     WEB_MONITOR_ID = userTag + "_webmonitor";
                // }
                localStorage.wmUserInfo = JSON.stringify({
                    userId: userId,
                    userTag: userTag,
                    secondUserParam: secondUserParam
                });
                return 1;
            },
            /**
             * 使用者传入的自定义信息
             *
             * @param userId 用户唯一标识
             * @param projectVersion 应用版本号
             */
            // wmInitUser: function (userId, projectVersion) {
            //     if (!userId) console.warn('userId(用户唯一标识) 初始化值为0(不推荐) 或者 未传值, 探针可能无法生效');
            //     if (!projectVersion) console.warn('projectVersion(应用版本号) 初始化值为0(不推荐) 或者 未传值, 探针可能无法生效');
            //
            //     localStorage.wmUserInfo = JSON.stringify({
            //         userId: userId,
            //         projectVersion: projectVersion
            //     });
            //     INITUSER_MSG = "用户信息初始化：userId=" + userId + "，版本号：" + projectVersion
            //     return 1;
            // },
            /**
             * 使用者自行上传的行为日志
             * @param userId 用户唯一标识
             * @param behaviorType 行为类型
             * @param behaviorResult 行为结果（成功、失败等）
             * @param uploadType 日志类型（分类）
             * @param description 行为描述
             */
            wm_upload_extend_log: function (data) {
                if (typeof data === 'object') {
                    data = JSON.stringify(data)
                }
                // var extendBehaviorInfo = new ExtendBehaviorInfo(EXTEND_INFO, data)
                // extendBehaviorInfo.handleLogInfo(CUSTOMIZE_BEHAVIOR, extendBehaviorInfo);
            },
        }
    }

    //polyFile 如果不支持 window.CustomEvent
    checkWindowPoly() {
        if (typeof window.CustomEvent === "function") return false;

        function CustomEvent(event, params) {
            params = params || {bubbles: false, cancelable: false, detail: undefined};
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        }

        CustomEvent.prototype = window.Event.prototype;
        // @ts-ignore
        window.CustomEvent = CustomEvent;
    }

    /**
     * @todo 用户访问记录监控
     * @param project 项目详情
     */
    checkUrlChange() {
        // 如果是单页应用， 只更改url
        var webLocation = window.location.href.split('?')[0].replace('#', '');
        // 如果url变化了， 就把更新的url记录为 defaultLocation, 重新设置pageKey
        if (defaultLocation != webLocation) {
            this.recordCI();
            defaultLocation = webLocation;
        }
    }


    /**
     * @todo 用户访问记录监控
     * @param project 项目详情
     */
    recordCI() {
        this.utils.setPageKey();
        var loadType = "load";
        if (resourcesObj) {
            if (resourcesObj[0] && resourcesObj[0].type === 'navigate') {
                loadType = "load";
            } else {
                loadType = "reload";
            }
        }
        // 判断是否是新用户  开始
        var customerKey = this.utils.getCookie("monitorCustomerKey");
        if (customerKey) {
            var newStatus = "";
            var customerKeyArr = customerKey ? customerKey.match(/\d{13}/g) : [];
            if (customerKeyArr && customerKeyArr.length > 0) {
                var tempTime = parseInt(customerKeyArr[0], 10);
                var currentTime = new Date().getTime();
                if (currentTime - tempTime > 1000) {
                    newStatus = "old";
                } else {
                    newStatus = "new";
                }
            }
        }
        // 判断是否是新用户  结束
        var customerPv = new Custrominfo(ConstValue.CUSTOMER_INFO, loadType, 0, newStatus);
        this.handleLogInfo(ConstValue.CUSTOMER_INFO, customerPv);
    }


    /**
     * @todo 用户加载页面信息监控
     * @param project 项目详情
     */
    recordLoadPage() {
        // utils.addLoadEvent(function () {
        setTimeout(function () {
            try {
                if (resourcesObj) {
                    var loadType = "load";
                    if (resourcesObj[0] && resourcesObj[0].type === 'navigate') {

                        loadType = "load";
                    } else {

                        loadType = "reload";
                    }

                    var t = timingObj;
                    var loadPageInfo = new Loadpage(ConstValue.LOADPAGE_INFO);
                    // 页面加载类型， 区分第一次load还是reload
                    loadPageInfo.loadType = loadType;

                    //【重要】页面加载完成的时间
                    //【原因】这几乎代表了用户等待页面可用的时间
                    loadPageInfo.loadPage = t.loadEventEnd - t.navigationStart;

                    //【重要】网页所有需要执行的脚本执行完成时的时间，domReady的时间
                    //【原因】反省下你的 DOM 树嵌套是不是太多了！
                    loadPageInfo.domReady = t.domContentLoadedEventEnd - t.fetchStart;

                    //【重要】DOM渲染时间
                    //【原因】反省下你的 DOM 树嵌套是不是太多了！
                    loadPageInfo.domRender = t.domComplete - t.responseEnd;

                    //【重要】重定向的时间
                    //【原因】拒绝重定向！比如，http://example.com/ 就不该写成 http://example.com
                    loadPageInfo.redirect = t.redirectEnd - t.redirectStart;

                    //【重要】DNS 查询时间
                    //【原因】DNS 预加载做了么？页面内是不是使用了太多不同的域名导致域名查询的时间太长？
                    // 可使用 HTML5 Prefetch 预查询 DNS ，见：[HTML5 prefetch](http://segmentfault.com/a/1190000000633364)
                    loadPageInfo.lookupDomain = t.domainLookupEnd - t.domainLookupStart;

                    //【重要】读取页面第一个字节的时间
                    //【原因】这可以理解为用户拿到你的资源占用的时间，加异地机房了么，加CDN 处理了么？加带宽了么？加 CPU 运算速度了么？
                    // TTFB 即 Time To First Byte 的意思
                    // 维基百科：https://en.wikipedia.org/wiki/Time_To_First_Byte
                    loadPageInfo.ttfb = t.responseStart - t.navigationStart;

                    //【重要】内容加载完成的时间
                    //【原因】页面内容经过 gzip 压缩了么，静态资源 css/js 等压缩了么？
                    loadPageInfo.request = t.responseEnd - t.requestStart;

                    //【重要】执行 onload 回调函数的时间
                    //【原因】是否太多不必要的操作都放到 onload 回调函数里执行了，考虑过延迟加载、按需加载的策略么？
                    loadPageInfo.loadEvent = t.loadEventEnd - t.loadEventStart;

                    // DNS 缓存时间
                    loadPageInfo.appcache = t.domainLookupStart - t.fetchStart;

                    // 卸载页面的时间
                    loadPageInfo.unloadEvent = t.unloadEventEnd - t.unloadEventStart;

                    // TCP 建立连接完成握手的时间
                    loadPageInfo.connect = t.connectEnd - t.connectStart;

                    if (loadPageInfo.loadPage < 0 || loadPageInfo.domReady < 0 || loadPageInfo.domRender < 0) return false
                    if (loadPageInfo.loadPage > 20000 || loadPageInfo.domReady > 20000 || loadPageInfo.domRender > 20000) return false
                    loadPageInfo.handleLogInfo(ConstValue.LOADPAGE_INFO, loadPageInfo);
                } else {
                    // var loadPageInner = new LoadPageInfo(LOADPAGE_INFO);
                    // loadPageInner.isInit = "performance error"
                    // loadPageInner.handleLogInfo(LOADPAGE_INFO, loadPageInner);
                    console.info("performance error")
                }
            } catch (e) {
                // var loadPageInner = new LoadPageInfo(LOADPAGE_INFO);
                // loadPageInner.isInit = "performance catch error: " + e
                console.info("performance error")

            }

            // 此方法有漏洞，暂时先注释掉
            // performanceGetEntries();
        }, 4000);
        // })
    }


    /**
     * @todo 页面JS错误监控
     */
    recordJavaScriptError() {
        let _this = this
        // 重写console.error, 可以捕获更全面的报错信息
        var oldError = console.error;

        console.error = function (tempErrorMsg) {
            var errorMsg = (arguments[0] && arguments[0].message) || tempErrorMsg;
            var lineNumber = 0;
            var columnNumber = 0;
            var errorObj = arguments[0] && arguments[0].stack;
            if (!errorObj) {
                if (typeof errorMsg == "object") {
                    try {
                        errorMsg = JSON.stringify(errorMsg)
                    } catch (e) {
                        errorMsg = "错误无法解析"
                    }
                }
                _this.siftAndMakeUpMessage("console_error", errorMsg, WEB_LOCATION, lineNumber, columnNumber, "CustomizeError: " + errorMsg);
            } else {
                // 如果报错中包含错误堆栈，可以认为是JS报错，而非自定义报错
                _this.siftAndMakeUpMessage("on_error", errorMsg, WEB_LOCATION, lineNumber, columnNumber, errorObj);
            }
            return oldError.apply(console, arguments);
        };
        // 重写 onerror 进行jsError的监听
        window.onerror = function (errorMsg, url, lineNumber, columnNumber, errorObj) {
            // jsMonitorStarted = true;
            var errorStack = errorObj ? errorObj.stack : null;
            _this.siftAndMakeUpMessage("on_error", errorMsg, url, lineNumber, columnNumber, errorStack);
        };
        //浏览器中未处理的Promise错误
        window.onunhandledrejection = function (e) {
            var errorMsg = "";
            var errorStack = "";
            if (typeof e.reason === "object") {
                errorMsg = e.reason.message;
                errorStack = e.reason.stack;
            } else {
                errorMsg = e.reason;
                errorStack = "";
            }
            _this.siftAndMakeUpMessage("on_error", errorMsg, WEB_LOCATION, 0, 0, "UncaughtInPromiseError: " + errorStack);
        }
    };


    /**
     * @todo JS error 上报
     * @param infoType
     * @param origin_errorMsg
     * @param origin_url
     * @param origin_lineNumber
     * @param origin_columnNumber
     * @param origin_errorObj
     */
    siftAndMakeUpMessage(infoType, origin_errorMsg, origin_url, origin_lineNumber, origin_columnNumber, origin_errorObj) {
        // 记录js错误前，检查一下url记录是否变化
        this.checkUrlChange();
        var errorMsg = origin_errorMsg ? origin_errorMsg : '';
        var errorObj = origin_errorObj ? origin_errorObj : '';
        var errorType = "";
        if (errorMsg) {
            if (typeof errorObj === 'string') {
                errorType = errorObj.split(": ")[0].replace('"', "");
            } else {
                var errorStackStr = JSON.stringify(errorObj)
                errorType = errorStackStr.split(": ")[0].replace('"', "");
            }
        }
        if (this.utils.errorFilter(this.igErrorList, errorMsg)) return
        var javaScriptErrorInfo = new JavaScriptErrorInfo(ConstValue.JSERROR_INFO, infoType, errorType + ": " + errorMsg, errorObj);
        javaScriptErrorInfo.handleLogInfo(ConstValue.JSERROR_INFO, javaScriptErrorInfo);
    };

    /**
     * @todo 页面接口请求监控
     */
    recordHttpLog() {

        // 监听ajax的状态
        const ajaxEventTrigger = (event) => {
            var ajaxEvent = new CustomEvent(event, {detail: this});
            window.dispatchEvent(ajaxEvent);
        }

        var oldXHR = window.XMLHttpRequest;

        function newXHR() {
            var realXHR = new oldXHR();
            realXHR.addEventListener('abort', function () {
                ajaxEventTrigger.call(this, 'ajaxAbort');
            }, false);
            realXHR.addEventListener('error', function () {
                ajaxEventTrigger.call(this, 'ajaxError');
            }, false);
            realXHR.addEventListener('load', function () {
                ajaxEventTrigger.call(this, 'ajaxLoad');
            }, false);
            realXHR.addEventListener('loadstart', function () {
                ajaxEventTrigger.call(this, 'ajaxLoadStart');
            }, false);
            realXHR.addEventListener('progress', function () {
                ajaxEventTrigger.call(this, 'ajaxProgress');
            }, false);
            realXHR.addEventListener('timeout', function () {
                ajaxEventTrigger.call(this, 'ajaxTimeout');
            }, false);
            realXHR.addEventListener('loadend', function () {
                ajaxEventTrigger.call(this, 'ajaxLoadEnd');
            }, false);
            realXHR.addEventListener('readystatechange', function () {
                ajaxEventTrigger.call(this, 'ajaxReadyStateChange');
            }, false);
            // 此处的捕获的异常会连日志接口也一起捕获，如果日志上报接口异常了，就会导致死循环了。
            // realXHR.onerror = function () {
            //   siftAndMakeUpMessage("Uncaught FetchError: Failed to ajax", WEB_LOCATION, 0, 0, {});
            // }
            return realXHR;
        }

        const handleHttpResult = (i, tempResponseText) => {
            if (!timeRecordArray[i] || timeRecordArray[i].uploadFlag === true) {
                return;
            }
            var responseText = "";
            if (tempResponseText && responseText.length < 500) {
                try {
                    responseText = tempResponseText ? JSON.stringify(this.utils.encryptObj(JSON.parse(tempResponseText))) : "";
                } catch (e) {
                    responseText = "";
                }
            } else {
                responseText = "data is too long";
            }
            var simpleUrl = timeRecordArray[i].simpleUrl;
            var currentTime = new Date().getTime();
            var url = timeRecordArray[i].event.detail.responseURL;
            var status = timeRecordArray[i].event.detail.status;
            var statusText = timeRecordArray[i].event.detail.statusText;
            var loadTime = currentTime - timeRecordArray[i].timeStamp;
            if (!url || url.indexOf(ConstValue.HTTP_UPLOAD_LOG_API) != -1) return;
            if (status == 200) return;
            var httpLogInfoStart = new HttpLogInfo(ConstValue.HTTPLOG_INFO, simpleUrl, url, status, statusText, "发起请求", "", timeRecordArray[i].timeStamp, 0);
            httpLogInfoStart.handleLogInfo(ConstValue.HTTPLOG_INFO, httpLogInfoStart);
            var httpLogInfoEnd = new HttpLogInfo(ConstValue.HTTPLOG_INFO, simpleUrl, url, status, statusText, "请求返回", responseText, currentTime, loadTime);
            httpLogInfoEnd.handleLogInfo(ConstValue.HTTPLOG_INFO, httpLogInfoEnd);
            // 当前请求成功后就，就将该对象的uploadFlag设置为true, 代表已经上传了
            timeRecordArray[i].uploadFlag = true;
        }

        var timeRecordArray = [];
        // @ts-ignore
        window.XMLHttpRequest = newXHR;

        window.addEventListener('ajaxLoadStart', function (e) {
            var tempObj = {
                timeStamp: new Date().getTime(),
                event: e,
                simpleUrl: window.location.href.split('?')[0].replace('#', ''),
                uploadFlag: false,
            }
            timeRecordArray.push(tempObj)
        });

        window.addEventListener('ajaxLoadEnd', function () {
            for (var i = 0; i < timeRecordArray.length; i++) {
                // uploadFlag == true 代表这个请求已经被上传过了
                if (timeRecordArray[i].uploadFlag === true) continue;
                if (timeRecordArray[i].event.detail.status > 0) {
                    var rType = (timeRecordArray[i].event.detail.responseType + "").toLowerCase()
                    if (rType === "blob") {
                        (function (index) {
                            var reader = new FileReader();
                            reader.onload = function () {
                                var responseText = reader.result;//内容就在这里
                                handleHttpResult(index, responseText);
                            }
                            try {
                                reader.readAsText(timeRecordArray[i].event.detail.response, 'utf-8');
                            } catch (e) {
                                handleHttpResult(index, timeRecordArray[i].event.detail.response + "");
                            }
                        })(i);
                    } else {
                        try {
                            var xhr = timeRecordArray[i] && timeRecordArray[i].event && timeRecordArray[i].event.detail;
                            if (!xhr) return;
                            var resType = xhr.responseType
                            var resTxt = "";
                            if (resType === '' || resType === 'text') resTxt = xhr.responseText;
                            if (resType === 'json') resTxt = JSON.stringify(xhr.response);
                            handleHttpResult(i, resTxt);
                        } catch (e) {
                        }
                    }
                }
            }
        });
    }


    /**
     * @todo 监控页面静态资源加载报错
     */
    recordResourceError() {
        // 当浏览器不支持 window.performance.getEntries 的时候，用下边这种方式
        console.log("23123===", 23123);
        window.addEventListener('error', function (e) {
            console.log("e===", e);
            var typeName = e.target['localName'];
            var sourceUrl = "";
            if (typeName === "link") {
                sourceUrl = e.target['href'];
            } else if (typeName === "script") {
                sourceUrl = e.target['src'];
            }
            var resourceLoadInfo = new ResourceLoadInfo(ConstValue.RESOURCELOAD_Info, sourceUrl, typeName, "0");
            resourceLoadInfo.handleLogInfo(ConstValue.RESOURCELOAD_Info, resourceLoadInfo);
        }, true);
    }
}

export default Monitor
