class GameMap extends AcGameObject {
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
}