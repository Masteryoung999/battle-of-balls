# 存储player数据表的信息
# 要显示到后台管理员界面还需要注册到admin.py

from django.db import models # Class Player继承自基类models
from django.contrib.auth.models import User 
# Users within the Django authentication system are represented by this model.
# Username and password are required. Other fields are optional.

class Player(models.Model): # 每一个定义的class都需要继承自models这个类
    user = models.OneToOneField(User, on_delete=models.CASCADE) # (player与user建立一一对应的关联)user被删除的时候和它关联的player会被一起删掉
    #CASCADE数据库学过
    photo = models.URLField(max_length=256, blank=True) # 存储头像链接(最大长度256, 可以为空)

    # 还可以添加其他信息, 例如性别年龄手机号等
    # 具体需要用到什么函数参数可能需要查
    openid = models.CharField(default="", max_length=50, blank=True, null=True) # openid是字符串(默认为空，最大长度50，可以为空)
    score = models.IntegerField(default=1500)
    
    def __str__(self):
        return str(self.user) # 显示用户的用户名
