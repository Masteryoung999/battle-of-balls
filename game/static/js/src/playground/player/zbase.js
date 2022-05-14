class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, is_me) {
        super();
        this.playground  = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;  // 横坐标
        this.y = y;  //  纵坐标
        this.vx = 0;  //  沿着x轴的速度
        this.vy = 0;  //  沿着y轴的速度
        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.eps = 0.1;

        this.cur_skill = null;

    }

    start() {
        if(this.is_me) {
            this.add_listening_events();
        }
    }
    add_listening_events() { //监听函数
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function() {
            return false;  //禁掉鼠标右键触发菜单
        });
        this.playground.game_map.$canvas.mousedown(function(e) {
            if(e.which === 3) { // 右键
                outer.move_to(e.clientX, e.clientY);
            } else if (e.which === 1) {
                if(outer.cur_skill === "fireball") {
                    outer.shoot_fireball(e.clientX, e.clientY);
                }
                outer.cur_skill = null;
            }
        });

        $(window).keydown(function(e) {
            if(e.which === 81) { // q键
                outer.cur_skill = "fireball";
                return false;
            }
        });
    }

    shoot_fireball(tx, ty) {
        let x = this.x, y = this.y;
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playground.height * 0.5;
        let move_length = this.playground.height * 1;
        new Fireball(this.playground, this, x, y, radius, vx, vy,color, speed, move_length);
    }

    get_dist(x1, y1, x2, y2) {  //  求两点之间的距离
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }
    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);  // 距离
        let angle = Math.atan2(ty - this.y, tx - this.x);  //  方向arctan
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }
    update() {
        if(this.move_length < this.eps) {
            this.move_length = 0;
            this.vx = this.vy = 0;
        } else {
            let moved = Math.min(this.speed * this.timedelta / 1000, this.move_length);  //  真实移动的距离
            this.x += this.vx * moved;
            this.y += this.vy * moved;
            this.move_length -= moved;
        }
        this.render();
        
    }
    render() {
        //画圆
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);  // (x, y)半径radius,从0画到2PI，顺时针
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
 }