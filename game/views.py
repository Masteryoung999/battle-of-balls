from django.http import HttpResponse


def index(request):
    line1 = '<h1 style="text-align: center">Master Young</h1>'
    line2 = '<img src="https://pic.rmb.bdstatic.com/1530971282b420d77bdfb6444d854f952fe31f0d1e.jpeg" width=1500>'
    line3 = '<hr>'
    line4 = '<a href = "/play/">进入游戏界面</a>'
    return HttpResponse(line1 + line4 + line3 + line2)
def play(request):
    line1 = '<h1 style = "text-align: center">游戏界面<h1>'

    line2 = '<img src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fwallpaperm.cmcm.com%2F04d87401629cc049d3ef0f5700ceca8a.jpg&refer=http%3A%2F%2Fwallpaperm.cmcm.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1654390142&t=075c36f008208a45c2708f37c45860a0" width=1500>'

    line3 = '<a href = "/">返回主页面</a>'
    return HttpResponse(line1 + line3 +line2)
