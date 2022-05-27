from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache

class MultiPlayer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = None

        for i in range(1000):
            name = "room-%d" % (i)
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
                self.room_name = name
                break
        if not self.room_name: # 房间不够了
            return
        
        await self.accept()  # 前端执行创建会调用这个函数
        
        if not cache.has_key(self.room_name):
            cache.set(self.room_name, [], 3600) # 有效期1小时

        for player in cache.get(self.room_name):
            await self.send(text_data=json.dumps({ # 将一个字典变成字符串
                'event': "create_player",
                'uuid': player['uuid'],
                'username': player['username'],
                'photo': player['photo'],
            }))

        await self.channel_layer.group_add(self.room_name, self.channel_name) # 将当前连接放到一个组里面
        # 组有一些群发的函数

    async def disconnect(self, close_code): # 前端断开连接的时候就会调用这个函数
        print('disconnect')
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def create_player(self, data):
        players = cache.get(self.room_name)
        players.append({
            'uuid': data['uuid'],
            'username': data['username'],
            'photo': data['photo'],
        })
        cache.set(self.room_name, players, 3600) # 有效期一小时
        await self.channel_layer.group_send( # 群发
            self.room_name,
            {
                'type': "group_create_player", # 很重要, 将这个消息发送给组内的所有人
                'event': "create_player",
                'uuid': data['uuid'],
                'username': data['username'],
                'photo': data['photo'],
            }
        )
    
    async def group_create_player(self, data):
        await self.send(text_data=json.dumps(data))

    async def receive(self, text_data): # 接收前端向后端发的请求
        data = json.loads(text_data)
        event = data['event'] 
        if event == "create_player":
            await self.create_player(data)