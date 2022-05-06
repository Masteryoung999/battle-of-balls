from django.http import HttpResponse


def index(request):
    line1 = '<h1 style="text-align: center">Master Young</h1>'
    line2 = '<img src="https://pic.rmb.bdstatic.com/1530971282b420d77bdfb6444d854f952fe31f0d1e.jpeg" width=1500>'
    line3 = '<hr>'
    return HttpResponse(line1 + line3 + line2)
def play(request):
    line1 = '<h1 style = "text-align: center">游戏界面<h1>'

    line2 = '<img src="https://pic.rmb.bdstatic.com/1530971282b420d77bdfb6444d854f952fe31f0d1e.jpeg" width=1500>'
    return HttpResponse(line1 + line2)
