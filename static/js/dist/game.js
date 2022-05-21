class AcGameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class="ac-game-menu">
    <div class="ac-game-menu-field">
        <div class="ac-game-menu-field-item ac-game-menu-field-item-single-mode">
            单机模式
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-multi-mode">
            联机对战
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-settings">
            退出
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-readme">
            持续更新中...
        </div>
    </div>
</div>
`);
this.$menu.hide(); //  默认先关闭菜单界面,登录后才显示
        this.root.$ac_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.ac-game-menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings');

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function () {
            outer.hide();
            outer.root.playground.show();
        });
        this.$multi_mode.click(function () {
            console.log("click multi mode");
        });
        this.$settings.click(function () {
            console.log("click settings");
            outer.root.settings.logout_on_remote();
        });
    }

    show() {  // 显示menu界面
        this.$menu.show();
    }

    hide() {  // 关闭menu界面
        this.$menu.hide();
    }
}
let AC_GAME_OBJECTS = [];  //全局数组，每秒钟这个数组里的所有对象都会被调用60次

class AcGameObject {  //简易的游戏引擎, 所有会动的类以它为父类, 所有以这个类为基类的对象每一帧都会调用它的刷新函数
    constructor() { //构造函数
        AC_GAME_OBJECTS.push(this);  //  一旦创建这个类的对象(this)就会被加入到全局数组中

        this.has_called_start = false;  // 判断是否执行过start函数
        this.timedelta = 0;  //当前帧距离上一帧的时间间隔, 单位ms
    }

    start() { //对象刚出现的时候会初始化一些属性(颜色、大小、速度...), 但只会在第一帧执行一次
    }  //  虽然函数体是空的但未来继承它的类会重载这个函数

    update() { //有些操作(比如渲染render()...)需要每一帧都执行
    }  //  虽然函数体是空的但未来继承它的类会重载这个函数

    on_destroy() { //在被销毁前执行一次, 在被删除前可能需要给对手加点属性(舔包之类的)
    }

    destroy() { //删掉该物体, 将它从全局数组里面移除
        //  yxc: 在js中当一个对象没有被任何变量存下来的时候, 它就会被自动释放掉
        this.on_destroy();

        for(let i = 0; i < AC_GAME_OBJECTS.length; i ++) {
            if (AC_GAME_OBJECTS[i] === this) {
                AC_GAME_OBJECTS.splice(i, 1);  //  从i开始删一个
                break;
            }
        }
    }
}

let last_timestamp;

let AC_GAME_ANIMATION = function(timestamp) {  //  时间戳timestamp:系统自动给出不需要我们去赋值
    for(let i = 0; i < AC_GAME_OBJECTS.length; i ++){  //  遍历全局数组里的所有物体执行update函数
        let obj = AC_GAME_OBJECTS[i];  //  用obj存当前物体
        if(!obj.has_called_start) {  //  在第一帧执行start函数, 以后就不会再执行了
            obj.start();
            obj.has_called_start = true;  //  标记为true之后就不会再执行start函数了
        } else {  //  在以后的每一帧执行update函数
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;  //  last_timestamp不用初始化是因为第一帧会给它赋值(第一帧不会执行else中的语句)

    requestAnimationFrame(AC_GAME_ANIMATION);  //  递归调用
}

//  js提供的api, 这个函数在一秒钟内会被调用60次
//  最开始:第一次从这里执行调用AC_GAME_ANIMATION后的function函数, 我也不是很懂反正知道它1s能执行60次就行
//  至此简易版游戏引擎就实现了
requestAnimationFrame(AC_GAME_ANIMATION);class Food extends AcGameObject {
    constructor(playground, x, y, alive, color) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.alive = alive;
        this.color = color;
    }

    start() { }

    update() {
        if(this.alive)
            this.render();
    }

    on_destory() {
        this.alive = false;
        for(let i = 0; i < this.playground.foods.length; i ++) {
            let food = this.playground.foods[i];
            if(this === food) {
                particles.splice(i, 1);
                break;
            }
        }
    }

    render() {
        this.ctx.beginPath();
        var height = 10 * Math.sin(Math.PI / 3);  //  边长为10, 计算等边三角形的高
        this.ctx.moveTo(this.x, this.y); //  等边三角形的某个顶点(x, y), 从最上面的定点开始画
        this.ctx.lineTo(this.x - 5, this.y + height);  //  画到第二个顶点
        this.ctx.lineTo(this.x + 5, this.y + height);  //  再从第二个点画到第三个点
        this.ctx.closePath();  //  闭合路径
        this.ctx.lineWidth = 1;  //  线的边框为3像素
        this.ctx.strokeStyle = `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`;  //`rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`
        this.ctx.stroke();//绘制定义的图形
    }
}class GameMap extends AcGameObject {
    constructor(playground) { //  把playground对象传进来因为要用到它的宽和高的属性
        super();  //  调用基类的构造函数, 因此会加入到全局数组(仔细看基类AcGameObject的构造函数)
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);  //  js给我们提供的工具画布, canvas是个标签
        this.ctx = this.$canvas[0].getContext('2d');  //  用ctx存下来这个二维的画布
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;  //  画布的大小与playground一致, 构造函数的参数playground的作用就在这
        this.playground.$playground.append(this.$canvas);  //  把画布加入到playground里面, 为什么加？我也不知道
    }

    start() {

    }
    update() {
        this.render();  //  每一帧都要画一次, update重载隐藏了基类的update, 而基类的update会在requestAnimationFrame中被调用
        //  因此render()每秒会被画60次
    }
    render() {  //  渲染函数即把map画出来
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; //  0.2的透明度, 这个物体效果在移动的时候非常好看
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        //  画布的左上坐标和右下坐标作为参数
    }
}class Particle extends AcGameObject {  //  所有要动的物体都是AcGameObject的子类
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.friction = 0.9;
        this.eps = 1;
    }

    start() {

    }

    update() {
        this.radius -= 1/ 1000;
        if(this.radius < 1) {
            this.destroy();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.speed *= this.friction;
        this.move_length -= moved;
        this.render();
    }
    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    on_destroy() {
        this.radius = 0;
        for(let i = 0; i < particles.lenth; i ++)
        {
            if(this === particles[i]) {
                particles.splice(i, 1);
                break;
            }
        }
    }
}let particles = [];  //  受到攻击后的粒子
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

}class Fireball extends AcGameObject {
    constructor(playground, player, x , y, radius, vx, vy, color, speed, move_length, damage) {
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.damage = damage;  //  伤害值
        this.eps = 0.1; 
    }

    start() {

    }

    update() {
        if(this.move_length < this.eps) {
            this.destroy();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
        
        for(let i = 0; i < this.playground.players.length; i ++) {
            let player = this.playground.players[i];
            if(this.player !== player && this.is_collision(player)) {
                this.attack(player);
            }
        }
        this.render();
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_collision(player) {
        let distance = this.get_dist(this.x, this.y, player.x, player.y);
        if(distance < this.radius + player.radius)
            return true;
        return false;
    }

    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage);
        this.destroy();
    }
    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}class AcGamePlayground{
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);  // 生成html对象

        this.hide();

        this.start();
    }

    get_random_color() {
        let colors = ["blue", "red", "pink", "grey", "purple", "green", "yellow", "brown", "silver", "navy", "colra", "gold"];
        return colors[Math.floor(Math.random() * 12)];
    }


    start(){
    }

    show(){  //打开playground界面
        this.$playground.show();  //  先把
        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width();  //  html对象的宽度赋给playground
        this.height = this.$playground.height();  //  html对象的高度赋给playground
        this.game_map = new GameMap(this);
        this.players = [];  //  初始化players为一个数组
        this.foods = [];
        let color = `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`;
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.01, color, this.height * 0.12, true));  //  把自己创建出来

        for(let i = 0; i < 24; i ++) {

            this.players.push(new Player(this, this.width * Math.random(), this.height * Math.random(), this.height * 0.01, this.get_random_color(), this.height * 0.12, false));
        }

        for(let i = 0; i < 400; i ++) {
            this.foods.push(new Food(this, this.width * Math.random(), this.height * Math.random(), true, `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`));
        }
    }

    hide(){  //关闭playground界面
        this.$playground.hide();
    }
}class Settings {
    constructor(root) {
        this.root = root;
        this.platform = "WEB";  //  默认是WEB来的
        if (this.root.AcWingOS) this.platform = "ACAPP";
        this.username = ""
        this.photo = ""

        //  整个登录的界面
        this.$settings = $(` 
