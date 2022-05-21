class AcGamePlayground{
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
}