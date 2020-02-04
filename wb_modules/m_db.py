import sqlite3

from . import m_utils, m_profile

DB_NAME = 'data.db'
TABLE_REC = 'card_records'
TABLE_REC_OBJ = {
    'bookId': {
        'db_type': 'TEXT',
        'field_unique': False
    },
    'wordId': {
        'db_type': 'INTEGER',
        'field_unique': False
    },
    'lcId': {
        'db_type': 'INTEGER',
        'field_unique': False
    },
    'level': {
        'db_type': 'INTEGER',
        'field_unique': False
    },
    'nextTS': {
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
            queryStr = '''
                    CREATE TABLE "{}"
                    ({})
            '''
            cols = []
            for col in fields.keys():
                colType = fields[col]['db_type']
                unique = fields[col]['field_unique']
                if colNameB64E:
                    col = m_utils.b64EncodeStr(col)
                if colType not in SQL_TYPE:
                    colType = 'TEXT'
                if unique:
                    cols.append('"{}" {} NOT NULL UNIQUE'.format(col, colType))
                else:
                    cols.append('"{}" {}'.format(col, colType))
            CONN.execute(queryStr.format(tableName, ', '.join(cols)))
            return True
        else:
            return False


def recTableCheck():
    tableCheck('card_records', TABLE_REC_OBJ, True, False)


def addBook(bookId):
    book = m_profile.confGetBook(bookId)
    fields = book[0]['book_fields']
    fields['word_id'] = {
        'db_type': 'TEXT',
        'field_unique': True,
        'field_render_tag': 'text'
    }
    tableCheck(bookId, fields)


def addWord(bookId, wordId, wordObj, colNameB64E=True):
    cols, values = [[], []]
    wordObj['word_id'] = wordId
    for col in wordObj.keys():
        if colNameB64E:
            cols.append('"{}"'.format(m_utils.b64EncodeStr(col)))
        values.append('"{}"'.format(wordObj[col]))
    queryStr = '''
            INSERT INTO "{}" ({})
            VALUES
                ({})
    '''.format(bookId, ','.join(cols), ','.join(values))
    cur = CONN.cursor()
    print(queryStr)
    cur.execute(queryStr)
    CONN.commit()
    wordId = cur.lastrowid
    # addRec(bookId, wordId)
    return wordId


def getWord(bookId, wordId=None, colNameB64E=True):
    if wordId is not None:
        wordId = 'WHERE "d29yZF9pZA=="="{}"'.format(wordId)
    else:
        wordId = ''
    res = CONN.execute('''
            SELECT * FROM "{}" {}
    '''.format(bookId, wordId))
    if colNameB64E:
        colh = list(map(lambda x: m_utils.b64DecodeStr(x[0]), res.description))
    else:
        colh = list(map(lambda x: x[0], res.description))
    data = [colh]
    rows = res.fetchall()
    for row in rows:
        data.append(list(row))
    return data
