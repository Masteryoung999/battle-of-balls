let particles = [];  //  受到攻击后的粒子
class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, is_me) {
        super();  //  调用基类的构造函数, 注册到全局数组这样update函数才能每秒被刷新60次
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;  // 球的圆心横坐标
        this.y = y;  //  球的圆心纵坐标
        this.vx = 0;  //  沿着x轴的速度微分
        this.vy = 0;  //  沿着y轴的速度微分
        this.damage_x = 0;  //  受到伤害后沿着x轴的速度微分
        this.damage_y = 0;  //  受到伤害后沿着y轴的速度微分
        this.damage_speed = 0;  //  被击中后退的速度
        this.friction = 0.9;  //  被击中后的摩擦力使后退的速度越来越慢
        this.move_length = 0;  //  将要移动的距离, 只要它 >= eps这个物体就会一直动
        this.radius = radius;  //  球的半径
        this.color = color;  //  球的颜色
        this.speed = speed;  //  每秒钟的移动速度(画布高度的百分比来表示以兼容各种分辨率)
        this.is_me = is_me;  //  判断是不是自己
        this.eps = 0.1;  //  浮点运算的误差
        this.spent_time = 0;
        this.cur_skill = null;

        if (this.is_me) {
            this.img = new Image();
            this.img.src = this.playground.root.settings.photo;
        }
    }

    start() {
        if (this.is_me) {
            this.add_listening_events();
        } else {  //  如果是敌人, 一开始随机动起来
            let tx = Math.random() * this.playground.width;  //  random函数返回0-1之间的随机值
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
            this.cur_skill = "fireball";
        }
    }
    add_listening_events() { //监听函数
        //  为什么监听函数在start里被调用却可以一直监听
        //  我觉得可能是读取鼠标和键盘的参数的函数可能会一直运行不会消失
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function () {
            return false;  //禁掉鼠标右键触发菜单
        });
        this.playground.game_map.$canvas.mousedown(function (e) {  //  读取鼠标的参数
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (e.which === 3) { // 鼠标右键
                outer.move_to(e.clientX - rect.left, e.clientY - rect.top);   //  e.clientX: 当前鼠标的横坐标
            }
            else if (e.which === 1) {  //  鼠标左键
                if (outer.cur_skill === "fireball" && outer.radius >= 20) {
                    outer.shoot_fireball(e.clientX - rect.left, e.clientY - rect.top);  //  为了一致性
                    outer.radius = Math.sqrt(outer.radius * outer.radius - outer.playground.height * outer.playground.height / 10000);
                }
                outer.cur_skill = null;  //  按一次释放一次, 不能一直释放
                //  else if(outer.cur_skill === "其他技能") ...
            }
        });

        $(window).keydown(function (e) {
            if (e.which === 81 && outer.radius > 10) { // q键
                outer.cur_skill = "fireball";  //  当前技能是发火球(后面可能还有其他技能)
                return false;  //  后续不处理了
            }
        });
    }

    shoot_fireball(tx, ty) {  //  火球的一些属性
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let x = this.x;
        let y = this.y;
        let speed = this.playground.height * 0.5;
        let move_length = this.playground.height * 2;
        new Fireball(this.playground, this, x, y, radius, vx, vy, "orange", speed, move_length, this.playground.height * 0.005);
    }

    get_dist(x1, y1, x2, y2) {  //  求两点之间的距离
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }
    move_to(tx, ty) {  //  走到坐标为(tx, ty)的点
        this.move_length = this.get_dist(this.x, this.y, tx, ty);  // 两点之间的距离
        let angle = Math.atan2(ty - this.y, tx - this.x);  //  方向arctan(deltaY, deltaX)
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    is_attacked(angle, damage) {
        for (let i = 0; i < 12 + Math.random() * 5; i++) {
            let radius = this.radius * Math.random() * 0.1;  //  Math.random(): 0 ~ 1之间的一个数
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let x = this.x + this.radius * vx;
            let y = this.y + this.radius * vy;
            let color = this.color;
            let speed = this.speed * 3;
            let move_length = this.radius * Math.random() * 5;
            particles.push(new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length));
        }
        this.radius -= damage;  //  半径减去一个伤害值
        if (this.radius < 10) {
            this.destroy();  //  像素小于10就去世了
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 80;
    }

    annex(player) { //  能不能吞并
        let distance = this.get_dist(this.x, this.y, player.x, player.y);
        let max_radius = Math.max(this.radius, player.radius)
        if (distance <= max_radius && this.radius !== player.radius)  // 半径不相等且刚好处于边界状态就可以吞并
            return true;
        return false;
    }

    eat_player(player) {  //  合并
        if (this.radius > player.radius) {
            this.radius = Math.sqrt(this.radius * this.radius + player.radius * player.radius);
            player.destroy();
            return false;
        }
        else {
            player.radius = Math.sqrt(this.radius * this.radius + player.radius * player.radius);
            this.destroy();
            return false;
        }
    }

    //  吃被击中后散落的粒子
    eat_particle(particle) {
        this.radius = Math.sqrt(this.radius * this.radius + particle.radius * particle.radius * 3);
        particle.destroy();
        return false;
    }

    update() {
        if (this.playground.height * 0.12 - this.radius > 0.2)
            this.speed = this.playground.height * 0.12 - this.radius;
        else
            this.speed = this.playground.height * 0.02;
        this.spent_time += this.timedelta / 1000;
        if (!this.is_me && this.spent_time > 3 && Math.random() < 1 / 500 && this.radius >= 20 && this.cur_skill !== null) {  //  让AI发火球
            let player = this.playground.players[0];  //  让AI攻击最大的球
            for (let i = 0; i < this.playground.players.length; i++) {
                if (player.radius < this.playground.players[i].radius) {
                    player = this.playground.players[i]
                }
            }
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.1;
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.1;  //  预判走位
            this.shoot_fireball(tx, ty);
            this.radius = Math.sqrt(this.radius * this.radius - (this.playground.height * this.playground.height / 10000));

        }
        if (this.damage_speed > 10) {  //  如果正在被攻击，玩家不能自己控制
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        }
        else {  //  正常运动
            if (this.move_length < this.eps) { // 当还需移动的距离小于0.1时，直接让它静止
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (!this.is_me) {  //  如果AI小球静止了，让它继续动起来
                    let tx = Math.random() * this.playground.width;  //  random函数返回0-1之间的随机值
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx, ty);
                }
            }
            else {  //  移动
                let moved = Math.min(this.speed * this.timedelta / 1000, this.move_length);  //  真实移动的距离
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }

        //  判断两个player是否相撞
        for (let i = 0; i < this.playground.players.length; i ++) {
            let player = this.playground.players[i];
            if (this.player !== player && this.annex(player)) {
                this.eat_player(player);
            }
        }

        //  判断player能不能吃掉粒子
        for (let i = 0; i < particles.length; i++) {
            let particle = particles[i];
            if (this.annex(particle)) {
                this.eat_particle(particle);
            }
        }

        //  player吃food
        for (let i = 0; i < this.playground.foods.length; i++) {
            let food = this.playground.foods[i];
            let dx = food.x - this.x;
            let dy = food.y - this.y;
            if (dx * dx + dy * dy <= this.radius * this.radius) {
                this.radius = Math.sqrt(this.radius * this.radius + 1);  //  半径加一点点
                food.destroy();
                //this.playground.foods.push(new Food(this, this.playground.width * Math.random(), this.playground.height * Math.random(), true, `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`));
            }
        }

        this.render();  //  一直画一直画, 否则会消失
        this.radius -= this.radius * 0.015 / 60;
        if (this.radius < 20) this.radius += 5;  //  小于10就直接死了
        if (this.radius > this.playground.height / 8) {
            for (let i = 0; i < 30 + Math.random() * 10; i++) {
                let radius = this.radius * Math.random() * 0.1;  //  Math.random(): 0 ~ 1之间的一个数
                let angle = Math.PI * 2 * Math.random();
                let vx = Math.cos(angle), vy = Math.sin(angle);
                let x = this.x + this.radius * vx;
                let y = this.y + this.radius * vy;
                let color = this.color;
                let speed = this.speed * 10;
                let move_length = this.radius * Math.random() * 20;
                particles.push(new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length));
            }
            this.radius /= 1.5;
        }
    }

    render() {
        if (this.is_me) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
            this.ctx.restore();
        } else {
            //  画圆, 直接抄教程
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);  // (x, y)半径radius,从0画到2PI，顺时针
            this.ctx.fillStyle = this.color;  //  颜色
            this.ctx.fill();  //  填充颜色
        }
    }

    on_destroy() {
        this.cur_skill = null;
        this.radius = 0;
        this.speed = 0;
        for (let i = 0; i < this.playground.players.length; i ++) {
            let player = this.playground.players[i];
            if(player === this)
            this.playground.players.splice(i, 1);
        }
    }

}