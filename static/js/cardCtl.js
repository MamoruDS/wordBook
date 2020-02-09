let temp_render = undefined

const cardCtl = {}

cardCtl._scrollLock = false

cardCtl._renders = {}

cardCtl._bookshelf = {
    "b-preset-end": {
        book_fields: {
            frontMsg: {
                field_render_tag: 'text'
            },
            backMsg: {
                field_render_tag: 'text'
            }
        },
        word_render: {
            alias: [
                {
                    renderField: 'ef00',
                    renderTag: 'text',
                    wordField: 'frontMsg'
                },
                {
                    renderField: 'eb00',
                    renderTag: 'text',
                    wordField: 'backMsg'
                }
            ],
            render: "preset_render",
            render_style: "preset_finish_card"
        }
    }
}

cardCtl._desk = undefined

cardCtl._btnCtr = undefined

cardCtl._touchmove = {
    moving: false,
    start: undefined, // [pageX, pageY]
    end: undefined // [pageX, pageY]
}

cardCtl.init = () => {
    cardCtl._desk = document.getElementById('card_desk')
    cardCtl._btnCtr = document.getElementById('card_ctl_btn_ctr')
    cardCtl.btnCtrInit()
    document.addEventListener(
        'touchstart', e => {
            const touches = e.touches
            if (e.target.id == 'card_ctl_btn_ctr' ||
                e.target.id == 'card_desk' ||
                e.target.classList.contains('card_ctl_btn')
            )
                cardCtl._touchmove.start = [touches[0].pageX, touches[0].pageY]
        }
    )
    document.addEventListener(
        'touchend', e => {
            const btnCtr = cardCtl._btnCtr
            if (cardCtl._touchmove.end) {
                const dx = cardCtl._touchmove.start[0] - cardCtl._touchmove.end[0]
                const dy = cardCtl._touchmove.start[1] - cardCtl._touchmove.end[1]
                console.log(`dx:${dx} ;dy:${dy}`)
                if (
                    // dy <= -70 && Math.abs(dx) <= 40 // down
                    dx <= -100 && Math.abs(dy) <= 40 // right
                ) {
                    btnCtr.classList.add('hide')
                } else if (
                    // dy >= 70 && Math.abs(dx) <= 40 // up
                    dx >= 100 && Math.abs(dy) <= 40 // left
                ) {
                    btnCtr.classList.remove('hide')
                }
            }
            cardCtl._touchmove.end = undefined
        }
    )
    document.addEventListener(
        'touchmove', e => {
            const touches = e.touches
            cardCtl._touchmove.end = [touches[0].pageX, touches[0].pageY]
        }
    )
    document.addEventListener(
        'click',
        e => {
            if (e.target.classList.contains('card_q0')) {
                const topCard = e.target
                if (topCard.classList.contains('card_flip')) {
                    topCard.classList.remove('card_flip')
                } else {
                    topCard.classList.add('card_flip')
                }
            }
        },
        false
    )
    document.addEventListener(
        'click',
        e => {
            if (!cardCtl._scrollLock &&
                e.target.hasAttribute('step') &&
                !e.target.classList.contains('card_ctl_btn_disabled')
            ) {
                cardCtl.updateDesk(
                    {
                        step: e.target.getAttribute('step'),
                        nextLv: Number.parseInt(e.target.getAttribute('tr'))
                    }
                )
            }
        }
    )
    document.addEventListener(
        'click',
        e => {
            if (e.target.id == 'deskToggle') {
                cardCtl.updateDesk({ step: 0 })
                cardCtl.toggleCardView(true)
            }
        },
        false
    )
    document.addEventListener(
        'click',
        e => {
            if (e.target.id == 'card_ctl_btn_flip') {
                const topCard = document.querySelector('.card_q0')
                if (topCard.classList.contains('card_flip')) {
                    topCard.classList.remove('card_flip')
                } else {
                    topCard.classList.add('card_flip')
                }
            }
        },
        false
    )
    window.addEventListener('resize', () => {
        cardCtl.updateDiscardPosCSS()
    })
}

