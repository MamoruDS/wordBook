import os, json, sys

from . import m_utils

PROFILE_FILE = 'profile.json'


def getConf():
    conf = {'books': {}}
    try:
        with open(PROFILE_FILE) as json_file:
            conf = json.load(json_file)
    except FileNotFoundError:
        pass
    except json.decoder.JSONDecodeError:
        m_utils.logging('err','conf file damaged')
        sys.exit()
    return conf


def setConf(data):
    with open(PROFILE_FILE, 'w') as profile:
        json.dump(data, profile, sort_keys=True, indent=4)


def confGetBook(bookId=None):
    conf = getConf()
    data = []
    try:
        if bookId is not None:
            data.append(conf['books'][bookId])
            data[0]['book_id'] = bookId
        else:
            for bid in conf['books']:
                bookInfo = conf['books'][bid]
                bookInfo['book_id'] = bid
                data.append(bookInfo)
    except KeyError:
        data = []
    return data


def confAddBook(book_name,
                book_fields,
                book_cover_url="cover.png",
                word_render = {
                    'alias': [],
                    'render': 'preset_render',
                    'render_style': 'preset_card_01'
                }):
    conf = getConf()
    bookId = m_utils.getUID('B-')
    conf['books'][bookId] = {
        'book_name': book_name,
        'book_fields': book_fields,
        'book_cover_url': book_cover_url,
        'word_render': word_render
    }
    setConf(conf)
    return bookId
