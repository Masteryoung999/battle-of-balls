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
            } else if (event === "move_to") {
                outer.receive_move_to(uuid, data.tx, data.ty);
            } else if (event === "shoot_fireball") {
                outer.receive_shoot_fireball(uuid, data.tx, data.ty, data.ball_uuid);
            } else if (event === "attack") {
                outer.receive_attack(uuid, data.attackee_uuid, data.x, data.y, data.angle, data.damage, data.ball_uuid);
            } else if (event === "blink") {
                outer.receive_blink(uuid, data.tx, data.ty);
            } else if (event === "message") {
                outer.receive_message(data.username, data.text);
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

    get_player(uuid) {  //  通过对应的uuid找到player
        let players = this.playground.players;
        for(let i = 0; i < players.length; i ++) {
            let player = players[i];
            if(player.uuid === uuid)
            return player;
        }

        return null;
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

    send_move_to(tx, ty) { //  当前窗口发送给服务器
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "move_to",
            'uuid': outer.uuid, //  发出指令的人
            'tx': tx,  //  目标地点的纵坐标
            'ty': ty,  //  目标地点的横坐标
        }));
    }

    receive_move_to(uuid, tx, ty) {  //  所有窗口接收来自服务器的信息
        let player = this.get_player(uuid);

        if(player) {  //  如果这个玩家还存在的话
            player.move_to(tx, ty);
        }
    }

    send_shoot_fireball(tx, ty, ball_uuid){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "shoot_fireball",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
            'ball_uuid': ball_uuid,
        }));
    }

    receive_shoot_fireball(uuid, tx, ty, ball_uuid) {
        let player = this.get_player(uuid);
        if(player) {
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uuid = ball_uuid;
        }
    }

    send_attack(attackee_uuid, x, y, angle, damage, ball_uuid) {  //  被攻击者的位置(x ,y)每个窗口同步这个位置
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "attack",
            'uuid': outer.uuid,
            'attackee_uuid': attackee_uuid,
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'ball_uuid': ball_uuid,
        }));
    }

    receive_attack(uuid, attackee_uuid, x, y, angle, damage, ball_uuid) {
        let attacker = this.get_player(uuid);
        let attackee = this.get_player(attackee_uuid);
        if(attacker && attackee) {  //  如果攻击者和被攻击的人都还活着的话
            attackee.receive_attack(x, y, angle, damage, ball_uuid, attacker);
        }
    }


    send_blink(tx, ty) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "blink",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,

        }));
    }

    receive_blink(uuid, tx, ty) {
        let player = this.get_player(uuid);
        if(player) {
            player.blink(tx, ty);
        }
    }

    send_message(username, text) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "message",
            'username': username,
            'uuid': outer.uuid,
            'text': text,
        }));
    }

    receive_message(username, text) {

        this.playground.chat_field.add_message(username, text);
    }
}