import os, json

from . import m_utils

PROFILE_FILE = 'profile.json'


def getConf():
    if os.path.isfile(PROFILE_FILE):
        with open(PROFILE_FILE) as json_file:
            conf = json.load(json_file)
    else:
        conf = {'books': {}}
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
                book_wordrender="preset_card_01",
                book_web_render="default"):
    conf = getConf()
    bookId = m_utils.getUID('B-')
    conf['books'][bookId] = {
        'book_name': book_name,
        'book_fields': book_fields,
        'book_cover_url': book_cover_url,
        'book_wordrender': book_wordrender,
        'book_web_render': book_web_render
    }
    setConf(conf)
    return bookId