<div class="ac-game-settings">
    <div class="ac-game-settings-login">

        <div class="ac-game-settings-title">
            Welcome to Battle of Balls !
        </div>

        <div class="ac-game-settings-username">
            <div class="ac-game-settings-item">
                <input type="text" placeholder="your username">
            </div>
        </div>

        <div class="ac-game-settings-password">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="your password">
            </div>
        </div>

        <div class="ac-game-settings-submit">
            <div class ="ac-game-settings-item">
                <button>login</button>
            </div>
        </div>

        <div class="ac-game-settings-error-message">
        </div>

        <div class="ac-game-settings-option">
            register
        </div>
        <br>

        <div class="ac-game-settings-acwing">
            <img width="30" src="https://app2394.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
            <br>
            <div>
                Acwing One Click Login
            </div>
        </div>
    </div>
    
    <div class="ac-game-settings-register">
        <div class="ac-game-settings-title">
            Register
        </div>

        <div class="ac-game-settings-username">
            <div class="ac-game-settings-item">
                <input type="text" placeholder="your username">
            </div>
        </div>

        <div class="ac-game-settings-password ac-game-settings-password-first">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="your password">
            </div>
        </div>

        <div class="ac-game-settings-password ac-game-settings-password-second">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="confirm your password">
            </div>
        </div>

        <div class="ac-game-settings-submit">
            <div class ="ac-game-settings-item">
                <button>register</button>
            </div>
        </div>

        <div class="ac-game-settings-error-message">
        </div>

        <div class="ac-game-settings-option">
            login
        </div>  
        <br>

        <div class="ac-game-settings-acwing">
            <img width="30" src="https://app2394.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
            <br>
            <div>
                Acwing One Click Login
            </div>
        </div>
    </div>