cardCtl._status = {
    hasDiscard: false,
    curCard: undefined
    // curCard: {
    //     bookId: undefined,
    //     wordId: undefined,
    //     tags: [],
    //     preLv: 0,
    //     curLv: 0,
    //     nextLv: 0,
    //     node: undefined
    // }
}

cardCtl.statusUpdate = () => {
    const desk = cardCtl._desk
    if (desk.querySelector('.card_discard')) {
        cardCtl._status.hasDiscard = true
    } else {
        cardCtl._status.hasDiscard = false
    }
    let cur = desk.querySelector('.card_q0')
    if (cur) {
        if (cur.getAttribute('wi_wid') === 'WID_END') {
            cardCtl._status.curCard = undefined
        } else {
            cardCtl._status.curCard = {
                // TODO: card tags
                bookId: cur.getAttribute('wi_bid'),
                wordId: cur.getAttribute('wi_wid'),
                tags: [],
                preLv: cur.getAttribute('wi_plv'),
                curLv: cur.getAttribute('wi_clv'),
                nextLv: cur.getAttribute('wi_nlv'),
                node: cur
            }
        }
    } else {
        cardCtl._status.curCard = undefined
    }


}

cardCtl.btnCtrInit = () => {
    cardCtl._btnCtr.innerText = ''
    const buttons = [
        {
            id: 'card_ctl_btn_rm',
            tr: -1,
            icon: 'fa-trash-alt',
            scroll: 1
        },
        {
            id: 'card_ctl_btn_tags',
            icon: 'fa-hashtag',
        },
        {
            id: 'card_ctl_btn_withdraw',
            icon: 'fa-arrow-circle-left',
            scroll: -1
        },
        {
            id: 'card_ctl_btn_flip',
            icon: 'fa-undo',
        },
        {
            id: 'card_ctl_btn_tr0',
            tr: 0,
            icon: 'fa-angle-left',
            scroll: 1
        },
        {
            id: 'card_ctl_btn_tr1',
            tr: 1,
            icon: 'fa-angle-down',
            scroll: 1
        },
        {
            id: 'card_ctl_btn_tr2',
            tr: 2,
            icon: 'fa-angle-right',
            scroll: 1
        },
        {
            id: 'card_ctl_btn_tr3',
            tr: 3,
            icon: 'fa-angle-double-right',
            scroll: 1
        },
    ]
    for (let b of buttons) {
        let btn = document.createElement('div')
        let label = document.createElement('div')
        label.classList.add('btn_label')
        let btnc = document.createElement('div')
        btnc.classList.add('btn_content_ctr')
        let icon = document.createElement('i')
        icon.classList.add('fas')
        icon.classList.add(b['icon'])
        btnc.appendChild(icon)
        btn.classList.add('card_ctl_btn')
        btn.classList.add('card_ctl_btn_disabled')
        btn.id = b['id']
        if (typeof b['tr'] === 'number') btn.setAttribute('tr', b['tr'])
        if (typeof b['scroll'] === 'number') btn.setAttribute('step', b['scroll'])
        btn.appendChild(btnc)
        btn.appendChild(label)
        cardCtl._btnCtr.appendChild(btn)
    }
}

