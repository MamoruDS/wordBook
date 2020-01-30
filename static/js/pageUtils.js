const pageUtils = {}

pageUtils.wait = async t => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, t)
    })
}