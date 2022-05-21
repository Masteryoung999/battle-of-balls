class Food extends AcGameObject {
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
}