temp_render = {}

temp_render._name = 'preset_render'

temp_render.getCard = (data, style, extraFaceClass) => {
    let card = document.createElement('div')
    card.classList.add('card')
    for (let face of ['card_front', 'card_back']) {
        let cardFace = document.createElement('div')
        cardFace.classList.add('card_face')
        cardFace.classList.add(face)
        if (typeof extraFaceClass === 'string')
            cardFace.classList.add(extraFaceClass)
        let contentCtr = document.createElement('div')
        contentCtr.classList.add('card_content_ctr')
        contentCtr.innerHTML = temp_render.getStyle(style)[face]
        for (let field of Object.keys(data)) {
            temp_render.getTagRender(
                contentCtr,
                field,
                data[field]['val'],
                data[field]['tag']
            )
        }
        pageUtils.removeElement(contentCtr.querySelectorAll('[data]'))

        cardFace.appendChild(contentCtr)
        card.appendChild(cardFace)
    }
    temp_render._injectStyle(style)
    return card
}

temp_render.getTagRender = (contentCtr, field, data, tag, insert = true) => {
    let fieldNode = contentCtr.querySelector(`[data="${field}"]`)
    let group = undefined
    if (!fieldNode) return
    let fieldNodeCtr = fieldNode.parentNode

    fieldNode = fieldNode.cloneNode()
    fieldNode.removeAttribute('data')

    if (!contentCtr.querySelector(`[data="${field}"]`)) return
    if (tag.split(':')[1] === 'group' && tag.split(':')[2]) {
        data = JSON.parse(data)
        for (let i in data) {
            let fieldNode = temp_render.getTagRender(
                contentCtr,
                field,
                data[i],
                tag.split(':')[0],
                false
            )
            if (fieldNode) {
                let groupInfo = {
                    name: tag.split(':')[2].split('.')[0],
                    flexDirection: tag.split(':')[2].split('.')[1],
                    flexOrder: tag.split(':')[2].split('.')[2],
                }
                group = contentCtr.querySelector(
                    `[group="${groupInfo.name}"][group-index="${i}"]`
                )

                if (!group) {
                    group = document.createElement('div')
                    groupInfo.flexDirection =
                        groupInfo.flexDirection === 'v' ? 'column' : 'row'
                    group.style = `display: flex; flex-direction: ${groupInfo.flexDirection};`
                    group.setAttribute('group', groupInfo.name)
                    group.setAttribute('group-index', i)
                    fieldNodeCtr.appendChild(group)
                }
                fieldNode.style = `order: ${groupInfo.flexOrder};`
                group.appendChild(fieldNode)
            }
        }
        return
    }
    switch (tag.split(':')[0]) {
        case 'text':
            fieldNode.innerHTML = data
        case 'audio':
            break
    }
    if (insert) fieldNodeCtr.appendChild(fieldNode)
    return fieldNode
}

temp_render.getCardPreview = () => {
    return
}

temp_render.getStyle = style => {
    return temp_render._styles[style]
}

temp_render._injectStyle = style => {
    let issId = `${temp_render._name}.${style}`
    if (!document.getElementById(issId)) {
        let iss = document.createElement('style')
        iss.type = 'text/css'
        iss.id = issId
        iss.appendChild(
            document.createTextNode(temp_render.getStyle(style)['style_css'])
        )
        document.body.appendChild(iss)
    }
}

temp_render._styles = {
    preset_card_01: {
        card_front: `
            <div class="card_l1">
                <div class="cr_p_a00" data="a00"> </div>
                <div class="cr_p_a01" data="a01"> </div>
            </div>
            <div class="card_l1">
                <div class="cr_p_a10" data="a10"> </div>
                <div class="cr_p_a11" data="a11"> </div>
            </div>
            <hr class="cr_p_hr" />
            <div class="cr_p_a20" data="a20"> </div>
            <div class="cr_p_a30" data="a30"> </div>
        `,
        card_back: `
            <div class="card_wf">
                <span data="a00"> </span>
            </div>
        `,
        style_css: `
            .cr_p_a00 {
                color: var(--fg-hi);
                font-size: 2rem;
            }
    
            .cr_p_a01 {
                color: var(--fg-main-hi-01);
                font-size: 1.5rem;
            }
            .cr_p_a10 {
                color: var(--fg-main-hi-03);
                font-size: 1.25rem;
            }
    
            .cr_p_hr {
                border-color: var(--fg-trans);
                margin-top: 0.4rem;
                margin-bottom: 0.4rem;
            }
    
            .cr_p_a20 {
                color: var(--fg-dim);
                // color: var(--fg-main);
                font-size: 1rem;
            }
    
            .cr_p_a30 {
                color: var(--fg-main);
                // color: var(--fg-main-hi-02);
                font-size: 1rem;
            }
    
            .card_wf {
                width: 100%;
                display: flex;
                justify-content: center;
                margin-top: 2.5rem;
            }
    
            .card_wf span{
                font-size: 3rem;
                color: var(--fg-hi);
            }

            .card_l1 {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                flex-wrap: wrap;
            }
        `,
    },
    preset_finish_card: {
        card_front: `
            <div class="card_end_card" data="ef00">
            </div>
        `,
        card_back: `
            <div class="card_end_card" data="eb00">
            </div>
        `,
        style_css: `
            .card_end_card {
                color: var(--fg-main-inv);
                text-align: center;
                padding-top: 2.5rem;
                padding-bottom: 4.5rem;
            }
        `
    }
}
