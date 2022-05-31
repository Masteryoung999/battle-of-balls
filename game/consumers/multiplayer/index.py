from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache

class MultiPlayer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = None

        for i in range(1000): # 最多一千个房间
            name = "room-%d" % (i)
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY: # 没有这个房间或者房间人数不足三人创建房间
                self.room_name = name
                break 
        if not self.room_name: # 房间不够了
            return
        
        await self.accept()  # 前端执行创建会调用这个函数
        
        if not cache.has_key(self.room_name): # 在redis中创建房间
            cache.set(self.room_name, [], 3600) # 有效期1小时

        for player in cache.get(self.room_name): 
            await self.send(text_data=json.dumps({ # 在建立玩家后，服务器向本地发送当前已有玩家信息，dumps将一个字典变成字符串
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
        players.append({ # 将当前玩家加到redis里
            'uuid': data['uuid'],
            'username': data['username'],
            'photo': data['photo'],
        })
        cache.set(self.room_name, players, 3600) # 更新redis，有效期一小时
        await self.channel_layer.group_send( # 群发
            self.room_name,
            {
                'type': "group_send_event", # 很重要, 将下面的消息发送给组内的所有人
                'event': "create_player",
                'uuid': data['uuid'],
                'username': data['username'],
                'photo': data['photo'],
            }
        )
    
    async def group_send_event(self, data): # 接收函数名与type关键字要一样
        await self.send(text_data=json.dumps(data)) # django自带的群发功能发给前端

    async def move_to(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "move_to",
                'uuid': data['uuid'],
                'tx': data['tx'],
                'ty': data['ty'],
            }
        )

    async def shoot_fireball(self, data): # 广播给所有前端窗口
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "shoot_fireball",
                'uuid': data['uuid'],
                'tx': data['tx'],
                'ty': data['ty'],
                'ball_uuid': data['ball_uuid'],
            }
        )

    async def attack(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "attack",
                'uuid': data['uuid'],
                'attackee_uuid': data['attackee_uuid'],
                'x': data['x'],
                'y': data['y'],
                'angle': data['angle'],
                'damage': data['damage'],
                'ball_uuid': data['ball_uuid'],
            }
        )

    async def blink(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "blink",
                'uuid': data['uuid'],
                'tx': data['tx'],
                'ty': data['ty'],
            }
        )

    async def message(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "message",
                'uuid': data['uuid'],
                'username': data['username'],
                'text': data['text'],
            }
        )

    async def receive(self, text_data): # 接收前端向后端发的请求
        data = json.loads(text_data)
        event = data['event'] 
        if event == "create_player": # 如果event等于player就创建玩家
            await self.create_player(data)
        elif event == "move_to":
            await self.move_to(data)
        elif event == "shoot_fireball":
            await self.shoot_fireball(data)
        elif event == "attack":
            await self.attack(data)
        elif event == "blink":
            await self.blink(data)
        elif event == "message":
            await self.message(data)