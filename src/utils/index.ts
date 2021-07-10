import {MonitorUtilsData, ConstValue} from '../../typing/utils'

export class MonitorUtils extends MonitorUtilsData {

    getUuid() {
        let timeStamp = new Date().getTime()
        return (
            'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                let r = (Math.random() * 16) | 0,
                    v = c == 'x' ? r : (r & 0x3) | 0x8
                return v.toString(16)
            }) +
            '-' +
            timeStamp
        )
    }

    getCookie(name) {
        let arr
        let reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)')
        if (document.cookie.match(reg)) {
            arr = document.cookie.match(reg)
            return unescape(arr[2])
        }
        return ''
    }

    getPageKey() {
        let pageKey = this.getUuid()
        let reg = /^[0-9a-z]{8}(-[0-9a-z]{4}){3}-[0-9a-z]{12}-\d{13}$/
        if (!localStorage.monitorPageKey) {
            localStorage.monitorPageKey = pageKey
        } else if (!reg.test(localStorage.monitorPageKey)) {
            localStorage.monitorPageKey = pageKey
        }
        return localStorage.monitorPageKey
    }

    setPageKey() {
        localStorage.monitorPageKey = this.getUuid()
    }

    // addLoadEvent(func) {
    //     let oldOnload = window.onload //把现在有window.onload事件处理函数的值存入变量oldonload。
    //     if (typeof window.onload != 'function') {
    //         //如果这个处理函数还没有绑定任何函数，就像平时那样把新函数添加给它
    //         window.onload = func
    //     } else {
    //         //如果在这个处理函数上已经绑定了一些函数。就把新函数追加到现有指令的末尾
    //         window.onload = function () {
    //             oldOnload()
    //             func()
    //         }
    //     }
    // }

    encryptObj(o) {
        if (o instanceof Array) {
            let n = []
            for (var i = 0; i < o.length; ++i) {
                n[i] = this.encryptObj(o[i])
            }
            return n
        } else if (o instanceof Object) {
            let n = {}
            //@ts-ignore
            for (var i in o) {
                n[i] = this.encryptObj(o[i])
            }
            return n
        }
        o = o + ''
        if (o.length > 8) {
            o = o.substring(0, 4) + '****' + o.substring(o.length - 3, o.length)
        }
        return o
    }

    ajax(method, url, param, successCallback, failCallback) {
        try {
            let xmlHttp = window.XMLHttpRequest
                ? new XMLHttpRequest()
                : new ActiveXObject('Microsoft.XMLHTTP')
            xmlHttp.open(method, url, true)
            xmlHttp.setRequestHeader(
                'Content-Type',
                'application/x-www-form-urlencoded'
            )
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4) {
                    typeof successCallback == 'function' && successCallback()
                } else {
                    typeof failCallback == 'function' && failCallback()
                }
            }
            xmlHttp.send('data=' + JSON.stringify(param))
        } catch (e) {
            console.log("e===", e);
        }

    }


    loadJs(url, callback) {
        let script = document.createElement('script')
        script.async = Boolean(1)
        script.src = url
        script.onload = callback
        let dom = document.getElementsByTagName('script')[0]
        dom.parentNode.insertBefore(script, dom)
        return dom
    }

    b64EncodeUnicode(str) {
        try {
            return btoa(
                encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
                    return String.fromCharCode(Number('0x' + p1))
                })
            )
        } catch (e) {
            return str
        }
    }

    getCustomerKey() {
        var customerKey = this.getUuid()
        var monitorCustomerKey = this.getCookie('monitorCustomerKey')
        if (!monitorCustomerKey) {
            var extraTime = 60 * 30 * 24 * 3600 * 1000 // cookie 30天后过期时间
            var exp = new Date()
            exp.setTime(exp.getTime() + extraTime)
            if (ConstValue.MAIN_DOMAIN) {
                document.cookie =
                    'monitorCustomerKey=' +
                    customerKey +
                    ';Path=/;domain=' +
                    ConstValue.MAIN_DOMAIN +
                    ';expires=' +
                    exp.toUTCString()
            } else {
                document.cookie =
                    'monitorCustomerKey=' +
                    customerKey +
                    ';Path=/;expires=' +
                    exp.toUTCString()
            }
            monitorCustomerKey = customerKey
        }
        return monitorCustomerKey
    }

    isAndroid() {
        return navigator.userAgent.toLowerCase().indexOf('android') >= 0;
    }

    isIOS() {
        let ua = navigator.userAgent.toLowerCase();
        // @ts-ignore
        if (ua.match(/iphone/i) === "iphone" || ua.match(/ipod/i) === "ipod" || ua.match(/ipad/i) === "ipad") {
            return true;
        } else {
            return false;
        }
    }

    isWX() {
        return /micromess/.test(navigator.userAgent.toLowerCase());
    }

    getPageUrl() {
        let url = "";
        if (location.href.indexOf('?') != -1) {
            url = location.href.substr(0, location.href.indexOf('?'));
        } else {
            url = location.href;
        }
        return url;
    }

    getUrlParam(key) {
        try {
            let parmasList: string[] = []
            let keyValues: string = location.href.slice(location.href.indexOf('?') + 1)
            keyValues = keyValues.substring(0, keyValues.indexOf('#')) || keyValues
            if (keyValues) {
                parmasList = keyValues.split('&')
                for (var index in parmasList) {
                    var keyValue = parmasList[index].split('=')
                    if (keyValue[0] === String(key)) {
                        return keyValue[1]
                    }
                }
                return ''
            }
        } catch (e) {
            console.log("e===", e);
        }

        return ''
    }

    getDevice(): { [key: string]: any } {
        let device = {
            ipad: undefined,
            android: undefined,
            iphone: undefined,
            ios: undefined,
            isWeixin: undefined,
            androidChrome: undefined,
            os: undefined,
            deviceName: undefined,
            osVersion: undefined,
            browserName: undefined,
            browserVersion: undefined,
            webView: undefined
        }
        let ua = navigator.userAgent
        let android = ua.match(/(Android);?[\s\/]+([\d.]+)?/)
        let ipad = ua.match(/(iPad).*OS\s([\d_]+)/)
        let ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/)
        let iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/)
        let mobileInfo = ua.match(/Android\s[\S\s]+Build\//)
        device.ios = device.android = device.iphone = device.ipad = device.androidChrome = false
        device.isWeixin = /MicroMessenger/i.test(ua)
        device.os = 'web'
        device.deviceName = 'PC'
        // Android
        if (android) {
            device.os = 'android'
            device.osVersion = android[2]
            device.android = true
            device.androidChrome = ua.toLowerCase().indexOf('chrome') >= 0
        }
        if (ipad || iphone || ipod) {
            device.os = 'ios'
            device.ios = true
        }
        // iOS
        if (iphone && !ipod) {
            device.osVersion = iphone[2].replace(/_/g, '.')
            device.iphone = true
        }
        if (ipad) {
            device.osVersion = ipad[2].replace(/_/g, '.')
            device.ipad = true
        }
        if (ipod) {
            device.osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : null
            device.iphone = true
        }
        // iOS 8+ changed UA
        if (device.ios && device.osVersion && ua.indexOf('Version/') >= 0) {
            if (device.osVersion.split('.')[0] === '10') {
                device.osVersion = ua
                    .toLowerCase()
                    .split('version/')[1]
                    .split(' ')[0]
            }
        }

        // 如果是ios, deviceName 就设置为iphone，根据分辨率区别型号
        if (device.iphone) {
            device.deviceName = 'iphone'
            let screenWidth = window.screen.width
            let screenHeight = window.screen.height
            if (screenWidth === 320 && screenHeight === 480) {
                device.deviceName = 'iphone 4'
            } else if (screenWidth === 320 && screenHeight === 568) {
                device.deviceName = 'iphone 5/SE'
            } else if (screenWidth === 375 && screenHeight === 667) {
                device.deviceName = 'iphone 6/7/8'
            } else if (screenWidth === 414 && screenHeight === 736) {
                device.deviceName = 'iphone 6/7/8 Plus'
            } else if (screenWidth === 375 && screenHeight === 812) {
                device.deviceName = 'iphone X/S/Max'
            }
        } else if (device.ipad) {
            device.deviceName = 'ipad'
        } else if (mobileInfo) {
            let info = mobileInfo[0]
            let deviceName = info.split(';')[1].replace(/Build\//g, '')
            device.deviceName = deviceName.replace(/(^\s*)|(\s*$)/g, '')
        }
        // 浏览器模式, 获取浏览器信息
        // TODO 需要补充更多的浏览器类型进来
        if (ua.indexOf('Mobile') == -1) {
            let agent = navigator.userAgent.toLowerCase()
            let regStr_ie = /msie [\d.]+;/gi
            let regStr_ff = /firefox\/[\d.]+/gi
            let regStr_chrome = /chrome\/[\d.]+/gi
            let regStr_saf = /safari\/[\d.]+/gi

            device.browserName = '未知'
            //IE
            if (agent.indexOf('msie') > 0) {
                let browserInfo = agent.match(regStr_ie)[0]
                device.browserName = browserInfo.split('/')[0]
                device.browserVersion = browserInfo.split('/')[1]
            }
            //firefox
            if (agent.indexOf('firefox') > 0) {
                let browserInfo = agent.match(regStr_ff)[0]
                device.browserName = browserInfo.split('/')[0]
                device.browserVersion = browserInfo.split('/')[1]
            }
            //Safari
            if (agent.indexOf('safari') > 0 && agent.indexOf('chrome') < 0) {
                let browserInfo = agent.match(regStr_saf)[0]
                device.browserName = browserInfo.split('/')[0]
                device.browserVersion = browserInfo.split('/')[1]
            }
            //Chrome
            if (agent.indexOf('chrome') > 0) {
                let browserInfo = agent.match(regStr_chrome)[0]
                device.browserName = browserInfo.split('/')[0]
                device.browserVersion = browserInfo.split('/')[1]
            }
        }
        // Webview
        device.webView =
            (iphone || ipad || ipod) && ua.match(/.*AppleWebKit(?!.*Safari)/i)

        // Export object
        return device
    }

    reportAjax(conf) {
        let url = conf.url;
        let type = conf.type;
        let data = conf.data;
        let success = conf.success;
        let error = conf.error;
        let contentType = conf.contentType || 'application/x-www-form-urlencoded; charset=gbk;'
        if (type == 'get')
            get();
        else if (type == 'post')
            post();
        else if (type == 'jsonp')
            jsonp();

        //创建XMLHttpRequest对象
        function createXMLHTTPRequest() {
            return new XMLHttpRequest();
        }

        //get请求
        function get() {
            let req = createXMLHTTPRequest();
            if (req) {
                req.open("GET", url, true);
                req.onreadystatechange = function () {
                    if (req.readyState == 4) {
                        if (req.status == 200) {
                            if (typeof success == 'function') success(req.response);
                        } else {
                            if (typeof error == 'function') error(req.status);
                        }
                    }
                }
                req.send(null);
            }
        }

        //post请求
        function post() {
            let req = createXMLHTTPRequest();
            if (req) {
                req.open("POST", url, true);
                req.setRequestHeader(
                    "Content-Type",
                    contentType
                );
                req.send(data);
                req.onreadystatechange = function () {
                    if (req.readyState == 4) {
                        if (req.status == 200) {
                            if (typeof success == 'function') success(req.response);
                        } else {
                            if (typeof error == 'function') error(req.status);
                        }
                    }
                }
            }
        }

        //jsonp
        function jsonp() {

            //创建script标签
            let head = document.getElementsByTagName('head')[0];
            let script = document.createElement('script');
            head.appendChild(script);

            //设置传递给后台的回调参数名
            let callbackName = ('jsonp_' + random()).replace(".", "");
            if (data) {
                conf.data['callback'] = callbackName;
                data = '?' + formatParams(data);
            } else {
                data = '';
                if (!/callback/.test(url))
                    url += ('&callback=' + callbackName);
            }

            //创建jsonp回调函数
            window[callbackName] = function (res) {
                head.removeChild(script);
                window[callbackName] = null;
                if (typeof success == 'function')
                    success(res)
            };

            //发送请求
            script.src = url + data;
        }

        //格式化参数
        function formatParams(data) {
            let arr = [];
            for (let key in data)
                arr.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
            // 添加一个随机数，防止缓存
            arr.push('v=' + random());
            return arr.join('&');
        }

        // 获取随机数
        function random() {
            return Math.floor(Math.random() * 10000 + 500);
        }
    }

    errorFilter(checkList, pa) {
        let unReport = false
        checkList.map((i, k) => {
            try {
                if (i.test(pa)) unReport = true
            } catch (e) {
                console.info('RegExp is error')
            }
        })
        return unReport
    }

    editIgErList(initList, addList) {
        let connectList = []
        if (initList && addList && typeof initList === 'object' && typeof addList === 'object') {
            connectList = initList.concat(addList)
        }
        return connectList
    }

    /**
     * @todo 初始化当前的输入参数
     * @param monitObj
     * @value qbbMonitor 报警项目
     * @value monitorPage 报警页面
     * @value recordList 行为数组
     */
    getInitObj(monitObj) {
        let mObj = monitObj && typeof monitObj === 'object' ? monitObj : null;
        return {
            qbbMonitor: mObj && mObj.qbbMonitor || null,
            monitorPage: mObj && mObj.monitorPage || null,
            recordList: mObj && mObj.recordList || null,
            igErrorList: mObj && mObj.igErrorList || []
        }
    }

}


