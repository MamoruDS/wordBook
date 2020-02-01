let temp_card_render = undefined

const cardCtl = {}

cardCtl._cardpack = {}

cardCtl._withdrawEnabled = false

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

cardCtl._cardScroll = (step = 0) => {
    let cardPos = [
        'card_rm',
        'card_discard',
        'card_q0',
        'card_q1',
        'card_q2',
        'card_q3']
    let _res = {
        cardRequest: 3,
        filledPos: {}
    }
    let cardDiscard = document.querySelector('.card_discard')
    if (step < 0) {
        if (!cardDiscard) return _res
        cardPos = cardPos.reverse()
    }
    for (let i in cardPos) {
        let curPosName = cardPos[i]
        let prePosName = cardPos[i - 1]
        if (step === 0) prePosName = curPosName
        let card = document.querySelector(`.${curPosName}`)
        if (card) {
            if (prePosName) {
                if (step !== 0) {
                    card.classList.remove(curPosName)
                    card.classList.add(prePosName)
                }
                _res.filledPos[prePosName] = true
                if (
                    prePosName === 'card_q0' ||
                    prePosName === 'card_q1' ||
                    prePosName === 'card_q2'
                ) {
                    _res.cardRequest--
                }
            } else {
                try {
                    pageUtils.removeElement(card)
                } catch (e) { }
            }
        }
    }
    if (_res.filledPos['card_discard']) cardCtl.updateDiscardPosCSS()
    return _res
}

cardCtl.getWordRender = async wordRenderName => {
    return test_nisev.getWordRender[wordRenderName]
}

cardCtl._getCardRenderRemote = rName => {
    // if (cardCtl._cardpack[rName]) return
    return new Promise((resolve, reject) => {
        let script = document.createElement('script')
        script.src = `${test_nisev.requestUrl}/static/custom/${rName}.js`
        document.head.appendChild(script)
        script.onload = () => resolve()
        script.onerror = e => reject(e)
    })
}

cardCtl.getCardRender = async rName => {
    if (!cardCtl._cardpack[rName]) {
        await cardCtl._getCardRenderRemote(rName)
        cardCtl._cardpack[rName] = {}
        cardCtl._cardpack[rName]['html'] = {
            front_html: temp_card_render['card_front_html'],
            back_html: temp_card_render['card_back_html'],
        }
        cardCtl._cardpack[rName]['css'] = temp_card_render['card_css']
    }
    return cardCtl._cardpack[rName]
}

cardCtl.updateCardView = (enableCardView = true) => {
    let views = {
        cardView: document.getElementById('card_desk'),
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

cardCtl.createCardCtrNode = async (
    rid, bid, wid, wlv, wordRender, wordFields,
    customStyle = {
        cardFace: 'card_face_default'
    },
) => {
    let cardCtr = document.createElement('div')
    cardCtr.classList.add('card')
    cardCtr.setAttribute('wi_rid', rid)
    cardCtr.setAttribute('wi_bid', bid)
    cardCtr.setAttribute('wi_wid', wid)
    cardCtr.setAttribute('wi_wlv', wlv)
    let render = await cardCtl.getWordRender(wordRender)
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
    let cardInfo = await cardCtl.getCardRender(card.name)
    card.html.card_front = cardInfo['html']['front_html']
    card.html.card_back = cardInfo['html']['back_html']
    card.css = cardInfo['css']
    for (let face of Object.keys(card.html)) {
        let cardFace = document.createElement('div')
        cardFace.classList.add('card_face')
        cardFace.classList.add(customStyle.cardFace)
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

cardCtl.removeCard = async (cardEle) => {
    if (cardEle) {
        cardEle.classList = 'card'
        await pageUtils.wait(150)
        pageUtils.removeElement(cardEle)
    }
}

cardCtl.updateDesk = async (action) => {
    await cardCtl.curCardList.updateWordList()
    let scroll = cardCtl._cardScroll(action['step'])
    let cardReqCount = scroll.cardRequest
    if (scroll.filledPos['card_discard']) {
        document.getElementById('card_ctl_btn_withdraw').classList.remove('card_ctl_btn_disabled')
        cardCtl._withdrawEnabled = true
    } else {
        document.getElementById('card_ctl_btn_withdraw').classList.add('card_ctl_btn_disabled')
        cardCtl._withdrawEnabled = false
    }
    let desk = document.getElementById('card_desk')
    let cardPos = ['card_q0', 'card_q1', 'card_q2']
    cardPos = cardPos.slice(cardPos.length - cardReqCount)
    for (let c = 0; c < cardReqCount; c++) {
        let card = await cardCtl.curCardList.putTopCard()
        if (card) {
            desk.appendChild(card)
            setTimeout(() => {
                card.classList.add(cardPos[c])
            }, 150)
            await pageUtils.wait(200)
        } else if (cardReqCount === 1) {
            if (document.querySelectorAll('[wi_wid="ENDCARD"]').length === 0) {
                card = await cardCtl.createCardCtrNode(
                    'END', 'preserve', 'ENDCARD', 'preserve',
                    'preset_finish_card', {
                    front_msg: 'have some fun',
                    back_msg: 'hooray 🎉<br> you finished all your tasks'
                }, {
                    cardFace: 'card_face_end'
                }
                )
                desk.appendChild(card)
                setTimeout(() => {
                    card.classList.add(cardPos[c])
                }, 150)
            }
        }
    }
}

class cardListNew {
    constructor(bids) {
        this.wordList = test_nisev.wordList
        this.bookList = test_nisev.bookList
    }

    async putTopCard() {
        let word = this.wordList.shift()
        if (word) {
            let card = await cardCtl.createCardCtrNode(
                word['recId'], word['bookId'], word['wordId'],
                word['level'], word['wordRender'], word['fields']
            )
            return card
        }
    }

    async getLeftWords() {
        let reqObj = pageUtils.getDefaultReqObj()
        reqObj.url = '/api/words/leftwords'
        reqObj.params = {
            bids: JSON.stringify(this.bookList),
            c: 5,
            b64d: true
        }
        let res = await pageUtils.remoteResRequest(reqObj)
        // return res
        return res.data
    }

    async updateWordList() {
        this.wordList = []
        let fetchWords = await this.getLeftWords()
        let cardPosList =
            ['card_discard', 'card_q0', 'card_q1', 'card_q2']

        let i_f = 0
        let i_p_fix = 0
        while (fetchWords[i_f]) {
            let cardPos = cardPosList[i_f + i_p_fix]
            if (!cardPos) {
                this.wordList.push(fetchWords[i_f])
                i_f++
                continue
            }
            let cardRidAttr = `[wi_rid="${fetchWords[i_f]['recId']}"]`
            let deskCard = document.querySelector(`.${cardPos}${cardRidAttr}`)

            if (deskCard) {
                i_f++
                continue
            }
            await cardCtl.removeCard(
                document.querySelector(`.${cardPos}`)
            )
            if (i_f === 0) {
                i_p_fix++
                continue
            } else {
                deskCard = document.querySelector(`${cardRidAttr}`)
                if (deskCard) {
                    deskCard.classList = `card ${cardPos}`
                } else {
                    this.wordList.push(fetchWords[i_f])
                }
            }
            i_f++
            continue
        }
    }
}

cardCtl.curCardList = new cardListNew()
