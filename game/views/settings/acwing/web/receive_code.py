from django.shortcuts import redirect
from django.core.cache import cache
import requests # 请求链接的包
from django.contrib.auth.models import User
from game.models.player.player import Player
from django.contrib.auth import login
from random import randint

def receive_code(request):
    data = request.GET
    code = data.get('code')  # 取出来
    state = data.get('state') # 取出来
    

    if not cache.has_key(state): # 如果cache里面不存在state(遭受到了攻击或者用户2小时都不点同意)
        return redirect("index") # 直接返回登录界面

    cache.delete(state) # 一旦验证成功删掉state

    # 接下来通过code去acwing申请令牌
    apply_access_token_url = "https://www.acwing.com/third_party/api/oauth2/access_token/" # 申请access_token的链接存下来
    params = {
        'appid': "2444",
        'secret': "c53e74bdfafa46fd89ac0173774e2cd2",
        'code': code    # 第一步中获取的授权码
    }

    access_token_res = requests.get(apply_access_token_url, params=params).json() # 通过get方法访问因此调用的是get函数, 并变成json字典

    access_token = access_token_res['access_token']
    openid = access_token_res['openid']

    players = Player.objects.filter(openid=openid)
    if players.exists(): # 如果该用户已存在, 则无需重新获取信息, 直接登录即可
        login(request, players[0].user)
        return redirect("index") # 重定向到主页

    get_userinfo_url = "https://www.acwing.com/third_party/api/meta/identity/getinfo/"
    params = {
        "access_token": access_token,
        "openid": openid,
    }

    userinfo_res = requests.get(get_userinfo_url, params=params).json()
    username = userinfo_res['username'] # 取出来username
    photo = userinfo_res['photo'] # 取出来photo链接

    while User.objects.filter(username=username).exists(): # 用户名重复
        username += str(randint(0, 9))

    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, photo=photo, openid=openid)

    login(request, user)
    return redirect("index")
