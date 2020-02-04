import uuid, datetime, base64


def getUID(typePrefix=''):
    return typePrefix + str(uuid.uuid4())


def getUTCTS():
    d = datetime.datetime.utcnow()
    epoch = datetime.datetime(1970, 1, 1)
    return round((d - epoch).total_seconds())


def b64EncodeStr(rawStr):
    rawStr = str(rawStr).encode('utf-8')
    strEncode = base64.b64encode(rawStr)
    return str(strEncode, 'utf-8')


def b64DecodeStr(strEncode):
    strDecode = base64.b64decode(strEncode)
    return strDecode.decode('utf-8')


def getNextTS(level=0):
    return getUTCTS() + 86400
