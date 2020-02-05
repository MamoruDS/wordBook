import uuid, datetime, base64, json


class ReqTokenUndefined(Exception):
    pass


class ReqKeyUndefined(Exception):
    pass


class ReqKeyValueError(Exception):
    pass


class request:
    def __init__(self, flask_request):
        self.req = flask_request

    def param(self,
              key,
              optional=True,
              default=None,
              jsonStr=False,
              paramType=str):
        val = self.req.args.get(key)
        if (not optional) and (val is None):
            raise ReqKeyUndefined()
        elif (val is None):
            val = default
        if paramType is not None:
            try:
                if jsonStr:
                    val = json.loads(val)
                val = paramType(val)
            except (ValueError):
                raise ReqKeyValueError()
        return val

    def data(self, key, optional=True, default=None, paramType=str):
        try:
            val = self.req.get_json()[key]
        except (KeyError, TypeError):
            if optional:
                val = default
            else:
                raise ReqKeyUndefined()
        if paramType is not None:
            try:
                if type(paramType(val)) is bool:
                    if val in [1, '1', 'true', 'True', True]:
                        val = True
                    elif val in [0, '0', 'false', 'False', False]:
                        val = False
                    else:
                        raise ReqKeyValueError()
                else:
                    val = paramType(val)
            except (ValueError):
                raise ReqKeyValueError()
        return val


def getUID(typePrefix=''):
    return typePrefix + str(uuid.uuid4())


def getCurTS():
    d = datetime.datetime.now()
    epoch = datetime.datetime(1970, 1, 1)
    return round((d - epoch).total_seconds())


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


def logging(logType, msg):
    logbg = {'err': '[\33[31mERR\33[0m]'}
    print(f'{logbg[logType]} {msg}')


def getNextTS(lcId, level=0):
    return getUTCTS() + 86400
