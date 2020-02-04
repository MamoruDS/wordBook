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
