const pageUtils = {}

pageUtils.wait = async t => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, t)
    })
}

pageUtils.removeElement = element => {
    if (element == null) {
        return
    } else if (element.length) {
        for (let e of element) {
            pageUtils.removeElement(e)
        }
    } else if (typeof element === 'object') {
        try {
            element.parentNode.removeChild(element)
        } catch (err) { }
    }
}

pageUtils.req = async (
    reqOpt = {
        baseURL: undefined,
        url: undefined,
        method: 'get',
        headers: {},
        params: {},
        data: {},
    }
) => {
    let res = undefined
    try {
        res = await axios({
            baseURL: reqOpt.baseURL,
            url: reqOpt.url,
            method: reqOpt.method,
            headers: reqOpt.headers,
            params: reqOpt.params,
            data: reqOpt.data,
            timeout: 500,
        })
    } catch (e) { }
    return res
}

pageUtils.getDefaultReqOptions = () => {
    return {
        baseURL: test_nisev.requestUrl,
        url: '/api',
        method: 'get',
        headers: {},
        params: {},
        data: {},
    }
}

pageUtils.minParser = (min) => {
    let t = min
    if (t <= 55) {
        return `${t} mins`
    } else {
        t = (t / 60).toFixed(1)
        if (t <= 23) {
            return `${t} hrs`
        } else {
            t = (t / 24).toFixed(1)
            if (t <= 6) {
                return `${t} dys`
            } else {
                t = (t / 7).toFixed(1)
                if (t < 4) {
                    return `${t} wks`
                } else {
                    t = (min / 60 / 24 / 30).toFixed(1)
                    if (t < 12) {
                        return `${t} mos`
                    } else {
                        return `${(t / 12).toFixed(1)} yrs`
                    }
                }
            }
        }
    }
}
