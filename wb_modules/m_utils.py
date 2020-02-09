import uuid, datetime, base64, json, math


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


def getNextTS(lc, level, testRes=0):
    mem = 0.5
    dt = 0

    if testRes == 0:
        level = 1

    if lc == 'default' and level != 0:
        lv = levelMap(level)
        dt = (mem**-1)**(lv**-1)
        dt = math.floor(dt)
    return getUTCTS() + (dt * 60)


def levelMap(level):
    power = 1
    return (0.4054 * (level**-power)) + 0.0248

def getForgetTimePoint(level):
    mem = 0.5 # 0.5M
    lv = levelMap(level)
    return math.floor((mem**-1)**(lv**-1))

def getLearnProgress(lc, tr, history=[]):
    progress = {}
    # if lc == 'default':
    #     if (len(history) is 0) or (history[0][2] is 0):
    #         if (tr is 0) or (tr is 1):
    #             lv = 1
    #         elif tr is 2:
    #             lv = 4
    #         elif tr is 3:
    #             lv = 7
    #     elif history[0][2] is 1:
    #         if (tr is 0):
    #             lv = 
    # ts = getForgetTimePoint(lv)
    if tr is not -1:
        if len(history) is 0:
            lv = 0
        else:
            lv = history[0][2]
        if tr is 0:
            lv = 1
        elif tr is 1:
            lv = lv - 1
            if lv < 1:
                lv = 1
        elif tr is 2:
            lv = lv + 1
        elif tr is 3:
            lv = lv + 3
        ts = getForgetTimePoint(lv)
        progress['nextLv'] = lv
        progress['nextTS'] = getUTCTS() + (ts * 60)
        progress['dt'] = ts
    else:
        lv = -1
        progress['nextLv'] = lv
        progress['nextTS'] = getUTCTS()
        progress['dt'] = 0
    return progress