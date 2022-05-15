class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, is_me) {
        super();
        this.playground  = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;  // 横坐标
        this.y = y;  //  纵坐标
        this.vx = 0;  //  沿着x轴的速度
        this.vy = 0;  //  沿着y轴的速度
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;  //  被击中后退的速度
        this.friction = 0.9;  //  被击中后的摩擦力使后退的速度越来越慢
        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.eps = 0.1;
        this.spent_time = 0;

        this.cur_skill = null;

    }

    start() {
        if(this.is_me) {
            this.add_listening_events();
        } else {
            let tx = Math.random() * this.playground.width;  //  random函数返回0-1之间的随机值
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
        }
    }
    add_listening_events() { //监听函数
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function() {
            return false;  //禁掉鼠标右键触发菜单
        });
        this.playground.game_map.$canvas.mousedown(function(e) {
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if(e.which === 3) { // 右键
                outer.move_to(e.clientX - rect.left, e.clientY - rect.top);
            } 
            else if (e.which === 1) {
                if(outer.cur_skill === "fireball") {
                    outer.shoot_fireball(e.clientX - rect.left, e.clientY - rect.top);
                }
                outer.cur_skill = null;
            }
        });

        $(window).keydown(function(e) {
            if(e.which === 81 && outer.radius > 10) { // q键
                outer.cur_skill = "fireball";
                return false;
            }
        });
        // for(let i = 0; i < this.playground.players.length; i ++) {
        //     for(let i = 0; i < this.playground.players.length; i ++) {
        //         let player = this.playground.players[i];
        //         if(this.player !== player && this.annex(player)) {
        //             this.merge(player);
        //         }
        //     }
        // }
    }

    shoot_fireball(tx, ty) {
        let x = this.x, y = this.y;
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let speed = this.playground.height * 0.5;
        let move_length = this.playground.height * 1;
        new Fireball(this.playground, this, x, y, radius, vx, vy, this.color, speed, move_length, this.playground.height * 0.005);
    }

    get_dist(x1, y1, x2, y2) {  //  求两点之间的距离   
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }
    move_to(tx, ty) {  //走到坐标为(tx, ty)的点
        this.move_length = this.get_dist(this.x, this.y, tx, ty);  // 两点之间的距离
        let angle = Math.atan2(ty - this.y, tx - this.x);  //  方向arctan
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    is_attacked(angle, damage) {
        for(let i = 0; i < 12 + Math.random() * 5; i ++) {
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.1;  //Math.random(): 0 ~ 1之间的一个数  
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 3;
            let move_length = this.radius * Math.random() * 5;
            new Particle(this.playground, x , y, radius, vx, vy, color, speed, move_length);
        }
        this.radius -= damage;
        if(this.radius < 10) {
            this.destroy();  //  像素小于10就去世了
            return false;
        }
         this.damage_x = Math.cos(angle);
         this.damage_y = Math.sin(angle);
         this.damage_speed = damage * 50;
         this.speed *= 1.3;
    }

    // annex(player) { //  吞并  未成功实现原因未知
    //     let distance = this.get_dist(this.x, this.y, player.x, player.y);
    //     let max_radius = Math.max(this.radius, player.radius)
    //     if(distance === max_radius && this.radius !== player.radius)  // 半径不相等且刚好处于边界状态就可以吞并
    //         return true;
    //     return false;
    // }

    // merge(player) {  //  未成功实现原因未知
    //     if(this.radius > player.radius)
    //     {
    //         this.radius = (Math.sqrt(this.radius * this.radius + player.radius * player.radius))
    //         player.destroy();
    //     }
    //     else {
    //         player.radius = (Math.sqrt(this.radius * this.radius + player.radius * player.radius))
    //         this.destroy();
    //     }
    // }
    update() {

        this.spent_time += this.timedelta / 1000;
        if (!this.is_me && this.spent_time > 3 && Math.random() < 1 / 300) {
            let player = this.playground.players[0];  //  Math.floor(Math.random() * this.playground.players.length)
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.1;
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.1;
            this.shoot_fireball(tx, ty);
        }
        if(this.damage_speed > this.eps) {  //  如果正在被攻击，玩家不能自己控制
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        } 
        else {
            if(this.move_length < this.eps) { // 当还需移动的距离小于期望值时，直接让它静止
                this.move_length = 0;
                this.vx = this.vy = 0;
                if(!this.is_me) {  //  如果AI小球静止了，让它继续动起来
                    let tx = Math.random() * this.playground.width;  //  random函数返回0-1之间的随机值
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx, ty);
                }
            } 
            else {
                let moved = Math.min(this.speed * this.timedelta / 1000, this.move_length);  //  真实移动的距离
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }            
        }
        this.render();  //  在一帧的时间内一直画, 否则会消失
    }
    render() {
        //画圆
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);  // (x, y)半径radius,从0画到2PI，顺时针
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

 }