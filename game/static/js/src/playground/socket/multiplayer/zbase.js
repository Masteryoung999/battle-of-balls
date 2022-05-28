class MultiplayerSocket {
    constructor(playground) {
        this.playground = playground;  //  需要与其它元素产生关联

        this.ws = new WebSocket("wss://app2444.acapp.acwing.com.cn/wss/multiplayer/");  //  创建wss链接
        //  记住这个语法, 地址必须与routing.py里的地址完全一致
        this.start();
    }

    start() {
        this.receive();
    }

    receive() {  //  接收后端来的信息
        let outer = this;
        this.ws.onmessage = function(e) {  //  调用api
            let data = JSON.parse(e.data);  //  将字典变成字符串
            let uuid = data.uuid;
            if (uuid === outer.uuid) return false;
            let event = data.event;
            if (event === "create_player") {
                outer.receive_create_player(uuid, data.username, data.photo);
            }
        };
    }

    send_create_player(username, photo)  {
        let outer = this;
        this.ws.send(JSON.stringify({ //  向后端发送字符串，将JSON变成字符串
            'event': "create_player",
            'uuid': outer.uuid,
            'username': username,
            'photo': photo,
        }));
    }
    receive_create_player(uuid, username, photo) {
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.15,
            "enemy",
            username,
            photo,
        );

        player.uuid = uuid;
        this.playground.players.push(player);
    }
}