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
