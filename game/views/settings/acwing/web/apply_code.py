from django.http import JsonResponse
from urllib.parse import quote #重新编码换掉特殊字符
from random import randint
from django.core.cache import cache

def get_state(): # 生成长度为8位的随机数
    res = ""
    for i in range(8):
        res += str(randint(0, 9))
    return res

def apply_code(request):
    appid = "2444"
    redirect_uri = quote("https://app2444.acapp.acwing.com.cn/settings/acwing/web/receive_code")
    scope = "userinfo"
    state = get_state()
    apply_code_url = "https://www.acwing.com/third_party/api/oauth2/web/authorize/"

    cache.set(state, True, 7200)  #  有效期两小时
    return JsonResponse({ # 向前端返回拼装后的url
        'result': "success",
        'apply_code_url': apply_code_url + "?appid=%s&redirect_uri=%s&scope=%s&state=%s" % (appid, redirect_uri, scope, state), # 手动拼装url，参数用&隔开
    })