import sqlite3

from . import m_utils, m_profile

DB_NAME = 'data.db'
TABLE_REC = 'card_records'
TABLE_REC_OBJ = {
    'bookId': None,
    'wordId': 'INTEGER',
    'lcId': 'TEXT',
    'level': 'INTEGER',
    'nextTS': 'INTEGER'
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
                if colNameB64E:
                    col = m_utils.b64EncodeStr(col)
                if colType not in SQL_TYPE:
                    colType = 'TEXT'
                if fields[col]['field_unique']:
                    cols.append('"{}" {} NOT NULL UNIQUE'.format(col, colType))
                else:
                    cols.append('"{}" {}'.format(col, colType))
            CONN.execute(queryStr.format(tableName, ', '.join(cols)))
            return True
        else:
            return False