cardCtl.btnGrpUpdate = () => {
    cardCtl.btnUpdate('card_ctl_btn_withdraw', !cardCtl._status.hasDiscard)
    if (cardCtl._status.curCard) {
        cardCtl.btnUpdate('card_ctl_btn_flip', false)
        cardCtl.btnUpdate('card_ctl_btn_tags', true)
        cardCtl.btnUpdate('card_ctl_btn_tr0', false)
        cardCtl.btnUpdate('card_ctl_btn_tr1', false)
        cardCtl.btnUpdate('card_ctl_btn_tr2', false)
        cardCtl.btnUpdate('card_ctl_btn_tr3', false)
        const curCard = cardCtl._status.curCard
        cardCtl.setAddInfo('lv', `Lv.${curCard.curLv}`)
        if (curCard.curLv == -1) {
            cardCtl.setAddInfo('rm', 'REMOVED')
        }
        if (curCard.curLv == 0) {
            cardCtl.setAddInfo('new', 'NEW')
        }
        if (curCard.curLv == -1 || curCard.nextLv == -1) {
            cardCtl.btnUpdate('card_ctl_btn_rm', false, true)
        } else {
            cardCtl.btnUpdate('card_ctl_btn_rm', false)
        }
        if (curCard.nextLv) {
            cardCtl.btnUpdate(`card_ctl_btn_tr${curCard.nextLv}`, false, true)
        }
        cardCtl.updateProgressPrev(curCard.bookId, curCard.wordId)

    } else {
        cardCtl.btnUpdate('card_ctl_btn_rm', true)
        cardCtl.btnUpdate('card_ctl_btn_tags', true)
        cardCtl.btnUpdate('card_ctl_btn_flip', true)
        cardCtl.btnUpdate('card_ctl_btn_tr0', true)
        cardCtl.btnUpdate('card_ctl_btn_tr1', true)
        cardCtl.btnUpdate('card_ctl_btn_tr2', true)
        cardCtl.btnUpdate('card_ctl_btn_tr3', true)
    }
}

cardCtl.btnUpdate = (btnId, isDisabled = true, isChecked = false) => {
    const btnCtr = cardCtl._btnCtr
    let btn = btnCtr.querySelector(`#${btnId}`)
    if (!btn) return
    if (isDisabled) {
        btn.classList.add('card_ctl_btn_disabled')
    } else {
        btn.classList.remove('card_ctl_btn_disabled')
    }
    if (isChecked) {
        btn.classList.add('card_ctl_btn_checked')
    } else {
        btn.classList.remove('card_ctl_btn_checked')
    }
}

cardCtl.setProgressPrev = async (book_id, word_id) => {
    const btnCtr = cardCtl._btnCtr
    if (book_id && word_id) {
        await updateProgressPrev(book_id, word_id)
    } else {
        for (let l of btnCtr.querySelectorAll('.btn_label')) {
            l.classList.add('btn_label_hide')
        }
    }
}

