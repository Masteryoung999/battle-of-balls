from django.http import JsonResponse # 每次返回的都是JsonResponse
from game.models.player.player import Player # 引入game/models/player/player.py的Player类


def getinfo_acapp(request):  # 处理acapp端的请求(每个处理请求的函数都需要request参数)
    player = Player.objects.all()[0] # 为了方便调试, 取出第一名玩家的信息
    return JsonResponse({ # JsonResponse返回一个字典
        'result': "success",
        'username': player.user.username,
        'photo': player.photo,
    })


def getinfo_web(request):  # 处理web端的请求
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({
            'result': "未登录"
        })
    else:
        player = Player.objects.all()[0]
        return JsonResponse({
            'result': "success",
            'username': player.user.username ,
            'photo': player.photo,
    })


def getinfo(request):
    platform = request.GET.get('platform') # 判断是哪个平台发过来的请求
    if platform == "ACAPP":
        return getinfo_acapp(request) # 返回执行getinfo_acapp(request)函数的结果
    elif platform == "WEB":
        return getinfo_web(request) # 返回执行getinfo_web(request)函数的结果