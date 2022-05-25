from django.urls import path, include # 引入路由要在这里加一个include
from game.views.settings.getinfo import getinfo
from game.views.settings.login import signin
from game.views.settings.logout import signout
from game.views.settings.register import register


urlpatterns = [
    path("getinfo/", getinfo, name="settings_getinfo"), # path(route(路径), view(函数), name(取名))
    path("login/", signin, name="settings_login"),
    path("logout/", signout, name="settings_logout"),
    path("register/", register, name="settings_register"),
    path("acwing/", include("game.urls.settings.acwing.index")), # 引入路由，把~/acapp/game/urls/settings/acwing的index里的路由引入总的路由
]
