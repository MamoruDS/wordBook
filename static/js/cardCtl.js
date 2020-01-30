let temp_card_render = undefined

const cardCtl = {}

cardCtl._cardpack = {}

// cardCtl.setBtnView = (discardBtn = false, archiveBtn = false) => {
// }

cardCtl.updateDiscardPosCSS = (fixedHeight = 90) => {
    let wh = window.innerHeight
    let style = document.getElementById('style_discard_dynamic')
    if (!style) {
        style = document.createElement('style')
        style.type = 'text/css'
        style.id = 'style_discard_dynamic'
        document.body.appendChild(style)
    }
    cssText = `.card_discard { top: ${wh - fixedHeight}px !important; }`
    style.innerHTML = cssText
}

cardCtl._cardScroll = (isNext = true) => {
    let cardPos = [
        'card_rm',
        'card_discard',
        'card_q0',
        'card_q1',
        'card_q2',
        'card_q3']
    let _res = {
        cardRequest: 0,
        filledPos: {}
    }
    let cardDiscard = document.querySelector('.card_discard')
    if (!isNext) {
        if (!cardDiscard) return _res
        cardPos = cardPos.reverse()
    }
    for (let i in cardPos) {
        let curPosName = cardPos[i]
        let prePosName = cardPos[i - 1]
        let card = document.querySelector(`.${curPosName}`)
        if (card) {
            if (prePosName) {
                card.classList.remove(curPosName)
                card.classList.add(prePosName)
                _res.filledPos[prePosName] = true
            } else {
                try {
                    pageUtils.removeElement(card)
                } catch (e) { }
            }
        } if ((
            curPosName !== 'card_rm'
            && curPosName !== 'card_discard'
            && curPosName !== 'card_q3'
        )) {
            _res.cardRequest++
        }
    }
    if (_res.filledPos['card_discard']) cardCtl.updateDiscardPosCSS()
    return _res
}

cardCtl.getWordRender = async wordRenderName => {
    return test_nisev.getWordRender
}

cardCtl._getCardRenderRemote = rName => {
    // if (cardCtl.cardpack[rName]) return
    return new Promise((resolve, reject) => {
        let script = document.createElement('script')
        script.src = `${test_nisev.requestUrl}/static/custom/${rName}.js`
        document.head.appendChild(script)
        script.onload = () => resolve()
        script.onerror = e => reject(e)
    })
}

cardCtl.getCardRender = async rName => {
    if (!cardCtl.cardpack[rName]) {
        await cardCtl._getCardRenderRemote(rName)
        cardCtl.cardpack[rName] = {}
        cardCtl.cardpack[rName]['html'] = {
            front_html: temp_card_render['card_front_html'],
            back_html: temp_card_render['card_back_html'],
        }
        cardCtl.cardpack[rName]['css'] = temp_card_render['card_css']
    }
    return cardCtl.cardpack[rName]
}

cardCtl.updateCardView = (enableCardView = true) => {
    let views = {
        cardView: document.getElementById('card_hover'),
        cardBtnView: document.getElementById('card_ctl_btn_ctr'),
        cardViewBG: document.getElementById('card_bg')
    }
    for (let view of Object.keys(views)) {
        if (enableCardView) {
            views[view].classList.remove('pasDisplay')
        } else {
            views[view].classList.add('pasDisplay')
        }
    }
}

cardCtl.createCardCtrNode = async (wordRender, wordFields) => {
    let cardCtr = document.createElement('div')
    cardCtr.classList.add('card')
    // TODO: getWordRender async
    let render = getWordRender(wordRender)
    let card = {
        name: render.cardName,
        html: {
            card_front: undefined,
            card_back: undefined,
        },
        css: undefined,
        // TODO: append randomSeed to style node id
        styleNodeId: `${render.cardName}`,
    }
    let cardInfo = await getCardRenderSync(card.name)
    card.html.card_front = cardInfo['html']['front_html']
    card.html.card_back = cardInfo['html']['back_html']
    card.css = cardInfo['css']
    for (let face of Object.keys(card.html)) {
        let cardFace = document.createElement('div')
        cardFace.classList.add('card_face')
        cardFace.classList.add(face)
        let contentCtr = document.createElement('div')
        contentCtr.classList.add('card_content_ctr')
        contentCtr.innerHTML = card.html[face]
        for (let field of render.alias) {
            try {
                let nf = contentCtr.querySelector(`[data=${field.cf}]`)
                nf.innerHTML = wordFields[field.wf]
            } catch (e) { }
        }
        cardFace.appendChild(contentCtr)
        cardCtr.appendChild(cardFace)
    }
    if (!document.getElementById(card.styleNodeId)) {
        let cardStyle = document.createElement('style')
        cardStyle.type = 'text/css'
        cardStyle.id = card.styleNodeId
        cardStyle.appendChild(document.createTextNode(card.css))
        document.body.appendChild(cardStyle)
    }
    return cardCtr
}
