class Readme {
    constructor(root) {
        this.root = root;
        this.$illustrate = $(`
<div class="ac-game-illustrate">
    <div class="ac-game-illustrate-field">
        <div class="ac-game-illustrate-field-item">
            返回
        </div>
        <br>
        <div class="ac-game-illustrate-title">
            游戏说明
        </div>
        <p>基本操作：点击鼠标右键进行移动, 左键释放技能, 按ENTER键可以在线聊天(仅限多人模式), 按ESC键退出聊天
        </p>
        <p>技能: 按下 q + 鼠标左键发射火球, 按下 f + 鼠标左键闪现
        </p>
        <div class="ac-game-illustrate-multimode-title">
            多人模式
        </div>
        <p>每局会有三人对战, 系统会根据每个人的战力进行匹配, 以优化游戏体验
        </p>
        <p>每个人初始会有1500的战力, 每输一局扣5分, 赢一局加10分
        </p>
    </div>
</div>
`);
        this.$illustrate.hide();
        this.root.$ac_game.append(this.$illustrate);
        this.$item = this.$illustrate.find('.ac-game-illustrate-field-item')

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$item.click(function () {
            outer.hide();
            outer.root.menu.show();
        });
    }

    show() {
        this.$illustrate.show();
    }

    hide() {
        this.$illustrate.hide();
    }
}