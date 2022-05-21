# 每次注册完之后都要在/acapp下运行两个命令
# python3 manage.py makemigrations
# python3 manage.py migrate

from django.contrib import admin
from game.models.player.player import Player # 把player表注册到管理员后台界面
# 引入game/models/player/player.py的Player类

# Register your models here.
admin.site.register(Player) # 注册Player
