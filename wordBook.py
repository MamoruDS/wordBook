import json

from flask import Flask, request
app = Flask(__name__, static_url_path='/static')

from wb_modules import m_db, m_profile, m_utils


@app.route('/')
def index():
    return 'Index Page'


@app.route('/books')
def page_books():
    return app.send_static_file('pages/books.html')


@app.route('/card')
def page_card():
    return app.send_static_file('pages/card.html')


@app.route('/testpage')
def page_test():
    return app.send_static_file('pages/test.html')


@app.route('/api/book', methods=['GET'])
def getBook():
    req = m_utils.request(request)
    data = {'err': False}
    status = 200
    try:
        data['data'] = m_profile.confGetBook(
            req.param('book_id', optional=True, default=None, paramType=None))
    except:
        data = {'err': True}
        status = 400
    return app.response_class(status=status,
                              response=json.dumps(data),
                              mimetype='application/json')


@app.route('/api/book', methods=['POST'])
def addBook():
    req = m_utils.request(request)
    data = {'err': False}
    status = 200
    try:
        bookId = m_profile.confAddBook(
            req.data('book_name', optional=False),
            req.data('book_fields', optional=False, paramType=dict),
            req.data('book_cover_url', optional=True, default='example.png'),
            req.data('word_render', optional=False))
        m_db.addBook(bookId)
        data['data'] = {'book_id': bookId}
    except:
        data = {'err': True}
        status = 400
    return app.response_class(status=status,
                              response=json.dumps(data),
                              mimetype='application/json')


@app.route('/api/word', methods=['GET'])
def getWord():
    req = m_utils.request(request)
    data = {'err': False}
    status = 200
    try:
        data['data'] = m_db.getWord(req.param('book_id', optional=False),
                                    req.param('word_id', optional=True))
    except:
        data = {'err': True}
        status = 400
    return app.response_class(status=status,
                              response=json.dumps(data),
                              mimetype='application/json')


@app.route('/api/word', methods=['POST'])
def addWord():
    req = m_utils.request(request)
    data = {'err': False}
    status = 200
    try:
        wordId = m_db.addWord(req.param('book_id', optional=False),
                              m_utils.getUID('W-'),
                              req.data('word_fields',
                                       optional=False,
                                       paramType=dict),
                              colNameB64E=True)
        data['data'] = {'word_id', wordId}
    except:
        data = {'err': True}
        status = 400
    return app.response_class(status=status,
                              response=json.dumps(data),
                              mimetype='application/json')


@app.route('/api/record', methods=['POST'])
def addRec():
    req = m_utils.request(request)
    data = {'err': False}
    status = 200
    try:
        recHistory = m_db.getRecHistory(req.param('book_id', optional=False),
                                        req.param('word_id', optional=False))
        progress = m_utils.getLearnProgress(
            'default', req.data('tr', optional=False, paramType=int),
            recHistory)
        m_db.addRec(req.param('book_id', optional=False),
                    req.param('word_id',
                              optional=False), 'default', progress['nextLv'],
                    (progress['dt'] * 60) + m_utils.getUTCTS())
    except:
        data['err'] = True
        status = 400
    return app.response_class(status=status,
                              response=json.dumps(data).encode('utf-8'),
                              mimetype='application/json')


@app.route('/api/progress', methods=['GET'])
def getProgress():
    req = m_utils.request(request)
    data = {'err': False}
    status = 200
    try:
        recHistory = m_db.getRecHistory(req.param('book_id', optional=False),
                                        req.param('word_id', optional=False))
        lc = 'default'
        data['data'] = {
            'tr0': m_utils.getLearnProgress(lc, 0, recHistory),
            'tr1': m_utils.getLearnProgress(lc, 1, recHistory),
            'tr2': m_utils.getLearnProgress(lc, 2, recHistory),
            'tr3': m_utils.getLearnProgress(lc, 3, recHistory)
        }
    except:
        data['err'] = True
        status = 400
    return app.response_class(status=status,
                              response=json.dumps(data).encode('utf-8'),
                              mimetype='application/json')


@app.route('/api/recordValid', methods=['GET'])
def getRecValid():
    req = m_utils.request(request)
    data = {'err': False}
    status = 200
    try:
        recs = m_db.getRecValid(
            req.param('book_ids', optional=False, jsonStr=True,
                      paramType=list),
            req.param('cnt', optional=True, default=5, paramType=int),
            req.param('valid_ts',
                      optional=True,
                      default=m_utils.getUTCTS(),
                      paramType=int),
            req.param('lv', optional=True, default=1, paramType=int),
        )
        wordRecs = []
        for rec in recs['data']:
            wordRec = {'word': {'fields': {}}}
            wordRec['rec_id'] = rec[recs['colIndex'].index('rec_id')]
            wordRec['lc'] = rec[recs['colIndex'].index('lc')]
            wordRec['lv'] = rec[recs['colIndex'].index('lv')]
            wordRec['next_ts'] = rec[recs['colIndex'].index('next_ts')]
            wordRec['word']['book_id'] = rec[recs['colIndex'].index('book_id')]
            wordRec['word']['word_id'] = rec[recs['colIndex'].index('word_id')]
            wordInfo = m_db.getWord(rec[1], rec[2])
            for i in range(len(wordInfo[0])):
                wordRec['word']['fields'][wordInfo[0][i]] = wordInfo[1][i]
            wordRecs.append(wordRec)
        data['data'] = wordRecs
    except:
        data['err'] = True
        status = 400
    return app.response_class(status=status,
                              response=json.dumps(data).encode('utf-8'),
                              mimetype='application/json')


if __name__ == "__main__":
    print('--- program start ---')
    app.run(host='0.0.0.0', port=80)
