let temp_render = undefined

const cardCtl = {}

cardCtl._renders = {}

cardCtl._bookshelf = {}

cardCtl._withdrawEnabled = false

// cardCtl.setBtnView = (discardBtn = false, archiveBtn = false) => {
// }

cardCtl.getBookInfo = async (bookId, cached = true) => {
    if (cardCtl._bookshelf[bookId] && cached) {
        return cardCtl._bookshelf[bookId]
    }
    let reqOpt = pageUtils.getDefaultReqOptions()
    reqOpt['url'] = '/api/book'
    reqOpt['params']['book_id'] = bookId
    const res = await pageUtils.req(reqOpt)
    const bookInfo = res['data']['data'][0]
    cardCtl._bookshelf[bookId] = bookInfo
    return bookInfo
}


cardCtl.getRenderInfo = async (bookId, wordInfo) => {
    let bookInfo = await cardCtl.getBookInfo(bookId)
    let render = bookInfo['word_render']
    let alias = render['alias']
    let renderData = {}
    for (let field of alias) {
        renderData[field['renderField']]
            = wordInfo[field['wordField']]
    }
    return {
        render: render['render'],
        renderStyle: render['render_style'],
        renderData: renderData
    }
}

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

cardCtl.toggleCardView = (enableCardView = true) => {
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

cardCtl._getRenderRemote = renderName => {
    return new Promise((resolve, reject) => {
        let script = document.createElement('script')
        script.src = `${test_nisev.requestUrl}/static/custom/${renderName}.js`
        document.head.appendChild(script)
        script.onload = () => resolve()
        script.onerror = e => reject(e)
    })
}

cardCtl.getRender = async renderName => {
    if (!cardCtl._renders[renderName]) {
        await cardCtl._getRenderRemote(renderName)
        cardCtl._renders[renderName] = {}
        cardCtl._renders[renderName] = temp_render
    }
    return cardCtl._renders[renderName]
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
    recId, bookId, wordId, lc, lv, wordInfo,
    customStyle = {
        cardFace: 'card_face_default'
    }
) => {
    let renderInfo = await cardCtl.getRenderInfo(bookId, wordInfo)
    let render = await cardCtl.getRender(renderInfo.render)
    let card = render.getCard(renderInfo.renderData,
        renderInfo.renderStyle, customStyle.cardFace)
    card.setAttribute('wi_rid', recId)
    card.setAttribute('wi_bid', bookId)
    card.setAttribute('wi_wid', wordId)
    card.setAttribute('wi_wlc', lc)
    card.setAttribute('wi_wlv', lv)
    return card
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

class cardList {
    constructor(bids) {
        this.wordList = test_nisev.wordList
        this.bookList = test_nisev.bookList
    }

    async putTopCard() {
        let rec = this.wordList.shift()
        if (rec) {
            let card = await cardCtl.createCardCtrNode(
                rec['rec_id'], rec['word']['book_id'], rec['word']['word_id'],
                rec['lc'], rec['lv'], rec['word']['fields']
            )
            return card
        }
    }

    async getLeftRecs() {
        let reqOpt = pageUtils.getDefaultReqOptions()
        reqOpt.url = '/api/recordValid'
        reqOpt.params = {
            book_ids: JSON.stringify(this.bookList),
            cnt: 5,
            lv: 0,
            valid_ts: Math.floor(Date.now() / 1000) + 99999
        }
        let res = await pageUtils.req(reqOpt)
        return res.data['data']
    }

    async updateWordList() {
        this.wordList = []
        let fetchWords = await this.getLeftRecs()
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
            let cardRidAttr = `[wi_rid="${fetchWords[i_f]['rec_id']}"]`
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

cardCtl.curCardList = new cardList()
