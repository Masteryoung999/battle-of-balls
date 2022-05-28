from django.urls import path
from game.consumers.multiplayer.index import MultiPlayer # 把后端处理数据的函数引入进来

websocket_urlpatterns = [
    path("wss/multiplayer/", MultiPlayer.as_asgi(), name="wss_multiplayer"), # class变成一个函数的形式，语法背过
    
]