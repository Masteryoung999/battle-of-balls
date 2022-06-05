class Background extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;

        this.img = new Image();
        this.img.src = "https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.zcool.cn%2Fcommunity%2F01ecbb5b98a43ba80121a0f751aec3.jpg%403000w_1l_0o_100sh.jpg&refer=http%3A%2F%2Fimg.zcool.cn&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1656991871&t=aa6be21fde13ef28bc71e96406402086";
    }
    start() {

    }

    update() {
        this.render();
    }

    render() {
        this.ctx.drawImage(this.img, 0, 0, this.playground.width, this.playground.height);
    }
}