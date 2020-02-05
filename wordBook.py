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


@app.route('/testpage')
def page_test():
    return app.send_static_file('pages/test.html')


@app.route('/api/book', methods=['GET'])
def getBook():
    req = m_utils.request(request)
    status = 200
    try:
        data = m_profile.confGetBook(
            req.param('book_id', optional=True, default=None, paramType=str))
    except:
        data = {}
        status = 400
    return app.response_class(status=status,
                              response=json.dumps(data),
                              mimetype='application/json')


@app.route('/api/book', methods=['POST'])
def addBook():
    req = m_utils.request(request)
    status = 200
    try:
        bookId = m_profile.confAddBook(
            req.data('book_name', optional=False),
            req.data('book_fields', optional=False, paramType=dict),
            req.data('book_cover_url', optional=True, default='example.png'),
            req.data('book_wordrender',
                     optional=True,
                     default='preset_card_01'),
            req.data('book_web_render', optional=True, default='default'))
        m_db.addBook(bookId)
        data = {'book_id': bookId}
    except:
        data = {}
        status = 400
    return app.response_class(status=status,
                              response=json.dumps(data),
                              mimetype='application/json')


@app.route('/api/word', methods=['GET'])
def getWord():
    req = m_utils.request(request)
    status = 200
    try:
        data = m_db.getWord(req.param('book_id', optional=False),
                            req.param('word_id', optional=True))
    except:
        data = {}
        status = 400
    return app.response_class(status=status,
                              response=json.dumps(data),
                              mimetype='application/json')


@app.route('/api/word', methods=['POST'])
def addWord():
    req = m_utils.request(request)
    status = 200
    try:
        wordId = m_db.addWord(req.param('book_id', optional=False),
                              m_utils.getUID('W-'),
                              req.data('word_fields',
                                       optional=False,
                                       paramType=dict),
                              colNameB64E=True)
        data = {'word_id', wordId}
    except:
        data = {}
        status = 400
    return app.response_class(status=status,
                              response=json.dumps(data),
                              mimetype='application/json')


@app.route('/api/rec', methods=['GET'])
def getRec():
    req = m_utils.request(request)
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
        words = []
        for rec in recs:
            word = {}
            wordInfo = m_db.getWord(rec[1], rec[2])
            for i in range(len(wordInfo[0])):
                word[wordInfo[0][i]] = wordInfo[1][i]
            words.append(word)
        data = words
    except:
        data = {}
        status = 400
    return app.response_class(status=status,
                              response=json.dumps(data).encode('utf-8'),
                              mimetype='application/json')


if __name__ == "__main__":
    print('--- program start ---')
    app.run(host='0.0.0.0', port=80)
