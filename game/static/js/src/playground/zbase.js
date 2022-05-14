class AcGamePlayground{
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);

        // this.hide();
        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.13, true));

        for(let i = 0; i < 15; i ++) {

            this.players.push(new Player(this, this.width * Math.random(), this.height * Math.random(), this.height * 0.04, this.get_random_color(), this.height * 0.13, false));
        }
        this.start();
    }

    get_random_color() {
        let colors = ["blue", "red", "pink", "grey", "purple", "green", "yellow", "brown", "silver", "navy", "colra", "gold"];
        return colors[Math.floor(Math.random() * 12)];
    }

    start(){
    }

    show(){  //打开playground界面
        this.$playground.show();
    }

    hide(){  //关闭playground界面
        this.$playground.hide();
    }
}