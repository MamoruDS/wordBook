import json

from flask import Flask, request
app = Flask(__name__, static_url_path='/static')

from wbpkg import m_db, m_profile, m_utils


@app.route('/')
def index():
    return 'Index Page'


@app.route('/books')
def page_books():
    return app.send_static_file('pages/books.html')


@app.route('/api/books', methods=['GET'])
def getBooks():
    paramBookId = request.args.get('bid', default=None, type=str)
    print('paramBookId: {}'.format(paramBookId))
    dbres = m_profile.confGetBook(paramBookId)
    res = app.response_class(response=json.dumps(dbres),
                             status=200,
                             mimetype='application/json')
    return res


@app.route('/api/books', methods=['POST'])
def addBook():
    paramBookName = request.args.get('bname', default=None, type=str)
    paramBookFields = request.args.get('bfields', default=None, type=str)
    bookfields = json.loads(paramBookFields)
    print(bookfields)
    m_profile.confAddBook(paramBookName, bookfields)
    res = app.response_class(status=200)
    return res


@app.route('/api/words', methods=['GET'])
def getWord():
    paramBookId = request.args.get('bid', default=None, type=str)
    dbRes = m_db.dbGetWord(paramBookId)
    res = app.response_class(response=json.dumps(dbRes),
                             status=200,
                             mimetype='application/json')
    return res


@app.route('/api/words', methods=['POST'])
def addWord():
    paramBookId = request.args.get('bid', default=None, type=str)
    paramWordFields = request.args.get('wfields', default=None, type=str)
    # TODO: check words fields
    # bookInfo = m_profile.confGetBook(paramBookId)
    # bookFields = set(bookInfo['fields'])
    # for col in wordFields.keys():
    # if col in bookFields:
    wordFields = json.loads(paramWordFields)
    wordId = m_db.dbAddWord(paramBookId, wordFields)
    res = app.response_class(response=json.dumps({'wordId': wordId}),
                             status=200,
                             mimetype='application/json')
    return res


@app.route('/api/words/leftwords')
def getLeftwords():
    paramBookList = request.args.get('bids')
    paramCounts = request.args.get('c', type=int)
    dbres = m_db.getLeftWords(eval(paramBookList),
                              paramCounts,
                              m_utils.getUTCTS(),
                              b64d=False)
    res = app.response_class(response=json.dumps(dbres),
                             status=200,
                             mimetype='application/json')
    return res


if __name__ == "__main__":
    print('--- program start ---')
    app.run(host='0.0.0.0', port=80)
