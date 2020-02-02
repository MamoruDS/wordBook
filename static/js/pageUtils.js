const pageUtils = {}

pageUtils.wait = async t => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, t)
    })
}

pageUtils.removeElement = element => {
    if (element) try {
        element.parentNode.removeChild(element)
    } catch (err) { }
}

pageUtils.req = async (
    reqObj = {
        baseURL: undefined,
        url: undefined,
        method: 'get',
        headers: {},
        params: {},
        data: {}
    }
) => {
    res = await axios({
        baseURL: reqObj.baseURL,
        url: reqObj.url,
        method: reqObj.method,
        headers: reqObj.headers,
        params: reqObj.params,
        data: reqObj.data,
        timeout: 500
    })
    return res
}

pageUtils.getDefaultReqOptions = () => {
    return {
        baseURL: test_nisev.requestUrl,
        url: '/api',
        method: 'get',
        headers: {},
        params: {},
        data: {}
    }
}
