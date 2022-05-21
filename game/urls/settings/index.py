from django.urls import path
from game.views.settings.getinfo import getinfo
from game.views.settings.login import signin
from game.views.settings.logout import signout
from game.views.settings.register import register


urlpatterns = [
    path("getinfo/", getinfo, name="settings_getinfo"), # path(route(路径), view(函数), name(取名))
    path("login/", signin, name="settings_login"),
    path("logout/", signout, name="settings_logout"),
    path("register/", register, name="settings_register"),
]