cardCtl.updateProgressPrev = async (book_id, word_id) => {
    const btnCtr = cardCtl._btnCtr
    if (!book_id && !word_id) {
        for (let l of btnCtr.querySelectorAll('.btn_label')) {
            l.classList.add('btn_label_hide')
        }
        return
    }
    const data = await cardCtl.getProgess(book_id, word_id)
    for (let p of Object.keys(data)) {
        // pageUtils.minParser
        // console.log(p)
        let label = btnCtr
            .querySelector(`#card_ctl_btn_${p}`)
            .querySelector('.btn_label')
        label.innerText = pageUtils.minParser(data[p]['dt'])
        label.classList.remove('btn_label_hide')

    }
}

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
        renderData[field['renderField']] = {
            val: wordInfo[field['wordField']],
            tag: field['renderTag']
        }
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
        cardPost: undefined,
        filledPos: {}
    }
    let cardDiscard = document.querySelector('.card_discard')
    if (step < 0) {
        if (!cardDiscard) {
            return false
        }
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
                if (prePosName === 'card_rm') {
                    _res.cardPost = {
                        bookId: card.getAttribute('wi_bid'),
                        wordId: card.getAttribute('wi_wid'),
                        lc: card.getAttribute('wi_wlc'),
                        lv: card.getAttribute('wi_nlv')
                    }
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
    // TODO: previous level
    // card.setAttribute('wi_plv', plv)
    card.setAttribute('wi_clv', lv)
    let addInfo = document.createElement('div')
    addInfo.classList.add('card_add_info')
    card.appendChild(addInfo)
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
    const desk = cardCtl._desk
    cardCtl.updateProgressPrev(undefined, undefined)
    // TODO: function
    if (typeof action.nextLv === 'number') {
        let curCard = document.querySelector('.card_q0')
        curCard.setAttribute('wi_nlv', action.nextLv)
    }
    cardCtl._scrollLock = true
    let scroll = cardCtl._cardScroll(action['step'])
    if (scroll.cardPost) {
        await cardCtl.postNewRec(
            scroll.cardPost.bookId,
            scroll.cardPost.wordId,
            scroll.cardPost.lc,
            Number.parseInt(scroll.cardPost.lv),
        )
        setTimeout(() => {
            pageUtils.removeElement(
                document.querySelector('.card_rm')
            )
        }, 200)
    }
    await cardCtl.curCardList.updateWordList()
    // TODO: check rm q3 after updateWordList
    scroll = cardCtl._cardScroll(0)
    let cardReqCount = scroll.cardRequest
    let cardPosCheck = ['card_q0', 'card_q1', 'card_q2']
    let cardPos = []
    for (let i in cardPosCheck) {
        if (!scroll.filledPos[cardPosCheck[i]]) {
            cardPos.push(cardPosCheck[i])
        }
    }
    for (let c = 0; c < cardReqCount; c++) {
        let card = await cardCtl.curCardList.putTopCard()
        if (card) {
            desk.appendChild(card)
            setTimeout(() => {
                card.classList.add(cardPos[c])
            }, 150)
            await pageUtils.wait(200)
        } else {
            if (document.querySelectorAll('[wi_wid="WID_END"]').length === 0) {
                card = await cardCtl.createCardCtrNode(
                    'RID_END', 'b-preset-end', 'WID_END', 'default',
                    '-2', {
                    frontMsg: 'have some fun',
                    backMsg: 'hooray 🎉<br> you finished all your tasks'
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
    cardCtl.statusUpdate()
    cardCtl.btnGrpUpdate()
    cardCtl._scrollLock = false
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
            lv: 3,
            valid_ts: Math.floor(Date.now() / 1000)
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

cardCtl.showCard = (card) => {
    let cur_card = document.querySelector('.card_q0')
    cur_card.classList.remove('card_q0')
    card.classList.add('card')
    card.classList.add('card_q0')
    let desk = document.getElementById('card_desk')
    desk.appendChild(card)
}

cardCtl.postNewRec = async (bookId, wordId, lc, tr) => {
    let reqOpt = pageUtils.getDefaultReqOptions()
    reqOpt.url = '/api/record'
    reqOpt.method = 'post'
    reqOpt.params = {
        book_id: bookId,
        word_id: wordId,
    }
    console.log(`tr: ${tr}`)
    reqOpt.data = {
        lc: lc,
        tr: tr
    }
    let res = await pageUtils.req(reqOpt)
    return res
}

cardCtl.getProgess = async (bookId, wordId) => {
    let reqOpt = pageUtils.getDefaultReqOptions()
    reqOpt.url = '/api/progress'
    reqOpt.params = {
        book_id: bookId,
        word_id: wordId,
    }
    let res = await pageUtils.req(reqOpt)
    return res.data['data']
}

cardCtl.setAddInfo = (type, str, node = cardCtl._status.curCard.node) => {
    const addInfoCtr = node.querySelector('.card_add_info')
    pageUtils.removeElement(addInfoCtr.querySelector('.add_info'))
    if (str) {
        let addInfo = document.createElement('div')
        addInfo.classList.add('add_info')
        addInfo.classList.add(`add_info_${type}`)
        addInfo.classList.add(`add_info_hide`)
        addInfo.innerHTML = str
        addInfoCtr.appendChild(addInfo)
        setTimeout(() => {
            addInfo.classList.remove(`add_info_hide`)
        }, 50)
    }
}
