import sqlite3

from . import m_utils, m_profile

DB_NAME = 'data.db'
TABLE_REC = 'card_records'
TABLE_REC_OBJ = {
    'book_id': {
        'db_type': 'TEXT',
        'field_unique': False
    },
    'word_id': {
        'db_type': 'INTEGER',
        'field_unique': False
    },
    'lc': {
        'db_type': 'INTEGER',
        'field_unique': False
    },
    'lv': {
        'db_type': 'INTEGER',
        'field_unique': False
    },
    'next_ts': {
        'db_type': 'INTEGER',
        'field_unique': False
    },
    'add_ts': {
        'db_type': 'INTEGER',
        'field_unique': False
    }
}
SQL_TYPE = set(['NULL', 'INTEGER', 'REAL', 'TEXT', 'BLOB'])

CONN = sqlite3.connect(DB_NAME, check_same_thread=False)


def tableCheck(tableName, fields, create=True, colNameB64E=True):
    c = CONN.execute(
        '''
            SELECT * FROM sqlite_master
            WHERE type="table" AND name=?
        ''', (tableName, ))
    c = c.fetchone()
    if c is not None:
        return True
    else:
        if create:
            cols = []
            for col in fields.keys():
                colType = fields[col]['db_type']
                unique = fields[col]['field_unique']
                if colNameB64E:
                    col = m_utils.b64EncodeStr(col)
                if colType not in SQL_TYPE:
                    colType = 'TEXT'
                if unique:
                    cols.append(f'"{col}" {colType} NOT NULL UNIQUE')
                else:
                    cols.append(f'"{col}" {colType}')
            CONN.execute(f'''
                    CREATE TABLE "{tableName}"
                    ({', '.join(cols)})
            ''')
            return True
        else:
            return False


def recTableCheck():
    tableCheck(TABLE_REC, TABLE_REC_OBJ, True, False)
    return


def addBook(bookId):
    book = m_profile.confGetBook(bookId)
    fields = book[0]['book_fields']
    fields['word_id'] = {
        'db_type': 'TEXT',
        'field_unique': True,
        'field_render_tag': 'text'
    }
    tableCheck(bookId, fields)
    return


def addWord(bookId, wordId, wordObj, colNameB64E=True):
    cols, values = [[], []]
    wordObj['word_id'] = wordId
    for col in wordObj.keys():
        if colNameB64E:
            cols.append(f'"{m_utils.b64EncodeStr(col)}"')
        values.append(str(wordObj[col]))
    valueReplace = []
    for i in range(len(values)):
        valueReplace.append('?')
    queryStr = '''
            INSERT INTO "{}"
                ({})
            VALUES
                ({})
    '''.format(bookId, ','.join(cols), ','.join(valueReplace))
    cur = CONN.cursor()
    try:
        cur.execute(queryStr, tuple(values))
        CONN.commit()
        addRec(bookId, wordId, 'default', 0, m_utils.getUTCTS())
    finally:
        return wordId


def getWord(bookId, wordId=None, colNameB64E=True):
    if wordId is not None:
        wordId = f'WHERE "d29yZF9pZA=="="{wordId}"'
    else:
        wordId = ''
    res = CONN.execute(f'SELECT * FROM "{bookId}" {wordId}')
    if colNameB64E:
        colh = list(map(lambda x: m_utils.b64DecodeStr(x[0]), res.description))
    else:
        colh = list(map(lambda x: x[0], res.description))
    data = [colh]
    rows = res.fetchall()
    for row in rows:
        data.append(list(row))
    return data


def addRec(bookId, wordId, lc, lv, nextTS):
    queryStr = f'''
            INSERT INTO {TABLE_REC}
                (book_id, word_id, lc, lv, next_ts, add_ts)
            VALUES
                (?,?,?,?,?,?)
    '''
    CONN.execute(queryStr,
                 (bookId, wordId, lc, lv, nextTS, m_utils.getUTCTS()))
    CONN.commit()
    return


def getRec(bookId, wordId):
    colIndex = ['rec_id', 'lc', 'lv', 'next_ts', 'add_ts']
    queryStr = f'''
        SELECT rowid AS rec_id, lc, lv, next_ts, add_ts
        FROM "card_records"
        WHERE
                "book_id"="{bookId}"
            AND "word_id"="{wordId}"
        ORDER BY next_ts DESC
    '''
    res = CONN.execute(queryStr)
    return {'data': res.fetchall(), 'colIndex': colIndex}


def getRecHistory(bookId, wordId):
    queryStr = f'''
        SELECT rowid AS rec_id, lc, lv, next_ts, add_ts
        FROM "card_records"
        WHERE
                "book_id"="{bookId}"
            AND "word_id"="{wordId}"
        ORDER BY next_ts DESC
    '''
    res = CONN.execute(queryStr)
    return res.fetchall()


def getRecValid(bookIds, reqCnt, validTS, validLv=1):
    colIndex = ['rec_id', 'book_id', 'word_id', 'lc', 'lv', 'next_ts']
    bookFilter = []
    if validLv == 1:
        validLv = '> 0'
    elif validLv > 2:
        validLv = '>= 0'
    else:
        validLv = f'= {str(validLv)}'
    for bookId in bookIds:
        bookFilter.append(f'book_id = "{bookId}"')

    queryStr = f'''
            SELECT {', '.join(colIndex)} FROM (
                SELECT rank()
                OVER(PARTITION BY book_id, word_id ORDER BY next_ts DESC) AS rk, rowid AS "rec_id", *
                FROM "{TABLE_REC}"
            ) 
            WHERE
                    (rk = 1)
                AND ({' OR '.join(bookFilter)})
                AND (next_ts < {validTS})
                AND (lv {validLv})
            ORDER BY next_ts DESC 
    '''
    recValid = CONN.execute(queryStr)
    return {'data': recValid.fetchall()[:reqCnt], 'colIndex': colIndex}
