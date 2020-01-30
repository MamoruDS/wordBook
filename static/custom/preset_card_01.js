temp_card_render = {
    card_front_html: `
        <div class="card_l1">
            <div class="cr_p_a00" data="a00"> </div>
            <div class="cr_p_a01" data="a01"> </div>
        </div>
        <div class="cr_p_a10" data="a10"> </div>
        <hr class="cr_p_hr" />
        <div class="cr_p_a20" data="a20"> </div>
        <div class="cr_p_a30" data="a30"> </div>
    `,
    card_back_html: `
        <div class="card_wf">
            <span data="a00"> </span>
        </div>
    `,
    card_css: `
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
            font-size: 1rem;
        }

        .cr_p_a30 {
            color: var(--fg-main);
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
    `,
}
