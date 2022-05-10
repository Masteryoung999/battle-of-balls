class AcGameMenu{
    constructor(root){
        this.root = root;
        this.$menu = $(`
<div class="ac-game-menu">
    <div class="ac-game-menu-field">
        <div class="ac-game-menu-field-item ac-game-field-item-single">
            单人模式
        </div>
        <div class="ac-game-menu-field-item ac-game-field-item-multi">
            多人模式
        </div>
        <div class="ac-game-menu-field-item ac-game-field-item-settings">
            设置
        </div>
    </div>
</div>
`);
        this.root.$ac_game.append(this.$menu);
        this.$single = this.$menu.find('.ac-game-field-item-single');
        this.$multi = this.$menu.find('.ac-game-field-item-multi');
        this.$settings = this.$menu.find('.ac-game-field-item-settings');
    }
}