</div>
`);
        //  .find()就是把上面创造的部件对象取出来好加上逻辑
        this.$login = this.$settings.find(".ac-game-settings-login");  //  登录框
        this.$login_username = this.$login.find(".ac-game-settings-username input");
        this.$login_password = this.$login.find(".ac-game-settings-password input"); //  不是同一级要用空格隔开
        this.$login_submit = this.$login.find(".ac-game-settings-submit button");
        this.$login_error_message = this.$login.find(".ac-game-settings-error-message");
        this.$login_register = this.$login.find(".ac-game-settings-option");

        this.$login.hide();

        this.$register = this.$settings.find(".ac-game-settings-register");  //  注册框
        this.$register_username = this.$register.find(".ac-game-settings-username input");
        this.$register_password = this.$register.find(".ac-game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".ac-game-settings-password-second input");
        this.$register_submit = this.$register.find(".ac-game-settings-submit button");
        this.$register_error_message = this.$register.find(".ac-game-settings-error-message");
        this.$register_login = this.$register.find(".ac-game-settings-option");

        this.$register.hide();

        this.root.$ac_game.append(this.$settings);  //  将登录界面加到窗口里去

        this.start();
    }

    start() {
        this.getinfo();
        this.add_listening_events();
    }

    add_listening_events() {
        this.add_listening_events_login();
        this.add_listening_events_register();
    }

    add_listening_events_login() {
        let outer = this;

        this.$login_register.click(function() {
            outer.register();
        });
        this.$login_submit.click(function() {
            outer.login_on_remote();  //  点了登录按钮就会调用远程登录函数
        });
    }

    add_listening_events_register() {
        let outer = this;

        this.$register_login.click(function() {
            outer.login();
        });
        this.$register_submit.click(function() {
            outer.register_on_remote();  //  点了注册按钮就会调用远程注册函数
        });
    }


    login_on_remote() {  //  在远程服务器登录
        let outer = this;
        let username = this.$login_username.val();  //  取出来input的值
        let password = this.$login_password.val();
        this.$login_error_message.empty();  //  把上次的error_masssage清空

        $.ajax({  //  登录函数
            url: "https://app2394.acapp.acwing.com.cn/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function(resp) {
                console.log(resp);
                if(resp.result === "success") {
                    location.reload();  //  刷新, 一旦登录成功就会在cookie里记录信息,下次直接进入菜单页面不用再输密码
                } else {
                    outer.$login_error_message.html(resp.result);  // 如果失败就要把信息显示出来
                }
            }
        });
    }

    register_on_remote() {  //  在远程的服务器上注册
        let outer = this;
        let username = this.$register_username.val();  //  val()取出input的值
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_message.empty();

        $.ajax({
            url: "https://app2394.acapp.acwing.com.cn/settings/register/",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm, //  传给后端验证
            },
            success: function(resp) {
                console.log(resp);
                if(resp.result === "success") {
                    location.reload();  //  刷新页面
                }
                else {
                    outer.$register_error_message.html(resp.result);
                }
            }

        });
    }

    logout_on_remote() {  //  在远程服务器上登出
        if (this.platform === "ACAPP") return false;

        $.ajax({
            url: "https://app2394.acapp.acwing.com.cn/settings/logout/",
            type: "GET",
            success: function(resp) {
                console.log(resp);
                if(resp.result === "success") {
                    location.reload();
                }
            }
        });
    }

    register() {  //  打开注册界面
        this.$login.hide();
        this.$register.show();
    }

    login() {  //  打开登录界面
        this.$register.hide();
        this.$login.show();
    }

    getinfo() {
        let outer = this;
        $.ajax({
            url: "https://app2394.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                } else { //  如果不成功

                    outer.login();
                }
            }
        });
    }

    hide() {
        this.$settings.hide();  //  隐藏登录界面
    }

    show() {
        this.$settings.show();  //  展示登录界面
    }
}export class AcGame{
    constructor(id, AcWingOS){
        this.id = id;
        this.$ac_game = $('#' + id);
        this.AcWingOS = AcWingOS;  //  区分是在acapp还是web里执行的

        this.settings = new Settings(this);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);

        this.start();
    }
    start() {}
    }
